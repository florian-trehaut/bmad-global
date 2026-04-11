---
nextStepFile: './step-02-project-classification.md'
---

# Step 1: Mode Detection

## STEP GOAL

Detect whether a previous scan session exists, offer to resume if applicable, and determine the workflow mode (initial_scan, full_rescan, or deep_dive).

## RULES

- HALT and wait for user selection at every menu -- never auto-select
- State files older than 24 hours are automatically archived
- If the user already specified intent in their initial request, confirm rather than re-asking
- Resume mode loads cached project_type_id(s) from the state file to avoid re-detection

## SEQUENCE

### 1. Check for existing state file

Look for an existing state file at: `{project_knowledge}/project-scan-report.json`

**If state file exists:**

Read state file and extract: `timestamps`, `mode`, `scan_level`, `current_step`, `completed_steps`, `project_classification`, and cached `project_types` array.

Calculate age of state file: `current time - last_updated`.

**If age >= 24 hours:**

Display: "Found old state file (>24 hours). Archiving and starting fresh."

Create archive directory: `{project_knowledge}/.archive/`

Move old state file to: `{project_knowledge}/.archive/project-scan-report-{timestamp}.json`

Set `resume_mode = false`. Continue to section 2.

**If age < 24 hours:**

Present resume menu:

```
I found an in-progress workflow state from {last_updated}.

Current Progress:
- Mode: {mode}
- Scan Level: {scan_level}
- Completed Steps: {completed_steps_count}/{total_steps}
- Last Step: {current_step}
- Project Type(s): {cached_project_types}

Would you like to:
1. Resume from where we left off - Continue from step {current_step}
2. Start fresh - Archive old state and begin new scan
3. Cancel - Exit without changes

Your choice [1/2/3]:
```

WAIT for user selection.

**If user selects 1 (Resume):**
- Set `resume_mode = true`, `workflow_mode = {mode from state}`
- Load findings summaries from state file
- Load cached `project_type_id(s)` from state file
- For each cached `project_type_id`, load ONLY the corresponding row from `./data/documentation-requirements.csv`
- Skip full CSV load and project detection (not needed on resume)
- Display: "Resuming {workflow_mode} from {current_step} with cached project type(s): {cached_project_types}"
- If `workflow_mode == deep_dive`: jump to `./step-04-deep-dive.md` with resume context
- Otherwise: jump to the step file matching `current_step` with resume context

**If user selects 2 (Start fresh):**
- Create archive directory: `{project_knowledge}/.archive/`
- Move old state file to archive with timestamp
- Set `resume_mode = false`. Continue to section 2.

**If user selects 3 (Cancel):**
- Display: "Exiting workflow without changes."
- Exit workflow.

**If no state file exists:**

Set `resume_mode = false`. Continue to section 2.

### 2. Check for existing documentation

Check if `{project_knowledge}/index.md` exists.

**If index.md exists:**

Read existing index.md to extract metadata (date, project structure, parts count). Store as `{existing_doc_date}`, `{existing_structure}`.

Present mode menu:

```
I found existing documentation generated on {existing_doc_date}.

What would you like to do?

1. Re-scan entire project - Update all documentation with latest changes
2. Deep-dive into specific area - Detailed documentation for a particular feature/module/folder
3. Cancel - Keep existing documentation as-is

Your choice [1/2/3]:
```

WAIT for user selection.

- **If 1:** Set `workflow_mode = "full_rescan"`. Continue to section 3.
- **If 2:** Set `workflow_mode = "deep_dive"`, `scan_level = "exhaustive"`. Jump to `./step-04-deep-dive.md`.
- **If 3:** Display: "Keeping existing documentation. Exiting workflow." Exit workflow.

**If index.md does not exist:**

Set `workflow_mode = "initial_scan"`. Continue to section 3.

### 3. Select scan level

Present scan level menu (only for `initial_scan` and `full_rescan` modes):

```
Choose your scan depth level:

1. Quick Scan (2-5 minutes) [DEFAULT]
   Pattern-based analysis without reading source files.
   Scans: Config files, package manifests, directory structure.
   Best for: Quick project overview, initial understanding.

2. Deep Scan (10-30 minutes)
   Reads files in critical directories based on project type.
   Scans: All critical paths from documentation requirements.
   Best for: Comprehensive documentation for brownfield PRD.

3. Exhaustive Scan (30-120 minutes)
   Reads ALL source files in project.
   Scans: Every source file (excludes node_modules, dist, build).
   Best for: Complete analysis, migration planning, detailed audit.

Your choice [1/2/3] (default: 1):
```

WAIT for user selection.

- **If 1 or Enter:** Set `scan_level = "quick"`.
- **If 2:** Set `scan_level = "deep"`.
- **If 3:** Set `scan_level = "exhaustive"`.

### 4. Proceed

Store `workflow_mode` and `scan_level` for use by subsequent steps.

Load, read entire file, then execute `{nextStepFile}`.
