---
nextStepFile: './step-04-nfr-security-obs.md'
---

# Step 3: Model — Domain, Data Flow, API Contracts

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-02-EXIT emis dans la conversation
- [ ] Variables en scope: CODEBASE_PATTERNS, REFERENCE_PATTERNS, ARCHITECTURAL_DECISIONS

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Model with SLUG={slug}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Build the Data Model, Data Flow, API Contracts, and Infrastructure sections. For features with no data/API/infra impact, write `N/A — {1-line justification}` per section.

## MANDATORY SEQUENCE

### 1. Data Model

Identify data entities created, modified, or read. Document:
- Schema delta (new fields, renamed fields, removed fields)
- Migration plan (if DB schema changes; N/A if no DB)
- Indexes / constraints affected

If no data model impact → `N/A — {justification, e.g. "skill content change only, no data model"}`.

Store as `DATA_MODEL`.

### 2. API Contracts

Identify API surfaces touched. For BMAD-METHOD specifically, "API" includes:
- CLI command signatures (new flags, new commands, new subcommands)
- module.yaml schema (new variables, new prompts)
- SKILL.md frontmatter shape (new fields)
- task_contract / SendMessage payload schema (new types)

For each contract change, document:
- Operation / endpoint / command name
- Input shape
- Output shape
- Backward compatibility (additive vs breaking)

If no API contract impact → `N/A — {justification}`.

Store as `API_CONTRACTS`.

### 3. Infrastructure

Document infrastructure changes per the YAML pattern:

```yaml
infrastructure_changes:
  cloud: {NONE | description}
  compute: {NONE | description}
  storage: {NONE | description}
  secrets: {NONE | description}
  env_vars: {NONE | description}
  ci_cd: {NONE | MINIMAL | description}
```

For BMAD-METHOD itself: cloud/compute/storage/secrets are usually NONE (no deployed services). CI/CD changes ONLY when modifying `.github/workflows/`.

Store as `INFRASTRUCTURE`.

### 4. External Data Interfaces

If the feature consumes data from a third-party source (CSV import, vendor API, file watcher), document the contract.

If no external data interfaces → `No external data interfaces identified`.

Store as `EXTERNAL_DATA_INTERFACES`.

### 5. Data Mapping

If a transformation occurs (input → domain → output), document the mapping. Apply zero-fallback rule: every field MUST have a defined source; no silent defaults; lossy mappings MUST be documented as architectural decisions, not accidents.

If no mapping → `N/A — {justification}`.

Store as `DATA_MAPPING`.

### 6. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: data model + API contracts + infra + external data interfaces + data mapping all documented (or N/A justified per section)
- **FAILURE**: skipping a section, using `N/A` without justification, hiding lossy mappings as "transformations"

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Model
  actions_executed: documented Data Model ({"full" | "N/A"}), API Contracts ({"full" | "N/A"}), Infrastructure ({"changes" | "NONE"}), External Data Interfaces ({"full" | "none"}), Data Mapping ({"full" | "N/A"})
  artifacts_produced: DATA_MODEL, API_CONTRACTS, INFRASTRUCTURE, EXTERNAL_DATA_INTERFACES, DATA_MAPPING
  next_step: ./steps/step-04-nfr-security-obs.md
```

**Next:** Read FULLY and apply: `./steps/step-04-nfr-security-obs.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
