import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { writeOutput } from "../../utils/output";
import { CommandRuntimeError } from "../runtime/command-error";
import { withCommandHandler } from "../runtime/with-command-handler";

const DEFAULT_SKILL_REPO = "Lag0/godspeed-cli";

export interface SetupSkillsOptions {
	repo?: string;
}

export const handleSetupSkillsCommand = async (
	options: SetupSkillsOptions,
): Promise<void> => {
	await withCommandHandler(async () => {
		const repo = options.repo?.trim() || DEFAULT_SKILL_REPO;

		const result = spawnSync("npx", ["skills", "add", repo], {
			stdio: "inherit",
		});

		if (result.error) {
			throw new CommandRuntimeError({
				code: "COMMAND_EXECUTION_FAILED",
				message: `Failed to run \"npx skills add ${repo}\".`,
				suggestion:
					"Ensure npx is available and try `npx skills add <owner/repo>` manually.",
				cause: result.error,
				exitCode: 1,
			});
		}

		if (result.status !== 0) {
			throw new CommandRuntimeError({
				code: "COMMAND_EXECUTION_FAILED",
				message: `Skill installation exited with code ${result.status}.`,
				suggestion:
					"Re-run `npx skills add <owner/repo>` manually to inspect the error.",
				exitCode: result.status ?? 1,
			});
		}

		writeOutput(
			`${pc.green("✓")} Skill installed from ${repo}. Run \`godspeed status --json\` to verify auth state.`,
		);
	});
};
