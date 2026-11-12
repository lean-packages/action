# Changelog

All notable changes to `lean-packages/action` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-13

### Added
- Initial release of `lean-packages/action`.
- Automated detection and native lint orchestration for 6 package ecosystems:
  - PHP (`composer.json`) via `php-lean`
  - Ruby (`*.gemspec`) via `ruby-lean`
  - Rust (`Cargo.toml`) via `cargo-lean`
  - Python (`pyproject.toml`) via `py-lean` (`py-lean-package`)
  - JavaScript / TypeScript (`package.json`) via `js-lean`
  - Zig (`build.zig.zon`) via `zig-lean`
- Support for `ecosystem: auto` and explicit ecosystem targeting.
- Independent version pinning for all tool adapters.
- Safe argument forwarding to native `lint` commands.
- Markdown job summary reporting via `$GITHUB_STEP_SUMMARY`.
- Action outputs: `detected-ecosystems` and `tool-versions`.
- Comprehensive test suite and fixtures for all ecosystems.
