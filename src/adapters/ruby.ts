import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { BaseToolAdapter } from './base';
import { Ecosystem } from '../types';
import { ToolInstallationError } from '../errors';

export class RubyToolAdapter extends BaseToolAdapter {
  readonly ecosystem: Ecosystem = 'ruby';
  readonly toolName = 'ruby-lean';
  readonly repo = 'lean-packages/ruby-lean';
  readonly manifestDescription = '*.gemspec';
  readonly binaryName = 'ruby-lean';

  matchesManifest(files: string[]): boolean {
    return files.some((f) => f.endsWith('.gemspec'));
  }

  async install(version: string): Promise<void> {
    const isAvailable = await this.isBinaryAvailable();
    if (isAvailable && version === 'latest') {
      core.info(`${this.toolName} is already available in PATH.`);
      return;
    }

    const installArgs = ['install', 'ruby-lean', '--no-document'];
    if (version !== 'latest') {
      installArgs.push('-v', version);
    }

    core.info(`Installing ruby-lean (${version}) via gem...`);
    const exitCode = await exec.exec('gem', installArgs, {
      ignoreReturnCode: true,
    });

    if (exitCode !== 0) {
      throw new ToolInstallationError(
        this.toolName,
        version,
        `'gem ${installArgs.join(' ')}' failed with exit code ${exitCode}. Ensure Ruby and gem are installed.`,
      );
    }
  }
}
