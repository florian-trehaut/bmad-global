# Step 02: Validate Artifacts


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
CHK-STEP-02-ENTRY PASSED — entering Step 02: Validate Artifacts with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Execute an adversarial review of every loaded artifact. Check completeness of each document, validate requirements traceability (PRD requirements mapped to stories), and assess data model and API contract concreteness. Produce a classified list of findings.

## RULES

- Every finding must cite the specific artifact and section where the gap was found (or expected)
- Use the three-level classification: COMPLETE, PARTIAL, ABSTRACT
- ABSTRACT on any critical dimension = automatic NO-GO
- Missing artifact = ABSTRACT (worst classification)
- Do not invent content that is not in the documents — report what is actually there

## SEQUENCE

### 1. Validate PRD completeness

Check the PRD document for these expected sections. For each, classify as COMPLETE / PARTIAL / ABSTRACT:

| Section | What to look for |
|---------|-----------------|
| Problem statement | Clear problem definition with user impact |
| Target users | Defined personas or user segments |
| Requirements | Numbered or structured functional requirements |
| Domain data model | Business entities, relationships, data rules (not just "we use PostgreSQL") |
| Success metrics | Measurable KPIs or acceptance criteria at product level |
| Scope / Out of scope | Explicit boundaries of what is and is not included |
| Dependencies | External systems, APIs, or teams required |

Record findings for each section.

### 2. Validate Architecture completeness

Check the Architecture document for:

| Section | What to look for |
|---------|-----------------|
| System overview | Component diagram or service description |
| Database schemas | Concrete table definitions with columns, types, constraints, indexes — NOT just "PostgreSQL with snake_case" |
| API contracts | Endpoint definitions with HTTP methods, paths, request/response payloads, error codes — NOT just "REST API" |
| Infrastructure plan | Cloud resources (Terraform modules, secrets, SA, IAM bindings) — NOT just "deployed on GCP" |
| Migration plan | Migration sequence with dependencies, data vs schema-only migrations identified |
| Data mapping | DTO to Domain to DB mapping for end-to-end data flows |
| Security | Auth strategy, data encryption, access control |
| Non-functional requirements | Performance targets, SLAs, scalability approach |

Record findings for each section.

### 3. Validate UX Design (if applicable)

If the project has a UI component, check the UX document for:

| Section | What to look for |
|---------|-----------------|
| User flows | Step-by-step flows for key scenarios |
| Wireframes / Mockups | Visual representations or detailed descriptions |
| Edge cases | Error states, empty states, loading states |
| Accessibility | WCAG considerations or accessibility notes |

If no UX document exists and the project has no UI component, mark as N/A (not a gap).
If no UX document exists but the project has UI requirements in the PRD, mark as ABSTRACT (gap).

### 4. Validate requirements traceability

Map PRD requirements to stories:

For each requirement in the PRD:
1. Search for a matching story/issue that covers it
2. Check that the story has acceptance criteria that trace back to the requirement
3. Record: requirement ID/description -> story (if found) -> coverage assessment

Produce a traceability matrix:

```
Requirement | Story | Coverage
R1: {desc}  | {story_id}: {title} | COVERED / PARTIAL / NOT COVERED
R2: {desc}  | — | NOT COVERED
...
```

Flag any requirement with no corresponding story as a gap.

### 5. Validate story quality

For issues that have acceptance criteria, spot-check quality:
- Are ACs testable (specific, measurable)?
- Do ACs cover happy path AND error cases?
- Are ACs independent (not duplicating other stories)?

Flag stories with vague or untestable ACs (e.g., "it should work well", "good performance").

### 6. Compile findings

Organize all findings into a structured list:

**Classification per dimension:**

| Dimension | Classification | Key findings |
|-----------|---------------|--------------|
| PRD completeness | COMPLETE / PARTIAL / ABSTRACT | {summary} |
| Architecture completeness | COMPLETE / PARTIAL / ABSTRACT | {summary} |
| UX Design | COMPLETE / PARTIAL / ABSTRACT / N/A | {summary} |
| Data model concreteness | COMPLETE / PARTIAL / ABSTRACT | {summary} |
| API contracts | COMPLETE / PARTIAL / ABSTRACT | {summary} |
| Infrastructure plan | COMPLETE / PARTIAL / ABSTRACT | {summary} |
| Requirements traceability | COMPLETE / PARTIAL / ABSTRACT | {summary} |
| Story quality | COMPLETE / PARTIAL / ABSTRACT | {summary} |

**Determine verdict:**

- **GO** — All dimensions are COMPLETE (no PARTIAL, no ABSTRACT)
- **CONDITIONAL GO** — Some dimensions are PARTIAL but no ABSTRACT, and gaps are minor
- **NO-GO** — Any dimension is ABSTRACT, or a critical artifact (PRD, Architecture) is missing

Store `{VERDICT}` and `{GAPS}` (list of all PARTIAL and ABSTRACT findings with details).

### 7. CHECKPOINT

Present the validation summary and proposed verdict to the user:

```
Validation terminée — {PROJECT_NAME}

Verdict proposé: {VERDICT}

Dimensions COMPLETE: {list}
Dimensions PARTIAL: {list with details}
Dimensions ABSTRACT: {list with details}

Gaps bloquants: {count}
Gaps non-bloquants: {count}
```

WAIT for user confirmation or corrections to the verdict.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Validate Artifacts
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-report.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
