import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { BaseToolAdapter } from './base';
import { Ecosystem } from '../types';
import { ToolInstallationError } from '../errors';

export class PhpToolAdapter extends BaseToolAdapter {
  readonly ecosystem: Ecosystem = 'php';
  readonly toolName = 'php-lean';
  readonly repo = 'lean-packages/php-lean';
  readonly manifestDescription = 'composer.json';
  readonly binaryName = 'php-lean';

  matchesManifest(files: string[]): boolean {
    return files.includes('composer.json');
  }

  async install(version: string): Promise<void> {
    const isAvailable = await this.isBinaryAvailable();
    if (isAvailable && version === 'latest') {
      core.info(`${this.toolName} is already available in PATH.`);
      return;
    }

    const packageSpec = version === 'latest' ? 'stolt/php-lean' : `stolt/php-lean:${version}`;
    core.info(`Installing ${packageSpec} via Composer...`);

    let binDir = '';
    try {
      await exec.exec('composer', ['global', 'config', 'bin-dir', '--absolute'], {
        listeners: {
          stdout: (data: Buffer) => {
            binDir += data.toString().trim();
          },
        },
        silent: true,
      });
      if (binDir) {
        core.addPath(binDir);
      }
    } catch {
      // Ignore if composer config fails
    }

    const exitCode = await exec.exec(
      'composer',
      ['global', 'require', packageSpec, '--no-interaction', '--prefer-dist'],
      { ignoreReturnCode: true },
    );

    if (exitCode !== 0) {
      throw new ToolInstallationError(
        this.toolName,
        version,
        `'composer global require ${packageSpec}' failed with exit code ${exitCode}. Ensure Composer and PHP are installed.`,
      );
    }
  }
}
