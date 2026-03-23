# Test Suite

Tests for the BMAD-METHOD tooling infrastructure.

## Quick Start

```bash
# Run all quality checks
npm run quality

# Run individual test suites
npm run test:install    # Global installer tests
npm run test:refs       # File reference CSV tests
npm run validate:refs   # File reference validation (strict)
```

## Test Scripts

### Global Installer Tests

**File**: `test/test-global-installer.js`

Validates path resolution, module discovery, manifest read/write, and the full install flow to `~/.claude/skills/bmad/`.

### File Reference Tests

**File**: `test/test-file-refs-csv.js`

Tests the CSV-based file reference validation logic.

## Test Fixtures

Located in `test/fixtures/`:

```text
test/fixtures/
└── file-refs-csv/    # Fixtures for file reference CSV tests
```
