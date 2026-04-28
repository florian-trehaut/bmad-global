/**
 * Story Spec Validator (story-spec v2)
 *
 * Validates that a story spec (markdown file or tracker issue body) conforms to the
 * v2 schema declared in `src/core-skills/bmad-shared/spec-completeness-rule.md`.
 *
 * Two profiles:
 *   --profile=full   (default for /bmad-create-story output)
 *   --profile=quick  (default for /bmad-quick-dev spec-template.md output)
 *
 * Quick profile allows terse N/A justifications on Real-Data Findings + External Research.
 *
 * Usage:
 *   node tools/validate-story-spec.js path/to/story.md
 *   node tools/validate-story-spec.js path/to/story.md --profile=quick
 *   node tools/validate-story-spec.js path/to/story.md --strict
 *   node tools/validate-story-spec.js path/to/story.md --json
 *   node tools/validate-story-spec.js path/to/story.md --warn-only
 *
 * Exit codes:
 *   0 = no findings (or --strict not set and only WARNINGs / INFO)
 *   1 = BLOCKER findings (or --strict + any HIGH+ finding)
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// --- CLI parsing ---

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const JSON_OUTPUT = args.includes('--json');
const WARN_ONLY = args.includes('--warn-only');
const profileArg = args.find((a) => a.startsWith('--profile='));
const PROFILE = profileArg ? profileArg.split('=')[1] : 'full';
const positional = args.filter((a) => !a.startsWith('--'));

if (positional.length === 0) {
  process.stderr.write('Usage: node tools/validate-story-spec.js <story-file> [--profile=full|quick] [--strict] [--warn-only] [--json]\n');
  process.exit(2);
}

if (PROFILE !== 'full' && PROFILE !== 'quick') {
  process.stderr.write(`Invalid --profile=${PROFILE}. Must be "full" or "quick".\n`);
  process.exit(2);
}

const SEVERITY_ORDER = { BLOCKER: 0, MAJOR: 1, MINOR: 2, INFO: 3 };

// --- Spec v2 schema (canonical mandatory sections) ---

// Each entry: { heading regex, label, mandatoryIn: ['full', 'quick'], conditional?: function(text) }
const MANDATORY_SECTIONS = [
  { rx: /^##\s+Definition of Done/im, label: 'Definition of Done (product)', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Problem\b/im, label: 'Problem', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Proposed Solution/im, label: 'Proposed Solution', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Scope\b/im, label: 'Scope (Included / Excluded)', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Out of Scope/im, label: 'Out of Scope (explicit non-goals)', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Business Context/im, label: 'Business Context', mandatoryIn: ['full', 'quick'] },
  { rx: /^(##|<summary>)\s*Technical Context/im, label: 'Technical Context', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Real-Data Findings/im, label: 'Real-Data Findings', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+External Research/im, label: 'External Research', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+NFR Registry/im, label: 'NFR Registry', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Security Gate/im, label: 'Security Gate', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Observability Requirements/im, label: 'Observability Requirements', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Implementation Plan/im, label: 'Implementation Plan', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Guardrails/im, label: 'Guardrails', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Validation Metier/im, label: 'Validation Metier', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Boundaries/im, label: 'Boundaries (Always / Ask First / Never)', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Risks (&|and) Assumptions/im, label: 'Risks & Assumptions Register', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+INVEST Self-Check/im, label: 'INVEST Self-Check', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+Test Strategy/im, label: 'Test Strategy', mandatoryIn: ['full', 'quick'] },
  { rx: /^##\s+File List/im, label: 'File List', mandatoryIn: ['full', 'quick'] },
];

// --- Validators ---

const findings = [];

function addFinding({ severity, ruleId, message, line }) {
  findings.push({ severity, ruleId, message, line: line || null });
}

function validateMandatorySections(text) {
  for (const section of MANDATORY_SECTIONS) {
    if (!section.mandatoryIn.includes(PROFILE)) continue;
    if (!section.rx.test(text)) {
      addFinding({
        severity: 'BLOCKER',
        ruleId: 'SPEC-MISSING-SECTION',
        message: `Missing mandatory section: ${section.label} (heading regex ${section.rx})`,
      });
    }
  }
}

function extractSection(text, headingRegex) {
  const match = text.match(headingRegex);
  if (!match) return null;
  const start = match.index;
  // Find next H2 heading
  const after = text.slice(start + match[0].length);
  const nextMatch = after.match(/^##\s+/m);
  const end = nextMatch ? start + match[0].length + nextMatch.index : text.length;
  return text.slice(start, end);
}

function validateAcFormat(text) {
  // Extract Business Context section, find BACs
  const businessContext = extractSection(text, /^##\s+Business Context/im);
  if (businessContext) {
    const bacLines = businessContext.match(/^[\s-]*\[\s?\]\s+BAC-\d+/gm) || [];
    const bacBlocks = businessContext.split(/^[\s-]*\[\s?\]\s+BAC-\d+/gm).slice(1);
    for (const [i, header] of bacLines.entries()) {
      const body = bacBlocks[i] || '';
      const fullBac = header + body.split(/^[\s-]*\[\s?\]\s+BAC-\d+/m)[0];
      // Must contain "Given" + "when" + "then" (case-insensitive)
      const hasGiven = /\bGiven\b/i.test(fullBac);
      const hasWhen = /\bwhen\b/i.test(fullBac);
      const hasThen = /\bthen\b/i.test(fullBac);
      if (!(hasGiven && hasWhen && hasThen)) {
        addFinding({
          severity: 'BLOCKER',
          ruleId: 'SPEC-BAC-FORMAT',
          message: `${header.trim()}: BACs MUST use Given/When/Then format (per ac-format-rule.md). Missing keyword(s): ${[!hasGiven && 'Given', !hasWhen && 'when', !hasThen && 'then'].filter(Boolean).join(', ')}`,
        });
      }
    }
  }

  // Extract Implementation Plan, find TACs
  const implPlan = extractSection(text, /^##\s+Implementation Plan/im);
  if (implPlan) {
    // TACs may be nested in a subsection "### Technical Acceptance Criteria"
    const tacRegex =
      /^[\s-]*\[\s?\]\s+TAC-\d+\s*\*?\(?\s*(Ubiquitous|Event-driven|State-driven|Optional|Unwanted)\s*[,)]?[^*\n]*\*?\s*[:.-]/gim;
    const tacMatches = [...implPlan.matchAll(tacRegex)];
    // Also detect TACs that don't declare a pattern
    const tacAllRegex = /^[\s-]*\[\s?\]\s+TAC-\d+/gim;
    const tacAllMatches = [...implPlan.matchAll(tacAllRegex)];
    if (tacAllMatches.length > 0 && tacMatches.length < tacAllMatches.length) {
      addFinding({
        severity: 'BLOCKER',
        ruleId: 'SPEC-TAC-EARS-PATTERN',
        message: `${tacAllMatches.length - tacMatches.length} TAC(s) do not declare an EARS pattern (Ubiquitous / Event-driven / State-driven / Optional / Unwanted). Format: \`TAC-N *(Pattern, refs BAC-X)*: ...\``,
      });
    }
    // Each TAC must reference at least one BAC
    const tacWithoutBacRefRegex = /^[\s-]*\[\s?\]\s+TAC-\d+\s*\*?\([^)]*\)\*?[^]*?(?=\n\s*-|\n##|$)/gim;
    const tacItems = [...implPlan.matchAll(/^[\s-]*\[\s?\]\s+TAC-\d+[^]*?(?=\n\s*-\s*\[|\n##|\n$|$)/gm)];
    for (const tacMatch of tacItems) {
      const tacText = tacMatch[0];
      if (!/refs?\s+BAC-\d/i.test(tacText)) {
        const tacIdMatch = tacText.match(/TAC-\d+/);
        addFinding({
          severity: 'BLOCKER',
          ruleId: 'SPEC-TAC-MISSING-BAC-REF',
          message: `${tacIdMatch ? tacIdMatch[0] : 'A TAC'} does not reference any BAC. Format: \`TAC-N *(Pattern, refs BAC-X)*: ...\``,
        });
      }
    }
  }
}

function validateInvest(text) {
  const investSection = extractSection(text, /^##\s+INVEST Self-Check/im);
  if (!investSection) return; // already caught by mandatory section check
  const criteria = ['Independent', 'Negotiable', 'Valuable', 'Estimable', 'Small', 'Testable'];
  for (const crit of criteria) {
    if (!new RegExp(`\\b${crit}\\b`, 'i').test(investSection)) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-INVEST-MISSING-CRITERION',
        message: `INVEST self-check missing criterion: ${crit}`,
      });
    }
  }
  // Check for unanswered (blank or "?" answers)
  const unanswered = (investSection.match(/\|\s*[?-]\s*\|/g) || []).length;
  if (unanswered > 0) {
    addFinding({
      severity: 'MAJOR',
      ruleId: 'SPEC-INVEST-UNANSWERED',
      message: `INVEST self-check has ${unanswered} unanswered row(s) (blank or "?" cells). All 6 criteria must be YES/NO with evidence.`,
    });
  }
}

function validateBoundaries(text) {
  const section = extractSection(text, /^##\s+Boundaries/im);
  if (!section) return;
  const buckets = [
    { rx: /✅\s*Always Do/i, label: 'Always Do' },
    { rx: /⚠️\s*Ask First/i, label: 'Ask First' },
    { rx: /🚫\s*Never Do/i, label: 'Never Do' },
  ];
  for (const b of buckets) {
    if (!b.rx.test(section)) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-BOUNDARIES-MISSING-BUCKET',
        message: `Boundaries section missing the "${b.label}" bucket. All three buckets (Always Do / Ask First / Never Do) are mandatory.`,
      });
    }
  }
}

function validateOutOfScope(text) {
  const section = extractSection(text, /^##\s+Out of Scope/im);
  if (!section) return;
  const oosCount = (section.match(/^[\s|]*OOS-\d+/gm) || []).length;
  if (oosCount < 2) {
    addFinding({
      severity: 'MAJOR',
      ruleId: 'SPEC-OUT-OF-SCOPE-INSUFFICIENT',
      message: `Out-of-Scope register has only ${oosCount} item(s); rule requires at least 2. List items a thoughtful reader might EXPECT to be included.`,
    });
  }
}

function validateVm(text) {
  const section = extractSection(text, /^##\s+Validation Metier/im);
  if (!section) return;
  const vmItems = section.match(/^[\s|-]*\[?\s?\]?\s*VM(-NR)?-\d+/gm) || [];
  if (vmItems.length === 0) {
    addFinding({
      severity: 'BLOCKER',
      ruleId: 'SPEC-VM-EMPTY',
      message: `Validation Metier section is empty (no VM-N items). Each story must have at least one production validation item.`,
    });
  }
}

function validateRealDataAndResearch(text) {
  // In quick profile, terse N/A is allowed; in full profile, section must have substantive content.
  const sections = [
    { label: 'Real-Data Findings', rx: /^##\s+Real-Data Findings/im },
    { label: 'External Research', rx: /^##\s+External Research/im },
  ];
  for (const s of sections) {
    const content = extractSection(text, s.rx);
    if (!content) continue; // missing-section already caught
    const body = content.replace(s.rx, '').trim();
    const isJustifiedNA = /^N\/A\s*[—-]\s*\S/.test(body) || /N\/A\s*[—-]\s*\S/m.test(body.split('\n')[0] || '');

    if (PROFILE === 'full' && body.length < 200 && !isJustifiedNA) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-PHASE-B-SHALLOW',
        message: `${s.label} section is too shallow (< 200 chars) and does not include a justified N/A. Full profile requires substantive evidence; if N/A, write "N/A — {1-line justification}".`,
      });
    }
    if (PROFILE === 'quick' && body.length < 30) {
      addFinding({
        severity: 'MINOR',
        ruleId: 'SPEC-PHASE-B-MINIMAL',
        message: `${s.label} section is empty or extremely short. Quick profile allows terse N/A but requires at least a 1-line justification.`,
      });
    }
  }
}

function validateSecurityGate(text) {
  const section = extractSection(text, /^##\s+Security Gate/im);
  if (!section) return;
  const verdictMatch = section.match(/Verdict:\**\s*(PASS|FAIL|N\/A)/im);
  if (!verdictMatch) {
    addFinding({
      severity: 'BLOCKER',
      ruleId: 'SPEC-SECURITY-GATE-NO-VERDICT',
      message: `Security Gate section does not declare a binary verdict (PASS / FAIL / N/A). Required: \`**Verdict:** PASS | FAIL | N/A\``,
    });
  }
}

function validateNfrRegistry(text) {
  const section = extractSection(text, /^##\s+NFR Registry/im);
  if (!section) return;
  const categories = [
    'Performance',
    'Scalability',
    'Availability',
    'Reliability',
    'Security',
    'Observability',
    'Maintainability',
    'Usability',
  ];
  // We allow Security and Observability to be cross-references rather than full rows
  const requiredCategories = ['Performance', 'Scalability', 'Availability', 'Reliability', 'Maintainability', 'Usability'];
  for (const cat of requiredCategories) {
    if (!new RegExp(`\\b${cat}\\b`, 'i').test(section)) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-NFR-MISSING-CATEGORY',
        message: `NFR Registry missing category: ${cat}. All 7 categories must be addressed (status: PRESENT / MISSING / PARTIAL / N/A justified).`,
      });
    }
  }
}

// --- Main ---

const filePath = path.resolve(positional[0]);
if (!fs.existsSync(filePath)) {
  process.stderr.write(`File not found: ${filePath}\n`);
  process.exit(2);
}

const text = fs.readFileSync(filePath, 'utf-8');

validateMandatorySections(text);
validateAcFormat(text);
validateInvest(text);
validateBoundaries(text);
validateOutOfScope(text);
validateVm(text);
validateRealDataAndResearch(text);
validateSecurityGate(text);
validateNfrRegistry(text);

// --- Output ---

findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

if (JSON_OUTPUT) {
  process.stdout.write(JSON.stringify({ profile: PROFILE, file: filePath, findings, total: findings.length }, null, 2) + '\n');
} else {
  const counts = {
    BLOCKER: findings.filter((f) => f.severity === 'BLOCKER').length,
    MAJOR: findings.filter((f) => f.severity === 'MAJOR').length,
    MINOR: findings.filter((f) => f.severity === 'MINOR').length,
    INFO: findings.filter((f) => f.severity === 'INFO').length,
  };
  process.stdout.write(`\nValidating story spec: ${filePath}\nProfile: ${PROFILE}\n\n`);
  if (findings.length === 0) {
    process.stdout.write('All checks passed.\n');
  } else {
    for (const f of findings) {
      process.stdout.write(`[${f.severity}] ${f.ruleId}: ${f.message}\n`);
    }
    process.stdout.write(`\nSummary: ${counts.BLOCKER} BLOCKER, ${counts.MAJOR} MAJOR, ${counts.MINOR} MINOR, ${counts.INFO} INFO\n`);
  }
}

const hasBlocker = findings.some((f) => f.severity === 'BLOCKER');
const hasMajor = findings.some((f) => f.severity === 'MAJOR');

if (WARN_ONLY) process.exit(0);
if (hasBlocker) process.exit(1);
if (STRICT && hasMajor) process.exit(1);
process.exit(0);
