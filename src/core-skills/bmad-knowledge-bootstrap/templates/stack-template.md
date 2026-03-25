# Tech Stack — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Each section describes what to populate from codebase detection + research. -->

## Project Nature

<!-- Describe what the project IS — application, library, framework, CLI tool, etc. One paragraph. -->

## Architecture

<!-- High-level architecture: monorepo/single-repo, directory structure diagram, key directories and their purpose. -->

## Current Stack

<!-- Table: Component | Technology. Cover: Language, CLI framework, Package manager, Tests, Linting, Formatting, Pre-commit, Docs. -->

| Component | Technology |
|---|---|
| Language | {detected from lockfiles, file extensions} |
| Package manager | {detected from lockfiles} |
| Tests | {detected from test configs} |
| Linting | {detected from lint configs} |
| Formatting | {detected from formatter configs} |
| Pre-commit | {detected from git hooks config} |

## Source File Patterns

<!-- Detected from file extension distribution in the codebase. Used by workflows (dev-story, code-review) to dynamically scope searches, greps, and reviews to the correct file types instead of hardcoding extensions. -->

| Pattern | Description |
|---|---|
| Source files | {glob patterns for source code, e.g., `*.rs`, `*.ts`, `*.py`} |
| Test files | {glob patterns for test files, e.g., `*_test.rs`, `*.spec.ts`, `*.test.py`} |
| Config files | {glob patterns for config, e.g., `*.toml`, `*.json`, `*.yaml`} |

## Architecture Patterns

<!-- Detected from directory structure, import patterns, and module organization. Used by workflows (dev-story self-review, code-review) to evaluate code against the project's actual architecture style instead of assuming a specific paradigm. -->

<!-- Possible values: Hexagonal, Layered (MVC/MVP), CQRS, Feature-based, Modular, Monolithic, Microservices, etc. -->
<!-- If multiple patterns coexist (e.g., Hexagonal for backend, Feature-based for frontend), list each with its scope. -->

| Scope | Pattern | Key Rules |
|---|---|---|
| {e.g., Backend} | {e.g., Hexagonal} | {e.g., Domain must not import infrastructure} |

## Test Rules

### Forbidden Patterns (STRICT)

<!-- List patterns that are forbidden in tests — detected from lint configs, existing test conventions, research findings. -->

### Test Pyramid

<!-- Table: Type | Framework | Suffix | Location. Detected from test configs and existing test file patterns. -->

| Type | Framework | Suffix | Location |
|---|---|---|---|
| Unit | {detected} | {detected from existing test files} | {detected} |
| Integration | {detected} | {detected} | {detected} |

### Running Tests

<!-- Commands to run tests — extracted from package.json scripts, Makefile, or equivalent. -->

## Code Conventions

<!-- Commit format, quality commands, naming rules — detected from git log, lint configs, .editorconfig. -->
