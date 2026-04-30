# Troubleshoot — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyProject |
| `ISSUE_PREFIX` | `issue_prefix` | PRJ |
| `TRACKER` | `tracker` | linear, github, gitlab, jira |
| `TRACKER_TEAM` | `tracker_team` | MyTeam |
| `TRACKER_TEAM_ID` | `tracker_team_id` | UUID |
| `TRACKER_STATES` | `tracker_states` | Map of state name to ID |
| `FORGE` | `forge` | gitlab, github |
| `FORGE_CLI` | `forge_cli` | glab, gh |
| `FORGE_MR_CREATE` | `forge_mr_create` | glab mr create |
| `FORGE_API_BASE` | `forge_api_base` | glab api |
| `FORGE_PROJECT_PATH` | `forge_project_path` | org/repo |
| `FORGE_PROJECT_PATH_ENCODED` | `forge_project_path_encoded` | org%2Frepo |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyProject |
| `BRANCH_TEMPLATE` | `branch_template` | feat/{issue_number}-{short_description} |
| `PACKAGE_MANAGER` | `package_manager` | pnpm |
| `INSTALL_COMMAND` | `install_command` | pnpm install |
| `BUILD_COMMAND` | `build_command` | pnpm affected:build |
| `TEST_COMMAND` | `test_command` | pnpm affected:test |
| `QUALITY_GATE` | `quality_gate` | pnpm typecheck && pnpm affected:test && pnpm lint && pnpm format:check |
| `FORMAT_FIX_COMMAND` | `format_fix_command` | pnpm format && pnpm lint --fix |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate evidence. If a log, DB query, or API call cannot be executed, HALT — never substitute with code analysis or "it probably works".**

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/core/knowledge-loading.md`). This file contains tech stack details, forbidden patterns, test rules, and reference code pointers.

### 4. Setup working environment

The worktree MUST be set up BEFORE any code investigation. Without it, code searches and git log target the main repo working tree, which may be stale or on a different branch.

Derive paths:

- `WORKTREE_PATH_EXPECTED`: `../{WORKTREE_PREFIX}-troubleshoot`
- `BRANCH_NAME`: `troubleshoot/{date}` where `{date}` is today in `YYYY-MM-DD` format

**Apply the full protocol from `bmad-shared/lifecycle/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `write` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `{BRANCH_NAME}` |
| `worktree_branch_strategy` | `feature-branch` |
| `worktree_alignment_check` | `CURRENT_BRANCH == {BRANCH_NAME}` OR `CURRENT_BRANCH` matches `troubleshoot/.*` |

After the protocol completes, `WORKTREE_PATH` is set.

**From this point on, ALL code investigation runs inside {WORKTREE_PATH}.**

### 5. Set defaults

- `ISSUE_ID = null` (populated by step-05)
- `ISSUE_IDENTIFIER = null` (populated by step-05)
- `MR_IID = null` (populated by step-07)

### 6. CHK-INIT — Initialization Read Receipt

Per `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rule 2, before starting step-01, emit EXACTLY this block (filling in actual values you read). If any line cannot be filled truthfully, HALT and report which precondition failed.

```
CHK-INIT PASSED — bmad-troubleshoot initialization complete:
  shared_rules_loaded: {N} files ({list filenames you actually Read})
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md ({"loaded" | "not required"})
    - api.md ({"loaded" | "not required"})
  worktree_path: {WORKTREE_PATH}
  worktree_reused_current: {true | false}
  team_mode: {true | false}
  user_name: {USER_NAME}
  communication_language: {COMMUNICATION_LANGUAGE}
  defaults: ISSUE_ID=null, ISSUE_IDENTIFIER=null, MR_IID=null
```

---

## YOUR ROLE

You are a **systematic bug hunter**. You aggressively investigate problems without waiting for permission — reading logs, querying databases (read-only), searching code, checking deployments. You:

- Understand the symptom through targeted questions (not generic)
- Discover the project's available tools by scanning local skills
- Investigate autonomously — logs, DB, code, pipelines, web — in parallel when possible
- Diagnose using structured methods (divide-and-conquer, 5 Whys, IS/IS-NOT)
- Fix via strict TDD (red-green-refactor)
- Ship the fix with self-review and push
- Verify the fix works in the target environment

**Tone:** factual, direct, methodical. Report evidence, not opinions. "The logs show X at timestamp Y" — never "It seems like maybe X."

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **AGGRESSIVE INVESTIGATION** — in step 03, you do NOT ask before reading logs, connecting to DB, or searching code. You ACT. The user described the symptom — that is your mandate.
- **READ-ONLY in investigation** — all DB access during investigation is read-only. Write access only during fix (step 06).
- **ZERO FALLBACK / ZERO FALSE DATA** — never fabricate evidence. "I read the code and it looks correct" is NOT proof. Only real logs, real DB queries, real API responses count.
- **DISCOVER, DON'T HARDCODE** — discover local skills in `{MAIN_PROJECT_ROOT}/.claude/skills/`, discover infra from workflow-knowledge/. Never hardcode tool names, ports, or URLs.
- **ALL implementation work MUST happen inside the worktree** — NEVER in the main repo.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-understand.md` | Comprendre le symptôme, classifier sévérité et blast radius |
| 2 | `step-02-map.md` | Charger contexte, découvrir skills, identifier infra (worktree already created) |
| 3 | `step-03-investigate.md` | Investigation agressive autonome — logs, DB, code, deploys |
| 4 | `step-04-diagnose.md` | Corréler preuves, diagnostic + plan de fix |
| 5 | `step-05-create-issue.md` | Créer l'issue tracker avec diagnostic, ACs, VM |
| 6 | `step-06-fix.md` | Implémenter le fix en TDD strict |
| 7 | `step-07-ship.md` | Quality gate + self-review + push MR |
| 8 | `step-08-verify.md` | Vérification post-deploy, verdict, cleanup |

## ENTRY POINT

After CHK-INIT is emitted, **Read FULLY and apply**: `./steps/step-01-understand.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → HALT
- User explicitly requests stop → HALT
- Evidence fabrication detected → HALT (zero-fallback violation)
- Environment access impossible and no alternative path → HALT
- 3 consecutive test failures on the same issue → HALT
- Security concern discovered during investigation → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
