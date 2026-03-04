export type CommandErrorCode =
  | 'COMMAND_FAILED'
  | 'INVALID_INPUT'
  | 'AUTH_REQUIRED'
  | 'COMMAND_EXECUTION_FAILED'
  | 'API_ERROR'
  | 'RATE_LIMITED';

export interface CommandRuntimeErrorOptions {
  code: CommandErrorCode;
  message: string;
  exitCode?: number;
  suggestion?: string;
  cause?: unknown;
  details?: string;
}

export class CommandRuntimeError extends Error {
  readonly code: CommandErrorCode;
  readonly exitCode: number;
  readonly suggestion?: string;
  readonly details?: string;
  override readonly cause?: unknown;

  constructor(options: CommandRuntimeErrorOptions) {
    super(options.message);
    this.name = 'CommandRuntimeError';
    this.code = options.code;
    this.exitCode = options.exitCode ?? 1;
    this.suggestion = options.suggestion;
    this.details = options.details;
    this.cause = options.cause;
  }
}

/** Type guard for CommandRuntimeError */
export const isCommandRuntimeError = (error: unknown): error is CommandRuntimeError =>
  error instanceof CommandRuntimeError;

/** Wraps any error as CommandRuntimeError, preserving cause */
export const toCommandRuntimeError = (
  error: unknown,
  fallback: Omit<CommandRuntimeErrorOptions, 'cause'>,
): CommandRuntimeError => {
  if (isCommandRuntimeError(error)) return error;
  return new CommandRuntimeError({ ...fallback, cause: error });
};
