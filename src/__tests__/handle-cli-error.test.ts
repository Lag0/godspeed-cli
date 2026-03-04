import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandRuntimeError, handleCliError } from '../utils/cli-error';

describe('handleCliError', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it('writes to stderr, not stdout, for CommandRuntimeError', () => {
    const error = new CommandRuntimeError('AUTH_FAILED', 'Token is invalid', 'Run: godspeed auth login');
    handleCliError(error);
    expect(stderrSpy).toHaveBeenCalled();
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('stderr output contains the error code', () => {
    const error = new CommandRuntimeError('AUTH_FAILED', 'Token is invalid', 'Run: godspeed auth login');
    handleCliError(error);
    const stderrOutput = (stderrSpy.mock.calls[0][0] as string);
    expect(stderrOutput).toContain('AUTH_FAILED');
  });

  it('stderr output shape contains error, code, suggestion fields', () => {
    const error = new CommandRuntimeError('NOT_FOUND', 'Task not found', 'Check the task ID');
    handleCliError(error);
    const stderrOutput = (stderrSpy.mock.calls[0][0] as string);
    const parsed = JSON.parse(stderrOutput.trim());
    expect(parsed).toHaveProperty('error');
    expect(parsed).toHaveProperty('code');
    expect(parsed).toHaveProperty('suggestion');
  });

  it('sets process.exitCode to 1 for generic errors', () => {
    handleCliError(new Error('Something went wrong'));
    expect(process.exitCode).toBe(1);
  });

  it('sets process.exitCode to 1 for CommandRuntimeError', () => {
    const error = new CommandRuntimeError('UNKNOWN', 'Unknown error', 'Try again');
    handleCliError(error);
    expect(process.exitCode).toBe(1);
  });
});
