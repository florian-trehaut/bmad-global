---
nextStepFile: './step-04-team-lifecycle-guide.md'
---

# Step 3: Spec Phase — Lead orchestrates inline + delegates to Phase 1 spec team (axe 1 + axe 5)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Spec Phase with SPEC_PROFILE={profile}, WORKTREE_PATH={path}, RUN_ID={run_id}, TRACE_FOLDER={folder}
```

## STEP GOAL

Run the spec phase as a hybrid : the **lead orchestrates inline** (drives the workflow + handles user-facing interactivity touchpoints — preserves TAC-6) but **delegates the heavy sub-tasks to a Phase 1 spec team of teammates** via TaskCreate (real-data investigation, external research, deep code investigation, multi-validator review). The lead never holds the raw teammate output — only synthetic summaries + trace_path. **0 usage of the Agent tool** — uniform teammate-based delegation per Anthropic Issue #32723 hub-and-spoke architecture (TAC-26a source-time grep ban + TAC-26b runtime spawning constraint).

The choice of sub-workflow depends on `SPEC_PROFILE`:
- `SPEC_PROFILE == 'full'` → invoke `bmad-create-story/workflow.md` 14-step flow with delegated sub-tasks 02e/05/06/07/12 (BAC-1 / TAC-1)
- `SPEC_PROFILE == 'quick'` → invoke `bmad-quick-spec/workflow.md` 6-step flow with delegated sub-task 02 (TAC-2)

## MANDATORY SEQUENCE

### 1. Pre-condition check (TAC-6 + TAC-26a/26b)

Verify the lead orchestrates the spec phase inline (TAC-6 preserved — lead drives the workflow + user touchpoints) and that all heavy sub-tasks are delegated to teammates via TaskCreate (TAC-26a source-time grep ban + TAC-26b runtime constraint — no the Agent tool invocation in this skill). Both conditions are simultaneously enforced :

- **Lead-side orchestration** : the lead reads each step file, drives the user-facing prompts (steps 01-04, 08-11, 13-14 for `bmad-create-story` ; steps 01, 03, 04, 05 for `bmad-quick-spec`), composes the final spec body
- **Teammate-side heavy work** : the lead emits TaskCreate for each delegable sub-task (steps 02e, 05, 06, 07, 12 for `bmad-create-story` ; step 02 for `bmad-quick-spec`)

If a future modification attempts to bypass the team and run heavy sub-tasks inline (back to the pre-impl pattern), HALT with TAC-1/TAC-2 violation. If a future modification attempts to delegate the lead-orchestration loop itself to a teammate, HALT with TAC-6 violation.

### 2. Phase 1 spec team — TeamCreate (axe 5)

```
TeamCreate(
  name = "spec-{RUN_ID}",
  teammates = [
    { role: "spec-investigator", model: default_worker_model },     # consumes real-data + code investigation tasks
    { role: "external-researcher", model: default_worker_model },   # consumes external research task (docs/RFC/best-practices)
    { role: "spec-validator-A", model: default_worker_model },      # multi-validator review pass
    { role: "spec-validator-B", model: default_worker_model },
    { role: "spec-validator-C", model: default_worker_model },
  ],
  permission_mode: inherited from lead session  # per TAC-29 / BAC-14
)
```

Total : 5 teammates ≤ `max_teammates=5` (TAC-23). Composition declared in `team-workflows/team-config.md` §spec-team. Each teammate receives the spawn prompt template from `~/.claude/skills/bmad-shared/teams/spawn-protocol.md`.

### 3. Lead executes inline workflow + delegates heavy sub-tasks

Based on `SPEC_PROFILE`:

#### Case `SPEC_PROFILE == 'full'` (bmad-create-story 14 steps)

The lead reads `~/.claude/skills/bmad-create-story/workflow.md` AND each step file. The lead executes the inline + delegated split per the matrix below :

| Step | Side | What happens |
|------|------|--------------|
| 01 — Greet + identify mode | LEAD INLINE | User confirms mode (Discovery / Enrichment) |
| 02a — Detect SPEC_MODE | LEAD INLINE | Mechanical detection |
| 02b — Choose spec mode | LEAD INLINE | User picks monolithic vs bifurcation |
| 02c — Discovery slug | LEAD INLINE | User input |
| 02d — Enrichment select | LEAD INLINE | User select existing slug |
| **02e — Load context (PRD/architecture/UX/completed stories)** | **DELEGATE** | TaskCreate(spec-investigator, fused-load-task) |
| 03 — Scope decision | LEAD INLINE | User refines scope |
| 04 — Worktree access verif | LEAD INLINE | Bash verification |
| **05 — Real-data investigation** | **DELEGATE** | TaskCreate(spec-investigator, real-data-investigation) — **fused with code investigation per Adv-4** |
| **06 — External research** | **DELEGATE** | TaskCreate(external-researcher, external-research) — parallel with 05 |
| **07 — Deep code investigation** | **DELEGATE** | Already fused into TaskCreate(spec-investigator) at step 05 to avoid race condition (Anthropic Issue #32723 "Task status can lag" — Adv-4 finding). Investigator returns 2 sub-deliverables in one phase_complete |
| 08 — Choose data model | LEAD INLINE | User decides |
| 09 — NFR / Security / Observability | LEAD INLINE | User input + audit |
| 10 — Plan compose | LEAD INLINE | Lead composes spec body |
| 11 — Self audit | LEAD INLINE | Lead self-checks |
| **12 — Multi-validator review (3 validators)** | **DELEGATE** | TaskCreate(spec-validator-A) ‖ TaskCreate(spec-validator-B) ‖ TaskCreate(spec-validator-C) — parallel ; lead aggregates findings |
| 13 — Comprehension Gate | LEAD INLINE | User confirms understanding |
| 14 — Output + cleanup | LEAD INLINE | Lead writes spec file + transitions tracker |

The lead's the Agent tool usage in step-12 (impartial scope-completeness audit) is replaced by TaskCreate to one of the spec-validators — no the Agent tool invocation remains.

#### Case `SPEC_PROFILE == 'quick'` (bmad-quick-spec 6 steps)

| Step | Side | What happens |
|------|------|--------------|
| 01 — Greet + scope | LEAD INLINE | User input |
| **02 — Codebase patterns + condensed real-data + external research** | **DELEGATE** | TaskCreate(spec-investigator, fused-task) ‖ TaskCreate(external-researcher) — parallel |
| 03 — Compose business sections | LEAD INLINE | Lead composes |
| 04 — Compose technical sections | LEAD INLINE | Lead composes |
| 05 — Self audit | LEAD INLINE | Lead self-checks |
| **06 — Validator review** | **DELEGATE** | TaskCreate(spec-validator-A) — single validator for quick profile |

### 4. TaskCreate spawn pattern (every delegated sub-task)

Each TaskCreate emitted by the lead in step 3 follows this contract :

```yaml
task_contract:
  team_name: "spec-{RUN_ID}"
  task_id: "{role}-{seq}"            # e.g. spec-investigator-1, external-researcher-1, spec-validator-A-1
  role: "{role from team-config}"

  workflow_to_invoke: "{absolute path to the sub-task's workflow.md or step file}"
                                     # e.g. ~/.claude/skills/bmad-create-story/steps/step-05-real-data-investigation.md (or whole workflow when role spans multiple steps)

  scope_type: "investigation | review | generation"
  scope_files: [{relevant files}]
  scope_domain: "{1-line description}"

  input_artifacts:
    - type: "tracker_issue"
      identifier: "{ISSUE_ID-or-slug-in-progress}"
      content: |
        {minimal context — feature description, current spec body draft if available}
    - type: "document"
      path: "{path to spec WIP if any}"
      format: "markdown"

  deliverable:
    format: "yaml_report"            # findings/summaries
    send_to: "{lead_name}"

  constraints:
    read_only: true                  # all spec-team teammates are read-only — no code mutation
    worktree_path: "{WORKTREE_PATH}" # provided per Branch D of worktree-lifecycle.md
    tracker_writes: false
    autonomy_policy: "strict"        # spec team uses strict — questions route to lead (lead has user)
    trace_path: "{TRACE_FOLDER}/{role}-{task_id}.md"
    halt_conditions:
      - "Required knowledge file missing"
      - "Scope ambiguity that cannot be resolved from contract"

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: "bmad-auto-flow"
    parent_phase: "spec"
```

**Audit log per spawn** (if `audit_log_enabled`) :

```bash
echo "{\"event\":\"auto-flow.teammate.spawned\",\"run_id\":\"${RUN_ID}\",\"teammate_role\":\"{role}\",\"task_id\":\"{task_id}\",\"trace_path\":\"{TRACE_FOLDER}/{role}-{task_id}.md\",\"autonomy_policy\":\"strict\"}" >> "${LOG_FILE}"
```

### 5. Lead awaits + integrates

For each TaskCreate emitted, the lead awaits the corresponding `phase_complete` SendMessage. The phase_complete payload contains :
- `summary:` (2-5 lines synthetic) — the lead reads and integrates into the spec body
- `findings:` (when verdict=FINDINGS) — the lead aggregates across validators (multi-validator review pattern)
- `trace_files: [path]` — the lead appends to `TRACE_FILES` for step-09 final report ; reads the trace file ONLY if drill-down needed beyond summary (TAC-17)
- `autonomy_decisions:` (rare for strict policy ; possible if lead asks teammate a clarifying question and teammate auto-resolves on a verbatim spec match)

**Audit log per phase_complete** (if `audit_log_enabled`) :

```bash
echo "{\"event\":\"auto-flow.teammate.phase_complete\",\"run_id\":\"${RUN_ID}\",\"task_id\":\"{task_id}\",\"verdict\":\"{verdict}\",\"findings_count\":{N},\"trace_files\":{trace_files_array},\"autonomy_decisions_count\":{N}}" >> "${LOG_FILE}"
```

### 6. TeamDelete on phase exit

After the spec workflow's last lead-inline step completes (step 14 for full, step 06 for quick) :

```
TeamDelete(name = "spec-{RUN_ID}")
```

This is mandatory before transitioning to step-04 — the next phase team will be `review-{RUN_ID}` (different team scope per axe 5).

### 7. Capture outputs

After the spec workflow exits, capture:
- `ISSUE_ID` (from the tracker entry created by the spec workflow — file-based: the slug; tracker-API: the returned ID)
- `SPEC_PATH` (path to the spec file)
- `ISSUE_TITLE` (from the spec frontmatter)
- `TRACE_FILES` extended with paths from all 5 (or 1 for quick) spec teammates

### 8. Verify pre-spawn requirement (TAC-28 enforcement)

Per TAC-28: "If task_contract.input_artifacts.tracker_issue.identifier is null/missing/malformed when spawning a teammate, then the orchestrator shall HALT before spawning."

```
Assert ISSUE_ID is non-null and well-formed (matches expected pattern: <issue_prefix>-<number> for tracker APIs, or <kebab-slug> for file-based).
On failure → HALT before proceeding to step-04.
```

This check is the operational form of TAC-28 — every TaskCreate downstream depends on a valid ISSUE_ID.

### 9. Audit log (final entry for this step)

If audit_log_enabled:

```bash
echo "{\"event\":\"auto-flow.spec_phase.complete\",\"run_id\":\"${RUN_ID}\",\"spec_workflow\":\"{profile}\",\"issue_id\":\"{id}\",\"spec_path\":\"{path}\",\"trace_files_count\":{N}}" >> "${LOG_FILE}"
```

### 10. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: lead orchestrated inline ; heavy sub-tasks delegated to spec team via TaskCreate ; spec team teammates each emitted phase_complete with trace_files ; TeamDelete invoked ; CHK-WORKFLOW-COMPLETE emitted by the sub-workflow ; ISSUE_ID + SPEC_PATH + TRACE_FILES captured ; TAC-28 pre-condition validated ; **0 the Agent tool invocations in this step (TAC-26a / TAC-26b)**
- **FAILURE**: running heavy sub-tasks inline (TAC-1/TAC-2 violation), invoking the Agent tool literal (TAC-26a / TAC-26b violation), delegating the lead-orchestration loop itself (TAC-6 violation), proceeding with null ISSUE_ID (TAC-28 violation), forgetting TeamDelete before step-04 (axe 5 lifecycle violation)

---

## STEP EXIT (CHK-STEP-03-EXIT)

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Spec Phase
  actions_executed: TeamCreate(spec-{RUN_ID}, 5 teammates) ; lead drove {bmad-quick-spec | bmad-create-story} inline ; delegated heavy sub-tasks ({list of TaskCreate emitted}) ; awaited {N} phase_complete ; TeamDelete(spec-{RUN_ID}) ; captured ISSUE_ID={id}, SPEC_PATH={path}, TRACE_FILES={N entries}
  artifacts_produced: ISSUE_ID, SPEC_PATH, ISSUE_TITLE, TRACE_FILES (extended)
  next_step: ./steps/step-04-team-lifecycle-guide.md
```

**Next:** Read FULLY and apply: `./steps/step-04-team-lifecycle-guide.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
