---
nextStepFile: null
---

# Step 9: Finalize — Trace aggregation + User Report (axe 4 + Guardrail 9 cleanup safety net)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: Finalize with TEAM_NAME={name}, exit_path={success|halt|abandon}
```

## STEP GOAL

Always called as the final step regardless of how the workflow ended (success, HALT, abandon). Per axe 5, each phase manages its own TeamCreate/TeamDelete lifecycle (steps 03/05/06/07/08) — this step is NOT responsible for a global TeamDelete (legacy Guardrail 9 pre-axe-5). It IS responsible for :

- Aggregating all `TRACE_FILES` paths collected from `phase_complete` payloads of all 5 delegated phases (axe 4 / BAC-5 / TAC-17)
- Cleanup safety net : if any phase team was not properly TeamDeleted (e.g. due to a HALT before its step's TeamDelete invocation), invoke `TeamDelete` for any residual team
- Display a final report to the user summarizing what was accomplished, the final tracker state, AND every trace_path the user can drill down into for audit
- If audit_log_enabled, close the audit log file
- Emit CHK-WORKFLOW-COMPLETE per `workflow-adherence.md` Rule 7

## MANDATORY SEQUENCE

### 1. Determine exit_path

```
exit_path = 'success' if PHASE_RESULTS contains all 5 phases with positive verdicts
          | 'halt' if HALT happened mid-flow
          | 'abandon' if user chose [A]bandon at any phase
```

### 2. TeamDelete fallback cleanup (axe 5)

**Each phase owns its TeamDelete** (steps 03/05/06/07/08 invoke their own `TeamDelete({phase}-{RUN_ID})` before transitioning). This section is a **fallback cleanup ONLY for HALT-paths that aborted before the phase's TeamDelete fired** — never the canonical cleanup. (Wording clarification per Phase 7 specs MINOR finding.)

```
if RUN_ID is not None:                # F-correctness-6 mitigation : guard against unset RUN_ID (e.g. HALT in step-01 before RUN_ID derivation)
  for phase in ['spec', 'review', 'dev', 'codereview', 'validation']:
    team_name = "{phase}-{RUN_ID}"
    if team is still active (TeamList check):
      Invoke TeamDelete with team_name=team_name (fallback cleanup only)
      Log: "TeamDelete fallback: {team_name} was residual ; cleaned up (HALT-path recovery)"
else:
  Log: "TeamDelete fallback skipped: RUN_ID not set (HALT in step-01 before derivation)"
```

If TeamDelete fails for a residual team:
- Log the failure (do not HALT — we are in cleanup)
- Suggest manual cleanup: `rm -rf ~/.claude/teams/{team_name}/`

If TEAM_MODE=false: skip TeamDelete (no teams were ever created).

### 2b. Retroactive completion gate verification (M25 / TAC-19 / VM-10)

Before composing the final report, iterate over ALL teammates spawned during the run and verify each `TaskUpdate(completed)` had a matching `SendMessage(phase_complete)`. This is a final cross-phase audit that catches any teammate that slipped through a per-phase gate due to a HALT path or race condition.

**Apply** `~/.claude/skills/bmad-auto-flow/data/teammate-completion-gate.md` §Verification Algorithm — but in retroactive aggregation mode :

```
GATE_VIOLATIONS = []
for phase in ['spec', 'review', 'dev', 'codereview', 'validation']:
  for task_id in TASK_IDS_SPAWNED_IN(phase):
    if was_signaled_completed(task_id) AND NOT received_phase_complete(task_id):
      GATE_VIOLATIONS.append({
        phase: phase,
        task_id: task_id,
        evidence: "TaskUpdate(completed) received but no SendMessage(phase_complete) in inbox"
      })

if GATE_VIOLATIONS is not empty:
  HALT with TAC-19 violation message:
    "Retroactive completion gate detected {N} mismatched task(s) — {GATE_VIOLATIONS}.
     Per teammate-completion-gate.md, the run cannot finalize cleanly.
     Surface in the final report as 'GATE FAILURE' phase verdict and present per-task remediation menu."
```

If `GATE_VIOLATIONS` is empty → proceed with normal final report.

If `GATE_VIOLATIONS` is non-empty → set `RETROACTIVE_GATE_FAILED = true` and surface each violation in the per-phase block (§3) below as a `GATE FAILURE` row.

### 3. Build user report (axe 4 — trace_files aggregated for drill-down + per-phase block per TAC-17)

Compose the final report (in `COMMUNICATION_LANGUAGE`). Per **TAC-17** (M6 of `standalone-auto-flow-unification.md`), each phase block MUST contain : phase name, verdict, findings count by severity (BLOCKER/MAJOR/MINOR/INFO), decisions count by classification (acknowledge/tactical), artefacts list (with absolute paths), and trace_file path.

```
# Auto-Flow Terminé — {ISSUE_ID}

**Status final tracker** : {PHASE_RESULTS aggregated to final tracker state}
**MR** : {MR_URL or "n/a"}
**Worktree** : {WORKTREE_PATH or "n/a (worktree_enabled=false)"}
**RUN_ID** : {RUN_ID}
{If RETROACTIVE_GATE_FAILED:}
**⚠️ Retroactive gate** : {N} task(s) signaled completed without a valid phase_complete — see GATE FAILURE rows below.
{End if}

## Phases (per-phase block per TAC-17)

| Phase | Verdict | Findings (B/M/m/I) | Decisions (ack/tactical) | Artefacts (absolute paths) | Trace file |
|-------|---------|--------------------|--------------------------|----------------------------|------------|
| 1. Spec ({SPEC_PROFILE}) | APPROVED-INLINE | n/a (spec phase) | n/a | {SPEC_PATH absolute} | {spec-investigator + validators trace files} |
| 2. Review | {PHASE_RESULTS['review'].verdict} | {b}/{m}/{mi}/{i} | {ack}/{tactical} | {review report path} | {PHASE_RESULTS['review'].trace_files absolute} |
| 3. Dev | {PHASE_RESULTS['dev'].verdict} | {b}/{m}/{mi}/{i} | {ack}/{tactical} | MR: {MR_URL} ; commits: {commits} | {PHASE_RESULTS['dev'].trace_files absolute} |
| 4. Code Review | {PHASE_RESULTS['code-review'].verdict} | {b}/{m}/{mi}/{i} | {ack}/{tactical} | {N triggered} perspectives ; aggregated report | {PHASE_RESULTS['code-review'].trace_files absolute} |
| 5. Validation | {PHASE_RESULTS['validation'].verdict} | {b}/{m}/{mi}/{i} | {ack}/{tactical} | {per_vm_results summary} | {PHASE_RESULTS['validation'].trace_files absolute} |

## Trace files for audit / drill-down

All teammate trace files are at `/tmp/bmad-{PROJECT_SLUG}-auto-flow/{RUN_ID}/` :

{enumerate every entry of TRACE_FILES with file:absolute-path}

**Disclaimer (per F-M3-S1-005)** : `autonomy_decisions[]` rationale fields are teammate self-report and unverified. For high-stakes audit, Read the trace files for evidence triangulation rather than relying on the rationale field alone.

**Retention decision (per F-M3-S1-007)** : the trace files contain detailed reasoning + findings (potentially with sensitive context citations). Default behavior : kept under /tmp (cleaned up by system tmpwatch — macOS ~3 days, Linux varies). Ask the user :

```
Trace files at /tmp/bmad-{PROJECT_SLUG}-auto-flow/{RUN_ID}/ :
  [K] Keep — let system tmpwatch reclaim eventually (default if non-interactive)
  [D] Delete now — `rm -rf /tmp/bmad-{PROJECT_SLUG}-auto-flow/{RUN_ID}/` immediately
  [M] Move to {WORKTREE_PATH}/.bmad-traces/{RUN_ID}/ — preserve under repo (gitignored)
```

In CI / non-interactive contexts, default to **[D]** to minimize multi-user /tmp exposure. In dev contexts, default to **[M]** (Move to repo-local `.bmad-traces/`) per RevSec-3 fix — repo-local retention is bounded by the user's filesystem permissions ($HOME mode 0700 typically) and the repo's own lifecycle. The `[K]` option remains available for explicit user override but is no longer the dev-context default.

## Autonomy decisions captured (axe 2 + M6 / TAC-9)

Per **M6 / TAC-9** of `standalone-auto-flow-unification.md`, aggregate `phase_complete.autonomy_decisions[]` from ALL teammates across ALL phases (not just dev) and display per-teammate counts. This is the explicit audit summary required for spec-driven autonomy traceability.

```
// Source from phase_complete inbox (preserves per-teammate identity).
// Per-phase PHASE_RESULTS aggregate autonomy_decisions across N teammates as a flat list
// losing per-teammate granularity ; the phase_complete inbox preserves it (RevCorr-1 fix).
PER_TEAMMATE_DECISIONS = {}
for msg in inbox.filter(type='phase_complete'):
  PER_TEAMMATE_DECISIONS[msg.task_id] = {
    phase: msg.parent_phase,
    acknowledge_count: count(d.classification == 'acknowledge' for d in (msg.autonomy_decisions or [])),
    tactical_count: count(d.classification == 'tactical' for d in (msg.autonomy_decisions or [])),
    decisions: msg.autonomy_decisions or [],
    trace_path: (msg.trace_files[0] if msg.trace_files else None)
  }
```

Display table :

```
| Teammate (task_id) | Phase | Acknowledge | Tactical | Total | Trace file (drill-down) |
|--------------------|-------|-------------|----------|-------|-------------------------|
{for each task_id, entry in PER_TEAMMATE_DECISIONS:}
| {task_id} | {entry.phase} | {entry.acknowledge_count} | {entry.tactical_count} | {entry.acknowledge_count + entry.tactical_count} | {entry.trace_path or 'n/a'} |
{end for}
```

Followed by full enumeration (collapsible / verbatim per-decision detail) :

```
{for each task_id, decisions_list in PER_TEAMMATE_DECISIONS:}
Decisions — {task_id} :
{for each d in decisions_list:}
- [{d.classification}] {d.decision} → applied default: `{d.default_applied}` (rationale: {d.rationale})
{end for}
{end for}
```

**Important** : per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §"Limitations note"` (F-M3-S1-005), `autonomy_decisions[].rationale` is teammate self-report and unverified. Lead should treat the rationale as evidence-of-intent, not proof-of-correctness. For high-stakes audit, Read the trace file for evidence triangulation.

{If exit_path == 'abandon' or 'halt':}
Reason: {explanation of why exited early}
Pickup point: {what state the story was left in, how to resume manually}
{End if}
```

Display to user via assistant text output (not AskUserQuestion — this is the workflow's final speech, not a question).

### 4. Close audit log

If audit_log_enabled — extend the existing `auto-flow.run.finalized` event (additive payload field, NOT a new event — preserves event count = 6 per M6 / DesB-3 clarification of `standalone-auto-flow-unification.md`) :

```bash
# Aggregate autonomy_decisions counts across all teammates (M6 — additive payload field)
# Build a JSON object summarizing per-teammate decision counts for the run
AUTONOMY_DECISIONS_JSON=$(jq -nc \
  --argjson per_teammate "${PER_TEAMMATE_DECISIONS_JSON}" \
  --arg total_acknowledge "${TOTAL_ACKNOWLEDGE_COUNT}" \
  --arg total_tactical "${TOTAL_TACTICAL_COUNT}" \
  '{per_teammate:$per_teammate, totals:{acknowledge:($total_acknowledge|tonumber), tactical:($total_tactical|tonumber)}}')

# Emit the existing event with the new additive field
jq -nc \
  --arg run_id "${RUN_ID}" \
  --arg exit_path "{path}" \
  --argjson trace_files_count "{N}" \
  --arg team_safety_net "{ok|residual_cleaned|failed}" \
  --argjson retroactive_gate_failures "${#GATE_VIOLATIONS[@]}" \
  --argjson autonomy_decisions "${AUTONOMY_DECISIONS_JSON}" \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{event:"auto-flow.run.finalized", run_id:$run_id, exit_path:$exit_path, trace_files_count:$trace_files_count, team_safety_net:$team_safety_net, retroactive_gate_failures:$retroactive_gate_failures, autonomy_decisions:$autonomy_decisions, timestamp:$timestamp}' \
  >> "${LOG_FILE}"
```

### 5. Worktree cleanup decision

Per `worktree-lifecycle.md` §3:

- If `worktree_enabled=false`: no worktree to clean (Branch A was taken in step-02).
- If `worktree_enabled=true` and `exit_path == 'success'`: leave the worktree in place for the user to push / merge / inspect. Do NOT auto-remove.
- If `exit_path == 'abandon'` or `halt`: ASK user whether to keep or remove the worktree (it may contain WIP).

### 6. Emit CHK-WORKFLOW-COMPLETE (workflow-adherence Rule 7)

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-auto-flow executed end-to-end:
  steps_executed: [01, 02, 03, 04, 05, 06, 07, 08, 09]    ← OR partial list if halt happened earlier
  steps_skipped: []                                        ← OR list with verbatim user citation if applicable
  final_artifacts:
    - issue: {ISSUE_ID}
    - spec_path: {SPEC_PATH}
    - mr_url: {MR_URL or "n/a"}
    - tracker_status: {final_status}
    - team: {TEAM_NAME or "n/a"} ({deleted | failed | skipped})
    - phase_results:
        review: {verdict}
        dev: {verdict}
        code-review: {verdict}
        validation: {verdict}
```

If `steps_executed != [01..09]` sequential AND `steps_skipped` non-empty without verbatim user citation → HALT (the workflow is reporting an inconsistent state).

## SUCCESS / FAILURE

- **SUCCESS**: residual TeamDelete safety net invoked (each phase already TeamDeleted in 03/05/06/07/08 per axe 5); TRACE_FILES aggregated and rendered in final report; final report displayed; audit log closed; CHK-WORKFLOW-COMPLETE emitted; worktree decision documented
- **FAILURE**: skipping residual cleanup safety net (would leak teams on HALT path), missing CHK-WORKFLOW-COMPLETE (Rule 7 violation), removing worktree without asking on abandon path, omitting trace_files from final report (axe 4 violation), invoking TeamDelete for ALL phases even when each phase already deleted its own (would error — this step is safety net only, not duplicate delete)

---

## STEP EXIT (CHK-STEP-09-EXIT)

```
CHK-STEP-09-EXIT PASSED — completed Step 9: Finalize
  actions_executed: residual TeamDelete safety net {invoked for {N} residual teams | no residuals — all phases self-cleaned (axe 5)}; trace files aggregated ({N} entries from PHASE_RESULTS); final user report displayed with trace_paths and autonomy_decisions; audit log {closed | not enabled}; worktree decision: {kept | removed | asked user}
  artifacts_produced: final user-facing report including TRACE_FILES list; CHK-WORKFLOW-COMPLETE emitted
  next_step: WORKFLOW-COMPLETE
```

This is the LAST step of `bmad-auto-flow`. After CHK-STEP-09-EXIT, the workflow exits cleanly. The retrospective step (per `~/.claude/skills/bmad-shared/core/retrospective-step.md`) may activate next if difficulties were encountered.
