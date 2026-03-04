import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCommandContext,
  writeCommandOutput,
} from '../commands/runtime/command-context';

describe('createCommandContext', () => {
  it('returns jsonOutput: true when json flag is true', () => {
    const context = createCommandContext({ json: true });
    expect(context.jsonOutput).toBe(true);
  });

  it('returns jsonOutput: false when json flag is false', () => {
    const context = createCommandContext({ json: false });
    expect(context.jsonOutput).toBe(false);
  });

  it('returns jsonOutput: false when no json flag provided', () => {
    const context = createCommandContext({});
    expect(context.jsonOutput).toBe(false);
  });
});

describe('writeCommandOutput', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serializes to JSON when jsonOutput is true', () => {
    const context = createCommandContext({ json: true });
    writeCommandOutput(context, { result: 'ok' });
    expect(stdoutSpy).toHaveBeenCalledWith('{"result":"ok"}\n');
  });

  it('calls formatReadable when jsonOutput is false', () => {
    const context = createCommandContext({ json: false });
    const formatReadable = vi.fn(() => 'formatted output');
    writeCommandOutput(context, { result: 'ok' }, formatReadable);
    expect(formatReadable).toHaveBeenCalledWith({ result: 'ok' });
  });
});
