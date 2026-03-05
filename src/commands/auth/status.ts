import * as fs from 'node:fs';
import pc from 'picocolors';
import { createCommandContext, writeCommandOutput } from '../runtime/command-context';
import { withCommandHandler } from '../runtime/with-command-handler';
import { CONFIG_FILE, LEGACY_CONFIG_FILE } from '../../utils/config';
import { migrateLegacyTokenIfNeeded } from '../../utils/token';

export interface StatusOptions {
  json?: boolean;
}

type AuthSource = 'env' | 'stored' | 'legacy' | 'none';

interface StatusResult {
  authenticated: boolean;
  source: AuthSource;
  configFile: string;
}

const detectAuthSource = (): AuthSource => {
  if (process.env['GODSPEED_TOKEN']) return 'env';
  if (fs.existsSync(CONFIG_FILE)) return 'stored';
  if (fs.existsSync(LEGACY_CONFIG_FILE)) return 'legacy';
  return 'none';
};

const SOURCE_LABELS: Record<AuthSource, string> = {
  env: 'via GODSPEED_TOKEN env var',
  stored: 'via ~/.godspeed/config.json',
  legacy: 'via ~/.godspeed-sdk/config.json (migration pending)',
  none: 'not authenticated',
};

const formatStatusReadable = (result: StatusResult): string => {
  const icon = result.authenticated ? pc.green('●') : pc.red('●');
  return `${icon} ${SOURCE_LABELS[result.source]}`;
};

export const handleStatusCommand = async (options: StatusOptions): Promise<void> => {
  const context = createCommandContext(options);

  await withCommandHandler(async () => {
    migrateLegacyTokenIfNeeded();

    const source = detectAuthSource();
    const result: StatusResult = {
      authenticated: source !== 'none',
      source,
      configFile: CONFIG_FILE,
    };
    writeCommandOutput(context, result, formatStatusReadable);
  });
};
