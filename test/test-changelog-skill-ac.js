/**
 * changelog Skill — Acceptance Criteria Test Runner
 *
 * Asserts that `.claude/skills/changelog/SKILL.md` contains every generalized
 * improvement we extracted from the v1.5.0 release ad-hoc fixes:
 *   - Pre-flight + gap detection (§2.1)
 *   - Post-upgrade commands discovery (§3.1)
 *   - User-Facing Voice anti-tech-dump filter (§5.0)  ← v1.11.x
 *   - Language resolution via document_output_language (§5.1)
 *   - Impact-weighted theme ordering (§5.2)
 *   - Voice gate before Slack-immutability warning (§5.4)
 *   - Pre-push tarball sanity check (§7.5)
 *   - Provenance note on workflow path (§8)
 *   - CI failure triage + recovery menu (§9.5 / §9.6)
 *   - Slack capability probe (§10.0)
 *   - Structured Slack post template with install + post-upgrade sections (§10.2)
 *
 * Usage: node test/test-changelog-skill-ac.js
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
const SKILL = path.join(PROJECT_ROOT, '.claude/skills/changelog/SKILL.md');

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
// Structure — skill file and top-level workflow
// ============================================================

console.log(`\n${colors.cyan}Structure${colors.reset}`);

test('AC-1: skill file exists at expected path', () => {
  assert(fs.existsSync(SKILL), `Missing: ${SKILL}`);
});

test('AC-2: skill frontmatter contains release/publish trigger keywords', () => {
  const content = fileContent(SKILL);
  for (const kw of ['release', 'publish', 'bump version', 'Slack']) {
    assert(content.includes(kw), `Description should mention "${kw}" for discoverability`);
  }
});

// ============================================================
// G8 — CHANGELOG gap detection (§2.1)
// ============================================================

console.log(`\n${colors.cyan}G8 — CHANGELOG gap detection${colors.reset}`);

test('AC-3: §2.1 declares a CHANGELOG gap detection sub-step', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 2\.1 CHANGELOG\.md gap detection/i.test(content), 'Missing §2.1 CHANGELOG.md gap detection header');
});

test('AC-4: gap detection compares git tags against CHANGELOG.md entries', () => {
  const content = fileContent(SKILL);
  assert(/git tag.*grep.*v\[0-9\]/s.test(content), 'Gap detection must list git tags matching v*');
  assert(/CHANGELOG\.md/.test(content), 'Gap detection must reference CHANGELOG.md');
  assert(/comm -23/.test(content), 'Gap detection must compute a set difference (comm -23)');
});

test('AC-5: gap detection offers [B]ackfill / [I]gnore / [H]alt menu', () => {
  const content = fileContent(SKILL);
  for (const opt of ['[B]ackfill', '[I]gnore', '[H]alt']) {
    assert(content.includes(opt), `Gap menu missing option: ${opt}`);
  }
});

// ============================================================
// G3 — Post-upgrade commands discovery (§3.1)
// ============================================================

console.log(`\n${colors.cyan}G3 — Post-upgrade commands discovery${colors.reset}`);

test('AC-6: §3.1 declares a post-upgrade commands discovery sub-step', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 3\.1 Post-upgrade commands discovery/i.test(content), 'Missing §3.1 header');
});

test('AC-7: discovery reads workflow-context.md post_install_commands AND scans skills', () => {
  const content = fileContent(SKILL);
  assert(/post_install_commands/.test(content), 'Must reference workflow-context.md post_install_commands key');
  assert(/bootstrap|refresh|migrate|init/.test(content), 'Must scan for bootstrap/refresh/migrate/init skills');
});

test('AC-8: discovery persists POST_UPGRADE_COMMANDS for downstream use', () => {
  const content = fileContent(SKILL);
  assert(/POST_UPGRADE_COMMANDS/.test(content), 'Must store discovered list as POST_UPGRADE_COMMANDS');
});

// ============================================================
// G17 — User-facing voice / anti-tech-dump filter (§5.0 + §5.4)
// ============================================================

console.log(`\n${colors.cyan}G17 — User-facing voice / anti-tech-dump${colors.reset}`);

test('AC-28: §5.0 declares a User-Facing Voice anti-tech-dump filter', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 5\.0 User-Facing Voice/i.test(content), 'Missing §5.0 User-Facing Voice header');
  assert(/audience/i.test(content), '§5.0 must define the audience explicitly');
  assert(/(users? (do not|don'?t) (want|have))|not contributors/i.test(content), '§5.0 must contrast user-want vs contributor-want');
});

test('AC-29: §5.0 lists forbidden tech-dump patterns with grep regexes', () => {
  const content = fileContent(SKILL);
  assert(/Forbidden tech-dump patterns/i.test(content), 'Missing forbidden-patterns subheading');
  for (const fragment of [
    'File:line references',
    'Line-count annotations',
    'Internal rule/code IDs',
    'Refactor narratives',
    'Codemod/script internals',
    'Cross-workflow propagation',
    'Diff stats',
  ]) {
    assert(content.includes(fragment), `Forbidden pattern row missing: ${fragment}`);
  }
});

test('AC-30: §5.0 defines an Outcome-First Rewrite Rule with allow/forbid lead-ins', () => {
  const content = fileContent(SKILL);
  assert(/Outcome-First Rewrite Rule/i.test(content), 'Missing Outcome-First Rewrite Rule subheading');
  assert(/You can now/i.test(content), 'Outcome-First lead-in "You can now…" missing');
  assert(/Before:.*Now:/i.test(content), 'Outcome-First lead-in "Before: … Now: …" missing');
  assert(
    /Validator validates/i.test(content) || /Codemod migrates/i.test(content),
    'Forbidden lead-ins (Validator validates / Codemod migrates) must be listed as anti-patterns',
  );
});

test('AC-31: §5.0 ships concrete before/after rewrite examples', () => {
  const content = fileContent(SKILL);
  assert(/Tech dump.*User-facing rewrite/is.test(content), 'Before/after table header missing');
  assert(/HARD-01\.\.HARD-08/.test(content), 'Concrete example referencing the actual tech-dump pattern that triggered this rule');
});

test('AC-32: §5.0 mandates a self-check grep before §5.4 review', () => {
  const content = fileContent(SKILL);
  assert(/Mandatory self-check/i.test(content), 'Missing "Mandatory self-check" gate');
  assert(/grep -nE/.test(content), 'Self-check must include grep -nE shell snippet');
});

test('AC-33: §5.4 voice gate runs the self-check before showing the draft', () => {
  const content = fileContent(SKILL);
  // §5.4 must explicitly require running §5.0 grep BEFORE presenting to the user
  const review = content.match(/####\s+5\.4[\s\S]*?(?=####\s+\d+\.\d|###\s+\d+\.|$)/);
  assert(review, '§5.4 section must exist');
  const reviewText = review[0];
  assert(/Voice gate/i.test(reviewText), '§5.4 must contain a "Voice gate"');
  assert(/§\s*5\.0/.test(reviewText) || /5\.0 self-check/i.test(reviewText), '§5.4 voice gate must reference §5.0 self-check');
  assert(
    /before.*(showing|presenting).*draft|before.*user/i.test(reviewText),
    '§5.4 voice gate must run BEFORE presenting the draft to the user',
  );
});

// ============================================================
// G7 — Language resolution (§5.1)
// ============================================================

console.log(`\n${colors.cyan}G7 — Language resolution${colors.reset}`);

test('AC-9: §5.1 writes CHANGELOG in document_output_language with communication_language fallback', () => {
  const content = fileContent(SKILL);
  assert(/document_output_language/.test(content), 'Must reference document_output_language');
  assert(/communication_language/.test(content), 'Must mention communication_language (as fallback)');
  assert(
    /fall back.*communication_language/i.test(content) || /communication_language.*fallback/i.test(content),
    'Must declare communication_language as explicit fallback',
  );
});

// ============================================================
// G2 — Impact-weighted theme ordering (§5.2)
// ============================================================

console.log(`\n${colors.cyan}G2 — Impact-weighted theme ordering${colors.reset}`);

test('AC-10: §5.2 declares impact_score formula with lines × files × breaking', () => {
  const content = fileContent(SKILL);
  assert(/impact_score/.test(content), 'Must define impact_score');
  assert(/lines_changed.*files_changed.*breaking/s.test(content), 'Formula must include lines × files × breaking multiplier');
});

test('AC-11: §5.2 sorts themes descending and routes top theme to Highlight', () => {
  const content = fileContent(SKILL);
  assert(/sort/i.test(content) && /descending/i.test(content), 'Must sort themes descending');
  assert(/Highlight/i.test(content), 'Top theme must get a Highlight treatment');
});

// ============================================================
// G6 — Slack immutability warning (§5.4)
// ============================================================

console.log(`\n${colors.cyan}G6 — Slack immutability warning${colors.reset}`);

test('AC-12: §5.4 warns that Slack posts are immutable before the accept gate', () => {
  const content = fileContent(SKILL);
  assert(/Slack.*immutable|immutable.*Slack/i.test(content), 'Must explicitly warn that Slack post will be immutable');
  assert(/does not support editing/i.test(content), 'Must mention MCP lacks edit support');
});

// ============================================================
// G11 — Pre-push tarball sanity check (§7.5)
// ============================================================

console.log(`\n${colors.cyan}G11 — Pre-push tarball sanity check${colors.reset}`);

test('AC-13: §7.5 runs npm pack --dry-run and parses size/file count', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 7\.5 Pre-push tarball sanity check/i.test(content), 'Missing §7.5 header');
  assert(/npm pack --dry-run/.test(content), 'Must run npm pack --dry-run');
  assert(/package size/.test(content), 'Must parse package size');
  assert(/total files/.test(content), 'Must parse total file count');
});

test('AC-14: §7.5 HALTs on worktrees, node_modules, .git, large size, or excessive file count', () => {
  const content = fileContent(SKILL);
  assert(/\.claude\/worktrees/.test(content), 'HALT pattern must block .claude/worktrees/');
  assert(/node_modules/.test(content), 'HALT pattern must block node_modules/');
  assert(/\\\.git\/|\\\.git\\\/|\.git\//.test(content), 'HALT pattern must block .git/');
  assert(/5000/.test(content), 'HALT threshold for file count (5000) must be documented');
  assert(/50\s*MB/i.test(content), 'HALT threshold for size (50 MB) must be documented');
});

// ============================================================
// G16 — Provenance note (§8)
// ============================================================

console.log(`\n${colors.cyan}G16 — Provenance note${colors.reset}`);

test('AC-15: §8 documents provenance + workflow file stability requirement', () => {
  const content = fileContent(SKILL);
  assert(/--provenance/.test(content), 'Must mention --provenance flag');
  assert(/publish\.yaml/.test(content), 'Must reference publish.yaml');
  assert(
    /OIDC authentication error|trusted publisher/i.test(content),
    'Must warn about OIDC / trusted publisher breakage on workflow rename',
  );
});

// ============================================================
// G14 — CI failure triage (§9.5)
// ============================================================

console.log(`\n${colors.cyan}G14 — CI failure triage${colors.reset}`);

test('AC-16: §9.5 fetches failed logs via gh run view --log-failed', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 9\.5 CI failure triage/i.test(content), 'Missing §9.5 header');
  assert(/gh run view.*--log-failed/.test(content), 'Must fetch logs via gh run view --log-failed');
});

test('AC-17: §9.5 triage table covers tag mismatch, EPUBLISHFAIL, OIDC, npm test', () => {
  const content = fileContent(SKILL);
  assert(/Tag\/package\.json mismatch/.test(content), 'Must triage version mismatch');
  assert(/EPUBLISHFAIL/.test(content), 'Must triage EPUBLISHFAIL');
  assert(/OIDC/.test(content), 'Must triage OIDC failures');
  assert(/npm test.*failure/i.test(content), 'Must triage npm test regressions');
});

// ============================================================
// G15 — Recovery menu (§9.6)
// ============================================================

console.log(`\n${colors.cyan}G15 — Recovery menu${colors.reset}`);

test('AC-18: §9.6 declares a codified recovery menu', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 9\.6 Recovery menu/i.test(content), 'Missing §9.6 header');
});

test('AC-19: recovery menu offers Fix+force-retag / Patch bump / Workflow replay / Abort', () => {
  const content = fileContent(SKILL);
  for (const opt of ['[F]ix + force-retag', '[P]atch bump', '[W]orkflow replay', '[A]bort']) {
    assert(content.includes(opt), `Recovery menu missing option: ${opt}`);
  }
});

test('AC-20: Fix+force-retag branch uses git tag -d + push :refs/tags + force push', () => {
  const content = fileContent(SKILL);
  assert(/git tag -d/.test(content), 'Force-retag must delete local tag');
  assert(/:refs\/tags/.test(content), 'Force-retag must delete remote tag via refspec');
});

test('AC-21: Workflow replay uses gh workflow run publish.yaml --ref', () => {
  const content = fileContent(SKILL);
  assert(/gh workflow run publish\.yaml --ref/.test(content), 'Workflow replay must use gh workflow run ... --ref');
});

// ============================================================
// G5 — Slack capability probe (§10.0)
// ============================================================

console.log(`\n${colors.cyan}G5 — Slack capability probe${colors.reset}`);

test('AC-22: §10.0 probes Slack MCP before asking for channel', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 10\.0 Slack capability probe/i.test(content), 'Missing §10.0 header');
  assert(/mcp__slack__channels_list/.test(content), 'Probe must call mcp__slack__channels_list');
});

test('AC-23: probe error on SLACK_MCP_ADD_MESSAGE_TOOL offers Fix/Manual/Skip menu', () => {
  const content = fileContent(SKILL);
  assert(/SLACK_MCP_ADD_MESSAGE_TOOL/.test(content), 'Must detect SLACK_MCP_ADD_MESSAGE_TOOL error pattern');
  for (const opt of ['[F]ix config', '[M]anual copy-paste', '[S]kip Slack']) {
    assert(content.includes(opt), `Probe fallback menu missing option: ${opt}`);
  }
});

// ============================================================
// G1 — Structured Slack post template (§10.2)
// ============================================================

console.log(`\n${colors.cyan}G1 — Structured Slack post template${colors.reset}`);

test('AC-24: §10.2 declares a structured Slack post template', () => {
  const content = fileContent(SKILL);
  assert(/###?#? 10\.2 Slack post template/i.test(content), 'Missing §10.2 header');
});

test('AC-25: template contains Header, Install, Highlight, Link sections (★ always)', () => {
  const content = fileContent(SKILL);
  for (const section of ['Header', 'Install', 'Highlight', 'Link']) {
    assert(new RegExp(`\\b${section}\\b`).test(content), `Template missing ★ section: ${section}`);
  }
});

test('AC-26: template includes conditional Post-upgrade section bound to POST_UPGRADE_COMMANDS', () => {
  const content = fileContent(SKILL);
  assert(/Post-upgrade/.test(content), 'Template must include Post-upgrade section');
  assert(/POST_UPGRADE_COMMANDS/.test(content), 'Post-upgrade section must be gated on POST_UPGRADE_COMMANDS (non-empty)');
});

test('AC-27: template derives install commands from package name automatically', () => {
  const content = fileContent(SKILL);
  assert(/npm install -g/.test(content), 'Template must document global install pattern');
  assert(/npx .*install/.test(content), 'Template must document npx interactive install pattern');
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
  console.log(`${colors.green}All changelog-skill ACs satisfied.${colors.reset}`);
  process.exit(0);
}
