import * as fs from "node:fs";
import { CommandRuntimeError } from "../commands/runtime/command-error";
import { CONFIG_DIR, CONFIG_FILE, LEGACY_CONFIG_FILE } from "./config";

interface StoredConfig {
	token?: string;
}

/** Reads token from config file, returns undefined if file missing or token absent */
export const loadStoredToken = (): string | undefined => {
	try {
		const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
		const parsed = JSON.parse(raw) as StoredConfig;
		return typeof parsed.token === "string" ? parsed.token : undefined;
	} catch {
		return undefined;
	}
};

/**
 * Writes token to config file.
 * Creates config directory with mode 0o700 if it does not exist.
 * Sets file permissions to 0o600 after writing.
 */
export const saveToken = (token: string): void => {
	fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
	fs.writeFileSync(CONFIG_FILE, JSON.stringify({ token }), "utf-8");
	try {
		fs.chmodSync(CONFIG_FILE, 0o600);
	} catch {
		// chmod may fail on some platforms (e.g. Windows) — non-fatal
	}
};

/** Removes the config file if it exists */
export const deleteStoredToken = (): void => {
	if (fs.existsSync(CONFIG_FILE)) {
		fs.unlinkSync(CONFIG_FILE);
	}
};

/** Migrates token from legacy config path when modern config does not exist yet. */
export const migrateLegacyTokenIfNeeded = (): void => {
	if (fs.existsSync(CONFIG_FILE)) return;
	if (!fs.existsSync(LEGACY_CONFIG_FILE)) return;

	try {
		const raw = fs.readFileSync(LEGACY_CONFIG_FILE, "utf-8");
		const parsed = JSON.parse(raw) as StoredConfig;
		if (typeof parsed.token === "string") {
			saveToken(parsed.token);
			fs.unlinkSync(LEGACY_CONFIG_FILE);
		}
	} catch {
		// Swallow migration errors to avoid blocking command execution
	}
};

/**
 * Resolves token via priority chain: GODSPEED_TOKEN env var → config file → throw.
 * @throws CommandRuntimeError with code AUTH_REQUIRED if no token found
 */
export const resolveToken = (): string => {
	migrateLegacyTokenIfNeeded();

	const envToken = process.env.GODSPEED_TOKEN;
	if (envToken) return envToken;

	const storedToken = loadStoredToken();
	if (storedToken) return storedToken;

	throw new CommandRuntimeError({
		code: "AUTH_REQUIRED",
		message: "No authentication token found.",
		suggestion: "Run `godspeed login --token <token>` or set GODSPEED_TOKEN.",
		exitCode: 1,
	});
};
