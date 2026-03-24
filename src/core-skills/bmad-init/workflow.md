# BMAD Init — Project Initialization Workflow

**Goal:** Set up a project to work with all bmad-* workflow skills by creating `.claude/workflow-context.md` and `.claude/workflow-knowledge/` files.

**Your Role:** A meticulous project analyst who scans the codebase, detects everything possible automatically, and asks the user only for what cannot be inferred.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **Interactive**: Each step presents findings and asks for confirmation/correction

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **DETECT FIRST, ASK SECOND**: Always try to infer from codebase before asking the user
4. **CONFIRM, DON'T GUESS**: Present findings for user validation

---

## PREFLIGHT

### 1. Verify project root

Confirm we are in a git repository root (`git rev-parse --show-toplevel`). HALT if not.

### 2. Assess current state

Run a comprehensive scan to understand where the project stands. Check ALL of the following:

**A. New-format setup (our conventions):**
- `.claude/workflow-context.md` exists?
- `.claude/workflow-knowledge/` directory exists? Which files?
- Count TODOs in existing files (`grep -rc "TODO" .claude/workflow-context.md .claude/workflow-knowledge/*.md 2>/dev/null`)
- Check for missing required keys in workflow-context.md frontmatter

**B. Legacy BMAD installation:**
- `_bmad/` directory at project root? → BMAD upstream installed via `npx bmad-method`
- `.claude/workflows/` with `workflow.yaml` or `instructions.md` files? → Legacy workflow format
- `.claude/commands/` files referencing `workflow.xml` or `workflow.yaml`? → Legacy command shims
- BMAD config files: `_bmad/bmm/config.yaml`, `_bmad/core/config.yaml`?

**C. Global skills available:**
- Which `bmad-*` skills exist in `~/.claude/skills/`?

**D. Skill coverage audit:**

Compare legacy workflows to global skills. For EACH legacy workflow in `.claude/workflows/`:
1. Extract the workflow name (directory name)
2. Check if a corresponding global skill exists in `~/.claude/skills/bmad-*`
3. Classify as: MIGRATED (global skill exists), NOT_MIGRATED (no global equivalent), or UNKNOWN

Also compare the other direction: for each global `bmad-*` skill, verify it can actually work with this project's `workflow-context.md` and `workflow-knowledge/`.

**E. Knowledge file content audit (if files exist):**

For each existing knowledge file, do NOT just check "file exists". Verify the content is **current and complete**:
- `stack.md`: does it list all services found in `apps/`? Has the stack changed since last init?
- `tracker.md`: are all tracker MCP tools listed? Are state IDs still valid?
- `infrastructure.md`: does it match current `terraform/`, `Dockerfile`, CI config?
- `environment-config.md`: are URLs, proxy ports, project IDs filled in (no placeholders)?
- `investigation-checklist.md`: does it cover all domain areas present in the codebase?
- `review-perspectives.md`: does it reference the project's actual patterns and conventions?

Report any **stale content** (e.g., a service exists in `apps/` but is not in `stack.md`) alongside TODOs.

**Classify the project into ONE of these states:**

| State | Condition | Action |
|-------|-----------|--------|
| **FRESH** | No workflow-context.md, no legacy | Full init from scratch |
| **LEGACY_ONLY** | No workflow-context.md, but `_bmad/` or legacy workflows exist | Extract from legacy, then full init |
| **PARTIAL_INIT** | workflow-context.md exists but has TODOs, missing keys, or stale/incomplete knowledge files | Resume: fill gaps, update stale content |
| **MIGRATION_IN_PROGRESS** | workflow-context.md exists AND legacy files still present (regardless of TODO count) | Complete: fill remaining gaps, migrate uncovered workflows, propose legacy cleanup |
| **COMPLETE** | workflow-context.md exists, no TODOs, no missing keys, knowledge files are current, AND no legacy artifacts remain | Offer: update, validate |

**IMPORTANT:** A project with legacy artifacts (`_bmad/`, legacy workflows, legacy commands) is NEVER classified as COMPLETE — it is always MIGRATION_IN_PROGRESS. The presence of legacy = migration not finished.

Present the assessment:

```
Project state: {STATE}

New-format setup:
  workflow-context.md:    {EXISTS / MISSING} {N TODOs if exists}
  workflow-knowledge/:    {N of 6 files present}
  Missing keys:           {list or "none"}
  Stale content:          {list of knowledge files with outdated/missing content, or "none detected"}

Legacy artifacts:
  _bmad/ directory:       {YES / NO}
  Legacy workflows:       {N files in .claude/workflows/}
  Legacy commands:        {N commands referencing workflow.xml/yaml}
  Extractable config:     {YES (user_name, language, etc.) / NO}

Skill coverage:
  Global bmad-* skills:   {N available in ~/.claude/skills/}
  Legacy workflows:       {N total}
  Migrated (have global): {N} — {list}
  NOT migrated:           {N} — {list of legacy workflows with no global equivalent}
  Coverage:               {N}/{M} ({percentage}%)
```

HALT and wait for user choice:

- **FRESH**: "[C] Continue with full initialization"
- **LEGACY_ONLY**: "[E] Extract from legacy and initialize / [S] Start fresh, ignore legacy / [Q] Quit"
- **PARTIAL_INIT**: "[R] Resume from where we left off / [F] Full re-init / [Q] Quit"
- **MIGRATION_IN_PROGRESS**: "[R] Resume and complete migration (fill gaps + migrate uncovered workflows + update stale knowledge + cleanup legacy) / [C] Cleanup legacy only (skip init steps) / [Q] Quit"
- **COMPLETE**: "[U] Update config with new detections / [V] Validate current setup / [Q] Quit"

### 3. Extract from legacy (if applicable)

If state is LEGACY_ONLY or MIGRATION_IN_PROGRESS and user chose Extract/Resume:

Read available BMAD config files and extract defaults:
- `_bmad/bmm/config.yaml` or `_bmad/core/config.yaml` → `user_name`, `communication_language`, `document_output_language`, `project_name`
- `.claude/workflows/**/knowledge.md` → tracker IDs, team name, state mappings (generic extraction: look for YAML-like key-value patterns)
- `.claude/workflows/**/workflow.yaml` → worktree templates, forge paths, branch templates

Store all extracted values as defaults for subsequent steps. Present what was extracted.

### 3b. Detect legacy improvements (best-of-both-worlds)

If the project has BOTH legacy workflows AND new global bmad-* skills that correspond to the same function:

1. For each legacy workflow found (e.g., `.claude/workflows/*/workflow.yaml`):
   - Identify which global skill replaces it (by matching workflow name to skill name)
   - Compare: read the legacy workflow's instructions/steps and the global skill's steps
   - Look for **content the legacy has that the global doesn't**: extra checks, domain-specific logic, project-specific patterns that were added after the initial migration
   - If found: flag as LEGACY_IMPROVEMENT

2. Present any LEGACY_IMPROVEMENTs found:
   > Found improvements in legacy workflows that may not be in the global skills:
   > {list of improvements with source file and description}
   >
   > These may have been added to the legacy workflows after the global migration.
   > **[I] Integrate** — Apply these improvements to the appropriate target (global skill or project knowledge)
   > **[S] Skip** — Ignore, the global skills are the source of truth
   > **[R] Review** — Show me each one in detail before deciding

3. If Integrate: for each improvement, determine the right target:
   - Project-specific logic → add to `.claude/workflow-knowledge/`
   - Generic improvement → propose edit to global skill via retrospective-step.md pattern

### 4. Determine step routing

Based on state and user choice:

- **Full init** (FRESH, or user chose Full/Start fresh): Run steps 01 through 08
- **Resume** (PARTIAL_INIT, MIGRATION_IN_PROGRESS):
  - Read existing workflow-context.md, load all current values as defaults
  - Identify which steps produced complete output (no TODOs in their section)
  - Skip completed steps, run only the ones with gaps
  - Always run step 08 (verify + cleanup)
- **Cleanup only** (COMPLETE or MIGRATION_IN_PROGRESS with cleanup choice):
  - Jump directly to step 08 (verify + legacy cleanup)
- **Validate only** (COMPLETE with validate choice):
  - Invoke the `bmad-validate-skill` skill on the project's workflow-context.md? No — that's for skills. Instead, run step 08's verification section inline.

### 5. Create target directories

```bash
mkdir -p .claude/workflow-knowledge
```

---

## STEP SEQUENCE

Read fully and follow `./steps/step-01-detect-project.md` to begin.

| Step | Goal | Mode | Condition |
|------|------|------|-----------|
| 01 | Detect project identity, package manager, monorepo structure | Auto-detect + confirm | Always |
| 02 | Detect issue tracker (Linear, GitHub, GitLab Issues, Jira) | Auto-detect + configure | Always |
| 03 | Detect source forge (GitLab, GitHub) and CLI tools | Auto-detect + confirm | Always |
| 04 | Detect tech stack, frameworks, ORMs, test tools | Auto-detect + confirm | Always |
| 05 | Detect infrastructure (cloud provider, CI/CD, deployment) | Auto-detect + confirm | Always |
| 06 | Generate workflow-context.md | Write + confirm | Always |
| 07 | Generate workflow-knowledge/ files | Write + confirm | Always |
| 08 | Verify and summary | Validate + present | Always |
| 09 | Migrate legacy workflows | Analyze + diff + migrate | MIGRATION_IN_PROGRESS only |

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
