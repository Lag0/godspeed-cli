import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@syxs/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  listTasks: vi.fn(async () => ({ tasks: [] })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { createClient, listTasks } from '@syxs/godspeed-sdk';
import { handleTasksListCommand } from '../../commands/tasks/list';

describe('handleTasksListCommand (TASK-01)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses incomplete filter by default', async () => {
    await handleTasksListCommand({});
    expect(createClient).toHaveBeenCalledWith({ token: 'mock-token' });
    expect(listTasks).toHaveBeenCalledWith(expect.anything(), { status: 'incomplete' });
  });

  it('removes status filter when --all is set', async () => {
    await handleTasksListCommand({ all: true });
    expect(listTasks).toHaveBeenCalledWith(expect.anything(), { status: undefined });
  });
});
