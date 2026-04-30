# Teammate Completion Gate — Orchestrator-Side Verification

**Loaded by:** `bmad-auto-flow` step files that spawn teammates and wait for their completion (typically Phase 2 spec-review, Phase 3 dev, Phase 4 code-review, Phase 5 validation).

**Companion to:** `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` §"Required Workflow Application" (Task 25 of `standalone-bmad-shared-restructure.md`).

---

## Purpose

When a teammate signals task completion via `TaskUpdate(status: "completed")`, the orchestrator MUST verify that the teammate also invoked `SendMessage(phase_complete)` per `teammate-mode-routing.md` §D. This gate addresses the documented Phase 2 failure mode where a teammate self-narrated completion ("Report sent to team-lead") without actually invoking the SendMessage tool.

This gate is the **enforcement layer** that makes the contract real — without it, the contract is documentation that teammates may ignore.

---

## Gate Procedure

### When to apply

Apply the gate IMMEDIATELY after receiving a `TaskUpdate(status: "completed")` signal from a teammate. Do not advance to the next phase until the gate passes (or its remediation completes).

### Verification steps

1. **Check for `phase_complete` SendMessage receipt.** Within the orchestrator's message inbox, look for a SendMessage from the teammate (`task_id` matching the completed task) with `type: phase_complete` payload.

2. **If `phase_complete` SendMessage is present:** verify required fields are populated per the schema in `teammate-mode-routing.md` §D — `task_id`, `parent_phase`, `deliverable.format`, `deliverable.artifacts`, `deliverable.summary`, `verdict`. Missing fields → gate FAIL (proceed to remediation).

3. **If `phase_complete` SendMessage is absent:** the gate FAILS. The `task_complete` claim is invalid.

4. **If the gate passes:** record the `verdict` and `deliverable.artifacts` for downstream phases. Advance to the next phase.

### Remediation menu (gate FAIL)

When the gate fails (no SendMessage OR invalid SendMessage fields), present this menu to the user:

```
Teammate {task_id} signaled task_complete but did not emit a valid phase_complete SendMessage.

Detected failure mode: {missing SendMessage | invalid fields: {list}}

[N] Nudge — re-send the task contract with an explicit reminder of the SendMessage requirement; resume waiting
[R] Retry — abandon the current teammate, re-spawn a fresh teammate with the same task contract
[A] Abandon — close this phase as failed; the orchestrator handles the next steps inline
[I] Inspect — show the teammate's transcript so the user can decide manually
```

WAIT for user selection. No default.

- **`[N]` Nudge** — emit a SendMessage to the teammate: "Your task is INCOMPLETE — you signaled task_complete but did not invoke `SendMessage(phase_complete)`. Per `teammate-mode-routing.md` §D this is a contract violation. Please construct a valid `phase_complete` payload and emit it now." Resume waiting for the SendMessage. Repeat the gate when received.
- **`[R]` Retry** — abandon the current teammate, log the failure, spawn a new teammate with the SAME task contract. Reset the gate counter for this task.
- **`[A]` Abandon** — mark this phase as failed in the auto-flow tracker; surface the failure to the user; let user decide whether to continue inline or terminate the auto-flow.
- **`[I]` Inspect** — open the teammate's last transcript snapshot for user review; after inspection, re-present the menu.

### Phase-timeout interaction

If `phase_timeout_minutes` (from `agent_teams.phase_timeout_minutes`, default 30) elapses while waiting for `phase_complete` SendMessage **after** `task_complete` was signaled, the gate triggers TAC-14 unwanted-pattern handler with `[R]etry / [N]udge / [A]bandon` automatically (no `[I]nspect` because the teammate is already idle).

---

## Verification Algorithm

```
on TaskUpdate(task_id=T, status="completed"):
  msgs = inbox.filter(from=T, type="phase_complete")
  if msgs.empty():
    gate_status = FAIL_NO_SENDMESSAGE
    present_remediation_menu()
    return
  msg = msgs.last()
  required_fields = ["task_id", "parent_phase", "deliverable.format",
                     "deliverable.artifacts", "deliverable.summary", "verdict"]
  missing = [f for f in required_fields if not msg.has(f)]
  if missing:
    gate_status = FAIL_INVALID_FIELDS
    present_remediation_menu(detail=missing)
    return
  gate_status = PASS
  record_phase_complete(msg)
  advance_to_next_phase()
```

This algorithm runs on EVERY `TaskUpdate(completed)` signal — no exceptions, no shortcuts.

---

## Why this gate exists

Per Phase 2 of `standalone-bmad-shared-restructure.md` (Phase 2 Findings Integration table), the spec-reviewer-1 teammate produced valid review findings but FAILED process integrity:
- ✅ Produced valid adversarial findings (12 findings)
- ❌ Read `bmad-review-story/workflow.md` only — loaded **0 step files**
- ❌ Emitted **0 CHK-INIT receipt**
- ❌ Emitted **0 CHK-STEP-NN-ENTRY/EXIT receipts**
- ❌ Never invoked `SendMessage(phase_complete)` (only loaded the tool via ToolSearch but never called it)
- ❌ Self-narrated "Review report sent to team-lead" without actually sending it
- ❌ Wrote "Silently ignoring task reminder" 2 times

Without this orchestrator-side gate, that teammate would have been considered "complete" by `bmad-auto-flow` despite never delivering the contracted SendMessage. The gate makes the contract real by refusing to accept self-claims of completion without proof.

The gate cost is small (~1 inbox lookup per task completion) relative to the cost of accepting incomplete teammate work.

---

## Cross-references

- `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` §"Required Workflow Application" — the teammate-side contract this gate enforces
- `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` §D — the `phase_complete` payload schema
- `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rules 1-7 — process integrity rules at the workflow level (this gate extends them to the teammate level)
- `bmad-auto-flow/data/question-routing.md` — sibling gate handling `question` SendMessages (for AskUserQuestion rerouting)
