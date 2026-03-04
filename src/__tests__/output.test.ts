import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { writeJsonOutput, writeOutput } from '../utils/output';

describe('writeOutput', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes string with newline to process.stdout', () => {
    writeOutput('hello');
    expect(stdoutSpy).toHaveBeenCalledWith('hello\n');
  });

  it('writes empty string with newline', () => {
    writeOutput('');
    expect(stdoutSpy).toHaveBeenCalledWith('\n');
  });
});

describe('writeJsonOutput', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serializes object as JSON with newline to process.stdout', () => {
    writeJsonOutput({ a: 1 });
    expect(stdoutSpy).toHaveBeenCalledWith('{"a":1}\n');
  });

  it('serializes nested object', () => {
    writeJsonOutput({ key: 'value', nested: { n: true } });
    expect(stdoutSpy).toHaveBeenCalledWith('{"key":"value","nested":{"n":true}}\n');
  });
});
