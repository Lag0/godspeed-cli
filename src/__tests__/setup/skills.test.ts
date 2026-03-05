import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
	spawnSync: vi.fn(),
}));

import { handleSetupSkillsCommand } from "../../commands/setup/skills";

describe("handleSetupSkillsCommand", () => {
	let stdoutSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		stdoutSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("runs npx skills add with default repo", async () => {
		vi.mocked(spawnSync).mockReturnValue({ status: 0 } as ReturnType<
			typeof spawnSync
		>);

		await handleSetupSkillsCommand({});

		expect(spawnSync).toHaveBeenCalledWith(
			"npx",
			["skills", "add", "Lag0/godspeed-cli"],
			{ stdio: "inherit" },
		);
		expect(stdoutSpy).toHaveBeenCalled();
	});

	it("uses custom repo when provided", async () => {
		vi.mocked(spawnSync).mockReturnValue({ status: 0 } as ReturnType<
			typeof spawnSync
		>);

		await handleSetupSkillsCommand({ repo: "syxs/godspeed-cli" });

		expect(spawnSync).toHaveBeenCalledWith(
			"npx",
			["skills", "add", "syxs/godspeed-cli"],
			{ stdio: "inherit" },
		);
	});

	it("throws runtime error when command exits with non-zero status", async () => {
		vi.mocked(spawnSync).mockReturnValue({ status: 1 } as ReturnType<
			typeof spawnSync
		>);

		await expect(handleSetupSkillsCommand({})).rejects.toMatchObject({
			code: "COMMAND_EXECUTION_FAILED",
		});
	});
});
