---
nextStepFile: './step-02-context.md'
---

# Step 1: Initialize — Accept Context & Setup


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Initialize — Accept Context & Setup with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Accept the decision context (from user or calling workflow), load existing ADRs, detect numbering convention, determine ADR location, create WIP file.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a collaborative ADR facilitator — understand what decision is needed
- Auto-detect sub-workflow mode from conversation context — do not ask the user to classify

### Step-Specific Rules:

- This step auto-proceeds to Step 2 after completion (no menu)
- ADR location must be validated before proceeding
- Numbering convention must be detected from existing ADRs

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before proceeding to next step

---

## MANDATORY SEQUENCE

### 1. Check for WIP Resume

```bash
ls /tmp/bmad-wip-create-adr-*.md 2>/dev/null
```

<check if="WIP file found">
  Present WIP state to user:

  > **Previous ADR creation in progress:**
  > - ADR: {adr_title}
  > - Last step: {last_step}
  > - Started: {date}
  >
  > **[R]** Resume | **[A]** Archive and start fresh | **[D]** Delete and start fresh

  WAIT for user selection.

  - **R**: Load WIP state, skip to indicated step
  - **A**: Rename WIP to `.archive-{date}`, proceed as new
  - **D**: Delete WIP, proceed as new
</check>

### 2. Detect Invocation Mode

Analyze the initial prompt:

- If the prompt contains a decision description from a parent workflow (e.g., "invoke `bmad-create-adr`", or a `[A]` menu selection context): set `INVOCATION_MODE = "sub-workflow"`, extract `CALLING_WORKFLOW` name and the decision context.
- Otherwise: set `INVOCATION_MODE = "standalone"`.

### 3. Accept Decision Context

**If sub-workflow mode:** Extract the decision description from the calling workflow's context. Present it for confirmation: "I understand we need an ADR for: {decision_description}. Is this correct?"

**If standalone mode:** Ask: "What architectural decision needs to be recorded? Describe the situation — what needs to be decided and why."

WAIT for user input.

### 4. Validate ADR Location

Check `ADR_LOCATION` from workflow-context.md.

<check if="ADR_LOCATION is set and not 'none'">
  Verify the path exists:
  ```bash
  ls -d {ADR_LOCATION} 2>/dev/null
  ```
  If path exists: store `ADR_LOCATION`. Inform user: "ADRs will be written to `{ADR_LOCATION}`."
  If path does not exist: ask user to create it or provide an alternative.
</check>

<check if="ADR_LOCATION is 'none' or not set">
  Ask user: "No ADR location is configured. Where should ADRs be stored? Provide a directory path (e.g., `docs/decisions/`)."

  WAIT for input.

  If user provides a path: store as `ADR_LOCATION`. Create the directory if it does not exist.
  If user declines: HALT — "ADR creation requires a destination directory."
</check>

**Format detection:**
- If `ADR_FORMAT` is set and not "unknown": use it.
- If "unknown" or not set: default to `madr`. Inform user: "No ADR format configured — defaulting to MADR (Markdown Any Decision Record)."

### 5. Load Existing ADRs

If `ADR_LOCATION` is a filesystem path:

```bash
ls {ADR_LOCATION}/*.md 2>/dev/null
```

For each `.md` file found:
- Parse the filename for numbering pattern (e.g., `0001-title.md`, `001-title.md`, `title.md`)
- Read the first 10 lines to extract title and status
- Store as `EXISTING_ADRS` list: `{number, title, status, filename}`

**Detect numbering convention:**
- If files follow `NNNN-*.md` (4-digit): use 4-digit zero-padded
- If files follow `NNN-*.md` (3-digit): use 3-digit zero-padded
- If no numbered files exist: start with `0001` (4-digit, MADR convention)

Compute `NEXT_ADR_NUMBER` = max existing number + 1.

**Flag potential conflicts:** Identify any existing ADR whose title relates to the current decision topic. These will be checked in step-02.

### 6. Derive Slug

From the decision description, derive a kebab-case slug (max 40 chars). Example: "Use Redis for session caching" → `use-redis-for-session-cache`.

Store `SLUG`.

### 7. Save WIP

Create WIP file at `/tmp/bmad-wip-create-adr-{SLUG}.md`:

```yaml
---
title: "ADR: {decision_title}"
slug: "{SLUG}"
created: "{date}"
status: in-progress
stepsCompleted: [1]
invocation_mode: "{INVOCATION_MODE}"
calling_workflow: "{CALLING_WORKFLOW or null}"
adr_location: "{ADR_LOCATION}"
adr_format: "{ADR_FORMAT}"
next_number: "{NEXT_ADR_NUMBER}"
---
```

### 8. Proceed

Present summary:

> **ADR initialization complete:**
> - Decision: {decision_title}
> - Location: `{ADR_LOCATION}`
> - Format: {ADR_FORMAT}
> - Next number: {NEXT_ADR_NUMBER}
> - Existing ADRs: {count} found
> - Mode: {INVOCATION_MODE}

Load, read entire file, execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Decision context accepted (from user or caller)
- ADR location validated or created
- Existing ADRs loaded and numbered
- Numbering convention detected
- WIP saved

### FAILURE:

- Asking user to classify invocation mode
- Not validating ADR location exists
- Not detecting numbering convention
- Not flagging potential conflicts with existing ADRs

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Initialize — Accept Context & Setup
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
