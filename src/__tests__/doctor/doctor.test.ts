import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fsMocks = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  accessSync: vi.fn(),
}));

vi.mock('node:fs', () => fsMocks);

import * as fs from 'node:fs';
import { handleDoctorCommand } from '../../commands/doctor/doctor';

describe('handleDoctorCommand (DIAG-01)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GODSPEED_TOKEN;
    process.exitCode = undefined;

    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.accessSync).mockImplementation(() => undefined);
    vi.mocked(fs.readFileSync).mockReturnValue('{}');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('sets process.exitCode=1 when no token is found', async () => {
    await handleDoctorCommand({});
    expect(process.exitCode).toBe(1);
  });

  it('returns healthy: false when no token is found', async () => {
    const report = await handleDoctorCommand({});
    expect(report).toMatchObject({
      healthy: false,
    });
  });
});
