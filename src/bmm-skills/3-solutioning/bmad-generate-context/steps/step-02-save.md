# Step 02: Compile and Save to the Tracker

## STEP GOAL

Compile all scan findings into a lean project-context.md document optimized for LLM consumption, then persist it as a tracker document in the Meta Project.

## RULES

- HALT on tracker write failure — never silently fallback
- Document must be lean — optimize for signal-to-noise ratio
- Check for existing document before creating (update if exists)
- Structure must be scannable — headers, tables, bullet points over prose

## SEQUENCE

### 1. Compile project-context.md

Structure the document as follows:

```markdown
# Project Context — {PROJECT_NAME}

Generated: {current_date}

## Stack Overview

{Table: service | framework | ORM | DB | port}

## Architecture

{Layer structure, DI patterns, domain modeling approach}

## Conventions

{Import style, naming, file organization, formatting deviations}

## Test Architecture

{Table: type | framework | suffix | location | run command}

## Shared Code

{Packages, libs, cross-cutting concerns}

## Gotchas

{Numbered list of non-obvious things that would trip up an LLM}

## Reference vs Legacy

{What to copy patterns from, what to avoid}
```

Apply user corrections from the checkpoint if any were given.

### 2. Check for existing document in the tracker

Search for an existing "Project Context" document in the Meta Project:

List documents in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {TRACKER_META_PROJECT_ID}

Look for a document titled `Project Context`.

### 3. Save or update the document

If a matching document exists, update it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update document
- Document: existing_doc_id
- Content: compiled_content

If no matching document, create it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: "Project Context"
- Project: {TRACKER_META_PROJECT}
- Content: compiled_content

If the tracker write fails: **HALT** — report the error to the user. The compiled content is still available in the conversation.

### 4. Report completion

Present:

```
Project Context generated and published

- Tracker document: Project Context
- Sections: {N} sections
- Gotchas: {N} items documented
- Services covered: {N}
```

---

## END OF WORKFLOW

The bmad-generate-context workflow is complete.
