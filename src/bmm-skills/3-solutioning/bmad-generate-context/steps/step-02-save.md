# Step 02: Compile and Save to the Tracker


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 02: Compile and Save to the Tracker with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Compile all scan findings into a lean project-context.md document optimized for LLM consumption, then persist it as a tracker document in the Meta Project.

## RULES

- HALT on tracker write failure — never silently fallback
- Document must be lean — optimize for signal-to-noise ratio
- Check for existing document before creating (update if exists)
- Structure must be scannable — headers, tables, bullet points over prose

## SEQUENCE

### 1. Compile project-context.md

Structure the document as follows:

```markdown
# Project Context — {PROJECT_NAME}

Generated: {current_date}

## Stack Overview

{Table: service | framework | ORM | DB | port}

## Architecture

{Layer structure, DI patterns, domain modeling approach}

## Conventions

{Import style, naming, file organization, formatting deviations}

## Test Architecture

{Table: type | framework | suffix | location | run command}

## Shared Code

{Packages, libs, cross-cutting concerns}

## Gotchas

{Numbered list of non-obvious things that would trip up an LLM}

## Reference vs Legacy

{What to copy patterns from, what to avoid}
```

Apply user corrections from the checkpoint if any were given.

### 2. Check for existing document in the tracker

Search for an existing "Project Context" document in the Meta Project:

List documents in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {TRACKER_META_PROJECT_ID}

Look for a document titled `Project Context`.

### 3. Save or update the document

If a matching document exists, update it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update document
- Document: existing_doc_id
- Content: compiled_content

If no matching document, create it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: "Project Context"
- Project: {TRACKER_META_PROJECT}
- Content: compiled_content

If the tracker write fails: **HALT** — report the error to the user. The compiled content is still available in the conversation.

### 4. Report completion

Present:

```
Project Context generated and published

- Tracker document: Project Context
- Sections: {N} sections
- Gotchas: {N} items documented
- Services covered: {N}
```

---

## END OF WORKFLOW

The bmad-generate-context workflow is complete.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Compile and Save to the Tracker
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-generate-context executed end-to-end:
  steps_executed: ['01', '02']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
