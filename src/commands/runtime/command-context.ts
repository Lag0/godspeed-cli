import { writeJsonOutput, writeOutput } from '../../utils/output';

export interface CommandRuntimeOptions {
  json?: boolean;
}

export interface CommandContext<TOptions extends CommandRuntimeOptions> {
  options: TOptions;
  jsonOutput: boolean;
}

/** Factory that creates a CommandContext from parsed Commander options */
export const createCommandContext = <TOptions extends CommandRuntimeOptions>(
  options: TOptions,
): CommandContext<TOptions> => ({
  options,
  jsonOutput: options.json === true,
});

/**
 * Dispatches output to JSON or human-readable format based on context.
 * When jsonOutput is true, serializes result as JSON.
 * When jsonOutput is false, calls formatReadable if provided, else serializes as JSON.
 */
export const writeCommandOutput = <TOptions extends CommandRuntimeOptions, TResult>(
  context: CommandContext<TOptions>,
  result: TResult,
  formatReadable?: (result: TResult) => string,
): void => {
  if (context.jsonOutput) {
    writeJsonOutput(result);
  } else if (formatReadable !== undefined) {
    writeOutput(formatReadable(result));
  } else {
    writeJsonOutput(result);
  }
};
