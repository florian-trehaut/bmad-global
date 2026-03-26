# Step 03: Save Documentation to the Tracker

## STEP GOAL

Persist all produced documentation as tracker documents in the meta project, updating existing documents when they match by title and creating new ones otherwise. Report completion with document links.

## RULES

- HALT on tracker write failure — never silently fallback
- Check for existing documents before creating (update if title matches)
- Each document in `{DOCS_CREATED}` must be saved individually
- Report each save result (created vs updated)

## SEQUENCE

### 1. Fetch existing documents from the tracker

List documents in the Meta Project (using CRUD patterns from tracker.md):
- Operation: List documents
- Project: {TRACKER_META_PROJECT_ID}

Store the list of existing document titles and IDs for matching.

### 2. Save each document

For each document in `{DOCS_CREATED}`:

**Check if a document with the same title already exists.**

If a matching document exists, update it in the tracker (using CRUD patterns from tracker.md):
- Operation: Update document
- Document: existing_doc_id
- Content: document_content

Record as "updated".

If no matching document, create it in the tracker (using CRUD patterns from tracker.md):
- Operation: Create document
- Title: {document_title}
- Project: {TRACKER_META_PROJECT}
- Content: document_content

Record as "created".

If a tracker write fails for any document: **HALT** — report the error and which documents were already saved. The remaining content is still available in the conversation.

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
