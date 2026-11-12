import * as path from 'path';
import * as os from 'os';
import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { BaseToolAdapter } from './base';
import { Ecosystem } from '../types';
import { ToolInstallationError } from '../errors';

export class ZigToolAdapter extends BaseToolAdapter {
  readonly ecosystem: Ecosystem = 'zig';
  readonly toolName = 'zig-lean';
  readonly repo = 'lean-packages/zig-lean';
  readonly manifestDescription = 'build.zig.zon';
  readonly binaryName = 'zig-lean';

  matchesManifest(files: string[]): boolean {
    return files.includes('build.zig.zon');
  }

  async install(version: string): Promise<void> {
    const cargoBin = path.join(os.homedir(), '.cargo', 'bin');
    core.addPath(cargoBin);

    const isAvailable = await this.isBinaryAvailable();
    if (isAvailable && version === 'latest') {
      core.info(`${this.toolName} is already available in PATH.`);
      return;
    }

    const installArgs = ['install', 'zig-lean', '--locked'];
    if (version !== 'latest') {
      installArgs.push('--version', version);
    }

    core.info(`Installing zig-lean (${version}) via cargo...`);
    const exitCode = await exec.exec('cargo', installArgs, {
      ignoreReturnCode: true,
    });

    if (exitCode !== 0) {
      throw new ToolInstallationError(
        this.toolName,
        version,
        `'cargo ${installArgs.join(' ')}' failed with exit code ${exitCode}. Ensure the Rust toolchain (cargo) is installed to compile zig-lean.`,
      );
    }
  }
}
