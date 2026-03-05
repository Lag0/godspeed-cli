import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG_FILE, LEGACY_CONFIG_FILE } from '../../utils/config';
import * as tokenUtils from '../../utils/token';

const fsMocks = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  chmodSync: vi.fn(),
}));

vi.mock('node:fs', () => fsMocks);

import * as fs from 'node:fs';

describe('resolveToken legacy migration (AUTH-04)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GODSPEED_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('migrates legacy token when legacy exists and new config is absent', () => {
    const saveTokenSpy = vi.spyOn(tokenUtils, 'saveToken').mockImplementation(() => undefined);

    vi.mocked(fs.existsSync).mockImplementation((path) => {
      if (path === CONFIG_FILE) return false;
      if (path === LEGACY_CONFIG_FILE) return true;
      return false;
    });

    vi.mocked(fs.readFileSync).mockImplementation((path) => {
      if (path === LEGACY_CONFIG_FILE) return JSON.stringify({ token: 'legacy-123' });
      throw new Error(`Unexpected read: ${String(path)}`);
    });

    const token = tokenUtils.resolveToken();
    expect(token).toBe('legacy-123');
    expect(saveTokenSpy).toHaveBeenCalledWith('legacy-123');
    expect(fs.unlinkSync).toHaveBeenCalledWith(LEGACY_CONFIG_FILE);
  });

  it('skips migration when new config already exists', () => {
    const saveTokenSpy = vi.spyOn(tokenUtils, 'saveToken').mockImplementation(() => undefined);

    vi.mocked(fs.existsSync).mockImplementation((path) => {
      if (path === CONFIG_FILE) return true;
      if (path === LEGACY_CONFIG_FILE) return true;
      return false;
    });

    vi.mocked(fs.readFileSync).mockImplementation((path) => {
      if (path === CONFIG_FILE) return JSON.stringify({ token: 'new-456' });
      throw new Error(`Unexpected read: ${String(path)}`);
    });

    const token = tokenUtils.resolveToken();
    expect(token).toBe('new-456');
    expect(saveTokenSpy).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
