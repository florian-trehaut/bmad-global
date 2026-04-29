/**
 * Tests for tools/validate-story-spec.js --split flag (story-spec v3 bifurcation)
 *
 * Coverage:
 *   1. valid split spec passes (--split + --tracker-id-fixture)
 *   2. missing business section in tracker reports BLOCKER
 *   3. missing technical section in local reports BLOCKER
 *   4. absent tracker_issue_id with --split reports MAJOR
 *   5. drift detection triggers correctly when business_content_hash mismatch
 *   6. legacy v2 spec (no mode field) read as monolithic regardless of --split
 *
 * Run: node test/test-validate-story-spec-split.js
 * Exit: 0 all pass, 1 any failure
 */

'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(PROJECT_ROOT, 'tools', 'validate-story-spec.js');
const FIXTURES = path.join(__dirname, 'fixtures');

let failed = 0;
let total = 0;

function runValidator(args) {
  try {
    const out = execFileSync('node', [VALIDATOR, ...args, '--json'], { encoding: 'utf-8' });
    return { ok: true, json: JSON.parse(out), code: 0 };
  } catch (error) {
    return {
      ok: false,
      json: error.stdout ? JSON.parse(error.stdout) : null,
      code: error.status,
    };
  }
}

function assert(condition, message) {
  total += 1;
  if (condition) {
    process.stdout.write(`  PASS — ${message}\n`);
  } else {
    process.stdout.write(`  FAIL — ${message}\n`);
    failed += 1;
  }
}

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf-8');
}

process.stdout.write('test-validate-story-spec-split: bifurcation mode\n\n');

const fixturesValidLocal = path.join(FIXTURES, 'spec-split-local.md');
const fixturesValidTracker = path.join(FIXTURES, 'spec-split-tracker.json');

// Sanity check: fixtures exist
{
  process.stdout.write('Fixture sanity\n');
  assert(fs.existsSync(fixturesValidLocal), 'spec-split-local.md fixture exists');
  assert(fs.existsSync(fixturesValidTracker), 'spec-split-tracker.json fixture exists');
}

// Test 1: valid split spec passes (0 BLOCKER AND 0 MAJOR)
{
  process.stdout.write('\nTest 1: valid split spec (--split with offline tracker fixture)\n');
  const r = runValidator([fixturesValidLocal, '--split', `--tracker-fixture=${fixturesValidTracker}`, '--warn-only']);
  const blockers = (r.json?.findings || []).filter((f) => f.severity === 'BLOCKER');
  const majors = (r.json?.findings || []).filter((f) => f.severity === 'MAJOR');
  assert(blockers.length === 0, `valid split: 0 BLOCKER findings (got ${blockers.length})`);
  assert(majors.length === 0, `valid split: 0 MAJOR findings (got ${majors.length})`);
  if (blockers.length > 0) {
    for (const b of blockers) process.stdout.write(`    unexpected BLOCKER: ${b.ruleId} — ${b.message}\n`);
  }
  if (majors.length > 0) {
    for (const m of majors) process.stdout.write(`    unexpected MAJOR: ${m.ruleId} — ${m.message}\n`);
  }
}

// Test 2: missing business section in tracker → BLOCKER
{
  process.stdout.write('\nTest 2: missing business section in tracker description\n');
  const tmpDir = makeTempDir('split-missing-business');
  const trackerPayload = JSON.parse(fs.readFileSync(fixturesValidTracker, 'utf-8'));
  // Remove "## Validation Metier" from the tracker description
  trackerPayload.description = trackerPayload.description.replace(/## Validation Metier[\s\S]*?(?=\n---|$)/, '');
  const trackerPath = path.join(tmpDir, 'tracker-no-vm.json');
  writeFile(trackerPath, JSON.stringify(trackerPayload, null, 2));

  const r = runValidator([fixturesValidLocal, '--split', `--tracker-fixture=${trackerPath}`, '--warn-only']);
  const found = (r.json?.findings || []).some((f) => f.severity === 'BLOCKER' && /SPEC-SPLIT-MISSING-TRACKER-SECTION/.test(f.ruleId));
  assert(found, 'missing tracker business section is reported as BLOCKER (rule SPEC-SPLIT-MISSING-TRACKER-SECTION)');
}

// Test 3: missing technical section in local file → BLOCKER
{
  process.stdout.write('\nTest 3: missing technical section in local file\n');
  const tmpDir = makeTempDir('split-missing-technical');
  const localPath = path.join(tmpDir, 'local-no-nfr.md');
  const localContent = fs.readFileSync(fixturesValidLocal, 'utf-8').replace(/## NFR Registry[\s\S]*?(?=\n## )/, '');
  writeFile(localPath, localContent);

  const r = runValidator([localPath, '--split', `--tracker-fixture=${fixturesValidTracker}`, '--warn-only']);
  const found = (r.json?.findings || []).some(
    (f) => f.severity === 'BLOCKER' && /SPEC-SPLIT-MISSING-LOCAL-SECTION|SPEC-MISSING-SECTION/.test(f.ruleId),
  );
  assert(found, 'missing local technical section is reported as BLOCKER');
}

// Test 4: --split without tracker_issue_id and without --tracker-id → MAJOR
{
  process.stdout.write('\nTest 4: --split without tracker_issue_id\n');
  const tmpDir = makeTempDir('split-no-id');
  const localPath = path.join(tmpDir, 'local-no-id.md');
  // Strip tracker_issue_id from frontmatter
  const localContent = fs
    .readFileSync(fixturesValidLocal, 'utf-8')
    .replace(/tracker_issue_id:.*\n/, '')
    .replace(/tracker_url:.*\n/, '');
  writeFile(localPath, localContent);

  const r = runValidator([localPath, '--split', '--warn-only']);
  const found = (r.json?.findings || []).some((f) => f.severity === 'MAJOR' && /SPEC-SPLIT-NO-TRACKER-ID/.test(f.ruleId));
  assert(found, 'missing tracker_issue_id with --split is reported as MAJOR (rule SPEC-SPLIT-NO-TRACKER-ID)');
}

// Test 5a: drift detection deterministic — no-drift case (frontmatter hash matches computed)
{
  process.stdout.write('\nTest 5a: no-drift case (hash matches computed)\n');

  // First run with a known-wrong hash to extract the validator's computed hash from
  // the drift message. This avoids any whitespace-handling drift between the test's
  // hash computation and the validator's.
  const probeR = runValidator([fixturesValidLocal, '--split', `--tracker-fixture=${fixturesValidTracker}`, '--check-drift', '--warn-only']);
  const driftFinding = (probeR.json?.findings || []).find((f) => f.ruleId.endsWith('SPEC-SPLIT-DRIFT'));
  const match = driftFinding && driftFinding.message.match(/MD5\(canonical_business\)\[:8\] \(([a-f0-9]{8})\)/);
  const computedHash = match ? match[1] : null;
  assert(computedHash !== null, 'extracted validator-computed hash from drift finding message (probe run)');

  if (computedHash) {
    // Build a tmp local fixture with the matching hash
    const tmpDir = makeTempDir('drift-no-drift');
    const localPath = path.join(tmpDir, 'matching-hash.md');
    const localContent = fs
      .readFileSync(fixturesValidLocal, 'utf-8')
      .replace(/business_content_hash:\s*"[^"]+"/, `business_content_hash: "${computedHash}"`);
    writeFile(localPath, localContent);

    const r = runValidator([localPath, '--split', `--tracker-fixture=${fixturesValidTracker}`, '--check-drift', '--warn-only']);
    const driftReported = (r.json?.findings || []).some((f) => f.ruleId.endsWith('SPEC-SPLIT-DRIFT'));
    assert(!driftReported, `no-drift case: SPEC-SPLIT-DRIFT NOT reported when hash matches (computed=${computedHash})`);
  }
}

// Test 5b: drift detection deterministic — drift case (hash deliberately wrong)
{
  process.stdout.write('\nTest 5b: drift case (hash deliberately wrong)\n');
  const tmpDir = makeTempDir('drift-yes-drift');
  const localPath = path.join(tmpDir, 'wrong-hash.md');
  const localContent = fs
    .readFileSync(fixturesValidLocal, 'utf-8')
    .replace(/business_content_hash:\s*"[^"]+"/, 'business_content_hash: "deadbeef"');
  writeFile(localPath, localContent);

  const r = runValidator([localPath, '--split', `--tracker-fixture=${fixturesValidTracker}`, '--check-drift', '--warn-only']);
  const driftFound = (r.json?.findings || []).some((f) => f.ruleId.endsWith('SPEC-SPLIT-DRIFT'));
  assert(driftFound, 'drift case: SPEC-SPLIT-DRIFT reported when hash is wrong (deadbeef)');
}

// Test 6: legacy v2 spec (no mode field) is monolithic regardless of --split
{
  process.stdout.write('\nTest 6: legacy v2 spec read as monolithic\n');
  const tmpDir = makeTempDir('legacy-v2');
  const localPath = path.join(tmpDir, 'legacy-v2.md');
  // Strip schema_version, mode, tracker_issue_id from frontmatter (simulating legacy)
  const localContent = fs
    .readFileSync(fixturesValidLocal, 'utf-8')
    .replace(/schema_version:.*\n/, '')
    .replace(/mode:.*\n/, '')
    .replace(/tracker_issue_id:.*\n/, '')
    .replace(/tracker_url:.*\n/, '')
    .replace(/business_content_hash:.*\n/, '')
    .replace(/business_synced_at:.*\n/, '');
  writeFile(localPath, localContent);

  const r = runValidator([localPath, '--split', '--warn-only']);
  const splitSpecific = (r.json?.findings || []).filter((f) => /SPEC-SPLIT/.test(f.ruleId));
  assert(splitSpecific.length === 0, `legacy v2 with --split: 0 SPEC-SPLIT findings (got ${splitSpecific.length})`);
}

// Final summary
process.stdout.write(`\n${'='.repeat(60)}\n`);
process.stdout.write(`Tests: ${total - failed}/${total} passed`);
if (failed > 0) {
  process.stdout.write(`, ${failed} FAILED\n`);
  process.stdout.write(`${'='.repeat(60)}\n`);
  process.exit(1);
}
process.stdout.write(', all passed\n');
process.stdout.write(`${'='.repeat(60)}\n`);
process.exit(0);
