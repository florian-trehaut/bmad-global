# Step 02: Retrospective Analysis


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
CHK-STEP-02-ENTRY PASSED — entering Step 02: Retrospective Analysis with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Analyze the gathered data across four dimensions — scope management, process quality, technical quality, and lessons learned — to produce structured findings with concrete evidence from the collected metrics.

## RULES

- Every finding must reference specific issues, commits, or documents as evidence
- No blame — focus on process, not people
- Distinguish facts (data-backed) from observations (pattern-based) from recommendations (actionable)
- Compare original scope (PRD) against actual delivery when PRD is available

## SEQUENCE

### 1. Scope management analysis

Compare the original scope (from PRD/architecture documents loaded in step 01) against the actually delivered issues.

Evaluate:

**A. Original vs Delivered**
- Stories present in PRD but not in issues (scope gaps)
- Issues delivered that were not in original PRD (scope additions)
- Net scope change: additions - drops

**B. Scope Creep Indicators**
- Issues added after project start (check creation dates vs project start)
- Priority changes mid-epic
- Stories split into multiple issues during development

**C. Scope Discipline Rating**
- Controlled: minimal unplanned additions, intentional drops with justification
- Moderate: some additions, most tracked
- Uncontrolled: significant unplanned work, many additions without justification

If no PRD was found, note this as a process gap and analyze scope based on issue creation timeline only.

### 2. Process quality analysis

Analyze workflow and collaboration effectiveness from the issue data and comments.

Evaluate:

**A. Story Quality**
- Were stories clear enough to implement? (evidence: blocked issues due to unclear requirements)
- Did stories have acceptance criteria? (evidence: issue descriptions)
- Were stories right-sized? (evidence: issues that were split or took disproportionate time)

**B. Review Thoroughness**
- Issues that had review comments vs total completed issues
- Quality of review feedback (evidence: comment content from step 01)
- Issues returned from review (status went from Review back to In Progress)

**C. Blocked Frequency and Resolution**
- Number of blocked issues vs total
- Average time blocked (if timestamps available)
- Root causes of blocks (dependencies, unclear requirements, technical obstacles)
- Resolution patterns (who unblocked, how quickly)

**D. Flow Efficiency**
- Issues that moved smoothly through statuses
- Issues with status oscillation (back-and-forth between states)
- Cancelled issues and reasons

### 3. Technical quality analysis

Analyze technical aspects from git history and issue data.

Evaluate:

**A. Code Activity**
- Total commits for the epic period
- Commit frequency distribution (steady vs burst)
- Files most frequently modified (hotspots)

**B. Architecture Compliance**
- Issues that required architecture changes (evidence: comments or labels)
- New patterns introduced
- Technical debt created or resolved (evidence: issue labels or descriptions)

**C. Testing**
- Issues with test-related comments or labels
- Bugs found post-completion (issues opened referencing epic work)
- Integration issues between components

### 4. Lessons learned synthesis

From the three analyses above, extract:

**What went well** (3-5 items)
- Processes or practices that contributed to success
- Backed by specific evidence (issue IDs, metrics)

**What to improve** (3-5 items)
- Specific process or technical gaps
- Each with a concrete, actionable recommendation
- Prioritized by impact

**Action items for next epic** (2-4 items)
- Specific, assignable actions (not vague "improve X")
- Each tied to a finding from the analysis

### 5. CHECKPOINT — Analysis review

Present the complete analysis summary to the user:

```
Analyse rétrospective : {PROJECT_NAME}

Scope :
  - Taux de livraison : {N}% du scope original
  - Ajouts non planifiés : {N} stories
  - Discipline scope : {rating}

Process :
  - Stories bloquées : {N}/{total}
  - Taux de review : {N}%
  - Issues annulées : {N}

Technique :
  - Commits : {N}
  - Hotspots : {top 3 files}

Top 3 améliorations proposées :
  1. {improvement}
  2. {improvement}
  3. {improvement}

Valider cette analyse pour la sauvegarder ?
```

WAIT for user confirmation or corrections. Apply any corrections before proceeding.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Retrospective Analysis
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-save.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
