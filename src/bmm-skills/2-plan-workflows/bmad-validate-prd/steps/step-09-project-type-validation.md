---
nextStepFile: './step-10-smart-validation.md'
projectTypesData: '../data/project-types.csv'
---

# Step 9: Project-Type Compliance Validation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: Project-Type Compliance Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate project-type specific requirements are properly documented -- different project types (api_backend, web_app, mobile_app, etc.) have different required and excluded sections.

## RULES

- Load project types data from CSV before validation
- Validate both required sections (must be present) and excluded sections (must be absent)
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Load Project Types Data

Load and read the complete file at `{projectTypesData}`.

This CSV contains detection signals, required sections, skip/excluded sections, and innovation signals for each project type. Internalize this data -- it drives what sections must be present or absent.

### 2. Extract Project Type Classification

From PRD frontmatter, extract `classification.projectType`.

Common project types: api_backend, web_app, mobile_app, desktop_app, data_pipeline, ml_system, library_sdk, infrastructure, other.

If no projectType classification found, assume "web_app" (most common) and note in findings.

### 3. Determine Required and Excluded Sections from CSV Data

From loaded project-types.csv data, for this project type:

**Required sections:** (from required_sections column) -- these MUST be present in the PRD.

**Skip sections:** (from skip_sections column) -- these MUST NOT be present in the PRD.

Example mappings from CSV:
- api_backend: Required=[endpoint_specs, auth_model, data_schemas], Skip=[ux_ui, visual_design]
- mobile_app: Required=[platform_reqs, device_permissions, offline_mode], Skip=[desktop_features, cli_commands]
- cli_tool: Required=[command_structure, output_formats, config_schema], Skip=[visual_design, ux_principles, touch_interactions]

### 4. Validate Against CSV-Based Requirements

Based on project type:

**api_backend:**
- Required: Endpoint Specs, Auth Model, Data Schemas, API Versioning
- Excluded: UX/UI sections, mobile-specific sections

**web_app:**
- Required: User Journeys, UX/UI Requirements, Responsive Design
- Excluded: None typically

**mobile_app:**
- Required: Mobile UX, Platform specifics (iOS/Android), Offline mode
- Excluded: Desktop-specific sections

**desktop_app:**
- Required: Desktop UX, Platform specifics (Windows/Mac/Linux)
- Excluded: Mobile-specific sections

**data_pipeline:**
- Required: Data Sources, Data Transformation, Data Sinks, Error Handling
- Excluded: UX/UI sections

**ml_system:**
- Required: Model Requirements, Training Data, Inference Requirements, Model Performance
- Excluded: UX/UI sections (unless ML UI)

**library_sdk:**
- Required: API Surface, Usage Examples, Integration Guide
- Excluded: UX/UI sections, deployment sections

**infrastructure:**
- Required: Infrastructure Components, Deployment, Monitoring, Scaling
- Excluded: Feature requirements (this is infrastructure, not product)

### 5. Attempt Sub-Process Validation

"Perform project-type compliance validation for {projectType}:

**Check that required sections are present:**
{List required sections for this project type}
For each: Is it present in PRD? Is it adequately documented?

**Check that excluded sections are absent:**
{List excluded sections for this project type}
For each: Is it absent from PRD? (Should not be present)

Build compliance table showing:
- Required sections: [Present/Missing/Incomplete]
- Excluded sections: [Absent/Present] (Present = violation)

Return compliance table with findings."

If no Task tool, manually check PRD for required and excluded sections.

### 6. Build Compliance Table

**Required sections check:**
- For each required section: Present / Missing / Incomplete
- Count: Required sections present vs total required

**Excluded sections check:**
- For each excluded section: Absent / Present (violation)
- Count: Excluded sections present (violations)

**Total compliance score:**
- Required: {present}/{total}
- Excluded violations: {count}

### 7. Report Project-Type Compliance Findings to Validation Report

Append to validation report:

```markdown
## Project-Type Compliance Validation

**Project Type:** {projectType}

### Required Sections

**{Section 1}:** [Present/Missing/Incomplete]
{If missing or incomplete: Note specific gaps}

**{Section 2}:** [Present/Missing/Incomplete]
{If missing or incomplete: Note specific gaps}

[Continue for all required sections]

### Excluded Sections (Should Not Be Present)

**{Section 1}:** [Absent/Present]
{If present: This section should not be present for {projectType}}

**{Section 2}:** [Absent/Present]
{If present: This section should not be present for {projectType}}

[Continue for all excluded sections]

### Compliance Summary

**Required Sections:** {present}/{total} present
**Excluded Sections Present:** {violations} (should be 0)
**Compliance Score:** {percentage}%

**Severity:** [Critical if required sections missing, Warning if incomplete, Pass if complete]

**Recommendation:**
[If Critical] "PRD is missing required sections for {projectType}. Add missing sections to properly specify this type of project."
[If Warning] "Some required sections for {projectType} are incomplete. Strengthen documentation."
[If Pass] "All required sections for {projectType} are present. No excluded sections found."
```

### 8. Display Progress and Auto-Proceed

Display: "**Project-Type Compliance Validation Complete**

Project Type: {projectType}
Compliance: {score}%

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-09-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-09-EXIT PASSED — completed Step 9: Project-Type Compliance Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
