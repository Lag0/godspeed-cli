import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lag0/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  deleteTask: vi.fn(async () => undefined),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { handleTasksDeleteCommand } from '../../commands/tasks/delete';

describe('handleTasksDeleteCommand (TASK-05)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns synthetic success payload for deleted task', async () => {
    const result = await handleTasksDeleteCommand('task-xyz', {});
    expect(result).toMatchObject({
      success: true,
      id: 'task-xyz',
    });
  });
});
