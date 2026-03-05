import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { writeOutput } from "../../utils/output";
import { CommandRuntimeError } from "../runtime/command-error";
import { withCommandHandler } from "../runtime/with-command-handler";

const DEFAULT_SKILL_REPO = "Lag0/godspeed-cli";

export interface SetupSkillsOptions {
	repo?: string;
	nonInteractive?: boolean;
}

export const handleSetupSkillsCommand = async (
	options: SetupSkillsOptions,
): Promise<void> => {
	await withCommandHandler(async () => {
		const repo = options.repo?.trim() || DEFAULT_SKILL_REPO;
		const commandArgs = ["-y", "skills", "add", repo];

		if (options.nonInteractive) {
			commandArgs.push("--all");
		}

		const result = spawnSync("npx", commandArgs, {
			stdio: "inherit",
		});

		if (result.error) {
			throw new CommandRuntimeError({
				code: "COMMAND_EXECUTION_FAILED",
				message: `Failed to run \"npx ${commandArgs.join(" ")}\".`,
				suggestion:
					"Ensure npx is available and try `npx -y skills add <owner/repo>` manually.",
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

		const modeLabel = options.nonInteractive
			? "non-interactive mode"
			: "interactive mode";
		writeOutput(
			`${pc.green("✓")} Skill installed from ${repo} (${modeLabel}). Run \`godspeed status --json\` to verify auth state.`,
		);
	});
};
