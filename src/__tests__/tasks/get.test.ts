import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@syxs/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  getTask: vi.fn(async () => ({ id: 'task-abc' })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { getTask } from '@syxs/godspeed-sdk';
import { handleTasksGetCommand } from '../../commands/tasks/get';

describe('handleTasksGetCommand (TASK-02)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls getTask with task id', async () => {
    await handleTasksGetCommand('task-abc', {});
    expect(getTask).toHaveBeenCalledWith(expect.anything(), 'task-abc');
  });
});
