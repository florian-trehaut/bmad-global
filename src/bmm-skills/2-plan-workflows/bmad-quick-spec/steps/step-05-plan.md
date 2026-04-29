---
nextStepFile: './step-06-review.md'
---

# Step 5: Plan — Tasks, TACs (EARS), Boundaries, Risks, INVEST

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-04-EXIT emis dans la conversation
- [ ] Variables en scope: NFR_REGISTRY, SECURITY_GATE (verdict), OBSERVABILITY

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Plan with SLUG={slug}, Security Gate verdict={…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Produce the Implementation Plan (tasks + TACs in EARS), Validation Métier section, Guardrails, Boundaries Triple, Risks & Assumptions register, INVEST self-check, Test Strategy, and File List.

## MANDATORY SEQUENCE

### 1. Implementation Plan — Tasks

Build a flat task list (no Areas needed for quick profile). Each task:

```
- [ ] Task N: {brief description}
  - File: {path}
  - Action: {what to do}
```

Tasks should map directly to BACs (loaded in step-01) and to architectural decisions surfaced in step-02. If a task is queued from NFR/Security remediation (step-04), prefix with `[NFR]` or `[SEC]`.

Store as `TASKS`.

### 2. Technical Acceptance Criteria — EARS

For each TAC, use one of the 5 EARS patterns per `~/.claude/skills/bmad-shared/ac-format-rule.md`:

| Pattern | Form |
|---------|------|
| Ubiquitous | `The {system} shall {behavior}.` |
| Event-driven | `When {trigger}, the {system} shall {behavior}.` |
| State-driven | `While {state}, the {system} shall {behavior}.` |
| Optional | `Where {feature_is_enabled}, the {system} shall {behavior}.` |
| Unwanted | `If {undesired_condition}, then the {system} shall {prevent | handle}.` |

Each TAC MUST reference at least one BAC (e.g., `*(refs BAC-2)*`). TACs without a BAC reference indicate scope creep — flag and either remove or add a BAC for it.

Store as `TACS`.

### 3. Validation Métier (VM)

For each BAC, write one VM:

```
- [ ] VM-N [{api|e2e|db|code}] *(BAC-N)*: {how to verify with REAL DATA, not code analysis}.
```

Apply `validation-proof-principles.md` — code analysis is NEVER proof. VMs must be runnable.

Store as `VALIDATION_METIER`.

### 4. Guardrails

Two sub-sections:

**Mandatory (project baseline)**:
1. Run `{quality_gate}` before declaring story complete (from workflow-context.md)
2. Follow naming conventions (project.md#conventions)
3. Use the project's package manager

**Story-specific**:
4+. Add story-specific guardrails based on the architectural decisions and risks surfaced.

Store as `GUARDRAILS`.

### 5. Boundaries Triple

Per `~/.claude/skills/bmad-shared/boundaries-rule.md`, each bucket has ≥ 3 items.

**✅ Always Do** (no approval needed):
- {project_baseline_items} (3+)
- {story_specific_items} (3+)

**⚠️ Ask First** (high-impact, require explicit user approval):
- {project_baseline_items} (3+)
- {story_specific_items} (3+ — modifying shared protocols, adding new dependencies, etc.)

**🚫 Never Do** (hard stops, no exceptions):
- (Project baseline, ≥ 3): commit secrets, edit node_modules/, --no-verify, push to upstream protected branches
- (Story-specific, ≥ 3 if applicable)

Store as `BOUNDARIES`.

### 6. Risks & Assumptions

**Risks** — for each HIGH-impact risk, mitigation MUST be present:

| ID | Description | Probability | Impact | Mitigation | Validation Method | Owner |
|----|-------------|:----:|:----:|------------|-------------------|-------|

**Assumptions** — for each UNVERIFIED assumption, declare validation method:

| ID | Assumption | Source | Status | Validation Method |
|----|-----------|--------|--------|-------------------|

Store as `RISKS_ASSUMPTIONS`.

### 7. INVEST self-check

| Criterion | Answer | Evidence |
| --------- | ------ | -------- |
| Independent | YES/NO | {evidence} |
| Negotiable | YES/NO | {evidence} |
| Valuable | YES/NO | {evidence} |
| Estimable | YES/NO | {evidence — story points} |
| Small | YES | (Quick profile MUST be Small — if NO, escalate to /bmad-create-story) |
| Testable | YES/NO | {evidence} |

If `Small = NO` for a quick-profile spec → HALT and escalate. Quick profile is for small stories only.

Store as `INVEST`.

### 8. Test Strategy

| TAC | Pattern | Priority | Unit | Integration | Journey/E2E | Key Scenarios |
|-----|---------|----------|------|-------------|-------------|---------------|

P0 TACs MUST have Integration or Journey tests (not Unit-only). Validators (validate-skills.js, validate-story-spec.js) count as Unit.

Store as `TEST_STRATEGY`.

### 9. File List

```markdown
### NEW files

- {path}

### MODIFIED files

- {path}
```

Store as `FILE_LIST`.

### 10. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: all sections produced; every TAC uses an EARS pattern + references a BAC; INVEST Small=YES (or escalation triggered); HIGH-impact risks have mitigation; Boundaries Triple has ≥ 3 items per bucket
- **FAILURE**: TAC without BAC ref, INVEST Small=NO without escalation, HIGH risk without mitigation, < 3 items in any boundaries bucket

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Plan
  actions_executed: produced {N} tasks, {M} TACs (EARS-typed), {K} VMs, {Z} risks ({h} HIGH), INVEST {6_yes}/6 YES; Boundaries {a}+{b}+{c} items; File List {NEW}+{MODIFIED}
  artifacts_produced: TASKS, TACS, VALIDATION_METIER, GUARDRAILS, BOUNDARIES, RISKS_ASSUMPTIONS, INVEST, TEST_STRATEGY, FILE_LIST
  next_step: ./steps/step-06-review.md
```

**Next:** Read FULLY and apply: `./steps/step-06-review.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
