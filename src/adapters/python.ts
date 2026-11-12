import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as core from '@actions/core';
import { BaseToolAdapter } from './base';
import { Ecosystem } from '../types';
import { ToolInstallationError } from '../errors';

export class PythonToolAdapter extends BaseToolAdapter {
  readonly ecosystem: Ecosystem = 'python';
  readonly toolName = 'py-lean';
  readonly repo = 'lean-packages/py-lean';
  readonly manifestDescription = 'pyproject.toml';
  readonly binaryName = 'py-lean';

  matchesManifest(files: string[]): boolean {
    return files.includes('pyproject.toml');
  }

  async install(version: string): Promise<void> {
    const isAvailable = await this.isBinaryAvailable();
    if (isAvailable && version === 'latest') {
      core.info(`${this.toolName} is already available in PATH.`);
      return;
    }

    const packageSpec = version === 'latest' ? 'py-lean-package' : `py-lean-package==${version}`;
    core.info(`Installing ${packageSpec}...`);

    let uvPath = '';
    try {
      uvPath = await io.which('uv', false);
    } catch {
      uvPath = '';
    }

    if (uvPath) {
      const uvArgs = ['tool', 'install', packageSpec, '--force'];
      const exitCode = await exec.exec('uv', uvArgs, { ignoreReturnCode: true });
      if (exitCode === 0) {
        return;
      }
    }

    const pipArgs = ['install', packageSpec];
    const pipExitCode = await exec.exec('pip', pipArgs, { ignoreReturnCode: true });
    if (pipExitCode !== 0) {
      throw new ToolInstallationError(
        this.toolName,
        version,
        `Failed to install '${packageSpec}' via pip/uv (exit code ${pipExitCode}). Ensure Python and pip are installed.`,
      );
    }
  }
}
