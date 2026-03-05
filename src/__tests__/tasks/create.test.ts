import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@syxs/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  createTask: vi.fn(async () => ({ id: 'task-new' })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { createTask } from '@syxs/godspeed-sdk';
import { handleTasksCreateCommand } from '../../commands/tasks/create';

describe('handleTasksCreateCommand (TASK-03)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls createTask with title', async () => {
    await handleTasksCreateCommand({ title: 'My Task' });
    expect(createTask).toHaveBeenCalledWith(expect.anything(), { title: 'My Task' });
  });
});
