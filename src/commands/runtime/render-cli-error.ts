import { CommandRuntimeError } from './command-error';

/** Formats a CommandRuntimeError as a human-readable string for stderr */
export const renderCliError = (error: CommandRuntimeError): string => {
  const lines: string[] = [`Error [${error.code}]: ${error.message}`];

  if (error.suggestion) {
    lines.push(`Suggestion: ${error.suggestion}`);
  }

  if (error.details) {
    lines.push(`Details: ${error.details}`);
  }

  if (error.cause !== undefined) {
    const causeMessage =
      error.cause instanceof Error ? error.cause.message : String(error.cause);
    if (causeMessage !== error.message) {
      lines.push(`Cause: ${causeMessage}`);
    }
  }

  return lines.join('\n');
};

/** Formats a CommandRuntimeError as a JSON string for structured stderr output */
export const renderCliErrorJson = (error: CommandRuntimeError): string =>
  JSON.stringify({
    error: error.message,
    code: error.code,
    suggestion: error.suggestion ?? null,
  });
