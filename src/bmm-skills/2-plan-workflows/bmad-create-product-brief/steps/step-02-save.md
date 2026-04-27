# Step 02: Save Brief to the Tracker

## STEP GOAL

Persist the product brief as a tracker document, either in a matching Project or in the Meta Project.

## RULES

- HALT on tracker write failure — never silently fallback
- Check if a matching Project exists before defaulting to Meta
- Document title: `Product Brief` (in Project) or `Product Brief: {title}` (in Meta)

## SEQUENCE

### 1. Determine target project

List epics/projects to find a match (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List epics/projects
- Team: {TRACKER_TEAM}

If a project matching the brief topic exists, save the document there.
Otherwise, save in the Meta Project.

### 2. Check for existing document

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: target_project_id

Look for an existing `Product Brief` document.

### 3. Save or update

If exists, update the document (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update document
- Document: existing_doc_id
- Content: brief_content

If not, create it (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: document_title
- Project: target_project_name
- Content: brief_content

If the tracker write fails: **HALT** — report the error.

### 4. Report completion

Present:

```
Product Brief créé

- Titre: {brief_title}
- Tracker project: {target_project_name}
- Document: Product Brief

Prochaine étape : /bmad-create-prd pour transformer ce brief en PRD détaillé
```

---

## END OF WORKFLOW

The bmad-create-product-brief workflow is complete.
