# Step 3: Investigate

## STEP GOAL

Investigate real source data and trace the complete flux through the system. This is the core investigation step. Use sub-agents for parallelization when beneficial.

## RULES

- REAL DATA MANDATORY — code analysis is NEVER a substitute for real data (provider files, DB queries, cloud logs)
- Load the generic investigation checklist from `../data/investigation-checklist.md`
- Load the project-specific investigation checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/investigation-checklist.md` (if exists) — extends the generic checklist
- Document ALL findings with file:line references and concrete evidence
- Every external dependency claim in the story must be verified against real systems, not assumed

## SEQUENCE

### 1. Load investigation checklists

Load the generic checklist:
```
Read ../data/investigation-checklist.md
```

Load the project-specific checklist (if exists):
```
Read {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/investigation-checklist.md
```

Combine both checklists. The project-specific one extends the generic — apply both.

### 2. Source data investigation

Based on the story's domain, go to the actual source and verify claims:

**If the story involves external provider data (catalog, orders, files, etc.):**
- Use the project's provider access skills (referenced in workflow-knowledge or project skills) to access real provider data
- Document: actual data format, fields present, sample records, edge cases observed
- Compare what the provider ACTUALLY sends vs what the story ASSUMES the provider sends

**If the story involves database operations:**
- Use the project's DB access skill (referenced in workflow-knowledge) to query real staging/production data
- Verify: table structures (actual columns, types, constraints), sample data (representative records), data volume (row counts), edge cases (NULL values, unexpected formats, outliers)
- Document findings with actual query results

**If the story involves cloud platform or deployed services:**
- Use cloud platform MCP tools or CLI to check:
  - Recent logs for the services involved
  - Error patterns, warnings
  - Current deployment configuration
  - Scheduler/cron jobs (if applicable)

### 3. Flux tracing

Starting from the source data, trace the complete chain through the codebase (read in the worktree):

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
3. Compare schema definition vs actual DB structure (from step 2)

### 4. Document the flux trace

Append to the intermediate file:

```markdown
## Flux Trace

### Entry Point
- File: `{service}/src/...` (line X)
- Mechanism: {cron/controller/event/etc.}
- Observations: ...

### Parsing / Transformation
- File: `{service}/src/...` (line X)
- Observations: ...

### Domain Logic
- Files: ...
- Business rules applied: ...
- Observations: ...

### Persistence
- Schema: `{service}/...`
- Tables: ...
- Observations: ...

### Output / API
- Endpoint: ...
- Observations: ...

### Infrastructure
- Config: `infra/...`
- CI/CD: relevant pipeline config
- Observations: ...
```

### 5. Impact analysis (ALWAYS execute)

For EACH function, type, or interface that the story modifies:

- [ ] **Inventory modifications** — list each function, method, type, interface that changes
- [ ] **Trace callers** — search the entire codebase (not just the modified service) for references
- [ ] **Verify compatibility** of each caller with the new behavior
- [ ] **Identify existing tests** that assert the old behavior (must be updated)
- [ ] **Cross-service contracts** — if a shared package or API contract changes, verify ALL consumers
- [ ] **Data consumers (indirect impact)** — if the story modifies what is WRITTEN to DB (value populated, format changed, new status), find ALL services/queries/exports that READ this data — even without a direct function call. Search the column name across the entire codebase.
- [ ] **Verdict** — for each caller or data consumer: COMPATIBLE / NEEDS_UPDATE / BREAKING with justification

If an impact requires changes not covered in the story, this becomes a finding (MAJOR or BLOCKER).

### 6. Proceed

Load and execute `./steps/step-04-external-research.md`.
