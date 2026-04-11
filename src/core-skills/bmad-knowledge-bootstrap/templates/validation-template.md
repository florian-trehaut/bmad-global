# Validation — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Project-specific validation tooling, test discovery patterns, and stack-specific notes. Consumed by bmad-validation-frontend and other validation workflows. -->

## Validation Stack

<!-- Table: Component | Technology | Command. Detected from package.json, Cargo.toml, config files. -->

| Component | Technology | Command |
|-----------|-----------|---------|
| E2E framework | {detected: playwright, cypress, tauri-driver, none} | {e2e command} |
| Component tests | {detected: vitest, jest, wasm-pack test, none} | {component command} |
| Visual regression | {detected: playwright visual, percy, chromatic, none} | {visual command} |
| Accessibility | {detected: axe-core, pa11y, none} | {a11y command} |
| Performance | {detected: lighthouse, none} | {perf command} |
| BDD/Acceptance | {detected: cucumber-rs, cucumber-js, none} | {bdd command} |
| Property-based | {detected: proptest, quickcheck, fast-check, none} | {property command} |

## Stack-Specific Validation Notes

<!-- CRITICAL: Populate this section with stack-specific behavior that affects validation. -->
<!-- Leptos/Yew/Dioxus: WASM hydration delay — must wait for hydration before asserting. Look for gotoAndHydrate or waitForHydration patterns in existing tests. wasm-pack test available for component-level WASM testing. -->
<!-- Tauri: Standard Playwright does NOT work (no CDP in native webviews). Use tauri-driver (Windows/Linux only) or tauri-plugin-playwright. macOS has zero WebDriver support for WKWebView. -->
<!-- Rust backend (Axum/Actix): axum-test crate for API validation, cargo test for integration tests. -->
<!-- WASM boundary: serde-wasm-bindgen serialization must be tested at the boundary. Edge cases: Option types, enum discriminants, nested structs. -->
<!-- Standard JS/TS (React, Vue, Angular, Svelte, Next.js, Nuxt): Playwright/Cypress work normally. No special considerations. -->

## Validation Environment

<!-- Detected from environment-config.md, package.json scripts, deployment configs. -->

| Environment | URL | Validation approach |
|------------|-----|---------------------|
| Dev server | {url} | {dev_server_command}, local automated |
| Staging | {url if detected} | Deployed, real environment |
| Production | {url if detected} | Read-only unless authorized |

## Test Discovery Patterns

<!-- How to find tests matching a VM description. Detected from existing test files and conventions. -->

| Test type | File pattern | Name pattern | Command pattern |
|-----------|-------------|--------------|-----------------|
| E2E | {e.g., tests/e2e/*.spec.ts, tests/*.spec.ts} | {describe/test name convention} | {e.g., npx playwright test --grep} |
| Component | {e.g., src/**/*.test.tsx, crates/*/tests/} | {test function naming convention} | {e.g., npx vitest run --reporter=verbose} |
| Integration | {e.g., tests/integration/*.test.ts} | {convention} | {e.g., cargo test --test} |

## Validation Anti-Patterns (project-specific)

<!-- Patterns specific to this project's stack that look like valid proof but aren't. -->
<!-- Example for Leptos: "Component renders in WASM" is not proof — must verify AFTER hydration completes -->
<!-- Example for Tauri: "Playwright test passes" is not proof if running against a standard browser instead of the Tauri webview -->
