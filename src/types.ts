export type Ecosystem = 'php' | 'ruby' | 'rust' | 'python' | 'javascript' | 'zig';

export const SUPPORTED_ECOSYSTEMS: readonly Ecosystem[] = [
  'php',
  'ruby',
  'rust',
  'python',
  'javascript',
  'zig',
] as const;

export interface ActionInputs {
  ecosystem: string;
  path: string;
  command: string;
  phpVersion: string;
  rubyVersion: string;
  rustVersion: string;
  pythonVersion: string;
  javascriptVersion: string;
  zigVersion: string;
  args: string[];
  githubToken: string;
}

export interface LintOptions {
  workingDirectory: string;
  args: string[];
  toolVersion: string;
  githubToken?: string;
}

export interface ExecutionResult {
  ecosystem: Ecosystem;
  toolName: string;
  toolVersion: string;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  passed: boolean;
  error?: Error;
}

export interface ToolAdapter {
  readonly ecosystem: Ecosystem;
  readonly toolName: string;
  readonly manifestDescription: string;
  matchesManifest(files: string[]): boolean;
  resolveVersion(requestedVersion: string, githubToken?: string): Promise<string>;
  install(version: string, githubToken?: string): Promise<void>;
  executeLint(options: LintOptions): Promise<ExecutionResult>;
}
