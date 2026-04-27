/**
 * CLAUDE.local.md Template — Acceptance Criteria Test Runner
 *
 * Asserts that the bmad-knowledge-bootstrap CLAUDE.local.md template and
 * step-09 generator both ship the Knowledge Maintenance Policy section.
 * This block is what keeps workflow-knowledge/*.md and workflow-context.md
 * in sync across sessions — drift here breaks every downstream workflow.
 *
 * Usage: node test/test-claude-local-ac.js
 * Exit codes: 0 = all ACs pass, 1 = AC failures
 */

const fs = require('node:fs');
const path = require('node:path');

const colors = {
  reset: '\u001B[0m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  cyan: '\u001B[36m',
};

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(PROJECT_ROOT, 'src/core-skills/bmad-knowledge-bootstrap/templates/claude-local-template.md');
const STEP_GEN_CLAUDE_LOCAL = path.join(PROJECT_ROOT, 'src/core-skills/bmad-knowledge-bootstrap/steps/step-07-generate-claude-local.md');

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
// Template — Knowledge Maintenance Policy section
// ============================================================

console.log(`\n${colors.cyan}CLAUDE.local.md template — Knowledge Maintenance Policy${colors.reset}`);

test('AC-1: template file exists at expected path', () => {
  assert(fs.existsSync(TEMPLATE), `Missing: ${TEMPLATE}`);
});

test('AC-2: template declares ## Knowledge Maintenance Policy section', () => {
  const content = fileContent(TEMPLATE);
  assert(/^## Knowledge Maintenance Policy/m.test(content), 'Template must contain `## Knowledge Maintenance Policy` section header');
});

test('AC-3: Knowledge Maintenance Policy precedes Deep Knowledge', () => {
  const content = fileContent(TEMPLATE);
  const maintIdx = content.indexOf('## Knowledge Maintenance Policy');
  const deepIdx = content.indexOf('## Deep Knowledge');
  assert(maintIdx !== -1, 'Missing Knowledge Maintenance Policy header');
  assert(deepIdx !== -1, 'Missing Deep Knowledge header');
  assert(maintIdx < deepIdx, 'Knowledge Maintenance Policy must appear before Deep Knowledge');
});

test('AC-4: template Triggers table covers the 3-file consolidated layout (project.md / domain.md / api.md) plus workflow-context.md', () => {
  const content = fileContent(TEMPLATE);
  const canonicalTargets = [
    'workflow-knowledge/project.md',
    'workflow-knowledge/domain.md',
    'workflow-knowledge/api.md',
    'workflow-context.md',
  ];
  for (const target of canonicalTargets) {
    assert(content.includes(target), `Triggers table missing update target: ${target}`);
  }
});

test('AC-5: template Update Protocol escalates to /bmad-knowledge-refresh for non-trivial changes', () => {
  const content = fileContent(TEMPLATE);
  assert(/### Update Protocol/.test(content), 'Missing "Update Protocol" subsection');
  assert(/\/bmad-knowledge-refresh/.test(content), 'Update Protocol must reference /bmad-knowledge-refresh for non-trivial escalations');
});

test('AC-6: template has "When in Doubt" guidance', () => {
  const content = fileContent(TEMPLATE);
  assert(/### When in Doubt/i.test(content), 'Missing "When in Doubt" subsection');
  assert(/ASK the user/i.test(content), '"When in Doubt" must tell Claude to ASK the user');
});

// ============================================================
// step-09 generator — emits the policy section
// ============================================================

console.log(`\n${colors.cyan}step-07-generate-claude-local — policy emission${colors.reset}`);

test('AC-7: step-07-generate-claude-local documents a Knowledge Maintenance Policy emission rule', () => {
  assert(fs.existsSync(STEP_GEN_CLAUDE_LOCAL), `Missing: ${STEP_GEN_CLAUDE_LOCAL}`);
  const content = fileContent(STEP_GEN_CLAUDE_LOCAL);
  assert(
    /Section:\s*Knowledge Maintenance Policy/.test(content),
    'step-07-generate-claude-local must declare a "Section: Knowledge Maintenance Policy" rule',
  );
});

test('AC-8: step-07-generate-claude-local places policy before Deep Knowledge', () => {
  const content = fileContent(STEP_GEN_CLAUDE_LOCAL);
  const policyIdx = content.indexOf('Section: Knowledge Maintenance Policy');
  const deepIdx = content.indexOf('Section: Deep Knowledge');
  assert(policyIdx !== -1, 'Missing policy section directive');
  assert(deepIdx !== -1, 'Missing Deep Knowledge section directive');
  assert(policyIdx < deepIdx, 'Policy emission must come before Deep Knowledge emission');
});

test('AC-9: step-07-generate-claude-local marks policy as ALWAYS static content (not conditional per project)', () => {
  const content = fileContent(STEP_GEN_CLAUDE_LOCAL);
  assert(
    /Section:\s*Knowledge Maintenance Policy[\s\S]{0,200}?ALWAYS/.test(content),
    'Policy section must be marked ALWAYS — it is universal across projects',
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
  console.log(`${colors.green}All CLAUDE.local.md template ACs satisfied.${colors.reset}`);
  process.exit(0);
}
