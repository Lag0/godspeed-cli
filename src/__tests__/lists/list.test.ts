import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lag0/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  listLists: vi.fn(async () => ({ lists: [] })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { listLists } from '@lag0/godspeed-sdk';
import { handleListsListCommand } from '../../commands/lists/list';

describe('handleListsListCommand (LIST-01)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls listLists', async () => {
    await handleListsListCommand({});
    expect(listLists).toHaveBeenCalledWith(expect.anything());
  });
});
