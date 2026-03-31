---
nextStepFile: './step-02-fact-check.md'
---

# Step 1: Initialize — Ingest ADR & Setup

## STEP GOAL:

Accept ADR from any source, parse into normalized sections, create worktree for investigation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are an impartial reviewer — accept the ADR as-is, do not judge format
- Parse substance, not structure — the author may not use MADR template

### Step-Specific Rules:

- This step auto-proceeds to Step 2 after completion (no menu)
- ADR source detection must be automatic — do not ask the user to classify their input
- If the ADR is missing ALL required sections (context, options, decision), HALT

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before proceeding to next step

---

## MANDATORY SEQUENCE

### 1. Check for WIP Resume

```bash
ls /tmp/bmad-wip-adr-review-*.md 2>/dev/null
```

<check if="WIP file found">
  Present WIP state to user:

  > **Previous ADR review in progress:**
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

### 2. Accept ADR Source

If the user provided the ADR source in the initial prompt, use it. Otherwise ask:

> What ADR should I review? Provide one of:
> - A file path (e.g., `docs/adr/001-caching.md`)
> - An MR/PR number or URL
> - A tracker issue/document ID or URL
> - A branch name (I'll find the ADR in the diff)
> - Paste the ADR text directly

WAIT for user input.

### 3. Detect Source Type & Ingest

Detect the source type automatically:

| Input Pattern | Source Type | Ingestion Method |
|---------------|-----------|-----------------|
| URL containing `/pull/` or `/merge_requests/` | `mr` | `{FORGE_CLI} pr view {N} --json body` or read MR description |
| URL containing tracker domain or issue ID format | `tracker` | Tracker MCP or file read |
| Path ending in `.md` (or other text extension) | `file` | Direct file read |
| Branch name (no spaces, no URL) | `branch` | `git diff main...{branch} -- *.md` to find ADR file, then read |
| Multi-line text or unrecognized format | `text` | Use as-is |

Store `ADR_SOURCE_TYPE` and `ADR_RAW_CONTENT`.

<check if="ingestion fails (MR not found, file missing, etc.)">
  HALT: "Cannot access ADR source: {error}. Verify the source is accessible."
</check>

### 4. Parse ADR Sections

Normalize the raw ADR content into logical sections. The ADR may use any format — do not require MADR structure.

Map content to these sections (use fuzzy matching on headings):

| Section | Required | Heading Patterns |
|---------|----------|-----------------|
| `context` | YES | "Context", "Problem", "Background", "Motivation", "Why" |
| `decision_drivers` | NO | "Decision Drivers", "Criteria", "Constraints", "Requirements" |
| `options` | YES | "Options", "Alternatives", "Considered", "Approaches" |
| `decision` | YES | "Decision", "Outcome", "Chosen", "Selected", "Conclusion" |
| `justification` | YES | "Justification", "Rationale", "Why this option", "Reasoning" (may be inline in decision) |
| `consequences_positive` | NO | "Positive", "Benefits", "Pros", "Advantages" |
| `consequences_negative` | NO | "Negative", "Drawbacks", "Cons", "Disadvantages", "Trade-offs" |
| `risks` | NO | "Risks", "Mitigations", "Concerns" |
| `follow_up` | NO | "Follow-up", "Next Steps", "Actions", "TODO" |

Store `ADR_SECTIONS`.

### 5. Present Parsed Structure

Present the parsed structure to the user for confirmation:

> **ADR parsed — {N} sections identified:**
>
> | Section | Status | Content Preview |
> |---------|--------|----------------|
> | Context | {FOUND/MISSING} | {first 50 chars...} |
> | Options | {FOUND/MISSING} | {N options detected} |
> | Decision | {FOUND/MISSING} | {chosen option name} |
> | ... | ... | ... |
>
> {If any MISSING required sections:}
> **Warning:** Required section(s) missing: {list}. {If ALL 3 required missing: HALT.}

<check if="context AND options AND decision all MISSING">
  HALT: "This text does not appear to be an ADR — no context, options, or decision sections found. Verify the source contains an architecture decision record."
</check>

### 6. Load Existing ADRs for Conflict Check

Check `adr_location` from workflow-context.md.

<check if="adr_location is set and not 'none'">
  Load all existing ADRs from the configured location.
  Store as `EXISTING_ADRS` — Step 3 (evaluate) will check if the reviewed ADR conflicts with or supersedes any existing ADR.
  When multiple ADRs on the same topic, the most recent takes precedence.
</check>

### 7. Create Worktree

Derive slug from ADR title or source:
```bash
SLUG={kebab-case of ADR title, max 30 chars}
WORKTREE_PATH="../{WORKTREE_PREFIX}-review-adr-{SLUG}"
```

```bash
git fetch origin
git worktree add {WORKTREE_PATH} origin/main --detach
```

Store `WORKTREE_PATH`. From this point, all codebase investigation runs inside the worktree.

### 8. Save WIP

Create WIP file at `/tmp/bmad-wip-adr-review-{SLUG}.md`:

```yaml
---
title: "ADR Review: {adr_title}"
slug: "{SLUG}"
created: "{date}"
status: in-progress
stepsCompleted: [1]
worktree_path: "{WORKTREE_PATH}"
adr_source_type: "{ADR_SOURCE_TYPE}"
adr_source_reference: "{source_reference}"
---
```

### 9. Proceed

Load, read entire file, execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- ADR ingested from any source type
- Sections parsed and presented to user
- Worktree created for investigation
- WIP file saved

### FAILURE:

- Asking user to classify source type (should be auto-detected)
- Requiring MADR format
- Not creating worktree
- Auto-proceeding without presenting parsed structure
