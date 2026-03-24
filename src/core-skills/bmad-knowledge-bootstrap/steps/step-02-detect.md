# Step 2: Detect Stack and Frameworks

## STEP GOAL

Analyze the repository to identify languages, frameworks, tools, and infrastructure. This detection drives all subsequent steps — research targets, scan strategy, and template population.

## RULES

- Detection is purely observational — do NOT modify any files
- Report what IS, not what should be
- When multiple indicators conflict (e.g., both npm and cargo lockfiles), report both

## SEQUENCE

### 1. Detect Languages

Analyze file extension distribution:

```bash
find . -type f -name '*.ts' -o -name '*.js' -o -name '*.py' -o -name '*.rs' -o -name '*.go' -o -name '*.java' -o -name '*.rb' -o -name '*.php' -o -name '*.cs' -o -name '*.swift' -o -name '*.kt' -o -name '*.md' -o -name '*.yaml' -o -name '*.yml' | grep -v node_modules | grep -v .git | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -15
```

### 2. Detect Package Managers

Check for lockfiles:

```bash
ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb Cargo.lock poetry.lock Pipfile.lock go.sum Gemfile.lock composer.lock 2>/dev/null
```

Read `package.json` or equivalent for project metadata (name, scripts, dependencies).

### 3. Detect Frameworks

Check for framework markers:

```bash
ls next.config.* nuxt.config.* angular.json svelte.config.* astro.config.* vite.config.* webpack.config.* Cargo.toml setup.py pyproject.toml go.mod Gemfile 2>/dev/null
```

Read detected configs to identify framework versions and key options.

### 4. Detect Test Setup

```bash
ls jest.config.* vitest.config.* .mocharc.* pytest.ini setup.cfg tox.ini cypress.config.* playwright.config.* 2>/dev/null
```

Identify test file patterns from existing tests:

```bash
find . -type f \( -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' \) | grep -v node_modules | head -10
```

### 5. Detect Linting and Formatting

```bash
ls .eslintrc* eslint.config.* .prettierrc* prettier.config.* .stylelintrc* .rubocop.yml .flake8 .ruff.toml pyproject.toml rustfmt.toml .clang-format .editorconfig 2>/dev/null
```

### 6. Detect CI/CD

```bash
ls -d .github/workflows/ .gitlab-ci.yml .circleci/ Jenkinsfile .travis.yml bitbucket-pipelines.yml 2>/dev/null
```

If GitHub Actions: list workflow files and their triggers.

### 7. Detect Infrastructure

```bash
ls Dockerfile docker-compose.* terraform/ kubernetes/ k8s/ helm/ serverless.yml .env .env.example 2>/dev/null
```

### 8. Build Detected Stack Profile

Compile all findings into a structured profile:

```yaml
detected_stack:
  languages:
    primary: {most common language}
    secondary: [{others}]
  package_manager: {npm/yarn/pnpm/cargo/poetry/...}
  framework: {next/astro/nestjs/django/...}
  test_runner: {jest/vitest/pytest/cargo-test/...}
  test_patterns: {*.spec.ts, *.test.py, ...}
  linter: {eslint/clippy/ruff/...}
  formatter: {prettier/rustfmt/black/...}
  ci_platform: {github-actions/gitlab-ci/...}
  deployment: {docker/serverless/static/package/...}
  database: {postgres/mysql/sqlite/none/...}
```

Log the profile for use in subsequent steps.

---

**Next:** Read fully and follow `./step-03-research.md`
