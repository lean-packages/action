import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PhpToolAdapter,
  RubyToolAdapter,
  CargoToolAdapter,
  PythonToolAdapter,
  JsToolAdapter,
  ZigToolAdapter,
  createAdapterMap,
} from '../../src/adapters';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

describe('Tool Adapters', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createAdapterMap', () => {
    it('creates all six supported adapters', () => {
      const map = createAdapterMap();
      expect(Object.keys(map)).toEqual([
        'php',
        'ruby',
        'rust',
        'python',
        'javascript',
        'zig',
      ]);
      expect(map.php).toBeInstanceOf(PhpToolAdapter);
      expect(map.ruby).toBeInstanceOf(RubyToolAdapter);
      expect(map.rust).toBeInstanceOf(CargoToolAdapter);
      expect(map.python).toBeInstanceOf(PythonToolAdapter);
      expect(map.javascript).toBeInstanceOf(JsToolAdapter);
      expect(map.zig).toBeInstanceOf(ZigToolAdapter);
    });
  });

  describe('PhpToolAdapter', () => {
    const adapter = new PhpToolAdapter();

    it('matches composer.json', () => {
      expect(adapter.matchesManifest(['composer.json', 'src'])).toBe(true);
      expect(adapter.matchesManifest(['package.json'])).toBe(false);
    });

    it('installs via composer when binary is not in PATH', async () => {
      vi.spyOn(io, 'which').mockResolvedValue('');
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.9.3');
      expect(execSpy).toHaveBeenCalledWith(
        'composer',
        ['global', 'require', 'stolt/php-lean:0.9.3', '--no-interaction', '--prefer-dist'],
        expect.any(Object),
      );
    });
  });

  describe('RubyToolAdapter', () => {
    const adapter = new RubyToolAdapter();

    it('matches *.gemspec', () => {
      expect(adapter.matchesManifest(['ruby-lean.gemspec', 'lib'])).toBe(true);
      expect(adapter.matchesManifest(['Cargo.toml'])).toBe(false);
    });

    it('installs via gem with version', async () => {
      vi.spyOn(io, 'which').mockResolvedValue('');
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.1.0');
      expect(execSpy).toHaveBeenCalledWith(
        'gem',
        ['install', 'ruby-lean', '--no-document', '-v', '0.1.0'],
        expect.any(Object),
      );
    });
  });

  describe('CargoToolAdapter', () => {
    const adapter = new CargoToolAdapter();

    it('matches Cargo.toml', () => {
      expect(adapter.matchesManifest(['Cargo.toml', 'src'])).toBe(true);
      expect(adapter.matchesManifest(['package.json'])).toBe(false);
    });

    it('installs via cargo with version', async () => {
      vi.spyOn(io, 'which').mockResolvedValue('');
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.4.2');
      expect(execSpy).toHaveBeenCalledWith(
        'cargo',
        ['install', 'cargo-lean', '--locked', '--version', '0.4.2'],
        expect.any(Object),
      );
    });
  });

  describe('PythonToolAdapter', () => {
    const adapter = new PythonToolAdapter();

    it('matches pyproject.toml', () => {
      expect(adapter.matchesManifest(['pyproject.toml', 'src'])).toBe(true);
      expect(adapter.matchesManifest(['package.json'])).toBe(false);
    });

    it('installs via uv tool if available', async () => {
      vi.spyOn(io, 'which').mockImplementation(async (tool: string) => {
        if (tool === 'uv') return '/usr/bin/uv';
        return '';
      });
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.2.5');
      expect(execSpy).toHaveBeenCalledWith(
        'uv',
        ['tool', 'install', 'py-lean-package==0.2.5', '--force'],
        expect.any(Object),
      );
    });

    it('installs via pip if uv is not available', async () => {
      vi.spyOn(io, 'which').mockResolvedValue('');
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.2.5');
      expect(execSpy).toHaveBeenCalledWith(
        'pip',
        ['install', 'py-lean-package==0.2.5'],
        expect.any(Object),
      );
    });
  });

  describe('JsToolAdapter', () => {
    const adapter = new JsToolAdapter();

    it('matches package.json', () => {
      expect(adapter.matchesManifest(['package.json'])).toBe(true);
      expect(adapter.matchesManifest(['composer.json'])).toBe(false);
    });

    it('installs via npm install -g', async () => {
      vi.spyOn(io, 'which').mockResolvedValue('');
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.1.1');
      expect(execSpy).toHaveBeenCalledWith(
        'npm',
        ['install', '-g', 'js-lean@0.1.1'],
        expect.any(Object),
      );
    });
  });

  describe('ZigToolAdapter', () => {
    const adapter = new ZigToolAdapter();

    it('matches build.zig.zon', () => {
      expect(adapter.matchesManifest(['build.zig.zon', 'src'])).toBe(true);
      expect(adapter.matchesManifest(['Cargo.toml'])).toBe(false);
    });

    it('installs via cargo', async () => {
      vi.spyOn(io, 'which').mockResolvedValue('');
      const execSpy = vi.spyOn(exec, 'exec').mockResolvedValue(0);

      await adapter.install('0.1.0');
      expect(execSpy).toHaveBeenCalledWith(
        'cargo',
        ['install', 'zig-lean', '--locked', '--version', '0.1.0'],
        expect.any(Object),
      );
    });
  });
});
