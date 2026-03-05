import {
	createClient,
	listTasks,
	type Task,
	type TasksResponse,
} from "@syxs/godspeed-sdk";
import pc from "picocolors";
import { resolveToken } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface TasksListOptions {
	all?: boolean;
	listId?: string;
	status?: "incomplete" | "complete";
	json?: boolean;
}

const formatTaskLine = (task: Task): string => {
	const statusIcon = task.is_complete ? pc.green("✓") : pc.dim("○");
	const dueSuffix = task.due_at ? ` ${pc.yellow(`[due: ${task.due_at}]`)}` : "";
	return `${statusIcon} ${pc.bold(task.title)}${dueSuffix}\n  ${pc.dim(task.id)}`;
};

const formatTasksReadable = (result: TasksResponse): string => {
	if (result.tasks.length === 0) {
		return pc.dim("No tasks found.");
	}

	return result.tasks.map(formatTaskLine).join("\n");
};

export const handleTasksListCommand = async (
	options: TasksListOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	await withCommandHandler(async () => {
		const token = resolveToken();
		const baseUrl = process.env.GODSPEED_BASE_URL;
		const client = createClient({ token, baseUrl });

		const status = options.status ?? (options.all ? undefined : "incomplete");
		const query = {
			status,
			...(options.listId ? { list_id: options.listId } : {}),
		};

		const result = await listTasks(client, query);
		writeCommandOutput(context, result, formatTasksReadable);
	});
};
