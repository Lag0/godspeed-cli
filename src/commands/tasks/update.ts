import {
	createClient,
	type Task,
	type UpdateTaskRequest,
	updateTask,
} from "@lag0/godspeed-sdk";
import pc from "picocolors";
import { resolveToken } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { CommandRuntimeError } from "../runtime/command-error";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface TasksUpdateOptions {
	title?: string;
	notes?: string;
	dueAt?: string;
	complete?: boolean;
	incomplete?: boolean;
	addLabel?: string[];
	removeLabel?: string[];
	json?: boolean;
}

const formatTaskReadable = (task: Task): string => {
	const lines = [
		`${pc.green("✓")} ${pc.bold(task.title)} ${pc.dim(`(${task.id})`)}`,
		`Status: ${task.is_complete ? pc.green("complete") : pc.yellow("incomplete")}`,
	];

	if (task.notes) {
		lines.push(`Notes: ${task.notes}`);
	}

	if (task.due_at) {
		lines.push(`Due: ${pc.yellow(task.due_at)}`);
	}

	if (task.labels && task.labels.length > 0) {
		lines.push(`Labels: ${task.labels.map((label) => label.name).join(", ")}`);
	}

	return lines.join("\n");
};

const hasUpdateFields = (options: TasksUpdateOptions): boolean =>
	options.title !== undefined ||
	options.notes !== undefined ||
	options.dueAt !== undefined ||
	options.complete === true ||
	options.incomplete === true ||
	(options.addLabel !== undefined && options.addLabel.length > 0) ||
	(options.removeLabel !== undefined && options.removeLabel.length > 0);

const buildUpdateRequest = (options: TasksUpdateOptions): UpdateTaskRequest => {
	const request: UpdateTaskRequest = {};

	if (options.title !== undefined) request.title = options.title;
	if (options.notes !== undefined) request.notes = options.notes;
	if (options.dueAt !== undefined) request.due_at = options.dueAt;
	if (options.complete) request.is_complete = true;
	if (options.incomplete) request.is_complete = false;
	if (options.addLabel && options.addLabel.length > 0)
		request.add_label_names = options.addLabel;
	if (options.removeLabel && options.removeLabel.length > 0)
		request.remove_label_names = options.removeLabel;

	return request;
};

export const handleTasksUpdateCommand = async (
	taskId: string,
	options: TasksUpdateOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	await withCommandHandler(async () => {
		if (options.complete && options.incomplete) {
			throw new CommandRuntimeError({
				code: "INVALID_INPUT",
				message: "Cannot use --complete and --incomplete together.",
				suggestion: "Use either --complete or --incomplete.",
				exitCode: 1,
			});
		}

		if (!hasUpdateFields(options)) {
			throw new CommandRuntimeError({
				code: "INVALID_INPUT",
				message: "No update options provided.",
				suggestion:
					"Pass at least one option. Run `godspeed tasks update --help`",
				exitCode: 1,
			});
		}

		const token = resolveToken();
		const baseUrl = process.env.GODSPEED_BASE_URL;
		const client = createClient({ token, baseUrl });
		const request = buildUpdateRequest(options);
		const result = await updateTask(client, taskId, request);

		writeCommandOutput(context, result, formatTaskReadable);
	});
};
