import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('token migration (AUTH-04)', () => {
  let tempDir: string;
  let testConfigDir: string;
  let testConfigFile: string;
  let testLegacyConfigFile: string;

  beforeEach(() => {
    vi.resetModules();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'godspeed-token-test-'));
    testConfigDir = path.join(tempDir, '.godspeed');
    testConfigFile = path.join(testConfigDir, 'config.json');
    testLegacyConfigFile = path.join(tempDir, '.godspeed-sdk', 'config.json');

    vi.doMock('../../utils/config', () => ({
      CONFIG_DIR: testConfigDir,
      CONFIG_FILE: testConfigFile,
      LEGACY_CONFIG_FILE: testLegacyConfigFile,
    }));

    delete process.env['GODSPEED_TOKEN'];
  });

  afterEach(() => {
    vi.doUnmock('../../utils/config');
    delete process.env['GODSPEED_TOKEN'];
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('migrates legacy token to modern config and removes legacy file', async () => {
    fs.mkdirSync(path.dirname(testLegacyConfigFile), { recursive: true });
    fs.writeFileSync(testLegacyConfigFile, JSON.stringify({ token: 'legacy-token' }), 'utf-8');

    const tokenUtils = await import('../../utils/token');
    tokenUtils.migrateLegacyTokenIfNeeded();

    expect(fs.existsSync(testConfigFile)).toBe(true);
    expect(JSON.parse(fs.readFileSync(testConfigFile, 'utf-8'))).toEqual({ token: 'legacy-token' });
    expect(fs.existsSync(testLegacyConfigFile)).toBe(false);
  });

  it('skips migration when modern config already exists', async () => {
    fs.mkdirSync(path.dirname(testConfigFile), { recursive: true });
    fs.writeFileSync(testConfigFile, JSON.stringify({ token: 'modern-token' }), 'utf-8');
    fs.mkdirSync(path.dirname(testLegacyConfigFile), { recursive: true });
    fs.writeFileSync(testLegacyConfigFile, JSON.stringify({ token: 'legacy-token' }), 'utf-8');

    const tokenUtils = await import('../../utils/token');
    tokenUtils.migrateLegacyTokenIfNeeded();

    expect(JSON.parse(fs.readFileSync(testConfigFile, 'utf-8'))).toEqual({ token: 'modern-token' });
    expect(fs.existsSync(testLegacyConfigFile)).toBe(true);
  });

  it('swallows migration errors from invalid legacy config', async () => {
    fs.mkdirSync(path.dirname(testLegacyConfigFile), { recursive: true });
    fs.writeFileSync(testLegacyConfigFile, '{invalid-json', 'utf-8');

    const tokenUtils = await import('../../utils/token');

    expect(() => tokenUtils.migrateLegacyTokenIfNeeded()).not.toThrow();
    expect(fs.existsSync(testConfigFile)).toBe(false);
    expect(fs.existsSync(testLegacyConfigFile)).toBe(true);
  });

  it('calls migration first in resolveToken, then preserves env token precedence', async () => {
    fs.mkdirSync(path.dirname(testLegacyConfigFile), { recursive: true });
    fs.writeFileSync(testLegacyConfigFile, JSON.stringify({ token: 'legacy-token' }), 'utf-8');
    process.env['GODSPEED_TOKEN'] = 'env-token';

    const tokenUtils = await import('../../utils/token');
    const token = tokenUtils.resolveToken();

    expect(token).toBe('env-token');
    expect(fs.existsSync(testConfigFile)).toBe(true);
    expect(JSON.parse(fs.readFileSync(testConfigFile, 'utf-8'))).toEqual({ token: 'legacy-token' });
    expect(fs.existsSync(testLegacyConfigFile)).toBe(false);
  });
});
