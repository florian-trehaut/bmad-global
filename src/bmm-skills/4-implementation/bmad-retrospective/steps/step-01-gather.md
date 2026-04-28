# Step 01: Gather Epic Data


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 01: Gather Epic Data with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Identify the completed epic/project for retrospective, load all issues with their statuses and metrics from the tracker, retrieve scope documents (PRD, architecture), and collect git history for the epic period.

## RULES

- All data must come from real tracker API calls — no fabrication
- Present the project list and let the user choose — never auto-select
- Gather ALL issues (use limit: 100), not just completed ones
- Read comments only on issues that were blocked or had significant status changes

## SEQUENCE

### 1. List available projects

List all epics/projects for the team to identify candidates for retrospective (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List epics/projects
- Team: {TRACKER_TEAM}

### 2. CHECKPOINT — Project selection

Present the list of projects to the user:

```
Rétrospective — Sélection du projet

Projets disponibles :
  1. {project_name} ({status})
  2. {project_name} ({status})
  ...

Pour quel projet (epic) voulez-vous faire la rétrospective ?
```

WAIT for user selection.

Store: `{PROJECT_NAME}`, `{PROJECT_ID}`, `{EPIC_SLUG}` (slugified project name).

### 3. Load all issues for the project

Fetch all issues associated with this project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Project: {PROJECT_NAME}
- Limit: 100

Compute and store the following metrics:

- **Total issues** — count of all issues
- **Issues by status** — breakdown (Done, In Progress, Backlog, Cancelled, etc.)
- **Completion rate** — Done / Total (excluding Cancelled)
- **Blocked issues** — issues that had Blocked status or labels

### 4. Load comments on key issues

For issues that were blocked, cancelled, or had labels indicating problems, read their comments to understand context (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List comments
- Issue: {issue_id}

Focus on:
- Blocked reasons and resolution
- Review feedback and iterations
- Scope change discussions

Store notable comments and their themes.

### 5. Load project documents from the tracker

Search for PRD, architecture, and other scope documents associated with the project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {PROJECT_ID}

Read the PRD and architecture documents if found — these define the original scope baseline for comparison.

### 6. Check git history

Run `git log --oneline --since="N months ago"` scoped to relevant paths or commit messages mentioning the epic name or issue prefixes. This provides:

- Number of commits and contributors
- Commit frequency patterns
- Files most frequently changed

### 7. Load previous retrospectives (optional)

Check if any previous retrospective documents exist in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {TRACKER_META_PROJECT_ID}

Look for documents titled `Retrospective: *`. If found, note recurring themes for comparison.

### 8. CHECKPOINT — Data summary

Present gathered data to the user:

```
Données collectées pour : {PROJECT_NAME}

- Issues totales : {N}
- Par statut : Done ({N}), In Progress ({N}), Backlog ({N}), Cancelled ({N})
- Issues bloquées : {N}
- Documents scope trouvés : {list}
- Commits git : {N}
- Rétrospectives précédentes : {N}

Prêt à analyser. Continuer ?
```

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 01: Gather Epic Data
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-analyze.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
