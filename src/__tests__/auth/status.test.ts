import * as fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG_FILE, LEGACY_CONFIG_FILE } from '../../utils/config';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('../../utils/token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/token')>();
  return {
    ...actual,
    migrateLegacyTokenIfNeeded: vi.fn(),
    resolveToken: vi.fn(),
  };
});

import { handleStatusCommand } from '../../commands/auth/status';
import * as tokenUtils from '../../utils/token';

describe('handleStatusCommand (AUTH-03)', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let existsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env['GODSPEED_TOKEN'];
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    existsSpy = vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env['GODSPEED_TOKEN'];
  });

  it('reports env source when GODSPEED_TOKEN is set', async () => {
    process.env['GODSPEED_TOKEN'] = 'env-token';

    await handleStatusCommand({ json: true });

    const payload = JSON.parse((stdoutSpy.mock.calls[0]?.[0] as string).trim()) as {
      authenticated: boolean;
      source: string;
      configFile: string;
    };
    expect(payload).toEqual({
      authenticated: true,
      source: 'env',
      configFile: CONFIG_FILE,
    });
    expect(tokenUtils.migrateLegacyTokenIfNeeded).toHaveBeenCalledTimes(1);
    expect(tokenUtils.resolveToken).not.toHaveBeenCalled();
  });

  it('runs migration before source detection and reports stored source', async () => {
    await handleStatusCommand({ json: true });

    const migrateOrder = vi.mocked(tokenUtils.migrateLegacyTokenIfNeeded).mock.invocationCallOrder[0];
    const existsOrder = existsSpy.mock.invocationCallOrder[0];
    expect(migrateOrder).toBeLessThan(existsOrder);
  });

  it('reports legacy source when only legacy config exists', async () => {
    existsSpy.mockImplementation((path) => path === LEGACY_CONFIG_FILE);

    await handleStatusCommand({ json: true });

    const payload = JSON.parse((stdoutSpy.mock.calls[0]?.[0] as string).trim()) as {
      authenticated: boolean;
      source: string;
      configFile: string;
    };
    expect(payload).toEqual({
      authenticated: true,
      source: 'legacy',
      configFile: CONFIG_FILE,
    });
  });

  it('reports none source when no credentials exist', async () => {
    await handleStatusCommand({ json: true });

    const payload = JSON.parse((stdoutSpy.mock.calls[0]?.[0] as string).trim()) as {
      authenticated: boolean;
      source: string;
      configFile: string;
    };
    expect(payload).toEqual({
      authenticated: false,
      source: 'none',
      configFile: CONFIG_FILE,
    });
  });
});
