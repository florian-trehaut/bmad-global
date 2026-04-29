---
nextStepFile: './step-08-validation-phase.md'
---

# Step 7: Code Review Phase — N distinct single-perspective teammates (BAC-12, TAC-9)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Code Review Phase with code_review_team_size={N}, MR_URL={url}
```

## STEP GOAL

Spawn N **distinct single-perspective teammates** (BAC-12 / TAC-9). Each teammate runs ONE perspective subskill from `bmad-code-review-perspective-{specs,correctness,security,engineering-quality,operations,user-facing}` — NOT `bmad-code-review/workflow.md` (which uses Agent() removed from teammates per Anthropic platform contract).

`N = agent_teams.code_review_team_size` (default 3, clamped to `[1, max_teammates]`).

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
assert MR_URL set (from step-06) → else HALT.
```

### 2. Compute N + perspective selection

```
code_review_team_size = agent_teams.code_review_team_size from workflow-context.md (default 3)
N = clamp(code_review_team_size, 1, MAX_TEAMMATES)
```

Perspective selection (per team-config.md "Roles" section):

```
Default selection (N=3):
  1. code-reviewer-specs (Meta-1, always active)
  2. code-reviewer-correctness (Meta-2, always active)
  3. code-reviewer-security (Meta-3, always active)

If N >= 4: add code-reviewer-engineering-quality (Meta-4, always active)

If N >= 5 AND diff has operational changes (CI/CD, infra): add code-reviewer-operations (Meta-5)
   Else if N >= 5: skip operations (not active for this diff)

If N >= 6 AND diff has user-facing changes: add code-reviewer-user-facing (Meta-6)

If N >= 4 + extra_security_for_voting: spawn a SECOND code-reviewer-security (S2 of S1+S2 voting)
```

The orchestrator pre-checks Meta-5 / Meta-6 activation predicates by inspecting the diff (via `git diff origin/main...HEAD --name-only` or equivalent on `WORKTREE_PATH`).

### 3. Branch on TEAM_MODE

#### TEAM_MODE=true: spawn N teammates in parallel

For each selected perspective `p`:

```yaml
task_contract:
  team_name: '{TEAM_NAME}'
  task_id: 'code-review-{p}-{N}'
  role: 'code-reviewer-{p}'   # e.g., 'code-reviewer-specs', 'code-reviewer-security'

  scope_type: 'review'
  scope_files: {list from git diff}
  scope_domain: 'Code review perspective {p} on MR {MR_URL}'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'
      content: |
        {full SPEC_PATH content}
    - type: 'diff'
      worktree_path: '{WORKTREE_PATH}'
      target_branch: 'main'
      stats: '{output of git diff --stat origin/main...HEAD}'

  deliverable:
    format: 'yaml_report'
    send_to: '{LEAD_NAME}'

  constraints:
    read_only: true
    worktree_path: '{WORKTREE_PATH}'
    tracker_writes: false
    halt_conditions:
      - 'Knowledge file required for this perspective is missing'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'code-review'
    perspective: '{p}'

  workflow_to_invoke: 'bmad-code-review-perspective-{p}/workflow.md'
```

Invoke TaskCreate for each perspective. The teammates execute in parallel (Agent Teams handles parallelism at the platform level).

#### TEAM_MODE=false: run perspectives sequentially inline

```
For each perspective p in selection:
  Read FULLY and apply: ~/.claude/skills/bmad-code-review-perspective-{p}/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.
  Execute inline.
  Capture findings.
```

### 4. Wait for all phase_complete reports + aggregate

Process inbound messages. When all N teammates report `phase_complete`:

```
all_findings = []
for r in PHASE_RESULTS['code-review'].values():
  all_findings.extend(r.findings)

n_blocker = count(severity == 'BLOCKER' in all_findings)

if n_blocker == 0:
  overall_verdict = 'APPROVE'
  apply tracker transition: review → ready-for-merge
else:
  overall_verdict = 'FINDINGS'
  present [R]/[F]/[A] menu per TAC-13

Special: security voting (if S1 + S2 both spawned):
  if S1.verdict == FINDINGS AND S2.verdict == APPROVE: ASK user (vote tied)
  if both APPROVE: security passes
  if both FINDINGS: security fails (BLOCKER count includes both)
```

### 5. Process verdict

Same `[R]/[F]/[A]` menu as step-05/06 if FINDINGS. On APPROVE:
- Apply tracker transition `review → ready-for-merge`
- Store `PHASE_RESULTS['code-review'] = {verdict: 'APPROVE', findings: [], per_perspective_results: {...}}`

### 6. Audit log

```bash
echo "[step-07-code-review-phase] N={N}, perspectives={list}, verdict={verdict}, blockers={n}" >> $LOG_FILE
```

## SUCCESS / FAILURE

- **SUCCESS**: N distinct single-perspective teammates spawned (NOT N teammates running bmad-code-review/workflow.md), all phase_complete received, aggregate verdict computed, tracker transitioned per verdict
- **FAILURE**: spawning a teammate that runs `bmad-code-review/workflow.md` (BAC-12 / TAC-9 violation — would fail at step-02 due to Agent tool unavailability), wrong perspective selection logic

---

## STEP EXIT (CHK-STEP-07-EXIT)

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Code Review Phase
  actions_executed: pre-spawn validation passed; selected {N} distinct perspectives ({list}); spawned {N} single-perspective teammates; collected all phase_complete; aggregated verdict={verdict}; tracker {transitioned to ready-for-merge | menu shown — user chose {choice}}
  artifacts_produced: PHASE_RESULTS['code-review'] = {verdict, findings, per_perspective_results}
  next_step: ./steps/step-08-validation-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-08-validation-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
