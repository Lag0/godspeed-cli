import { createClient, getTask, type Task } from "@lag0/godspeed-sdk";
import pc from "picocolors";
import { resolveToken } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface TasksGetOptions {
	json?: boolean;
}

const formatTaskReadable = (task: Task): string => {
	const lines = [
		`${pc.bold(task.title)} ${pc.dim(`(${task.id})`)}`,
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

export const handleTasksGetCommand = async (
	taskId: string,
	options: TasksGetOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	await withCommandHandler(async () => {
		const token = resolveToken();
		const baseUrl = process.env.GODSPEED_BASE_URL;
		const client = createClient({ token, baseUrl });

		const result = await getTask(client, taskId);
		writeCommandOutput(context, result, formatTaskReadable);
	});
};
