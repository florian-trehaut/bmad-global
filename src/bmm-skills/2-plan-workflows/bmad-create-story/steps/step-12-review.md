---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
adversarialReview: '~/.claude/skills/bmad-review-adversarial-general/SKILL.md'
specCompletenessRule: '~/.claude/skills/bmad-shared/spec-completeness-rule.md'
acFormatRule: '~/.claude/skills/bmad-shared/ac-format-rule.md'
boundariesRule: '~/.claude/skills/bmad-shared/boundaries-rule.md'
---

# Step 12: Multi-Validator Review (Both Modes)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "Discovery only", "Enrichment skip", "deja revu en step 11".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-12-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-11-EXIT emis dans la conversation)
- [ ] Composed issue description disponible
- [ ] Toutes les sections obligatoires (per {specCompletenessRule}) presentes dans le draft
- [ ] Variables requises en scope

Emettre EXACTEMENT:

```
CHK-STEP-12-ENTRY PASSED — entering Step 12: Multi-Validator Review with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Run three independent validator passes on the composed spec, then offer interactive review options. This step is **active in BOTH Discovery and Enrichment modes** (no longer Discovery-only) — the multi-validator pass is the last gate before publication.

The three validators have non-overlapping concerns:
1. **Requirements validator** — completeness of mandatory sections, AC format compliance, INVEST self-check
2. **Design validator** — coherence between Real-Data Findings, External Research, Data Model, NFR, Security, Observability, Audit
3. **Tasks validator** — implementation plan completeness, traceability tasks↔TACs↔BACs, scope-creep absence

## RULES

- All 3 validators MUST run; partial validation = step incomplete
- Each validator emits structured findings: BLOCKER / MAJOR / MINOR / INFO with concrete remediation
- BLOCKER findings MUST be fixed before proceeding to Step 13 (no exceptions)
- Findings are presented to the user grouped by severity
- After fixes, re-run the affected validator
- This step DOES NOT modify the spec — it surfaces findings; fixes happen via [E]dit menu options

## SEQUENCE

### 1. Validator A — Requirements

**Scope:** completeness, format compliance, INVEST.

Run checks against the composed issue description:

- [ ] All mandatory sections present per `{specCompletenessRule}` (DoD, Problem, Proposed Solution, Scope, Out-of-Scope, Business Context, Technical Context, Real-Data Findings, External Research, NFR Registry, Security Gate, Observability Requirements, Implementation Plan, Tasks, BACs, TACs, Validation Metier, Definition of Done, Guardrails, Boundaries, Risks/Assumptions, INVEST, Test Strategy, File List)
- [ ] BACs format: every BAC matches `Given … When … Then …` per `{acFormatRule}`
- [ ] TACs format: every TAC matches one of the 5 EARS patterns AND references at least one BAC
- [ ] VM-N format: sequential numbering, type tag, BAC reference
- [ ] Risks register: HIGH-impact items have mitigation
- [ ] Assumptions register: HIGH-impact items VERIFIED or converted to RISK
- [ ] Boundaries: 3 buckets present, 3+ items each, no overlap
- [ ] INVEST: 6 questions answered with evidence (no blanks, no "?")
- [ ] Out-of-Scope: at least 2 items, doesn't contradict Scope/Excluded
- [ ] Security Gate: binary verdict; if FAIL, remediation tasks present

Output:

```markdown
## Validator A — Requirements (findings)

| ID | Severity | Section | Finding | Remediation |
| -- | -------- | ------- | ------- | ----------- |
| ReqA-1 | BLOCKER | TACs | TAC-3 in G/W/T format, must be EARS | Rewrite using Event-driven pattern: "When …, the … shall …" |
| ReqA-2 | MAJOR | Out-of-Scope | Only 1 item, rule requires ≥2 | Add at least one more non-goal |
```

### 2. Validator B — Design

**Scope:** coherence between investigation outputs (Steps 5-10).

Run checks:

- [ ] Real-Data Findings (Step 5) cited in Data Model assumptions (Step 8) — schema-vs-reality drift addressed
- [ ] External Research (Step 6) sources cited in TACs / NFR / Risks where applicable
- [ ] NFR Performance target consistent with Step 5 volume / growth findings
- [ ] Security Gate row consistent with `project.md#security-baseline` and `#compliance-requirements`
- [ ] Observability Requirements consistent with `project.md#observability-standards`
- [ ] Data Mapping (Step 8) covers all field-level entries from Real-Data Findings
- [ ] ADR conformity (Step 10) referenced if architectural decision was logged
- [ ] Runtime State Continuity (Step 10) — UNSAFE pattern → redesign tasks present in Implementation Plan
- [ ] Impact Analysis (Step 10) — every NEEDS_UPDATE caller has a corresponding task

Output: `Validator B — Design (findings)` table same format.

### 3. Validator C — Tasks

**Scope:** implementation plan, traceability, scope-creep.

Run checks:

- [ ] Every task has file path + specific action; no "TBD"
- [ ] Tasks ordered by dependency (foundations first)
- [ ] `[CI/CD]` and `[INFRA]` tasks present for any MISSING/PARTIAL deployment chain layer
- [ ] NFR remediation tasks queued from Step 9 are present
- [ ] Security Gate FAIL items have remediation tasks
- [ ] Observability tasks present (logs/metrics/alerts/dashboards as required)
- [ ] Every TAC has at least one task that delivers it; every task contributes to at least one TAC
- [ ] Every BAC has at least one VM (production test) AND at least one TAC implementing it
- [ ] No task touches files outside the `Files to Create / Modify` declaration (scope-creep)
- [ ] Test strategy covers every TAC with priority + pyramid classification + EARS pattern

Output: `Validator C — Tasks (findings)` table same format.

### 4. Synthesis

Aggregate findings:

```
## Multi-Validator Synthesis

| Validator | BLOCKER | MAJOR | MINOR | INFO |
| --------- | ------- | ----- | ----- | ---- |
| A — Requirements | {N} | {N} | {N} | {N} |
| B — Design      | {N} | {N} | {N} | {N} |
| C — Tasks       | {N} | {N} | {N} | {N} |

Total BLOCKER: {N}  →  {must fix before Step 13 / no blocker, may proceed}
```

If any BLOCKER → HALT and require fix loop. The user picks `[F]ix` from the menu.

If no BLOCKER → proceed to interactive review menu.

### 5. Present Complete Spec + Menu

Present the full spec content (composed in Step 11) followed by the validator findings:

> Here is the complete spec with multi-validator findings. Please review:
>
> ---
> {full_spec_content}
> ---
>
> {validator_synthesis_table}
>
> {findings_grouped_by_severity}
>
> **Summary:**
> - {task_count} implementation tasks
> - {bac_count} BACs in G/W/T
> - {tac_count} TACs in EARS (Ubiquitous: {N}, Event-driven: {N}, State-driven: {N}, Optional: {N}, Unwanted: {N})
> - {vm_count} validation metier tests
> - {oos_count} out-of-scope non-goals
> - {risk_count} risks ({n_high} HIGH), {assumption_count} assumptions
> - INVEST: {n_yes}/6 YES, {n_no}/6 NO
> - Security Gate: {PASS|FAIL|N/A breakdown}
> - NFR coverage: {n_present}/7 PRESENT, {n_missing}/7 MISSING
> - Files to modify/create: {files_count}
> - Guardrails: {guardrails_count}
> - Boundaries: Always({n}) / Ask First({n}) / Never({n})

### 6. Present MENU OPTIONS

Display: "**Select:** [C] Continue to publication (Step 13) [E] Edit [Q] Questions [F] Fix BLOCKER findings [A] Advanced Elicitation [P] Party Mode [R] Adversarial Review"

#### Menu Handling Logic:

- IF C: only allowed when 0 BLOCKER findings remain. Load, read fully, and execute `./step-13-output.md`
- IF E: Apply user's requested edits inline, re-run all 3 validators, re-present findings + menu
- IF Q: Answer questions, then redisplay menu
- IF F: Walk the user through BLOCKER findings one by one, apply fixes, re-run validators, redisplay
- IF A: Read fully and follow {advancedElicitationTask}, process, ask "Accept? (y/n)", if yes update spec, then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow}, process, ask "Accept? (y/n)", if yes update spec, then redisplay menu
- IF R: Execute adversarial review (see below), then redisplay menu
- IF any other: Respond helpfully then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to Step 13 when user selects 'C' AND 0 BLOCKER findings
- After other menu items execution, return to this menu

### Adversarial Review [R] Process

1. Invoke review task: {adversarialReview}
   - If subagent available: run in separate process with spec content only (information asymmetry)
   - Fallback: load task file and follow inline in main context
2. Process findings:
   - If zero findings → suspicious, re-analyze or ask user
   - Evaluate severity (Critical, High, Medium, Low) and validity (real, noise, undecided)
   - DO NOT exclude findings based on severity
   - Order by severity, number as F1, F2, F3...
   - Present as table: ID | Severity | Validity | Description
3. Return to review menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All 3 validators ran (Requirements / Design / Tasks)
- Findings presented grouped by severity with concrete remediation
- 0 BLOCKER findings before user selects [C]
- Active in BOTH Discovery and Enrichment modes
- Adversarial review uses {adversarialReview} variable (not hardcoded path)
- User explicitly selects [C] before proceeding to Step 13

### FAILURE:

- Skipping any of the 3 validators
- Proceeding with BLOCKER findings unresolved
- Skipping the step in Enrichment mode (no longer allowed)
- Hardcoding adversarial review path instead of using variable
- Not re-presenting menu after non-C selections

---

## STEP EXIT (CHK-STEP-12-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-12-EXIT PASSED — completed Step 12: Multi-Validator Review
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-13-output.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-13-output.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
