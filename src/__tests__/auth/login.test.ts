import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandRuntimeError } from '../../commands/runtime/command-error';

vi.mock('../../utils/token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/token')>();
  return {
    ...actual,
    saveToken: vi.fn(),
  };
});

import { handleLoginCommand } from '../../commands/auth/login';
import * as tokenUtils from '../../utils/token';

describe('handleLoginCommand (AUTH-01)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls saveToken when --token is provided', async () => {
    await handleLoginCommand({ token: 'tok123' });
    expect(tokenUtils.saveToken).toHaveBeenCalledWith('tok123');
  });

  it('throws INVALID_INPUT in non-TTY mode when token is missing', async () => {
    vi.spyOn(process, 'stdin', 'get').mockReturnValue({
      ...process.stdin,
      isTTY: false,
    } as NodeJS.ReadStream);

    await expect(handleLoginCommand({})).rejects.toMatchObject<Partial<CommandRuntimeError>>({
      code: 'INVALID_INPUT',
    });
  });
});
