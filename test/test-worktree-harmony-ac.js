/**
 * Worktree Lifecycle Harmony — Acceptance Criteria Test Runner
 *
 * Asserts that the unified worktree lifecycle protocol in
 * src/core-skills/bmad-shared/worktree-lifecycle.md is correctly adopted
 * by all 7 consumer workflows. Blocks any future regression that:
 *   - Inlines `git worktree add` outside the shared rule
 *   - Drops the current-worktree detection (§0)
 *   - Drops the reuse protocol (cleanliness + alignment + sync)
 *   - Omits the worktree_reuse_current flag from the bootstrap template
 *
 * Usage: node test/test-worktree-harmony-ac.js
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
};

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SHARED_RULE = path.join(PROJECT_ROOT, 'src/core-skills/bmad-shared/worktree-lifecycle.md');
const PROJECT_INIT_STEP = path.join(PROJECT_ROOT, 'src/core-skills/bmad-project-init/steps/step-03-generate-context.md');

// 7 consumer step-files (the exact locations that invoke the protocol)
const CONSUMER_STEPS = [
  {
    workflow: 'bmad-dev-story',
    file: 'src/bmm-skills/4-implementation/bmad-dev-story/steps/step-03-setup-worktree.md',
    expected_purpose: 'write',
  },
  {
    workflow: 'bmad-code-review',
    file: 'src/bmm-skills/4-implementation/bmad-code-review/steps/step-01-gather-context.md',
    expected_purpose: 'review',
  },
  {
    workflow: 'bmad-create-story',
    file: 'src/bmm-skills/2-plan-workflows/bmad-create-story/steps/step-03-setup-worktree.md',
    expected_purpose: 'read-only',
  },
  {
    workflow: 'bmad-spike',
    file: 'src/bmm-skills/3-solutioning/bmad-spike/steps/step-01-init.md',
    expected_purpose: 'write',
  },
  {
    workflow: 'bmad-adr-review',
    file: 'src/bmm-skills/3-solutioning/bmad-adr-review/steps/step-01-init.md',
    expected_purpose: 'read-only',
  },
  {
    workflow: 'bmad-validation-desktop',
    file: 'src/bmm-skills/4-implementation/bmad-validation-desktop/steps/step-03-setup-worktree.md',
    expected_purpose: 'read-only',
  },
  {
    workflow: 'bmad-troubleshoot',
    file: 'src/bmm-skills/4-implementation/bmad-troubleshoot/workflow.md',
    expected_purpose: 'write',
  },
];

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

function fileContent(p) {
  return fs.readFileSync(p, 'utf-8');
}

// ============================================================
// Shared rule — §0 Detection + §1 Unified Protocol (AC-1 .. AC-10)
// ============================================================

console.log(`\n${colors.cyan}Shared rule — §0 Detection + §1 Unified Protocol${colors.reset}`);

test('AC-1: shared rule exists at expected path', () => {
  assert(fs.existsSync(SHARED_RULE), `Missing: ${SHARED_RULE}`);
});

test('AC-2: shared rule declares §0 Detect Current Environment', () => {
  const content = fileContent(SHARED_RULE);
  assert(/## 0\. Detect Current Environment/i.test(content), 'Missing section header "## 0. Detect Current Environment"');
});

test('AC-3: shared rule detects worktree via git-dir vs git-common-dir inequality', () => {
  const content = fileContent(SHARED_RULE);
  assert(/git rev-parse --git-dir/.test(content), 'Missing `git rev-parse --git-dir`');
  assert(/git rev-parse --git-common-dir/.test(content), 'Missing `git rev-parse --git-common-dir`');
  assert(/IN_WORKTREE/.test(content), 'Missing IN_WORKTREE variable');
});

test('AC-4: shared rule declares contract with worktree_purpose / base_ref / branch_name / alignment_check', () => {
  const content = fileContent(SHARED_RULE);
  for (const param of [
    'worktree_purpose',
    'worktree_path_expected',
    'worktree_base_ref',
    'worktree_branch_name',
    'worktree_branch_strategy',
    'worktree_alignment_check',
  ]) {
    assert(content.includes(param), `Contract parameter missing: ${param}`);
  }
});

test('AC-5: shared rule defines 3 purposes (write / review / read-only)', () => {
  const content = fileContent(SHARED_RULE);
  for (const purpose of ['`write`', '`review`', '`read-only`']) {
    assert(content.includes(purpose), `Purpose token missing: ${purpose}`);
  }
});

test('AC-6: shared rule has 3 setup branches (A/B/C)', () => {
  const content = fileContent(SHARED_RULE);
  assert(/Branch A/.test(content), 'Missing Branch A (worktree_enabled=false)');
  assert(/Branch B/.test(content), 'Missing Branch B (create conventional)');
  assert(/Branch C/.test(content), 'Missing Branch C (reuse current)');
});

test('AC-7: shared rule enforces cleanliness with explicit HALT on dirty worktree', () => {
  const content = fileContent(SHARED_RULE);
  assert(/git status --porcelain/.test(content), 'Missing cleanliness check');
  assert(/Cleanliness/i.test(content), 'Missing "Cleanliness" section header');
  assert(/HALT.*uncommitted/i.test(content), 'Missing HALT message for uncommitted changes');
});

test('AC-8: shared rule menu offers [U]/[C] with no default', () => {
  const content = fileContent(SHARED_RULE);
  assert(/\*\*\[U\]\*\*/.test(content), 'Missing [U] option');
  assert(/\*\*\[C\]\*\*/.test(content), 'Missing [C] option');
  assert(/No default/i.test(content), 'Missing "No default" requirement');
  assert(/WAIT for explicit input/i.test(content), 'Missing "WAIT for explicit input"');
});

test('AC-9: shared rule documents worktree_reuse_current with 3 values', () => {
  const content = fileContent(SHARED_RULE);
  assert(content.includes('worktree_reuse_current'), 'Missing worktree_reuse_current flag');
  for (const value of ['`auto`', '`always`', '`never`']) {
    assert(content.includes(value), `Missing reuse value: ${value}`);
  }
});

test('AC-10: shared rule §3 Cleanup skips removal when worktree was reused', () => {
  const content = fileContent(SHARED_RULE);
  assert(/REUSED_CURRENT_WORKTREE/.test(content), 'Missing REUSED_CURRENT_WORKTREE flag');
  assert(
    /REUSED_CURRENT_WORKTREE\s*==\s*true[\s\S]{0,200}?Do NOT remove/i.test(content),
    'Cleanup must skip removal when REUSED_CURRENT_WORKTREE == true',
  );
});

test('AC-11: shared rule preserves §2 Post-Creation Setup (install/build/typecheck)', () => {
  const content = fileContent(SHARED_RULE);
  assert(/## 2\. Post-Creation Setup/i.test(content), 'Missing §2 header');
  for (const cmd of ['{install_command}', '{build_command}', '{typecheck_command}']) {
    assert(content.includes(cmd), `Missing post-creation command: ${cmd}`);
  }
});

test('AC-12: shared rule defines sync strategies per purpose', () => {
  const content = fileContent(SHARED_RULE);
  assert(/git rebase origin\/main/.test(content), 'Missing write-purpose sync (git rebase origin/main)');
  assert(/git pull --rebase origin/.test(content), 'Missing review-purpose sync (git pull --rebase origin ...)');
  assert(/git reset --hard origin\/main/.test(content), 'Missing read-only-purpose sync (git reset --hard origin/main)');
});

// ============================================================
// Consumer step-files — harmonized invocation (AC-13 .. AC-26)
// ============================================================

console.log(`\n${colors.cyan}Consumer step-files — harmonized invocation${colors.reset}`);

for (const consumer of CONSUMER_STEPS) {
  const absPath = path.join(PROJECT_ROOT, consumer.file);

  test(`AC: ${consumer.workflow} — step-file references bmad-shared/worktree-lifecycle.md`, () => {
    assert(fs.existsSync(absPath), `Missing: ${absPath}`);
    const content = fileContent(absPath);
    assert(
      /bmad-shared\/worktree-lifecycle\.md/.test(content),
      `Missing reference to bmad-shared/worktree-lifecycle.md in ${consumer.file}`,
    );
  });

  test(`AC: ${consumer.workflow} — step-file declares worktree_purpose: ${consumer.expected_purpose}`, () => {
    const content = fileContent(absPath);
    assert(content.includes('worktree_purpose'), `Missing worktree_purpose parameter in ${consumer.file}`);
    const purposeLineRegex = new RegExp(`worktree_purpose[\\s\\S]{0,80}?\`${consumer.expected_purpose}\``);
    assert(purposeLineRegex.test(content), `${consumer.file} must declare worktree_purpose = \`${consumer.expected_purpose}\``);
  });

  test(`AC: ${consumer.workflow} — step-file does NOT inline \`git worktree add\``, () => {
    const content = fileContent(absPath);
    // Count real invocations, not inline-backticked doc references (e.g. `git worktree add` in prose).
    // Real invocations appear as unquoted `git worktree add` inside a fenced code block.
    const lines = content.split('\n');
    let inFence = false;
    let invocations = 0;
    for (const line of lines) {
      if (line.startsWith('```')) {
        inFence = !inFence;
        continue;
      }
      if (inFence && /git worktree add/.test(line)) invocations++;
    }
    assert(
      invocations === 0,
      `${consumer.file} must not inline "git worktree add" in a code fence (found ${invocations}). Delegate to the shared rule.`,
    );
  });

  test(`AC: ${consumer.workflow} — step-file declares full contract (5 params minimum)`, () => {
    const content = fileContent(absPath);
    for (const param of [
      'worktree_purpose',
      'worktree_path_expected',
      'worktree_base_ref',
      'worktree_branch_strategy',
      'worktree_alignment_check',
    ]) {
      assert(content.includes(param), `${consumer.file} missing contract parameter: ${param}`);
    }
  });
}

// ============================================================
// Project-init template — worktree_reuse_current emission (AC-last)
// ============================================================

console.log(`\n${colors.cyan}Project-init template${colors.reset}`);

test('AC: project-init step-03 template emits worktree_reuse_current with default=auto', () => {
  assert(fs.existsSync(PROJECT_INIT_STEP), `Missing: ${PROJECT_INIT_STEP}`);
  const content = fileContent(PROJECT_INIT_STEP);
  assert(
    /worktree_reuse_current:\s*auto/.test(content),
    'Project-init step-03 template must include `worktree_reuse_current: auto` (with auto as default)',
  );
});

test('AC: project workflow-context.md has worktree_reuse_current configured', () => {
  const ctx = path.join(PROJECT_ROOT, '.claude/workflow-context.md');
  assert(fs.existsSync(ctx), `Missing: ${ctx}`);
  const content = fileContent(ctx);
  assert(
    /worktree_reuse_current:\s*(auto|always|never)/.test(content),
    'workflow-context.md must declare worktree_reuse_current with a valid value',
  );
});

// ============================================================
// Summary
// ============================================================

console.log(`\n${colors.cyan}Summary${colors.reset}`);
console.log(`  Tests: ${totalTests}, passed: ${passedTests}, failed: ${failures.length}`);

if (failures.length > 0) {
  console.log(`\n${colors.red}Failures:${colors.reset}`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.message}`);
  process.exit(1);
} else {
  console.log(`${colors.green}All worktree-harmony ACs satisfied.${colors.reset}`);
  process.exit(0);
}
