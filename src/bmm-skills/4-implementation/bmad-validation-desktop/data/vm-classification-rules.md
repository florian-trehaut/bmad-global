# VM Item Classification Rules — Desktop

Classify each Validation Metier item into ONE type based on what proof is needed.

## Types

### `behavior` — Testable via test framework or manual exercise

The VM describes an observable action or feature outcome.

**Signals:**
- "When the user does X, Y happens", "Executing the command produces..."
- "The action triggers...", "The feature enables..."
- Mentions keyboard shortcuts, menu actions, editor operations, commands

**Action:** run `{TEST_COMMAND}` targeting the specific test that exercises this behavior. If no test exists or the behavior requires the full running app, switch to `local` environment and instruct the user.

### `state` — Verifiable via file system or persistent data inspection

The VM describes data that should be persisted, transformed, or maintained after an action.

**Signals:**
- "The file is saved with...", "Settings persist after restart..."
- "Workspace state contains...", "Configuration is updated..."
- "After closing and reopening...", "The data is preserved..."
- Mentions config files, workspace state, saved documents, preferences

**Action:** execute the action (via test or manual), then inspect the file system state with shell commands (`cat`, `diff`, `ls`, `find`). Capture the file content or diff as proof.

### `ui` — Requires visual validation by the user

The VM describes a behavior visible in the native application window.

**Signals:**
- "The panel shows...", "The icon displays...", "The sidebar contains..."
- "The layout renders...", "The dialog appears...", "The tooltip shows..."
- Mentions visual elements, rendering, styling, window state

**Action:** read the relevant UI code in `{WORKTREE_PATH}` to understand the component structure. Prepare step-by-step instructions (how to launch, navigate, what to look for). HALT for screenshot. Critically evaluate the result.

### `log` — Verifiable via application log files

The VM mentions log events, traces, or diagnostic output.

**Signals:**
- "An error is logged...", "The event appears in logs..."
- "The trace shows...", "A warning is emitted..."
- "The log level...", "The diagnostic output contains..."

**Action:** trigger the action (via test or manual), then read the log file at `{APP_LOG_DIR}` using `grep`, `tail`, or `cat`. Capture the relevant log lines as proof.

### `integration` — Verifiable via external system interaction

The VM describes interaction with an OS-level or external system.

**Signals:**
- "The clipboard contains...", "The LSP server receives..."
- "The file association opens...", "The system notification appears..."
- "The IPC message is sent...", "The protocol response includes..."
- Mentions clipboard, drag-and-drop, file associations, URI schemes, IPC, LSP, extensions

**Action:** exercise the integration point (via test or manual), then verify the external effect using appropriate shell commands (clipboard tools, log inspection, process output, file system checks).

### `mixed` — Combination of types

The VM requires multiple types of verification.

**Example:** "Copy text and verify it appears in the clipboard AND a notification is shown" = `integration` (clipboard) + `ui` (notification).

**Action:** decompose into typed sub-steps, execute each with its type.

## Classification Summary

| Type | When to use | Proof method |
|------|------------|-------------|
| behavior | Item verifies a feature action or observable outcome | Test output or manual exercise |
| state | Item verifies data persisted, transformed, or maintained | File system inspection |
| ui | Item verifies visual rendering or UI elements | Screenshot from user |
| log | Item verifies log events, traces, or diagnostic output | Log file inspection |
| integration | Item verifies interaction with OS or external systems | External system verification |
| mixed | Item requires multiple proof types | Combination |

## Default rule

If a VM does not clearly match any single type, classify as `mixed` and decompose.

## Environment preference by type

- `behavior`, `state`, `log`: prefer `test` environment (automated, fast)
- `ui`, `integration`: often require `local` environment (full running app)
- `mixed`: determine per sub-step
