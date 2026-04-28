# Step 5: Real-Data Investigation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "Discovery, on n'a pas encore les donnees", "le code suffit pour ecrire la spec", "on verifiera en review-story".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-04-EXIT emis dans la conversation)
- [ ] Sources verifiees PASS / EXEMPTED dans Step 4
- [ ] {SPEC_WORKTREE_PATH} en scope
- [ ] Outils d'acces (DB skill, provider skill, cloud CLI/MCP) deja chargees ou referencees

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Real-Data Investigation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Investigate real source data and trace the complete flux through the system BEFORE writing the spec. This is the **evidence layer** that will inform every assumption made in Steps 7-11. Without it, the spec is built on hopes; with it, the spec is built on facts.

Use sub-agents for parallelization when beneficial.

## RULES

- **REAL DATA MANDATORY** — code analysis is NEVER a substitute for real data (provider files, DB queries, cloud logs). See `bmad-shared/no-fallback-no-false-data.md` and `bmad-shared/evidence-based-debugging.md`.
- Load the generic investigation checklist from `../data/investigation-checklist.md` (skill-internal)
- Load the project-specific investigation checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md#investigation-checklist` (if exists) — extends the generic checklist
- Document ALL findings with file:line references and concrete evidence
- Every external dependency claim that will appear in the spec MUST be backed by real-system evidence here
- **Discovery mode** — even when the spec is being created from scratch, if the scope mentions a provider, an existing DB table, or a deployed service, the real data MUST be inspected
- **Output format** — follow `bmad-shared/data/real-data-findings-template.md`

## SEQUENCE

### 1. Load investigation checklists

Load the generic checklist:

```
Read ../data/investigation-checklist.md
```

Load the project-specific checklist (if exists):

```
Read {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md (extract #investigation-checklist section)
```

Combine both checklists. The project-specific one extends the generic — apply both.

### 2. Source data investigation

Based on the story's domain, go to the actual source and verify what reality looks like:

**If the story involves external provider data (catalog, orders, files, etc.):**
- Use the project's provider access skills (referenced in workflow-knowledge or project skills) to access real provider data
- Document: actual data format, fields present, sample records (anonymised if needed), edge cases observed
- Compare what the provider ACTUALLY sends vs what we ASSUME the provider sends

**If the story involves database operations:**
- Use the project's DB access skill (referenced in workflow-knowledge) to query real staging/production data
- Verify: table structures (actual columns, types, constraints), sample data (representative records), data volume (row counts), edge cases (NULL values, unexpected formats, outliers, undocumented enum values)
- Document findings with actual query results

**If the story involves cloud platform or deployed services:**
- Use cloud platform MCP tools or CLI to check:
  - Recent logs for the services involved
  - Error patterns, warnings
  - Current deployment configuration
  - Scheduler/cron jobs (if applicable)

### 3. Flux tracing (informs Steps 7-9 of this workflow)

Starting from the source data, trace the complete chain through the codebase (read in `{SPEC_WORKTREE_PATH}`):

**Code layer:**
1. **Entry point** — how does data enter the system? (controller, cron, event handler, scheduled job, file poll)
2. **Parsing/transformation** — how is raw data parsed? What validation exists?
3. **Domain logic** — what business rules are applied?
4. **Persistence** — how is data stored? Which tables, which columns?
5. **Output** — how is data exposed? (API endpoints, events, exports, notifications)

**Infrastructure layer:**
1. Cloud/container config, env vars, secrets
2. CI/CD deployment pipeline, migrations, health checks
3. Object storage (if applicable)

**Data model layer:**
1. Schema files (ORM schema definitions)
2. Migrations (actual SQL migration files are the source of truth, NOT schema files)
3. Compare schema definition vs actual DB structure (from step 2 above)

### 4. Document the findings

Append to the intermediate spec working file, following `bmad-shared/data/real-data-findings-template.md`:

```markdown
## Real-Data Findings (Step 5)

### Sources investigated

| Source | Type | Access Method | Sample Size | Date |
| ------ | ---- | ------------- | ----------- | ---- |

### Provider Findings — {Provider X}
{actual format observed, field-level table, edge cases}

### Database Findings — {table}
{schema vs actual data, queries executed, volume}

### Cloud Log Findings — {service}
{patterns observed, error frequency, sample lines}

### Flux Trace
{Entry → Parsing → Domain → Persistence → Output}

### Spec Assumptions vs Reality

| # | Story assumption | Reality | Verdict |
| - | ---------------- | ------- | ------- |
| 1 | {claim}          | {data}  | VERIFIED / INVALIDATED / INCONCLUSIVE |
```

### 5. Impact analysis (ALWAYS execute when story modifies existing code)

For EACH function, type, or interface that the story will modify (per the working scope from Step 2):

- [ ] **Inventory modifications** — list each function, method, type, interface that will change
- [ ] **Trace callers** — search the entire codebase for references
- [ ] **Verify compatibility** of each caller with the planned new behaviour
- [ ] **Identify existing tests** that assert the old behaviour (must be updated)
- [ ] **Cross-service contracts** — if a shared package or API contract changes, verify ALL consumers
- [ ] **Data consumers (indirect impact)** — if the story modifies what is WRITTEN to DB (value populated, format changed, new status), find ALL services/queries/exports that READ this data — even without a direct function call. Search the column name across the entire codebase.
- [ ] **Verdict** — for each caller or data consumer: COMPATIBLE / NEEDS_UPDATE / BREAKING with justification

If an impact requires changes not yet planned, this becomes either a Risk (if uncertain) or a Task (if certain) — to be recorded in Step 11.

### 6. Determine assumptions outcome

For every UNVERIFIED assumption noted in Step 2 (Discovery / Enrichment):

- If verified by real data here → mark VERIFIED in Risks/Assumptions Register (Step 11)
- If invalidated → trigger story scope revision (back to Step 2 if necessary)
- If still inconclusive → convert to RISK with mitigation plan (Step 11)

### 7. Proceed

Load and execute `./step-06-external-research.md`.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Real-Data Investigation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-06-external-research.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-06-external-research.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
