import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as core from '@actions/core';
import {
  Ecosystem,
  ExecutionResult,
  LintOptions,
  ToolAdapter,
} from '../types';
import { resolveToolVersion } from '../versions';

export abstract class BaseToolAdapter implements ToolAdapter {
  abstract readonly ecosystem: Ecosystem;
  abstract readonly toolName: string;
  abstract readonly repo: string;
  abstract readonly manifestDescription: string;
  abstract readonly binaryName: string;

  abstract matchesManifest(files: string[]): boolean;
  abstract install(version: string, githubToken?: string): Promise<void>;

  async resolveVersion(requestedVersion: string, githubToken?: string): Promise<string> {
    return resolveToolVersion(this.toolName, this.repo, requestedVersion, githubToken);
  }

  async isBinaryAvailable(): Promise<boolean> {
    try {
      const toolPath = await io.which(this.binaryName, false);
      return Boolean(toolPath);
    } catch {
      return false;
    }
  }

  async executeLint(options: LintOptions): Promise<ExecutionResult> {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const cmdArgs = this.getLintArgs(options);
    const execPath = this.getExecutionPath();

    core.info(`Executing ${this.toolName} lint in '${options.workingDirectory}' with args: [${cmdArgs.join(', ')}]`);

    let exitCode = 0;
    try {
      exitCode = await exec.exec(execPath, cmdArgs, {
        cwd: options.workingDirectory,
        ignoreReturnCode: true,
        listeners: {
          stdout: (data: Buffer) => {
            stdout += data.toString();
          },
          stderr: (data: Buffer) => {
            stderr += data.toString();
          },
        },
      });
    } catch (err: unknown) {
      exitCode = 1;
      const message = err instanceof Error ? err.message : String(err);
      stderr += `\nExecution error: ${message}`;
    }

    const durationMs = Date.now() - startTime;
    const passed = exitCode === 0;

    return {
      ecosystem: this.ecosystem,
      toolName: this.toolName,
      toolVersion: options.toolVersion,
      exitCode,
      durationMs,
      stdout,
      stderr,
      passed,
    };
  }

  protected getExecutionPath(): string {
    return this.binaryName;
  }

  protected getLintArgs(options: LintOptions): string[] {
    return ['lint', ...options.args];
  }
}
