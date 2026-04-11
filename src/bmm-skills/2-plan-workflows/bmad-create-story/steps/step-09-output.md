# Step 9: Publish to Tracker

## STEP GOAL

Create a new tracker issue (Discovery mode) or update an existing issue (Enrichment mode) with the composed description, then add a readiness comment.

## RULES

- FORBIDDEN: modifying spec content (that was Steps 7-8)
- FORBIDDEN: silently falling back to local file if tracker fails — HALT on failure
- The workflow NEVER sets state to 'Done'. Maximum state is Todo.

## SEQUENCE

### Discovery Mode Path

#### D1. Determine Issue Placement

Quick-spec creates **exactly one story** — which may be placed within an existing epic or left standalone.

Check if a `RELATED_EPIC` was identified in Step 2d.

**If related epic found:** use that epic for the story.

**If no related epic:**

Ask user:

> No epic identified. Options:
> 1. Create the story standalone (no epic)
> 2. Attach to an existing epic (I'll list them)
>
> Choice?

WAIT for user choice.

**File-based tracker (`{TRACKER}` == `file`):**

- IF 1: Write story file to `{TRACKER_STORY_LOCATION}/` with prefix `standalone-{slug}.md`
- IF 2: Read `{TRACKER_EPICS_FILE}`, present epic list, let user pick. Write story file with `{epic_number}-{next_story_number}-{slug}.md`

**MCP-based tracker:**

- IF 1: Set project to null, proceed
- IF 2: List epics/projects for team {TRACKER_TEAM}, let user pick, proceed

#### D2. Determine Priority

- bug → 2 (High) by default
- task/improvement → 3 (Normal) by default

Ask user to confirm or adjust.

#### D3. Determine Labels

- Type label: "Bug", "Task", "Improvement", "Feature"
- Client label if applicable (using the label prefix from `workflow-context.md`)

#### D4. Create the Tracker Issue

Create the issue in the tracker (using CRUD patterns from tracker.md):

- Operation: Create issue
- Title: {title}
- Team: {TRACKER_TEAM}
- Description: {composed_description}
- Priority: {priority}
- Labels: {labels}
- Project: {project_name_if_any}
- Status: {TRACKER_STATES.todo}
- Estimate: {estimate}

Store: `NEW_ISSUE_ID`, `NEW_ISSUE_IDENTIFIER`.

**If issue creation fails:** HALT — report error. Do NOT fallback to local file.

### Enrichment Mode Path

#### E1. Update Issue Description

1. Update the issue description in the tracker — Operation: Update issue, Issue: {ISSUE_ID}, Field: description, Value: enriched_description
2. Update the issue estimate — Operation: Update issue, Issue: {ISSUE_ID}, Field: estimate, Value: {estimate}
3. If the update fails due to size, try splitting: update description first, then add details as a comment

#### E2. Update Issue Status to Todo

Update the issue status — Operation: Update issue, Issue: {ISSUE_ID}, Status: {TRACKER_STATES.todo}

#### E3. Add Readiness Comment

Add a comment confirming the issue is ready (using CRUD patterns from tracker.md):

- Operation: Create comment
- Issue: {ISSUE_ID}
- Body: "Issue description enriched with tasks, guardrails, and technical requirements.\n\nRappel flux: Todo -> In Progress -> In Review -> To Test -> Done\n- Apres merge + deploy: la story passe en To Test\n- Les tests de Validation Metier doivent etre executes sur l'environnement cible (staging/production)\n- Done = validation metier OK (jamais automatique)\n\nReady for development."

#### E4. Check Epic Project Status

If this is the first story in the epic (no completed stories found in step 02e), check if the Project status in the tracker needs updating.

### Both Modes — Report Completion

Present the completion report:

```
## Story {created_or_enriched}

- Issue : {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
- Epic : {PROJECT_NAME or "Standalone"}
- Statut tracker : Todo
- Estimation : {estimate} points

### Contenu

- Acceptance Criteria : {N} BACs + {N} TACs
- Taches : {N} applicatives + {N} CI/CD & infra
- Guardrails : {N}
- Tests Validation Metier : {N}
- Fichiers attendus : {N}

### Issue Lifecycle

Todo -> In Progress -> In Review -> To Test -> Done

- After merge + deploy: the story moves to To Test
- Validation Metier tests must execute on the target environment
- Done = validation metier OK (never automatic)

### Prochaine etape

Lancez le workflow dev-story pour commencer l'implementation,
ou le workflow review-story pour une revue adversariale avant dev.
```

---

**Next:** Read fully and follow `./step-10-cleanup.md`
