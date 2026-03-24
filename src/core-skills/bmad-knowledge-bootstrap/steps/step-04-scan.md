# Step 4: Deep Codebase Scan

## STEP GOAL

Perform a targeted scan of the codebase informed by detection (step 2) and research (step 3) to extract concrete data for populating knowledge files. Each scan area maps to one or more TARGET_FILES.

## RULES

- Only scan for knowledge files in TARGET_FILES — skip others
- Read files, grep patterns, analyze configs — do NOT modify anything
- Prefer structured output (tables, lists) over narrative

## SEQUENCE

### 1. Stack Scan (for stack.md)

If `stack.md` in TARGET_FILES:

- Read the main package manifest (package.json, Cargo.toml, etc.) — extract dependencies, scripts, metadata
- Read lint config files — extract active rules, severity, overrides
- Read formatter config — extract key options (print width, tabs vs spaces, etc.)
- Read test config — extract test roots, coverage thresholds, transform settings
- Read pre-commit config (husky, pre-commit hooks) — extract hook commands
- Scan for architecture patterns: directory structure, import patterns, module organization

### 2. Infrastructure Scan (for infrastructure.md)

If `infrastructure.md` in TARGET_FILES:

- Read all CI/CD workflow files — extract jobs, triggers, dependencies
- Read Dockerfiles — extract base images, build stages, exposed ports
- Read deployment configs — Terraform, k8s manifests, serverless configs
- Read .env.example or .env files — extract variable names (NOT values)
- Identify cloud service references in code (AWS SDK, GCP, Azure imports)

### 3. Domain Scan (for domain-glossary.md, api-surface.md, investigation-checklist.md)

If any of these in TARGET_FILES:

- Scan for entity/model definitions: classes, interfaces, schemas

```bash
grep -rn "class.*Entity\|interface.*Model\|schema\|@Entity\|@Table\|struct " --include="*.ts" --include="*.py" --include="*.rs" --include="*.go" --include="*.java" . | grep -v node_modules | grep -v test | head -30
```

- Scan for route/endpoint definitions:

```bash
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Controller\|@Router\|app\.get\|app\.post\|router\." --include="*.ts" --include="*.py" --include="*.js" . | grep -v node_modules | grep -v test | head -30
```

- Scan for DTOs/request-response schemas
- Scan for domain exceptions/errors
- Identify bounded contexts from directory structure

### 4. Conventions Scan (for conventions.md)

If `conventions.md` in TARGET_FILES:

- Analyze recent git history for commit patterns:

```bash
git log --oneline -30 | head -30
```

- Read .editorconfig if present
- Check for PR template: `.github/pull_request_template.md`
- Analyze import ordering patterns from a sample of source files
- Check branch naming from git log:

```bash
git branch -r | head -20
```

### 5. Review Perspectives Scan (for review-perspectives.md)

If `review-perspectives.md` in TARGET_FILES:

- Identify security-relevant patterns from the stack (auth middleware, input validation)
- Identify forbidden patterns already enforced by linter
- Check for existing `.claude/workflow-knowledge/review-perspectives.md` to understand current format

### 6. Tracker Scan (for tracker.md)

If `tracker.md` in TARGET_FILES:

- Read `workflow-context.md` for tracker configuration (type, MCP prefix, states)
- If file-based tracker: check for `sprint-status.yaml`
- If Linear/GitHub/GitLab: document MCP tool patterns

### 7. Environment Config Scan (for environment-config.md)

If `environment-config.md` in TARGET_FILES:

- Scan for environment references in code
- Read deployment configurations for environment URLs
- Check for feature flag systems

### 8. Compile Scan Results

For each TARGET_FILE, compile the relevant scan data into a structured format that step-05 can use to fill the templates.

---

**Next:** Read fully and follow `./step-05-generate.md`
