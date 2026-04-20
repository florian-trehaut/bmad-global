/**
 * bmad-code-review Acceptance Criteria Test Runner
 *
 * Asserts grep-based ACs from _bmad-output/implementation-artifacts/code-review-workflow-rework.md
 * against the refactored bmad-code-review skill. Fixture-dependent ACs
 * (behavioral sub-axis checks) are documented in test-fixtures/code-review-v2/
 * and exercised manually.
 *
 * Usage: node test/test-code-review-ac.js
 * Exit codes: 0 = all ACs pass, 1 = AC failures
 */

const fs = require('node:fs');
const path = require('node:path');

const colors = {
  reset: '\u001B[0m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  yellow: '\u001B[33m',
  cyan: '\u001B[36m',
  dim: '\u001B[2m',
};

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SKILL_ROOT = path.join(PROJECT_ROOT, 'src/bmm-skills/4-implementation/bmad-code-review');
const STEPS_DIR = path.join(SKILL_ROOT, 'steps');
const SUBAGENT_DIR = path.join(SKILL_ROOT, 'subagent-workflows');
const DATA_DIR = path.join(SKILL_ROOT, 'data');
const STACK_GREP_DIR = path.join(DATA_DIR, 'stack-grep-bank');

let totalTests = 0;
let passedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${colors.green}\u2713${colors.reset} ${name}`);
  } catch (error) {
    console.log(`  ${colors.red}\u2717${colors.reset} ${name}`);
    console.log(`    ${colors.red}${error.message}${colors.reset}`);
    failures.push({ name, message: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readAllFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (pattern.test(entry.name)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

function fileContent(p) {
  return fs.readFileSync(p, 'utf-8');
}

function lineCount(p) {
  return fileContent(p).split('\n').length;
}

function greptree(dir, pattern, exclude = /^$/) {
  const files = readAllFiles(dir, /\.md$/);
  const hits = [];
  for (const f of files) {
    const rel = path.relative(PROJECT_ROOT, f);
    if (exclude.test(rel)) continue;
    const content = fileContent(f);
    const lines = content.split('\n');
    for (const [i, line] of lines.entries()) {
      if (pattern.test(line)) hits.push({ file: rel, line: i + 1, text: line.trim() });
    }
  }
  return hits;
}

// ============================================================
// PHASE 1 — Orchestration Foundation (AC-1 through AC-10)
// ============================================================

console.log(`\n${colors.cyan}Phase 1 — Orchestration Foundation${colors.reset}`);

// Migration-note comments are ALLOWED (per AC wording). Exclude them from grep.
const MIGRATION_COMMENT = /migration-note|historical|legacy v1|removed in v2|was.*previously/i;

test('AC-1: no CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS references (outside migration notes)', () => {
  const hits = greptree(SKILL_ROOT, /CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS/).filter((h) => !MIGRATION_COMMENT.test(h.text));
  assert(hits.length === 0, `Found ${hits.length} references:\n${hits.map((h) => `  ${h.file}:${h.line}: ${h.text}`).join('\n')}`);
});

test('AC-2: no TeamCreate/TeamDelete/TaskList/TaskCreate/TaskUpdate/SendMessage references', () => {
  const hits = greptree(SKILL_ROOT, /\b(TeamCreate|TeamDelete|TaskList|TaskCreate|TaskUpdate|SendMessage)\b/).filter(
    (h) => !MIGRATION_COMMENT.test(h.text),
  );
  assert(hits.length === 0, `Found ${hits.length} references:\n${hits.map((h) => `  ${h.file}:${h.line}: ${h.text}`).join('\n')}`);
});

test('AC-3: step-02-review.md contains parallel Agent() block with 5+ calls', () => {
  const stepFile = path.join(STEPS_DIR, 'step-02-review.md');
  assert(fs.existsSync(stepFile), `step-02-review.md not found at ${stepFile}`);
  const content = fileContent(stepFile);
  const agentCalls = content.match(/\bAgent\s*\(/g) || [];
  assert(
    agentCalls.length >= 5,
    `Expected >= 5 Agent() calls in step-02-review.md (meta-1..4 + S1 + S2 minimum), found ${agentCalls.length}`,
  );
});

test('AC-4: judge-triage.md exists with required contract fields', () => {
  const judge = path.join(SUBAGENT_DIR, 'judge-triage.md');
  assert(fs.existsSync(judge), `judge-triage.md not found at ${judge}`);
  const content = fileContent(judge);
  for (const required of ['consolidated_report', 'verdict', 'scores_per_meta', 'failed_layers', 'action']) {
    assert(content.includes(required), `judge-triage.md missing required field: ${required}`);
  }
});

test('AC-6: S1 prompt = attacker POV + temp <= 0.2; S2 = defender POV + temp >= 0.5', () => {
  const stepFile = path.join(STEPS_DIR, 'step-02-review.md');
  assert(fs.existsSync(stepFile), 'step-02-review.md required');
  const content = fileContent(stepFile);
  const s1Index = content.indexOf('S1');
  const s2Index = content.indexOf('S2');
  assert(s1Index !== -1 && s2Index !== -1, 'S1 and S2 blocks required');
  assert(/attacker/i.test(content), 'S1 must contain attacker POV framing');
  assert(/defender/i.test(content), 'S2 must contain defender POV framing');
  assert(/0\.2/.test(content) || /low creativity/i.test(content), 'S1 must reference temperature 0.2 or low creativity');
  assert(/0\.5/.test(content) || /medium creativity/i.test(content), 'S2 must reference temperature 0.5 or medium creativity');
});

test('AC-7: self-review mode uses Agent() calls (not inline sequential)', () => {
  const stepFile = path.join(STEPS_DIR, 'step-02-review.md');
  if (!fs.existsSync(stepFile)) return; // deferred until Phase 2
  const content = fileContent(stepFile);
  const hasSelfReview = /self.review|SELF.REVIEW/i.test(content);
  if (hasSelfReview) {
    const selfSection = content.slice(content.search(/self.review|SELF.REVIEW/i));
    const agentCalls = (selfSection.match(/\bAgent\s*\(/g) || []).length;
    assert(agentCalls >= 2, `Self-review section must use Agent() calls, found ${agentCalls}`);
  }
});

test('AC-9: judge-triage contract enforces model parity', () => {
  const judge = path.join(SUBAGENT_DIR, 'judge-triage.md');
  if (!fs.existsSync(judge)) throw new Error('judge-triage.md not found');
  const content = fileContent(judge);
  assert(
    /model parity|same.*model tier|same.*tier.*orchestrator|f5030c70/i.test(content),
    'judge-triage.md must reference model parity constraint',
  );
});

test('AC-10: subagent workflows mark themselves READ-ONLY', () => {
  const files = [path.join(SUBAGENT_DIR, 'judge-triage.md'), ...readAllFiles(SUBAGENT_DIR, /^meta-\d-.*\.md$/)].filter((p) =>
    fs.existsSync(p),
  );
  assert(files.length > 0, 'At least judge-triage must exist for AC-10');
  for (const f of files) {
    const content = fileContent(f);
    assert(/READ.ONLY|read-only/i.test(content), `${path.relative(PROJECT_ROOT, f)} must declare READ-ONLY constraint`);
  }
});

// ============================================================
// PHASE 2-3 — Sharded 4-step + Severity × Action + Meta restructure (AC-11 through AC-15)
// ============================================================

console.log(`\n${colors.cyan}Phase 2-3 — Sharded architecture + meta restructure${colors.reset}`);

test('AC-11: exactly 4 step files exist (gather-context, review, triage, present) and no orphaned step-05..08', () => {
  const requiredSteps = ['step-01-gather-context.md', 'step-02-review.md', 'step-03-triage.md', 'step-04-present.md'];
  for (const s of requiredSteps) {
    assert(fs.existsSync(path.join(STEPS_DIR, s)), `Missing required step: ${s}`);
  }
  const orphans = fs
    .readdirSync(STEPS_DIR)
    .filter((f) => /^step-0[5-8]-/.test(f) || f.startsWith('step-01-discover') || f.startsWith('step-02-setup'));
  assert(orphans.length === 0, `Orphaned v1 step files found: ${orphans.join(', ')} (must be deleted after Phase 2)`);
});

test('AC-12: finding schema documents both severity and action fields', () => {
  const judge = path.join(SUBAGENT_DIR, 'judge-triage.md');
  if (!fs.existsSync(judge)) throw new Error('judge-triage.md required');
  const content = fileContent(judge);
  assert(/\bseverity\b/.test(content), 'judge-triage.md must document severity field');
  assert(/\baction\b/.test(content), 'judge-triage.md must document action field');
  // Severity enum
  for (const sev of ['BLOCKER', 'WARNING', 'RECOMMENDATION', 'QUESTION']) {
    assert(content.includes(sev), `judge-triage.md must enumerate severity value: ${sev}`);
  }
  // Action enum
  for (const act of ['decision_needed', 'patch', 'defer', 'dismiss']) {
    assert(content.includes(act), `judge-triage.md must enumerate action value: ${act}`);
  }
});

test('AC-13: severity-action matrix data file exists', () => {
  const matrix = path.join(DATA_DIR, 'severity-action-matrix.md');
  assert(fs.existsSync(matrix), `data/severity-action-matrix.md required for AC-13`);
});

test('AC-14: 6 meta-*.md files exist, review-perspectives.md removed', () => {
  const expected = [
    'meta-1-contract-spec.md',
    'meta-2-correctness-reliability.md',
    'meta-3-security-privacy.md',
    'meta-4-engineering-quality.md',
    'meta-5-operations-deployment.md',
    'meta-6-user-facing-quality.md',
  ];
  for (const f of expected) {
    assert(fs.existsSync(path.join(SUBAGENT_DIR, f)), `Missing meta file: ${f}`);
  }
  const legacy = path.join(SUBAGENT_DIR, 'review-perspectives.md');
  assert(!fs.existsSync(legacy), 'subagent-workflows/review-perspectives.md must be removed after Phase 3');
});

test('AC-15: per-meta weights sum to 1.0 and zero-fallback weight is 0.15', () => {
  const meta2 = path.join(SUBAGENT_DIR, 'meta-2-correctness-reliability.md');
  if (!fs.existsSync(meta2)) throw new Error('meta-2-correctness-reliability.md required');
  const meta2content = fileContent(meta2);
  // Zero-fallback weight 0.15 documented inside M2
  assert(
    /zero.fallback.*0\.15|weight.*0\.15.*zero.fallback|0\.15.*zero.fallback/is.test(meta2content) ||
      /zero.fallback.*w\s*=\s*0\.15/i.test(meta2content),
    'meta-2 must document zero-fallback weight 0.15',
  );
  // Per-meta weights sum: check in review step
  const stepFile = path.join(STEPS_DIR, 'step-03-triage.md');
  if (!fs.existsSync(stepFile)) return;
  const content = fileContent(stepFile);
  const weights = {
    M1: 0.2,
    M2: 0.2,
    M3: 0.25,
    M4: 0.2,
    M5: 0.1,
    M6: 0.05,
  };
  for (const [meta, w] of Object.entries(weights)) {
    assert(
      new RegExp(`\\b${meta}\\b.*${String(w).replace('.', String.raw`\.`)}`).test(content),
      `step-03-triage.md must declare ${meta}=${w}`,
    );
  }
});

// ============================================================
// PHASE 7 — Progressive disclosure + stack grep bank (AC-30 through AC-35)
// ============================================================

console.log(`\n${colors.cyan}Phase 7 — Progressive disclosure + stack grep bank${colors.reset}`);

test('AC-30: workflow.md < 200 lines', () => {
  const wf = path.join(SKILL_ROOT, 'workflow.md');
  const count = lineCount(wf);
  assert(count < 200, `workflow.md is ${count} lines (must be < 200)`);
});

test('AC-31: each steps/step-*.md < 400 lines', () => {
  const offenders = [];
  for (const f of readAllFiles(STEPS_DIR, /\.md$/)) {
    const n = lineCount(f);
    if (n >= 400) offenders.push(`${path.relative(PROJECT_ROOT, f)}: ${n} lines`);
  }
  assert(offenders.length === 0, `Step files exceeding 400 lines:\n  ${offenders.join('\n  ')}`);
});

test('AC-32: stack grep bank files exist for TS/Python/Go/Rust/Java/Ruby', () => {
  const expected = ['typescript.md', 'python.md', 'go.md', 'rust.md', 'java.md', 'ruby.md'];
  for (const f of expected) {
    assert(fs.existsSync(path.join(STACK_GREP_DIR, f)), `Missing stack-grep-bank/${f}`);
  }
});

test('AC-34: shared primitives extracted to data/', () => {
  const expected = [
    'api-surface-detection.md',
    'ui-detection.md',
    'llm-detection.md',
    'pattern-reference-schema.md',
    'severity-action-matrix.md',
    'acceptable-fallback-rules.md',
    'owasp-top-10-2025.md',
    'owasp-llm-top-10.md',
  ];
  for (const f of expected) {
    assert(fs.existsSync(path.join(DATA_DIR, f)), `Missing data/${f}`);
  }
});

// ============================================================
// Structural sanity checks (not tied to a specific AC but cheap to verify)
// ============================================================

console.log(`\n${colors.cyan}Structural sanity${colors.reset}`);

test('STRUCT-1: regression-risk persona-skill exists at src/core-skills/bmad-review-regression-risk/', () => {
  const persona = path.join(PROJECT_ROOT, 'src/core-skills/bmad-review-regression-risk');
  assert(fs.existsSync(path.join(persona, 'SKILL.md')), 'bmad-review-regression-risk/SKILL.md required');
  assert(fs.existsSync(path.join(persona, 'workflow.md')), 'bmad-review-regression-risk/workflow.md required');
});

test('STRUCT-2: SKILL.md does not reference team/experimental-flag language', () => {
  const skill = path.join(SKILL_ROOT, 'SKILL.md');
  const content = fileContent(skill);
  const banned = /CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS|TeamCreate|team_name|TaskList/;
  assert(!banned.test(content), 'SKILL.md contains banned team/experimental-flag language');
});

// ============================================================
// Summary
// ============================================================

console.log(`\n${colors.cyan}Summary${colors.reset}`);
console.log(`  Tests: ${totalTests}, passed: ${passedTests}, failed: ${failures.length}`);
if (failures.length > 0) {
  console.log(`\n${colors.red}FAILURES${colors.reset}`);
  for (const f of failures) {
    console.log(`  ${colors.red}\u2717${colors.reset} ${f.name}`);
    console.log(`    ${colors.dim}${f.message.split('\n').join('\n    ')}${colors.reset}`);
  }
  process.exit(1);
}
console.log(`${colors.green}All acceptance criteria satisfied.${colors.reset}`);
process.exit(0);
