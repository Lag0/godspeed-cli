import { classifyCommandError } from './classify-command-error';
import { CommandRuntimeError } from './command-error';

/**
 * Wraps an async command handler function to catch and reclassify errors.
 * All errors are converted to CommandRuntimeError and re-thrown.
 */
export const withCommandHandler = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof CommandRuntimeError) throw error;
    throw classifyCommandError(error);
  }
};
