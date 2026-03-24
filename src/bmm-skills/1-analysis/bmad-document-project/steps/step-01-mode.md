# Step 01: Choose Documentation Mode

## STEP GOAL

Present the user with documentation mode options and gather the parameters needed for execution. The mode determines the scope and depth of documentation produced.

## RULES

- HALT and wait for user selection — never auto-select a mode
- If the user already specified a mode or area in their initial request, confirm it rather than re-asking
- Deep dive mode requires a specific target area

## SEQUENCE

### 1. Check for existing documentation

Search for existing documentation in the Meta Project:

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{TRACKER_META_PROJECT_ID}")
```

Identify any documents that look like project documentation (titles containing "Documentation", "Architecture", "Service:", "Module:", etc.). Store as `{EXISTING_DOCS}`.

### 2. Present mode selection

Present the following options to the user:

```
Project Documentation — Mode Selection

Existing documentation found: {N} documents
{list titles if any}

Available modes:

1. Initial Scan
   First-time documentation. Scans the entire codebase and produces
   a high-level overview document covering all services, architecture,
   and key patterns. Best for projects with no existing documentation.

2. Full Rescan
   Re-documents the entire project from scratch. Replaces all existing
   documentation. Use when the codebase has changed significantly
   since the last documentation pass.

3. Deep Dive
   Focuses on a specific area (service, module, subsystem, data flow)
   and produces detailed documentation for that area only.
   Requires specifying the target area.

Which mode? (1/2/3)
```

WAIT for user selection.

### 3. Gather mode-specific parameters

**If mode = Initial Scan (1):**
- Confirm with user: "This will produce a high-level overview of the entire project. Proceed?"
- Set `{MODE}` = `initial_scan`

**If mode = Full Rescan (2):**
- Warn: "This will replace existing documentation ({N} documents). Existing documents will be updated, not deleted."
- Set `{MODE}` = `full_rescan`

**If mode = Deep Dive (3):**
- Ask: "Which area should I deep dive into? Examples: a service name (e.g., 'trigger-service'), a module (e.g., 'authentication'), a data flow (e.g., 'order lifecycle'), or a subsystem (e.g., 'messaging infrastructure')."
- WAIT for user response. Store as `{DEEP_DIVE_TARGET}`.
- Verify the target exists in the codebase by scanning the directory structure.
- **HALT if target not found:** "Cannot find '{DEEP_DIVE_TARGET}' in the codebase. Please specify a valid service, module, or subsystem."
- Set `{MODE}` = `deep_dive`

WAIT for user confirmation before proceeding.

---

**Next:** Read fully and follow `./step-02-execute.md`
