# Step 2: Context Gathering (Direct Mode)

**Goal:** Quickly gather context for direct instructions — files, patterns, dependencies.

**Note:** This step only runs for Mode B (direct instructions). If `{execution_mode}` is "tech-spec", this step was skipped.

---


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Context Gathering (Direct Mode) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## AVAILABLE STATE

From step-01:
- `{baseline_commit}` - Git HEAD at workflow start
- `{execution_mode}` - Should be "direct"

---

## EXECUTION SEQUENCE

### 1. Identify Files to Modify

Based on user's direct instructions:
- Search for relevant files using glob/grep
- Identify the specific files that need changes
- Note file locations and purposes

### 2. Find Relevant Patterns

Examine the identified files and their surroundings:
- Code style and conventions used
- Existing patterns for similar functionality
- Import/export patterns
- Error handling approaches
- Test patterns (if tests exist nearby)

Using `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION), cross-reference with documented patterns and forbidden patterns.

### 3. Search for Prior Closed/Rejected PRs

If the task relates to an existing issue or feature, search for prior closed/rejected PRs:

```bash
git log --all --oneline --grep="{keywords}" -- . | head -20
```

Also search the forge if available:

```bash
{FORGE_CLI} pr list --state closed --search "{keywords}" 2>/dev/null || true
```

If found, note the approach taken and why it was rejected/closed. This informs the plan.

### 4. Load Contribution Conventions (if available)

Search for contribution guidelines that constrain how code is submitted:

```bash
ls CONTRIBUTING.md .github/CONTRIBUTING.md .github/pull_request_template.md dangerfile.js dangerfile.ts 2>/dev/null
```

If found, note PR requirements, CI linter rules, commit message rules. These apply when presenting the final output.

### 5. Load Architecture Decision Records (if available)

Check `adr_location` from workflow-context.md (if loaded).

If ADRs exist, load them. When multiple ADRs on the same topic, the most recent takes precedence. Note which ADRs are relevant to the task.

### 6. Note Dependencies

Identify:
- External libraries used
- Internal module dependencies
- Configuration files that may need updates
- Related files that might be affected

### 7. Create Plan

Synthesize gathered context into:
- List of tasks to complete
- Acceptance criteria (inferred from user request)
- Order of operations
- Files to touch

---

## PRESENT PLAN

Display to user:

```
**Context Gathered:**

**Files to modify:**
- {list files}

**Patterns identified:**
- {key patterns}

**Plan:**
1. {task 1}
2. {task 2}
...

**Inferred AC:**
- {acceptance criteria}

Ready to execute? (y/n/adjust)
```

- **y:** Proceed to execution
- **n:** Gather more context or clarify
- **adjust:** Modify the plan based on feedback

---

## NEXT STEP DIRECTIVE

When user confirms ready:
- **y:** "**NEXT:** Read fully and follow: `step-02b-evidence.md`" (lightweight Phase B pass before execution)
- **n/adjust:** Continue gathering context, then re-present plan

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Context Gathering (Direct Mode)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02b-evidence.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
