import { HttpClient } from '@actions/http-client';
import * as core from '@actions/core';
import { ToolVersionResolutionError } from './errors';

export interface GitHubTag {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

const resolvedVersionCache = new Map<string, string>();

export function clearVersionCache(): void {
  resolvedVersionCache.clear();
}

export function normalizeVersion(version: string): string {
  const trimmed = version.trim();
  if (trimmed.startsWith('v') && /^v\d/.test(trimmed)) {
    return trimmed.slice(1);
  }
  return trimmed;
}

export function isPrerelease(tag: string): boolean {
  const normalized = normalizeVersion(tag);
  return /-(alpha|beta|rc|dev|preview)/i.test(normalized);
}

export async function fetchGitHubTags(
  repo: string,
  githubToken?: string,
): Promise<string[]> {
  const client = new HttpClient('lean-packages-action');
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = githubToken || process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `https://api.github.com/repos/${repo}/tags`;
  try {
    const response = await client.getJson<GitHubTag[]>(url, headers);
    if (response.statusCode === 200 && Array.isArray(response.result)) {
      return response.result.map((t) => t.name);
    }
    if (response.statusCode === 403 || response.statusCode === 429) {
      core.warning(`GitHub API rate limit exceeded when fetching tags for ${repo}.`);
    }
    return [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    core.warning(`Failed to fetch tags for ${repo}: ${message}`);
    return [];
  }
}

export const githubApi = {
  fetchGitHubTags,
};

export async function resolveToolVersion(
  toolName: string,
  repo: string,
  requestedVersion: string,
  githubToken?: string,
): Promise<string> {
  const cacheKey = `${repo}:${requestedVersion}`;
  if (resolvedVersionCache.has(cacheKey)) {
    return resolvedVersionCache.get(cacheKey)!;
  }

  const requested = requestedVersion.trim();

  if (requested.toLowerCase() === 'latest') {
    const tags = await githubApi.fetchGitHubTags(repo, githubToken);
    const stableTags = tags.filter((t) => !isPrerelease(t));

    if (stableTags.length > 0) {
      const latestTag = stableTags[0];
      const normalized = normalizeVersion(latestTag);
      resolvedVersionCache.set(cacheKey, normalized);
      return normalized;
    }

    // Fallback if tags cannot be fetched or offline
    resolvedVersionCache.set(cacheKey, 'latest');
    return 'latest';
  }

  const normalized = normalizeVersion(requested);
  if (!normalized) {
    throw new ToolVersionResolutionError(
      toolName,
      requestedVersion,
      'Version cannot be empty.',
    );
  }

  resolvedVersionCache.set(cacheKey, normalized);
  return normalized;
}
