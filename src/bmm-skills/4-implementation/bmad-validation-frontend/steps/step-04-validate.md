# Step 4: Validate

## STEP GOAL

Execute each Validation Metier (VM) item one by one. For each VM: classify, execute or delegate, collect tangible proof, render a verdict.

## RULES

- Load `../data/vm-classification-rules.md` and `../data/proof-standards.md` BEFORE starting
- Load `~/.claude/skills/bmad-shared/validation-proof-principles.md` and apply its universal rules
- Each VM MUST have valid proof to pass — no exceptions
- Code analysis is NEVER proof — see proof-standards.md
- In production: every write action requires authorization BEFORE execution
- **In dev_server/staging: creating test data is authorized** if needed to trigger the flows under validation. Document created data in the report.
- Display the verdict of each VM immediately after validation
- NEVER validate a VM "by optimism" or "because the code looks correct"
- In case of doubt, FAIL

### ANTI-TECHNICAL-VALIDATION (CRITICAL)

**You are a BUSINESS validator, not a technical reviewer. The following are NEVER valid validation approaches:**

- "I read the component source and it renders the right elements" — NO. This is code analysis.
- "The CSS classes are correctly applied in the JSX" — NO. Reading code is not testing.
- "The component imports the right hook, so state management works" — NO. Prove it with execution.
- "The HTML output shows the correct attributes" — NO. Only real browser rendering proves display.
- "The route is defined in the router config" — NO. Navigate to it and prove it loads.

**Rule:** The only valid proof is an executed test that exercises the EXACT behavior described in the VM, or observable output from the real browser/environment.

### ANTI-RATIONALIZATION (CRITICAL)

**When a result does NOT match the expected outcome, FAIL IMMEDIATELY. No second chance, no explanation.**

Forbidden behaviors:
- "The test might be flaky" — NO. The result diverges = FAIL.
- "Let's try with a different browser" — NO. The first test failed = FAIL.
- "It's possibly a caching issue" — NO. You are not here to find excuses.
- "Let's clear the cache and retry" — NO. If the first attempt fails, the feature is broken.
- Changing test parameters to obtain a positive result — FORBIDDEN.
- Testing a second sample after a first failure — FORBIDDEN.

**Rule:** ONE non-conforming result is enough for FAIL.

## SEQUENCE

### 1. Load standards

Read:
- `./data/vm-classification-rules.md`
- `./data/proof-standards.md`
- `./data/chrome-mcp-patterns.md`

If `STACK_NOTES`, `TEST_DISCOVERY`, or `ANTI_PATTERNS` were extracted from `validation.md` during preflight, apply them throughout this step:
- **STACK_NOTES**: follow stack-specific instructions (e.g., wait for WASM hydration before asserting, use `tauri-driver` instead of Playwright for Tauri apps)
- **TEST_DISCOVERY**: use the file/name/command patterns to locate tests matching each VM
- **ANTI_PATTERNS**: reject proof types flagged as invalid for this project's specific stack

### 2. Initialize results

```
VM_RESULTS = []
```

### 3. Validation loop

For each VM in the list parsed at step 1:

#### 3a. Display the current VM

"**VM-{n}**: {description}"

#### 3b. Classify the VM

Apply the rules from `vm-classification-rules.md` to determine the type: `component`, `e2e`, `routing`, `visual`, `responsive`, `accessibility`, `error-handling`, `performance`, `api`, `state`, `mixed`.

Display: "Type: **{type}**"

#### 3c. Execute based on type

**If `component`:**
1. Read relevant component code in `{WORKTREE_PATH}` to identify the specific test file(s)
2. Search for tests matching the VM behavior by:
   - Test name/description matching the VM wording
   - File name matching the component or feature area
   - Test assertions matching the expected behavior
3. Construct targeted component test command: `{COMPONENT_TEST_COMMAND} {test_file} --reporter=verbose`
4. Run the test in the MAIN project directory (not the worktree). Capture full output (pass/fail, assertions, stdout).
5. Evaluate: does the test output match what the VM expects?

**If `e2e`:**
1. Read relevant page/route/flow code in `{WORKTREE_PATH}` to understand the user journey
2. Search for E2E tests matching the VM behavior by:
   - Test name/description matching the VM wording
   - Spec file matching the feature area or route
3. If `ENVIRONMENT = dev_server`: ensure dev server is running (or use Playwright's webServer config)
4. If `ENVIRONMENT = staging/production`: configure baseURL via environment variable or CLI flag
5. Construct targeted E2E test command: `{E2E_TEST_COMMAND} --grep "{VM keyword}" --reporter=list` or `{E2E_TEST_COMMAND} {spec_file}`
6. Run the test. Capture output, screenshots, traces.
7. Evaluate: does the test prove the VM behavior?

**If `routing`:**
1. Identify the route under test from the VM description
2. If E2E test exists for this route, run it
3. If no test, verify via HTTP:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -L {base_url}{route_path}
   ```
4. For client-side routing: run an E2E test that navigates and asserts the URL change
5. Capture URL changes, status codes, final destination
6. Evaluate: does the routing behavior match the VM?

**If `visual`:**
1. If automated visual regression tooling is available (Playwright visual comparisons, Percy, Chromatic):
   - Run the visual comparison test
   - Capture the result (pass/fail, diff percentage, comparison link)
2. If no visual regression tooling, use Chrome MCP (refer to `../data/chrome-mcp-patterns.md`):
   - `tabs_create_mcp` — open new tab
   - `navigate` — go to the page URL
   - `computer` (screenshot) — capture the visual state
   - Analyze the screenshot against VM expectations
   - If the VM specifies a viewport: `resize_window` first, then screenshot
3. `read_console_messages` (pattern: `"error|warning"`) — verify no JS errors
4. Evaluate: does the visual state match what the VM expects?

**If `responsive`:**
1. Load `../data/chrome-mcp-patterns.md` — follow the "Responsive Validation" sequence
2. Determine the breakpoints from the VM (or use defaults: 375x812 mobile, 768x1024 tablet, 1280x800 desktop)
3. For each breakpoint:
   - `resize_window` to the target dimensions
   - `computer` (screenshot) — capture the layout at this viewport
   - Analyze: does the layout conform to VM expectations at this size?
4. If the VM mentions specific devices (e.g., "iPhone 14", "iPad"), use the corresponding viewport dimensions
5. The VM passes ONLY if ALL breakpoints pass

**If `error-handling`:**
1. Use Chrome MCP to navigate to the relevant page
2. Provoke the error state as described in the VM:
   - Network failure: `javascript_tool` to override fetch/XHR or `window.dispatchEvent(new Event('offline'))`
   - Empty state: navigate to a page with no data, or clear relevant data via `javascript_tool`
   - Server error: if the VM describes a specific API error, use `javascript_tool` to intercept and return the error
   - Timeout: `javascript_tool` to simulate slow responses
3. `computer` (screenshot) — capture the error/empty/loading state
4. `read_console_messages` — verify error handling (no unhandled exceptions)
5. Evaluate: does the UI display the expected error message, empty state, or loading indicator?

**If `performance`:**
1. Use Chrome MCP to navigate to the page
2. `javascript_tool` to extract performance metrics:
   ```javascript
   const nav = performance.getEntriesByType('navigation')[0];
   const paint = performance.getEntriesByType('paint');
   console.log(JSON.stringify({
     domContentLoaded: nav.domContentLoadedEventEnd,
     loadComplete: nav.loadEventEnd,
     firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
     firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
   }));
   ```
3. `read_console_messages` — capture the metrics
4. If the VM mentions Lighthouse: run `npx lighthouse {url} --output=json --chrome-flags="--headless"` if available
5. Compare measured values against VM thresholds
6. Evaluate: do the metrics meet the performance requirements?

**If `accessibility`:**
1. Use Chrome MCP to navigate to the page
2. Inject and run axe-core via `javascript_tool`:
   ```javascript
   const script = document.createElement('script');
   script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js';
   document.head.appendChild(script);
   ```
   Then after load:
   ```javascript
   axe.run().then(results => console.log(JSON.stringify(results.violations)));
   ```
3. `read_console_messages` — capture violations
4. `read_page` — get native accessibility tree for additional verification (ARIA roles, labels)
5. If the VM mentions keyboard navigation: use `computer` (key action) to Tab through elements, verify focus order
6. Evaluate: does the page meet the a11y requirements described in the VM?

**If `api`:**
1. Determine the endpoint, method, payload from the VM description
2. If write action in production — ask authorization: "This VM requires a {METHOD} {URL} call in production. Do you authorize this action? [Y]es / [N]o"
3. Execute the HTTP request:
   ```bash
   curl -s -w "\n%{http_code}" {url} [-X {METHOD}] [-H "Content-Type: application/json"] [-d '{payload}']
   ```
4. Capture: status code, body (relevant extract), timestamp
5. Evaluate: does the response match what the VM expects?

**If `state`:**
1. Determine what browser-side state the VM describes (localStorage, sessionStorage, cookies, IndexedDB)
2. If an E2E test exists that inspects this state, run it
3. If no test, use Chrome MCP:
   - `navigate` to the relevant page
   - Perform the action that sets the state (click, form submit, etc.)
   - `javascript_tool` to read the state: `localStorage.getItem('key')`, `document.cookie`, etc.
4. Capture: state key, value, expected value
5. Evaluate: does the state match expectations?

**If `mixed`:**
1. Decompose into typed sub-steps
2. Execute each sub-step according to its type
3. The VM passes ONLY if ALL sub-steps pass

#### 3d. Render the verdict

Evaluate the collected proof against proof-standards.md:

**PASS** — valid proof AND result conforms to VM expectations:
```
PASS VM-{n}
   Proof: {proof_summary}
```

**FAIL** — no valid proof OR result non-conforming:
```
FAIL VM-{n}
   Reason: {detailed_reason}
   Observed: {what_was_observed}
   Expected: {what_was_expected}
```

Add to results:
```
VM_RESULTS.push({id, description, type, verdict, proof_summary, failure_reason})
```

### 4. Intermediate summary

After all VM items, display:

```
Validation complete: {pass_count}/{total_count} VM items passed

{summary_table}
```

### 5. Proceed

Load and execute `./steps/step-05-verdict.md`.
