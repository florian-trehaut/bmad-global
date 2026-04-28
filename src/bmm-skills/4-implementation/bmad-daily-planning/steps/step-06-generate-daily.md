# Step 6: Generate Daily Script


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Generate Daily Script with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate a plain-text daily standup script ready to be copy-pasted into Slack, Teams, or read aloud at the daily meeting.

## RULES

- Output must be **plain text** — no markdown formatting (no `##`, no `**`, no backticks)
- Use `{COMMUNICATION_LANGUAGE}` for all labels and headers
- Blockers are detected from tracker issue labels/status (blocked) — if none found, show "None"/"Aucun"
- Keep each line concise — issue ID + short title + points
- The script should be self-contained and ready to use without editing

## SEQUENCE

### 1. Load the daily script template

Read `../templates/daily-script-template.md` for the output format reference.

### 2. Build the "Yesterday" section

From `YESTERDAY_COMMITS` and `YESTERDAY_ISSUES`:

- For each completed issue: `• {ISSUE_PREFIX}-{ID} — {title} ({points} pts) ✓`
- For commits not linked to any issue: `• {commit message} (no ticket)`
- Group by issue when possible — don't list both the issue and its commits separately

### 3. Build the "Today" section

From `TODAY_ISSUES`:

- For each planned issue: `• {ISSUE_PREFIX}-{ID} — {title} ({points} pts)`
- For unestimated issues: `• {ISSUE_PREFIX}-{ID} — {title} (? pts)`
- Add the budget line: `Budget: {TODAY_BUDGET} pts (average: {AVG_VELOCITY} pts/day)` or `Budget: {TODAY_BUDGET} pts (first session)` if no velocity

### 3b. Build the "Slack Actions" section

If `SLACK_DISCUSSIONS` contains entries with `action_needed != null`:

```
Slack Actions:
  • #{channel_name}: {action_detail} (with @participant)
  • DM @participant: {action_detail}
```

If no pending Slack actions: omit this section entirely (do not display an empty section).

### 4. Build the "Blockers" section

Check `BACKLOG_ISSUES` for any issues with:
- Status containing "blocked" or similar
- Priority "Urgent" that are not selected for today (might indicate something stuck)

If blockers found: list them. If none: "None" / "Aucun" (per `{COMMUNICATION_LANGUAGE}`).

### 5. Assemble and store

Combine all sections into `DAILY_SCRIPT` following the template format.

Display the complete script to the user:

```
--- DAILY SCRIPT (copy-paste ready) ---

{DAILY_SCRIPT}

--- END ---
```

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Generate Daily Script
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-07-persist.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
