---
nextStepFile: './step-03-model.md'
---

# Step 2: Investigate — Codebase Patterns + Light Real-Data Check

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-01-EXIT emis dans la conversation
- [ ] Variables en scope: FEATURE_DESCRIPTION, SLUG, TITLE
- [ ] Working state: project knowledge déjà chargé (project.md, domain.md)

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Investigate with SLUG={slug}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Identify the relevant codebase patterns, files to modify/create, and architectural decisions surfaced. Produce a condensed Real-Data Findings + External Research section (or `N/A — {1-line justification}` if scope is internal-only and triggers from step-01 did not fire).

## MANDATORY SEQUENCE

### 1. Codebase pattern scan

Glob and grep for files relevant to `FEATURE_DESCRIPTION`:

```bash
# Identify likely affected directories from project.md (#tech-stack, #conventions)
# Then glob for similar patterns
grep -rln "{relevant_keywords}" src/ tests/ docs/ 2>/dev/null | head -30
```

For each found file, note:
- File role (consumer, producer, test, doc, config)
- Pattern that the new feature should follow (e.g., "this skill follows the canonical SKILL.md + workflow.md + steps/ structure")

Store as `CODEBASE_PATTERNS`.

### 2. Reference patterns to mimic

Identify 1–3 existing skills / modules that the new feature should mirror. Document:
- Path to the reference
- What pattern to copy (structure, naming, frontmatter shape)

Store as `REFERENCE_PATTERNS`.

### 3. Real-Data Findings — terse N/A allowed?

Apply the rule: terse N/A is allowed ONLY when ALL of the following hold:
- The feature does NOT touch external integrations (verified by step-01 escalation check)
- The feature does NOT touch production data (config, internal tooling, internal refactor only)
- The feature does NOT modify an existing data contract (DTO, API response shape, DB column)

If ALL three hold → write:

```
N/A — {1-line justification, e.g. "internal config refactor — no real data exchange involved"}
```

Otherwise → perform a light real-data check:
- Read 1–2 sample data files OR query 1 endpoint OR inspect 1 DB row
- Document the sample shape (anonymized)
- Compare with the spec's expected shape — flag drift

Store as `REAL_DATA_FINDINGS`.

### 4. External Research — terse N/A allowed?

Apply the rule: terse N/A is allowed ONLY when ALL of the following hold:
- No external library / framework version is involved in the change
- No third-party API behavior is referenced
- The pattern is well-documented in `project.md` or in a recent merged PR

If ALL three hold → write:

```
N/A — {1-line justification, e.g. "well-known pattern documented in project.md#conventions"}
```

Otherwise → perform a light external research:
- 1 web search OR 1 Context7 lookup
- Document version constraints (if any) and relevant best practice

Store as `EXTERNAL_RESEARCH`.

### 5. Architectural decisions surfaced

Note any decisions that emerged from the investigation. Examples:
- "Use the existing `bmad-shared/foo.md` rule rather than creating a new one"
- "Place the skill under `2-plan-workflows/` (not `4-implementation/`) because it produces a planning artifact"

Check `adr_location` from workflow-context.md:
- If set and not "none" → ASK the user whether each decision warrants an ADR (do NOT silently document)
- If absent → document inline in the spec's Technical Context section, no ADR menu

Store as `ARCHITECTURAL_DECISIONS`.

### 6. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: codebase patterns identified, reference patterns identified, real-data + external research either evidenced or N/A justified, architectural decisions surfaced
- **FAILURE**: silently substituting "N/A" without justification, fabricating sample data, skipping reference patterns

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Investigate
  actions_executed: scanned codebase ({N} grep hits, {M} relevant files); identified {K} reference patterns; produced Real-Data Findings ({"full" | "N/A justified"}); produced External Research ({"full" | "N/A justified"}); surfaced {Z} architectural decisions
  artifacts_produced: CODEBASE_PATTERNS, REFERENCE_PATTERNS, REAL_DATA_FINDINGS, EXTERNAL_RESEARCH, ARCHITECTURAL_DECISIONS
  next_step: ./steps/step-03-model.md
```

**Next:** Read FULLY and apply: `./steps/step-03-model.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
