# Step 2: Load Context

## STEP GOAL

Load ALL available context needed to enrich the story: Project Context from Meta Project, PRD + Architecture + UX from the Epic's Project, completed stories from the same epic, and recent git history. This is the knowledge foundation for the analysis and enrichment steps.

## RULES

- Load documents from the tracker first; fall back to local files only if tracker documents are missing
- Completed stories provide learnings, patterns established, and regressions to watch for
- Git log provides context about recent changes in files related to this epic
- Do NOT analyze yet — just load and store. Analysis happens in step 03.

## SEQUENCE

### 1. Load Project Context from Meta Project

1. List documents in Meta Project: `{TRACKER_MCP_PREFIX}list_documents(projectId: {TRACKER_META_PROJECT_ID})`
2. Find the document named "Project Context" (or similar)
3. Load its content: `{TRACKER_MCP_PREFIX}get_document(id: doc_id)`
4. Store as `PROJECT_CONTEXT`

**HALT if not found:** "Project Context document not found in Meta Project. This document is required for story enrichment."

### 2. Load Epic documents (PRD, Architecture, UX)

1. List documents in the Epic's Project: `{TRACKER_MCP_PREFIX}list_documents(projectId: PROJECT_ID)`
2. For each of the following, find and load:
   - **PRD** — search for document containing "PRD" in the title
   - **Architecture** — search for document containing "Architecture" in the title
   - **UX Design** — search for document containing "UX" in the title
3. Store as `EPIC_PRD`, `EPIC_ARCHITECTURE`, `EPIC_UX`

If PRD is not found: **HALT** — "PRD document not found for epic {PROJECT_NAME}. A PRD is required before story enrichment."

If Architecture is not found: **HALT** — "Architecture document not found for epic {PROJECT_NAME}. An Architecture doc is required before story enrichment."

UX Design is optional — note if missing but do not halt.

### 3. Load completed stories from same epic

1. List Done issues in the same project: `{TRACKER_MCP_PREFIX}list_issues(project: PROJECT_NAME, state: 'Done', limit: 20)`
2. For each completed story, review its description for:
   - Patterns established (architecture decisions, naming conventions)
   - Lessons learned (what went wrong, workarounds applied)
   - Infrastructure created (services, migrations, secrets)
   - Regressions to watch for
3. Store as `COMPLETED_STORIES` (summary, not full descriptions)

If no completed stories exist, note this — it means this is likely the first story in the epic.

### 4. Load git history for related files

1. Identify keywords from `PROJECT_NAME` and `ISSUE_TITLE`
2. Search recent git log for commits related to this epic:
   ```
   git log --oneline -30 --grep="{EPIC_SLUG}" --grep="{ISSUE_PREFIX}" --all
   ```
3. If the epic has known service directories, check recent changes:
   ```
   git log --oneline -20 -- apps/{relevant_service}/
   ```
4. Store as `GIT_CONTEXT` (commit summaries, not diffs)

### 5. Load existing issue description

1. Read the current issue description from the issue fetched in step 01
2. Store as `CURRENT_DESCRIPTION`
3. Check if it already has a "Contexte business" section (from QuickSpec)
   - If present, flag `HAS_BUSINESS_CONTEXT = true` — this section will be preserved as-is
   - If absent, flag `HAS_BUSINESS_CONTEXT = false` — it will be synthesized from PRD

### 6. Summary of loaded context

Log internally what was loaded:

- Project Context: loaded / not found
- PRD: loaded / not found
- Architecture: loaded / not found
- UX Design: loaded / not found / not applicable
- Completed stories: N stories found
- Git context: N relevant commits found
- Business context: preserved from existing / will synthesize

No user checkpoint here — proceed directly to analysis.

---

**Next:** Read fully and follow `./step-03-analyze.md`
