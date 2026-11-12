# Contributing to lean-packages/action

Thank you for your interest in contributing to `lean-packages/action`!

## Development Setup

1. Ensure Node.js 20+ is installed.
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Run the test suite:
   ```bash
   npm run test
   ```
4. Run type checks and build the distribution bundle:
   ```bash
   npm run check
   ```

## Adding or Modifying Tool Adapters

1. Add tool specifications and tests in `src/adapters/` and `tests/unit/adapters.test.ts`.
2. Ensure manifests, packaging rules, and linting logic remain in the individual native tools—the Action acts only as an orchestrator.
3. Keep argument passing and file path handling safe (no shell interpolation).
4. Re-run `npm run check` to verify and rebuild `dist/index.js`.
