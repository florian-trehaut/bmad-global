# Step 9: Publish to Tracker


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: Publish to Tracker with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Run the **Business Comprehension Gate** (both modes) — a hard gate that forces the user to actively confirm the critical business decisions encoded in the spec, decision by decision. Then create a new tracker issue (Discovery mode) or update an existing issue (Enrichment mode) with the composed description, and add a readiness comment.

## RULES

- FORBIDDEN: modifying spec content during PUBLICATION (gate-driven edits in PART 0 are allowed and required)
- FORBIDDEN: silently falling back to local file if tracker fails — HALT on failure
- FORBIDDEN: skipping or batching the Comprehension Gate. There is no "[S] Skip", no "Y to all" shortcut. Each item must be individually processed.
- The workflow NEVER sets state to 'Done'. Maximum state is Todo.

## SEQUENCE

### PART 0 — Business Comprehension Gate (BOTH MODES, MANDATORY)

**Purpose:** Counter the "vibe coding" failure mode where the user reflexively approves an LLM-generated spec and discovers post-merge that what was built does not match the business intent. Per Microsoft Research 2025 (Lee et al.) and the cognitive-friction literature, passive approval ("looks good ✓") produces compliance theater without genuine engagement. The gate replaces that with item-level active confirmation.

**Hard gate semantics:** Tracker writes (Discovery `D*` or Enrichment `E*`) MUST NOT execute until every distilled item below has been individually confirmed (Y), rejected (N), or elaborated (?).

#### 0.1 Distill 3 to 5 critical business decisions

Scan the composed spec from Step 7. Select between **3 and 5** items maximizing both:

- **Severity if misunderstood** — items where a wrong assumption produces incident, regression, compliance breach, irreversible state, or wasted dev cycles.
- **Likelihood of implicit/explicit divergence** — items where the spec encodes a choice the user might not have explicitly thought through, or where the LLM's natural-language phrasing could have drifted from the user's mental model.

Prioritized candidate sources (in order):

1. **Status / enum / mapping decisions with unknown handling** — every place the spec says "throw on unknown" or "fallback to default" (zero-fallback rule from `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`).
2. **External dependencies marked Blocking** — gates on partners, legal, compliance, third-party APIs.
3. **Out-of-scope frontiers** — what the spec explicitly EXCLUDES that an outside reader might assume is in.
4. **BACs with non-trivial business logic** — anything beyond CRUD page renders; especially conditional flows, time/date handling, money, multi-actor permissions, regulatory constraints.
5. **Irreversible operations** — data deletion, money transfer, contract emission, notification dispatch to end users.
6. **Migration / data transformation rules** — name-matching, slug-matching, environment-dependent WHERE clauses (per the mandatory guardrail #2 from Step 7).
7. **Concurrency / null-safety candidate ACs accepted in Step 7.4b** — these often encode invisible runtime contracts.

Pick the **3-5 most critical** by combining both dimensions. Fewer than 3 → still pick at least 3 (use lower-priority categories). More than 5 → split: present the most critical 5 now, queue the rest for a follow-up gate iteration.

#### 0.2 Present each item as Active Confirmation

For each distilled item, present in this exact format:

```
[N/TOTAL] Decision metier : "{One-sentence statement of the business decision in domain language, NOT in code terms}"
          Implication concrete : "{One-sentence consequence in production: what happens / what breaks / what the user observes if this decision plays out as written}"
          Trace : {BAC-X, VM-Y, Guardrail-Z, External Dep #N — list the spec elements that encode this}
          [Y] Conforme a mon intention   [N] A rediscuter   [?] Donne-moi un exemple concret
```

**HALT and wait** for user response on each item before moving to the next. Do not present all 5 at once.

#### 0.3 Handle responses

- **Y**: log the confirmation in conversation memory (no tracker write at this stage), advance to next item.

- **?**: produce ONE concrete fictional but plausible example illustrating the decision in action (e.g., "Le client Acme essaie de commander apres expiration de leur abonnement le 28/04/2026 a 14h32 — le systeme renvoie HTTP 402 et n'envoie PAS l'email de confirmation"). Then re-present the same item with [Y] / [N] choices. Loop ? at most twice per item — third time on `?`, force a Y/N by stating: "On a fait deux exemples — il faut maintenant trancher : Y ou N."

- **N**: ask "Qu'est-ce qui ne correspond pas a ton intention ?". Capture the divergence. Then:
  - **Discovery mode**: edit the relevant spec element inline (BAC, VM, guardrail, dependency entry) per the user's correction. Re-distill the item. Re-present.
  - **Enrichment mode**: same — edit the composed description inline. Re-distill. Re-present.
  - If the divergence requires re-doing investigation or modeling (Steps 4-5), stop the gate and HALT with a clear message: "Cette divergence demande une re-investigation. Je propose de retourner a Step 4 (investigate) avant de republier. Confirmes-tu ?"

#### 0.4 Gate exit

When all items have a Y status:

```
Gate metier : OK
- N items confirmes
- M items modifies via [N] (re-traites)
- K elaborations [?] consommees

On peut publier.
```

Proceed to the appropriate mode path below. Do NOT log the confirmation list in the tracker (per project decision — confirmations are conversational only).

If at any point the user explicitly says "stop" or "abandonne" → HALT and exit the workflow without publishing. The spec stays unpublished; the user can resume later by re-invoking the workflow.

---

### Discovery Mode Path

#### D1. Determine Issue Placement

Quick-spec creates **exactly one story** — which may be placed within an existing epic or left standalone.

Check if a `RELATED_EPIC` was identified in Step 2d.

**If related epic found:** use that epic for the story.

**If no related epic:**

Ask user:

> No epic identified. Options:
> 1. Create the story standalone (no epic)
> 2. Attach to an existing epic (I'll list them)
>
> Choice?

WAIT for user choice.

**File-based tracker (`{TRACKER}` == `file`):**

- IF 1: Write story file to `{TRACKER_STORY_LOCATION}/` with prefix `standalone-{slug}.md`
- IF 2: Read `{TRACKER_EPICS_FILE}`, present epic list, let user pick. Write story file with `{epic_number}-{next_story_number}-{slug}.md`

**MCP-based tracker:**

- IF 1: Set project to null, proceed
- IF 2: List epics/projects for team {TRACKER_TEAM}, let user pick, proceed

#### D2. Determine Priority

- bug → 2 (High) by default
- task/improvement → 3 (Normal) by default

Ask user to confirm or adjust.

#### D3. Determine Labels

- Type label: "Bug", "Task", "Improvement", "Feature"
- Client label if applicable (using the label prefix from `workflow-context.md`)

#### D4. Create the Tracker Issue

Create the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):

- Operation: Create issue
- Title: {title}
- Team: {TRACKER_TEAM}
- Description: {composed_description}
- Priority: {priority}
- Labels: {labels}
- Project: {project_name_if_any}
- Status: {TRACKER_STATES.todo}
- Estimate: {estimate}

Store: `NEW_ISSUE_ID`, `NEW_ISSUE_IDENTIFIER`.

**If issue creation fails:** HALT — report error. Do NOT fallback to local file.

### Enrichment Mode Path

#### E1. Update Issue Description

1. Update the issue description in the tracker — Operation: Update issue, Issue: {ISSUE_ID}, Field: description, Value: enriched_description
2. Update the issue estimate — Operation: Update issue, Issue: {ISSUE_ID}, Field: estimate, Value: {estimate}
3. If the update fails due to size, try splitting: update description first, then add details as a comment

#### E2. Update Issue Status to Todo

Update the issue status — Operation: Update issue, Issue: {ISSUE_ID}, Status: {TRACKER_STATES.todo}

#### E3. Add Readiness Comment

Add a comment confirming the issue is ready (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):

- Operation: Create comment
- Issue: {ISSUE_ID}
- Body: "Issue description enriched with tasks, guardrails, and technical requirements.\n\nRappel flux: Todo -> In Progress -> In Review -> To Test -> Done\n- Apres merge + deploy: la story passe en To Test\n- Les tests de Validation Metier doivent etre executes sur l'environnement cible (staging/production)\n- Done = validation metier OK (jamais automatique)\n\nReady for development."

#### E4. Check Epic Project Status

If this is the first story in the epic (no completed stories found in step 02e), check if the Project status in the tracker needs updating.

### Both Modes — Report Completion

Present the completion report:

```
## Story {created_or_enriched}

- Issue : {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
- Epic : {PROJECT_NAME or "Standalone"}
- Statut tracker : Todo
- Estimation : {estimate} points

### Contenu

- Acceptance Criteria : {N} BACs + {N} TACs
- Taches : {N} applicatives + {N} CI/CD & infra
- Guardrails : {N}
- Tests Validation Metier : {N}
- Fichiers attendus : {N}

### Issue Lifecycle

Todo -> In Progress -> In Review -> To Test -> Done

- After merge + deploy: the story moves to To Test
- Validation Metier tests must execute on the target environment
- Done = validation metier OK (never automatic)

### Prochaine etape

Lancez le workflow dev-story pour commencer l'implementation,
ou le workflow review-story pour une revue adversariale avant dev.
```

---

## STEP EXIT (CHK-STEP-09-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-09-EXIT PASSED — completed Step 9: Publish to Tracker
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-10-cleanup.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
