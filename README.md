# lean-packages Action

A unified GitHub Action for linting package distribution contents across PHP, Ruby, Rust, Python, JavaScript/TypeScript, and Zig using the native [lean-packages](https://github.com/lean-packages) tool family.

## Why?

Package distribution archives frequently bundle unnecessary development artifacts—such as test fixtures, CI workflows, development scripts, internal documentation, and IDE metadata. These inflate archive download sizes, slow down dependency installation, and expose internal configuration.

`lean-packages/action` automatically detects the package ecosystem in your repository or subproject, ensures the appropriate native linter is installed, and invokes its native `lint` command to keep your release archives lean.

---

## Supported Ecosystems & Tools

| Ecosystem | Manifest | Native Tool | Registry / Package | CLI Binary |
|---|---|---|---|---|
| **PHP** | `composer.json` | [php-lean](https://github.com/lean-packages/php-lean) | `stolt/php-lean` (Packagist) | `php-lean` |
| **Ruby** | `*.gemspec` | [ruby-lean](https://github.com/lean-packages/ruby-lean) | `ruby-lean` (RubyGems) | `ruby-lean` |
| **Rust** | `Cargo.toml` | [cargo-lean](https://github.com/lean-packages/cargo-lean) | `cargo-lean` (crates.io) | `cargo-lean` |
| **Python** | `pyproject.toml` | [py-lean](https://github.com/lean-packages/py-lean) | `py-lean-package` (PyPI) | `py-lean` |
| **JavaScript / TypeScript** | `package.json` | [js-lean](https://github.com/lean-packages/js-lean) | `js-lean` (npm) | `js-lean` |
| **Zig** | `build.zig.zon` | [zig-lean](https://github.com/lean-packages/zig-lean) | `zig-lean` (crates.io) | `zig-lean` |

---

## Quick Start

Add the following step to your GitHub Actions workflow:

```yaml
name: Package Distribution Lint

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Lint package distribution
        uses: lean-packages/action@v1
```

---

## Usage Examples

### Explicit Ecosystem Selection

By default, the Action runs in `ecosystem: auto` mode and detects any supported manifests present directly in `path`. You can restrict execution to a specific ecosystem:

```yaml
- name: Lint Rust Package
  uses: lean-packages/action@v1
  with:
    ecosystem: rust
    path: .
    rust-version: latest
```

### Monorepo / Subdirectory Projects

For monorepos, invoke the Action separately for each project directory:

```yaml
jobs:
  lint-services:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Lint Backend (PHP)
        uses: lean-packages/action@v1
        with:
          path: backend

      - name: Lint Frontend (JavaScript)
        uses: lean-packages/action@v1
        with:
          path: frontend
```

### Passing Custom Arguments to Native Linters

Forward flags and arguments directly to each native tool's `lint` command:

```yaml
- name: Lint with strict order
  uses: lean-packages/action@v1
  with:
    args: '--diff'
```

---

## Action Inputs

| Input | Required | Default | Description |
|---|---:|---|---|
| `ecosystem` | No | `auto` | Package ecosystem to lint (`auto`, `php`, `ruby`, `rust`, `python`, `javascript`, or `zig`). |
| `path` | No | `.` | Project directory to inspect and use as the working directory. |
| `command` | No | `lint` | Native tool command to execute (v1 accepts `lint` only). |
| `php-version` | No | `latest` | Version of `php-lean` to install. |
| `ruby-version` | No | `latest` | Version of `ruby-lean` to install. |
| `rust-version` | No | `latest` | Version of `cargo-lean` to install. |
| `python-version` | No | `latest` | Version of `py-lean` to install. |
| `javascript-version` | No | `latest` | Version of `js-lean` to install. |
| `zig-version` | No | `latest` | Version of `zig-lean` to install. |
| `args` | No | _empty_ | Additional arguments forwarded to each native `lint` command. |
| `github-token` | No | `${{ github.token }}` | GitHub token for API rate-limit handling and release queries. |

---

## Action Outputs

| Output | Description |
|---|---|
| `detected-ecosystems` | Comma-separated list of detected or executed ecosystems (e.g. `rust,javascript`). |
| `tool-versions` | JSON string mapping each executed ecosystem to its resolved tool version (e.g. `{"rust": "0.4.2"}`). |

---

## Auto-Detection & Multi-Manifest Behavior

- In `ecosystem: auto` mode, the Action looks for supported manifests located directly in `path`.
- Child directories are not searched recursively.
- If multiple supported manifests exist in the same directory, all corresponding tools run in deterministic order: PHP (`composer.json`) &rarr; Ruby (`*.gemspec`) &rarr; Rust (`Cargo.toml`) &rarr; Python (`pyproject.toml`) &rarr; JavaScript (`package.json`) &rarr; Zig (`build.zig.zon`).
- If no supported manifest is found, the Action fails with an informative error listing all checked manifest patterns.
- If any tool reports lint findings (non-zero exit code), the Action continues checking the remaining detected ecosystems and fails the job at completion.

---

## Supported Runner Platforms

The Action runs on GitHub Actions runners using the `node20` runtime across:
- **Linux** (`ubuntu-latest`, `ubuntu-24.04`, `ubuntu-22.04`)
- **macOS** (`macos-latest`, `macos-14`, `macos-15`)
- **Windows** (`windows-latest`, `windows-2022`)

---

## License

This project is licensed under the [MIT License](LICENSE.md).
