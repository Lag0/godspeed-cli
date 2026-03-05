import { GodspeedApiError, GodspeedAuthError, GodspeedRateLimitError } from '@syxs/godspeed-sdk';
import { CommandRuntimeError, toCommandRuntimeError } from './command-error';

/** Maps SDK error hierarchy to CommandRuntimeError with appropriate codes and suggestions */
export const classifyCommandError = (error: unknown): CommandRuntimeError => {
  if (error instanceof GodspeedAuthError) {
    return toCommandRuntimeError(error, {
      code: 'AUTH_REQUIRED',
      message: error.message,
      suggestion: 'Run `godspeed login --token <token>` or set GODSPEED_TOKEN.',
      exitCode: 1,
    });
  }

  if (error instanceof GodspeedRateLimitError) {
    return toCommandRuntimeError(error, {
      code: 'RATE_LIMITED',
      message: error.message,
      suggestion: 'Wait and retry. Limits: ≤10 reads/min, ≤60 writes/min.',
      exitCode: 1,
    });
  }

  if (error instanceof GodspeedApiError) {
    return toCommandRuntimeError(error, {
      code: 'API_ERROR',
      message: error.message,
      exitCode: 1,
    });
  }

  return toCommandRuntimeError(error, {
    code: 'COMMAND_EXECUTION_FAILED',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    exitCode: 1,
  });
};
