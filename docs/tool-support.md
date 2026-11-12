# Tool Support Matrix — lean-packages

This document details the support matrix, package ecosystem mappings, distribution channels, and invocation contracts for all tools in the `lean-packages` family supported by `lean-packages/action`.

## Ecosystem Support Matrix

| Ecosystem | Manifest | Tool Name | Package Name / Registry | CLI Binary | Command Contract | Runtime Requirements |
|---|---|---|---|---|---|---|
| **PHP** | `composer.json` | `php-lean` | `stolt/php-lean` ([Packagist](https://packagist.org/packages/stolt/php-lean)) | `php-lean` | `php-lean lint [options]` | PHP 8.2+, Composer |
| **Ruby** | `*.gemspec` | `ruby-lean` | `ruby-lean` ([RubyGems](https://rubygems.org/gems/ruby-lean)) | `ruby-lean` | `ruby-lean lint [options]` | Ruby 2.6+, `gem` |
| **Rust** | `Cargo.toml` | `cargo-lean` | `cargo-lean` ([crates.io](https://crates.io/crates/cargo-lean)) | `cargo-lean` | `cargo-lean lint [options]` | Rust toolchain, `cargo` |
| **Python** | `pyproject.toml` | `py-lean` | `py-lean-package` ([PyPI](https://pypi.org/project/py-lean-package/)) | `py-lean` | `py-lean lint [options]` | Python 3.11+, `pip` / `uv` |
| **JavaScript / TypeScript** | `package.json` | `js-lean` | `js-lean` ([npm](https://www.npmjs.com/package/js-lean)) | `js-lean` | `js-lean lint [options]` | Node.js 20+, `npm` / `npx` |
| **Zig** | `build.zig.zon` | `zig-lean` | `zig-lean` ([crates.io](https://crates.io/crates/zig-lean)) | `zig-lean` | `zig-lean lint [options]` | Rust toolchain (`cargo`), Zig project |

---

## Tool Details & Invocation Contracts

### 1. PHP (`php-lean`)
- **Repository:** `https://github.com/lean-packages/php-lean`
- **Manifest:** `composer.json`
- **Installation:**
  - Pinned version: `composer global require stolt/php-lean:<version>`
  - Latest version: `composer global require stolt/php-lean`
  - Alternative: Dev dependency in project or pre-installed binary.
- **CLI Invocations:** `php-lean lint [directory] [args...]`
- **Exit Codes:**
  - `0`: Success (all repository artefacts are export-ignored according to rules).
  - `1`: Lint findings or validation failure.

### 2. Ruby (`ruby-lean`)
- **Repository:** `https://github.com/lean-packages/ruby-lean`
- **Manifest:** Any `.gemspec` file directly in the target directory.
- **Installation:**
  - Pinned version: `gem install ruby-lean -v <version>`
  - Latest version: `gem install ruby-lean`
- **CLI Invocations:** `ruby-lean lint [args...]`
- **Exit Codes:**
  - `0`: Success (gem archive contents are clean and lean).
  - `1`: Lint findings or packaging errors.

### 3. Rust (`cargo-lean`)
- **Repository:** `https://github.com/lean-packages/cargo-lean`
- **Manifest:** `Cargo.toml`
- **Installation:**
  - Pinned version: `cargo install cargo-lean --version <version> --locked`
  - Latest version: `cargo install cargo-lean --locked`
- **CLI Invocations:** `cargo-lean lint [args...]`
- **Exit Codes:**
  - `0`: Success (`exclude` list is complete and clean).
  - `1`: Lint findings / unexcluded artefacts found.

### 4. Python (`py-lean`)
- **Repository:** `https://github.com/lean-packages/py-lean`
- **Manifest:** `pyproject.toml`
- **Installation:**
  - Pinned version: `pip install py-lean-package==<version>` (or `uv tool install py-lean-package@<version>`)
  - Latest version: `pip install py-lean-package` (or `uv tool install py-lean-package`)
- **CLI Invocations:** `py-lean lint [args...]`
- **Exit Codes:**
  - `0`: Success (`source-exclude` list is complete and clean).
  - `1`: Lint findings / unexcluded files found.

### 5. JavaScript / TypeScript (`js-lean`)
- **Repository:** `https://github.com/lean-packages/js-lean`
- **Manifest:** `package.json`
- **Installation:**
  - Pinned version: `npm install -g js-lean@<version>` (or `npx js-lean@<version>`)
  - Latest version: `npm install -g js-lean` (or `npx js-lean`)
- **CLI Invocations:** `js-lean lint [args...]`
- **Exit Codes:**
  - `0`: Success (package distribution files/tarball contents are clean).
  - `1`: Lint findings detected.

### 6. Zig (`zig-lean`)
- **Repository:** `https://github.com/lean-packages/zig-lean`
- **Manifest:** `build.zig.zon`
- **Installation:**
  - Pinned version: `cargo install zig-lean --version <version> --locked`
  - Latest version: `cargo install zig-lean --locked`
- **CLI Invocations:** `zig-lean lint [args...]`
- **Exit Codes:**
  - `0`: Success (`.paths` in `build.zig.zon` is clean and valid).
  - `1`: Lint findings or validation failure.

---

## Runner & Platform Support

- **Linux (`ubuntu-latest` / `ubuntu-22.04` / `ubuntu-24.04`):** Fully supported across all 6 ecosystems.
- **macOS (`macos-latest` / `macos-14` / `macos-15`):** Supported across all 6 ecosystems where runtimes are installed.
- **Windows (`windows-latest` / `windows-2022`):** Supported across all 6 ecosystems where runtimes are installed.
