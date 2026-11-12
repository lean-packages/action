import * as fs from 'fs';
import * as path from 'path';
import {
  Ecosystem,
  SUPPORTED_ECOSYSTEMS,
} from './types';
import {
  ManifestNotFoundError,
  NoEcosystemDetectedError,
  PathNotFoundError,
  UnsupportedEcosystemError,
} from './errors';

export interface ManifestDetector {
  ecosystem: Ecosystem;
  manifestDescription: string;
  matches(files: string[]): boolean;
}

export const ECOSYSTEM_ORDER: readonly Ecosystem[] = [
  'php',
  'ruby',
  'rust',
  'python',
  'javascript',
  'zig',
] as const;

export const DETECTORS: Record<Ecosystem, ManifestDetector> = {
  php: {
    ecosystem: 'php',
    manifestDescription: 'composer.json',
    matches: (files: string[]) => files.includes('composer.json'),
  },
  ruby: {
    ecosystem: 'ruby',
    manifestDescription: '*.gemspec',
    matches: (files: string[]) => files.some((f) => f.endsWith('.gemspec')),
  },
  rust: {
    ecosystem: 'rust',
    manifestDescription: 'Cargo.toml',
    matches: (files: string[]) => files.includes('Cargo.toml'),
  },
  python: {
    ecosystem: 'python',
    manifestDescription: 'pyproject.toml',
    matches: (files: string[]) => files.includes('pyproject.toml'),
  },
  javascript: {
    ecosystem: 'javascript',
    manifestDescription: 'package.json',
    matches: (files: string[]) => files.includes('package.json'),
  },
  zig: {
    ecosystem: 'zig',
    manifestDescription: 'build.zig.zon',
    matches: (files: string[]) => files.includes('build.zig.zon'),
  },
};

export function getCheckedManifestsList(): string[] {
  return ECOSYSTEM_ORDER.map((eco) => DETECTORS[eco].manifestDescription);
}

export function detectEcosystemsInDirectory(
  targetPath: string,
  explicitEcosystem?: string,
): Ecosystem[] {
  if (!fs.existsSync(targetPath)) {
    throw new PathNotFoundError(targetPath);
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    throw new PathNotFoundError(targetPath);
  }

  const entries = fs.readdirSync(targetPath);
  return detectEcosystemsFromFiles(entries, explicitEcosystem, targetPath);
}

export function detectEcosystemsFromFiles(
  files: string[],
  explicitEcosystem: string = 'auto',
  targetPath: string = '.',
): Ecosystem[] {
  const normalizedEco = explicitEcosystem.trim().toLowerCase();

  if (normalizedEco !== 'auto') {
    if (!SUPPORTED_ECOSYSTEMS.includes(normalizedEco as Ecosystem)) {
      throw new UnsupportedEcosystemError(normalizedEco, SUPPORTED_ECOSYSTEMS);
    }

    const eco = normalizedEco as Ecosystem;
    const detector = DETECTORS[eco];
    if (!detector.matches(files)) {
      throw new ManifestNotFoundError(eco, targetPath, detector.manifestDescription);
    }
    return [eco];
  }

  const detected: Ecosystem[] = [];
  for (const eco of ECOSYSTEM_ORDER) {
    if (DETECTORS[eco].matches(files)) {
      detected.push(eco);
    }
  }

  if (detected.length === 0) {
    throw new NoEcosystemDetectedError(targetPath, getCheckedManifestsList());
  }

  return detected;
}
