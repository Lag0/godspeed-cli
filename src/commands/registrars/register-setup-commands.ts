import type { Command } from "commander";
import { handleSetupSkillsCommand } from "../setup/skills";

export const registerSetupCommands = (program: Command): void => {
	const setup = program.command("setup").description("Setup helpers for agents");

	setup.action(() => {
		setup.help();
	});

	setup
		.command("skills")
		.alias("skill")
		.description("Install Godspeed skills into supported coding agents")
		.option(
			"--repo <owner/repo>",
			"Skill source repository",
			"Lag0/godspeed-cli",
		)
		.action(async (options) => {
			await handleSetupSkillsCommand(options);
		});
};
