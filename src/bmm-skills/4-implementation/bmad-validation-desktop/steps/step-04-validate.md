# Step 4: Validate

## STEP GOAL

Execute each Validation Metier (VM) item one by one. For each VM: classify, execute or delegate, collect tangible proof, render a verdict.

## RULES

- Load `../data/vm-classification-rules.md` and `../data/proof-standards.md` BEFORE starting
- Load `~/.claude/skills/bmad-shared/validation-proof-principles.md` and apply its universal rules
- Each VM MUST have valid proof to pass — no exceptions
- Code analysis is NEVER proof — see proof-standards.md
- Display the verdict of each VM immediately after validation
- NEVER validate a VM "by optimism" or "because the code looks correct"
- In case of doubt, FAIL

### ANTI-TECHNICAL-VALIDATION (CRITICAL)

**You are a BUSINESS validator, not a technical reviewer. The following are NEVER valid validation approaches:**

- "I read the source code and the function handles this case" — NO. This is code analysis.
- "The test module imports the right function" — NO. Reading code structure is not testing.
- "The function signature accepts the right type, so it should work" — NO. Prove it with execution.
- "Static analysis passes" — NO. Linting proves style, not behavior.
- "The code compiles without errors" — NO. Compilation proves syntax, not behavior.

**Rule:** The only valid proof is an executed test that exercises the EXACT behavior described in the VM, or observable output from the running application.

### ANTI-RATIONALIZATION (CRITICAL)

**When a result does NOT match the expected outcome, FAIL IMMEDIATELY. No second chance, no explanation.**

Forbidden behaviors:
- "The test might be flaky" — NO. The result diverges = FAIL.
- "Let's verify with a different test" — NO. The first test failed = FAIL.
- "It's possibly because..." — NO. You are not here to find excuses.
- "Let's try a different input" — NO. If the first case fails, the feature does not work universally.
- Changing test parameters to obtain a positive result — FORBIDDEN.
- Testing a second sample after a first failure — FORBIDDEN.

**Rule:** ONE non-conforming result is enough for FAIL.

## SEQUENCE

### 1. Load standards

Read:
- `../data/vm-classification-rules.md`
- `../data/proof-standards.md`

### 2. Initialize results

```
VM_RESULTS = []
```

### 3. Validation loop

For each VM in the list parsed at step 1:

#### 3a. Display the current VM

"**VM-{n}**: {description}"

#### 3b. Classify the VM

Apply the rules from `vm-classification-rules.md` to determine the type: `behavior`, `state`, `ui`, `log`, `integration`, `mixed`.

Display: "Type: **{type}**"

#### 3c. Execute based on type

**If `behavior`:**
1. Read relevant code in `{WORKTREE_PATH}` to identify the specific test(s) that exercise this behavior
2. If `ENVIRONMENT = test`: construct the targeted test command from `{TEST_COMMAND}`. Run it. Capture full output (pass/fail, assertions, stdout).
3. If `ENVIRONMENT = local`: prepare step-by-step instructions for the user to exercise the behavior in the running app. Describe exact action, expected result, what to observe. HALT for user confirmation of the outcome.
4. Evaluate: does the test output or user observation match what the VM expects?

**If `state`:**
1. Determine what file system state, config state, or persistent state the VM describes
2. Execute the action (via test or manual instruction)
3. Inspect the resulting state with shell commands (`cat`, `diff`, `ls`, `find`)
4. Capture: command, file content or diff, timestamp
5. Evaluate: does the state match expectations?

**If `ui`:**
1. Read the relevant UI code in `{WORKTREE_PATH}` to understand the component structure
2. Prepare step-by-step instructions for the user:
   - How to launch the app or navigate to the right view
   - Actions to perform (clicks, keyboard shortcuts, inputs)
   - Elements to verify visually
3. Display the instructions
4. **HALT**: "Send me a screenshot of the application window once you have completed the steps."
5. Upon receiving the screenshot:
   - Examine the content visually
   - Verify that the expected elements are present and conforming
   - If doubt — ask for an additional screenshot or clarification

**If `log`:**
1. Determine what log event the VM expects
2. Trigger the action (via test or manual instruction)
3. Read the log file at `{APP_LOG_DIR}` using `grep`, `tail`, or `cat`
4. Capture: command, relevant log lines, timestamp
5. Evaluate: do the logs show the expected behavior?

**If `integration`:**
1. Determine the external system involved (clipboard, IPC, LSP, file association, etc.)
2. Exercise the integration point (via test or manual instruction)
3. Verify the external effect using appropriate shell commands:
   - Clipboard: read via OS clipboard command
   - LSP/IPC: check logs for protocol messages
   - File associations: verify file opens or process output
   - System integration: inspect relevant artifacts
4. Capture: command, output, timestamp
5. Evaluate: does the external system reflect the expected state?

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
