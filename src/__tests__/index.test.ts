import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCli } from '../index';

describe('runCli error handling (DX-02 contract)', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it('writes JSON to process.stderr (not console.error) for invalid command', async () => {
    await runCli(['node', 'godspeed', 'cmd-invalido']);
    expect(stderrSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('stderr output for invalid command is valid JSON with error/code/suggestion fields', async () => {
    await runCli(['node', 'godspeed', 'cmd-invalido']);
    const stderrOutput = (stderrSpy.mock.calls[0][0] as string).trim();
    const parsed = JSON.parse(stderrOutput);
    expect(parsed).toHaveProperty('error');
    expect(parsed).toHaveProperty('code');
    expect(parsed).toHaveProperty('suggestion');
  });

  it('stderr for invalid command does not contain human-readable text (no "Error [" prefix)', async () => {
    await runCli(['node', 'godspeed', 'cmd-invalido']);
    const stderrOutput = (stderrSpy.mock.calls[0][0] as string);
    expect(stderrOutput).not.toContain('Error [');
    expect(stderrOutput).not.toContain('Suggestion:');
  });

  it('sets exitCode to 1 for invalid command', async () => {
    await runCli(['node', 'godspeed', 'cmd-invalido']);
    expect(process.exitCode).toBe(1);
  });
});
