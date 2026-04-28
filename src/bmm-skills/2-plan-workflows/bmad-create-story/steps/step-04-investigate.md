---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
---

# Step 4: Deep Investigation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Deep Investigation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Investigate the codebase deeply inside the worktree to identify patterns, files to modify, test patterns, and technical context. In Enrichment mode, also extract architecture and technology patterns from loaded documents.

## RULES

- Focus on understanding existing code patterns — not proposing solutions yet
- FORBIDDEN: modifying any files in the worktree
- DO NOT BE LAZY — for EACH relevant file, use subprocess when available to analyze patterns and return structured findings
- Approach: read-only investigation, present findings, confirm with user

## SEQUENCE

### 1. Architecture Extraction

**Enrichment mode:** From `EPIC_ARCHITECTURE`, extract:

- **Technical stack and versions** — frameworks, libraries, database engines
- **Key patterns** — DDD, CQRS, event-driven, hexagonal, etc.
- **Database schema** relevant to this story — tables, columns, types, constraints, indexes
- **API contracts** — endpoints, payloads, error codes (use `~/.claude/skills/bmad-shared/data/api-contract-template.md`)
- **Testing strategy** — what types of tests are expected

**Discovery mode:** Build on the quick scan from Step 2d. Ask user:

> I found [files/patterns in Step 2d]. Are there other files or directories I should explore in depth?

### 2. Deep Code Analysis

For each relevant file/directory **inside {SPEC_WORKTREE_PATH}**:

- Read the complete file(s)
- Identify patterns, conventions, coding style
- Note dependencies and imports
- Find related test files

**Use subprocess per file when available** — each subprocess reads one file, analyzes patterns/conventions/dependencies, and returns a structured summary. Parent aggregates.

**If NO relevant code found (Clean Slate):**

- Identify the target directory where the feature should live
- Scan parent directories for architectural context
- Identify standard project utilities or boilerplate that SHOULD be used
- Document as "Confirmed Clean Slate"

### 3. Load Architecture Decision Records (if available)

Check `adr_location` from workflow-context.md.

<check if="adr_location is set and not 'none'">
  Load all ADRs from the configured location. When multiple ADRs on the same topic, the most recent takes precedence.
  Store as `PROJECT_ADRS` — the spec must not violate active ADRs.
  Note which ADRs are relevant to the feature being specified.
</check>

### 4. Cross-Reference with Standards

Using `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION), cross-reference investigation results with project dev standards. Note any deviations or patterns the implementation must follow.

### 5. Document Technical Context

Present findings and confirm with user:

- **Tech Stack**: Languages, frameworks, libraries
- **Code Patterns**: Architecture patterns, naming conventions, file structure
- **Files to Modify/Create**: Specific files that will need changes
- **Test Patterns**: How tests are structured, test frameworks used

### 6. Checkpoint & Menu

**Discovery mode:** Present A/P/C menu:

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Data & Infra Modeling (Step 5)"

- IF A: Read fully and follow {advancedElicitationTask} with current context, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current context, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF C: Proceed to next step
- IF any other: Respond helpfully then redisplay menu

ALWAYS halt and wait for user input. ONLY proceed when user selects 'C'.

**Enrichment mode:** Present findings, confirm with user, then proceed directly.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Deep Investigation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-05-model.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
