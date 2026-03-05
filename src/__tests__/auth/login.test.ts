import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandRuntimeError } from '../../commands/runtime/command-error';

vi.mock('../../utils/token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/token')>();
  return {
    ...actual,
    saveToken: vi.fn(),
    migrateLegacyTokenIfNeeded: vi.fn(),
    resolveToken: vi.fn(),
  };
});

import { handleLoginCommand } from '../../commands/auth/login';
import * as tokenUtils from '../../utils/token';

describe('handleLoginCommand (AUTH-01)', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('migrates first, warns for --token, and saves token', async () => {
    await handleLoginCommand({ token: 'tok123' });

    expect(tokenUtils.migrateLegacyTokenIfNeeded).toHaveBeenCalledTimes(1);
    expect(tokenUtils.saveToken).toHaveBeenCalledWith('tok123');
    expect(stderrSpy).toHaveBeenCalledWith('Warning: --token may expose your token in shell history.\n');
    expect(tokenUtils.resolveToken).not.toHaveBeenCalled();
  });

  it('throws INVALID_INPUT in non-TTY mode when token is missing', async () => {
    vi.spyOn(process, 'stdin', 'get').mockReturnValue({
      ...process.stdin,
      isTTY: false,
    } as NodeJS.ReadStream);
    vi.spyOn(process, 'stdout', 'get').mockReturnValue({
      ...process.stdout,
      isTTY: false,
    } as NodeJS.WriteStream);

    await expect(handleLoginCommand({})).rejects.toMatchObject<Partial<CommandRuntimeError>>({
      code: 'INVALID_INPUT',
    });
    expect(tokenUtils.migrateLegacyTokenIfNeeded).toHaveBeenCalledTimes(1);
    expect(tokenUtils.resolveToken).not.toHaveBeenCalled();
  });
});
