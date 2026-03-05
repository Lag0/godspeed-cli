import type { Command } from "commander";
import { handleDoctorCommand } from "../doctor";

export const registerDoctorCommand = (program: Command): void => {
	program
		.command("doctor")
		.description("Run environment diagnostics")
		.option("--json", "Output as JSON")
		.action(async (options) => {
			await handleDoctorCommand(options);
		});
};
