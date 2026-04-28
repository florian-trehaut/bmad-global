# Step 2: Framework Selection


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Framework Selection with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Select the most appropriate E2E testing framework (Playwright or Cypress) based on project characteristics gathered in step 01, and document the rationale.

## RULES

- Default to **Playwright** unless strong signals favor Cypress
- If the tech-stack-lookup protocol (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`) workflow knowledge specifies a framework preference, respect it
- Present the decision transparently — the user should understand why
- Set the `FRAMEWORK` variable for use in subsequent steps

## SEQUENCE

### 1. Apply selection logic

Evaluate the project characteristics from step 01 against these criteria:

**Strong Playwright signals:**
- Large or complex repo (many routes, services)
- Multi-browser testing needed (Chrome + Firefox + Safari)
- Heavy API + UI integration testing
- CI speed and parallelism are priorities
- Need for trace/screenshot/video artifacts
- Mobile viewport testing needed
- Network interception complexity (HAR, route-level mocking)
- Backend-only or API-only projects (Playwright has native API testing)

**Strong Cypress signals:**
- Small team prioritizing developer experience
- Component testing is the primary focus
- Simpler setup needed for a small project
- Team already has Cypress expertise (check for cypress in devDependencies history)
- Visual testing with component isolation is key

**Auto-detection rules (when `framework_preference` = "auto"):**
1. If project has `@playwright/test` in any dep — choose Playwright
2. If project has `cypress` in any dep — choose Cypress
3. If backend-only or API-only project — choose Playwright (native API testing)
4. If monorepo — choose Playwright (better parallel/shard support)
5. If fullstack SSR (Next.js, Nuxt, SvelteKit) — choose Playwright
6. If small frontend SPA with component focus — consider Cypress
7. Default: Playwright

### 2. Determine project size

If `project_size` was not explicitly set:
- **Small:** < 10 routes/pages, < 5 API endpoints, single service
- **Large:** 10+ routes/pages, 5+ API endpoints, or multi-service

Project size influences scaffold depth in step 03 (small = minimal helpers, large = full helper suite).

### 3. Load framework-specific knowledge

Based on the selected framework, identify which TEA knowledge fragments will be needed in step 03:

**If Playwright:**
- `fixture-architecture` — composable fixture patterns
- `playwright-config` — config guardrails and standards
- `network-first` — intercept-before-navigate patterns
- `data-factories` — factories with overrides and cleanup
- `test-quality` — execution limits, isolation rules

**If Cypress:**
- `data-factories` — factories with overrides and cleanup
- `test-quality` — execution limits, isolation rules

Do NOT load the fragments yet — just note which ones step 03 will need.

### 4. CHECKPOINT

Present to the user:

> **Framework Selection**
>
> **Selected:** {Playwright / Cypress}
> **Project size:** {small / large}
>
> **Rationale:**
> - {reason 1}
> - {reason 2}
> - {reason 3}
>
> **Knowledge fragments queued for scaffold step:**
> - {list of fragment IDs}

WAIT for user confirmation. If the user disagrees, switch framework and re-evaluate.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Framework Selection
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-scaffold.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
