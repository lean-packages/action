import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { BaseToolAdapter } from './base';
import { Ecosystem } from '../types';
import { ToolInstallationError } from '../errors';

export class JsToolAdapter extends BaseToolAdapter {
  readonly ecosystem: Ecosystem = 'javascript';
  readonly toolName = 'js-lean';
  readonly repo = 'lean-packages/js-lean';
  readonly manifestDescription = 'package.json';
  readonly binaryName = 'js-lean';

  matchesManifest(files: string[]): boolean {
    return files.includes('package.json');
  }

  async install(version: string): Promise<void> {
    const isAvailable = await this.isBinaryAvailable();
    if (isAvailable && version === 'latest') {
      core.info(`${this.toolName} is already available in PATH.`);
      return;
    }

    const packageSpec = version === 'latest' ? 'js-lean' : `js-lean@${version}`;
    core.info(`Installing ${packageSpec} globally via npm...`);

    const exitCode = await exec.exec('npm', ['install', '-g', packageSpec], {
      ignoreReturnCode: true,
    });

    if (exitCode !== 0) {
      throw new ToolInstallationError(
        this.toolName,
        version,
        `'npm install -g ${packageSpec}' failed with exit code ${exitCode}. Ensure Node.js and npm are available.`,
      );
    }
  }
}
