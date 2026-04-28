# Step File Template

Use this template when generating step files for a new bmad-* skill.

---

## Template

````markdown
# Step {N}: {Descriptive Name}

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-{NN}-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-{NN}-ENTRY PASSED — entering Step {N}: {Descriptive Name} with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

{One paragraph describing what this step accomplishes and why it matters in the workflow.}

## RULES

{Step-specific rules — constraints, prohibitions, or requirements that apply only to this step.}
{Do NOT repeat workflow-global rules from workflow.md — those are always active.}

## SEQUENCE

### 1. {First action}

{Clear instructions for what to do.}
{Include expected outcome.}
{Include error handling if applicable.}

### 2. {Second action}

{Instructions.}

### 3. {Third action}

{Instructions.}

{Continue numbering for all actions.}

### N. CHECKPOINT

{Present findings, decisions, or output to the user.}

{Format the output clearly — use tables, code blocks, or structured text.}

"Does this look correct? {Specific question about what the user should verify.}"

WAIT for user confirmation. Apply any corrections.

---

## STEP EXIT (CHK-STEP-{NN}-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-{NN}-EXIT PASSED — completed Step {N}: {Descriptive Name}
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

**Next:** Read FULLY and apply: `./steps/step-{NN}-{name}.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
````

---

## Variants

### Auto Step (no user interaction)

Omit the CHECKPOINT section. End with:

```markdown
---

**Next:** Read fully and follow `./steps/step-{NN}-{name}.md`
```

### Interactive Step (user must confirm)

Include the CHECKPOINT section. Always:
1. Present what was found/decided in structured format
2. Ask a specific question (not just "OK?")
3. Include `WAIT for user confirmation.`

### Final Step

Replace the NEXT section with the WORKFLOW-COMPLETE block:

```markdown
---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

\`\`\`
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-{name} executed end-to-end:
  steps_executed: ['01', '02', ..., '{N}']
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
\`\`\`

Si steps_executed != ['01', '02', ..., '{N}'] sequentiel ET steps_skipped sans citation user verbatim => HALT.

---

## END OF WORKFLOW

The bmad-{name} workflow is complete.
```

### Loop Step (repeats for a list)

Add iteration tracking:

```markdown
## SEQUENCE

### 1. {Action per item}

For EACH {item} in {list}:

#### 1a. {Sub-action}
{Instructions}

#### 1b. {Sub-action}
{Instructions}

Report progress: "{item_type} {current} of {total} processed."

### 2. Verify completeness

After all items processed:
{Verification instructions}
```

---

## Rules for Step Files

| Rule | Limit |
|------|-------|
| Line count | < 200 (soft), 250 max (hard) |
| Self-contained | Understandable without reading other steps |
| Single goal | One sentence describes the entire step |
| SEQUENCE section | Always numbered, always present |
| NEXT pointer | Always present (body, not just frontmatter) |
| Variables | `{UPPER_SNAKE_CASE}` format |
| Hardcoded values | None — use workflow-context.md variables |
| Data file refs | `./data/{filename}.md` — relative to skill root |
| Step file refs | `./steps/step-{NN}-{name}.md` — relative to skill root |

---

## Common Patterns

### Loading a data file at the start of a step
```markdown
### 1. Load reference data

Read `./data/{filename}.md` before proceeding.
```

### HALT condition within a step
```markdown
<check if="{condition}">
  HALT: "{Error message explaining what is wrong and how to fix it.}"
</check>
```

### Conditional logic
```markdown
**If {condition A}:**
{Instructions for case A}

**If {condition B}:**
{Instructions for case B}
```

### Executing shell commands
```markdown
```bash
{FORGE_CLI} {command}
```

### Presenting a selection to the user
```markdown
| # | {Column1} | {Column2} |
|---|-----------|-----------|
| 1 | {value}   | {value}   |
| 2 | {value}   | {value}   |

Which {item_type} do you want to {action}?
```
