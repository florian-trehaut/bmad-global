# Step 03: Save Documentation to Linear

## STEP GOAL

Persist all produced documentation as Linear Documents in the Meta Project, updating existing documents when they match by title and creating new ones otherwise. Report completion with document links.

## RULES

- HALT on Linear write failure — never silently fallback
- Check for existing documents before creating (update if title matches)
- Each document in `{DOCS_CREATED}` must be saved individually
- Report each save result (created vs updated)

## SEQUENCE

### 1. Fetch existing documents from Linear

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{TRACKER_META_PROJECT_ID}")
```

Store the list of existing document titles and IDs for matching.

### 2. Save each document

For each document in `{DOCS_CREATED}`:

**Check if a document with the same title already exists.**

If a matching document exists:
```
{TRACKER_MCP_PREFIX}update_document(id: existing_doc_id, content: document_content)
```
Record as "updated".

If no matching document:
```
{TRACKER_MCP_PREFIX}create_document(title: "{document_title}", project: "{TRACKER_META_PROJECT}", content: document_content)
```
Record as "created".

If a Linear write fails for any document: **HALT** — report the error and which documents were already saved. The remaining content is still available in the conversation.

### 3. Report completion

Present:

```
Project documentation complete

Mode: {MODE}
Documents saved: {N}

{For each document:}
- {title} — {created|updated}
```

---

## END OF WORKFLOW

The bmad-document-project workflow is complete.
