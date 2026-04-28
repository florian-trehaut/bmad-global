# Step 2: Preflight


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Preflight with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Verify that all access to the target environment is operational before starting validation. Each check is a hard gate — HALT at the first failure.

## RULES

- Each check that fails — HALT with a clear message and corrective action
- NEVER bypass a failed check
- NEVER assume that access works without verifying it
- NEVER fabricate URLs — discover them dynamically from the cloud platform or environment config
- If the project has DB proxy requirements (from the environments-lookup protocol (`~/.claude/skills/bmad-shared/protocols/environments-lookup.md`)), always restart proxies at the start of a session

## SEQUENCE

### 1. Load environment configuration

Extract from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION): the parameters for `{ENVIRONMENT}`.

If no environments section exists in project.md (per environments-lookup protocol), proceed with dynamic discovery only (steps 2-3).

### 2. Check cloud platform access

Verify that the CLI tools for the project's cloud platform are configured for the target environment.

**Discovery approach (adapt to the project's cloud platform):**
- Check which cloud CLI is available (gcloud, aws, az, etc.)
- Verify the active project/account matches the target environment
- If the environments-lookup protocol (`~/.claude/skills/bmad-shared/protocols/environments-lookup.md`) specifies a project name, verify it matches

**If failed:**
HALT: "Cloud platform access is not configured for {ENVIRONMENT}. Action: configure the CLI for the correct project/account."

### 3. Discover real URLs (MANDATORY)

**NEVER use hardcoded URLs without verification.** Always execute discovery.

Use the methods appropriate to the project's infrastructure:
- Load balancer / ingress rules — custom domains (priority)
- Cloud platform service listing — direct service URLs (fallback)
- Environment-config.md — pre-configured URLs (reference)

**Build the final URL mapping** for each service relevant to the VM items:
1. If a custom domain exists via load balancer/ingress — use it
2. If a direct service URL exists and is active — use it as fallback
3. If neither — HALT: "Service {name} is not accessible"

**Note:** Cloud platform service names may differ from application service names. Cross-reference via the environments-lookup protocol (`~/.claude/skills/bmad-shared/protocols/environments-lookup.md`) if available.

### 4. Verify database access (if needed by VM items)

If any VM item requires DB verification:

- Load DB connection config from the environments-lookup protocol (`~/.claude/skills/bmad-shared/protocols/environments-lookup.md`) (or project's DB access skill)
- Restart database proxies/tunnels if applicable (existing ones may be stale)
- Test each required database connection with a simple query (e.g., `SELECT 1;`)
- Follow the project's established DB access skill for credentials discovery

**If failed:**
HALT: "Database connection failed for {db_name}. Action: verify authentication and restart the connection proxy/tunnel."

### 5. Check API Health

For each service identified in step 3 and relevant to the VM items:

```bash
curl -s -o /dev/null -w "%{http_code}" {url}{health_check_path}
```

Verify that the status code is 200 (or the expected healthy status).

**If failed:**
HALT: "Service {service_name} is not accessible on {ENVIRONMENT} ({url}). Status: {status_code}."

### 6. Preflight Summary

Display a summary table:

```
Preflight — {ENVIRONMENT}
+------------------------------+--------+------------------------------------------+
| Check                        | Status | URL/Details                              |
+------------------------------+--------+------------------------------------------+
| Cloud platform project       | ok/err | {project}                                |
| API: {service_1}             | ok/err | https://...                              |
| API: {service_2}             | ok/err | https://...                              |
| DB: {db_name}                | ok/err | port {port}, user {user}                 |
+------------------------------+--------+------------------------------------------+
```

"All access verified. Launching validation."

### 7. Proceed

Load and execute `./steps/step-04-validate.md`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Preflight
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
