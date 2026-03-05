import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/token')>();
  return {
    ...actual,
    loadStoredToken: vi.fn(),
  };
});

import { handleStatusCommand } from '../../commands/auth/status';
import * as tokenUtils from '../../utils/token';

describe('handleStatusCommand (AUTH-03)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('returns source env when GODSPEED_TOKEN is set', async () => {
    process.env.GODSPEED_TOKEN = 'env-token';
    const result = await handleStatusCommand({});
    expect(result).toMatchObject({
      authenticated: true,
      source: 'env',
    });
  });

  it('returns unauthenticated none when no token is available', async () => {
    delete process.env.GODSPEED_TOKEN;
    vi.mocked(tokenUtils.loadStoredToken).mockReturnValue(undefined);

    const result = await handleStatusCommand({});
    expect(result).toMatchObject({
      authenticated: false,
      source: 'none',
    });
  });
});
