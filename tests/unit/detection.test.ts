import { describe, it, expect } from 'vitest';
import * as path from 'path';
import {
  detectEcosystemsFromFiles,
  detectEcosystemsInDirectory,
  ECOSYSTEM_ORDER,
  getCheckedManifestsList,
} from '../../src/detection';
import {
  ManifestNotFoundError,
  NoEcosystemDetectedError,
  PathNotFoundError,
  UnsupportedEcosystemError,
} from '../../src/errors';

describe('Manifest Detection', () => {
  it('detects PHP when composer.json is present', () => {
    const result = detectEcosystemsFromFiles(['composer.json', 'src']);
    expect(result).toEqual(['php']);
  });

  it('detects Ruby when *.gemspec is present', () => {
    const result = detectEcosystemsFromFiles(['my_gem.gemspec', 'lib']);
    expect(result).toEqual(['ruby']);
  });

  it('detects Rust when Cargo.toml is present', () => {
    const result = detectEcosystemsFromFiles(['Cargo.toml', 'src']);
    expect(result).toEqual(['rust']);
  });

  it('detects Python when pyproject.toml is present', () => {
    const result = detectEcosystemsFromFiles(['pyproject.toml', 'src']);
    expect(result).toEqual(['python']);
  });

  it('detects JavaScript when package.json is present', () => {
    const result = detectEcosystemsFromFiles(['package.json', 'dist']);
    expect(result).toEqual(['javascript']);
  });

  it('detects Zig when build.zig.zon is present', () => {
    const result = detectEcosystemsFromFiles(['build.zig.zon', 'src']);
    expect(result).toEqual(['zig']);
  });

  it('detects multiple ecosystems in deterministic documented order', () => {
    const files = [
      'build.zig.zon',
      'package.json',
      'Cargo.toml',
      'composer.json',
      'foo.gemspec',
      'pyproject.toml',
    ];
    const result = detectEcosystemsFromFiles(files, 'auto');
    expect(result).toEqual(['php', 'ruby', 'rust', 'python', 'javascript', 'zig']);
  });

  it('does not detect JavaScript from lockfiles alone', () => {
    const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    expect(() => detectEcosystemsFromFiles(lockfiles, 'auto')).toThrow(
      NoEcosystemDetectedError,
    );
  });

  it('does not detect Rust from Cargo.lock alone', () => {
    const lockfiles = ['Cargo.lock'];
    expect(() => detectEcosystemsFromFiles(lockfiles, 'auto')).toThrow(
      NoEcosystemDetectedError,
    );
  });

  it('throws NoEcosystemDetectedError when no manifest is present', () => {
    expect(() => detectEcosystemsFromFiles(['README.md', 'LICENSE'])).toThrow(
      NoEcosystemDetectedError,
    );
  });

  it('returns explicit ecosystem when its manifest exists', () => {
    const files = ['Cargo.toml', 'package.json'];
    const result = detectEcosystemsFromFiles(files, 'rust');
    expect(result).toEqual(['rust']);
  });

  it('throws ManifestNotFoundError when explicit ecosystem manifest is missing', () => {
    const files = ['package.json'];
    expect(() => detectEcosystemsFromFiles(files, 'rust', './custom-path')).toThrow(
      ManifestNotFoundError,
    );
  });

  it('throws UnsupportedEcosystemError for unknown ecosystem', () => {
    const files = ['package.json'];
    expect(() => detectEcosystemsFromFiles(files, 'golang')).toThrow(
      UnsupportedEcosystemError,
    );
  });

  it('lists checked manifests in error message', () => {
    const list = getCheckedManifestsList();
    expect(list).toContain('composer.json');
    expect(list).toContain('*.gemspec');
    expect(list).toContain('Cargo.toml');
    expect(list).toContain('pyproject.toml');
    expect(list).toContain('package.json');
    expect(list).toContain('build.zig.zon');
  });

  it('detects ecosystems from fixture directory', () => {
    const phpDir = path.resolve(__dirname, '../fixtures/php/valid');
    const result = detectEcosystemsInDirectory(phpDir, 'auto');
    expect(result).toEqual(['php']);
  });

  it('throws PathNotFoundError for non-existent directory', () => {
    expect(() => detectEcosystemsInDirectory('/non/existent/path')).toThrow(
      PathNotFoundError,
    );
  });
});
