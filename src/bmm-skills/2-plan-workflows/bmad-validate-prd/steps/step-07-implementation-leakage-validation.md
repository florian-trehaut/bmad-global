---
nextStepFile: './step-08-domain-compliance-validation.md'
---

# Step 7: Implementation Leakage Validation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Implementation Leakage Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Ensure Functional Requirements and Non-Functional Requirements don't include implementation details -- they should specify WHAT, not HOW.

## RULES

- Focus ONLY on implementation leakage detection
- Distinguish capability-relevant terms from actual leakage
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform implementation leakage validation on this PRD:

**Scan for:**
1. Technology names (React, Vue, Angular, PostgreSQL, MongoDB, AWS, GCP, Azure, Docker, Kubernetes, etc.)
2. Library names (Redux, axios, lodash, Express, Django, Rails, Spring, etc.)
3. Data structures (JSON, XML, CSV) unless relevant to capability
4. Architecture patterns (MVC, microservices, serverless) unless business requirement
5. Protocol names (HTTP, REST, GraphQL, WebSockets) - check if capability-relevant

**For each term found:**
- Is this capability-relevant? (e.g., 'API consumers can access...' - API is capability)
- Or is this implementation detail? (e.g., 'React component for...' - implementation)

Document violations with line numbers and explanation.

Return structured findings with leakage counts and examples."

### 2. Direct Analysis (if Task tool unavailable)

If Task tool unavailable, perform analysis directly:

**Implementation leakage terms to scan for:**

**Frontend Frameworks:** React, Vue, Angular, Svelte, Solid, Next.js, Nuxt, etc.

**Backend Frameworks:** Express, Django, Rails, Spring, Laravel, FastAPI, etc.

**Databases:** PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Cassandra, etc.

**Cloud Platforms:** AWS, GCP, Azure, Cloudflare, Vercel, Netlify, etc.

**Infrastructure:** Docker, Kubernetes, Terraform, Ansible, etc.

**Libraries:** Redux, Zustand, axios, fetch, lodash, jQuery, etc.

**Data Formats:** JSON, XML, YAML, CSV (unless capability-relevant)

**For each term found in FRs/NFRs:**
- Determine if it's capability-relevant or implementation leakage
- Example: "API consumers can access data via REST endpoints" - API/REST is capability
- Example: "React components fetch data using Redux" - implementation leakage

Count violations and note line numbers.

### 3. Tally Implementation Leakage

By category:
- Frontend framework leakage: count
- Backend framework leakage: count
- Database leakage: count
- Cloud platform leakage: count
- Infrastructure leakage: count
- Library leakage: count
- Other implementation details: count

**Total implementation leakage violations:** sum

### 4. Report Implementation Leakage Findings to Validation Report

Append to validation report:

```markdown
## Implementation Leakage Validation

### Leakage by Category

**Frontend Frameworks:** {count} violations
{If violations, list examples with line numbers}

**Backend Frameworks:** {count} violations
{If violations, list examples with line numbers}

**Databases:** {count} violations
{If violations, list examples with line numbers}

**Cloud Platforms:** {count} violations
{If violations, list examples with line numbers}

**Infrastructure:** {count} violations
{If violations, list examples with line numbers}

**Libraries:** {count} violations
{If violations, list examples with line numbers}

**Other Implementation Details:** {count} violations
{If violations, list examples with line numbers}

### Summary

**Total Implementation Leakage Violations:** {total}

**Severity:** [Critical if >5 violations, Warning if 2-5, Pass if <2]

**Recommendation:**
[If Critical] "Extensive implementation leakage found. Requirements specify HOW instead of WHAT. Remove all implementation details - these belong in architecture, not PRD."
[If Warning] "Some implementation leakage detected. Review violations and remove implementation details from requirements."
[If Pass] "No significant implementation leakage found. Requirements properly specify WHAT without HOW."

**Note:** API consumers, GraphQL (when required), and other capability-relevant terms are acceptable when they describe WHAT the system must do, not HOW to build it.
```

### 5. Display Progress and Auto-Proceed

Display: "**Implementation Leakage Validation Complete**

Total Violations: {count} ({severity})

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Implementation Leakage Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
