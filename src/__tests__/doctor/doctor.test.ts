import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILE } from "../../utils/config";

const fsMocks = vi.hoisted(() => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	accessSync: vi.fn(),
	constants: {
		W_OK: 2,
	},
}));

vi.mock("node:fs", () => fsMocks);

vi.mock("../../utils/token", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../utils/token")>();
	return {
		...actual,
		migrateLegacyTokenIfNeeded: vi.fn(),
		resolveToken: vi.fn(),
	};
});

import * as fs from "node:fs";
import { handleDoctorCommand } from "../../commands/doctor";
import * as tokenUtils from "../../utils/token";

const stripAnsi = (value: string): string =>
	value.replaceAll(/\u001B\[[\d;]*m/g, "");

const originalVersionsDescriptor = Object.getOwnPropertyDescriptor(
	process,
	"versions",
);

const setNodeVersion = (version: string): void => {
	Object.defineProperty(process, "versions", {
		value: {
			...process.versions,
			node: version,
		},
		enumerable: true,
		configurable: true,
		writable: false,
	});
};

describe("handleDoctorCommand (DIAG-01)", () => {
	const originalEnv = { ...process.env };
	let stdoutSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env = { ...originalEnv };
		delete process.env.GODSPEED_TOKEN;
		process.exitCode = undefined;
		stdoutSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);

		vi.mocked(fs.existsSync).mockReturnValue(false);
		vi.mocked(fs.readFileSync).mockReturnValue("{}");
		vi.mocked(fs.accessSync).mockImplementation(() => undefined);
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		process.exitCode = undefined;
		vi.restoreAllMocks();
		if (originalVersionsDescriptor) {
			Object.defineProperty(process, "versions", originalVersionsDescriptor);
		}
	});

	it("includes auth/config/runtime checks in readable and JSON outputs", async () => {
		process.env.GODSPEED_TOKEN = "env-token";

		await handleDoctorCommand({});
		const readableOutput = stripAnsi(
			String(stdoutSpy.mock.calls[0]?.[0] ?? ""),
		);
		expect(readableOutput).toContain("auth");
		expect(readableOutput).toContain("config");
		expect(readableOutput).toContain("runtime");
		expect(readableOutput).toContain("All checks passed.");

		stdoutSpy.mockClear();
		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
			healthy: boolean;
		};

		expect(report.healthy).toBe(true);
		expect(report.checks.map((check) => check.name)).toEqual([
			"auth",
			"config",
			"runtime",
		]);
		expect(report.checks.map((check) => check.status)).toEqual([
			"ok",
			"ok",
			"ok",
		]);
	});

	it("sets auth check to ok when token exists in config file", async () => {
		vi.mocked(fs.existsSync).mockImplementation(
			(path) => String(path) === CONFIG_FILE,
		);
		vi.mocked(fs.readFileSync).mockReturnValue('{"token":"stored-token"}');

		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
		};
		expect(report.checks.find((check) => check.name === "auth")?.status).toBe(
			"ok",
		);
	});

	it("sets auth check to fail and process.exitCode=1 when no token is found", async () => {
		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
			healthy: boolean;
		};
		expect(report.checks.find((check) => check.name === "auth")?.status).toBe(
			"fail",
		);
		expect(report.healthy).toBe(false);
		expect(process.exitCode).toBe(1);
	});

	it("sets config check to ok when config directory is writable", async () => {
		process.env.GODSPEED_TOKEN = "env-token";
		vi.mocked(fs.accessSync).mockImplementation(() => undefined);

		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
		};
		expect(
			report.checks.find((check) => check.name === "config")?.status,
		).toBe("ok");
	});

	it("sets config check to warn when config directory is missing or unwritable", async () => {
		process.env.GODSPEED_TOKEN = "env-token";
		vi.mocked(fs.accessSync).mockImplementation(() => {
			throw new Error("not writable");
		});

		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
		};
		expect(
			report.checks.find((check) => check.name === "config")?.status,
		).toBe("warn");
	});

	it("sets runtime check to ok when Node major version is 18 or higher", async () => {
		process.env.GODSPEED_TOKEN = "env-token";
		setNodeVersion("18.0.0");

		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
		};
		expect(
			report.checks.find((check) => check.name === "runtime")?.status,
		).toBe("ok");
	});

	it("sets runtime check to fail for Node major version below 18", async () => {
		process.env.GODSPEED_TOKEN = "env-token";
		setNodeVersion("16.20.2");

		await handleDoctorCommand({ json: true });
		const report = JSON.parse(
			String(stdoutSpy.mock.calls[0]?.[0] ?? "").trim(),
		) as {
			checks: Array<{ name: string; status: "ok" | "warn" | "fail" }>;
			healthy: boolean;
		};
		expect(
			report.checks.find((check) => check.name === "runtime")?.status,
		).toBe("fail");
		expect(report.healthy).toBe(false);
		expect(process.exitCode).toBe(1);
	});

	it("runs legacy token migration and does not call resolveToken", async () => {
		process.env.GODSPEED_TOKEN = "env-token";

		await handleDoctorCommand({ json: true });

		expect(tokenUtils.migrateLegacyTokenIfNeeded).toHaveBeenCalledTimes(1);
		expect(tokenUtils.resolveToken).not.toHaveBeenCalled();
	});
});
