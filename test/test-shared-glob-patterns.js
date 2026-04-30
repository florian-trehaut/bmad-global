/**
 * Test: every workflow.md / step file Glob pattern targeting bmad-shared/
 * uses one of the approved subdirectory paths after the bmad-shared
 * restructure (Task 27 of standalone-bmad-shared-restructure.md).
 *
 * Forbidden: `Glob ~/.claude/skills/bmad-shared/*.md` (legacy flat root pattern).
 * Allowed:   `Glob ~/.claude/skills/bmad-shared/{core|spec|teams|validation|lifecycle|schema|protocols|data|stacks}/*.md`.
 *
 * Usage:
 *   node test/test-shared-glob-patterns.js                # exit 0 if pass, 1 if fail
 *   node test/test-shared-glob-patterns.js --json         # JSON output
 */

const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

const args = new Set(process.argv.slice(2));
const JSON_OUTPUT = args.has('--json');

const ALLOWED_SUBDIRS = ['core', 'spec', 'teams', 'validation', 'lifecycle', 'schema', 'protocols', 'data', 'stacks'];
const ALLOWED_RE = new RegExp(`bmad-shared/(${ALLOWED_SUBDIRS.join('|')})/\\*\\.md`);
const LEGACY_FLAT_RE = /bmad-shared\/\*\.md/;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Skip dist, build, node_modules
      if (['node_modules', 'dist', 'build'].includes(entry.name)) continue;
      yield* walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield path.join(dir, entry.name);
    }
  }
}

function isWorkflowOrStepFile(absPath) {
  const rel = path.relative(PROJECT_ROOT, absPath);
  if (rel.endsWith('/workflow.md')) return true;
  if (/\/steps\/step-\d+/.test(rel)) return true;
  if (/\/subagent-workflows\/[^/]+\.md$/.test(rel)) return true;
  if (rel.endsWith('/SKILL.md')) return true;
  return false;
}

function checkFile(absPath) {
  // Skip the bmad-shared rules themselves — they describe the patterns,
  // they are not consumers.
  const rel = path.relative(PROJECT_ROOT, absPath);
  if (rel.startsWith('src/core-skills/bmad-shared/')) return [];

  const content = fs.readFileSync(absPath, 'utf8');
  const findings = [];
  const lines = content.split('\n');
  for (const [idx, line] of lines.entries()) {
    // Look for "Glob" + "bmad-shared" + legacy flat pattern + no allowed subdir on same line
    if (/\bGlob\b/i.test(line) && /bmad-shared/.test(line) && LEGACY_FLAT_RE.test(line) && !ALLOWED_RE.test(line)) {
      findings.push({
        file: rel,
        line: idx + 1,
        message: `Glob pattern uses legacy flat path 'bmad-shared/*.md' — must use one of bmad-shared/{${ALLOWED_SUBDIRS.join('|')}}/*.md`,
        excerpt: line.trim().slice(0, 200),
      });
    }
  }
  return findings;
}

function main() {
  const findings = [];
  for (const file of walk(SRC_DIR)) {
    if (!isWorkflowOrStepFile(file)) continue;
    findings.push(...checkFile(file));
  }

  if (JSON_OUTPUT) {
    process.stdout.write(JSON.stringify({ findings, allowedSubdirs: ALLOWED_SUBDIRS }, null, 2) + '\n');
  } else if (findings.length === 0) {
    console.log(
      `Glob pattern validation: PASSED (no legacy flat 'bmad-shared/*.md' patterns in workflow/step files; allowed subdirs: ${ALLOWED_SUBDIRS.join(', ')}).`,
    );
  } else {
    console.log(`Glob pattern validation: ${findings.length} finding(s)\n`);
    for (const f of findings) {
      console.log(`  ${f.file}:${f.line}`);
      console.log(`    ${f.message}`);
      if (f.excerpt) console.log(`    > ${f.excerpt}`);
    }
  }

  if (findings.length > 0) {
    process.exit(1);
  }
}

main();
