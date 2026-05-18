/**
 * Tests for tools/validate-skills.js DOM-01 rule.
 *
 * DOM-01: For each row in src/bmm-skills/2-plan-workflows/bmad-create-prd/data/project-types.csv
 * with a non-empty `domain_stack` column, verify the file exists at the resolved path
 * (relative to repo root for `bmad-shared/...` references).
 *
 * Severity: HIGH (exit 1 in --strict mode).
 *
 * Coverage:
 *   1. Valid: fixture CSV with `domain_stack: <real-existing-file>` → no DOM-01 finding
 *   2. Invalid: fixture CSV with `domain_stack: bmad-shared/domains/nonexistent.md` → HIGH finding + exit non-zero in --strict
 *   3. Empty: fixture row with empty `domain_stack` → no finding (NO-OP, opt-out is valid)
 *   4. Whitespace: fixture row with `domain_stack: "   "` (whitespace) → treated as empty (NO-OP), no finding
 *
 * Run: node test/test-domain-stack-rule.js
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

function runValidator(extraArgs = [], envOverrides = {}) {
  try {
    const out = execFileSync('node', [VALIDATOR, '--json', ...extraArgs], {
      encoding: 'utf-8',
      cwd: PROJECT_ROOT,
      env: { ...process.env, ...envOverrides },
    });
    return { ok: true, json: safeJson(out), code: 0, stdout: out };
  } catch (error) {
    return {
      ok: false,
      json: error.stdout ? safeJson(error.stdout) : null,
      code: error.status,
      stdout: error.stdout ? error.stdout.toString() : '',
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

function makeTempCsv(rows) {
  const header =
    'project_type,detection_signals,key_questions,required_sections,skip_sections,web_search_triggers,innovation_signals,domain_stack';
  const lines = [header];
  for (const r of rows) {
    const cols = [
      r.project_type,
      r.detection_signals,
      r.key_questions,
      r.required_sections,
      r.skip_sections,
      r.web_search_triggers,
      r.innovation_signals,
      r.domain_stack,
    ];
    lines.push(cols.map((v) => (v == null ? '' : String(v))).join(','));
  }
  const tmp = path.join(os.tmpdir(), `dom-01-${Date.now()}-${Math.random().toString(36).slice(2)}.csv`);
  fs.writeFileSync(tmp, lines.join('\n') + '\n', 'utf-8');
  return tmp;
}

function findingsForRule(result, rule) {
  if (!result.json || !Array.isArray(result.json)) return [];
  return result.json.filter((f) => f.rule === rule);
}

// --------------------- Cases ---------------------

function case1_ValidExistingFile() {
  process.stdout.write('Case 1: Valid — domain_stack points to existing file (PASS)\n');
  const csv = makeTempCsv([
    {
      project_type: 'game',
      detection_signals: 'game',
      key_questions: 'q1',
      required_sections: 'r1',
      skip_sections: 's1',
      web_search_triggers: 'w1',
      innovation_signals: 'i1',
      domain_stack: 'bmad-shared/domains/game-dev.md',
    },
  ]);

  const result = runValidator([], { BMAD_PROJECT_TYPES_CSV_OVERRIDE: csv });
  const findings = findingsForRule(result, 'DOM-01');
  assert(findings.length === 0, 'Valid existing file MUST NOT trigger DOM-01 (got ' + findings.length + ')');
  fs.unlinkSync(csv);
}

function case2_InvalidMissingFile() {
  process.stdout.write('Case 2: Invalid — domain_stack points to non-existent file (FAIL → exit non-zero in --strict)\n');
  const csv = makeTempCsv([
    {
      project_type: 'game',
      detection_signals: 'game',
      key_questions: 'q1',
      required_sections: 'r1',
      skip_sections: 's1',
      web_search_triggers: 'w1',
      innovation_signals: 'i1',
      domain_stack: 'bmad-shared/domains/nonexistent.md',
    },
  ]);

  const result = runValidator([], { BMAD_PROJECT_TYPES_CSV_OVERRIDE: csv });
  const findings = findingsForRule(result, 'DOM-01');
  assert(findings.length === 1, 'Missing file MUST trigger exactly 1 DOM-01 finding (got ' + findings.length + ')');
  if (findings.length === 1) {
    assert(findings[0].severity === 'HIGH', 'DOM-01 severity must be HIGH (got ' + findings[0].severity + ')');
    assert(typeof findings[0].file === 'string' && findings[0].file.length > 0, 'DOM-01 finding must report the offending file');
    assert(
      (findings[0].detail || '').includes('nonexistent.md') || (findings[0].detail || '').includes('domain_stack'),
      'DOM-01 finding detail must mention the missing path or domain_stack',
    );
  }

  // --strict must exit non-zero
  const strictResult = runValidator(['--strict'], { BMAD_PROJECT_TYPES_CSV_OVERRIDE: csv });
  assert(strictResult.code !== 0, 'DOM-01 finding under --strict MUST cause non-zero exit code (got ' + strictResult.code + ')');
  fs.unlinkSync(csv);
}

function case3_EmptyDomainStack() {
  process.stdout.write('Case 3: Empty domain_stack column (PASS — opt-out NO-OP)\n');
  const csv = makeTempCsv([
    {
      project_type: 'api_backend',
      detection_signals: 'API',
      key_questions: 'q1',
      required_sections: 'r1',
      skip_sections: 's1',
      web_search_triggers: 'w1',
      innovation_signals: 'i1',
      domain_stack: '',
    },
  ]);

  const result = runValidator([], { BMAD_PROJECT_TYPES_CSV_OVERRIDE: csv });
  const findings = findingsForRule(result, 'DOM-01');
  assert(findings.length === 0, 'Empty domain_stack MUST NOT trigger DOM-01 (got ' + findings.length + ')');
  fs.unlinkSync(csv);
}

function case4_WhitespaceDomainStack() {
  process.stdout.write('Case 4: Whitespace-only domain_stack (PASS — treated as empty NO-OP)\n');
  const csv = makeTempCsv([
    {
      project_type: 'api_backend',
      detection_signals: 'API',
      key_questions: 'q1',
      required_sections: 'r1',
      skip_sections: 's1',
      web_search_triggers: 'w1',
      innovation_signals: 'i1',
      domain_stack: '   ',
    },
  ]);

  const result = runValidator([], { BMAD_PROJECT_TYPES_CSV_OVERRIDE: csv });
  const findings = findingsForRule(result, 'DOM-01');
  assert(findings.length === 0, 'Whitespace-only domain_stack MUST NOT trigger DOM-01 (got ' + findings.length + ')');
  fs.unlinkSync(csv);
}

// --------------------- Driver ---------------------

function main() {
  process.stdout.write('Running DOM-01 validator tests...\n\n');

  case1_ValidExistingFile();
  case2_InvalidMissingFile();
  case3_EmptyDomainStack();
  case4_WhitespaceDomainStack();

  process.stdout.write(`\nTotal: ${total}, Failed: ${failed}\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
