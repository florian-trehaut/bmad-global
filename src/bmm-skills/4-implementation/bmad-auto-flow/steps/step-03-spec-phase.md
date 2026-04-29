---
nextStepFile: './step-04-team-create.md'
---

# Step 3: Spec Phase — INLINE (TAC-6)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Spec Phase (inline) with SPEC_PROFILE={profile}, WORKTREE_PATH={path}
```

## STEP GOAL

Run the spec phase **INLINE** in the orchestrator's own context (TAC-6) — never via a teammate. The spec phase requires user interaction throughout (gathering requirements, scope decisions, BACs/TACs validation), and the orchestrator needs the spec context to handle subsequent phases (triaging review findings, answering teammate questions, etc.).

The choice of sub-workflow depends on `SPEC_PROFILE`:
- `SPEC_PROFILE == 'quick'` → invoke `bmad-quick-spec/workflow.md`
- `SPEC_PROFILE == 'full'` → invoke `bmad-create-story/workflow.md`

## MANDATORY SEQUENCE

### 1. Pre-condition check (TAC-6)

Verify the spec phase is INLINE — never as a teammate. The orchestrator does NOT call TaskCreate for the spec phase. If a future modification attempts to delegate the spec phase to a teammate, HALT with:

```
HALT — bmad-auto-flow violation
  reason: spec phase MUST run inline in the orchestrator's context (TAC-6 of story auto-flow-orchestrator).
  rationale: the orchestrator needs the spec context for the rest of the lifecycle (triaging review findings, answering teammate questions, etc.).
  action: revert the modification.
```

### 2. Invoke the chosen spec workflow

Based on `SPEC_PROFILE`:

#### Case `SPEC_PROFILE == 'quick'`

```
Read FULLY and apply: ~/.claude/skills/bmad-quick-spec/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.

Execute the workflow inline. Pass:
- FEATURE_DESCRIPTION (from step-01)
- COMMUNICATION_LANGUAGE
- (the workflow will read its own knowledge files and emit its own CHK-INIT)

When bmad-quick-spec completes (CHK-WORKFLOW-COMPLETE emitted), it will have:
- Created a tracker entry (or updated frontmatter status backlog → ready-for-dev for file-based trackers)
- Written a spec file at {tracker_story_location}/{slug}.md
```

#### Case `SPEC_PROFILE == 'full'`

```
Read FULLY and apply: ~/.claude/skills/bmad-create-story/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.

Execute the workflow inline. Same pass-through. The full workflow has 14 steps; expect significantly longer execution.
```

### 3. Capture outputs

After the spec workflow exits, capture:
- `ISSUE_ID` (from the tracker entry created by the spec workflow — file-based: the slug; tracker-API: the returned ID)
- `SPEC_PATH` (path to the spec file)
- `ISSUE_TITLE` (from the spec frontmatter)

### 4. Verify pre-spawn requirement (TAC-28 enforcement begins here)

Per TAC-28: "If task_contract.input_artifacts.tracker_issue.identifier is null/missing/malformed when spawning a teammate, then the orchestrator shall HALT before spawning."

```
Assert ISSUE_ID is non-null and well-formed (matches expected pattern: <issue_prefix>-<number> for tracker APIs, or <kebab-slug> for file-based).
On failure → HALT before proceeding to step-04.
```

This check is the operational form of TAC-28 — every TaskCreate downstream depends on a valid ISSUE_ID.

### 5. Audit log

If audit_log_enabled:

```bash
echo "[step-03-spec-phase] spec_workflow={profile}, ISSUE_ID={id}, SPEC_PATH={path}" >> $LOG_FILE
```

### 6. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: spec workflow completed inline (CHK-WORKFLOW-COMPLETE emitted by the sub-workflow), ISSUE_ID and SPEC_PATH captured, TAC-28 pre-condition validated
- **FAILURE**: delegating spec phase to a teammate (TAC-6 violation), proceeding with null ISSUE_ID (TAC-28 violation)

---

## STEP EXIT (CHK-STEP-03-EXIT)

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Spec Phase
  actions_executed: invoked {bmad-quick-spec | bmad-create-story} INLINE; captured ISSUE_ID={id}, SPEC_PATH={path}; validated TAC-28 pre-condition (ISSUE_ID non-null and well-formed)
  artifacts_produced: ISSUE_ID, SPEC_PATH, ISSUE_TITLE
  next_step: ./steps/step-04-team-create.md
```

**Next:** Read FULLY and apply: `./steps/step-04-team-create.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
