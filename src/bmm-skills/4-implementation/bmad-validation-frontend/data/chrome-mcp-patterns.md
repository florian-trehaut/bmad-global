# Chrome MCP Validation Patterns

Reference guide for using Chrome MCP tools during frontend business validation.

## Tool Reference

| Action | MCP Tool | Usage |
|--------|----------|-------|
| Navigate to URL | `mcp__claude-in-chrome__navigate` | Open the page to validate |
| Capture screenshot | `mcp__claude-in-chrome__computer` (screenshot action) | Visual proof — Claude analyzes the image |
| Zoom to region | `mcp__claude-in-chrome__computer` (zoom action) | Inspect a specific UI element in detail |
| Click element | `mcp__claude-in-chrome__computer` (left_click action) | Interact with buttons, links, menus |
| Type text | `mcp__claude-in-chrome__computer` (type action) | Fill text inputs |
| Press key | `mcp__claude-in-chrome__computer` (key action) | Keyboard shortcuts, Enter, Tab |
| Fill form | `mcp__claude-in-chrome__form_input` | Set form field values by ref ID |
| Find element | `mcp__claude-in-chrome__find` | Natural language element search |
| Read page text | `mcp__claude-in-chrome__get_page_text` | Extract visible text content |
| Read a11y tree | `mcp__claude-in-chrome__read_page` | Accessibility tree with interactive elements |
| Read console | `mcp__claude-in-chrome__read_console_messages` | Check for JS errors/warnings |
| Read network | `mcp__claude-in-chrome__read_network_requests` | Verify API calls triggered by frontend |
| Resize viewport | `mcp__claude-in-chrome__resize_window` | Responsive testing at breakpoints |
| Record GIF | `mcp__claude-in-chrome__gif_creator` | Record user flow as animated proof |
| Execute JS | `mcp__claude-in-chrome__javascript_tool` | Inject axe-core, read state, measure performance |
| Create tab | `mcp__claude-in-chrome__tabs_create_mcp` | Open new tab for validation |
| Get tab context | `mcp__claude-in-chrome__tabs_context_mcp` | List open tabs and their states |

## Standard Validation Sequences

### Visual Validation
1. `tabs_create_mcp` — open new tab
2. `navigate` — go to the URL
3. Wait for page load (check via `read_page` or short pause)
4. `computer` (screenshot) — capture current state
5. Claude analyzes the screenshot against VM expectations
6. `read_console_messages` (pattern: `"error|warning"`) — check for JS errors

### Responsive Validation
1. `tabs_create_mcp` + `navigate`
2. Loop for each breakpoint:
   - `resize_window` (375, 812) — mobile
   - `computer` (screenshot) — capture mobile layout
   - `resize_window` (768, 1024) — tablet
   - `computer` (screenshot) — capture tablet layout
   - `resize_window` (1280, 800) — desktop
   - `computer` (screenshot) — capture desktop layout
3. Compare all screenshots against VM expectations

### Accessibility Validation
1. `tabs_create_mcp` + `navigate`
2. `javascript_tool` — inject and run axe-core:
   ```javascript
   const script = document.createElement('script');
   script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js';
   document.head.appendChild(script);
   ```
3. Wait for load, then run:
   ```javascript
   axe.run().then(results => console.log(JSON.stringify(results.violations)));
   ```
4. `read_console_messages` — capture violations
5. `read_page` — get native accessibility tree for additional verification

### Error State Validation
1. `tabs_create_mcp` + `navigate`
2. Provoke error via `javascript_tool`:
   - Offline: `window.dispatchEvent(new Event('offline'))`
   - Network failure: override fetch/XHR
   - Empty state: clear relevant data
3. `computer` (screenshot) — capture error/empty state
4. `read_console_messages` — verify error handling (no unhandled errors)

### Performance Validation
1. `tabs_create_mcp` + `navigate`
2. `javascript_tool` — extract performance metrics:
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
3. `read_console_messages` — capture metrics
4. Compare against VM thresholds

### User Flow Validation (E2E via Chrome MCP)
1. `gif_creator` (start_recording) — begin recording
2. `tabs_create_mcp` + `navigate`
3. Execute the flow: `find` → `left_click` → `form_input` → `left_click` → etc.
4. At each step: `computer` (screenshot) for evidence
5. `gif_creator` (stop_recording + export) — save proof
6. Verify final state against VM expectations

## Limitations

- **Chrome only** — no Firefox or Safari coverage
- **No headless mode** — Chrome must be open and visible
- **JS alerts block** — `alert()`, `confirm()`, `prompt()` freeze all browser events. Avoid triggering them; if unavoidable, warn the user to dismiss manually.
- **Token cost** — each screenshot consumes ~2000 tokens. Budget for 5-10 screenshots per validation session.
- **Auth session** — Chrome MCP shares the user's real browser session. If the app requires login, the user must be logged in before validation starts.
- **Text input** — first character may be dropped in some beta versions. Verify input values after entry.
