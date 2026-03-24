# Step 02: Save Brief to Linear

## STEP GOAL

Persist the product brief as a Linear Document, either in a matching Project or in the Meta Project.

## RULES

- HALT on Linear write failure — never silently fallback
- Check if a matching Project exists before defaulting to Meta
- Document title: `Product Brief` (in Project) or `Product Brief: {title}` (in Meta)

## SEQUENCE

### 1. Determine target project

List projects to find a match:

```
{TRACKER_MCP_PREFIX}list_projects(team: "{TRACKER_TEAM}")
```

If a project matching the brief topic exists, save the document there.
Otherwise, save in the Meta Project.

### 2. Check for existing document

```
{TRACKER_MCP_PREFIX}list_documents(projectId: target_project_id)
```

Look for an existing `Product Brief` document.

### 3. Save or update

If exists:
```
{TRACKER_MCP_PREFIX}update_document(id: existing_doc_id, content: brief_content)
```

If not:
```
{TRACKER_MCP_PREFIX}create_document(title: document_title, project: target_project_name, content: brief_content)
```

If the Linear write fails: **HALT** — report the error.

### 4. Report completion

Present:

```
Product Brief créé

- Titre: {brief_title}
- Projet Linear: {target_project_name}
- Document: Product Brief

Prochaine étape : /bmad-create-prd pour transformer ce brief en PRD détaillé
```

---

## END OF WORKFLOW

The bmad-create-product-brief workflow is complete.
