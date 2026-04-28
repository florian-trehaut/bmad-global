---
nextStepFile: './step-02-review.md'
classificationRules: '../data/review-classification.md'
regressionRiskSkill: '~/.claude/skills/bmad-review-regression-risk/workflow.md'
---

# Step 1: Gather Context


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Gather Context with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Collect everything the review needs in one pass: discover + classify the MR, set up the review worktree, load project context and standards, compute the diff, invoke regression-risk detection, and compute the trigger routing (which meta-perspectives will activate).

Absorbs v1 step-01 (discover), step-02 (setup-worktree), step-03 (load-context), step-04 (discover-changes), step-05 (regression-risk invocation).

## MANDATORY EXECUTION RULES

- Execute ALL sections in exact order — NO skipping
- Communicate in {COMMUNICATION_LANGUAGE} with {USER_NAME}
- **Worktree invariant:** every subsequent step requires `REVIEW_WORKTREE_PATH` set and a valid directory

---

## 1. Discover & Classify the MR

### 1.1 Pre-selected MR

<check if="mr_iid is provided and not empty">
  Use provided MR IID — skip discovery. Store `MR_IID` and proceed to §1.3 (Classify) after fetching MR metadata.
</check>

### 1.2 List Open MRs

```bash
CURRENT_USER=$({FORGE_API_BASE} user | jq -r '.username')
{FORGE_MR_LIST}
```

For each MR, fetch detailed status (title, author, branches, draft, conflicts, approvals, threads):

```bash
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{mr_iid}" \
  | jq '{iid,title,author:.author.username,source_branch,target_branch,draft,has_conflicts}'

# Approvals: team policy requires ≥1 EXPLICIT approval (approved_by non-empty)
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{mr_iid}/approvals" \
  | jq '{approved_by:[(.approved_by // [])[]|.user.username], has_explicit_approval:(([(.approved_by // [])[]|.user.username]|length)>0)}'

# Threads: use /notes (not /discussions) to catch standalone resolvable notes
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{mr_iid}/notes?per_page=100" \
  | tr -d '\000-\011\013-\037' \
  | jq '{threads_total:[.[]|select(.resolvable==true and .system==false)]|length, threads_resolved:[.[]|select(.resolvable==true and .resolved==true and .system==false)]|length, threads_unresolved:[.[]|select(.resolvable==true and .resolved==false and .system==false)]|length}'
```

Collect tracker issues in review state (CRUD patterns from `workflow-knowledge/project.md`): team = `{TRACKER_TEAM}`, status = `{TRACKER_STATES.in_review}`, limit 10.

### 1.3 Classify

Load classification rules from `{classificationRules}`. Categories:

- **Colleague review:** `author != CURRENT_USER` AND NOT draft AND no explicit approval from CURRENT_USER
- **Self-review:** `author == CURRENT_USER` AND NOT draft
- **Already reviewed:** has explicit approval from CURRENT_USER (regardless of author)
- **Draft / Non-reviewable:** `draft == true` OR `has_conflicts == true`

### 1.4 Present & Select

Cross-reference each MR with tracker issues (match by branch name `feat/{num}-*` or MR description mentioning `{ISSUE_PREFIX}-XXX`). Present the unified menu (colleague / self / already-reviewed / draft) and WAIT for the user choice.

Store: `MR_IID`, `MR_URL`, `MR_AUTHOR`, `MR_SOURCE_BRANCH`, `MR_TARGET_BRANCH`, `LINKED_TRACKER_ISSUE` (if any), `ISSUE_IDENTIFIER`, `REVIEW_MODE` (`colleague` or `self`).

---

## 2. Setup Review Worktree

Derive `REVIEW_WORKTREE_PATH_EXPECTED` from `{WORKTREE_TEMPLATE_REVIEW}` with `{MR_IID}` substituted.

**Apply the full protocol from `bmad-shared/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `review` |
| `worktree_path_expected` | `{REVIEW_WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/{MR_SOURCE_BRANCH}` |
| `worktree_branch_name` | `review-{MR_IID}` |
| `worktree_branch_strategy` | `match-remote` |
| `worktree_alignment_check` | `CURRENT_BRANCH == {MR_SOURCE_BRANCH}` OR `CURRENT_BRANCH == review-{MR_IID}` |

After the protocol completes, set `REVIEW_WORKTREE_PATH = WORKTREE_PATH` (the protocol sets `WORKTREE_PATH`; the rest of this workflow uses `REVIEW_WORKTREE_PATH` by convention).

**From this point on, ALL analysis AND fixes run inside `{REVIEW_WORKTREE_PATH}`.** The worktree IS the MR branch — commits made here push directly to the MR branch. HALT if `REVIEW_WORKTREE_PATH` is unset or invalid at any subsequent step.

---

## 3. Load Project Context

### 3.1 Shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. Load `bmad-shared/no-fallback-no-false-data.md` first (applied throughout the review).

### 3.2 Project knowledge (optional)

Read if present, otherwise skip:

- `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — project-specific checklists overriding defaults
- `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — reference code dirs, legacy dirs, forbidden patterns, test conventions, `ui` / `i18n` fields used by trigger routing (§5)

### 3.3 Contribution conventions

```bash
cd {REVIEW_WORKTREE_PATH}
ls CONTRIBUTING.md .github/CONTRIBUTING.md .github/pull_request_template.md dangerfile.js dangerfile.ts 2>/dev/null
```

Store as `CONTRIBUTION_CONVENTIONS` — PR format, CI linter rules, CLA requirements.

### 3.4 ADRs (optional)

Check `adr_location` in `workflow-context.md`. If set, load ADRs from the configured location. Most recent ADR wins on topic conflict. Store as `PROJECT_ADRS`.

### 3.5 Prior closed MRs on same issue

<check if="LINKED_TRACKER_ISSUE exists">
  `{FORGE_CLI} mr list --state closed --search "{ISSUE_IDENTIFIER}"` → extract rejection reasons and prior approaches. Store as `PRIOR_MRS` — if current MR repeats a rejected approach, flag it.
</check>

### 3.6 Tracker issue (story-spec v2)

<check if="LINKED_TRACKER_ISSUE exists">
  Load full issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`, include relations). The issue description IS the specs compliance reference, structured per the **story-spec v2 schema** (`~/.claude/skills/bmad-shared/spec-completeness-rule.md`).

  Extract these sections (tolerant — missing optional sections noted but do NOT halt; missing mandatory sections produce a meta-1 finding):

  - **BACs** (Given/When/Then) — used by Meta-1 sub-axis 1a (Specs Compliance), parsed as `bacs[]`
  - **TACs** (EARS notation: Ubiquitous / Event-driven / State-driven / Optional / Unwanted) — used by Meta-1 sub-axis 1a, parsed as `tacs[]` with `pattern` + `refs_bacs`
  - **Validation Metier (VM-N)** — used by Meta-1 sub-axis 1a (production verification reference)
  - **Definition of Done** — used by Meta-1
  - **Out-of-Scope register (OOS-N)** — used by Meta-1 sub-axis 1a for scope-creep detection. ANY change in the diff that delivers an OOS-N item → BLOCKER.
  - **Boundaries Triple** — used by Meta-1 + Meta-3 to detect violations (especially Never-Do items: committed secrets, modified migrations already run, removed failing tests, `--no-verify`)
  - **Risks register** — used by Meta-1 sub-axis 1c (Decision Documentation) — verify HIGH-impact risks have mitigation in the diff
  - **NFR Registry** — informs Meta-1 (target verification) and Meta-2 (perf/scalability/availability checks)
  - **Security Gate** — feeds Meta-3 (Security & Privacy) directly. FAIL items in spec → Meta-3 verifies remediation in diff
  - **Observability Requirements** — feeds Meta-2 (Correctness & Reliability) — verify mandatory log events / metrics / alerts implemented
  - **Real-Data Findings + External Research** — informational context for all metas (do not re-investigate; flag if absent or shallow on stories that warrant them)

  Store as `LINKED_TRACKER_ISSUE.spec_v2` for downstream metas.
</check>

<check if="no LINKED_TRACKER_ISSUE">
  Log: "No tracker issue linked — Specs Compliance perspective limited to MR description." Parse MR description for ACs.
  Note: without a v2 spec, Out-of-Scope detection is best-effort (parse MR description for "out of scope" / "non-goals" sections).
</check>

---

## 4. Discover Actual Changes

### 4.1 Git diff

```bash
cd {REVIEW_WORKTREE_PATH}
git diff --name-only origin/{MR_TARGET_BRANCH}...HEAD
git diff --stat origin/{MR_TARGET_BRANCH}...HEAD
```

### 4.2 Forge API diff (for DiffNote line numbers)

```bash
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}/changes" \
  | jq -r '.changes[] | "\n=== \(.new_path) ===\n\(.diff)"'
```

### 4.3 Summarise

Total files changed, lines added/removed, impacted services (paths matching `apps/*/`, `packages/*/`, `libs/*/`), types of change (domain, API, infra, tests, config, migrations).

### 4.4 Attack plan

<check if="LINKED_TRACKER_ISSUE exists">
  Cross-reference AC list vs code changes: which ACs have visible implementation, which don't, which changes have no AC.
</check>

Store: `CHANGED_FILES`, `DIFF_STATS`, `IMPACTED_SERVICES`, `ATTACK_PLAN`.

---

## 5. Compute Trigger Routing (Active Metas)

Based on `CHANGED_FILES` and the tech-stack-lookup protocol (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`) — which meta-perspectives will the orchestrator dispatch in step-02?

**Always-on:** M1 (Contract & Spec), M2 (Correctness & Reliability), M3 (Security & Privacy — at least 3a; 2 parallel reviewers S1/S2), M4 (Engineering Quality).

**Conditional activations — scan `CHANGED_FILES`:**

| Signal in diff | Activates |
|---|---|
| Dockerfile, `*.tf`, `k8s/**`, `.github/workflows/**`, new endpoints / jobs / alerts | **M5** |
| UI globs (`*.tsx`, `*.vue`, `*.svelte`, `*.html`, `*.astro`, `src/components/**`) AND the tech-stack-lookup protocol with field `ui=web` | **M6** |
| Imports from `@anthropic-ai/sdk`, `openai`, `langchain`, `llamaindex`, `ai`, `@modelcontextprotocol/sdk` | **M3.3b** (AI safety sub-axis) |
| Manifest / lockfile diffs (`package*.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle*`) | **M3.3d** + **M5.5a** |
| Entity / schema / migration diffs OR logging statement diffs | **M3.3c** + **M5.5b** |
| Perf-sensitive paths (async code, DB query layer, rendering, cache, routes) | **M4.4e** |
| Public API surface changes (`index.ts` exports, OpenAPI, `*.proto`, `*.graphql`, CLI argv, migrations) | already covered by always-on 1b |

Store `ACTIVE_METAS` = list of `{meta_number, active_sub_axes}` entries. Used in step-02 to shape the parallel `Agent()` dispatch.

---

## 6. Invoke Regression-Risk Detection (persona-skill)

Invoke the regression-risk persona-skill via `Agent()`:

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Regression risk detection (Phase 1 + Phase 2)',
  prompt: |
    Read and apply: {regressionRiskSkill}

    inputs:
      REVIEW_WORKTREE_PATH: '{REVIEW_WORKTREE_PATH}'
      MR_TARGET_BRANCH: '{MR_TARGET_BRANCH}'
      LINKED_TRACKER_ISSUE: {LINKED_TRACKER_ISSUE or null}
      ISSUE_IDENTIFIER: '{ISSUE_IDENTIFIER or null}'

    Return the YAML `regression_risk_report` as defined in the persona-skill contract.
    CRITICAL: You are READ-ONLY.
)
```

Parse the returned `regression_risk_report`. Store:

- `REGRESSION_RISK_LEVEL` (HIGH / MEDIUM / LOW / NONE)
- `OVERLAPPING_FILES`
- `PHASE2_SUSPICIOUS_REMOVALS`
- `REGRESSION_FINDINGS` — propagated to Meta-1 (Specs Compliance) in step-02 and surfaced in the final report

If the persona-skill returns a parse error or HALTs → propagate the HALT to the orchestrator (no fallback).

---

## 7. Proceed

All context collected. Invoke `{nextStepFile}` with:

`REVIEW_WORKTREE_PATH`, `MR_IID`, `MR_SOURCE_BRANCH`, `MR_TARGET_BRANCH`, `LINKED_TRACKER_ISSUE`, `ISSUE_IDENTIFIER`, `REVIEW_MODE`, `CHANGED_FILES`, `DIFF_STATS`, `IMPACTED_SERVICES`, `ATTACK_PLAN`, `ACTIVE_METAS`, `REGRESSION_RISK_LEVEL`, `PHASE2_SUSPICIOUS_REMOVALS`, `REGRESSION_FINDINGS`, `PRIOR_MRS`, `PROJECT_ADRS`, `CONTRIBUTION_CONVENTIONS`.

## SUCCESS/FAILURE:

### SUCCESS: MR classified, worktree set up (not detached), context loaded, diff analysed, trigger routing computed, regression-risk report received
### FAILURE: Skipping classification, detached worktree, missing tracker issue load, skipping regression-risk, proceeding without ACTIVE_METAS

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Gather Context
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
