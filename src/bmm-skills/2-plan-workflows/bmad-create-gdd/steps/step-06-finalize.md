# Step 6: Finalize

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-05-EXIT emis dans la conversation)
- [ ] `gdd.md` validation pass complete (no BLOCKER findings open)
- [ ] `epics.md` exists

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Finalize with {doc_workspace=…, needs_narrative=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Audit decisions, reconcile inputs, triage open items, polish the deliverables, hand off to narrative if needed, record finalization to the decision log, and present next-step guidance.

## SEQUENCE

### 1. Decision-log audit

Walk `decision-log.md` with the user. For each entry, confirm:
- The decision is captured in `gdd.md` or `epics.md` (cite the section).
- OR explicitly set aside (with rationale logged).

If any entry is neither captured nor set aside, surface to user and resolve.

### 2. Input reconciliation

Spawn one subagent per user-supplied input (game brief, brainstorming, research) from the input list captured in step 01. Each subagent's task:

- **Scope**: the input document + `gdd.md` + `epics.md`
- **Task**: Find gaps — content present in the input that is silently dropped in `gdd.md` or `epics.md`. Especially qualitative ideas (tone, feel, fantasy) that structured sections lose.
- **Output**: structured gap list with severity (CRITICAL / IMPORTANT / OPTIONAL) and proposed fix.

Walk gaps with the user. Default = fix CRITICAL/IMPORTANT. Set aside OPTIONAL gaps only with logged rationale.

### 3. Open-items review

Search `gdd.md` and `epics.md` for:
- `Open Questions:` blocks
- `[ASSUMPTION: ...]` tags
- `[NOTE FOR DESIGNER]` callouts

Triage one at a time:

- **Phase-blockers** (resolution required before architecture / production): surface to user, resolve in this step or log to `decision-log.md`.
- **Non-blockers** (can resolve later): leave in place, document in `decision-log.md` under "## Deferred".

If phase-blocking count is high (>5), flag it: "There are {N} unresolved phase-blocking items. Consider another pass before moving to architecture."

### 4. Polish pass

Spawn parallel subagents (one per file) applying the project's document standards (see `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if available, else apply general markdown hygiene):

- **`gdd.md`**: information density, no marketing copy, table formatting, internal links resolve, frontmatter complete
- **`epics.md`**: epic numbering consistent, dependencies resolve, acceptance signals concrete

Each subagent returns structured edits; apply them.

### 5. Narrative handoff (if applicable)

If `needs_narrative = true` (set in step 02 from genre guide flags):

> "Your matched game type carries narrative-design conventions. The next step for narrative depth is `bmad-create-narrative`. Want to launch it now?"

If yes, record the user's intent in `decision-log.md` ("## Handoffs"). The handoff is informational — narrative is a separate workflow run.

### 6. Record finalization

Append to `decision-log.md`:

```markdown
## Finalization — {date}

- **Intent**: {INTENT}
- **Game Type**: {GAME_TYPE} (complexity: {COMPLEXITY})
- **Scope**: {SCOPE}
- **Working Mode**: {MODE}
- **Validation**: {validation summary from step 05}
- **Open phase-blockers**: {count}
- **Deferred items**: {count}
- **Narrative handoff**: {true/false}

**Artifacts produced**:
- `gdd.md`
- `epics.md`
- `decision-log.md`
```

Update `gdd.md` frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6]`, `finalized: {date}`.

### 7. Present next steps

Share all artifact paths and the typical next step:

> "GDD finalized. Artifacts at `{DOC_WORKSPACE}/gdd.md`, `{DOC_WORKSPACE}/epics.md`, `{DOC_WORKSPACE}/decision-log.md`.
>
> Typical next step for a game heading into build: `bmad-create-architecture` (or `bmad-agent-game-architect` for game-specific architecture).
>
> If you want narrative depth first, run `bmad-create-narrative`."

---

## END OF WORKFLOW

The bmad-create-gdd workflow is complete.

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Finalize
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: WORKFLOW-COMPLETE
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-gdd executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: ['{DOC_WORKSPACE}/gdd.md', '{DOC_WORKSPACE}/epics.md', '{DOC_WORKSPACE}/decision-log.md']
```

Si steps_executed != ['01', '02', '03', '04', '05', '06'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
