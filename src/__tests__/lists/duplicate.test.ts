import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lag0/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  duplicateList: vi.fn(async () => ({ id: 'list-copy' })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { duplicateList } from '@lag0/godspeed-sdk';
import { handleListsDuplicateCommand } from '../../commands/lists/duplicate';

describe('handleListsDuplicateCommand (LIST-02)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls duplicateList with list id', async () => {
    await handleListsDuplicateCommand('list-123', {});
    expect(duplicateList).toHaveBeenCalledWith(expect.anything(), 'list-123');
  });
});
