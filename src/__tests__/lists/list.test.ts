import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lag0/godspeed-sdk', () => ({
  createClient: vi.fn(() => ({ client: 'mock' })),
  listLists: vi.fn(async () => ({ lists: [] })),
}));

vi.mock('../../utils/token', () => ({
  resolveToken: vi.fn(() => 'mock-token'),
}));

vi.mock('../../commands/runtime/command-context', () => ({
  createCommandContext: vi.fn((options) => ({ options, jsonOutput: options.json === true })),
  writeCommandOutput: vi.fn(),
}));

vi.mock('../../commands/runtime/with-command-handler', () => ({
  withCommandHandler: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}));

import { createClient, listLists } from '@lag0/godspeed-sdk';
import { createCommandContext, writeCommandOutput } from '../../commands/runtime/command-context';
import { withCommandHandler } from '../../commands/runtime/with-command-handler';
import { resolveToken } from '../../utils/token';
import { handleListsListCommand } from '../../commands/lists/list';

describe('handleListsListCommand (LIST-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GODSPEED_BASE_URL;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.GODSPEED_BASE_URL;
  });

  it('resolves token and calls listLists', async () => {
    await handleListsListCommand({});

    expect(withCommandHandler).toHaveBeenCalledTimes(1);
    expect(resolveToken).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith({ token: 'mock-token', baseUrl: undefined });
    expect(listLists).toHaveBeenCalledWith({ client: 'mock' });
  });

  it('forwards GODSPEED_BASE_URL to createClient when set', async () => {
    process.env.GODSPEED_BASE_URL = 'https://staging.example.com';

    await handleListsListCommand({});

    expect(createClient).toHaveBeenCalledWith({
      token: 'mock-token',
      baseUrl: 'https://staging.example.com',
    });
  });

  it('writes readable empty-state output', async () => {
    await handleListsListCommand({});

    expect(createCommandContext).toHaveBeenCalledWith({});
    expect(writeCommandOutput).toHaveBeenCalledTimes(1);
    const [, result, formatReadable] = vi.mocked(writeCommandOutput).mock.calls[0];
    expect(result).toEqual({ lists: [] });
    expect(typeof formatReadable).toBe('function');
    expect(formatReadable?.({ lists: [] })).toContain('No lists found.');
  });
});
