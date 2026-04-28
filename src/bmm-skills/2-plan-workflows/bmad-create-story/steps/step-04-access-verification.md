# Step 4: Access Verification


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "Discovery mode", "spec creation, pas review".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-03-EXIT emis dans la conversation)
- [ ] {SPEC_WORKTREE_PATH} en scope, worktree existe et est sur origin/main
- [ ] Mode (Discovery / Enrichment) determine et stable
- [ ] {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md a deja ete lu (sections #data-sources, #compliance-requirements, #observability-standards, #nfr-defaults, #security-baseline si v1.1+)

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Access Verification with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Verify access to all data sources needed for the spec investigation BEFORE writing any spec content. HALT if any REQUIRED source is inaccessible (unless the user grants explicit exemption).

This step ensures that the spec we are about to write will be backed by real evidence (Step 5 real-data investigation) and authoritative documentation (Step 6 external research) — not by code reading or assumptions.

## RULES

- Each check that fails on a REQUIRED source — HALT with a clear message and options
- NEVER bypass a failed check silently
- NEVER assume that access works without verifying it
- **Provider source = REAL DATA from the provider system (SFTP, FTP, API), not code analysis.** Reading the parser code tells you what the code EXPECTS — it does NOT tell you what the provider ACTUALLY sends.
- The only valid statuses for a required source are: **PASS** (access verified with real data), **FAIL** (HALT), **EXEMPTED** (explicit user exemption)
- NEVER invent intermediate statuses like "investigation via code" or "analysis in worktree" — these are evasions
- **BLOCKING GATE:** ALL required sources MUST be verified BEFORE proceeding to Step 5. Do NOT delegate provider access checks to background agents and continue — the verification result MUST be obtained and confirmed in the main flow BEFORE any investigation begins. If a provider check fails, HALT immediately — do NOT proceed with code analysis "while waiting" for provider access.
- **Discovery mode applies the same rule as Enrichment** — even when starting from scratch, if the story scope mentions a provider / DB / cloud, real-data access is mandatory.

## SEQUENCE

### 1. Identify required data sources

Based on the domain analysis (Step 2d in Discovery, Step 2e in Enrichment), build an access checklist — which sources are needed for THIS story:

```yaml
sources_needed:
  # Code & config (always needed)
  - type: worktree
    description: "Codebase on origin/main"
    check: "ls {SPEC_WORKTREE_PATH}"
    required: true

  # Database (if story involves data model, queries, or persistence)
  - type: database
    description: "Database on staging/production"
    check: "Verify proxy tunnel or connection is active"
    required: {true if story touches DB}

  # Provider sources (if story involves external data ingestion)
  - type: provider
    description: "Real provider data source (SFTP, FTP, API, etc.)"
    check: "Verify credentials and connectivity via the relevant project skill"
    required: {true if story involves provider data}

  # Cloud platform (if story involves infra, logging, or deployed behavior)
  - type: cloud_platform
    description: "Cloud platform logs and traces"
    check: "Verify CLI authentication"
    required: {true if story involves deployed services}

  # External documentation (always needed for Step 6)
  - type: web
    description: "External documentation and best practices"
    check: "WebSearch + WebFetch available"
    required: true
```

If `project.md#data-sources` exists (schema v1.1+), use it as the authoritative inventory of accessible resources for this project. Cross-reference each story dependency with the inventory.

### 2. Verify each required source

For each required source, execute the check:

**Worktree:**
```bash
ls {SPEC_WORKTREE_PATH}
```

**Database:**
- Use the project's DB access skill (referenced in workflow-knowledge or project skills) to verify connection
- Restart proxies/tunnels if applicable (existing ones may be stale)
- Test with a simple query (e.g., `SELECT 1;`)

**Provider sources:**
- Use the project's provider access skills (referenced in workflow-knowledge or project skills)
- Verify credentials and connectivity
- Provider access means REAL DATA access — not reading the parser code

**Cloud platform:**
- Verify the CLI / MCP is configured for the correct project/environment
- Check authentication is valid

**Web search:**
- Verify that WebSearch + WebFetch tools are available

### 3. Handle failures

For any REQUIRED source that fails:

HALT with the following:
```
Source {type} is inaccessible: {reason}

Options:
1. Fix the issue ({suggested_fix}) and re-run verification
2. Explicit exemption — continue without this source (spec sections backed by this source will be marked "unverified" or N/A with justification)
3. Abort the story creation
```

WAIT for user decision. Do NOT proceed without explicit instruction.

### 4. Record verified sources

Append to the intermediate spec working file:

```markdown
## Sources Verified (Step 4)

| Source | Type | Status | Notes |
|--------|------|--------|-------|
| Worktree | code | PASS | origin/main @ {commit_hash} |
| Database | database | PASS / FAIL / EXEMPTED | ... |
| {Provider} | provider | PASS / FAIL / EXEMPTED / N/A | ... |
| Cloud platform | cloud | PASS / FAIL / EXEMPTED / N/A | ... |
| Web search | documentation | PASS | ... |
```

### 5. Proceed

Load and execute `./step-05-real-data-investigation.md`.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Access Verification
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-05-real-data-investigation.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-05-real-data-investigation.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
