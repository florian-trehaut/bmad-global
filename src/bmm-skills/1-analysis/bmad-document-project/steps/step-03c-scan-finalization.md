---
nextStepFile: './step-04-deep-dive.md'
---

# Step 3c: Scan Finalization

## STEP GOAL

Generate the master index document, validate all generated documentation against the checklist, detect incomplete items, and offer to complete them. This step loops until the user is satisfied or chooses to finalize.

## RULES

- The index.md is the primary AI retrieval source -- it must link all generated documents
- Missing documents must be marked with the exact marker: `_(To be generated)_`
- Validation uses the checklist from `./data/validation-checklist.md`
- This step loops (validate -> offer completion -> re-validate) until user finalizes
- HALT and wait for user input at every menu

## SEQUENCE

### 1. Generate master index

Load template from `./templates/index.md` for output structure.

Before writing, check which expected files actually exist on disk. Set existence flags for each expected document. Track missing files in `{missing_docs_list}`.

Create `index.md` with intelligent navigation based on project structure:

**For single-part projects:** Generate simple index with project name, type, quick reference (tech stack, architecture), links to all generated and existing docs, getting started section.

**For multi-part projects:** Generate comprehensive index with project overview, part-based navigation, quick reference by part, cross-part integration links, getting started per part.

**Incomplete documentation marker convention:**
When a document SHOULD be generated but was not (due to quick scan, missing data, or conditional requirements not met), use EXACTLY this marker at the end of the markdown link line: `_(To be generated)_`

IMMEDIATELY write `index.md` to disk. Validate that index has all required sections and links.

Update state file: add output "index.md".

### 2. Run validation

Read `./data/validation-checklist.md`.

Validate generated documentation against the checklist:

- Scan Level and Resumability
- Write-as-you-go Architecture
- Batching Strategy (if deep/exhaustive)
- Project Detection and Classification
- Technology Stack Analysis
- Architecture Documentation Quality
- Index and Navigation
- File Completeness
- Content Quality
- Brownfield PRD Readiness
- State File Quality

Track validation results: passed items, failed items, warnings.

### 3. Detect incomplete documentation

Read `{project_knowledge}/index.md`.

**Primary scan:** Search for exact pattern `_(To be generated)_` (case-sensitive).

**Fallback scan:** Search for fuzzy patterns in case of non-standard markers:

- `_(TBD)_`, `_(TODO)_`, `_(Coming soon)_`, `_(Not yet generated)_`, `_(Pending)_`

For each match, extract:

- Document title (text within [brackets])
- File path (from markdown link)
- Document type (inferred from filename)
- Part ID if applicable (extracted from filename)

Store in `{incomplete_docs_list}`.

### 4. Present summary and options

Show summary of all generated files with sizes.

```
Documentation generation complete!

Summary:
- Project Type: {project_type_summary}
- Parts Documented: {parts_count}
- Files Generated: {files_count}

{If incomplete_docs_list has items:}
Incomplete Documentation Detected:
{For each item:}
  N. {title} ({doc_type}{if part_id: for part_id})

{End if}

Would you like to:
{If incomplete items exist:}
1. Generate incomplete documentation - Complete any of the N items above
{End if}
2. Review any specific section [type section name]
3. Add more detail to any area [type area name]
4. Generate additional custom documentation [describe what]
5. Finalize and complete [type 'done']

Your choice:
```

WAIT for user selection.

### 5. Handle user selection

**If user selects "Generate incomplete documentation":**

Ask which items to generate (individual numbers, comma-separated, or "all").

For each selected item, route to the appropriate generation logic:

- `architecture`: Re-run architecture generation for the specific part
- `api-contracts`: Re-run API scan targeting the specific part
- `data-models`: Re-run data models scan
- `component-inventory`: Re-run component inventory generation
- `development-guide`: Re-run dev guide generation
- `deployment-guide`: Re-run deployment config scan
- `integration-architecture`: Re-run integration analysis

After generation:

- Confirm file was written successfully
- Update state file with newly generated output
- Read index.md, remove the `_(To be generated)_` marker from completed items
- Write updated index.md back to disk
- Display generation summary

Loop back to section 3 (re-scan for remaining incomplete items).

**If user requests review or additions (options 2-4):**

Make requested modifications, regenerate affected files, loop back to section 4.

**If user selects "Finalize" (option 5):**

Proceed to section 6.

### 6. Update state and proceed

Update state file:

- Add to `completed_steps`: `{"step": "step_03c", "status": "completed", "timestamp": "{now}", "summary": "Finalization complete: {total_docs} documents, {incomplete_count} marked incomplete"}`
- Update `current_step` to `"step_04"`
- Update `last_updated` timestamp

---

**Next:** Read fully and follow `{nextStepFile}`.
