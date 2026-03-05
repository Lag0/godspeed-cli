import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@lag0/godspeed-sdk", () => ({
	createClient: vi.fn(() => ({ client: "mock" })),
	duplicateList: vi.fn(async () => ({ id: "list-copy", name: "Inbox copy" })),
}));

vi.mock("../../utils/token", () => ({
	resolveToken: vi.fn(() => "mock-token"),
}));

vi.mock("../../commands/runtime/command-context", () => ({
	createCommandContext: vi.fn((options) => ({
		options,
		jsonOutput: options.json === true,
	})),
	writeCommandOutput: vi.fn(),
}));

vi.mock("../../commands/runtime/with-command-handler", () => ({
	withCommandHandler: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}));

import { createClient, duplicateList } from "@lag0/godspeed-sdk";
import { handleListsDuplicateCommand } from "../../commands/lists/duplicate";
import {
	createCommandContext,
	writeCommandOutput,
} from "../../commands/runtime/command-context";
import { withCommandHandler } from "../../commands/runtime/with-command-handler";
import { resolveToken } from "../../utils/token";

describe("handleListsDuplicateCommand (LIST-02)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.GODSPEED_BASE_URL;
	});

	afterEach(() => {
		vi.clearAllMocks();
		delete process.env.GODSPEED_BASE_URL;
	});

	it("duplicates list by id", async () => {
		await handleListsDuplicateCommand("list-123", {});

		expect(withCommandHandler).toHaveBeenCalledTimes(1);
		expect(resolveToken).toHaveBeenCalledTimes(1);
		expect(createClient).toHaveBeenCalledWith({
			token: "mock-token",
			baseUrl: undefined,
		});
		expect(duplicateList).toHaveBeenCalledWith({ client: "mock" }, "list-123");
	});

	it("forwards GODSPEED_BASE_URL to createClient when set", async () => {
		process.env.GODSPEED_BASE_URL = "https://staging.example.com";

		await handleListsDuplicateCommand("list-123", {});

		expect(createClient).toHaveBeenCalledWith({
			token: "mock-token",
			baseUrl: "https://staging.example.com",
		});
	});

	it("writes readable success output", async () => {
		await handleListsDuplicateCommand("list-123", { json: false });

		expect(createCommandContext).toHaveBeenCalledWith({ json: false });
		expect(writeCommandOutput).toHaveBeenCalledTimes(1);
		const [, result, formatReadable] =
			vi.mocked(writeCommandOutput).mock.calls[0];
		expect(result).toEqual({ id: "list-copy", name: "Inbox copy" });
		expect(typeof formatReadable).toBe("function");
		expect(formatReadable?.({ id: "list-copy", name: "Inbox copy" })).toContain(
			"Inbox copy",
		);
		expect(formatReadable?.({ id: "list-copy", name: "Inbox copy" })).toContain(
			"list-copy",
		);
	});
});
