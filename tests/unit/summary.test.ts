import { describe, it, expect } from 'vitest';
import { formatDuration, generateSummaryMarkdown } from '../../src/summary';
import { ExecutionResult } from '../../src/types';

describe('Job Summary Generation', () => {
  it('formats milliseconds and seconds accurately', () => {
    expect(formatDuration(450)).toBe('450ms');
    expect(formatDuration(1250)).toBe('1.25s');
    expect(formatDuration(3000)).toBe('3.00s');
  });

  it('generates summary for all passed results', () => {
    const results: ExecutionResult[] = [
      {
        ecosystem: 'php',
        toolName: 'php-lean',
        toolVersion: '0.9.3',
        exitCode: 0,
        durationMs: 320,
        stdout: '',
        stderr: '',
        passed: true,
      },
      {
        ecosystem: 'rust',
        toolName: 'cargo-lean',
        toolVersion: '0.4.2',
        exitCode: 0,
        durationMs: 850,
        stdout: '',
        stderr: '',
        passed: true,
      },
    ];

    const md = generateSummaryMarkdown(results);
    expect(md).toContain('### ✅ Package Distribution Lint Passed');
    expect(md).toContain('| **php** | `php-lean` | `0.9.3` | ✅ Passed | 320ms |');
    expect(md).toContain('| **rust** | `cargo-lean` | `0.4.2` | ✅ Passed | 850ms |');
    expect(md).toContain('All detected package ecosystems passed native packaging lint checks.');
  });

  it('generates summary when a tool fails', () => {
    const results: ExecutionResult[] = [
      {
        ecosystem: 'python',
        toolName: 'py-lean',
        toolVersion: '0.2.5',
        exitCode: 1,
        durationMs: 400,
        stdout: '',
        stderr: 'Missing source-exclude entries',
        passed: false,
      },
      {
        ecosystem: 'javascript',
        toolName: 'js-lean',
        toolVersion: '0.1.1',
        exitCode: 0,
        durationMs: 250,
        stdout: '',
        stderr: '',
        passed: true,
      },
    ];

    const md = generateSummaryMarkdown(results);
    expect(md).toContain('### ❌ Package Distribution Lint Failed');
    expect(md).toContain('| **python** | `py-lean` | `0.2.5` | ❌ Failed | 400ms |');
    expect(md).toContain('| **javascript** | `js-lean` | `0.1.1` | ✅ Passed | 250ms |');
    expect(md).toContain('Lint findings or errors detected in: `py-lean`.');
  });
});
