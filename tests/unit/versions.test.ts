import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clearVersionCache,
  githubApi,
  isPrerelease,
  normalizeVersion,
  resolveToolVersion,
} from '../../src/versions';
import { ToolVersionResolutionError } from '../../src/errors';

describe('Version Resolution', () => {
  beforeEach(() => {
    clearVersionCache();
    vi.restoreAllMocks();
  });

  it('normalizes version strings with leading v', () => {
    expect(normalizeVersion('v0.9.3')).toBe('0.9.3');
    expect(normalizeVersion('0.9.3')).toBe('0.9.3');
    expect(normalizeVersion('  v1.2.0  ')).toBe('1.2.0');
  });

  it('detects prereleases accurately', () => {
    expect(isPrerelease('v1.0.0-alpha.1')).toBe(true);
    expect(isPrerelease('v1.0.0-beta')).toBe(true);
    expect(isPrerelease('v1.0.0-rc1')).toBe(true);
    expect(isPrerelease('v1.0.0')).toBe(false);
    expect(isPrerelease('0.4.2')).toBe(false);
  });

  it('resolves pinned version directly and caches result', async () => {
    const v1 = await resolveToolVersion('cargo-lean', 'lean-packages/cargo-lean', '0.4.2');
    expect(v1).toBe('0.4.2');

    const v2 = await resolveToolVersion('cargo-lean', 'lean-packages/cargo-lean', 'v0.4.2');
    expect(v2).toBe('0.4.2');
  });

  it('throws ToolVersionResolutionError on empty version', async () => {
    await expect(
      resolveToolVersion('php-lean', 'lean-packages/php-lean', '   '),
    ).rejects.toThrow(ToolVersionResolutionError);
  });

  it('resolves latest from GitHub tags, ignoring prereleases', async () => {
    vi.spyOn(githubApi, 'fetchGitHubTags').mockResolvedValue([
      'v1.0.0-beta.1',
      'v0.9.3',
      'v0.9.2',
    ]);

    const resolved = await resolveToolVersion('php-lean', 'lean-packages/php-lean', 'latest');
    expect(resolved).toBe('0.9.3');
  });

  it('falls back to "latest" if tags cannot be fetched', async () => {
    vi.spyOn(githubApi, 'fetchGitHubTags').mockResolvedValue([]);

    const resolved = await resolveToolVersion('php-lean', 'lean-packages/php-lean', 'latest');
    expect(resolved).toBe('latest');
  });
});
