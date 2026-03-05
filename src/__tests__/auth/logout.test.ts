import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/token')>();
  return {
    ...actual,
    deleteStoredToken: vi.fn(),
  };
});

import { handleLogoutCommand } from '../../commands/auth/logout';
import * as tokenUtils from '../../utils/token';

describe('handleLogoutCommand (AUTH-02)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls deleteStoredToken', async () => {
    await handleLogoutCommand({});
    expect(tokenUtils.deleteStoredToken).toHaveBeenCalledTimes(1);
  });
});
