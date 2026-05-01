---
nextStepFile: './step-02-investigate.md'
---

# Step 1: Entry — Greet, Gather Feature, Check Escalation

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-INIT emis dans la conversation (initialization complete)
- [ ] Variables en scope: SPEC_PROFILE=quick, COMMUNICATION_LANGUAGE, USER_NAME, TEAMMATE_MODE
- [ ] Working state: `pwd` dans le repo (ou worktree fourni si TEAMMATE_MODE=true Branch D)

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Entry with SPEC_PROFILE=quick, TEAMMATE_MODE={value}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Greet the user (or the orchestrator if TEAMMATE_MODE=true), gather the feature description in 2–3 sentences, and check whether the scope fits the quick profile or requires escalation to `/bmad-create-story`.

## MANDATORY SEQUENCE

### 1. Greet (TEAMMATE_MODE-conditional per M8 / TAC-3)

**If TEAMMATE_MODE=false (standalone)** — display the greet to `{USER_NAME}` in `{COMMUNICATION_LANGUAGE}` :

```
Bonjour {user_name} — je vais te guider pour rédiger une spec condensée (story-spec v2 quick profile, ~6 étapes).
Décris la fonctionnalité en 2–3 phrases : quel problème, pour qui, quel résultat attendu.
```

**If TEAMMATE_MODE=true** — SKIP the greet entirely. The lead has already gathered FEATURE_DESCRIPTION via auto-flow step-01-entry.md and propagated it via `task_contract.input_artifacts`. Extract :

```
FEATURE_DESCRIPTION = task_contract.input_artifacts[type='document'].content
                   OR task_contract.input_artifacts[type='custom'].data.feature_description
                   OR HALT (TAC-4 violation: required input missing)
```

Skip §2 Gather feature description below — proceed directly to §3 Escalation thresholds with the propagated FEATURE_DESCRIPTION.

### 2. Gather feature description

WAIT for user input (standalone) or for SendMessage reply (TEAMMATE_MODE per `teammate-mode-routing.md` §A — emit a `question` payload, block on reply).

Store as `FEATURE_DESCRIPTION`.

### 3. Escalation thresholds — auto-check

Inspect `FEATURE_DESCRIPTION` for keywords / patterns that indicate scope BEYOND quick profile:

| Trigger | Pattern in description | Action |
|---------|------------------------|--------|
| External API | mentions third-party API, webhook, OAuth provider, payment gateway, external service | HALT and escalate |
| Real data dependency | mentions production data, real customer records, prod DB, prod cloud logs | HALT and escalate |
| Multi-bounded-context | mentions ≥ 2 distinct domains (auth + billing, frontend + backend with new API surface) | HALT and escalate |
| Compliance | mentions GDPR, HIPAA, SOC2, PCI-DSS, audit | HALT and escalate (Security Gate review needed) |
| Scope > 5 ACs | description sketches > 5 distinct user-observable behaviors | HALT and escalate |

If any trigger fires → emit:

```
Cette feature dépasse les limites du profile quick :
- Triggers détectés : {list}

Recommandation : utilise `/bmad-create-story` (full profile, 14 steps) qui :
- Confronte la spec aux données réelles (Real-Data Findings non terse)
- Effectue une recherche externe (External Research non terse)
- Multi-validator review

Veux-tu :
[E] Escalader vers /bmad-create-story (recommandé)
[Q] Continuer en quick (à tes risques — la spec sera incomplète si les triggers sont valides)
```

WAIT for user choice. On `[E]` → HALT this workflow and instruct the user to invoke `/bmad-create-story`. On `[Q]` → log the user's override and continue.

### 4. Derive slug + title

- `SLUG = kebab-case of FEATURE_DESCRIPTION first 4-6 words` (max 30 chars)
- `TITLE = FEATURE_DESCRIPTION first sentence, capitalized, max 80 chars`

### 5. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: feature gathered, escalation triggers checked, SLUG + TITLE derived, no escalation requested
- **FAILURE**: skipping greeting, accepting one-word descriptions, ignoring escalation triggers

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Entry
  actions_executed: greeted user; gathered FEATURE_DESCRIPTION ({N} chars); ran escalation checks ({M} triggers); derived SLUG={slug}, TITLE={title}
  artifacts_produced: FEATURE_DESCRIPTION, SLUG, TITLE; escalation_decision={none | overridden by user}
  next_step: ./steps/step-02-investigate.md
```

**Next:** Read FULLY and apply: `./steps/step-02-investigate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
