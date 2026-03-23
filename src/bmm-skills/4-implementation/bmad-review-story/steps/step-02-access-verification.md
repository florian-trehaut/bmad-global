# Step 2: Access Verification

## STEP GOAL

Verify access to all data sources needed for investigation. HALT if any REQUIRED source is inaccessible (unless the user grants explicit exemption).

## RULES

- Each check that fails on a REQUIRED source — HALT with a clear message and options
- NEVER bypass a failed check silently
- NEVER assume that access works without verifying it
- **Provider source = REAL DATA from the provider system (SFTP, FTP, API), not code analysis.** Reading the parser code tells you what the code EXPECTS — it does NOT tell you what the provider ACTUALLY sends.
- The only valid statuses for a required source are: **PASS** (access verified with real data), **FAIL** (HALT), **EXEMPTED** (explicit user exemption)
- NEVER invent intermediate statuses like "investigation via code" or "analysis in worktree" — these are evasions
- **BLOCKING GATE:** ALL required sources MUST be verified BEFORE proceeding to Step 3. Do NOT delegate provider access checks to background agents and continue — the verification result MUST be obtained and confirmed in the main flow BEFORE any investigation begins. If a provider check fails, HALT immediately — do NOT proceed with code analysis "while waiting" for provider access.

## SEQUENCE

### 1. Identify required data sources

Based on the domain analysis from Step 1, build an access checklist — which sources are needed for THIS story:

```yaml
sources_needed:
  # Code & config (always needed)
  - type: worktree
    description: "Codebase on origin/main"
    check: "ls {WORKTREE_PATH}"
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

  # External documentation (always needed)
  - type: web
    description: "External documentation and best practices"
    check: "WebSearch available"
    required: true
```

### 2. Verify each required source

For each required source, execute the check:

**Worktree:**
```bash
ls {WORKTREE_PATH}
```

**Database:**
- Use the project's DB access skill (from workflow-knowledge) to verify connection
- Restart proxies/tunnels if applicable (existing ones may be stale)
- Test with a simple query (e.g., `SELECT 1;`)

**Provider sources:**
- Use the project's provider access skills (from workflow-knowledge or project skills)
- Verify credentials and connectivity
- Provider access means REAL DATA access — not reading the parser code

**Cloud platform:**
- Verify the CLI is configured for the correct project/environment
- Check authentication is valid

**Web search:**
- Verify that WebSearch tool is available

### 3. Handle failures

For any REQUIRED source that fails:

HALT with the following:
```
Source {type} is inaccessible: {reason}

Options:
1. Fix the issue ({suggested_fix}) and re-run verification
2. Explicit exemption — continue without this source (findings from this axis will be marked "unverified")
3. Abort the review
```

WAIT for user decision. Do NOT proceed without explicit instruction.

### 4. Update intermediate file

Append verified sources list to the intermediate file:

```markdown
## Sources Verified

| Source | Type | Status | Notes |
|--------|------|--------|-------|
| Worktree | code | PASS | origin/main @ {commit_hash} |
| Database | database | PASS / FAIL / EXEMPTED | ... |
| {Provider} | provider | PASS / FAIL / EXEMPTED / N/A | ... |
| Cloud platform | cloud | PASS / FAIL / EXEMPTED / N/A | ... |
| Web search | documentation | PASS | ... |
```

### 5. Proceed

Load and execute `./steps/step-03-investigate.md`.
