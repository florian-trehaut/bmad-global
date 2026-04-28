/**
 * Migration tool: workflow-adherence hardening.
 *
 * Adds the 4 canonical anti-rationalization blocks (NO-SKIP CLAUSE,
 * CHK-STEP-NN-ENTRY, CHK-STEP-NN-EXIT, CHK-WORKFLOW-COMPLETE) plus
 * standardizes "Next:" transitions with the canonical anti-skim phrasing
 * to every bmad-* workflow under src/.
 *
 * Idempotent: skips files that already have the markers.
 *
 * Usage: node tools/migrate-workflow-hardening.js [--dry-run] [--workflow=name]
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const WORKFLOW_FILTER = args.find((a) => a.startsWith('--workflow='))?.slice('--workflow='.length);

// --- Canonical blocks ---

const NO_SKIP_BLOCK = `## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.`;

function chkStepEntryBlock(nn, stepName) {
  return `## STEP ENTRY (CHK-STEP-${nn}-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

\`\`\`
CHK-STEP-${nn}-ENTRY PASSED — entering ${stepName} with {var=value, ...}
\`\`\`

Si une precondition manque => HALT, signaler quelle precondition.`;
}

function chkStepExitBlock(nn, stepName) {
  return `## STEP EXIT (CHK-STEP-${nn}-EXIT)

Avant de transitionner, emettre EXACTEMENT:

\`\`\`
CHK-STEP-${nn}-EXIT PASSED — completed ${stepName}
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
\`\`\`

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.`;
}

function chkWorkflowCompleteBlock(workflowName, stepNumbers) {
  const stepList = stepNumbers.map((n) => `'${n}'`).join(', ');
  return `## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

\`\`\`
CHK-WORKFLOW-COMPLETE PASSED — workflow ${workflowName} executed end-to-end:
  steps_executed: [${stepList}]   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
\`\`\`

Si steps_executed != [${stepList}] sequentiel ET steps_skipped sans citation user verbatim => HALT.`;
}

const CHK_INIT_BLOCK = `### CHK-INIT — Initialization Read Receipt

Emit EXACTLY this block (filling in actual values you read), then proceed to the first step. If any line cannot be filled truthfully, HALT.

\`\`\`
CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: {N} files (list filenames)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md ({"loaded" | "not required" | "required-but-missing"})
    - api.md ({"loaded" | "not required" | "required-but-missing"})
  worktree_path: {WORKTREE_PATH or "n/a"}
  team_mode: {true | false}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
\`\`\``;

// --- Helpers ---

function discoverWorkflows() {
  const workflows = [];
  function walk(dir) {
    if (!fs.statSync(dir).isDirectory()) return;
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      const sub = path.join(dir, entry);
      if (!fs.statSync(sub).isDirectory()) continue;
      const wf = path.join(sub, 'workflow.md');
      if (fs.existsSync(wf)) {
        workflows.push(sub);
      } else {
        walk(sub);
      }
    }
  }
  walk(SRC_DIR);
  return workflows;
}

function readStepFiles(skillDir) {
  const stepsDir = path.join(skillDir, 'steps');
  if (!fs.existsSync(stepsDir)) return [];
  return fs
    .readdirSync(stepsDir)
    .filter((f) => /^step-\d{2}[a-z]?-[a-z0-9-]+\.md$/.test(f))
    .sort()
    .map((f) => ({ name: f, path: path.join(stepsDir, f) }));
}

function extractStepNum(filename) {
  const match = filename.match(/^step-(\d{2}[a-z]?)-/);
  return match ? match[1] : null;
}

function extractStepName(filename, content) {
  // Try to get the H1 from content
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  // Fallback to filename
  return filename.replace(/^step-\d{2}[a-z]?-/, '').replace(/\.md$/, '');
}

function writeFileSync(filePath, content) {
  if (DRY_RUN) {
    console.log(`[DRY] would write ${path.relative(PROJECT_ROOT, filePath)}`);
    return;
  }
  fs.writeFileSync(filePath, content);
}

// --- Mutation logic per file type ---

function injectIntoStepFile(stepPath, stepNum, stepName) {
  const original = fs.readFileSync(stepPath, 'utf-8');
  let content = original;
  let changed = false;

  // Strip frontmatter for analysis (we'll re-add it in same position).
  // Handle both populated `---\nkey: val\n---\n` and empty `---\n---\n` forms.
  let frontmatter = '';
  const fmMatch = content.match(/^(---\n[\s\S]*?---\n+)/);
  if (fmMatch) {
    frontmatter = fmMatch[1];
    content = content.slice(fmMatch[1].length);
  }

  // 1. Inject NO-SKIP CLAUSE after H1 (if not present)
  if (!/##\s+NO-SKIP CLAUSE/.test(content)) {
    // Find H1 line — multiline flag handles leading whitespace/blank lines
    const h1Match = content.match(/^#\s+.+$/m);
    if (h1Match) {
      const h1Idx = content.indexOf(h1Match[0]);
      const h1End = h1Idx + h1Match[0].length + 1; // +1 for trailing newline
      // Find first H2 or end of any preamble. We insert right after H1 (and any immediate paragraph).
      // Preserve any text between H1 and the first H2.
      const afterH1 = content.slice(h1End);
      const firstH2 = afterH1.search(/^##\s/m);
      const insertAt = firstH2 === -1 ? h1End : h1End + firstH2;
      content = content.slice(0, insertAt) + `\n${NO_SKIP_BLOCK}\n\n` + content.slice(insertAt);
      changed = true;
    }
  }

  // 2. Inject CHK-STEP-NN-ENTRY after NO-SKIP CLAUSE (if not present)
  const entryMarker = `CHK-STEP-${stepNum}-ENTRY`;
  if (!new RegExp(entryMarker).test(content)) {
    // Find end of NO-SKIP CLAUSE block (look for next H2 after it)
    const noSkipPos = content.search(/^##\s+NO-SKIP CLAUSE/m);
    if (noSkipPos !== -1) {
      // Find the next H2 after the NO-SKIP block
      const afterNoSkip = content.slice(noSkipPos + 5); // skip past "## NO-"
      const nextH2 = afterNoSkip.search(/^##\s/m);
      const insertAt = nextH2 === -1 ? content.length : noSkipPos + 5 + nextH2;
      content = content.slice(0, insertAt) + `${chkStepEntryBlock(stepNum, stepName)}\n\n` + content.slice(insertAt);
      changed = true;
    }
  }

  // 3. Inject CHK-STEP-NN-EXIT before final transition / at end (if not present)
  const exitMarker = `CHK-STEP-${stepNum}-EXIT`;
  if (!new RegExp(exitMarker).test(content)) {
    // Strategy: find the LAST "**Next:**" or "Next:" line (that's the transition)
    // Insert BEFORE it.
    // If no Next: line found, append at end.
    const lines = content.split('\n');
    let nextLineIdx = -1;
    let inFence = false;
    for (const [i, line] of lines.entries()) {
      if (line.trim().startsWith('```')) inFence = !inFence;
      if (inFence) continue;
      if (/^\s*(\*\*Next:\*\*|Next:)\s+/.test(line)) {
        nextLineIdx = i;
      }
    }

    const exitBlock = chkStepExitBlock(stepNum, stepName);
    if (nextLineIdx === -1) {
      // Append at end (with proper spacing)
      content = content.replace(/\s*$/, '\n\n---\n\n' + exitBlock + '\n');
    } else {
      // Insert before the Next: line; ensure separator and trailing blank
      // Find a sensible boundary: look back from nextLineIdx for an "---" or blank line
      let insertIdx = nextLineIdx;
      // Step back past any leading blank lines + horizontal rule
      while (insertIdx > 0 && (lines[insertIdx - 1] === '' || lines[insertIdx - 1] === '---')) {
        insertIdx--;
      }
      lines.splice(insertIdx, 0, '', '---', '', exitBlock, '');
      content = lines.join('\n');
    }
    changed = true;
  }

  // 4. Standardize Next: transitions to canonical anti-skim phrasing
  // Pattern target: **Next:** Read FULLY and apply: `path` — load the file with the Read tool, do not summarise from memory, do not skip sections.
  // Match existing variants and rewrite. Keep the path as-is.
  const lines2 = content.split('\n');
  let inFence2 = false;
  for (let i = 0; i < lines2.length; i++) {
    if (lines2[i].trim().startsWith('```')) inFence2 = !inFence2;
    if (inFence2) continue;
    const line = lines2[i];
    // Match a Next: line that has a path reference
    const m = line.match(/^(\s*)(\*\*Next:\*\*|Next:)\s+(.+)$/);
    if (!m) continue;

    const indent = m[1];
    const remainder = m[3];

    // Already canonical?
    if (/Read FULLY and apply/.test(remainder) && /do not summarise from memory, do not skip sections/.test(remainder)) {
      continue;
    }

    // Extract a path (first backtick-quoted token, or first .md token, or {placeholder})
    let pathRef = null;
    const backtickMatch = remainder.match(/`([^`]+)`/);
    if (backtickMatch) {
      pathRef = backtickMatch[1];
    } else {
      const plainMatch = remainder.match(/([^\s]+\.md)/);
      if (plainMatch) pathRef = plainMatch[1];
      else {
        // Look for a {variable} placeholder
        const placeholderMatch = remainder.match(/\{([a-zA-Z_]+)\}/);
        if (placeholderMatch) pathRef = `{${placeholderMatch[1]}}`;
      }
    }

    if (!pathRef) continue; // not a path-ref Next: line, skip

    const newLine = `${indent}**Next:** Read FULLY and apply: \`${pathRef}\` — load the file with the Read tool, do not summarise from memory, do not skip sections.`;
    if (line !== newLine) {
      lines2[i] = newLine;
      changed = true;
    }
  }
  content = lines2.join('\n');

  if (changed) {
    writeFileSync(stepPath, frontmatter + content);
    return true;
  }
  return false;
}

function injectIntoWorkflowMd(workflowMdPath, workflowName) {
  const original = fs.readFileSync(workflowMdPath, 'utf-8');
  let content = original;
  let changed = false;

  // 1. Inject CHK-INIT block at end of INITIALIZATION (if not present)
  if (!/CHK-INIT/.test(content) && /^##\s+INITIALIZATION\s*$/m.test(content)) {
    // Find the INITIALIZATION section and the next H2 after it
    const initMatch = content.match(/^##\s+INITIALIZATION\s*$/m);
    if (initMatch) {
      const initStart = content.indexOf(initMatch[0]);
      const afterInit = content.slice(initStart + initMatch[0].length);
      const nextH2 = afterInit.search(/^##\s/m);
      const insertAt = nextH2 === -1 ? content.length : initStart + initMatch[0].length + nextH2;
      content = content.slice(0, insertAt) + `\n${CHK_INIT_BLOCK}\n\n` + content.slice(insertAt);
      changed = true;
    }
  }

  // 2. Standardize transition to step-01 (or first step) if any soft Next: exists in workflow.md
  const lines = content.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    const line = lines[i];
    const m = line.match(/^(\s*)(\*\*Next:\*\*|Next:)\s+(.+)$/);
    if (!m) continue;
    const indent = m[1];
    const remainder = m[3];
    if (/Read FULLY and apply/.test(remainder) && /do not summarise from memory, do not skip sections/.test(remainder)) {
      continue;
    }
    const backtickMatch = remainder.match(/`([^`]+\.md)`/);
    if (!backtickMatch) continue;
    const pathRef = backtickMatch[1];
    const newLine = `${indent}**Next:** Read FULLY and apply: \`${pathRef}\` — load the file with the Read tool, do not summarise from memory, do not skip sections.`;
    if (line !== newLine) {
      lines[i] = newLine;
      changed = true;
    }
  }
  content = lines.join('\n');

  if (changed) {
    writeFileSync(workflowMdPath, content);
    return true;
  }
  return false;
}

function injectWorkflowComplete(skillDir, workflowName, stepFiles) {
  if (stepFiles.length === 0) return false;
  const lastStep = stepFiles.at(-1);
  const lastStepContent = fs.readFileSync(lastStep.path, 'utf-8');
  if (/CHK-WORKFLOW-COMPLETE/.test(lastStepContent)) return false;

  // Also check workflow.md
  const workflowMdPath = path.join(skillDir, 'workflow.md');
  const wfContent = fs.readFileSync(workflowMdPath, 'utf-8');
  if (/CHK-WORKFLOW-COMPLETE/.test(wfContent)) return false;

  const stepNumbers = stepFiles.map((s) => extractStepNum(s.name)).filter(Boolean);
  const block = chkWorkflowCompleteBlock(workflowName, stepNumbers);

  // Append to last step file (after CHK-STEP-NN-EXIT block, before final Next: if any)
  // Strategy: find last "**Next:**" line, insert block BEFORE it. Else append.
  const lines = lastStepContent.split('\n');
  let nextLineIdx = -1;
  let inFence = false;
  for (const [i, line] of lines.entries()) {
    if (line.trim().startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    if (/^\s*(\*\*Next:\*\*|Next:)\s+/.test(line)) {
      nextLineIdx = i;
    }
  }

  let newContent;
  if (nextLineIdx === -1) {
    newContent = lastStepContent.replace(/\s*$/, '\n\n---\n\n' + block + '\n');
  } else {
    let insertIdx = nextLineIdx;
    while (insertIdx > 0 && (lines[insertIdx - 1] === '' || lines[insertIdx - 1] === '---')) {
      insertIdx--;
    }
    lines.splice(insertIdx, 0, '', '---', '', block, '');
    newContent = lines.join('\n');
  }

  writeFileSync(lastStep.path, newContent);
  return true;
}

// --- Main migration loop ---

function migrateWorkflow(skillDir) {
  const workflowName = path.basename(skillDir);
  if (WORKFLOW_FILTER && workflowName !== WORKFLOW_FILTER) return null;

  const workflowMdPath = path.join(skillDir, 'workflow.md');
  const stepFiles = readStepFiles(skillDir);

  const results = {
    workflow: workflowName,
    workflowMdChanged: false,
    stepsChanged: 0,
    stepsTotal: stepFiles.length,
    workflowCompleteAdded: false,
  };

  // 1. Migrate workflow.md (CHK-INIT + transition standardization)
  results.workflowMdChanged = injectIntoWorkflowMd(workflowMdPath, workflowName);

  // 2. Migrate each step file (NO-SKIP, CHK-ENTRY, CHK-EXIT, transitions)
  for (const sf of stepFiles) {
    const stepNum = extractStepNum(sf.name);
    if (!stepNum) continue;
    const content = fs.readFileSync(sf.path, 'utf-8');
    const stepName = extractStepName(sf.name, content);
    if (injectIntoStepFile(sf.path, stepNum, stepName)) {
      results.stepsChanged++;
    }
  }

  // 3. Inject CHK-WORKFLOW-COMPLETE in last step
  results.workflowCompleteAdded = injectWorkflowComplete(skillDir, workflowName, stepFiles);

  return results;
}

function main() {
  console.log(`Migration tool — workflow-adherence hardening`);
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  if (WORKFLOW_FILTER) console.log(`Filter: only workflow "${WORKFLOW_FILTER}"`);
  console.log('');

  const workflows = discoverWorkflows();
  console.log(`Discovered ${workflows.length} workflows.\n`);

  let totalWorkflowsChanged = 0;
  let totalStepsChanged = 0;
  let totalCompleteAdded = 0;
  const allResults = [];

  for (const skillDir of workflows) {
    const result = migrateWorkflow(skillDir);
    if (!result) continue;
    allResults.push(result);
    if (result.workflowMdChanged || result.stepsChanged > 0 || result.workflowCompleteAdded) {
      totalWorkflowsChanged++;
      totalStepsChanged += result.stepsChanged;
      if (result.workflowCompleteAdded) totalCompleteAdded++;
      console.log(
        `${result.workflow}: ${result.workflowMdChanged ? 'wf.md updated' : '-'}, ${result.stepsChanged}/${result.stepsTotal} steps updated${result.workflowCompleteAdded ? ', WORKFLOW-COMPLETE added' : ''}`,
      );
    } else {
      console.log(`${result.workflow}: already hardened (no changes)`);
    }
  }

  console.log('');
  console.log('====================================');
  console.log(`Workflows changed: ${totalWorkflowsChanged} / ${workflows.length}`);
  console.log(`Step files changed: ${totalStepsChanged}`);
  console.log(`CHK-WORKFLOW-COMPLETE added: ${totalCompleteAdded}`);
  console.log('====================================');
}

main();
