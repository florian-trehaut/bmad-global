---
nextStepFile: './step-07-review-write.md'
---

# Step 6: Generate Knowledge Files

## STEP GOAL:

For each knowledge file in TARGET_FILES, load the corresponding template, populate it with data from detection (step 03), research and scan (step 05), and produce a complete draft with staleness-tracking frontmatter. Drafts are stored in memory — NOT written to disk yet.

## MANDATORY SEQUENCE

### 1. For Each File in TARGET_FILES

#### a. Load Template

Read the corresponding template from `../templates/{name}-template.md`.

| Knowledge File | Template |
|---------------|----------|
| stack.md | stack-template.md |
| infrastructure.md | infrastructure-template.md |
| conventions.md | conventions-template.md |
| review-perspectives.md | review-perspectives-template.md |
| tracker.md | tracker-template.md |
| comm-platform.md | comm-platform-template.md |
| environment-config.md | environment-config-template.md |
| investigation-checklist.md | investigation-checklist-template.md |
| domain-glossary.md | domain-glossary-template.md |
| api-surface.md | api-surface-template.md |

#### b. Compute Source Hash

Identify key source files for this knowledge type:

| Knowledge File | Source Files for Hash |
|---------------|---------------------|
| stack.md | package.json, Cargo.toml, tsconfig.json, lint configs |
| infrastructure.md | .github/workflows/*.yml, Dockerfile, deploy configs |
| review-perspectives.md | lint configs, test configs, stack.md |
| tracker.md | workflow-context.md (tracker section) |
| comm-platform.md | workflow-context.md (comm platform section) |
| environment-config.md | .env*, deploy configs |
| investigation-checklist.md | src/ directory structure |
| conventions.md | .editorconfig, lint configs, git log patterns |
| domain-glossary.md | entity/model files, schema files |
| api-surface.md | route/controller files, OpenAPI specs |

```bash
cat {source_files} 2>/dev/null | md5 | cut -c1-8
```

#### c. Build Frontmatter

```yaml
---
generated: {YYYY-MM-DD}
generator: bmad-knowledge-bootstrap
source_hash: {8-char hash}
---
```

#### d. Populate Template Sections

1. Find matching data from scan results (step 05)
2. Enrich with research findings (step 05)
3. Fill tables with concrete values from detection (step 03)
4. Remove HTML comment placeholders
5. If no data for a section: replace with "No {topic} detected in this project."

#### e. Store Draft

Store the complete draft (frontmatter + populated content) keyed by filename.

### 2. Log Generation Summary

```
Generated {N} knowledge file drafts:
- stack.md ({N} lines)
- infrastructure.md ({N} lines)
- ...
```

### 3. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All TARGET_FILES have a draft
- Every draft has staleness frontmatter (generated date + source_hash)
- Template sections populated with real data
- No HTML comment placeholders remaining

### FAILURE:

- Missing frontmatter on any draft
- Template placeholders left in output
- Fabricating content not found in scan/research
