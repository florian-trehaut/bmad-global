# Step 3: Calculate Velocity


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
CHK-STEP-04-ENTRY PASSED — entering Step 3: Calculate Velocity with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Calculate the user's average daily velocity from past daily-log files. This informs the point budget suggestion in step 4.

## RULES

- Velocity is calculated ONLY from `{MAIN_PROJECT_ROOT}/.claude/daily-log/*.md` files — never from tracker history
- Only days with `velocity_actual > 0` contribute to the average (days with no completions are excluded, not counted as zero)
- If no daily-logs exist (first usage), skip calculation — velocity will be unknown
- Display the trend if enough data points exist (last 5 days)

## SEQUENCE

### 1. Load daily-log files

Read `../data/daily-log-format.md` to understand the file structure.

List all files in `{MAIN_PROJECT_ROOT}/.claude/daily-log/` at the project root. Sort by filename (= date) descending.

**If no files exist:** set `AVG_VELOCITY = null`, `HISTORY_DAYS = 0`. Skip to step 5.

### 2. Parse daily-log data

For each daily-log file, extract from the YAML frontmatter:
- `date`
- `velocity_planned` (budget_points)
- `velocity_actual` (sum of completed points)
- `completed_issues` count

Only include files where `velocity_actual` is present and > 0.

### 3. Calculate average velocity

```
AVG_VELOCITY = sum(velocity_actual for qualifying days) / count(qualifying days)
HISTORY_DAYS = count(qualifying days)
```

Round to 1 decimal place.

### 4. Calculate trend (if >= 5 data points)

If `HISTORY_DAYS >= 5`:
- Take the last 5 qualifying days
- Calculate the moving average of velocity_actual
- Determine trend: increasing / stable / decreasing

### 5. Present velocity

**If no history:**
```
Velocity: no data yet (first daily planning session)
You will need to set your budget manually.
```

**If history exists:**
```
Velocity: {AVG_VELOCITY} pts/day (based on {HISTORY_DAYS} days)
  Last 5 days: {list of velocity_actual values}
  Trend: {increasing / stable / decreasing}
  Plan accuracy: {avg(velocity_actual / velocity_planned) * 100}%
```

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 3: Calculate Velocity
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-05-plan-today.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
