import * as fs from "node:fs";
import { LEGACY_CONFIG_FILE } from "../../utils/config";
import {
	deleteStoredToken,
	migrateLegacyTokenIfNeeded,
} from "../../utils/token";
import {
	createCommandContext,
	writeCommandOutput,
} from "../runtime/command-context";
import { withCommandHandler } from "../runtime/with-command-handler";

export interface LogoutOptions {
	json?: boolean;
}

interface LogoutResult {
	success: boolean;
	message: string;
}

export const handleLogoutCommand = async (
	options: LogoutOptions,
): Promise<void> => {
	const context = createCommandContext(options);

	await withCommandHandler(async () => {
		migrateLegacyTokenIfNeeded();
		deleteStoredToken();

		try {
			if (fs.existsSync(LEGACY_CONFIG_FILE)) {
				fs.unlinkSync(LEGACY_CONFIG_FILE);
			}
		} catch {
			// Best-effort cleanup for legacy credentials path
		}

		const result: LogoutResult = {
			success: true,
			message: "Logged out.",
		};
		writeCommandOutput(context, result, () => "Logged out.");
	});
};
