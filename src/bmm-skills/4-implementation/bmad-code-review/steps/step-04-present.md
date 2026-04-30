---
severityActionMatrix: '../data/severity-action-matrix.md'
---

# Step 4: Present & Post


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Present & Post with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Present the `consolidated_report` to the user (categorised by severity + action), let them choose the output method, then post findings to the forge (DiffNotes) and/or tracker, apply `patch` fixes in the orchestrator, and handle approval decisions. Absorbs v1 step-07 (present) + step-08 (post).

---

## PRE-CHECK

- `CONSOLIDATED_REPORT` must be set (from step-03-triage)
- `REVIEW_WORKTREE_PATH` must still be valid

---

## 1. Present Findings

**MANDATORY: Present ALL findings from `CONSOLIDATED_REPORT.findings`. No filtering, no dropping.**

Each finding carries BOTH `severity` (impact) AND `action` (disposition) per `{severityActionMatrix}`. Group by severity, show action.

```markdown
## Code Review Report — !{MR_IID}

**Verdict:** {VERDICT}   (from CONSOLIDATED_REPORT.verdict)
**Overall score:** {SCORE_OVERALL} (min meta: M{min_meta} = {min_meta_score})

### Summary
| Severity | Count | Actions |
| --- | --- | --- |
| BLOCKER | {blocker_count} | patch: {p} / decision_needed: {d} / defer: {f} / dismiss: {x} |
| WARNING | {warning_count} | ... |
| RECOMMENDATION | {rec_count} | ... |
| QUESTION | {question_count} | ... |

**Failed layers:** {FAILED_LAYERS or "None"}

### Regression Risk
{REGRESSION_RISK_LEVEL} — {PHASE2_SUSPICIOUS_REMOVALS_COUNT} suspicious removals
(Out-of-scope removals: {count}; test-file deletions: {count})

### Findings

#### BLOCKERS

**{file}:{line}** [M{meta}.{sub_axis}] [action: {action}] [consensus: {CONFIRMED|SINGLE_REVIEWER|N/A}]
{title}

Detail: {detail}
Fix: {fix}
Pattern ref: {pattern_ref}

#### WARNINGS
... (same structure)

#### RECOMMENDATIONS
... (same structure)

#### QUESTIONS
... (same structure)

### AC Coverage (if tracker issue linked)

| AC | Status | Implementation | Test |
| --- | --- | --- | --- |
| AC1 | COMPLIANT | file.ts:23 | file.spec.ts:45 |
| AC2 | PARTIAL | file.ts:67 | — |
| AC3 | NOT_IMPLEMENTED | — | — |

### Trivial Fixes Queued (action=patch)
{list of findings marked action=patch that the orchestrator will apply}
```

---

## 2. Orchestrator Applies `action = patch` Findings

For each finding with `action: patch`, the orchestrator (not a subagent) applies the fix inside `{REVIEW_WORKTREE_PATH}`:

1. Automated formatter/lint fixes: `{FORMAT_FIX_COMMAND}` (typically covers format/lint action=patch findings in bulk)
2. One-line trivial fixes: edit + stage each specific file

Run tests after each batch:

```bash
cd {REVIEW_WORKTREE_PATH}
{TEST_COMMAND}
```

If tests fail → HALT, revert fix, re-classify as `decision_needed`.

Note all modified files as `trivial_fixes_applied`.

---

## 3. HALT on `action = decision_needed`

For findings marked `decision_needed`, the orchestrator HALTs the workflow and asks the user for each one:

```
Finding F007: {title}
File: {file}:{line}
Severity: {severity}   Meta: M{meta}.{sub_axis}   Consensus: {consensus}

Options:
[A] Accept fix: {fix}
[R] Reject — record as defer in deferred-work.md
[M] Modify — provide custom resolution
[N] Keep as-is — I'll address in a separate PR

Choice:
```

Apply the user's decision. NEVER silently pick a default.

---

## 4. Handle `action = defer`

For findings marked `defer`, append to `{MAIN_PROJECT_ROOT}/_bmad-output/implementation-artifacts/deferred-work.md`:

```markdown
## Deferred from !{MR_IID} — {today}

- **F012** [{severity} → defer] ({file}:{line}) {title}
  Context: {detail}
  Fix: {fix}
```

Also include a "Deferred" section in the MR description under `## Deferred work`.

---

## 5. Handle `action = dismiss`

For findings marked `dismiss`, log the `dismiss_reason` in the audit trail. Do NOT surface to the user as a finding. Do NOT post.

---

## 6. Ask User for Output Method

<check if="REVIEW_MODE == 'colleague'">

  ```
  How to proceed?

  [1] Post findings as DiffNotes on the forge (recommended)
  [2] Post findings as tracker comment only
  [3] Both forge DiffNotes + tracker comment

  Choice:
  ```
</check>

<check if="REVIEW_MODE == 'self'">

  ```
  How to proceed?

  [1] Apply all queued patches + commit + push
  [2] Create action items as tracker comment
  [3] Post as tracker comment only

  Choice:
  ```
</check>

Store `OUTPUT_METHOD`.

---

## 7. Post to Forge (OUTPUT_METHOD includes forge)

### Load existing comments (avoid duplicates)

```bash
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
# /notes (not /discussions) — catches standalone resolvable notes
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}/notes?per_page=100" \
  | tr -d '\000-\011\013-\037' \
  | jq '[.[] | select(.system==false) | {id,file:(.position.new_path // null),line:(.position.new_line // null),body,resolved:(.resolvable and .resolved)}]'
```

### Get `diff_refs` for DiffNote positioning

```bash
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}" | jq '.diff_refs'
```

### Post each finding as a DiffNote

**MANDATORY: Post ALL findings except `action=dismiss`.** Every BLOCKER / WARNING / RECOMMENDATION / QUESTION with `action ≠ dismiss` gets its own DiffNote thread. Do NOT group findings unless they are on the exact same `file:line`.

Use severity prefixes: `BLOCKER:`, `WARNING:`, `Recommendation:`, `Question:`. Include action tag: `[action: decision_needed]` etc. Include `sub_axis` + OWASP/LLM risk tags where present.

**Verification:** After posting, count DiffNotes created and compare against the total postable findings. If counts differ, identify and post the missing findings before proceeding.

### Post summary note

Total findings by severity × action, active metas, regression-risk level, verdict, failed layers.

### Approval decision

```bash
EXISTING_APPROVALS=$({FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}/approvals" \
  | jq '[(.approved_by // [])[] | .user.username] | length')
```

- 0 BLOCKERs AND not already approved by CURRENT_USER → `{FORGE_CLI} mr approve {MR_IID}`
- >0 BLOCKERs → NO approval — author must resolve first

---

## 8. Post to Tracker (OUTPUT_METHOD includes tracker)

<check if="LINKED_TRACKER_ISSUE exists">

  Create a comment on the tracker issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):

  - Operation: Create comment
  - Issue: `{ISSUE_ID}`
  - Body: verdict + score + findings by severity × action + AC coverage table + regression-risk summary

</check>

<check if="no LINKED_TRACKER_ISSUE">
  Log: "No tracker issue linked — skipping tracker comment."
</check>

---

## 9. Self-Review Commit (OUTPUT_METHOD includes auto-fix)

If the user chose auto-fix in self-review mode:

1. Confirm all queued `patch` findings are applied
2. Run full validation: `cd {REVIEW_WORKTREE_PATH} && {QUALITY_GATE}`
3. **Amend the existing commit** — do NOT create a new "review fix" commit:
   ```bash
   git add {fixed_files}
   git commit --amend --no-edit
   ```
4. **Push with `--force-with-lease`** (safe force push — aborts if someone else pushed):
   ```bash
   git push origin {LOCAL_BRANCH}:{MR_SOURCE_BRANCH} --force-with-lease
   ```

The worktree IS the MR branch — commits push directly.

<check if="all validations pass AND LINKED_TRACKER_ISSUE exists">
  Update the issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
  - Operation: Update issue
  - Issue: `{ISSUE_ID}`
  - Status: `{TRACKER_STATES.to_test}`
  - Add comment: "Self-review complete — all patch findings resolved. Ready for validation métier."

  **NEVER set Done from code-review.** Done is ONLY set by the validation-métier workflow after all VM items pass.
</check>

<check if="some validations fail">
  Keep issue in current status. Report remaining issues to user. Do NOT push.
</check>

---

## 10. Action Items Mode (OUTPUT_METHOD includes action-items)

<check if="LINKED_TRACKER_ISSUE exists">

  Add a "Review Action Items" comment on the tracker issue with checkboxes:

  ```markdown
  ## Review Action Items

  - [ ] F001: {title} ({file}:{line}) [action: {action}]
  - [ ] F002: {title} ({file}:{line}) [action: {action}]
  ```

  Update issue status to `{TRACKER_STATES.in_progress}`. Comment: "Action items created. Address and re-submit."

</check>

---

## 11. Final Report

```markdown
## Code Review Complete

- **MR**: !{MR_IID} — {MR_URL}
- **Author**: @{MR_AUTHOR}
- **Tracker Issue**: {ISSUE_IDENTIFIER or "none linked"}
- **Review Type**: {colleague / self-review}
- **Worktree**: {REVIEW_WORKTREE_PATH}
- **Verdict**: {VERDICT}   (score: {SCORE_OVERALL})
- **Findings**: {total} (BLOCKER {b} / WARNING {w} / REC {r} / QUESTION {q})
- **Actions**: patch {p} / decision_needed {d} / defer {f} / dismiss {x}
- **Output**: {Forge DiffNotes / Tracker comment / Auto-fixed / Action items}
- **Approval**: {Approved / Not approved — blockers exist / N/A}
- **Failed layers**: {FAILED_LAYERS or "None"}

### Trivial fixes applied
{list or "None"}

### Deferred work
{list or "None"}

### Next steps

- {colleague review: "Author addresses blockers and replies to threads; re-review when threads resolved"}
- {self-review + fixes: "All patch findings resolved — ready for external review or merge"}
- {self-review + action items: "Address action items, then re-run self-review"}
```

---

## 12. Retrospective (MANDATORY)

After the final report is presented, execute the retrospective step: read and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`. NOT optional — runs after every execution (silently skips if no friction was encountered per G8).

## SUCCESS/FAILURE:

### SUCCESS: Consolidated report presented, actions routed, findings posted, approval handled, final report produced, retrospective executed
### FAILURE: Filtering findings, auto-selecting output without user input, approving MR with BLOCKERs, skipping retrospective, silently dismissing without `dismiss_reason`

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Present & Post
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review executed end-to-end:
  steps_executed: ['01', '02', '03', '04']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
