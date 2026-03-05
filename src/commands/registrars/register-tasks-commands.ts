import type { Command } from "commander";
import { handleTasksCreateCommand } from "../tasks/create";
import { handleTasksDeleteCommand } from "../tasks/delete";
import { handleTasksGetCommand } from "../tasks/get";
import { handleTasksListCommand } from "../tasks/list";
import { handleTasksUpdateCommand } from "../tasks/update";

const collectRepeatable = (value: string, previous: string[]): string[] => [
	...previous,
	value,
];

export const registerTasksCommands = (program: Command): void => {
	const tasks = program.command("tasks").description("Manage Godspeed tasks");

	tasks.action(() => {
		tasks.help();
	});

	tasks
		.command("list")
		.description("List tasks (incomplete by default)")
		.option("--all", "Include completed tasks")
		.option("--list-id <id>", "Filter by list ID")
		.option("--status <status>", "Filter by status: incomplete | complete")
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleTasksListCommand(options);
		});

	tasks
		.command("get <task-id>")
		.description("Get task details")
		.option("--json", "Output as JSON")
		.action(async (taskId, options) => {
			await handleTasksGetCommand(taskId, options);
		});

	tasks
		.command("create")
		.description("Create a new task")
		.requiredOption("--title <title>", "Task title")
		.option("--list-id <id>", "List ID to add task to")
		.option("--notes <notes>", "Task notes")
		.option("--due-at <datetime>", "Due date/time (ISO 8601)")
		.option("--label <name>", "Label name (repeatable)", collectRepeatable, [])
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleTasksCreateCommand(options);
		});

	tasks
		.command("update <task-id>")
		.description("Update an existing task")
		.option("--title <title>", "New title")
		.option("--notes <notes>", "New notes")
		.option("--due-at <datetime>", "New due date (ISO 8601)")
		.option("--complete", "Mark as complete")
		.option("--incomplete", "Mark as incomplete")
		.option(
			"--add-label <name>",
			"Add label by name (repeatable)",
			collectRepeatable,
			[],
		)
		.option(
			"--remove-label <name>",
			"Remove label by name (repeatable)",
			collectRepeatable,
			[],
		)
		.option("--json", "Output as JSON")
		.action(async (taskId, options) => {
			await handleTasksUpdateCommand(taskId, options);
		});

	tasks
		.command("delete <task-id>")
		.description("Delete a task")
		.option("--json", "Output as JSON")
		.action(async (taskId, options) => {
			await handleTasksDeleteCommand(taskId, options);
		});
};
