# Proof Standards — Desktop

## Principle

**Only valid proof = result of a real execution on the target environment.**

Proof is an artifact captured DURING the execution of the validation, not a priori reasoning.

## Valid Proof Types

### Test Output
```
Proof: Test execution
Command: {test_command_with_args}
Result: {pass/fail}
Key assertions: {assertions that passed or failed}
Output: {relevant stdout/stderr extract}
Timestamp: {datetime}
```

### App Log Content
```
Proof: Log file
File: {log_file_path}
Lines: {relevant log lines}
Pattern matched: {what was searched for}
Timestamp: {log entry timestamps}
```

### File System State
```
Proof: File inspection
Command: {cat/diff/ls/find command}
Result: {file content, diff output, or listing}
Timestamp: {datetime}
```

### Process Output
```
Proof: Process execution
Command: {command with flags}
stdout: {relevant output}
stderr: {relevant output}
Exit code: {code}
Timestamp: {datetime}
```

### User Screenshot
```
Proof: User screenshot
Action: {what the user did}
Window/Panel: {which part of the application}
Visible result: {description of what is seen}
Conforming: {yes/no + justification}
```

### Clipboard Content
```
Proof: Clipboard check
Action: {what triggered the copy}
Command: {clipboard read command}
Content: {clipboard content}
Expected: {what was expected}
Timestamp: {datetime}
```

### IPC/Protocol Message
```
Proof: Protocol message
Source: {log file or capture method}
Message: {relevant protocol message}
Expected: {what was expected}
Timestamp: {datetime}
```

## Valid Proof Summary

| Proof type | Description | Example |
|-----------|-------------|---------|
| test_output | Output from running a test that exercises the exact VM behavior | `{TEST_COMMAND} -- test_file_finder_opens` |
| app_log | Log entry from the application's log files | `grep "LSP connected" {APP_LOG_DIR}/app.log` |
| file_state | File system state after an action | `cat ~/.config/myapp/settings.json` |
| process_output | stdout/stderr from running the app or a command | `{APP_BINARY_PATH} --check-config` |
| screenshot | Native window screenshot showing UI state | User-provided screenshot of the application |
| clipboard | System clipboard content after a copy action | Clipboard read command output |
| ipc_message | Protocol message captured from IPC/LSP communication | Log entry showing protocol exchange |

## Invalid Proof Types (systematic rejection)

These are NEVER acceptable as proof, regardless of how convincing they seem:

| Invalid proof | Why it is rejected |
|--------------|-------------------|
| "I read the code and it does X" | Code can have bugs not visible from reading |
| "The unit test passes" (without exercising the exact VM behavior) | Generic tests prove internal logic, not the specific business behavior |
| "Logically, it should work" | Reasoning does not replace observation |
| "The code hasn't changed since last time" | The environment or dependencies may have changed |
| "The CI pipeline is green" | CI tests may not cover this specific behavior |
| "The code compiles" | Compilation proves syntax, not behavior |
| "Static analysis passes" | Linting and analysis prove style/patterns, not behavior |
| "The function signature is correct" | Type checking proves types, not runtime behavior |
| "I see the right pattern in the source" | Pattern matching in code is code analysis, not execution |

### Test-Specific Rules

A test result is ONLY valid proof if:
1. The test name or test body directly exercises the EXACT behavior described in the VM
2. The test assertions verify the EXACT expected outcome from the VM
3. A passing generic test that happens to touch the same module is NOT sufficient

**Example:** A VM says "Ctrl+P opens the file finder." A test named `test_editor_basics` that passes is NOT valid proof. A test named `test_ctrl_p_opens_file_finder` that asserts the file finder panel is visible IS valid proof.

## The Cardinal Rule

**If you cannot demonstrate it with a real execution output, it is NOT validated.**

Code analysis can inform WHAT to test, but it can never BE the test.

## Rules

1. Each VM MUST have at least one valid proof
2. A VM without proof = **automatic FAIL**
3. A VM with only invalid proofs = **automatic FAIL**
4. In case of doubt about the validity of a proof, consider it invalid
5. **ONE non-conforming result = immediate FAIL** — NEVER retest with other data, NEVER look for an explanation, NEVER rationalize the divergence. The first test is authoritative.
