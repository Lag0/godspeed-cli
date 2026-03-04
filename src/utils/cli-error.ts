import { renderCliErrorJson } from '../commands/runtime/render-cli-error';
import {
  CommandRuntimeError as RuntimeError,
  type CommandErrorCode,
} from '../commands/runtime/command-error';

/**
 * Re-export CommandRuntimeError with a convenience positional constructor signature.
 * Matches the test stub API: new CommandRuntimeError(code, message, suggestion?)
 */
export class CommandRuntimeError extends RuntimeError {
  constructor(code: string, message: string, suggestion?: string) {
    super({
      code: code as CommandErrorCode,
      message,
      suggestion,
      exitCode: 1,
    });
  }
}

/**
 * Global CLI error handler — always writes structured JSON to stderr, sets process.exitCode.
 * Never writes to stdout.
 */
export const handleCliError = (error: unknown): void => {
  process.exitCode = 1;

  if (error instanceof RuntimeError) {
    process.stderr.write(
      `${renderCliErrorJson(error)}\n`,
    );
    return;
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
  process.stderr.write(
    `${JSON.stringify({ error: message, code: 'COMMAND_EXECUTION_FAILED', suggestion: null })}\n`,
  );
};
