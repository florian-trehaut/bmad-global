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

Spawn 5 **distinct single-perspective teammates** (BAC-7 / BAC-12 / TAC-9 / TAC-21 / TAC-22 / TAC-23) inside an isolated phase team `codereview-{RUN_ID}`. Each teammate runs ONE perspective subskill from `bmad-code-review-perspective-{specs,correctness,security,operations,user-facing}` — NOT `bmad-code-review/workflow.md` (which uses Agent() removed from teammates per Anthropic platform contract). **Note** : engineering-quality (Meta-4) perspective is intentionally OUT OF SCOPE for auto-flow per OOS-9 — spec-driven autonomy and team-per-phase architecture limit Phase 7 to 5 teammates max ; engineering-quality coverage relies on standalone `/bmad-code-review` invocation when needed.

Composition (axe 5) : 3 always (specs, correctness, security) + 2 reserve (operations, user-facing). The 2 reserve teammates are spawned as part of TeamCreate but receive a TaskCreate ONLY if step-07 detects ops or UI changes in the diff — otherwise idle until TeamDelete (TAC-23).

Before spawning code-review teammates, the lifecycle gate `pr_required` (axe 3 / BAC-3 / TAC-9) is evaluated: if active, the lead creates the PR via `forge_mr_create` (`gh pr create` for GitHub, `glab mr create` for GitLab, etc.) BEFORE TaskCreate. The lead also invokes `ci_watch_skill` if configured to wait for CI green light.

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
assert RUN_ID set, TRACE_FOLDER exists and writable → else HALT.
```

### 2. Lifecycle gate — pr_required (axe 3, BAC-3 / TAC-9)

If `LIFECYCLE_ARTIFACTS.pr_required == true`:

**SECURITY — Shell injection prevention (per Phase 7 code review BLOCKER F-M3-S1-001)** : ISSUE_TITLE remonte de FEATURE_DESCRIPTION (user input). Backticks ou `$(...)` dans le titre exécuteraient du shell si la commande forge est construite par interpolation naïve. **Use `--title-file` / `--body-file` (read from temp file)** au lieu de string interpolation, OR use printf-style format-string avec quoting strict.

```bash
# Check if PR already exists for this branch
EXISTING_PR=$("${forge_mr_list[@]}" --head "${BRANCH_NAME}" --state open 2>/dev/null | head -1)

if [ -z "$EXISTING_PR" ]; then
  # Write title + body to temp files (avoids shell injection on backticks / $() in user-provided content)
  TITLE_FILE=$(mktemp)
  BODY_FILE=$(mktemp)
  trap 'rm -f "$TITLE_FILE" "$BODY_FILE"' EXIT

  printf '%s: %s' "${ISSUE_IDENTIFIER}" "${ISSUE_TITLE}" > "${TITLE_FILE}"
  printf '%s\n\n%s' "${AUTO_GENERATED_BODY}" "${DIFF_STATS}" > "${BODY_FILE}"

  # Create PR via the project's forge command using --title-file / --body-file
  # (gh and glab both support file-based input for safer handling of arbitrary content)
  "${forge_mr_create[@]}" \
    --base main \
    --head "${BRANCH_NAME}" \
    --title "$(cat "${TITLE_FILE}")" \
    --body-file "${BODY_FILE}"
  # Capture MR_IID, MR_URL from forge command output
fi
```

Note : if the project's forge CLI does not support `--title-file` / `--body-file`, the orchestrator MUST sanitize ISSUE_TITLE and DIFF_STATS by stripping or escaping shell metacharacters (backticks, `$(`, `\``) before construction. The HALT guidance below applies regardless.

**HALT explicit on forge command failure** (auth missing, repo permissions, network) — no silent retry, no fallback. User fixes auth/config and re-runs auto-flow. Document the failure in PHASE_RESULTS for downstream visibility.

If `LIFECYCLE_ARTIFACTS.pr_required == false` (default), skip this section.

Audit log:

```bash
echo "{\"event\":\"auto-flow.lifecycle.gate.checked\",\"run_id\":\"${RUN_ID}\",\"gate_name\":\"pr_required\",\"outcome\":\"{passed | skipped | failed}\"}" >> "${LOG_FILE}"
```

### 3. Lifecycle gate — ci_watch_skill (axe 3, BAC-4)

Resolution priority (TAC-12) :
1. Highest : explicit `LIFECYCLE_ARTIFACTS.ci_watch_skill` (literal skill name in config)
2. Middle : auto-discovered `CI_WATCH_SKILL_PATH` (from workflow.md INIT §6)
3. Lowest : absent → skip gate gracefully (no HALT)

If a skill is resolved:

```
Invoke the skill via the Skill tool with appropriate args (the skill's contract is project-defined).
Await PASS/FAIL/SKIP from the skill output.
On FAIL: HALT with the skill's reported failure (no silent advance).
On PASS or SKIP: proceed to step 4.
```

### 4. Compute perspective selection

Per axe 5 stable team-per-phase composition: 5 teammates total = 3 always + 2 reserve.

```
ALWAYS = ['specs', 'correctness', 'security']      # 3 teammates always task-assigned
RESERVE_TASK_TRIGGERED = []
diff_files = `git diff origin/main...HEAD --name-only`

if any file in diff_files matches /(^|\/)(\.github\/workflows|Dockerfile|docker-compose|terraform|infra|deploy|ci|cd)/i:
  RESERVE_TASK_TRIGGERED.append('operations')

if any file in diff_files matches /(^|\/)(ui|frontend|web|app\/|components|pages|views|public)/i:
  RESERVE_TASK_TRIGGERED.append('user-facing')
```

The 2 reserve roles ('operations' and 'user-facing') are ALWAYS instantiated as teammates in TeamCreate (5 total) per BAC-7 / TAC-23 — but only receive a TaskCreate if their predicate triggered. Reserve teammates without TaskCreate stay idle until TeamDelete.

### 5. TeamCreate phase-scoped codereview team (axe 5)

```
TeamCreate(
  name = "codereview-{RUN_ID}",
  teammates = [
    { role: "code-reviewer-specs", model: default_worker_model },         # always
    { role: "code-reviewer-correctness", model: default_worker_model },   # always
    { role: "code-reviewer-security", model: default_worker_model },      # always
    { role: "code-reviewer-operations", model: default_worker_model },    # reserve — idle if no ops trigger
    { role: "code-reviewer-user-facing", model: default_worker_model },   # reserve — idle if no UI trigger
  ],
  permission_mode: inherited from lead
)
```

5 teammates ≤ `max_teammates=5` (TAC-23).

### 6. Branch on TEAM_MODE

#### TEAM_MODE=true: spawn 3 always + N reserve teammates in parallel

For each role in `ALWAYS + RESERVE_TASK_TRIGGERED` (only the triggered ones receive TaskCreate; idle reserve teammates remain instantiated but task-less):

```yaml
task_contract:
  team_name: 'codereview-{RUN_ID}'
  task_id: 'code-reviewer-{p}-1'
  role: 'code-reviewer-{p}'   # e.g., 'code-reviewer-specs', 'code-reviewer-security'

  workflow_to_invoke: '~/.claude/skills/bmad-code-review-perspective-{p}/workflow.md'  # TAC-24

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
    autonomy_policy: 'strict'                                              # code-review teammates route all questions to lead
    trace_path: '{TRACE_FOLDER}/code-reviewer-{p}-1.md'                    # TAC-13
    halt_conditions:
      - 'Knowledge file required for this perspective is missing'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'code-review'
    perspective: '{p}'
```

Invoke TaskCreate for each TRIGGERED perspective (3 always + 0-2 reserve). The teammates execute in parallel (Agent Teams handles parallelism at the platform level). Idle reserve teammates remain in TeamCreate but receive no TaskCreate — they consume minimal tokens (no work performed).

Audit log per spawn:

```bash
echo "{\"event\":\"auto-flow.teammate.spawned\",\"run_id\":\"${RUN_ID}\",\"teammate_role\":\"code-reviewer-${p}\",\"task_id\":\"code-reviewer-${p}-1\",\"trace_path\":\"${TRACE_FOLDER}/code-reviewer-${p}-1.md\",\"autonomy_policy\":\"strict\"}" >> "${LOG_FILE}"
```

#### TEAM_MODE=false: run perspectives sequentially inline

```
For each perspective p in (ALWAYS + RESERVE_TASK_TRIGGERED — same triggering logic):
  Read FULLY and apply: ~/.claude/skills/bmad-code-review-perspective-{p}/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.
  Execute inline.
  Capture findings.
```

### 7. Wait for all phase_complete reports + aggregate

Process inbound messages. Append `phase_complete.trace_files[]` to global TRACE_FILES per teammate. When all triggered teammates report `phase_complete`:

```
all_findings = []
for r in PHASE_RESULTS['code-review'].values():
  all_findings.extend(r.findings)

n_blocker = count(severity == 'BLOCKER' in all_findings)
n_major = count(severity == 'MAJOR' in all_findings)

# Per workflow-adherence Rule 8 (Findings Handling Policy) — all findings fixed by default regardless of severity
# UNLESS a documented skip reason applies (deferred-by-phase, OOS confirmed, user-approved design decision, duplicate, honest non-reproduction)
if (n_blocker + n_major + count(MINOR/INFO findings)) == 0:
  overall_verdict = 'APPROVE'
  apply tracker transition: review → ready-for-merge
else:
  overall_verdict = 'FINDINGS'
  present [R]/[F]/[A] menu per TAC-13 — with full findings list (all severities) for fix-by-default decision

Special: security voting (if S1 + S2 both spawned):
  if S1.verdict == FINDINGS AND S2.verdict == APPROVE: ASK user (vote tied)
  if both APPROVE: security passes
  if both FINDINGS: security fails (BLOCKER count includes both)
```

Audit log per phase_complete:

```bash
echo "{\"event\":\"auto-flow.teammate.phase_complete\",\"run_id\":\"${RUN_ID}\",\"task_id\":\"code-reviewer-${p}-1\",\"verdict\":\"{verdict}\",\"findings_count\":{N},\"trace_files\":${trace_files_array}}" >> "${LOG_FILE}"
```

### 8. Process verdict

Same `[R]/[F]/[A]` menu as step-05/06 if FINDINGS. On APPROVE:
- Apply tracker transition `review → ready-for-merge`
- Store `PHASE_RESULTS['code-review'] = {verdict: 'APPROVE', findings: [], per_perspective_results: {...}, trace_files: [...]}`

### 9. TeamDelete phase team (axe 5)

```
TeamDelete(name = "codereview-{RUN_ID}")
```

Mandatory before transition to step-08 — the next phase team is `validation-{RUN_ID}` (1 validator).

## SUCCESS / FAILURE

- **SUCCESS**: lifecycle gate `pr_required` evaluated (PR created or skipped per config); `ci_watch_skill` invoked if resolved; TeamCreate `codereview-{RUN_ID}` invoked with 5 teammates (3 always + 2 reserve); 3+N triggered TaskCreates with trace_path; reserve teammates idle if not triggered ; all phase_complete received ; TRACE_FILES extended ; aggregate verdict computed; tracker transitioned per verdict; TeamDelete invoked
- **FAILURE**: spawning a teammate that runs `bmad-code-review/workflow.md` (BAC-12 / TAC-9 violation — would fail at step-02 due to Agent tool unavailability), forgetting `pr_required` gate when configured (BAC-3 violation), silent forge command failure (no-fallback-no-false-data violation), forgetting trace_path propagation (TAC-13 violation), forgetting TeamDelete (axe 5 lifecycle violation)

---

## STEP EXIT (CHK-STEP-07-EXIT)

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Code Review Phase
  actions_executed: lifecycle gate pr_required={value} {evaluated/skipped}; ci_watch_skill={path/name or null} {invoked/skipped}; TeamCreate(codereview-{RUN_ID}, 5 teammates: 3 always + 2 reserve); pre-spawn validation passed; spawned 3+{N_reserve} TaskCreate; collected all phase_complete; TRACE_FILES extended ({N} entries); aggregated verdict={verdict}; tracker {transitioned to ready-for-merge | menu shown — user chose {choice}}; TeamDelete(codereview-{RUN_ID})
  artifacts_produced: PHASE_RESULTS['code-review'] = {verdict, findings, per_perspective_results, trace_files}
  next_step: ./steps/step-08-validation-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-08-validation-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
