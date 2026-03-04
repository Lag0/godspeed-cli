/** Writes a string to stdout, appending a newline if not already present */
export const writeOutput = (content: string): void => {
  const output = content.endsWith('\n') ? content : `${content}\n`;
  process.stdout.write(output);
};

/** Serializes data as JSON and writes to stdout */
export const writeJsonOutput = (data: unknown): void => {
  writeOutput(JSON.stringify(data));
};

/** Alias for writeOutput — human-readable text to stdout */
export const writeHumanOutput = (text: string): void => writeOutput(text);
