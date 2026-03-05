import type { Command } from "commander";
import { handleLoginCommand } from "../auth/login";
import { handleLogoutCommand } from "../auth/logout";
import { handleStatusCommand } from "../auth/status";

export const registerAuthCommands = (program: Command): void => {
	program
		.command("login")
		.description("Save a Godspeed API token")
		.option("--token <token>", "API token (non-interactive)")
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleLoginCommand(options);
		});

	program
		.command("logout")
		.description("Remove saved API token")
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleLogoutCommand(options);
		});

	program
		.command("status")
		.description("Show current authentication state")
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleStatusCommand(options);
		});
};
