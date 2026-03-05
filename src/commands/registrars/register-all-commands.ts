import type { Command } from "commander";
import { registerAuthCommands } from "./register-auth-commands";
import { registerDoctorCommand } from "./register-doctor-command";
import { registerListsCommands } from "./register-lists-commands";
import { registerTasksCommands } from "./register-tasks-commands";

/** Registers all CLI commands on the given program instance. */
export const registerAllCommands = (program: Command): void => {
	registerAuthCommands(program);
	registerTasksCommands(program);
	registerListsCommands(program);
	registerDoctorCommand(program);
};
