# Step 2: Create/Sync Projects and Issues, Assign to Cycle


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Create/Sync Projects and Issues, Assign to Cycle with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Create missing tracker projects (for epics) and issues (for stories), skip items that already exist, then interactively assign issues to the current cycle based on user choice.

## RULES

- Never create a Project or Issue that already exists — use the match mapping from Step 1
- Issues are created in Backlog state — cycle assignment is a separate decision
- Apply the tracker-crud protocol (`~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) for all tracker operations
- Log every action (created or skipped) for the final report
- When creating Issues, associate them with the correct Project (epic)

## SEQUENCE

### 1. Create missing Projects (Epics)

For each epic that has NO matching tracker project:

- Create Project in the tracker (using CRUD patterns from workflow-knowledge/project.md):
  - Operation: Create project
  - Name: epic title (e.g., "Epic 1: Campaign Management")
  - Team: {TRACKER_TEAM_ID}
  - Description: epic description from the source file (if available)
- Log: "Project created: {project_name} ({project_id})"
- Store the new project ID for issue association

For each epic that HAS a matching tracker project:
- Log: "Project exists: {project_name} ({project_id})"
- Use the existing project ID for issue association

### 2. Create missing Issues (Stories)

For each story that has NO matching tracker issue:

- Create Issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
  - Operation: Create issue
  - Title: story title (e.g., "Story 1.1: User Authentication")
  - Team: {TRACKER_TEAM_ID}
  - Project: the Project ID for this story's parent epic
  - Status: {TRACKER_STATES.backlog}
  - Description: story description from the source file (if available), including the story key (e.g., `Key: 1-1-user-authentication`)
- Log: "Issue created: {identifier} — {title}"
- Add to the list of newly created issues

For each story that HAS a matching tracker issue:
- Log: "Issue exists: {identifier} — {title} [{status}]"

### 3. CHECKPOINT — Cycle assignment

Present all issues (new and existing) grouped by Project to `{USER_NAME}` in `{COMMUNICATION_LANGUAGE}`:

```
## Attribution au Cycle

Cycle courant : {cycle_name}

### {Project 1 name}
{for each issue in project:}
- [{identifier}] {title} — {status} {NEW if just created}

### {Project 2 name}
{for each issue in project:}
- [{identifier}] {title} — {status} {NEW if just created}

---

Comment souhaitez-vous procéder ?

1. Assigner TOUTES les issues Backlog au cycle courant
2. Choisir les issues à assigner
3. Ne rien assigner (laisser en Backlog)
```

WAIT for user selection.

### 4. Execute cycle assignment

Based on user choice:

**Choice 1 — Assign all Backlog issues:**

For each issue in Backlog status:
- Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
  - Operation: Update issue
  - Issue: issue ID
  - Cycle: current cycle ID
- Log: "Assigned to cycle: {identifier} — {title}"
- Increment `issues_assigned` counter

**Choice 2 — User selects issues:**

Display a numbered list of all Backlog issues:
```
1. [{identifier}] {title}
2. [{identifier}] {title}
...
```

Ask: "Entrez les numeros des issues a assigner (ex: 1,3,5) :"

WAIT for user input.

For each selected issue:
- Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
  - Operation: Update issue
  - Issue: issue ID
  - Cycle: current cycle ID
- Log: "Assigned to cycle: {identifier} — {title}"
- Increment `issues_assigned` counter

**Choice 3 — Skip assignment:**

Log: "Cycle assignment skipped — all issues remain in Backlog"

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Create/Sync Projects and Issues, Assign to Cycle
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-report.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
