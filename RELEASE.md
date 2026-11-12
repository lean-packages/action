# Release Workflow — lean-packages/action

This document outlines the standard release process for `lean-packages/action`. Following these steps ensures deterministic builds, prevents stale distribution bundles, maintains clear semantic versioning, and provides reliable major version pointers (e.g., `v1`) for downstream GitHub Actions workflows.

---

## 1. Prerequisites

Before starting a release, ensure you have:
- Node.js 20+ and npm installed.
- Push access to `lean-packages/action`.
- GitHub CLI (`gh`) installed and authenticated (`gh auth status`).
- A clean Git working tree on the `main` branch.

---

## 2. Pre-Release Verification

1. **Switch to `main` and sync with upstream:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Verify dependencies and run full checks:**
   ```bash
   npm ci
   npm run check
   ```
   This command executes:
   - TypeScript compilation and type checks (`tsc --noEmit`).
   - Vitest test suite (`vitest run`).
   - Distribution bundle generation (`tsup` compiling `src/index.ts` to `dist/index.js`).

3. **Ensure `dist/index.js` is committed:**
   GitHub Actions executes the compiled bundle in `dist/index.js`. Verify that `dist/index.js` has no unstaged diffs:
   ```bash
   git status
   ```
   If `dist/index.js` was updated by the build, stage it before proceeding.

---

## 3. Versioning & Changelog

1. **Determine the target version:**
   Follow [Semantic Versioning (SemVer)](https://semver.org/):
   - `MAJOR` (`v2.0.0`): Breaking changes in action inputs, outputs, or default behavior.
   - `MINOR` (`v1.1.0`): New features, new ecosystem adapters, or backward-compatible inputs/outputs.
   - `PATCH` (`v1.0.1`): Bug fixes, error messaging improvements, or dependency updates.

2. **Update `package.json`:**
   Update the `"version"` field in `package.json` (or use `npm version --no-git-tag-version <version>`).

3. **Update `CHANGELOG.md`:**
   - Move relevant items from `[Unreleased]` to a new version section: `## [X.Y.Z] - YYYY-MM-DD`.
   - Ensure added features, fixes, and ecosystem changes are documented clearly.

---

## 4. Release Commit & Git Tags

1. **Commit release changes:**
   ```bash
   git add package.json package-lock.json CHANGELOG.md dist/index.js
   git commit -m "chore(release): vX.Y.Z"
   ```

2. **Create semantic version tag:**
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   ```

3. **Update the major version pointer (e.g. `v1`):**
   GitHub Actions users typically reference the major tag (e.g. `uses: lean-packages/action@v1`). Move or create the major tag pointing to the new release commit:
   ```bash
   git tag -fa v1 -m "Update v1 tag to vX.Y.Z"
   ```

---

## 5. Publish to GitHub

1. **Push commit and tags to GitHub:**
   ```bash
   git push origin main
   git push origin vX.Y.Z
   git push origin v1 --force
   ```

2. **Create the GitHub Release:**
   Use GitHub CLI to create the release with extracted changelog notes:
   ```bash
   gh release create vX.Y.Z \
     --title "vX.Y.Z" \
     --notes-file <(sed -n '/## \[X.Y.Z\]/,/## \[/p' CHANGELOG.md | sed '$d')
   ```
   *Alternative:* Create the release through the GitHub web UI under **Releases -> Draft a new release**, choosing tag `vX.Y.Z` and pasting release notes from `CHANGELOG.md`.

---

## 6. Post-Release Verification

1. Verify that the GitHub Release is published and visible on GitHub.
2. Confirm both `vX.Y.Z` and the major tag (e.g., `v1`) point to the intended commit:
   ```bash
   git rev-parse vX.Y.Z
   git rev-parse v1
   ```
3. Test `uses: lean-packages/action@v1` in a consuming test workflow to verify end-to-end execution.
