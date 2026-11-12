export class ActionError extends Error {
  constructor(
    message: string,
    public readonly remediation?: string,
  ) {
    super(message);
    this.name = 'ActionError';
  }

  public override toString(): string {
    if (this.remediation) {
      return `${this.message}\n\nRemediation:\n${this.remediation}`;
    }
    return this.message;
  }
}

export class ManifestNotFoundError extends ActionError {
  constructor(ecosystem: string, path: string, expectedManifest: string) {
    super(
      `No ${expectedManifest} found in '${path}' for explicitly selected ecosystem '${ecosystem}'.`,
      `Ensure '${path}' contains a valid ${expectedManifest} manifest or select 'ecosystem: auto'.`,
    );
    this.name = 'ManifestNotFoundError';
  }
}

export class NoEcosystemDetectedError extends ActionError {
  constructor(path: string, checkedManifests: string[]) {
    super(
      `No supported package manifest was found in '${path}'. Checked manifests: ${checkedManifests.join(', ')}.`,
      `Verify the 'path' input points to the directory containing your package manifest (e.g. composer.json, Cargo.toml, *.gemspec, pyproject.toml, package.json, build.zig.zon).`,
    );
    this.name = 'NoEcosystemDetectedError';
  }
}

export class UnsupportedEcosystemError extends ActionError {
  constructor(ecosystem: string, supported: readonly string[]) {
    super(
      `Unsupported ecosystem '${ecosystem}'.`,
      `Supported ecosystem options are: 'auto', ${supported.map((s) => `'${s}'`).join(', ')}.`,
    );
    this.name = 'UnsupportedEcosystemError';
  }
}

export class UnsupportedCommandError extends ActionError {
  constructor(command: string) {
    super(
      `Unsupported command '${command}'.`,
      `v1 supports 'command: lint' only.`,
    );
    this.name = 'UnsupportedCommandError';
  }
}

export class PathNotFoundError extends ActionError {
  constructor(path: string) {
    super(
      `Project path '${path}' does not exist or is not a directory.`,
      `Check your checkout step and verify the 'path' input points to an existing directory.`,
    );
    this.name = 'PathNotFoundError';
  }
}

export class ToolInstallationError extends ActionError {
  constructor(toolName: string, version: string, reason: string) {
    super(
      `Failed to install ${toolName} version '${version}': ${reason}`,
      `Verify network connectivity, runner package manager availability, and that version '${version}' exists.`,
    );
    this.name = 'ToolInstallationError';
  }
}

export class ToolVersionResolutionError extends ActionError {
  constructor(toolName: string, version: string, reason: string) {
    super(
      `Failed to resolve version '${version}' for ${toolName}: ${reason}`,
      `Ensure '${version}' is a valid release or use 'latest'. If using GitHub API, check rate limits or supply 'github-token'.`,
    );
    this.name = 'ToolVersionResolutionError';
  }
}
