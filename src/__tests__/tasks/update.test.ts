import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandRuntimeError } from '../../commands/runtime/command-error';

vi.mock('@syxs/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({})),
  updateTask: vi.fn(async () => ({ id: 'task-updated' })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

import { handleTasksUpdateCommand } from '../../commands/tasks/update';

describe('handleTasksUpdateCommand (TASK-04)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws INVALID_INPUT when complete and incomplete are both true', async () => {
    await expect(
      handleTasksUpdateCommand('id', { complete: true, incomplete: true }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    } satisfies Partial<CommandRuntimeError>);
  });

  it('throws INVALID_INPUT when no update options are provided', async () => {
    await expect(handleTasksUpdateCommand('id', {})).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    } satisfies Partial<CommandRuntimeError>);
  });
});
