import type { Command } from "commander";
import { handleListsDuplicateCommand } from "../lists/duplicate";
import { handleListsListCommand } from "../lists/list";

export const registerListsCommands = (program: Command): void => {
	const lists = program.command("lists").description("Manage Godspeed lists");

	lists.action(() => {
		lists.help();
	});

	lists
		.command("list")
		.description("List all lists")
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleListsListCommand(options);
		});

	lists
		.command("duplicate <list-id>")
		.description("Duplicate a list")
		.option("--json", "Output as JSON")
		.action(async (listId, options) => {
			await handleListsDuplicateCommand(listId, options);
		});
};
