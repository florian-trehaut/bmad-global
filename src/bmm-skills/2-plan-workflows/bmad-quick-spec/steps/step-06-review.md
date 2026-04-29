---
nextStepFile: null
---

# Step 6: Single-Validator Review, Write Spec File, Transition Tracker

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-05-EXIT emis dans la conversation
- [ ] Variables en scope: tous les artefacts steps 01-05 (FEATURE_DESCRIPTION, SLUG, TITLE, BACs, TACs, etc.)
- [ ] Working state: spec content prêt à être assemblé

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Review with SLUG={slug}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Single-validator review pass over the assembled spec content. Write the spec file at `{tracker_story_location}/{slug}.md`. Transition the tracker (or emit `tracker_write_request` if TEAMMATE_MODE=true).

## MANDATORY SEQUENCE

### 1. Assemble spec content

Apply the template `templates/spec-template-quick.md` and substitute all placeholders with the artefacts produced in steps 01-05. The result MUST contain all 22 mandatory sections per `~/.claude/skills/bmad-shared/spec-completeness-rule.md`:

1. Definition of Done (Feature + Non-regression)
2. Problem
3. Proposed Solution
4. Scope (Included)
5. Out of Scope (OOS-N table, ≥ 2 items)
6. Business Context — User Journey + BACs (Given/When/Then) + External Dependencies
7. Technical Context (in `<details>`)
8. Real-Data Findings (full or terse N/A justified)
9. External Research (full or terse N/A justified)
10. Data Model (or N/A)
11. API Contracts (or N/A)
12. Infrastructure
13. External Data Interfaces (or none)
14. Data Mapping (or N/A)
15. NFR Registry (7 categories)
16. Security Gate (binary verdict)
17. Observability Requirements
18. Implementation Plan — Tasks + TACs (EARS)
19. Validation Métier
20. Guardrails
21. Boundaries Triple (Always / Ask First / Never)
22. Risks & Assumptions
23. INVEST Self-Check
24. Test Strategy
25. File List

(The 22 mandatory + 3 conditional = 25 total potential sections. Quick profile keeps all of them present.)

### 2. Single-validator review

Run an internal pass over the assembled content. Check:

- [ ] All 22 mandatory sections present (no section silently empty)
- [ ] BACs use Given/When/Then (no informal phrasing)
- [ ] TACs use one of 5 EARS patterns + reference at least one BAC
- [ ] OOS register has ≥ 2 items
- [ ] Boundaries Triple has ≥ 3 items per bucket
- [ ] HIGH-impact risks have mitigation
- [ ] INVEST has 5/6 YES (Small=YES required for quick)
- [ ] Security Gate verdict is binary (PASS / FAIL / N/A) — not PARTIAL
- [ ] No fabricated examples or hallucinated tool names
- [ ] Frontmatter has `profile: quick`, `mode: monolithic`, `schema_version: "2.0"`

For each failed check → emit a finding (severity: BLOCKER for missing mandatory section, MAJOR for format violation, MINOR for stylistic issue). If any BLOCKER → HALT, present findings to user, fix, re-run review pass.

### 3. Resolve user input on findings (if any)

If TEAMMATE_MODE=false:
- Present findings via `AskUserQuestion`
- Apply fixes per user choice
- Re-run review pass on the fixed content

If TEAMMATE_MODE=true (per `teammate-mode-routing.md`):
- Send a `question` SendMessage with findings
- Block on reply
- Apply fixes per orchestrator choice

### 4. Write spec file

Path: `{MAIN_PROJECT_ROOT}/{tracker_story_location}/{slug}.md` (resolve `tracker_story_location` from workflow-context.md).

Use the Write tool to create the file. Verify creation:

```bash
ls {MAIN_PROJECT_ROOT}/{tracker_story_location}/{slug}.md
```

If absent → HALT (write failed).

### 5. Run validate-story-spec on the output

```bash
npm run validate:story-spec -- {MAIN_PROJECT_ROOT}/{tracker_story_location}/{slug}.md --profile=quick
```

Expected: `0 BLOCKER findings` (BAC-10 of story `auto-flow-orchestrator`). If any BLOCKER → HALT, present findings, fix, re-run.

### 6. Transition tracker (or defer)

If TEAMMATE_MODE=false:
- Update tracker: status `backlog` → `ready-for-dev`. Apply tracker-crud per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md` (or for file-based tracker: edit the story frontmatter `status` field).

If TEAMMATE_MODE=true (and `task_contract.constraints.tracker_writes == false`):
- Emit a `tracker_write_request` SendMessage to the lead per `teammate-mode-routing.md` §B
- Wait for `tracker_write_ack`. On `failed`, emit a `blocker` and HALT.

### 7. Emit final report

If TEAMMATE_MODE=true: emit a `phase_complete` SendMessage per `teammate-mode-routing.md` §D with verdict `DONE` and the spec path as the deliverable artifact.

If TEAMMATE_MODE=false: log to the user:

```
Spec produced: {path}
Validator: 0 BLOCKER findings
Tracker: {SLUG} → ready-for-dev
Next: invoke /bmad-dev-story or /bmad-quick-dev to implement.
```

### 8. Workflow Complete

Emit the workflow-level receipt per `workflow-adherence.md` Rule 7:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-quick-spec executed end-to-end:
  steps_executed: [01, 02, 03, 04, 05, 06]
  steps_skipped: []
  final_artifacts:
    - spec_file: {MAIN_PROJECT_ROOT}/{tracker_story_location}/{slug}.md
    - tracker_status: {ready-for-dev | deferred via SendMessage}
    - validator_result: 0 BLOCKER findings
```

If `steps_executed != [01..06]` sequential OR `steps_skipped` non-empty without verbatim user citation → HALT.

## SUCCESS / FAILURE

- **SUCCESS**: spec file written with all 22 mandatory sections, validate-story-spec exits 0 (or only INFO/MINOR findings), tracker transitioned, workflow-complete receipt emitted
- **FAILURE**: writing spec without review pass, declaring success with BLOCKER findings, skipping tracker transition, omitting workflow-complete receipt

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Review
  actions_executed: assembled spec ({N} sections); ran single-validator review ({M} findings, {B} BLOCKERs); fixed findings; wrote spec file to {path}; ran validate-story-spec (exit code {0|1}); transitioned tracker ({status_change}); emitted final report
  artifacts_produced: SPEC_FILE_PATH, validator_result={0_blockers | …}, tracker_status_after={ready-for-dev | …}
  next_step: WORKFLOW-COMPLETE
```

This is the LAST step of `bmad-quick-spec`. After CHK-STEP-06-EXIT, emit CHK-WORKFLOW-COMPLETE per §8 above.
