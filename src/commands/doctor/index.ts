import * as fs from "node:fs";
import pc from "picocolors";
import { CONFIG_DIR, CONFIG_FILE } from "../../utils/config";
import { migrateLegacyTokenIfNeeded } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";

export type DoctorCheckStatus = "ok" | "warn" | "fail";

export interface DoctorCheck {
	name: "auth" | "config" | "runtime";
	status: DoctorCheckStatus;
	message: string;
}

export interface DoctorReport {
	checks: [DoctorCheck, DoctorCheck, DoctorCheck];
	healthy: boolean;
}

export interface DoctorOptions {
	json?: boolean;
}

const checkAuth = (): DoctorCheck => {
	if (process.env.GODSPEED_TOKEN) {
		return {
			name: "auth",
			status: "ok",
			message: "Token found via GODSPEED_TOKEN environment variable.",
		};
	}

	try {
		if (fs.existsSync(CONFIG_FILE)) {
			const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
			const parsed = JSON.parse(raw) as { token?: string };

			if (typeof parsed.token === "string" && parsed.token.length > 0) {
				return {
					name: "auth",
					status: "ok",
					message: "Token found in config file.",
				};
			}
		}
	} catch {
		// Parsing or read errors should degrade to a failing auth check.
	}

	return {
		name: "auth",
		status: "fail",
		message: "No token found in environment or config file.",
	};
};

const checkConfig = (): DoctorCheck => {
	try {
		fs.accessSync(CONFIG_DIR, fs.constants.W_OK);
		return {
			name: "config",
			status: "ok",
			message: `Config directory is writable: ${CONFIG_DIR}`,
		};
	} catch {
		return {
			name: "config",
			status: "warn",
			message: `Config directory missing or not writable: ${CONFIG_DIR}`,
		};
	}
};

const checkRuntime = (): DoctorCheck => {
	const nodeVersion = process.versions.node;
	const major = Number(nodeVersion.split(".")[0] ?? "0");

	if (major >= 18) {
		return {
			name: "runtime",
			status: "ok",
			message: `Node ${nodeVersion} satisfies required major version >= 18.`,
		};
	}

	return {
		name: "runtime",
		status: "fail",
		message: `Node ${nodeVersion} is below required major version 18.`,
	};
};

const statusSymbol: Record<DoctorCheckStatus, string> = {
	ok: pc.green("✓"),
	warn: pc.yellow("!"),
	fail: pc.red("x"),
};

const formatDoctorReadable = (report: DoctorReport): string => {
	const lines = report.checks.map(
		(check) => `${statusSymbol[check.status]} ${check.name} ${check.message}`,
	);
	const summary = report.healthy
		? pc.green("All checks passed.")
		: pc.red("Some checks failed.");
	return [...lines, summary].join("\n");
};

export const handleDoctorCommand = async (
	options: DoctorOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	migrateLegacyTokenIfNeeded();

	const checks = [checkAuth(), checkConfig(), checkRuntime()] as const;
	const report: DoctorReport = {
		checks: [checks[0], checks[1], checks[2]],
		healthy: checks.every((check) => check.status !== "fail"),
	};

	writeCommandOutput(context, report, formatDoctorReadable);

	if (!report.healthy) {
		process.exitCode = 1;
	}
};
