# Step 2e: Load Context (Enrichment Mode Only)

## STEP GOAL

Load ALL available context needed to enrich the story: Project Context from Meta Project, PRD + Architecture + UX from the Epic's Project, completed stories from the same epic, recent git history, and prior MRs. This is the knowledge foundation for analysis and enrichment.

## RULES

- Load documents from the tracker first; fall back to local files only if tracker documents are missing
- Completed stories provide learnings, patterns established, and regressions to watch for
- Git log provides context about recent changes in files related to this epic
- Do NOT analyze yet — just load and store. Analysis happens in steps 4-6.

## SEQUENCE

### 1. Load Project Context from Meta Project

1. List documents in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) — Operation: List documents, Project: {TRACKER_META_PROJECT_ID}
2. Find the document named "Project Context" (or similar)
3. Load its content by document ID
4. Store as `PROJECT_CONTEXT`

**HALT if not found:** "Project Context document not found in Meta Project. This document is required for story enrichment."

### 2. Load Epic documents (PRD, Architecture, UX)

1. List documents in the Epic's Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) — Operation: List documents, Project: PROJECT_ID
2. For each of the following, find and load:
   - **PRD** — search for document containing "PRD" in the title
   - **Architecture** — search for document containing "Architecture" in the title
   - **UX Design** — search for document containing "UX" in the title
3. Store as `EPIC_PRD`, `EPIC_ARCHITECTURE`, `EPIC_UX`

If PRD is not found: **HALT** — "PRD document not found for epic {PROJECT_NAME}. A PRD is required before story enrichment."

If Architecture is not found: **HALT** — "Architecture document not found for epic {PROJECT_NAME}. An Architecture doc is required before story enrichment."

UX Design is optional — note if missing but do not halt.

### 3. Load completed stories from same epic

1. List Done issues in the same project from the tracker — Operation: List issues, Project: {PROJECT_NAME}, Status: {TRACKER_STATES.done}, Limit: 20
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

### 5. Search for prior closed/rejected MRs on same issue

Search the forge for closed MRs related to this issue — prior attempts surface rejected approaches and reviewer objections:

```bash
{FORGE_CLI} mr list --state closed --search "{ISSUE_IDENTIFIER}" 2>/dev/null || true
```

If found, extract: approach taken, rejection reason, reviewer comments. Store as `PRIOR_MRS`. If a prior approach was rejected, the story should note it as a guardrail.

### 6. Load existing issue description

1. Read the current issue description from the issue fetched in step 01
2. Store as `CURRENT_DESCRIPTION`
3. Check if it already has a "Contexte business" section:
   - If present, flag `HAS_BUSINESS_CONTEXT = true` — this section will be preserved as-is
   - If absent, flag `HAS_BUSINESS_CONTEXT = false` — it will be synthesized from PRD

### 7. Summary of loaded context

Log internally what was loaded:

- Project Context: loaded / not found
- PRD: loaded / not found
- Architecture: loaded / not found
- UX Design: loaded / not found / not applicable
- Completed stories: N stories found
- Git context: N relevant commits found
- Prior MRs: N found
- Business context: preserved from existing / will synthesize

No user checkpoint here — proceed directly.

---

**Next:** Read fully and follow `./step-03-setup-worktree.md`
