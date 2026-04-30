# Validation Tooling Lookup Protocol

**Loaded by:** Test design (`bmad-test-design`), validation workflows (`bmad-validation-*`), TEA workflows (`bmad-tea-*`), code-review (`bmad-code-review`), dev-story validation steps.

**Indirection layer for** the schema sections `validation-tooling` and `test-rules` (per `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` v1).

---

## Purpose

Workflows that author tests, validate code quality, or design test plans need consistent access to the project's lint / format / type-check / test runner commands, test discovery patterns, anti-patterns, and pyramid layer rules — without each one hard-coding `project.md` anchors.

---

## Resolution

The project's validation tooling lives in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`:

- `validation-tooling` — required; lint, format, type-check, test runner commands and discovery patterns
- `test-rules` — required; test pyramid, coverage rules, naming, layer boundaries

`project.md` is already loaded by INITIALIZATION. The corresponding **commands** are also resolved in `workflow-context.md` (`lint_command`, `format_command`, `typecheck_command`, `test_command`, `quality_gate`).

---

## Common lookups

### Test runner detection

Read the validation-tooling section to find:

- Primary test runner (Jest, Vitest, Pytest, RSpec, Playwright, …).
- E2E framework (Playwright, Cypress, Selenium, tauri-driver, …).
- Component test framework (Vitest browser, Storybook, …).
- Visual regression tool (Chromatic, Percy, Argos, …).
- Accessibility tool (axe, pa11y, lighthouse-a11y, …).

### Test discovery patterns

Read the validation-tooling section for:

- Test file globs (e.g., `**/*.spec.ts`, `**/*.test.ts`, `**/__tests__/**`).
- Test name conventions (e.g., `*.unit.test.*`, `*.integration.test.*`, `*.journey.test.*`, `*.e2e.test.*`).
- Test fixtures location.

### Stack-specific notes / anti-patterns

Read the validation-tooling section for project-specific gotchas:

- WASM hydration delays before assertions.
- Tauri vs Playwright (use `tauri-driver`).
- Network interception patterns.
- Selectors resilience requirements.
- Forbidden test types for the stack.

These are stored as `STACK_NOTES`, `TEST_DISCOVERY`, and `ANTI_PATTERNS` (when extracted by validation workflows).

### Test pyramid layer assignment

Read the test-rules section for:

- The pyramid (unit / integration / journey / E2E / contract / visual / etc.).
- Coverage thresholds per layer.
- Layer boundary rules (e.g., "unit tests use no mocks — refactor instead").
- Naming conventions per layer (e.g., suffix-based, folder-based).

---

## Composition with tech-stack-lookup

When the workflow needs both stack info AND validation tooling, both protocols apply:

1. `tech-stack-lookup` — primary language, framework, runtime version.
2. `validation-tooling-lookup` (this) — runner, commands, discovery patterns.

Both read from project.md (already loaded). No duplicate file access needed.

---

## HALT conditions

- The required `validation-tooling` section is missing → HALT, run `/bmad-knowledge-refresh`.
- The required `test-rules` section is missing → HALT, run `/bmad-knowledge-refresh`.
- A test category referenced by the workflow has no defined runner → HALT, ask user to extend the validation-tooling section.

---

## Why this protocol exists

- **Decoupling**: workflows don't reference `project.md#validation-tooling` or `#test-rules` directly.
- **Single source of change**: rename or restructure → only this file updates.
- **Maintainability**: 4 previous workflow refs consolidated; future refs land here automatically.
- **Composability**: pairs cleanly with `tech-stack-lookup` for workflows needing both.

See `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` for the full architecture rationale.
