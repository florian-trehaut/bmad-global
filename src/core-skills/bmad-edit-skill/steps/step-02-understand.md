# Step 2: Understand the Change Request


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Understand the Change Request with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Understand exactly what the user wants to change, classify the modification type, and draft an edit plan with specific file-level changes.

## RULES

- NEVER assume what the user wants — ask if unclear
- If the user has a validation report (from bmad-validate-skill), load it as context for the changes
- The edit plan MUST list every file to modify, create, or delete
- CHECKPOINT is mandatory before proceeding to apply changes

## SEQUENCE

### 1. Ask what to change

If the user already described the change in their initial request, skip to step 2.

Otherwise ask: "What would you like to modify in **{TARGET_SKILL.name}**?"

### 2. Classify the modification

Determine which category (or categories) the change falls into:

| Category | Examples |
|----------|----------|
| **add-step** | Add a new step between existing ones, add a step at the end |
| **remove-step** | Remove a step that is no longer needed |
| **modify-step** | Change the content/logic of an existing step |
| **change-triggers** | Update the description/trigger phrases in SKILL.md |
| **add-data-file** | Add a new data file to `data/` |
| **remove-data-file** | Remove an existing data file |
| **modify-data-file** | Change content of an existing data file |
| **add-subagent** | Add a subagent workflow to `subagent-workflows/` |
| **restructure** | Major reorganization (split steps, merge steps, change flow) |
| **fix-bug** | Fix an error in the workflow logic |
| **update-conventions** | Bring the skill in compliance with current conventions |
| **modify-workflow** | Change workflow.md itself (role, rules, initialization) |

### 3. Load Validation Report (auto-discovery)

Actively search for validation context:

1. **Conversation history**: Check if `/bmad-validate-skill` was invoked earlier in this conversation. Look for structured output containing:
   - "VALID" / "NEEDS_WORK" / "INVALID" verdicts
   - Rule IDs like SKILL-01, WF-01, PATH-01, STEP-01, etc.
   - Finding lists with severity markers [PASS], [WARN], [FAIL]

2. **If found**: Extract all findings with WARN or FAIL severity. Present them as a starting point:
   > Found validation report from this session. These findings can guide your edits:
   > {list of WARN/FAIL findings with rule IDs}
   >
   > Would you like to:
   > **[F] Fix these findings** — I'll create an edit plan targeting each finding
   > **[D] Different changes** — Ignore findings, tell me what you want to change
   > **[B] Both** — Fix findings AND make additional changes

3. **If not found**: Ask the user directly what they want to change (proceed to section 4).

### 4. Draft the edit plan

For each change, specify:

```
## Edit Plan

### Change 1: {description}
- **Category:** {category}
- **Files affected:**
  - MODIFY: `steps/step-03-setup-worktree.md` — add proxy restart logic after line 45
  - CREATE: `data/proxy-config.md` — new data file with proxy configuration rules
  - MODIFY: `workflow.md` — update step sequence table to reflect new step
- **Impact:**
  - Step renumbering: NO
  - NEXT pointer changes: NO
  - New dependencies: `data/proxy-config.md` loaded by step-03

### Change 2: {description}
...
```

**If adding a step:**
- Specify where in the sequence (between which existing steps)
- List all steps that need renumbering
- List all NEXT pointers that need updating

**If removing a step:**
- Specify which step
- List the file to delete
- List all steps that need renumbering
- List all NEXT pointers that need updating

### 5. CHECKPOINT

Present the edit plan to the user:

```
## Edit Plan Summary

**Skill:** {TARGET_SKILL.name}
**Changes:** {count}
**Files to modify:** {list}
**Files to create:** {list}
**Files to delete:** {list}
**Step renumbering required:** YES/NO

{full edit plan from step 4}

Proceed with these changes? [Y]es / [N]o / [M]odify the plan
```

WAIT for user confirmation.

- If **Yes** — proceed to step 3
- If **No** — HALT: "Edit cancelled."
- If **Modify** — return to step 1 of this step file, incorporate feedback

### 6. Proceed

Load and execute `./steps/step-03-apply.md`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Understand the Change Request
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
