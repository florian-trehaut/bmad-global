---
# Terminal step -- no nextStepFile
---

# Step 5: Output and Completion

## STEP GOAL

Verify all required documents have been generated based on the project type matrix, perform final state file update, and present the completion summary with document list and next steps.

## RULES

- Every generated file must be verified to exist on disk
- State file must be finalized with completion timestamp
- Present actionable next steps based on what was documented
- HALT if any critical document is missing and cannot be generated

## SEQUENCE

### 1. Verify document set

For each part, cross-reference the documentation requirements from the CSV against actual files on disk:

| Requirement flag         | Expected file                      | Exists? |
| ------------------------ | ---------------------------------- | ------- |
| (always)                 | `index.md`                         | check   |
| (always)                 | `project-overview.md`              | check   |
| (always)                 | `source-tree-analysis.md`          | check   |
| (always)                 | `architecture{-part_id}.md`        | check   |
| `requires_ui_components` | `component-inventory{-part_id}.md` | check   |
| (always)                 | `development-guide{-part_id}.md`   | check   |
| `requires_api_scan`      | `api-contracts{-part_id}.md`       | check   |
| `requires_data_models`   | `data-models{-part_id}.md`         | check   |
| deployment config found  | `deployment-guide.md`              | check   |
| contribution docs found  | `contribution-guide.md`            | check   |
| multi-part               | `integration-architecture.md`      | check   |
| multi-part               | `project-parts.json`               | check   |
| deep-dive performed      | `deep-dive-{target}.md`            | check   |

Track: `{verified_files}` (exist), `{missing_files}` (expected but absent).

If critical files are missing (index.md, project-overview.md, architecture), report and offer to regenerate.

### 2. Compile verification recap

Set variables:

- `{verification_summary}`: concrete tests, validations, or scripts executed during the workflow (or "none run")
- `{open_risks}`: any remaining risks or TODO follow-ups (or "none")
- `{next_checks}`: recommended actions before using the documentation (or "none")

### 3. Finalize state file

Update `{project_knowledge}/project-scan-report.json`:

```json
{
  "completed_steps": [
    ...existing...,
    {"step": "step_05", "status": "completed", "timestamp": "{now}", "summary": "Workflow complete. {files_count} files verified."}
  ],
  "current_step": "completed",
  "timestamps": {
    ...existing...,
    "completed": "{now}"
  },
  "outputs_generated": ["{complete list of all files written}"],
  "resume_instructions": "Workflow completed successfully"
}
```

### 4. Present completion summary

```
Project Documentation Complete

Location: {project_knowledge}/

Master Index: {project_knowledge}/index.md
  This is your primary entry point for AI-assisted development

Generated Documentation:
{For each verified file:}
  - {filename} ({size})

{If missing_files:}
Note: The following expected documents were not generated:
{For each missing file:}
  - {filename} (reason: {reason})
{End if}

Verification Recap:
- Tests/extractions executed: {verification_summary}
- Outstanding risks or follow-ups: {open_risks}
- Recommended next checks: {next_checks}

Next Steps:
1. Review index.md to familiarize yourself with the documentation structure
2. When creating a brownfield PRD, point the PRD workflow to: {project_knowledge}/index.md
3. For UI-only features: Reference architecture{-ui_part_id}.md
4. For API-only features: Reference architecture{-api_part_id}.md
5. For full-stack features: Reference all architecture docs + integration-architecture.md

Recommended Next Workflows:
- bmad-create-prd: Create a Product Requirements Document using this documentation as context
- bmad-create-architecture: Design or refine the architecture based on documented findings
- bmad-document-project (deep-dive): Run again in deep-dive mode for detailed analysis of specific areas

State file saved: {project_knowledge}/project-scan-report.json
The state file enables resuming or re-scanning in future sessions.
```

### 5. End of workflow

This is the terminal step. The bmad-document-project workflow is complete. The retrospective step (if applicable) is handled by the parent workflow.md.
