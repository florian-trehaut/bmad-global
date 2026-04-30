/**
 * Knowledge File Reference Validator
 *
 * Verifies that bmad-* workflow skills correctly reference the consolidated 3-file
 * knowledge layout (project.md, domain.md, api.md) and never reference the legacy
 * 10-file layout file names that were removed during the consolidation migration.
 *
 * What it checks:
 * - REF-01: No reference to legacy file names (tracker.md, stack.md, etc.) in
 *           skill files outside the migration tools (bmad-knowledge-bootstrap,
 *           bmad-knowledge-refresh, bmad-project-init/steps/step-01-preflight,
 *           bmad-project-init/steps/step-04-finalize).
 * - REF-02: No "If `…/workflow-knowledge/project.md` exists, read it" soft-load
 *           pattern in workflow.md or step files (HALT-on-missing required).
 *
 * Usage:
 *   node tools/validate-knowledge-refs.js                # All skills, human-readable
 *   node tools/validate-knowledge-refs.js --strict       # Exit 1 on any finding
 *   node tools/validate-knowledge-refs.js --json         # JSON output
 */

const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const SCHEMA_PATH = path.join(SRC_DIR, 'core-skills/bmad-shared/schema/knowledge-schema.md');

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');
const JSON_OUTPUT = args.has('--json');

// Files that legitimately mention legacy names (migration / detection tools).
const ALLOWED_LEGACY_PATHS = [
  'src/core-skills/bmad-knowledge-bootstrap/',
  'src/core-skills/bmad-knowledge-refresh/',
  'src/core-skills/bmad-project-init/steps/step-01-preflight.md',
  'src/core-skills/bmad-project-init/steps/step-04-finalize.md',
  'src/core-skills/bmad-shared/core/knowledge-loading.md',
  'src/core-skills/bmad-shared/schema/knowledge-schema.md',
  // Skill-internal data files unrelated to project knowledge.
  'src/core-skills/bmad-create-skill/data/skill-conventions.md',
  // Step file *names* that contain a legacy substring; these are filenames, not refs.
  'src/core-skills/bmad-knowledge-bootstrap/steps/step-02-detect-stack.md',
  'src/core-skills/bmad-validate-skill/steps/step-04-conventions.md',
];

// Known protocols registered in knowledge-schema.md `protocols:` map. New protocols
// added by knowledge-schema bumps MUST be reflected here so that consumer workflows
// referencing them are recognised by REF-04 (protocol path validity check).
const KNOWN_PROTOCOLS = [
  'tracker-crud',
  'tech-stack-lookup',
  'environments-lookup',
  'validation-tooling-lookup',
  'concurrency-review',
  'null-safety-review',
  'spec-bifurcation', // Added in knowledge-schema v1.2 (story-spec v3 bifurcation).
];

// File names that no longer exist post-consolidation.
const LEGACY_FILE_NAMES = [
  'tracker.md',
  'stack.md',
  'infrastructure.md',
  'comm-platform.md',
  'environment-config.md',
  'domain-glossary.md',
  'api-surface.md',
];
// These exist as workflow-knowledge/ paths only; allow as bare filenames inside
// other contexts (skill-conventions.md, step-04-conventions.md filename, etc).
const LEGACY_KNOWLEDGE_PATHS = [
  'workflow-knowledge/conventions.md',
  'workflow-knowledge/validation.md',
  'workflow-knowledge/review-perspectives.md',
  'workflow-knowledge/investigation-checklist.md',
  'workflow-knowledge/sprint-status.yaml',
];

// Soft-load patterns (REF-02) — all variants observed.
const SOFT_LOAD_PATTERNS = [
  /If `\{MAIN_PROJECT_ROOT\}\/\.claude\/workflow-knowledge\/project\.md` exists,?\s*(at project root,?\s*)?(read|load|cross-reference|verify|extract)/,
  /If `\{MAIN_PROJECT_ROOT\}\/\.claude\/workflow-knowledge\/project\.md` was loaded during initialization/,
];

// REF-03: paths subject to the no-direct-anchor-refs rule.
// Workflow.md, step files, and subagent-workflows are CONSUMERS — they must use
// protocols. Data files, templates, shared rules, and protocols themselves are
// exempt (they describe the schema or implement the indirection layer).
function isConsumerPath(relPath) {
  if (relPath.endsWith('/workflow.md')) return true;
  if (/\/steps\/step-\d+/.test(relPath)) return true;
  if (/\/subagent-workflows\/[^/]+\.md$/.test(relPath)) return true;
  return false;
}

function isAllowed(relPath) {
  return ALLOWED_LEGACY_PATHS.some((allowed) => relPath.startsWith(allowed) || relPath === allowed);
}

// Parse the YAML frontmatter from knowledge-schema.md to obtain the registered
// protocol keys. The set is used by checkProtocolRefs to reject references to
// unknown protocols (REF-04).
function loadRegisteredProtocols() {
  const fallback = new Set(KNOWN_PROTOCOLS);
  if (!fs.existsSync(SCHEMA_PATH)) return fallback;
  const text = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return fallback;
  const block = m[1];
  const startIdx = block.indexOf('protocols:');
  if (startIdx === -1) return fallback;
  const after = block.slice(startIdx);
  const lines = after.split('\n').slice(1);
  const items = new Set();
  for (const line of lines) {
    const itemMatch = line.match(/^ {2}([a-z][a-z0-9-]*):\s*$/);
    if (itemMatch) {
      items.add(itemMatch[1]);
      continue;
    }
    if (line.length > 0 && /^\S/.test(line)) break;
  }
  return items.size > 0 ? items : fallback;
}

function checkProtocolRefs(absPath, content, findings, registeredProtocols) {
  const relPath = path.relative(PROJECT_ROOT, absPath);
  if (relPath.startsWith('src/core-skills/bmad-shared/schema/knowledge-schema.md')) return;
  if (relPath.startsWith('src/core-skills/bmad-shared/protocols/')) return;

  const PROTOCOL_REF_RE = /~\/\.claude\/skills\/bmad-shared\/protocols\/([a-z][a-z0-9-]*)\.md/g;
  const lines = content.split('\n');
  for (const [idx, line] of lines.entries()) {
    let m;
    PROTOCOL_REF_RE.lastIndex = 0;
    while ((m = PROTOCOL_REF_RE.exec(line)) !== null) {
      const protocolName = m[1];
      if (!registeredProtocols.has(protocolName)) {
        findings.push({
          rule: 'REF-04',
          severity: 'HIGH',
          file: relPath,
          line: idx + 1,
          message: `Reference to unknown protocol '${protocolName}'. Registered protocols: ${[...registeredProtocols].join(', ')}. Either fix the path or add the protocol to knowledge-schema.md.`,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  }
}

// Parse the YAML frontmatter from knowledge-schema.md to obtain the
// direct_reference_allowed list. Falls back to a hard-coded list if the schema
// is unreadable (defensive only).
function loadAllowedDirectAnchors() {
  const fallback = new Set(['conventions', 'review-perspectives', 'investigation-checklist', 'communication-platform']);
  if (!fs.existsSync(SCHEMA_PATH)) return fallback;
  const text = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return fallback;
  const block = m[1];
  const startIdx = block.indexOf('direct_reference_allowed:');
  if (startIdx === -1) return fallback;
  const after = block.slice(startIdx);
  const lines = after.split('\n').slice(1);
  const items = new Set();
  for (const line of lines) {
    const itemMatch = line.match(/^\s+-\s+([a-z][a-z0-9-]*)/);
    if (itemMatch) {
      items.add(itemMatch[1]);
      continue;
    }
    if (line.trim() === '' || /^\S/.test(line)) break;
  }
  return items.size > 0 ? items : fallback;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && full.endsWith('.md')) {
      yield full;
    }
  }
}

function loadFile(absPath) {
  return fs.readFileSync(absPath, 'utf8');
}

function checkLegacyRefs(absPath, content, findings) {
  const relPath = path.relative(PROJECT_ROOT, absPath);
  if (isAllowed(relPath)) return;

  const lines = content.split('\n');
  for (const [idx, line] of lines.entries()) {
    // Reference to legacy bare filenames in workflow-knowledge contexts.
    for (const name of LEGACY_FILE_NAMES) {
      // Match the bare filename when it appears in a knowledge-file context
      // (preceded by a backtick, a slash, or whitespace + non-word).
      const re = new RegExp(`(\`|/|\\s|\\()${name.replace('.', String.raw`\.`)}\\b`);
      if (re.test(line)) {
        findings.push({
          rule: 'REF-01',
          severity: 'HIGH',
          file: relPath,
          line: idx + 1,
          message: `Legacy knowledge filename '${name}' should reference project.md (with H2 anchor) or its post-consolidation equivalent`,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }

    // Reference to legacy paths under workflow-knowledge/.
    for (const lp of LEGACY_KNOWLEDGE_PATHS) {
      if (line.includes(lp)) {
        findings.push({
          rule: 'REF-01',
          severity: 'HIGH',
          file: relPath,
          line: idx + 1,
          message: `Legacy knowledge path '${lp}' no longer exists after consolidation`,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  }
}

function checkSoftLoads(absPath, content, findings) {
  const relPath = path.relative(PROJECT_ROOT, absPath);
  if (isAllowed(relPath)) return;
  // bmad-knowledge-refresh legitimately uses "if exists" because it operates on
  // partial / in-flight knowledge state.
  if (relPath.startsWith('src/core-skills/bmad-knowledge-refresh/')) return;
  // Templates inside bmad-create-skill carry placeholders, not real workflows.
  if (relPath.startsWith('src/core-skills/bmad-create-skill/templates/')) return;

  const lines = content.split('\n');
  for (const [idx, line] of lines.entries()) {
    if (SOFT_LOAD_PATTERNS.some((re) => re.test(line))) {
      findings.push({
        rule: 'REF-02',
        severity: 'MEDIUM',
        file: relPath,
        line: idx + 1,
        message:
          'Soft load (`If exists`/`was loaded`) for project.md — required files MUST trigger HALT when missing per knowledge-loading.md',
        excerpt: line.trim().slice(0, 160),
      });
    }
  }
}

function checkDirectAnchorRefs(absPath, content, findings, allowedAnchors) {
  const relPath = path.relative(PROJECT_ROOT, absPath);
  if (!isConsumerPath(relPath)) return;
  if (isAllowed(relPath)) return;
  // bmad-knowledge-bootstrap is the producer — it knows its own output schema.
  if (relPath.startsWith('src/core-skills/bmad-knowledge-bootstrap/')) return;
  // bmad-knowledge-refresh handles legacy detection and inspects the schema.
  if (relPath.startsWith('src/core-skills/bmad-knowledge-refresh/')) return;

  const ANCHOR_RE = /project\.md#([a-z][a-z0-9-]*)/g;
  const lines = content.split('\n');
  for (const [idx, line] of lines.entries()) {
    let m;
    ANCHOR_RE.lastIndex = 0;
    while ((m = ANCHOR_RE.exec(line)) !== null) {
      const anchor = m[1];
      if (allowedAnchors.has(anchor)) continue;
      findings.push({
        rule: 'REF-03',
        severity: 'HIGH',
        file: relPath,
        line: idx + 1,
        message: `Direct anchor reference 'project.md#${anchor}' is forbidden in consumer files (workflow.md / steps / subagent-workflows). Use the corresponding protocol in ~/.claude/skills/bmad-shared/protocols/ (see knowledge-schema.md).`,
        excerpt: line.trim().slice(0, 160),
      });
    }
  }
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`SRC_DIR not found: ${SRC_DIR}`);
    process.exit(2);
  }

  const allowedAnchors = loadAllowedDirectAnchors();
  const registeredProtocols = loadRegisteredProtocols();
  const findings = [];
  for (const file of walk(SRC_DIR)) {
    const content = loadFile(file);
    checkLegacyRefs(file, content, findings);
    checkSoftLoads(file, content, findings);
    checkDirectAnchorRefs(file, content, findings, allowedAnchors);
    checkProtocolRefs(file, content, findings, registeredProtocols);
  }

  if (JSON_OUTPUT) {
    process.stdout.write(
      JSON.stringify(
        {
          findings,
          allowedAnchors: [...allowedAnchors],
          registeredProtocols: [...registeredProtocols],
        },
        null,
        2,
      ) + '\n',
    );
  } else if (findings.length === 0) {
    console.log(
      `Knowledge refs validation: PASSED (no legacy filenames, no soft loads, no direct anchor refs in consumer files, no unknown protocol refs; allowed anchors: ${[...allowedAnchors].join(', ')}; registered protocols: ${[...registeredProtocols].join(', ')}).`,
    );
  } else {
    console.log(`Knowledge refs validation: ${findings.length} finding(s)\n`);
    for (const f of findings) {
      console.log(`[${f.severity}] ${f.rule} ${f.file}:${f.line}`);
      console.log(`         ${f.message}`);
      if (f.excerpt) console.log(`         > ${f.excerpt}`);
    }
  }

  if (STRICT && findings.length > 0) {
    process.exit(1);
  }
}

main();
