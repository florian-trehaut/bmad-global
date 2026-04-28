/**
 * Tests for tools/validate-story-spec.js
 *
 * Validates the story-spec v2 validator against fixtures:
 *   - valid-full.md     → expect 0 BLOCKER, 0 MAJOR
 *   - broken-missing-sections.md → expect multiple BLOCKERs (missing sections + AC format issues)
 *
 * Run: node test/test-story-spec-validator.js
 */

'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(PROJECT_ROOT, 'tools', 'validate-story-spec.js');
const FIXTURES = path.join(__dirname, 'fixtures', 'story-spec');

let failed = 0;

function runValidator(file, opts = []) {
  try {
    const out = execFileSync('node', [VALIDATOR, path.join(FIXTURES, file), '--json', ...opts], {
      encoding: 'utf-8',
    });
    return { ok: true, json: JSON.parse(out), code: 0 };
  } catch (error) {
    // execFileSync throws when exit code != 0, stdout is on error.stdout
    return {
      ok: false,
      json: error.stdout ? JSON.parse(error.stdout) : null,
      code: error.status,
    };
  }
}

function assert(condition, message) {
  if (condition) {
    process.stdout.write(`  PASS — ${message}\n`);
  } else {
    process.stdout.write(`  FAIL — ${message}\n`);
    failed += 1;
  }
}

process.stdout.write('test-story-spec-validator: running fixtures\n\n');

// Test 1: valid-full.md — should pass with 0 BLOCKER
process.stdout.write('Fixture: valid-full.md (full profile, must pass)\n');
{
  const r = runValidator('valid-full.md', ['--profile=full', '--warn-only']);
  const blockers = (r.json?.findings || []).filter((f) => f.severity === 'BLOCKER');
  assert(blockers.length === 0, `valid-full: 0 BLOCKER findings (got ${blockers.length})`);
  if (blockers.length > 0) {
    for (const b of blockers) {
      process.stdout.write(`    unexpected BLOCKER: ${b.ruleId} — ${b.message}\n`);
    }
  }
}

// Test 2: broken-missing-sections.md — must surface BLOCKERs for missing sections
process.stdout.write('\nFixture: broken-missing-sections.md (must HAVE BLOCKERs)\n');
{
  const r = runValidator('broken-missing-sections.md', ['--profile=full', '--warn-only']);
  const blockers = (r.json?.findings || []).filter((f) => f.severity === 'BLOCKER');
  assert(blockers.length > 0, `broken-missing-sections: at least 1 BLOCKER (got ${blockers.length})`);

  // Verify specific rules fire
  const ruleIds = new Set(blockers.map((f) => f.ruleId));
  assert(ruleIds.has('SPEC-MISSING-SECTION'), 'SPEC-MISSING-SECTION fires (Out of Scope, NFR Registry, Security Gate, etc. all missing)');
  assert(ruleIds.has('SPEC-VM-EMPTY'), 'SPEC-VM-EMPTY fires (Validation Metier section empty)');
  assert(
    ruleIds.has('SPEC-BAC-FORMAT') || ruleIds.has('SPEC-MISSING-SECTION'),
    'BAC format violation OR missing section detected on broken BAC-1',
  );
}

// Test 3: --strict mode exits 1 on broken fixture
process.stdout.write('\nFixture: broken-missing-sections.md with --strict\n');
{
  const r = runValidator('broken-missing-sections.md', ['--profile=full', '--strict']);
  assert(r.code === 1, `--strict on broken fixture returns exit code 1 (got ${r.code})`);
}

// Test 4: --warn-only never fails
process.stdout.write('\nFixture: broken-missing-sections.md with --warn-only\n');
{
  const r = runValidator('broken-missing-sections.md', ['--profile=full', '--warn-only']);
  assert(r.code === 0, `--warn-only on broken fixture returns exit code 0 (got ${r.code})`);
}

if (failed > 0) {
  process.stdout.write(`\nFAILED ${failed} test(s)\n`);
  process.exit(1);
}

process.stdout.write('\nAll story-spec-validator tests passed.\n');
process.exit(0);
