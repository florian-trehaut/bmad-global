# VM Item Classification Rules — Frontend

Classify each Validation Metier item into ONE type based on what proof is needed.

## Types

### `component` — Testable via component test framework

The VM describes a single component's rendering, behavior, or internal state.

**Signals:**
- "The component renders...", "The form validates...", "The button is disabled when..."
- "The input shows an error message...", "The dropdown displays..."
- "The component accepts...", "The prop changes..."
- Mentions a specific component name, form field, input validation, conditional rendering

**Action:** identify the component test file, run `{COMPONENT_TEST_COMMAND}` targeting the specific test, capture assertions and output.

### `e2e` — Testable via browser E2E test

The VM describes a multi-step user workflow, a cross-page behavior, or a full user journey.

**Signals:**
- "The user navigates to...", "After clicking X, the page shows..."
- "The flow completes with...", "The user can complete..."
- "After submitting the form, the confirmation page..."
- Mentions page transitions, multi-step flows, authentication flows, checkout processes

**Action:** identify the E2E spec file, run `{E2E_TEST_COMMAND}` targeting the specific test, capture output + screenshots + network logs.

### `routing` — Verifiable via navigation testing

The VM describes URL behavior, redirections, or deep linking.

**Signals:**
- "URL changes to...", "Redirect occurs when..."
- "Deep link resolves to...", "The breadcrumb reflects..."
- "Navigating to /path shows...", "The back button returns to..."
- Mentions URLs, paths, query parameters, hash fragments, history state

**Action:** run a navigation test or verify via HTTP request. For client-side routing, use an E2E test that asserts URL changes.

### `visual` — Requires visual validation

The VM describes layout, responsive behavior, visual appearance, or theme.

**Signals:**
- "The layout displays correctly on mobile...", "The theme applies..."
- "The responsive breakpoint switches at...", "The grid adjusts..."
- "The animation plays...", "The colors match the design system..."
- "On tablet, the sidebar collapses...", "The dark mode..."
- Mentions viewport sizes, devices, visual design, CSS behavior, animations

**Action:** if automated visual regression tooling is available, run it. Otherwise HALT for screenshot with specific viewport/device instructions.

### `accessibility` — Verifiable via automated a11y audit

The VM describes keyboard navigation, screen reader behavior, ARIA compliance, or contrast requirements.

**Signals:**
- "Screen reader announces...", "Keyboard navigation works..."
- "Contrast ratio meets WCAG...", "Focus indicator is visible..."
- "Tab order follows...", "ARIA label is set to..."
- "The dialog traps focus...", "Skip link navigates to..."
- Mentions WCAG, ARIA, keyboard, screen reader, focus, contrast

**Action:** run axe-core audit via Playwright or standalone tool. Capture violations/passes relevant to the VM.

### `api` — Testable via API call

The VM describes a backend endpoint response (for full-stack projects).

**Signals:**
- "The API returns...", "The endpoint responds with..."
- "The server validates...", "The response contains..."
- Mentions HTTP methods, status codes, payloads, headers

**Action:** execute the HTTP request (curl), capture the full response as proof. Same as validation-metier's `api` type.

### `state` — Verifiable via browser state inspection

The VM describes browser-side persistent state.

**Signals:**
- "Local storage contains...", "The cookie is set to..."
- "Session storage stores...", "IndexedDB has..."
- "After refresh, the preference persists...", "The token is stored..."
- Mentions localStorage, sessionStorage, cookies, IndexedDB, service worker cache

**Action:** run a test that inspects browser storage after the action, or use `page.evaluate()` to read the state programmatically.

### `responsive` — Requires multi-viewport validation

The VM describes behavior that depends on screen size, device type, or viewport breakpoints.

**Signals:**
- "On mobile...", "On tablet...", "At breakpoint..."
- "The layout switches to...", "The sidebar collapses on..."
- "Responsive at...", "On small screens...", "Touch target size..."
- Mentions viewport widths, device names, breakpoints, media queries

**Action:** use Chrome MCP `resize_window` at standard breakpoints (375px mobile, 768px tablet, 1280px desktop), take `screenshot` at each, and compare visual results against the VM expectations. If the VM specifies particular devices, use those dimensions.

### `error-handling` — Verifiable via error/empty/loading state

The VM describes what happens when something goes wrong, when data is missing, or during loading.

**Signals:**
- "When offline...", "Error message shows...", "Empty state displays..."
- "Loading indicator appears...", "Timeout behavior...", "Network failure..."
- "When the API returns 500...", "With no data...", "Graceful degradation..."
- Mentions error boundaries, fallback UI, skeleton screens, retry buttons

**Action:** use Chrome MCP to navigate to the page, then provoke the error state (via `javascript_tool` to intercept network, clear data, or simulate offline). Verify the visible error/empty/loading state via `screenshot` and `read_console_messages`. For test-driven validation, run an E2E test that simulates the failure scenario.

### `performance` — Verifiable via performance audit

The VM describes page load speed, Core Web Vitals, or performance budgets.

**Signals:**
- "Page loads in under...", "LCP below...", "CLS below..."
- "Core Web Vitals pass...", "Lighthouse score above..."
- "No layout shift...", "First paint under..."
- Mentions LCP, CLS, INP, FCP, TTFB, Lighthouse, performance budget

**Action:** use Chrome MCP `javascript_tool` to extract `performance.getEntriesByType('navigation')` and `PerformanceObserver` metrics. For Lighthouse audits, use `npx lighthouse {url} --output=json --chrome-flags="--headless"` if available. Capture the metrics as structured proof.

### `mixed` — Combination of types

The VM requires multiple types of verification.

**Example:** "Submit the form and verify the success page shows AND the API returned 201" = `e2e` (form submission + success page) + `api` (verify server response).

**Action:** decompose into typed sub-steps, execute each with its type.

## Classification Summary

| Type | When to use | Proof method |
|------|------------|-------------|
| component | Item verifies a single component's rendering, behavior, or state | Component test output |
| e2e | Item verifies a multi-step user workflow or cross-page behavior | E2E test output + Chrome MCP |
| routing | Item verifies URL/navigation behavior, redirects, deep links | Navigation test or Chrome MCP |
| visual | Item verifies layout or visual appearance at a single viewport | Chrome MCP screenshot |
| responsive | Item verifies behavior across multiple viewports/devices | Chrome MCP multi-viewport sweep |
| accessibility | Item verifies a11y compliance (keyboard, screen reader, contrast) | Axe-core audit via Chrome MCP |
| error-handling | Item verifies error states, empty states, loading indicators | Chrome MCP + error provocation |
| performance | Item verifies page load speed, CWV, or performance budgets | Performance metrics or Lighthouse |
| api | Item verifies backend API behavior (full-stack projects) | HTTP request (curl) |
| state | Item verifies browser-side persistent state (storage, cookies) | Chrome MCP state inspection |
| mixed | Item requires multiple proof types | Combination |

## Default rule

If a VM does not clearly match any single type, classify as `mixed` and decompose.

## Environment preference by type

- `component`: prefer `dev_server` environment (fast, no deploy needed)
- `e2e`, `routing`, `state`: work on all environments (dev_server, staging, production)
- `visual`, `responsive`, `accessibility`: prefer `dev_server` or `staging` (stable rendering)
- `error-handling`: prefer `dev_server` (easier to provoke error states)
- `performance`: prefer `staging` (production-like conditions) or `dev_server` (baseline)
- `api`: works on all environments
- `mixed`: determine per sub-step

## Write actions in production

Regardless of type, if the action involves a write in production:
1. Explicitly flag it to the user
2. Wait for authorization
3. Document the authorization in the report
