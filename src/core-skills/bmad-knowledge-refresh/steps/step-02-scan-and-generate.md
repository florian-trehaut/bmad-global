# Step 2: Scan and Generate Updates

## STEP GOAL

For each file in TARGET_FILES, read the existing knowledge file, re-run the relevant source scans, and generate an updated draft that preserves the file's structure while refreshing its content with current data. This step is fully automated — no user interaction.

---

## SEQUENCE

### 1. Load References

Read `../data/source-hash-mapping.md` for:
- Source file mapping (what to scan per knowledge file)
- Dependency graph (processing order)

### 2. Determine Processing Order

Process TARGET_FILES respecting the dependency graph:

**Tier 0 first** (in any order within the tier):
stack.md, infrastructure.md, conventions.md, domain-glossary.md, environment-config.md, tracker.md, comm-platform.md

**Tier 1 second** (after their parents are processed):
review-perspectives.md, investigation-checklist.md, validation.md, api-surface.md

This ensures that if a Tier 1 file depends on a freshly updated Tier 0 file, the scan uses the latest data.

### 3. For Each File in TARGET_FILES (in order)

#### a. Read Existing File

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename}`.

Store as `CURRENT_CONTENT`.

Extract the heading structure — all `##` and `###` headings in order. This is the structural skeleton to preserve.

#### b. Run Targeted Scan

Execute the scan logic for the specific knowledge file. Use `source_extensions` from stack.md (loaded during initialization) for dynamic grep scoping — do NOT hardcode file extensions.

**stack.md scan:**
- Read main package manifest (package.json, Cargo.toml, pyproject.toml, go.mod)
- Read all dependencies and devDependencies
- Read lint configs → active rules, severity
- Read formatter config → key options
- Read test configs → test roots, frameworks, coverage
- Read pre-commit config → hook commands
- Detect source file patterns from file extension distribution
- Classify architecture patterns from directory structure

**infrastructure.md scan:**
- Read all CI/CD workflow files → jobs, triggers, dependencies
- Read Dockerfiles → base images, build stages
- Read deployment configs
- Read .env.example → variable names (NOT values)
- Identify cloud service references

**conventions.md scan:**
- `git log --oneline -30` → detect commit message patterns
- Read .editorconfig if present
- Check PR template: `.github/pull_request_template.md`
- Analyze import ordering from a sample of source files
- Check branch naming: `git branch -r | head -20`

**domain-glossary.md scan:**
- Grep for entity/model definitions using detected source extensions
- Scan DTOs and request/response schemas
- Scan domain exceptions and errors
- Identify bounded contexts from directory structure

**api-surface.md scan:**
- Grep for route/endpoint definitions using detected source extensions
- Scan OpenAPI specs if present
- Check for new controllers, handlers, or route files

**review-perspectives.md scan:**
- Read the freshly updated stack.md (if it was refreshed in this run) or the existing one
- Identify security-relevant patterns (auth middleware, input validation)
- Identify forbidden patterns enforced by linter

**investigation-checklist.md scan:**
- Map directory structure: `find . -maxdepth 3 -type d | sort | grep -v node_modules | grep -v .git | grep -v vendor`
- Identify domain-specific areas and their key files

**tracker.md scan:**
- Read workflow-context.md tracker configuration section
- If file-based tracker: check sprint-status.yaml structure

**environment-config.md scan:**
- Scan environment references in code
- Read deployment configs for environment URLs
- Check for feature flag systems

**validation.md scan:**
- Read E2E config files (playwright.config.*, cypress.config.*)
- Read component test configs
- Scan for stack-specific test patterns using detected source extensions
- Identify test file naming and location patterns

**comm-platform.md scan:**
- Read workflow-context.md communication platform section

#### c. Generate Updated Draft

Build the updated file by merging scan results with existing content:

1. **Start with the existing heading structure** — preserve all `##` and `###` headings in their current order

2. **For each section** (content between two headings):
   - If scan data reveals changes from current content → **UPDATE** the section with new data
   - If scan data matches current content → **PRESERVE** the existing text verbatim
   - If a section contains content not derivable from scans (appears to be user-added notes, custom context) → **PRESERVE** it unchanged

3. **New content** — if scans reveal new items not covered by any existing section:
   - Add new content under the most appropriate existing heading
   - If no heading fits, add a new section at the logical position in the file

4. **Removed content** — if scans confirm that something previously documented no longer exists in the codebase:
   - Remove the stale entries from the relevant section
   - Do NOT remove entire sections — they may contain user-added context

#### d. Compute New Source Hash

Using the source file mapping for this knowledge file:

```bash
cat {source_files} 2>/dev/null | md5 | cut -c1-8
```

#### e. Build New Frontmatter

```yaml
---
generated: {YYYY-MM-DD}
generator: bmad-knowledge-refresh
source_hash: {new 8-char hash}
---
```

#### f. Store Draft

Store the complete draft (frontmatter + updated content) keyed by filename. Also store a structured change summary:
- Sections updated: count and names
- Sections preserved: count
- New content added: yes/no
- Stale content removed: yes/no

### 4. Handle workflow-context.md (if in TARGET_FILES)

workflow-context.md is different — it has YAML frontmatter as its primary content, not markdown sections.

1. Read the current file
2. Based on conversation context signals from step 01, identify specific YAML fields that need updating
3. Generate a field-level diff: `{ field: { current: value, proposed: value, reason: string } }`
4. Store as a special draft type — field-level changes, not a full file replacement

### 5. Log Generation Summary

```
Generated {N} updated drafts:
  - {filename}: {N} sections updated, {N} preserved
  - ...
```

If workflow-context.md is included:
```
  - workflow-context.md: {N} fields to update
```

---

**Next:** Read fully and follow `./step-03-review-and-apply.md`
