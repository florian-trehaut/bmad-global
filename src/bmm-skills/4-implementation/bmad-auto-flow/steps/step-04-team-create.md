---
nextStepFile: './step-05-review-phase.md'
---

# Step 4: Team Lifecycle Guide — Generic per-phase TeamCreate / TeamDelete (axe 5)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-03-EXIT emis (ISSUE_ID and SPEC_PATH set)
- [ ] Variables en scope: TEAM_MODE, ISSUE_ID, SPEC_PATH, WORKTREE_PATH, RUN_ID, PROJECT_SLUG, TRACE_FOLDER, dev_team_size, code_review_team_size

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Team Lifecycle Guide with TEAM_MODE={value}, ISSUE_ID={id}, RUN_ID={run_id}
```

## STEP GOAL

Establish the **team-per-phase lifecycle** convention used by every downstream phase (steps 05/06/07/08) per axe 5 of the spec. Each phase instantiates its own phase-scoped team via `TeamCreate(name="{phase}-{RUN_ID}")` at phase start, runs `TaskCreate(s)` per its `team-config.md` composition, awaits `phase_complete` from each teammate, then `TeamDelete(name="{phase}-{RUN_ID}")` before transitioning. This step does NOT call TeamCreate itself — it is the GUIDE that subsequent steps reference.

If TEAM_MODE=false: each phase's logic falls back to inline execution in the orchestrator's own context (BAC-9 / TAC-12 fallback).

The phase 1 spec team is the EXCEPTION to "this step does not TeamCreate" : step-03 already created `spec-{RUN_ID}` via TeamCreate and TeamDeleted it before transitioning to this step. Steps 05-08 each create their own team per the table below.

## MANDATORY SEQUENCE

### 1. Document the per-phase team lifecycle convention

Each phase from step-05 onwards creates and tears down its own team. Authoritative composition is declared in `team-workflows/team-config.md`. Reference table :

| Phase step | TeamCreate name | Composition (from team-config.md) | Workflow_to_invoke per role |
|------------|-----------------|-----------------------------------|------------------------------|
| step-05-review-phase | `review-{RUN_ID}` | 1 spec-reviewer | `~/.claude/skills/bmad-review-story/workflow.md` |
| step-06-dev-phase | `dev-{RUN_ID}` | N=`dev_team_size` dev (default 1) | `~/.claude/skills/{bmad-dev-story or bmad-quick-dev}/workflow.md` (per SPEC_PROFILE) |
| step-07-code-review-phase | `codereview-{RUN_ID}` | 3 always (specs/correctness/security) + 2 reserve (operations/user-facing) | `~/.claude/skills/bmad-code-review-perspective-{role}/workflow.md` |
| step-08-validation-phase | `validation-{RUN_ID}` | 1 validator (type detected per app_type) | `~/.claude/skills/bmad-validation-{type}/workflow.md` |

Each TeamCreate respects `max_teammates ≤ 5` (TAC-23). Phase 7 reserve teammates are spawned as part of TeamCreate but receive a TaskCreate ONLY if step-07's diff scope detection triggers their perspective ; otherwise idle until TeamDelete (TAC-23).

### 2. Branch on TEAM_MODE

#### TEAM_MODE=false (BAC-9 / TAC-12 fallback)

```
Skip the per-phase TeamCreate/TeamDelete entirely.
Set TEAM_NAME = null (legacy variable, retained for backward-compat in some downstream messages).
Set LEAD_NAME = "lead" (placeholder — not used in fallback mode since SendMessage is replaced by inline calls).
Each subsequent step (05/06/07/08) runs its phase logic inline in the orchestrator's context (no TaskCreate, no Agent Teams calls).
```

#### TEAM_MODE=true (normal path)

Each subsequent step creates its own phase team. This step prepares the global state used by all of them ; it does not itself call TeamCreate.

### 3. Pre-spawn validation gate (TAC-28 — applies to ALL subsequent TaskCreate calls)

Establish the validation gate that step-05 / 06 / 07 / 08 will use before each TaskCreate:

```
Pre-spawn assertion (run before EVERY TaskCreate downstream):

assert ISSUE_ID is not None
assert ISSUE_ID matches the tracker pattern (issue_prefix + '-' + N for trackers; kebab-slug for file-based)
assert WORKTREE_PATH is set (either to a real worktree or to MAIN_PROJECT_ROOT identity)
assert RUN_ID is set (from step-01) — needed for trace_path and team naming
assert TRACE_FOLDER exists and is writable

On failure → HALT with TAC-28 message:
"task_contract.input_artifacts.tracker_issue.identifier is null/missing/malformed when spawning the {role} teammate. Orchestrator HALT before spawning."
```

Document this gate as a reusable assertion. Each subsequent step file references TAC-28 and applies the gate.

### 4. Initialize message queue + global state

Per `data/question-routing.md`:

```
QUESTION_BUFFER = []
BUFFER_FIRST_TIMESTAMP = null
MESSAGE_QUEUE = []
PENDING_QUESTION_REPLIES = {}
PHASE_RESULTS = {}
TRACE_FILES initialized in workflow.md INIT — extended by each phase step
```

### 5. Audit log

If audit_log_enabled:

```bash
echo "{\"event\":\"auto-flow.team_lifecycle.guide\",\"run_id\":\"${RUN_ID}\",\"team_mode\":${TEAM_MODE},\"phases\":[\"spec\",\"review\",\"dev\",\"codereview\",\"validation\"]}" >> "${LOG_FILE}"
```

### 6. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: per-phase TeamCreate/TeamDelete convention documented, pre-spawn validation gate established, message queue initialized, downstream steps know to call TeamCreate(`{phase}-{RUN_ID}`) at phase start
- **FAILURE**: invoking TeamCreate here for a global team (legacy pattern — replaced by per-phase teams in axe 5), skipping pre-spawn validation, proceeding without LEAD_NAME

---

## STEP EXIT (CHK-STEP-04-EXIT)

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Team Lifecycle Guide
  actions_executed: documented per-phase TeamCreate/TeamDelete convention; pre-spawn validation gate established (TAC-28); message queue initialized
  artifacts_produced: LEAD_NAME, MESSAGE_QUEUE=[], PENDING_QUESTION_REPLIES={}, PHASE_RESULTS={} (TEAM_NAME=null at this point — set per-phase by 05-08)
  next_step: ./steps/step-05-review-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-05-review-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
