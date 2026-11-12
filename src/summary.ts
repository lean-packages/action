import * as core from '@actions/core';
import { ExecutionResult } from './types';

export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
}

export function generateSummaryMarkdown(results: ExecutionResult[]): string {
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  const statusHeader = allPassed
    ? '### ✅ Package Distribution Lint Passed'
    : '### ❌ Package Distribution Lint Failed';

  const rows: string[] = [
    statusHeader,
    '',
    '| Ecosystem | Tool | Version | Result | Duration |',
    '|---|---|---|---|---|',
  ];

  for (const r of results) {
    const statusIcon = r.passed ? '✅ Passed' : '❌ Failed';
    rows.push(
      `| **${r.ecosystem}** | \`${r.toolName}\` | \`${r.toolVersion}\` | ${statusIcon} | ${formatDuration(r.durationMs)} |`,
    );
  }

  rows.push('');
  if (allPassed) {
    rows.push('All detected package ecosystems passed native packaging lint checks.');
  } else {
    const failed = results.filter((r) => !r.passed).map((r) => r.toolName);
    rows.push(`Lint findings or errors detected in: ${failed.map((t) => `\`${t}\``).join(', ')}.`);
  }

  return rows.join('\n');
}

export async function writeJobSummary(results: ExecutionResult[]): Promise<void> {
  try {
    const markdown = generateSummaryMarkdown(results);
    await core.summary.addRaw(markdown, true).write();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    core.warning(`Failed to write job summary: ${message}`);
  }
}
