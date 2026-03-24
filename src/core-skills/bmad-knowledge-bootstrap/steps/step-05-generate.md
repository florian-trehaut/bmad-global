# Step 5: Generate Knowledge Files

## STEP GOAL

For each knowledge file in TARGET_FILES, load the corresponding template, populate it with data from detection (step 2), research (step 3), and scan (step 4), and produce a complete draft with staleness-tracking frontmatter.

## RULES

- Use the template as structural guide — populate sections with real data, remove HTML comments
- If a section has no data: write "No {topic} detected in this project." — do NOT leave the template placeholder
- Every generated file MUST include the staleness frontmatter
- Do NOT write files to disk yet — store drafts in memory for review in step 6

## SEQUENCE

### 1. For Each File in TARGET_FILES

For each knowledge file to generate:

#### a. Load Template

Read the corresponding template from `../templates/{name}-template.md`.

#### b. Compute Source Hash

Identify the key source files for this knowledge type:

| Knowledge File | Source Files for Hash |
|---------------|---------------------|
| `stack.md` | package.json, Cargo.toml, tsconfig.json, lint configs |
| `infrastructure.md` | .github/workflows/*.yml, Dockerfile, deploy configs |
| `review-perspectives.md` | lint configs, test configs, stack.md |
| `tracker.md` | workflow-context.md (tracker section) |
| `environment-config.md` | .env*, deploy configs |
| `investigation-checklist.md` | src/ directory structure |
| `conventions.md` | .editorconfig, lint configs, git log patterns |
| `domain-glossary.md` | entity/model files, schema files |
| `api-surface.md` | route/controller files, OpenAPI specs |

Compute a hash from the content of the first 3-5 available source files:

```bash
cat {source_files} 2>/dev/null | md5 | cut -c1-8
```

#### c. Build Frontmatter

```yaml
---
generated: {today's date YYYY-MM-DD}
generator: bmad-knowledge-bootstrap
source_hash: {computed hash}
---
```

#### d. Populate Template Sections

Walk through each section of the template:
1. Find matching data from scan results (step 4)
2. Enrich with research findings (step 3)
3. Fill tables with concrete values from detection (step 2)
4. Remove HTML comment placeholders
5. If no data for a section: replace with "No {topic} detected."

#### e. Store Draft

Store the complete draft (frontmatter + populated content) keyed by filename.

### 2. Log Generation Summary

```
Generated {N} knowledge file drafts:
- stack.md (142 lines)
- infrastructure.md (68 lines)
- ...
```

---

**Next:** Read fully and follow `./step-06-review.md`
