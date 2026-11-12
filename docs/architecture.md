# Architecture Decision — lean-packages/action

## Overview

`lean-packages/action` is implemented as a JavaScript/TypeScript GitHub Action running on the official `node20` Actions runtime.

## Rationale for JavaScript Action over Composite Action

1. **Deterministic Orchestration:** A JavaScript Action provides robust parsing, ecosystem detection, input validation, and execution control across diverse environments without depending on shell nuances (e.g. bash vs. powershell vs. zsh) across Linux, macOS, and Windows runners.
2. **Safe Argument and Process Execution:** Using `@actions/exec` allows spawning child processes with discrete argument arrays without shell interpolation or risk of shell injection.
3. **Structured Reporting & Job Summaries:** The Action uses `@actions/core.summary` to construct consistent Markdown job summaries and manage step outputs reliably.
4. **Self-Contained Runtime:** By compiling TypeScript source into a bundled, single-file distribution (`dist/index.js`), the Action executes out of the box on GitHub Actions runners without requiring users to pre-install dependencies for the Action itself.

## Directory Structure

```text
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── action.yml
├── docs/
│   ├── architecture.md
│   └── tool-support.md
├── src/
│   ├── adapters/
│   │   ├── base.ts
│   │   ├── cargo.ts
│   │   ├── js.ts
│   │   ├── php.ts
│   │   ├── python.ts
│   │   ├── ruby.ts
│   │   └── zig.ts
│   ├── detection.ts
│   ├── errors.ts
│   ├── executor.ts
│   ├── index.ts
│   ├── summary.ts
│   ├── types.ts
│   └── versions.ts
├── tests/
│   ├── fixtures/
│   │   ├── javascript/
│   │   ├── php/
│   │   ├── python/
│   │   ├── ruby/
│   │   ├── rust/
│   │   └── zig/
│   ├── unit/
│   │   ├── adapters.test.ts
│   │   ├── detection.test.ts
│   │   ├── executor.test.ts
│   │   ├── summary.test.ts
│   │   └── versions.test.ts
├── dist/
│   └── index.js
├── package.json
└── tsconfig.json
```

## Tool Adapter Contract

Every ecosystem adapter implements the `ToolAdapter` interface:

- `ecosystem`: The unique ecosystem identifier (`php`, `rust`, `ruby`, `python`, `javascript`, `zig`).
- `toolName`: The CLI tool name (`php-lean`, `cargo-lean`, `ruby-lean`, `py-lean`, `js-lean`, `zig-lean`).
- `manifestName`: The primary manifest file name (or pattern).
- `matchesManifest(files: string[]): boolean`: Determines if the directory contains the ecosystem manifest.
- `resolveVersion(requested: string, token?: string): Promise<string>`: Resolves `latest` or validates pinned versions.
- `install(version: string, token?: string): Promise<void>`: Ensures the tool is available in PATH or installs it.
- `executeLint(options: LintOptions): Promise<ExecutionResult>`: Executes the native tool's `lint` command and captures the output, exit code, and execution duration.
