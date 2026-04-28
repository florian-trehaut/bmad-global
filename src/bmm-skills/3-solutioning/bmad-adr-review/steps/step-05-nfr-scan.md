---
nextStepFile: './step-06-present.md'
---

# Step 5: NFR Readiness Scan


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
CHK-STEP-05-ENTRY PASSED — entering Step 5: NFR Readiness Scan with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Perform a selective NFR readiness scan on the ADR. Check only the relevant NFR categories based on ADR topic. This is a lightweight scan — not a comprehensive NFR assessment.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- This is a lightweight pointer, not a deep assessment
- Flag gaps as observations — the user can run `bmad-nfr-assess` for depth
- Do not over-diagnose — only flag what is directly relevant to the ADR decision

### Step-Specific Rules:

- Load the NFR lite checklist — do not work from memory
- Select ONLY relevant categories per the auto-selection logic
- Do NOT scan all 29 criteria — that is `bmad-nfr-assess`'s job

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu

---

## MANDATORY SEQUENCE

### 1. Load NFR Lite Checklist

Read `./data/nfr-lite-checklist.md`.

### 2. Classify ADR Topic

Based on the ADR's context and decision, classify the topic:

| ADR Topic | Detection Method |
|-----------|-----------------|
| New service / microservice | Keywords: "new service", "microservice", "API", "endpoint" |
| Data pipeline / ETL | Keywords: "pipeline", "ETL", "data flow", "ingestion", "transformation" |
| Technology migration | Keywords: "migrate", "replace", "upgrade", "switch from" |
| Authentication / authorization | Keywords: "auth", "login", "permissions", "OAuth", "JWT" |
| API design / integration | Keywords: "API design", "contract", "integration", "REST", "gRPC" |
| Database / storage | Keywords: "database", "storage", "cache", "persistence" |
| Frontend / UI | Keywords: "frontend", "UI", "component", "rendering" |
| Infrastructure / cloud | Keywords: "infrastructure", "cloud", "deployment", "kubernetes" |
| Performance optimization | Keywords: "performance", "latency", "throughput", "optimization" |
| General / uncategorized | None of the above |

Store the detected topic and the selected categories from the auto-selection table.

### 3. Scan Selected Categories

For each selected category, check the ADR against the criteria listed in the checklist.

For each criterion, mark:
- **ADDRESSED**: The ADR explicitly discusses this aspect
- **GAP**: The ADR does not address this, and it is relevant to the decision
- **NOT_APPLICABLE**: The criterion is not relevant to this specific ADR

### 4. Generate NFR_READINESS Findings

For each GAP with direct relevance to the ADR decision:
- Security gap in a security-sensitive ADR → severity MAJOR
- Testability gap → severity MINOR
- Other NFR gaps → severity INFO

### 5. Present Scan Results

> **NFR Readiness Scan**
>
> **ADR topic detected:** {topic}
> **Categories scanned:** {list} ({N} of 8)
>
> | Category | Criteria | Addressed | Gaps | N/A |
> |----------|----------|-----------|------|-----|
> | {name} | {total} | {addressed} | {gaps} | {na} |
>
> {If gaps found:}
> **Gaps identified:**
> - [{category}] {criterion}: {what the ADR does not address}
>
> For comprehensive NFR evaluation, use `bmad-nfr-assess`.

### 6. Update WIP

Add step 5 to `stepsCompleted`. Store NFR scan results.

### 7. Present Menu

> **[C]** Continue to findings presentation (Step 6)

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- ADR topic correctly classified
- Only relevant categories scanned (not all 29)
- Gaps identified with relevance to the ADR decision
- Pointer to bmad-nfr-assess included

### FAILURE:

- Scanning all 29 criteria (scope creep)
- Generating findings for irrelevant categories
- Deep-diving into NFR assessment (that is bmad-nfr-assess's job)
- Not loading the data file (working from memory)

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: NFR Readiness Scan
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
