import { createClient, deleteTask } from "@syxs/godspeed-sdk";
import pc from "picocolors";
import { resolveToken } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface TasksDeleteOptions {
	json?: boolean;
}

interface DeleteTaskResult {
	success: boolean;
	id: string;
}

export const handleTasksDeleteCommand = async (
	taskId: string,
	options: TasksDeleteOptions,
): Promise<DeleteTaskResult> => {
	const context = createCommandContext(options);

	return withCommandHandler(async () => {
		const token = resolveToken();
		const baseUrl = process.env.GODSPEED_BASE_URL;
		const client = createClient({ token, baseUrl });

		await deleteTask(client, taskId);

		const result: DeleteTaskResult = { success: true, id: taskId };
		writeCommandOutput(
			context,
			result,
			() => `${pc.green("✓")} Task ${taskId} deleted.`,
		);
		return result;
	});
};
