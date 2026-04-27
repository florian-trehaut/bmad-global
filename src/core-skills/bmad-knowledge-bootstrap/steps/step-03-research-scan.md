---
nextStepFile: './step-04-generate-knowledge.md'
---

# Step 5: Research and Deep Scan

## STEP GOAL:

Web research detected technologies for conventions, then deeply scan the codebase to extract concrete data for populating knowledge file templates. This step is automated — no user interaction.

## MANDATORY SEQUENCE

### 1. Web Research (for detected stack)

**Skip if:** TARGET_FILES contains only `tracker.md` or `environment-config.md`.

For each technology detected in step 02 (detect-stack), research:
1. **Conventions** — file naming, project structure, coding style
2. **Forbidden patterns** — anti-patterns, security pitfalls, deprecated APIs
3. **Test conventions** — file organization, assertion patterns, mocking policies
4. **Security** — OWASP-relevant patterns for this stack

Store structured `research_findings` per technology.

### 2. Stack Scan (for stack.md)

If `stack.md` in TARGET_FILES:

- Read main package manifest → dependencies, scripts, metadata
- Read lint config files → active rules, severity, overrides
- Read formatter config → key options
- Read test config → test roots, coverage thresholds
- Read pre-commit config → hook commands
- **Source file patterns**: Use `source_extensions` and `test_file_patterns` from step 02 detection
- **Architecture patterns**: Use classification from step 02

### 3. Infrastructure Scan (for infrastructure.md)

If `infrastructure.md` in TARGET_FILES:

- Read all CI/CD workflow files → jobs, triggers, dependencies
- Read Dockerfiles → base images, build stages, exposed ports
- Read deployment configs → Terraform, k8s, serverless
- Read .env.example → variable names (NOT values)
- Identify cloud service references in code

### 4. Domain Scan (for domain-glossary.md, api-surface.md, investigation-checklist.md)

If any of these in TARGET_FILES:

Use `source_extensions` from step 02 to scope searches (do NOT hardcode file extensions):

```bash
# Entity/model definitions — use detected extensions
grep -rn "class.*Entity\|interface.*Model\|schema\|@Entity\|@Table\|struct " --include="{source_ext}" . | grep -v node_modules | grep -v vendor | grep -v test | head -30

# Route/endpoint definitions
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Controller\|app\.get\|app\.post\|router\." --include="{source_ext}" . | grep -v node_modules | grep -v vendor | head -30
```

- Scan DTOs/request-response schemas
- Scan domain exceptions/errors
- Identify bounded contexts from directory structure

### 5. Conventions Scan (for conventions.md)

If `conventions.md` in TARGET_FILES:

```bash
git log --oneline -30
```

- Read .editorconfig if present
- Check for PR template: `.github/pull_request_template.md`
- Analyze import ordering patterns from a sample of source files
- Check branch naming from `git branch -r | head -20`

### 6. Review Perspectives Scan (for review-perspectives.md)

If `review-perspectives.md` in TARGET_FILES:

- Identify security-relevant patterns (auth middleware, input validation)
- Identify forbidden patterns enforced by linter
- Check existing review-perspectives.md format if present

### 7. Tracker Scan (for tracker.md)

If `tracker.md` in TARGET_FILES:

- Read workflow-context.md for tracker configuration
- If file-based: check sprint-status.yaml structure

### 8. Environment Config Scan (for environment-config.md)

If `environment-config.md` in TARGET_FILES:

- Scan environment references in code
- Read deployment configs for environment URLs
- Check for feature flag systems

### 9. Validation Scan (for validation.md)

If `validation.md` in TARGET_FILES:

- Read E2E config files (playwright.config, cypress.config) → baseURL, projects, webServer config
- Read component test config → test roots, environment, reporters
- Scan for stack-specific test helper patterns:

Use `source_extensions` from step 02 to scope searches:

```bash
# WASM hydration / Tauri / framework-specific patterns
grep -rn "gotoAndHydrate\|waitForHydration\|mockIPC\|wasm_bindgen_test\|tauri_driver" --include="{source_ext}" . | grep -v node_modules | head -10

# Test factories and fixtures
find . -maxdepth 4 -type d \( -name "fixtures" -o -name "factories" -o -name "helpers" \) -path "*/test*" 2>/dev/null | head -10

# Accessibility test patterns
grep -rn "checkA11y\|axe\|pa11y\|getByRole\|getByLabel" --include="{source_ext}" . | grep -v node_modules | head -10
```

- If Rust+WASM detected: check for `wasm-pack test` configuration, `wasm-bindgen-test` usage
- If Tauri detected: check for `tauri-driver` setup, WebDriver config files
- If Leptos/Yew/Dioxus detected: check for hydration-aware test patterns
- Identify test file naming and location patterns from existing test files
- Extract dev server command from package.json scripts or Cargo config

### 9. ADR Discovery Scan

Detect Architecture Decision Records in the project. ADRs constrain how all workflows make decisions — their location must be known.

**Scan conventional locations:**

```bash
# Common ADR directory patterns
ls -d docs/adr/ docs/adrs/ docs/decisions/ docs/architecture/decisions/ adr/ adrs/ doc/adr/ .adr/ 2>/dev/null
# Search for ADR-like files by naming pattern
find . -maxdepth 4 -name "ADR-*" -o -name "adr-*" -o -name "[0-9][0-9][0-9][0-9]-*.md" | grep -i "adr\|decision" | grep -v node_modules | head -20
```

**If files found:** note the location, count, and format (MADR, Nygard, custom). Read one sample to classify the format. Store as `ADR_LOCATION` and `ADR_FORMAT`.

**If no files found in code:** check the tracker for ADR documents (if tracker is configured):
- Search tracker documents for "ADR" or "Architecture Decision" in the title
- If found, note tracker as the ADR source

**If no ADRs found anywhere:** store `ADR_LOCATION = "none"`. This is valid — not all projects use ADRs.

**Conflict resolution rule:** when multiple ADRs exist on the same topic, the most recent one (by date or sequence number) takes precedence.

Update `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` with `adr_location` and `adr_format` values.

### 10. Compile Results

For each TARGET_FILE, compile the relevant scan data into a structured format for step 04 (generate-knowledge).

### 11. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All TARGET_FILES have corresponding scan data
- Source extensions used dynamically (not hardcoded)
- Research findings sourced from web (not LLM memory)
- Scan data includes file:line references

### FAILURE:

- Hardcoding file extensions in grep commands
- Relying on LLM knowledge instead of web research
- Skipping scan areas for TARGET_FILES
