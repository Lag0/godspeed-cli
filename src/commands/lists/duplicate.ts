import { createClient, duplicateList, type List } from "@syxs/godspeed-sdk";
import pc from "picocolors";
import { resolveToken } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface ListsDuplicateOptions {
	json?: boolean;
}

const formatDuplicatedListReadable = (list: List): string =>
	`${pc.green("✓")} Duplicated ${pc.bold(list.name)} ${pc.dim(`(${list.id})`)}`;

export const handleListsDuplicateCommand = async (
	listId: string,
	options: ListsDuplicateOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	await withCommandHandler(async () => {
		const token = resolveToken();
		const baseUrl = process.env.GODSPEED_BASE_URL;
		const client = createClient({ token, baseUrl });

		const result = await duplicateList(client, listId);
		writeCommandOutput(context, result, formatDuplicatedListReadable);
	});
};
