import {
	createClient,
	listLists,
	type List,
	type ListsResponse,
} from "@lag0/godspeed-sdk";
import pc from "picocolors";
import { resolveToken } from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface ListsListOptions {
	json?: boolean;
}

const formatListLine = (list: List): string =>
	`${pc.bold(list.name)} ${pc.dim(`(${list.id})`)}`;

const formatListsReadable = (result: ListsResponse): string => {
	if (result.lists.length === 0) {
		return pc.dim("No lists found.");
	}

	return result.lists.map(formatListLine).join("\n");
};

export const handleListsListCommand = async (
	options: ListsListOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	await withCommandHandler(async () => {
		const token = resolveToken();
		const baseUrl = process.env.GODSPEED_BASE_URL;
		const client = createClient({ token, baseUrl });

		const result = await listLists(client);
		writeCommandOutput(context, result, formatListsReadable);
	});
};
