#!/usr/bin/env node

import { Command, CommanderError } from 'commander';
import packageJson from '../package.json';
import { registerAllCommands } from './commands/registrars/register-all-commands';
import { toCommandRuntimeError } from './commands/runtime/command-error';
import { handleCliError } from './utils/cli-error';

/** Creates and configures the Commander program instance. */
export const createProgram = (): Command => {
  const program = new Command();
  program.exitOverride(); // CRITICAL: throws instead of calling process.exit()
  program.configureOutput({
    writeErr: () => {}, // Suppress Commander's own error output — handleCliError writes JSON instead
  });
  program
    .name('godspeed')
    .description('Godspeed task management CLI')
    .version(packageJson.version, '-V, --version', 'Output the current version');
  registerAllCommands(program);
  return program;
};

/** Returns true for CommanderError codes that represent successful exits (help/version display). */
const isSuccessfulCommanderExit = (error: CommanderError): boolean =>
  error.code === 'commander.helpDisplayed' || error.code === 'commander.version';

/** Runs the CLI, parsing the given argv array. */
export const runCli = async (argv: string[] = process.argv): Promise<void> => {
  const program = createProgram();
  if (argv.slice(2).length === 0) {
    try {
      program.outputHelp();
    } catch (error) {
      // exitOverride() throws commander.helpDisplayed — this is expected and successful
      if (!(error instanceof CommanderError && isSuccessfulCommanderExit(error))) {
        handleCliError(error);
      }
    }
    return;
  }
  try {
    await program.parseAsync(argv);
  } catch (error) {
    if (error instanceof CommanderError && !isSuccessfulCommanderExit(error)) {
      handleCliError(toCommandRuntimeError(error, {
        code: 'INVALID_INPUT',
        message: error.message,
        suggestion: 'Run `godspeed --help` for usage.',
      }));
    } else if (!(error instanceof CommanderError && isSuccessfulCommanderExit(error))) {
      handleCliError(error);
    }
  }
};

// CJS entry guard
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runCli(process.argv);
}
