/**
 * Story Spec Validator (story-spec v2 + v3 bifurcation)
 *
 * Validates that a story spec (markdown file or tracker issue body) conforms to the
 * v2 / v3 schema declared in `src/core-skills/bmad-shared/spec/spec-completeness-rule.md`.
 *
 * Two profiles:
 *   --profile=full   (default for /bmad-create-story output)
 *   --profile=quick  (default for /bmad-quick-dev spec-template.md output)
 *
 * Quick profile allows terse N/A justifications on Real-Data Findings + External Research.
 *
 * Bifurcation mode (story-spec v3):
 *   --split                      enable bifurcation validation; loads tracker description
 *                                via `tracker_issue_id` from frontmatter or via --tracker-id
 *   --tracker-id=<id>            explicit override for tracker_issue_id
 *   --tracker-fixture=<path>     load tracker payload from a JSON file (offline / unit testing)
 *                                — payload must contain { id, identifier, description, updatedAt, url }
 *   --check-drift                additionally compare business_content_hash with MD5(canonical_business)
 *
 * Usage:
 *   node tools/validate-story-spec.js path/to/story.md
 *   node tools/validate-story-spec.js path/to/story.md --profile=quick
 *   node tools/validate-story-spec.js path/to/story.md --strict
 *   node tools/validate-story-spec.js path/to/story.md --json
 *   node tools/validate-story-spec.js path/to/story.md --warn-only
 *   node tools/validate-story-spec.js path/to/story.md --split --tracker-fixture=tracker.json
 *
 * Exit codes:
 *   0 = no findings (or --strict not set and only WARNINGs / INFO)
 *   1 = BLOCKER findings (or --strict + any HIGH+ finding)
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// --- CLI parsing ---

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const JSON_OUTPUT = args.includes('--json');
const WARN_ONLY = args.includes('--warn-only');
const SPLIT = args.includes('--split');
const CHECK_DRIFT = args.includes('--check-drift');
const profileArg = args.find((a) => a.startsWith('--profile='));
const PROFILE = profileArg ? profileArg.split('=')[1] : 'full';
const trackerIdArg = args.find((a) => a.startsWith('--tracker-id='));
const TRACKER_ID_OVERRIDE = trackerIdArg ? trackerIdArg.split('=')[1] : null;
const trackerFixtureArg = args.find((a) => a.startsWith('--tracker-fixture='));
const TRACKER_FIXTURE = trackerFixtureArg ? trackerFixtureArg.split('=')[1] : null;
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

// --- Bifurcation Mode (story-spec v3, --split flag) ---

// Canonical business sections per spec-bifurcation.md mapping (sections 1-6 + 20).
const BIFURCATION_BUSINESS_SECTIONS = [
  { rx: /^##\s+Definition of Done/im, label: 'Definition of Done (product)' },
  { rx: /^##\s+Problem\b/im, label: 'Problem' },
  { rx: /^##\s+Proposed Solution/im, label: 'Proposed Solution' },
  { rx: /^##\s+Scope\b/im, label: 'Scope' },
  { rx: /^##\s+Out of Scope/im, label: 'Out of Scope' },
  { rx: /^##\s+Business Context/im, label: 'Business Context' },
  { rx: /^##\s+Validation Metier/im, label: 'Validation Metier' },
];

// Canonical technical sections per spec-bifurcation.md mapping (sections 7-19, 21-25).
const BIFURCATION_TECHNICAL_SECTIONS = [
  { rx: /^(##|<summary>)\s*Technical Context/im, label: 'Technical Context' },
  { rx: /^##\s+Real-Data Findings/im, label: 'Real-Data Findings' },
  { rx: /^##\s+External Research/im, label: 'External Research' },
  { rx: /^##\s+NFR Registry/im, label: 'NFR Registry' },
  { rx: /^##\s+Security Gate/im, label: 'Security Gate' },
  { rx: /^##\s+Observability Requirements/im, label: 'Observability Requirements' },
  { rx: /^##\s+Implementation Plan/im, label: 'Implementation Plan' },
  { rx: /^##\s+Guardrails/im, label: 'Guardrails' },
  { rx: /^##\s+Boundaries/im, label: 'Boundaries Triple' },
  { rx: /^##\s+Risks (&|and) Assumptions/im, label: 'Risks & Assumptions Register' },
  { rx: /^##\s+INVEST Self-Check/im, label: 'INVEST Self-Check' },
  { rx: /^##\s+Test Strategy/im, label: 'Test Strategy' },
  { rx: /^##\s+File List/im, label: 'File List' },
];

const MIRROR_MARKER = /^\s*>\s*Mirror — see tracker for canonical:/im;

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const block = m[1];
  const fm = {};
  for (const line of block.split('\n')) {
    const kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Strip trailing comments
    value = value.replace(/\s+#.*$/, '').trim();
    fm[key] = value;
  }
  return fm;
}

function loadTrackerPayload(trackerId, fixturePath) {
  if (fixturePath) {
    if (!fs.existsSync(fixturePath)) {
      throw new Error(`Tracker fixture not found: ${fixturePath}`);
    }
    return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  }
  // Production path would call tracker-crud.md recipe (gh / glab / linear MCP) here.
  // For the validator, we require either --tracker-fixture or document that live
  // tracker fetch is out-of-scope for this CLI tool (it runs offline).
  throw new Error(
    `--split requires --tracker-fixture=<path> for offline validation. Live tracker fetch is performed by workflows, not this validator (per spec-bifurcation.md).`,
  );
}

function md5Hash8(s) {
  return crypto.createHash('md5').update(s, 'utf-8').digest('hex').slice(0, 8);
}

function extractCanonicalBusinessFromTracker(trackerDescription) {
  const sections = {};
  for (const sec of BIFURCATION_BUSINESS_SECTIONS) {
    const block = extractSection(trackerDescription, sec.rx);
    sections[sec.label] = block ? block.trim() : null;
  }
  return sections;
}

function composeBusinessForHash(sectionsMap) {
  return Object.values(sectionsMap).filter(Boolean).join('\n\n');
}

function validateSplit(localText, frontmatter) {
  // Determine effective mode
  const mode = frontmatter?.mode || 'monolithic';
  if (mode !== 'bifurcation') {
    // Legacy v2 / explicit monolithic — --split is a no-op, no SPEC-SPLIT-* findings emitted
    return;
  }

  // Extract tracker_issue_id (from --tracker-id override or frontmatter)
  const trackerId = TRACKER_ID_OVERRIDE || frontmatter?.tracker_issue_id;
  if (!trackerId) {
    addFinding({
      severity: 'MAJOR',
      ruleId: 'SPEC-SPLIT-NO-TRACKER-ID',
      message:
        '--split mode requires `tracker_issue_id` in frontmatter (or --tracker-id flag). ' +
        'Without an ID, the validator cannot verify business sections in the tracker.',
    });
    return; // can't verify tracker side without ID
  }

  // Load tracker payload (offline via --tracker-fixture, or HALT)
  let payload;
  try {
    payload = loadTrackerPayload(trackerId, TRACKER_FIXTURE);
  } catch (error) {
    addFinding({
      severity: 'BLOCKER',
      ruleId: 'SPEC-SPLIT-TRACKER-FETCH-FAILED',
      message: `Cannot load tracker payload for ${trackerId}: ${error.message}`,
    });
    return;
  }

  // Verify required tracker fields are present (null-safety per TAC-16)
  for (const field of ['description', 'updatedAt', 'id', 'url']) {
    if (!payload[field]) {
      addFinding({
        severity: 'BLOCKER',
        ruleId: 'SPEC-SPLIT-TRACKER-FIELD-MISSING',
        message: `Tracker payload missing required field: ${field}. Per spec-bifurcation.md null-safety contract, all of {description, updatedAt, id, url} must be present.`,
      });
      return;
    }
  }

  const trackerDescription = payload.description;

  // Validate that all canonical business sections are present in the tracker
  for (const sec of BIFURCATION_BUSINESS_SECTIONS) {
    if (!sec.rx.test(trackerDescription)) {
      addFinding({
        severity: 'BLOCKER',
        ruleId: 'SPEC-SPLIT-MISSING-TRACKER-SECTION',
        message: `Tracker description missing canonical business section: ${sec.label}. In bifurcation mode, business sections are canonical in the tracker.`,
      });
    }
  }

  // Validate that all canonical technical sections are present in the local file
  for (const sec of BIFURCATION_TECHNICAL_SECTIONS) {
    if (!sec.rx.test(localText)) {
      addFinding({
        severity: 'BLOCKER',
        ruleId: 'SPEC-SPLIT-MISSING-LOCAL-SECTION',
        message: `Local file missing canonical technical section: ${sec.label}. In bifurcation mode, technical sections are canonical in the local file.`,
      });
    }
  }

  // Validate mirror markers on business sections in the local file
  for (const sec of BIFURCATION_BUSINESS_SECTIONS) {
    const block = extractSection(localText, sec.rx);
    if (!block) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-SPLIT-MISSING-MIRROR',
        message: `Local file missing mirror for business section: ${sec.label}. The local file should contain a mirror heading + marker for fast Claude context.`,
      });
      continue;
    }
    // The first non-heading line of the block should be the mirror marker
    const lines = block
      .split('\n')
      .slice(1)
      .filter((l) => l.trim().length > 0);
    if (lines.length === 0 || !MIRROR_MARKER.test(lines[0])) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-SPLIT-INVALID-MIRROR-MARKER',
        message: `Mirror section "${sec.label}" in local file does not start with the marker "> Mirror — see tracker for canonical: <url>". Mirrors must be clearly non-canonical.`,
      });
    }
  }

  // Drift check (--check-drift)
  if (CHECK_DRIFT) {
    const localHash = frontmatter?.business_content_hash;
    const trackerSections = extractCanonicalBusinessFromTracker(trackerDescription);
    const composed = composeBusinessForHash(trackerSections);
    const computedHash = md5Hash8(composed);

    if (!localHash) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-SPLIT-NO-CONTENT-HASH',
        message: 'Local file frontmatter missing `business_content_hash`. Drift detection requires the hash for comparison.',
      });
    } else if (localHash !== computedHash) {
      addFinding({
        severity: 'MAJOR',
        ruleId: 'SPEC-SPLIT-DRIFT',
        message: `Drift detected: business_content_hash in frontmatter (${localHash}) does not match MD5(canonical_business)[:8] (${computedHash}). The tracker description has changed since last sync. Run /bmad-knowledge-refresh or apply [R]efresh from the drift menu in the calling workflow.`,
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
const frontmatter = parseFrontmatter(text);

// Bifurcation mode: business sections (DoD, Problem, Solution, Scope, OOS, Business
// Context, VM) live canonically in the tracker. The local file contains only mirrors
// (1-line synopses with the marker). Therefore, validators that scan local content for
// canonical business-side rules (BAC G/W/T, OOS-N count, VM-N entries) must NOT run on
// the local file — they would double-jeopardize bifurcation specs by applying monolithic
// content rules to non-canonical mirrors. Those checks run on the TRACKER side via
// validateSplit() (which fetches the tracker description and verifies business sections
// are present there).
const isBifurcation = SPLIT && frontmatter?.mode === 'bifurcation';

if (!isBifurcation) {
  validateMandatorySections(text);
  // Business-side checks: only run on monolithic specs. In bifurcation mode the tracker
  // is canonical for these.
  validateAcFormat(text);
  validateOutOfScope(text);
  validateVm(text);
}
// Technical-side checks: always run (they apply to local file in both modes).
validateInvest(text);
validateBoundaries(text);
validateRealDataAndResearch(text);
validateSecurityGate(text);
validateNfrRegistry(text);

if (SPLIT) {
  validateSplit(text, frontmatter);
}

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
