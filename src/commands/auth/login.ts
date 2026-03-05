import { createInterface } from 'node:readline/promises';
import pc from 'picocolors';
import { createCommandContext, writeCommandOutput } from '../runtime/command-context';
import { CommandRuntimeError } from '../runtime/command-error';
import { withCommandHandler } from '../runtime/with-command-handler';
import { migrateLegacyTokenIfNeeded, saveToken } from '../../utils/token';

export interface LoginOptions {
  token?: string;
  json?: boolean;
}

interface LoginResult {
  success: boolean;
  message: string;
}

const promptToken = async (): Promise<string | undefined> => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return undefined;

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const value = (await rl.question('Enter Godspeed API token: ')).trim();
    return value || undefined;
  } finally {
    rl.close();
  }
};

export const handleLoginCommand = async (options: LoginOptions): Promise<void> => {
  const context = createCommandContext(options);

  await withCommandHandler(async () => {
    migrateLegacyTokenIfNeeded();

    let token = options.token;

    if (token) {
      process.stderr.write('Warning: --token may expose your token in shell history.\n');
    } else {
      token = await promptToken();
    }

    if (!token) {
      throw new CommandRuntimeError({
        code: 'INVALID_INPUT',
        message: 'No token provided.',
        suggestion: 'Pass --token <token> or run interactively in a TTY.',
        exitCode: 1,
      });
    }

    saveToken(token);

    const result: LoginResult = {
      success: true,
      message: 'Token saved successfully.',
    };
    writeCommandOutput(
      context,
      result,
      () => `${pc.green('✓')} Token saved to ~/.godspeed/config.json`,
    );
  });
};
