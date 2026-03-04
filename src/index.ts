#!/usr/bin/env node

import { Command, CommanderError } from 'commander';
import packageJson from '../package.json';
import { registerAllCommands } from './commands/registrars/register-all-commands';
import {
  isCommandRuntimeError,
  toCommandRuntimeError,
} from './commands/runtime/command-error';
import { renderCliError } from './commands/runtime/render-cli-error';

/** Creates and configures the Commander program instance. */
export const createProgram = (): Command => {
  const program = new Command();
  program.exitOverride(); // CRITICAL: throws instead of calling process.exit()
  program
    .name('godspeed')
    .description('Godspeed task management CLI')
    .version(packageJson.version, '-V, --version', 'Output the current version');
  registerAllCommands(program);
  return program;
};

/** Handles CLI errors by writing structured output to stderr and setting exit code. */
export const handleCliError = (error: unknown): void => {
  if (isCommandRuntimeError(error)) {
    console.error(renderCliError(error));
    process.exitCode = error.exitCode;
    return;
  }

  if (error instanceof CommanderError) {
    const runtimeError = toCommandRuntimeError(error, {
      code: 'INVALID_INPUT',
      message: error.message,
      suggestion: 'Run `godspeed --help` for usage.',
    });
    console.error(renderCliError(runtimeError));
    process.exitCode = 1;
    return;
  }

  const runtimeError = toCommandRuntimeError(error, {
    code: 'COMMAND_EXECUTION_FAILED',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  });
  console.error(renderCliError(runtimeError));
  process.exitCode = 1;
};

/** Runs the CLI, parsing the given argv array. */
export const runCli = async (argv: string[] = process.argv): Promise<void> => {
  const program = createProgram();
  if (argv.slice(2).length === 0) {
    program.outputHelp();
    return;
  }
  try {
    await program.parseAsync(argv);
  } catch (error) {
    handleCliError(error);
  }
};

// CJS entry guard
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runCli(process.argv);
}
