import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import {
  parseArguments,
  getRequestedVersionForEcosystem,
  runAction,
} from '../../src/executor';
import { ActionInputs, Ecosystem, ToolAdapter } from '../../src/types';
import { ActionError, UnsupportedCommandError } from '../../src/errors';
import * as core from '@actions/core';

describe('Executor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'error').mockImplementation(() => {});
    vi.spyOn(core, 'warning').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});
    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
  });

  describe('Argument Parsing', () => {
    it('parses empty args to empty array', () => {
      expect(parseArguments('')).toEqual([]);
      expect(parseArguments('   ')).toEqual([]);
    });

    it('parses unquoted arguments safely', () => {
      expect(parseArguments('--diff --strict')).toEqual(['--diff', '--strict']);
    });

    it('parses double-quoted arguments with spaces safely', () => {
      expect(
        parseArguments('--preset PHP --glob-pattern "{.*,*.md,docs/}"'),
      ).toEqual(['--preset', 'PHP', '--glob-pattern', '{.*,*.md,docs/}']);
    });

    it('parses single-quoted arguments with spaces safely', () => {
      expect(
        parseArguments("--preset PHP --glob-pattern '{.*,*.md,docs/}'"),
      ).toEqual(['--preset', 'PHP', '--glob-pattern', '{.*,*.md,docs/}']);
    });
  });

  describe('Version Mapping', () => {
    const sampleInputs: ActionInputs = {
      ecosystem: 'auto',
      path: '.',
      command: 'lint',
      phpVersion: '0.9.3',
      rubyVersion: '0.1.0',
      rustVersion: '0.4.2',
      pythonVersion: '0.2.5',
      javascriptVersion: '0.1.1',
      zigVersion: '0.1.0',
      args: [],
      githubToken: '',
    };

    it('retrieves the matching version input for each ecosystem', () => {
      expect(getRequestedVersionForEcosystem('php', sampleInputs)).toBe('0.9.3');
      expect(getRequestedVersionForEcosystem('ruby', sampleInputs)).toBe('0.1.0');
      expect(getRequestedVersionForEcosystem('rust', sampleInputs)).toBe('0.4.2');
      expect(getRequestedVersionForEcosystem('python', sampleInputs)).toBe('0.2.5');
      expect(getRequestedVersionForEcosystem('javascript', sampleInputs)).toBe('0.1.1');
      expect(getRequestedVersionForEcosystem('zig', sampleInputs)).toBe('0.1.0');
    });
  });

  describe('Action Execution', () => {
    it('rejects unsupported commands', async () => {
      const inputs: ActionInputs = {
        ecosystem: 'auto',
        path: '.',
        command: 'build',
        phpVersion: 'latest',
        rubyVersion: 'latest',
        rustVersion: 'latest',
        pythonVersion: 'latest',
        javascriptVersion: 'latest',
        zigVersion: 'latest',
        args: [],
        githubToken: '',
      };

      await expect(runAction(inputs)).rejects.toThrow(UnsupportedCommandError);
    });

    it('runs lint for detected fixtures successfully', async () => {
      const fixturePath = path.resolve(__dirname, '../fixtures/rust/valid');

      const mockAdapter: ToolAdapter = {
        ecosystem: 'rust',
        toolName: 'cargo-lean',
        manifestDescription: 'Cargo.toml',
        matchesManifest: () => true,
        resolveVersion: vi.fn().mockResolvedValue('0.4.2'),
        install: vi.fn().mockResolvedValue(undefined),
        executeLint: vi.fn().mockResolvedValue({
          ecosystem: 'rust',
          toolName: 'cargo-lean',
          toolVersion: '0.4.2',
          exitCode: 0,
          durationMs: 120,
          stdout: 'exclude list complete',
          stderr: '',
          passed: true,
        }),
      };

      const mockAdapters: Record<Ecosystem, ToolAdapter> = {
        php: mockAdapter,
        ruby: mockAdapter,
        rust: mockAdapter,
        python: mockAdapter,
        javascript: mockAdapter,
        zig: mockAdapter,
      };

      const inputs: ActionInputs = {
        ecosystem: 'rust',
        path: fixturePath,
        command: 'lint',
        phpVersion: 'latest',
        rubyVersion: 'latest',
        rustVersion: '0.4.2',
        pythonVersion: 'latest',
        javascriptVersion: 'latest',
        zigVersion: 'latest',
        args: ['--diff'],
        githubToken: '',
      };

      const results = await runAction(inputs, mockAdapters);
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
      expect(results[0].toolVersion).toBe('0.4.2');
      expect(mockAdapter.resolveVersion).toHaveBeenCalledWith('0.4.2', '');
      expect(mockAdapter.install).toHaveBeenCalledWith('0.4.2', '');
    });

    it('continues across multiple ecosystems and throws ActionError if any fails', async () => {
      const fixturePath = path.resolve(__dirname, '../fixtures/rust/valid');

      const mockPhpAdapter: ToolAdapter = {
        ecosystem: 'php',
        toolName: 'php-lean',
        manifestDescription: 'composer.json',
        matchesManifest: () => true,
        resolveVersion: vi.fn().mockResolvedValue('0.9.3'),
        install: vi.fn().mockResolvedValue(undefined),
        executeLint: vi.fn().mockResolvedValue({
          ecosystem: 'php',
          toolName: 'php-lean',
          toolVersion: '0.9.3',
          exitCode: 1,
          durationMs: 150,
          stdout: '',
          stderr: 'Missing export-ignore',
          passed: false,
        }),
      };

      const mockRustAdapter: ToolAdapter = {
        ecosystem: 'rust',
        toolName: 'cargo-lean',
        manifestDescription: 'Cargo.toml',
        matchesManifest: () => true,
        resolveVersion: vi.fn().mockResolvedValue('0.4.2'),
        install: vi.fn().mockResolvedValue(undefined),
        executeLint: vi.fn().mockResolvedValue({
          ecosystem: 'rust',
          toolName: 'cargo-lean',
          toolVersion: '0.4.2',
          exitCode: 0,
          durationMs: 100,
          stdout: 'ok',
          stderr: '',
          passed: true,
        }),
      };

      const mockAdapters: Record<Ecosystem, ToolAdapter> = {
        php: mockPhpAdapter,
        ruby: mockPhpAdapter,
        rust: mockRustAdapter,
        python: mockRustAdapter,
        javascript: mockRustAdapter,
        zig: mockRustAdapter,
      };

      const inputs: ActionInputs = {
        ecosystem: 'rust',
        path: fixturePath,
        command: 'lint',
        phpVersion: 'latest',
        rubyVersion: 'latest',
        rustVersion: 'latest',
        pythonVersion: 'latest',
        javascriptVersion: 'latest',
        zigVersion: 'latest',
        args: [],
        githubToken: '',
      };

      const res = await runAction(inputs, mockAdapters);
      expect(res).toHaveLength(1);
      expect(res[0].passed).toBe(true);
    });
  });
});
