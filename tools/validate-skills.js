/**
 * Deterministic Skill Validator
 *
 * Validates 15 deterministic rules across all skill directories.
 * Acts as a fast first-pass complement to the inference-based skill validator.
 *
 * What it checks:
 * - SKILL-01: SKILL.md exists
 * - SKILL-02: SKILL.md frontmatter has name
 * - SKILL-03: SKILL.md frontmatter has description
 * - SKILL-04: name format (lowercase, hyphens, no forbidden substrings)
 * - SKILL-05: name matches directory basename
 * - SKILL-06: description quality (length, "Use when"/"Use if")
 * - SKILL-07: SKILL.md has body content after frontmatter
 * - WF-01: workflow.md frontmatter has no name
 * - WF-02: workflow.md frontmatter has no description
 * - PATH-02: no installed_path variable
 * - STEP-01: step filename format
 * - STEP-06: step frontmatter has no name/description
 * - STEP-07: step count 2-15
 * - SEQ-02: no time estimates
 * - STACK-15: bmad-shared/stacks/{lang}.md files contain required H2 sections
 *
 * Usage:
 *   node tools/validate-skills.js                    # All skills, human-readable
 *   node tools/validate-skills.js path/to/skill-dir  # Single skill
 *   node tools/validate-skills.js --strict           # Exit 1 on HIGH+ findings
 *   node tools/validate-skills.js --json             # JSON output
 */

const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// --- CLI Parsing ---

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const JSON_OUTPUT = args.includes('--json');
const positionalArgs = args.filter((a) => !a.startsWith('--'));

// --- Constants ---

const NAME_REGEX = /^bmad-[a-z0-9]+(-[a-z0-9]+)*$/;
const STEP_FILENAME_REGEX = /^step-\d{2}[a-z]?-[a-z0-9-]+\.md$/;
const TIME_ESTIMATE_PATTERNS = [/takes?\s+\d+\s*min/i, /~\s*\d+\s*min/i, /estimated\s+time/i, /\bETA\b/];

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

// --- Output Escaping ---

function escapeAnnotation(str) {
  return str.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

function escapeTableCell(str) {
  return String(str).replaceAll('|', String.raw`\|`);
}

// --- Frontmatter Parsing ---

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns an object with key-value pairs, or null if no frontmatter.
 */
function parseFrontmatter(content) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) return null;

  let endIndex = trimmed.indexOf('\n---\n', 3);
  if (endIndex === -1) {
    // Handle file ending with \n---
    if (trimmed.endsWith('\n---')) {
      endIndex = trimmed.length - 4;
    } else {
      return null;
    }
  }

  const fmBlock = trimmed.slice(3, endIndex).trim();
  if (fmBlock === '') return {};

  const result = {};
  for (const line of fmBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    // Skip indented lines (nested YAML values)
    if (line[0] === ' ' || line[0] === '\t') continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    // Strip surrounding quotes (single or double)
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

/**
 * Parse YAML frontmatter, handling multiline values (description often spans lines).
 * Returns an object with key-value pairs, or null if no frontmatter.
 */
function parseFrontmatterMultiline(content) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) return null;

  let endIndex = trimmed.indexOf('\n---\n', 3);
  if (endIndex === -1) {
    // Handle file ending with \n---
    if (trimmed.endsWith('\n---')) {
      endIndex = trimmed.length - 4;
    } else {
      return null;
    }
  }

  const fmBlock = trimmed.slice(3, endIndex).trim();
  if (fmBlock === '') return {};

  const result = {};
  let currentKey = null;
  let currentValue = '';

  for (const line of fmBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    // New key-value pair: must start at column 0 (no leading whitespace) and have a colon
    if (colonIndex > 0 && line[0] !== ' ' && line[0] !== '\t') {
      // Save previous key
      if (currentKey !== null) {
        result[currentKey] = stripQuotes(currentValue.trim());
      }
      currentKey = line.slice(0, colonIndex).trim();
      currentValue = line.slice(colonIndex + 1);
    } else if (currentKey !== null) {
      // Skip YAML comment lines
      if (line.trimStart().startsWith('#')) continue;
      // Continuation of multiline value
      currentValue += '\n' + line;
    }
  }

  // Save last key
  if (currentKey !== null) {
    result[currentKey] = stripQuotes(currentValue.trim());
  }

  return result;
}

function stripQuotes(value) {
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1);
  }
  return value;
}

// --- Safe File Reading ---

/**
 * Read a file safely, returning null on error.
 * Pushes a warning finding if the file cannot be read.
 */
function safeReadFile(filePath, findings, relFile) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    findings.push({
      rule: 'READ-ERR',
      title: 'File Read Error',
      severity: 'MEDIUM',
      file: relFile || path.basename(filePath),
      detail: `Cannot read file: ${error.message}`,
      fix: 'Check file permissions and ensure the file exists.',
    });
    return null;
  }
}

// --- Code Block Stripping ---

function stripCodeBlocks(content) {
  return content.replaceAll(/```[\s\S]*?```/g, (m) => m.replaceAll(/[^\n]/g, ''));
}

// --- Skill Discovery ---

function discoverSkillDirs(rootDirs) {
  const skillDirs = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name === '.git') continue;

      const fullPath = path.join(dir, entry.name);
      const skillMd = path.join(fullPath, 'SKILL.md');

      if (fs.existsSync(skillMd)) {
        skillDirs.push(fullPath);
      }

      // Keep walking into subdirectories to find nested skills
      walk(fullPath);
    }
  }

  for (const rootDir of rootDirs) {
    walk(rootDir);
  }

  return skillDirs.sort();
}

// --- File Collection ---

function collectSkillFiles(skillDir) {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(skillDir);
  return files;
}

// --- Rule Checks ---

function validateSkill(skillDir) {
  const findings = [];
  const dirName = path.basename(skillDir);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const workflowMdPath = path.join(skillDir, 'workflow.md');
  const stepsDir = path.join(skillDir, 'steps');

  // Collect all files in the skill for PATH-02 and SEQ-02
  const allFiles = collectSkillFiles(skillDir);

  // --- SKILL-01: SKILL.md must exist ---
  if (!fs.existsSync(skillMdPath)) {
    findings.push({
      rule: 'SKILL-01',
      title: 'SKILL.md Must Exist',
      severity: 'CRITICAL',
      file: 'SKILL.md',
      detail: 'SKILL.md not found in skill directory.',
      fix: 'Create SKILL.md as the skill entrypoint.',
    });
    // Cannot check SKILL-02 through SKILL-07 without SKILL.md
    return findings;
  }

  const skillContent = safeReadFile(skillMdPath, findings, 'SKILL.md');
  if (skillContent === null) return findings;
  const skillFm = parseFrontmatterMultiline(skillContent);

  // --- SKILL-02: frontmatter has name ---
  if (!skillFm || !('name' in skillFm)) {
    findings.push({
      rule: 'SKILL-02',
      title: 'SKILL.md Must Have name in Frontmatter',
      severity: 'CRITICAL',
      file: 'SKILL.md',
      detail: 'Frontmatter is missing the `name` field.',
      fix: 'Add `name: <skill-name>` to the frontmatter.',
    });
  } else if (skillFm.name === '') {
    findings.push({
      rule: 'SKILL-02',
      title: 'SKILL.md Must Have name in Frontmatter',
      severity: 'CRITICAL',
      file: 'SKILL.md',
      detail: 'Frontmatter `name` field is empty.',
      fix: 'Set `name` to the skill directory name (kebab-case).',
    });
  }

  // --- SKILL-03: frontmatter has description ---
  if (!skillFm || !('description' in skillFm)) {
    findings.push({
      rule: 'SKILL-03',
      title: 'SKILL.md Must Have description in Frontmatter',
      severity: 'CRITICAL',
      file: 'SKILL.md',
      detail: 'Frontmatter is missing the `description` field.',
      fix: 'Add `description: <what it does and when to use it>` to the frontmatter.',
    });
  } else if (skillFm.description === '') {
    findings.push({
      rule: 'SKILL-03',
      title: 'SKILL.md Must Have description in Frontmatter',
      severity: 'CRITICAL',
      file: 'SKILL.md',
      detail: 'Frontmatter `description` field is empty.',
      fix: 'Add a description stating what the skill does and when to use it.',
    });
  }

  const name = skillFm && skillFm.name;
  const description = skillFm && skillFm.description;

  // --- SKILL-04: name format ---
  if (name && !NAME_REGEX.test(name)) {
    findings.push({
      rule: 'SKILL-04',
      title: 'name Format',
      severity: 'HIGH',
      file: 'SKILL.md',
      detail: `name "${name}" does not match pattern: ${NAME_REGEX}`,
      fix: 'Rename to comply with lowercase letters, numbers, and hyphens only (max 64 chars).',
    });
  }

  // --- SKILL-05: name matches directory ---
  if (name && name !== dirName) {
    findings.push({
      rule: 'SKILL-05',
      title: 'name Must Match Directory Name',
      severity: 'HIGH',
      file: 'SKILL.md',
      detail: `name "${name}" does not match directory name "${dirName}".`,
      fix: `Change name to "${dirName}" or rename the directory.`,
    });
  }

  // --- SKILL-06: description quality ---
  if (description) {
    if (description.length > 1024) {
      findings.push({
        rule: 'SKILL-06',
        title: 'description Quality',
        severity: 'MEDIUM',
        file: 'SKILL.md',
        detail: `description is ${description.length} characters (max 1024).`,
        fix: 'Shorten the description to 1024 characters or less.',
      });
    }

    if (!/use\s+when\b/i.test(description) && !/use\s+if\b/i.test(description)) {
      findings.push({
        rule: 'SKILL-06',
        title: 'description Quality',
        severity: 'MEDIUM',
        file: 'SKILL.md',
        detail: 'description does not contain "Use when" or "Use if" trigger phrase.',
        fix: 'Append a "Use when..." clause to explain when to invoke this skill.',
      });
    }
  }

  // --- SKILL-07: SKILL.md must have body content after frontmatter ---
  {
    const trimmed = skillContent.trimStart();
    let bodyStart = -1;
    if (trimmed.startsWith('---')) {
      let endIdx = trimmed.indexOf('\n---\n', 3);
      if (endIdx !== -1) {
        bodyStart = endIdx + 4;
      } else if (trimmed.endsWith('\n---')) {
        bodyStart = trimmed.length; // no body at all
      }
    } else {
      bodyStart = 0; // no frontmatter, entire file is body
    }
    const body = bodyStart >= 0 ? trimmed.slice(bodyStart).trim() : '';
    if (body === '') {
      findings.push({
        rule: 'SKILL-07',
        title: 'SKILL.md Must Have Body Content',
        severity: 'HIGH',
        file: 'SKILL.md',
        detail: 'SKILL.md has no content after frontmatter. L2 instructions are required.',
        fix: 'Add markdown body with skill instructions after the closing ---.',
      });
    }
  }

  // --- WF-01 / WF-02: non-SKILL.md files must NOT have name/description ---
  // TODO: bmad-agent-tech-writer has sub-skill files with intentional name/description
  const WF_SKIP_SKILLS = new Set(['bmad-agent-tech-writer']);
  for (const filePath of allFiles) {
    if (path.extname(filePath) !== '.md') continue;
    if (path.basename(filePath) === 'SKILL.md') continue;
    if (WF_SKIP_SKILLS.has(dirName)) continue;

    const relFile = path.relative(skillDir, filePath);
    const content = safeReadFile(filePath, findings, relFile);
    if (content === null) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    if ('name' in fm) {
      findings.push({
        rule: 'WF-01',
        title: 'Only SKILL.md May Have name in Frontmatter',
        severity: 'HIGH',
        file: relFile,
        detail: `${relFile} frontmatter contains \`name\` — this belongs only in SKILL.md.`,
        fix: "Remove the `name:` line from this file's frontmatter.",
      });
    }

    if ('description' in fm) {
      findings.push({
        rule: 'WF-02',
        title: 'Only SKILL.md May Have description in Frontmatter',
        severity: 'HIGH',
        file: relFile,
        detail: `${relFile} frontmatter contains \`description\` — this belongs only in SKILL.md.`,
        fix: "Remove the `description:` line from this file's frontmatter.",
      });
    }
  }

  // --- PATH-02: no installed_path ---
  for (const filePath of allFiles) {
    // Only check markdown and yaml files
    const ext = path.extname(filePath);
    if (!['.md', '.yaml', '.yml'].includes(ext)) continue;

    const relFile = path.relative(skillDir, filePath);
    const content = safeReadFile(filePath, findings, relFile);
    if (content === null) continue;

    // Check frontmatter for installed_path key
    const fm = parseFrontmatter(content);
    if (fm && 'installed_path' in fm) {
      findings.push({
        rule: 'PATH-02',
        title: 'No installed_path Variable',
        severity: 'HIGH',
        file: relFile,
        detail: 'Frontmatter contains `installed_path:` key.',
        fix: 'Remove `installed_path` from frontmatter. Use relative paths instead.',
      });
    }

    // Check content for any mention of installed_path (variable ref, prose, bare text)
    const stripped = stripCodeBlocks(content);
    const lines = stripped.split('\n');
    for (const [i, line] of lines.entries()) {
      // Strip inline code before checking — documentation about the rule should not trigger it
      const lineNoInline = line.replaceAll(/`[^`]+`/g, '');
      if (/installed_path/i.test(lineNoInline)) {
        findings.push({
          rule: 'PATH-02',
          title: 'No installed_path Variable',
          severity: 'HIGH',
          file: relFile,
          line: i + 1,
          detail: '`installed_path` reference found in content.',
          fix: 'Remove all installed_path usage. Use relative paths (`./path` or `../path`) instead.',
        });
      }
    }
  }

  // --- STEP-01: step filename format ---
  // --- STEP-06: step frontmatter no name/description ---
  // --- STEP-07: step count ---
  // Only check the literal steps/ directory (variant directories like steps-c, steps-v
  // use different naming conventions and are excluded per the rule specification)
  if (fs.existsSync(stepsDir) && fs.statSync(stepsDir).isDirectory()) {
    const stepDirName = 'steps';
    const stepFiles = fs.readdirSync(stepsDir).filter((f) => f.endsWith('.md'));

    // STEP-01: filename format
    for (const stepFile of stepFiles) {
      if (!STEP_FILENAME_REGEX.test(stepFile)) {
        findings.push({
          rule: 'STEP-01',
          title: 'Step File Naming',
          severity: 'MEDIUM',
          file: path.join(stepDirName, stepFile),
          detail: `Filename "${stepFile}" does not match pattern: ${STEP_FILENAME_REGEX}`,
          fix: 'Rename to step-NN-description.md (NN = zero-padded number, optional letter suffix).',
        });
      }
    }

    // STEP-06: step frontmatter has no name/description
    for (const stepFile of stepFiles) {
      const stepPath = path.join(stepsDir, stepFile);
      const stepContent = safeReadFile(stepPath, findings, path.join(stepDirName, stepFile));
      if (stepContent === null) continue;
      const stepFm = parseFrontmatter(stepContent);

      if (stepFm) {
        if ('name' in stepFm) {
          findings.push({
            rule: 'STEP-06',
            title: 'Step File Frontmatter: No name or description',
            severity: 'MEDIUM',
            file: path.join(stepDirName, stepFile),
            detail: 'Step file frontmatter contains `name:` — this is metadata noise.',
            fix: 'Remove `name:` from step file frontmatter.',
          });
        }
        if ('description' in stepFm) {
          findings.push({
            rule: 'STEP-06',
            title: 'Step File Frontmatter: No name or description',
            severity: 'MEDIUM',
            file: path.join(stepDirName, stepFile),
            detail: 'Step file frontmatter contains `description:` — this is metadata noise.',
            fix: 'Remove `description:` from step file frontmatter.',
          });
        }
      }
    }

    // STEP-07: step count 2-15
    const stepCount = stepFiles.filter((f) => f.startsWith('step-')).length;
    if (stepCount > 0 && (stepCount < 2 || stepCount > 15)) {
      const detail =
        stepCount < 2
          ? `Only ${stepCount} step file found — consider inlining into workflow.md.`
          : `${stepCount} step files found — more than 15 risks LLM context degradation.`;
      findings.push({
        rule: 'STEP-07',
        title: 'Step Count',
        severity: 'LOW',
        file: stepDirName + '/',
        detail,
        fix: stepCount > 15 ? 'Consider consolidating steps.' : 'Consider expanding or inlining.',
      });
    }
  }

  // --- SEQ-02: no time estimates ---
  for (const filePath of allFiles) {
    const ext = path.extname(filePath);
    if (!['.md', '.yaml', '.yml'].includes(ext)) continue;

    const relFile = path.relative(skillDir, filePath);
    const content = safeReadFile(filePath, findings, relFile);
    if (content === null) continue;
    const stripped = stripCodeBlocks(content);
    const lines = stripped.split('\n');

    for (const [i, line] of lines.entries()) {
      // Skip lines that are rules/docs ABOUT not using time estimates (negation context)
      if (/\bno\s+time\b|\bnever\b|\bnot\s+allowed\b|\bforbidden\b|\bdon['']t\b|\bavoid\b/i.test(line)) continue;
      // Skip table rows documenting forbidden patterns (pipe-delimited with "wrong"/"varies"/"not")
      if (line.includes('|') && /varies|not\s+portable|wrong/i.test(line)) continue;
      // Skip template placeholders — e.g., "[Sum of durations]" in output templates
      if (/\[.*(?:duration|time|sum).*\]/i.test(line)) continue;

      for (const pattern of TIME_ESTIMATE_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({
            rule: 'SEQ-02',
            title: 'No Time Estimates',
            severity: 'LOW',
            file: relFile,
            line: i + 1,
            detail: `Time estimate pattern found: "${line.trim()}"`,
            fix: 'Remove time estimates — AI execution speed varies too much.',
          });
          break; // Only report once per line
        }
      }
    }
  }

  // --- STACK-15: bmad-shared/stacks/{lang}.md must have required H2 sections ---
  // Stack files describe per-language runtime-robustness rules consumed by
  // protocols (concurrency-review, null-safety-review). The required sections
  // mirror the H2 anchors those protocols read.
  // Severity is LOW (warning) so partial files are allowed during development.
  if (dirName === 'bmad-shared') {
    const stacksDir = path.join(skillDir, 'stacks');
    if (fs.existsSync(stacksDir) && fs.statSync(stacksDir).isDirectory()) {
      const REQUIRED_STACK_H2 = ['## Concurrency', '## Null Safety'];
      const stackFiles = fs.readdirSync(stacksDir).filter((f) => f.endsWith('.md') && path.basename(f) !== 'README.md');

      for (const stackFile of stackFiles) {
        const stackPath = path.join(stacksDir, stackFile);
        const relFile = path.join('stacks', stackFile);
        const content = safeReadFile(stackPath, findings, relFile);
        if (content === null) continue;

        for (const requiredH2 of REQUIRED_STACK_H2) {
          // Match the H2 header on its own line (anchored, multiline).
          const escaped = requiredH2.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
          const regex = new RegExp(`^${escaped}\\s*$`, 'm');
          if (!regex.test(content)) {
            findings.push({
              rule: 'STACK-15',
              title: 'Stack File Required H2 Sections',
              severity: 'LOW',
              file: relFile,
              detail: `Stack file is missing required H2 section: "${requiredH2}".`,
              fix: `Add a "${requiredH2}" H2 section per src/core-skills/bmad-shared/stacks/README.md convention.`,
            });
          }
        }
      }
    }
  }

  // ============================================================
  // HARD-01..08 — Workflow Adherence Hardening
  // Enforces the canonical anti-rationalization countermeasures
  // documented in src/core-skills/bmad-shared/core/workflow-adherence.md.
  // Severity HIGH => exit 1 in --strict mode.
  // Only applied to skills that HAVE a workflow.md (workflow-style skills).
  // ============================================================

  if (fs.existsSync(workflowMdPath)) {
    const wfContent = safeReadFile(workflowMdPath, findings, 'workflow.md');
    if (wfContent !== null) {
      // --- HARD-01: workflow.md must contain CHK-INIT in INITIALIZATION ---
      const hasInitialization = /^##\s+INITIALIZATION\s*$/m.test(wfContent);
      const hasChkInit = /CHK-INIT/.test(wfContent);
      if (hasInitialization && !hasChkInit) {
        findings.push({
          rule: 'HARD-01',
          title: 'workflow.md Must Contain CHK-INIT in INITIALIZATION',
          severity: 'HIGH',
          file: 'workflow.md',
          detail:
            'INITIALIZATION section present but no CHK-INIT Read Receipt block found. Per workflow-adherence Rule 2, every workflow must emit a structured CHK-INIT receipt enumerating loaded files.',
          fix: 'Add a CHK-INIT block at the end of INITIALIZATION (template in src/core-skills/bmad-shared/core/workflow-adherence.md "Rule 2 — Read Receipt at INITIALIZATION").',
        });
      }
    }

    // Walk all step files for HARD-02 to HARD-08
    if (fs.existsSync(stepsDir)) {
      const stepFiles = fs
        .readdirSync(stepsDir)
        .filter((f) => /^step-\d{2}[a-z]?-[a-z0-9-]+\.md$/.test(f))
        .sort();

      for (const stepFile of stepFiles) {
        const stepPath = path.join(stepsDir, stepFile);
        const relStepFile = `steps/${stepFile}`;
        const stepContent = safeReadFile(stepPath, findings, relStepFile);
        if (stepContent === null) continue;

        // Extract step number (handle both step-01 and step-02d patterns)
        const stepNumMatch = stepFile.match(/^step-(\d{2}[a-z]?)-/);
        const stepNum = stepNumMatch ? stepNumMatch[1] : '??';

        // --- HARD-03: step file must open with NO-SKIP CLAUSE ---
        if (!/##\s+NO-SKIP CLAUSE/.test(stepContent)) {
          findings.push({
            rule: 'HARD-03',
            title: 'Step File Must Open With NO-SKIP CLAUSE',
            severity: 'HIGH',
            file: relStepFile,
            detail:
              'Missing "## NO-SKIP CLAUSE" block. Per workflow-adherence Rule 6, every step file must declare the no-skip clause to block rationalizations.',
            fix: 'Insert the canonical "## NO-SKIP CLAUSE (workflow-adherence Rule 1)" block right after the H1 header. Template in src/core-skills/bmad-shared/core/workflow-adherence.md.',
          });
        }

        // --- HARD-05: step file must contain CHK-STEP-NN-ENTRY ---
        const entryRegex = new RegExp(`CHK-STEP-${stepNum}-ENTRY`, 'i');
        if (!entryRegex.test(stepContent)) {
          findings.push({
            rule: 'HARD-05',
            title: `Step File Must Contain CHK-STEP-${stepNum}-ENTRY`,
            severity: 'HIGH',
            file: relStepFile,
            detail: `Missing CHK-STEP-${stepNum}-ENTRY checkpoint. Per workflow-adherence Rule 4, every step must verify its preconditions and emit an entry receipt.`,
            fix: `Insert a "## STEP ENTRY (CHK-STEP-${stepNum}-ENTRY)" block after the NO-SKIP CLAUSE. Template in src/core-skills/bmad-shared/core/workflow-adherence.md.`,
          });
        }

        // --- HARD-04: step file must contain CHK-STEP-NN-EXIT ---
        const exitRegex = new RegExp(`CHK-STEP-${stepNum}-EXIT`, 'i');
        if (!exitRegex.test(stepContent)) {
          findings.push({
            rule: 'HARD-04',
            title: `Step File Must Contain CHK-STEP-${stepNum}-EXIT`,
            severity: 'HIGH',
            file: relStepFile,
            detail: `Missing CHK-STEP-${stepNum}-EXIT receipt. Per workflow-adherence Rule 4, every step must emit an exit receipt enumerating actions executed and artifacts produced before transitioning.`,
            fix: `Insert a "## STEP EXIT (CHK-STEP-${stepNum}-EXIT)" block at the end of the step before the Next: transition. Template in src/core-skills/bmad-shared/core/workflow-adherence.md.`,
          });
        }

        // --- HARD-02 / HARD-07 / HARD-08: anti-skim phrasing on every Next: ---
        // Find all "Next:" lines (markdown style "**Next:**" or plain "Next:")
        const lines = stepContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Match "**Next:**" or "Next:" at line start (allowing leading whitespace)
          const nextMatch = line.match(/^\s*(\*\*Next:\*\*|Next:)\s+(.+)/);
          if (!nextMatch) continue;

          // Skip lines inside code blocks (rough heuristic: count fences before this line)
          const beforeText = lines.slice(0, i).join('\n');
          const fenceCount = (beforeText.match(/^```/gm) || []).length;
          if (fenceCount % 2 === 1) continue; // inside a code block

          const remainder = nextMatch[2];

          // Skip terminal-state Next: lines that explicitly declare end of workflow
          // (e.g. "**Next:** This is the final step. No next step file.")
          // These are valid endings, not transitions to file-load.
          const isTerminal = /no next step|final step|workflow.*complete|workflow ends|end of workflow|nothing to load/i.test(remainder);
          // Also skip if no path reference at all (no .md, no backtick, no {placeholder})
          const hasPathRef = /`[^`]+`/.test(remainder) || /\.md\b/.test(remainder) || /\{[a-zA-Z_]+\}/.test(remainder);
          if (isTerminal || !hasPathRef) continue;

          const hasReadFully = /Read FULLY and apply/.test(remainder);
          const hasAntiSkimPhrase = /do not summarise from memory, do not skip sections/.test(remainder);

          // HARD-02 / HARD-07: must use canonical "Read FULLY and apply" pattern
          if (!hasReadFully) {
            findings.push({
              rule: 'HARD-07',
              title: 'Soft Next: Transition Without Anti-Skim Phrasing',
              severity: 'HIGH',
              file: relStepFile,
              line: i + 1,
              detail: `Next: transition does not use the canonical "Read FULLY and apply" prefix. Soft transitions allow Claude to skip the next step.`,
              fix: 'Rewrite as: **Next:** Read FULLY and apply: `path/to/next.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.',
            });
          }

          // HARD-08: must include the full anti-skim sentence
          if (!hasAntiSkimPhrase) {
            findings.push({
              rule: 'HARD-08',
              title: 'Next: Transition Missing Anti-Skim Phrase',
              severity: 'HIGH',
              file: relStepFile,
              line: i + 1,
              detail:
                'Next: transition is missing the exact phrase "do not summarise from memory, do not skip sections". This phrase is required to block Claude from optimizing away the next-step read.',
              fix: 'Append to the Next: line: "— load the file with the Read tool, do not summarise from memory, do not skip sections."',
            });
          }
        }
      }

      // --- HARD-06: workflow's last step OR workflow.md must declare CHK-WORKFLOW-COMPLETE ---
      if (stepFiles.length > 0) {
        const lastStepPath = path.join(stepsDir, stepFiles.at(-1));
        const lastStepContent = safeReadFile(lastStepPath, findings, `steps/${stepFiles.at(-1)}`);
        const lastStepHasComplete = lastStepContent !== null && /CHK-WORKFLOW-COMPLETE/.test(lastStepContent);
        const wfHasComplete = wfContent !== null && /CHK-WORKFLOW-COMPLETE/.test(wfContent);
        if (!lastStepHasComplete && !wfHasComplete) {
          findings.push({
            rule: 'HARD-06',
            title: 'Workflow Must Declare CHK-WORKFLOW-COMPLETE',
            severity: 'HIGH',
            file: `steps/${stepFiles.at(-1)}`,
            detail:
              'Neither the last step file nor workflow.md declares a CHK-WORKFLOW-COMPLETE receipt. Per workflow-adherence Rule 7, every workflow must emit a final receipt enumerating all CHK-STEP-NN-EXIT emitted in the conversation.',
            fix: 'Insert a "## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)" block at the end of the last step file (or in workflow.md). Template in src/core-skills/bmad-shared/core/workflow-adherence.md.',
          });
        }
      }

      // --- HARD-09: AskUserQuestion in teammate-spawnable workflows must be TEAMMATE_MODE-conditional ---
      // M23 of `standalone-auto-flow-unification.md` / TAC-12.
      // Enumeration mechanism (DesB-8): SKILL.md frontmatter `teammate_spawnable: true|false`.
      // The rule applies ONLY when SKILL.md declares `teammate_spawnable: true`.
      // When `teammate_spawnable` is absent or false, this rule is a no-op (backward-compat with existing skills).
      const teammateSpawnable =
        skillFm !== null &&
        Object.prototype.hasOwnProperty.call(skillFm, 'teammate_spawnable') &&
        String(skillFm.teammate_spawnable).trim().toLowerCase() === 'true';

      if (teammateSpawnable && fs.existsSync(stepsDir)) {
        for (const stepFile of stepFiles) {
          const stepPath = path.join(stepsDir, stepFile);
          const relStepFile = `steps/${stepFile}`;
          const stepContent = safeReadFile(stepPath, findings, relStepFile);
          if (stepContent === null) continue;

          // Find every line that mentions AskUserQuestion (excluding fenced code blocks).
          // Use stripCodeBlocks() which uses the canonical /```[\s\S]*?```/ pattern — handles
          // unmatched fences correctly (no inFence state to leak across files) per RevSec-2 fix.
          const stepStripped = stripCodeBlocks(stepContent);
          const linesWithFences = stepStripped.split('\n');
          for (let i = 0; i < linesWithFences.length; i++) {
            const line = linesWithFences[i];
            if (!/AskUserQuestion/.test(line)) continue;

            // Allow lines that explicitly mark themselves as TEAMMATE_MODE-conditional.
            // Heuristic per `bmad-shared/teams/teammate-mode-routing.md §A` (rerouting pattern):
            // either (a) the same line names TEAMMATE_MODE / TEAM_MODE / SendMessage in proximity, OR
            // (b) the surrounding ±10 lines contain a literal "If TEAMMATE_MODE" or "When TEAMMATE_MODE=false" guard.
            const sameLineCompliant = /TEAMMATE_MODE/.test(line) || /SendMessage/.test(line) || /teammate-mode-routing/.test(line);

            const window = linesWithFences.slice(Math.max(0, i - 10), Math.min(linesWithFences.length, i + 11)).join('\n');
            const surroundingCompliant =
              /If\s+TEAMMATE_MODE/i.test(window) ||
              /When\s+TEAMMATE_MODE/i.test(window) ||
              /TEAMMATE_MODE=false\s*\(standalone\)/i.test(window) ||
              /reroute(d)?\s+via\s+SendMessage/i.test(window) ||
              /per\s+`?teammate-mode-routing\.md`?\s+§A/i.test(window);

            if (!sameLineCompliant && !surroundingCompliant) {
              findings.push({
                rule: 'HARD-09',
                title: 'AskUserQuestion Must Be TEAMMATE_MODE-Conditional in Teammate-Spawnable Workflow',
                severity: 'HIGH',
                file: relStepFile,
                line: i + 1,
                detail:
                  'AskUserQuestion call detected in a teammate-spawnable workflow without a TEAMMATE_MODE-conditional guard. Per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §A`, AskUserQuestion silently fails in TEAMMATE_MODE — the call must be rerouted via `SendMessage(question)` to the lead.',
                fix: 'Wrap the AskUserQuestion call in a TEAMMATE_MODE-conditional block: `If TEAMMATE_MODE=true: emit SendMessage(question) per §A — block until question_reply. Else: AskUserQuestion(...) directly.` See `src/core-skills/bmad-shared/teams/teammate-mode-routing.md §ENFORCEMENT Registry` for compliant examples.',
              });
            }
          }
        }
      }
    }
  }

  return findings;
}

// --- Output Formatting ---

function formatHumanReadable(results) {
  const output = [];
  let totalFindings = 0;
  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  output.push(
    `\nValidating skills in: ${SRC_DIR}`,
    `Mode: ${STRICT ? 'STRICT (exit 1 on HIGH+)' : 'WARNING (exit 0)'}${JSON_OUTPUT ? ' + JSON' : ''}\n`,
  );

  let totalSkills = 0;
  let skillsWithFindings = 0;

  for (const { skillDir, findings } of results) {
    totalSkills++;
    const relDir = path.relative(PROJECT_ROOT, skillDir);

    if (findings.length > 0) {
      skillsWithFindings++;
      output.push(`\n${relDir}`);

      for (const f of findings) {
        totalFindings++;
        severityCounts[f.severity]++;
        const location = f.line ? ` (line ${f.line})` : '';
        output.push(`  [${f.severity}] ${f.rule} — ${f.title}`, `    File: ${f.file}${location}`, `    ${f.detail}`);

        if (process.env.GITHUB_ACTIONS) {
          const absFile = path.join(skillDir, f.file);
          const ghFile = path.relative(PROJECT_ROOT, absFile);
          const line = f.line || 1;
          const level = f.severity === 'LOW' ? 'notice' : 'warning';
          console.log(`::${level} file=${ghFile},line=${line}::${escapeAnnotation(`${f.rule}: ${f.detail}`)}`);
        }
      }
    }
  }

  // Summary
  output.push(
    `\n${'─'.repeat(60)}`,
    `\nSummary:`,
    `   Skills scanned: ${totalSkills}`,
    `   Skills with findings: ${skillsWithFindings}`,
    `   Total findings: ${totalFindings}`,
  );

  if (totalFindings > 0) {
    output.push('', `   | Severity | Count |`, `   |----------|-------|`);
    for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
      if (severityCounts[sev] > 0) {
        output.push(`   | ${sev.padEnd(8)} | ${String(severityCounts[sev]).padStart(5)} |`);
      }
    }
  }

  const hasHighPlus = severityCounts.CRITICAL > 0 || severityCounts.HIGH > 0;

  if (totalFindings === 0) {
    output.push(`\n   All skills passed validation!`);
  } else if (STRICT && hasHighPlus) {
    output.push(`\n   [STRICT MODE] HIGH+ findings found — exiting with failure.`);
  } else if (STRICT) {
    output.push(`\n   [STRICT MODE] Only MEDIUM/LOW findings — pass.`);
  } else {
    output.push(`\n   Run with --strict to treat HIGH+ findings as errors.`);
  }

  output.push('');

  // Write GitHub Actions step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    let summary = '## Skill Validation\n\n';
    if (totalFindings > 0) {
      summary += '| Skill | Rule | Severity | File | Detail |\n';
      summary += '|-------|------|----------|------|--------|\n';
      for (const { skillDir, findings } of results) {
        const relDir = path.relative(PROJECT_ROOT, skillDir);
        for (const f of findings) {
          summary += `| ${escapeTableCell(relDir)} | ${f.rule} | ${f.severity} | ${escapeTableCell(f.file)} | ${escapeTableCell(f.detail)} |\n`;
        }
      }
      summary += '\n';
    }
    summary += `**${totalSkills} skills scanned, ${totalFindings} findings**\n`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }

  return { output: output.join('\n'), hasHighPlus };
}

function formatJson(results) {
  const allFindings = [];
  for (const { skillDir, findings } of results) {
    const relDir = path.relative(PROJECT_ROOT, skillDir);
    for (const f of findings) {
      allFindings.push({
        skill: relDir,
        rule: f.rule,
        title: f.title,
        severity: f.severity,
        file: f.file,
        line: f.line || null,
        detail: f.detail,
        fix: f.fix,
      });
    }
  }

  // Sort by severity
  allFindings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const hasHighPlus = allFindings.some((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');

  return { output: JSON.stringify(allFindings, null, 2), hasHighPlus };
}

// --- Main ---

if (require.main === module) {
  // Determine which skills to validate
  let skillDirs;

  if (positionalArgs.length > 0) {
    // Single skill directory specified
    const target = path.resolve(positionalArgs[0]);
    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
      console.error(`Error: "${positionalArgs[0]}" is not a valid directory.`);
      process.exit(2);
    }
    skillDirs = [target];
  } else {
    // Discover all skills
    skillDirs = discoverSkillDirs([SRC_DIR]);
  }

  if (skillDirs.length === 0) {
    console.error('No skill directories found.');
    process.exit(2);
  }

  // Validate each skill
  const results = [];
  for (const skillDir of skillDirs) {
    const findings = validateSkill(skillDir);
    results.push({ skillDir, findings });
  }

  // Format output
  const { output, hasHighPlus } = JSON_OUTPUT ? formatJson(results) : formatHumanReadable(results);
  console.log(output);

  // Exit code
  if (STRICT && hasHighPlus) {
    process.exit(1);
  }
}

// --- Exports (for testing) ---
module.exports = { parseFrontmatter, parseFrontmatterMultiline, validateSkill, discoverSkillDirs };
