/**
 * Tests for tools/validate-skills.js HARD-09 rule
 * (AskUserQuestion-rerouting in teammate-spawnable workflows).
 *
 * Per M23 of `_bmad-output/implementation-artifacts/standalone-auto-flow-unification.md`:
 * - Detect "teammate-spawnable" via SKILL.md frontmatter `teammate_spawnable: true|false` (additive).
 * - Flag AskUserQuestion in step files of teammate-spawnable workflows unless wrapped in TEAMMATE_MODE-conditional.
 * - Severity HIGH, exit 1 in --strict mode.
 *
 * Coverage:
 *   1. PASS — teammate_spawnable=true + AskUserQuestion wrapped in TEAMMATE_MODE-conditional → no HARD-09 finding
 *   2. PASS — teammate_spawnable=true + AskUserQuestion with surrounding "If TEAMMATE_MODE=false (standalone)" guard → no HARD-09 finding
 *   3. FAIL — teammate_spawnable=true + AskUserQuestion unconditional → HARD-09 finding with severity HIGH
 *   4. PASS — teammate_spawnable=false (or absent) + AskUserQuestion unconditional → no HARD-09 finding (rule no-op)
 *   5. PASS — teammate_spawnable=true + AskUserQuestion inside fenced code block → no HARD-09 finding (code block excluded)
 *   6. FAIL — --strict mode exits 1 when HARD-09 finding is emitted on a teammate-spawnable workflow
 *
 * Run: node test/test-skill-validator.js
 * Exit: 0 all pass, 1 any failure
 */

'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(PROJECT_ROOT, 'tools', 'validate-skills.js');

let failed = 0;
let total = 0;

function runValidator(skillDir, extraArgs = []) {
  try {
    const out = execFileSync('node', [VALIDATOR, skillDir, '--json', ...extraArgs], {
      encoding: 'utf-8',
    });
    return { ok: true, json: safeJson(out), code: 0 };
  } catch (error) {
    return {
      ok: false,
      json: error.stdout ? safeJson(error.stdout) : null,
      code: error.status,
      stderr: error.stderr ? error.stderr.toString() : '',
    };
  }
}

function safeJson(out) {
  try {
    return JSON.parse(out);
  } catch {
    return null;
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

function findingsForRule(result, rule) {
  // The validator's --json output is a flat array of findings.
  if (!result.json || !Array.isArray(result.json)) return [];
  return result.json.filter((f) => f.rule === rule);
}

// --------------------- Test fixtures ---------------------

function buildSkillBase(skillName, teammateSpawnableValue) {
  const skillRoot = makeTempDir(`skill-${skillName}`);
  const skillDir = path.join(skillRoot, skillName);
  const fmSpawnableLine = teammateSpawnableValue === undefined ? '' : `teammate_spawnable: ${teammateSpawnableValue}\n`;

  // Compose the SKILL.md frontmatter on a single block (no blank lines between fields)
  const skillMd =
    '---\n' +
    `name: ${skillName}\n` +
    fmSpawnableLine +
    `description: "Test fixture skill for HARD-09 validator coverage."\n` +
    'disable-model-invocation: true\n' +
    '---\n' +
    '\n' +
    'Read FULLY and follow `./workflow.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.\n';

  writeFile(path.join(skillDir, 'SKILL.md'), skillMd);

  // Minimal workflow.md satisfying HARD-01
  const workflowMd =
    `# ${skillName} workflow\n\n## INITIALIZATION\n\n### CHK-INIT — Initialization Read Receipt\n\nEmit ` +
    'CHK-INIT block (test fixture).\n';

  writeFile(path.join(skillDir, 'workflow.md'), workflowMd);

  return { skillRoot, skillDir };
}

function buildStepFile(stepNum, body) {
  const noSkip = '## NO-SKIP CLAUSE (workflow-adherence Rule 1)\n\nCe step DOIT etre execute integralement (test fixture).\n\n';
  const entry = `## STEP ENTRY (CHK-STEP-${stepNum}-ENTRY)\n\nCHK-STEP-${stepNum}-ENTRY PASSED — entering test step.\n\n`;
  const exit = `\n## STEP EXIT (CHK-STEP-${stepNum}-EXIT)\n\nCHK-STEP-${stepNum}-EXIT PASSED — completed test step.\n\n`;
  const next =
    `**Next:** Read FULLY and apply: \`./workflow.md\` — load the file with the Read tool, do not summarise from memory, ` +
    'do not skip sections.\n';

  return `# Step ${stepNum} — Test\n\n${noSkip}${entry}\n${body}\n${exit}${next}`;
}

// --------------------- Cases ---------------------

function case1_PassWrapped() {
  process.stdout.write('Case 1: teammate_spawnable=true + AskUserQuestion wrapped (PASS)\n');
  const { skillRoot, skillDir } = buildSkillBase('case1-pass', 'true');

  const stepBody =
    'If TEAMMATE_MODE=true: emit SendMessage(question) per teammate-mode-routing.md §A.\n' +
    'Else: AskUserQuestion("Pick an option: A or B").\n';

  writeFile(path.join(skillDir, 'steps', 'step-01-prompt.md'), buildStepFile('01', stepBody));

  const result = runValidator(skillDir);
  const findings = findingsForRule(result, 'HARD-09');
  assert(findings.length === 0, 'Wrapped AskUserQuestion should NOT trigger HARD-09 (got ' + findings.length + ' findings)');
}

function case2_PassSurroundingGuard() {
  process.stdout.write('Case 2: teammate_spawnable=true + surrounding "If TEAMMATE_MODE=false (standalone)" guard (PASS)\n');
  const { skillRoot, skillDir } = buildSkillBase('case2-pass', 'true');

  const stepBody =
    'If TEAMMATE_MODE=false (standalone) — display the user prompt directly.\n' +
    '\n' +
    'AskUserQuestion("Pick a profile:").\n' +
    '\n' +
    'In TEAMMATE_MODE=true the lead has propagated the value via task_contract — skip §1.\n';

  writeFile(path.join(skillDir, 'steps', 'step-01-prompt.md'), buildStepFile('01', stepBody));

  const result = runValidator(skillDir);
  const findings = findingsForRule(result, 'HARD-09');
  assert(findings.length === 0, 'AskUserQuestion within "If TEAMMATE_MODE=false (standalone)" guard should NOT trigger HARD-09');
}

function case3_FailUnconditional() {
  process.stdout.write('Case 3: teammate_spawnable=true + AskUserQuestion unconditional (FAIL)\n');
  const { skillRoot, skillDir } = buildSkillBase('case3-fail', 'true');

  const stepBody = 'Call AskUserQuestion("Choose A or B") to gather user input.\n';

  writeFile(path.join(skillDir, 'steps', 'step-01-prompt.md'), buildStepFile('01', stepBody));

  const result = runValidator(skillDir);
  const findings = findingsForRule(result, 'HARD-09');
  assert(findings.length === 1, 'Unconditional AskUserQuestion should trigger exactly 1 HARD-09 finding (got ' + findings.length + ')');
  if (findings.length === 1) {
    assert(findings[0].severity === 'HIGH', 'HARD-09 severity must be HIGH');
    assert(typeof findings[0].line === 'number', 'HARD-09 must report line number');
  }
}

function case4_PassNotSpawnable() {
  process.stdout.write('Case 4: teammate_spawnable absent (or false) + AskUserQuestion unconditional (PASS / no-op)\n');
  const { skillRoot, skillDir } = buildSkillBase('case4-pass');

  const stepBody = 'Call AskUserQuestion("Choose A or B") to gather user input.\n';

  writeFile(path.join(skillDir, 'steps', 'step-01-prompt.md'), buildStepFile('01', stepBody));

  const result = runValidator(skillDir);
  const findings = findingsForRule(result, 'HARD-09');
  assert(findings.length === 0, 'HARD-09 must be a no-op when teammate_spawnable is absent (got ' + findings.length + ' findings)');
}

function case5_PassInsideCodeBlock() {
  process.stdout.write('Case 5: teammate_spawnable=true + AskUserQuestion inside fenced code block (PASS)\n');
  const { skillRoot, skillDir } = buildSkillBase('case5-pass', 'true');

  const stepBody =
    'Example of a forbidden pattern :\n' +
    '\n' +
    '```\n' +
    'AskUserQuestion("This is a documentation example, not a real call")\n' +
    '```\n' +
    '\n' +
    'In actual code, route via SendMessage when TEAMMATE_MODE=true.\n';

  writeFile(path.join(skillDir, 'steps', 'step-01-prompt.md'), buildStepFile('01', stepBody));

  const result = runValidator(skillDir);
  const findings = findingsForRule(result, 'HARD-09');
  assert(findings.length === 0, 'AskUserQuestion inside fenced code block should NOT trigger HARD-09');
}

function case6_StrictExitsNonZero() {
  process.stdout.write('Case 6: --strict exits 1 when HARD-09 emitted on teammate-spawnable workflow\n');
  const { skillRoot, skillDir } = buildSkillBase('case6-fail', 'true');

  const stepBody = 'Call AskUserQuestion("Pick something") directly.\n';

  writeFile(path.join(skillDir, 'steps', 'step-01-prompt.md'), buildStepFile('01', stepBody));

  const result = runValidator(skillDir, ['--strict']);
  assert(!result.ok, '--strict must exit non-zero on HIGH-severity HARD-09 finding');
  const findings = findingsForRule(result, 'HARD-09');
  assert(findings.length === 1, 'HARD-09 finding must be present in --strict output');
}

// --------------------- Run ---------------------

function main() {
  process.stdout.write('test/test-skill-validator.js — HARD-09 (AskUserQuestion-rerouting) coverage\n\n');

  case1_PassWrapped();
  case2_PassSurroundingGuard();
  case3_FailUnconditional();
  case4_PassNotSpawnable();
  case5_PassInsideCodeBlock();
  case6_StrictExitsNonZero();

  process.stdout.write(`\nResults: ${total - failed}/${total} passed${failed ? `, ${failed} FAILED` : ''}\n`);
  process.exit(failed ? 1 : 0);
}

main();
