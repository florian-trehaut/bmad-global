# Step 3: Load Personal Backlog


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Load Personal Backlog with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Load all non-completed issues relevant to the user from the tracker — assigned, created, AND unassigned team issues that may be intended for the user. This becomes the pool of work available for today's planning.

## RULES

- Include ALL non-Done statuses (Backlog, Todo, In Progress, In Review, etc.)
- Include issues assigned to the user AND issues created by the user (some may not be self-assigned)
- **Also query unassigned issues** (assignee = null) — present them separately so the user can claim the ones that are for them
- Flag issues that are already In Progress — they should be prioritized (work already started)
- Flag issues without point estimates as "unestimated"
- Sort by: In Progress first, then by priority, then by creation date

## SEQUENCE

### 1. Query tracker for assigned issues

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Filter: assigned to `"me"` (authenticated user — NOT `{USER_NAME}` which may not match the tracker's user lookup)
- Filter: status NOT in ["Done", "Cancelled", "Duplicate"]

### 2. Query tracker for created issues

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Filter: created by `"me"` (authenticated user)
- Filter: status NOT in ["Done", "Cancelled", "Duplicate"]

### 3. Query tracker for unassigned issues

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- List issues for team `{TRACKER_TEAM}`
- Filter: assignee = null (no one assigned)
- Filter: status NOT in ["Done", "Cancelled", "Duplicate"]

Store separately as `UNASSIGNED_ISSUES`. These will be presented to the user so they can claim any that are intended for them.

### 4. Merge and deduplicate

Combine assigned + created lists. Remove duplicates (same issue ID). Store as `BACKLOG_ISSUES`.
Keep `UNASSIGNED_ISSUES` separate — they are presented as a "triage" section in the planning step.

For each issue, capture:
- `id` (e.g., PRJ-123)
- `title`
- `status` (Backlog, Todo, In Progress, In Review)
- `points` (estimate — null if unestimated)
- `priority` (Urgent, High, Medium, Low, None)
- `project` / `epic` (parent grouping, if available)

### 5. Sort and classify

Sort `BACKLOG_ISSUES`:
1. **In Progress** first (work already started — must be continued or resolved)
2. **In Review** second (may need rework or follow-up)
3. **Todo** (ready to start)
4. **Backlog** (not yet prioritized)

Within each group, sort by priority (Urgent > High > Medium > Low > None).

### 6. Present backlog summary

Display:

```
Personal backlog: {count} issues ({estimated_points} pts estimated, {unestimated_count} unestimated)
  In Progress: {count}
  In Review: {count}
  Todo: {count}
  Backlog: {count}
```

If `UNASSIGNED_ISSUES` is non-empty, present them in a separate section:

```
Unassigned team issues ({count}): — any of these for you?
  {list with ID, title, creator, priority}
```

The user can claim issues (they get assigned via tracker) or skip.

If the backlog is empty (0 issues): "No open issues found. Either everything is done or issues may not be assigned to you. You can still plan your day with untracked work."

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Load Personal Backlog
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-04-velocity.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
