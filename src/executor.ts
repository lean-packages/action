import * as path from 'path';
import * as fs from 'fs';
import * as core from '@actions/core';
import {
  ActionInputs,
  Ecosystem,
  ExecutionResult,
  LintOptions,
  ToolAdapter,
} from './types';
import {
  ActionError,
  PathNotFoundError,
  UnsupportedCommandError,
} from './errors';
import { detectEcosystemsInDirectory } from './detection';
import { createAdapterMap } from './adapters';
import { writeJobSummary } from './summary';

export function parseArguments(argsString: string): string[] {
  if (!argsString || !argsString.trim()) {
    return [];
  }

  const result: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(argsString)) !== null) {
    if (match[1] !== undefined) {
      result.push(match[1]);
    } else if (match[2] !== undefined) {
      result.push(match[2]);
    } else {
      result.push(match[0]);
    }
  }

  return result;
}

export function parseInputs(): ActionInputs {
  const ecosystem = core.getInput('ecosystem') || 'auto';
  const targetPath = core.getInput('path') || '.';
  const command = core.getInput('command') || 'lint';
  const phpVersion = core.getInput('php-version') || 'latest';
  const rubyVersion = core.getInput('ruby-version') || 'latest';
  const rustVersion = core.getInput('rust-version') || 'latest';
  const pythonVersion = core.getInput('python-version') || 'latest';
  const javascriptVersion = core.getInput('javascript-version') || 'latest';
  const zigVersion = core.getInput('zig-version') || 'latest';
  const rawArgs = core.getInput('args') || '';
  const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN || '';

  return {
    ecosystem,
    path: targetPath,
    command,
    phpVersion,
    rubyVersion,
    rustVersion,
    pythonVersion,
    javascriptVersion,
    zigVersion,
    args: parseArguments(rawArgs),
    githubToken,
  };
}

export function getRequestedVersionForEcosystem(
  ecosystem: Ecosystem,
  inputs: ActionInputs,
): string {
  switch (ecosystem) {
    case 'php':
      return inputs.phpVersion;
    case 'ruby':
      return inputs.rubyVersion;
    case 'rust':
      return inputs.rustVersion;
    case 'python':
      return inputs.pythonVersion;
    case 'javascript':
      return inputs.javascriptVersion;
    case 'zig':
      return inputs.zigVersion;
  }
}

export async function runAction(
  inputs: ActionInputs,
  adapters: Record<Ecosystem, ToolAdapter> = createAdapterMap(),
): Promise<ExecutionResult[]> {
  if (inputs.command.trim().toLowerCase() !== 'lint') {
    throw new UnsupportedCommandError(inputs.command);
  }

  const resolvedPath = path.resolve(process.cwd(), inputs.path);
  if (!fs.existsSync(resolvedPath)) {
    throw new PathNotFoundError(inputs.path);
  }

  core.info(`Detecting package manifests in: ${resolvedPath}`);
  const detectedEcosystems = detectEcosystemsInDirectory(resolvedPath, inputs.ecosystem);

  core.info(`Selected ecosystems: ${detectedEcosystems.join(', ')}`);
  core.setOutput('detected-ecosystems', detectedEcosystems.join(','));

  const results: ExecutionResult[] = [];
  const versionMap: Record<string, string> = {};

  for (const eco of detectedEcosystems) {
    const adapter = adapters[eco];
    const requestedVersion = getRequestedVersionForEcosystem(eco, inputs);

    core.startGroup(`Linting ${adapter.toolName} (${eco})`);
    try {
      const resolvedVersion = await adapter.resolveVersion(requestedVersion, inputs.githubToken);
      versionMap[eco] = resolvedVersion;
      core.info(`Resolved ${adapter.toolName} version: ${resolvedVersion}`);

      await adapter.install(resolvedVersion, inputs.githubToken);

      const lintOptions: LintOptions = {
        workingDirectory: resolvedPath,
        args: inputs.args,
        toolVersion: resolvedVersion,
        githubToken: inputs.githubToken,
      };

      const result = await adapter.executeLint(lintOptions);
      results.push(result);

      if (result.passed) {
        core.info(`✅ ${adapter.toolName} lint passed in ${result.durationMs}ms`);
      } else {
        core.error(`❌ ${adapter.toolName} lint failed with exit code ${result.exitCode}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      core.error(`Failed executing ${adapter.toolName}: ${message}`);
      results.push({
        ecosystem: eco,
        toolName: adapter.toolName,
        toolVersion: requestedVersion,
        exitCode: 1,
        durationMs: 0,
        stdout: '',
        stderr: message,
        passed: false,
        error: err instanceof Error ? err : new Error(message),
      });
    } finally {
      core.endGroup();
    }
  }

  core.setOutput('tool-versions', JSON.stringify(versionMap));
  await writeJobSummary(results);

  const hasFailures = results.some((r) => !r.passed);
  if (hasFailures) {
    const failedNames = results.filter((r) => !r.passed).map((r) => r.toolName);
    throw new ActionError(`Package lint failed for: ${failedNames.join(', ')}.`);
  }

  return results;
}
