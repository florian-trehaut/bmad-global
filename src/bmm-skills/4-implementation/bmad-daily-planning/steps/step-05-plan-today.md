# Step 5: Plan Today


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Plan Today with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Classify issues, cross-reference with forge state, present the backlog to the user, suggest a point budget, and let the user select work for today. This is the core interactive step.

## RULES

- NEVER auto-select issues — the user decides what to work on
- Issues already In Progress should be highlighted (work started, should be continued)
- Unestimated issues are displayed but flagged — propose launching estimation agents if multiple are unestimated
- If velocity is unknown (first run), ask the user to set their own budget
- HALT and WAIT for user selection — do not proceed without explicit confirmation
- Cross-reference each issue with forge (branch exists? MR open? MR merged?) to show the real state — tracker status may be stale
- Classify issues as **quick-fix** (short description, no spec) vs **feature** (QuickSpec format with DoD/BAC/TAC/VM) to help the user organize their day

## SEQUENCE

### 1. Present the backlog table

Display all `BACKLOG_ISSUES` in a formatted table:

```
| # | ID | Title | Status | Points | Priority | Project |
|---|-----|-------|--------|--------|----------|---------|
```

Highlight issues that are In Progress with a marker (e.g., `►`).
Mark unestimated issues with `?` in the Points column.

### 2. Suggest a point budget

**If `AVG_VELOCITY` is available:**
```
Suggested budget: {AVG_VELOCITY} pts (based on {HISTORY_DAYS}-day average)
Plan accuracy so far: {accuracy}%
```

**If no velocity data:**
```
No velocity data yet — this is your first daily planning session.
How many points do you want to take today?
```

### 2b. Present Slack pending actions

If `SLACK_DISCUSSIONS` contains entries with `action_needed != null`:

```
Slack actions pending:
| # | Channel/DM | Action | With |
|---|------------|--------|------|
```

These are not tracker issues — present them as potential tasks the user may want to account for in today's plan. The user can:
- Include them as custom tasks (e.g., "add: Reply to @bastien about deployment")
- Ignore them (they'll still appear in the daily script blockers section)

### 3. CHECKPOINT

Ask the user:

"Which issues do you want to work on today? You can:
- List issue numbers from the table (e.g., 1, 3, 5)
- Set a different budget (e.g., 'budget 8')
- Add a custom task not in the tracker (e.g., 'add: Review PR for colleague')

What's your plan for today?"

WAIT for user confirmation.

### 4. Process the selection

Based on the user's response:
- Map selected numbers to `BACKLOG_ISSUES` entries
- Calculate total points of selected issues (unestimated = 0)
- Set `TODAY_BUDGET` to either the suggested budget or the user's override
- Store selected issues as `TODAY_ISSUES`

### 5. Confirm the plan

Display the confirmed plan:

```
Today's plan ({total_points} pts / {TODAY_BUDGET} pts budget):
  {list of selected issues with IDs, titles, and points}
```

If total exceeds budget: "Warning: you're {N} pts over budget."
If total is well under budget: "You have {N} pts of capacity remaining."

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Plan Today
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-06-generate-daily.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
