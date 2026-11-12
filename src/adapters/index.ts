import { Ecosystem, ToolAdapter } from '../types';
import { PhpToolAdapter } from './php';
import { RubyToolAdapter } from './ruby';
import { CargoToolAdapter } from './cargo';
import { PythonToolAdapter } from './python';
import { JsToolAdapter } from './js';
import { ZigToolAdapter } from './zig';

export * from './base';
export * from './php';
export * from './ruby';
export * from './cargo';
export * from './python';
export * from './js';
export * from './zig';

export function createAdapterMap(): Record<Ecosystem, ToolAdapter> {
  return {
    php: new PhpToolAdapter(),
    ruby: new RubyToolAdapter(),
    rust: new CargoToolAdapter(),
    python: new PythonToolAdapter(),
    javascript: new JsToolAdapter(),
    zig: new ZigToolAdapter(),
  };
}
