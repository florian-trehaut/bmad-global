# Step 3: Execute Implementation

**Goal:** Implement all tasks, write tests, follow patterns, handle errors.

**Critical:** Continue through ALL tasks without stopping for milestones.

---


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-02B-EXIT emis dans la conversation)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Execute Implementation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## AVAILABLE STATE

From previous steps:
- `{baseline_commit}` - Git HEAD at workflow start
- `{execution_mode}` - "tech-spec" or "direct"
- `{tech_spec_path}` - Tech-spec file (if Mode A)

From context:
- Mode A: Tasks and AC extracted from tech-spec
- Mode B: Tasks and AC from step-02 plan

---

## EXECUTION LOOP

### 0. Apply Boundaries Triple (story-spec v2 quick profile)

If Mode A and the spec contains a `## Boundaries` section, load it now and configure execution policy:

- **✅ Always Do** — execute these without prompting
- **⚠️ Ask First** — when about to perform any action listed here (or matching the pattern), HALT and ask user explicitly
- **🚫 Never Do** — refuse outright, even if instructed

Mode B (direct): apply project-baseline boundaries from `~/.claude/skills/bmad-shared/spec/boundaries-rule.md` (always-do baseline + project-level Ask-First / Never-Do triggers).

For each task:

### 1. Load Context

- Read files relevant to this task
- Review patterns from project context or observed code
- Understand dependencies

### 2. Implement

- Write code following existing patterns
- Handle errors appropriately
- Follow conventions observed in codebase
- Follow forbidden patterns from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (if exists)

### 3. Test

- Write tests if appropriate for the change
- Run existing tests to catch regressions
- Verify the specific AC for this task

### 4. Mark Complete

- Check off task
- Continue to next task immediately

---

## HALT CONDITIONS

**HALT and request guidance if:**
- 3 consecutive failures on same task
- Tests fail and fix is not obvious
- Blocking dependency discovered
- Ambiguity that requires user decision

**Do NOT halt for:**
- Minor issues that can be noted and continued
- Warnings that don't block functionality
- Style preferences (follow existing patterns)

---

## CONTINUOUS EXECUTION

**Critical:** Do not stop between tasks for approval.

- Execute all tasks in sequence
- Only halt for blocking issues
- Tests failing = fix before continuing
- Track all completed work for self-check

---

## NEXT STEP

When ALL tasks are complete (or halted on blocker), read fully and follow: `step-04-self-check.md`.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Execute Implementation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-04-self-check.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
