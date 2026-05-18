---
nextStepFile: './step-05-epic-quality-review.md'
outputFile: '{planning_artifacts}/implementation-readiness-report.md'
---

# Step 4: UX Alignment

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
CHK-STEP-04-ENTRY PASSED — entering Step 04: UX Alignment with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

To check if UX documentation exists and validate that it aligns with GDD requirements and Architecture decisions, ensuring architecture accounts for both GDD and UX needs.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a UX VALIDATOR ensuring player experience is properly addressed
- ✅ UX requirements must be supported by architecture
- ✅ Missing UX documentation is a warning if UI is implied
- ✅ Alignment gaps must be documented

### Step-Specific Rules:

- 🎯 Check for UX document existence first
- 🚫 Don't assume UX is not needed
- 💬 Validate alignment between UX, GDD, and Architecture
- 🚪 Add findings to the output report

## EXECUTION PROTOCOLS:

- 🎯 Search for UX documentation
- 💾 If found, validate alignment
- 📖 If not found, assess if UX is implied
- 🚫 FORBIDDEN to proceed without completing assessment

## UX ALIGNMENT PROCESS:

### 1. Initialize UX Validation

"Beginning **UX Alignment** validation.

I will:

1. Check if UX documentation exists
2. If UX exists: validate alignment with GDD and Architecture
3. If no UX: determine if UX is implied and document warning"

### 2. Search for UX Documentation

Search patterns:

- `{planning_artifacts}/*ux*.md` (whole document)
- `{planning_artifacts}/*ux*/index.md` (sharded)
- Look for UI-related terms in other documents

### 3. If UX Document Exists

#### A. UX ↔ GDD Alignment

- Check UX requirements reflected in GDD
- Verify player journeys in UX match GDD use cases
- Identify UX requirements not in GDD

#### B. UX ↔ Architecture Alignment

- Verify architecture supports UX requirements
- Check performance needs (frame rate, responsiveness, load times)
- Identify UI components not supported by architecture

### 4. If No UX Document

Assess if UX/UI is implied:

- Does GDD mention user interface or HUD?
- Are there menus, screens, or interactive UI elements implied?
- Is this a player-facing application?

If UX implied but missing: Add warning to report

### 5. Add Findings to Report

Append to {outputFile}:

```markdown
## UX Alignment Assessment

### UX Document Status

[Found/Not Found]

### Alignment Issues

[List any misalignments between UX, GDD, and Architecture]

### Warnings

[Any warnings about missing UX or architectural gaps]
```

### 6. Auto-Proceed to Next Step

After UX assessment complete, immediately load next step.

## PROCEEDING TO EPIC QUALITY REVIEW

UX alignment assessment complete. Loading next step for epic quality review.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- UX document existence checked
- Alignment validated if UX exists
- Warning issued if UX implied but missing
- Findings added to report

### ❌ SYSTEM FAILURE:

- Not checking for UX document
- Ignoring alignment issues
- Not documenting warnings

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 04: UX Alignment
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-05-epic-quality-review.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-05-epic-quality-review.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
