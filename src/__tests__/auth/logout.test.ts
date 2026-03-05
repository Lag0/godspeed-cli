import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import { LEGACY_CONFIG_FILE } from '../../utils/config';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('../../utils/token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/token')>();
  return {
    ...actual,
    deleteStoredToken: vi.fn(),
    migrateLegacyTokenIfNeeded: vi.fn(),
    resolveToken: vi.fn(),
  };
});

import { handleLogoutCommand } from '../../commands/auth/logout';
import * as tokenUtils from '../../utils/token';

describe('handleLogoutCommand (AUTH-02)', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let existsSpy: ReturnType<typeof vi.spyOn>;
  let unlinkSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    existsSpy = vi.mocked(fs.existsSync).mockReturnValue(true);
    unlinkSpy = vi.mocked(fs.unlinkSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('migrates first, clears modern token, and removes legacy config', async () => {
    await handleLogoutCommand({});

    expect(tokenUtils.migrateLegacyTokenIfNeeded).toHaveBeenCalledTimes(1);
    expect(tokenUtils.deleteStoredToken).toHaveBeenCalledTimes(1);
    expect(existsSpy).toHaveBeenCalledWith(LEGACY_CONFIG_FILE);
    expect(unlinkSpy).toHaveBeenCalledWith(LEGACY_CONFIG_FILE);
    expect(tokenUtils.resolveToken).not.toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith('Logged out.\n');
  });

  it('handles legacy-only credentials path and still returns success', async () => {
    existsSpy.mockImplementation((path) => path === LEGACY_CONFIG_FILE);

    await handleLogoutCommand({});

    expect(unlinkSpy).toHaveBeenCalledWith(LEGACY_CONFIG_FILE);
    expect(stdoutSpy).toHaveBeenCalledWith('Logged out.\n');
  });
});
