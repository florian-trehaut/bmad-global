# Proof Standards — Frontend

## Principle

**Only valid proof = result of a real execution in a real browser environment.**

Proof is an artifact captured DURING the execution of the validation, not a priori reasoning.

## Valid Proof Types

### E2E Test Output
```
Proof: E2E test execution
Command: {test_command_with_args}
Result: {pass/fail}
Key assertions: {assertions that passed or failed}
Screenshots: {auto-captured screenshot paths if any}
Network: {relevant intercepted requests/responses if any}
Timestamp: {datetime}
```

### Component Test Output
```
Proof: Component test execution
Command: {test_command_with_args}
Result: {pass/fail}
Key assertions: {assertions that passed or failed}
DOM snapshot: {relevant DOM state if captured}
Timestamp: {datetime}
```

### Accessibility Audit
```
Proof: Accessibility audit
Tool: {axe-core/pa11y/lighthouse}
URL: {page_url}
Rule checked: {specific WCAG rule or criterion}
Violations: {count and details}
Passes: {relevant passes for the VM}
Timestamp: {datetime}
```

### Visual Regression
```
Proof: Visual regression
Tool: {playwright/percy/chromatic}
Baseline: {baseline screenshot or version}
Current: {current screenshot or version}
Diff: {percentage or result}
Result: {match/mismatch}
Timestamp: {datetime}
```

### Network Capture
```
Proof: Network interception
URL pattern: {intercepted URL}
Method: {GET/POST/etc}
Status: {status code}
Response: {relevant extract}
Timestamp: {datetime}
```

### Browser State Inspection
```
Proof: Browser state
Method: {test command or page.evaluate}
Storage type: {localStorage/sessionStorage/cookie/indexedDB}
Key: {key name}
Value: {captured value}
Expected: {what was expected}
Timestamp: {datetime}
```

### User Screenshot
```
Proof: User screenshot
URL: {page_url}
Viewport: {width x height}
Device: {device name if mobile/tablet}
Action: {what the user did}
Visible result: {description of what is seen}
Conforming: {yes/no + justification}
```

### API Response (full-stack)
```
Proof: HTTP {METHOD} {URL}
Status: {status_code}
Body: {response_body (relevant extract)}
Timestamp: {datetime}
```

### Chrome MCP Screenshot
```
Proof: Chrome MCP screenshot
URL: {page_url}
Viewport: {width x height}
Tool: mcp__claude-in-chrome__computer (screenshot)
Visual analysis: {description of what Claude observes}
Conforming: {yes/no + justification}
Timestamp: {datetime}
```

### Responsive Sweep
```
Proof: Responsive multi-viewport sweep
URL: {page_url}
Viewports tested: {list of width x height}
Tool: mcp__claude-in-chrome__resize_window + screenshot
Per-viewport result: {pass/fail per breakpoint with visual analysis}
Timestamp: {datetime}
```

### Error State Capture
```
Proof: Error/empty/loading state
URL: {page_url}
Trigger: {how the error state was provoked}
Console errors: {captured via read_console_messages, or "none"}
Visible result: {description of error UI observed}
Expected: {what the VM expects}
Conforming: {yes/no + justification}
Timestamp: {datetime}
```

### Performance Metrics
```
Proof: Performance measurement
URL: {page_url}
Method: {Navigation Timing API / Lighthouse / PerformanceObserver}
Metrics: {LCP, CLS, INP, FCP, TTFB — whichever relevant}
Threshold: {what the VM requires}
Result: {pass/fail with measured values}
Timestamp: {datetime}
```

### Chrome MCP GIF Recording
```
Proof: GIF recording of user flow
File: {gif_filename}
Flow: {description of the recorded interaction}
Key moments: {what the GIF demonstrates}
Timestamp: {datetime}
```

## Valid Proof Summary

| Proof type | Description | Example |
|-----------|-------------|---------|
| e2e_test_output | Output from Playwright/Cypress test exercising exact VM behavior | `npx playwright test --grep "user can checkout"` |
| component_test_output | Output from Testing Library/Vitest test exercising exact VM behavior | `npx vitest run src/components/Cart.test.tsx` |
| a11y_audit | Axe-core audit result on a real page (via Chrome MCP or standalone) | `javascript_tool` injecting axe-core |
| visual_regression | Visual comparison result from automated tooling | Playwright visual comparison or Percy snapshot |
| network_capture | Intercepted network request/response during test or via Chrome MCP | `read_network_requests` with URL filter |
| browser_state | Browser storage content after action | `javascript_tool` reading localStorage |
| chrome_screenshot | Chrome MCP screenshot with Claude visual analysis | `computer` screenshot action |
| responsive_sweep | Multi-viewport screenshots via Chrome MCP | `resize_window` at 375/768/1280 + screenshots |
| error_state | Error/empty/loading state captured via Chrome MCP | Navigate + provoke error + screenshot |
| performance_metrics | CWV or Lighthouse metrics from real page | `javascript_tool` with Performance API |
| gif_recording | GIF recording of a complete user flow | `gif_creator` start/stop/export |
| console_check | Console output verification (errors, warnings) | `read_console_messages` with pattern |
| screenshot | User-provided screenshot at specified viewport | Manual screenshot from user |
| api_response | Full HTTP response from a real endpoint | `curl -s https://api.example.com/orders` |

## Invalid Proof Types (systematic rejection)

These are NEVER acceptable as proof, regardless of how convincing they seem:

| Invalid proof | Why it is rejected |
|--------------|-------------------|
| "I read the component and it renders X" | Code can have bugs not visible from reading |
| "The JSX contains the correct elements" | Reading JSX is code analysis, not testing |
| "The CSS classes are correctly applied" | Style analysis is not behavioral verification |
| "The route is defined in the router config" | Config existence does not prove runtime behavior |
| "Logically, it should work" | Reasoning does not replace observation |
| "The code hasn't changed since last time" | The environment or dependencies may have changed |
| "The CI pipeline is green" | CI tests may not cover this specific behavior |
| "The component renders without errors" | Rendering without errors proves nothing about business behavior |
| "The unit test passes" (without exercising exact VM behavior) | Generic tests prove internal logic, not specific behavior |
| "Static analysis / TypeScript compilation passes" | Type checking proves types, not runtime behavior |
| "Inspecting compiled HTML/CSS output" | Reading compiled output is code analysis, not browser testing |

### Test-Specific Rules

A test result is ONLY valid proof if:
1. The test name or test body directly exercises the EXACT behavior described in the VM
2. The test assertions verify the EXACT expected outcome from the VM
3. A passing generic test that happens to touch the same component is NOT sufficient

**Example:** A VM says "The checkout button is disabled when the cart is empty." A test named `test_cart_component` that passes is NOT valid proof. A test named `test_checkout_button_disabled_when_cart_empty` that asserts the button's disabled state IS valid proof.

### Screenshot-Specific Rules

A user screenshot is valid proof ONLY when:
1. The URL is visible or confirmed
2. The viewport/device is specified (for responsive VMs)
3. The screenshot clearly shows the element or behavior described in the VM
4. For responsive VMs, screenshots at EACH required breakpoint are needed

## The Cardinal Rule

**If you cannot demonstrate it with a real browser execution or test output, it is NOT validated.**

Code analysis can inform WHAT to test, but it can never BE the test.

## Rules

1. Each VM MUST have at least one valid proof
2. A VM without proof = **automatic FAIL**
3. A VM with only invalid proofs = **automatic FAIL**
4. In case of doubt about the validity of a proof, consider it invalid
5. **ONE non-conforming result = immediate FAIL** — NEVER retest with other data, NEVER look for an explanation, NEVER rationalize the divergence. The first test is authoritative.
