# Step 4: Validate


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Validate with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Execute each Validation Metier (VM) item one by one. For each VM: classify, execute or delegate, collect tangible proof, render a verdict.

## RULES

- Load `../data/vm-classification-rules.md` and `../data/proof-standards.md` BEFORE starting
- Load `~/.claude/skills/bmad-shared/validation/validation-protocol.md#proof-principles` and apply its universal rules
- Each VM MUST have valid proof to pass — no exceptions
- Code analysis is NEVER proof — see proof-standards.md
- In production: every write action requires authorization BEFORE execution
- **In staging: creating test data (beneficiaries, orders, invitations, bookings) is authorized** if needed to trigger the flows under validation. Document created data in the report.
- Display the verdict of each VM immediately after validation
- NEVER validate a VM "by optimism" or "because the code looks correct"
- In case of doubt, FAIL

### ANTI-TECHNICAL-VALIDATION (CRITICAL)

**You are a BUSINESS validator, not a technical reviewer. The following are NEVER valid validation approaches:**

- "Inspect the compiled HTML to verify img attributes" — NO. This is code analysis disguised as validation.
- "Compare template source code between services" — NO. Reading code is not testing.
- "The HTML shows the correct attributes, so it's valid" — NO. Only a real email opened on a real client mail proves rendering.
- "Validate technically that the fix is applied" — NO. Your job is to prove the BUSINESS OUTCOME works, not that the code is correct.

**Rule:** For email-related VMs, the only valid proof is: (1) a real email sent via the deployed service, (2) confirmed delivered by the email provider (Resend API), and (3) visually verified by the user on the target email client.

### ANTI-RATIONALIZATION (CRITICAL)

**When a result does NOT match the expected outcome, FAIL IMMEDIATELY. No second chance, no explanation.**

Forbidden behaviors:
- "This might be due to replication lag" — NO. The result diverges = FAIL.
- "Let's verify with a different item" — NO. The first test failed = FAIL.
- "It's possibly because..." — NO. You are not here to find excuses.
- "Let's try a more recent case" — NO. If the first case fails, the feature does not work universally.
- Changing test parameters to obtain a positive result — FORBIDDEN.
- Testing a second sample after a first failure — FORBIDDEN.

**Rule:** ONE non-conforming result is enough for FAIL. You are not looking for confirmation of success — you are looking for the first proof of failure. As soon as it appears, the VM is done.

## SEQUENCE

### 1. Load standards

Read:
- `./data/vm-classification-rules.md`
- `./data/proof-standards.md`

### 2. Initialize results

```
VM_RESULTS = []
```

### 3. Validation loop

For each VM in the list parsed at step 1:

#### 3a. Display the current VM

"**VM-{n}**: {description}"

#### 3b. Classify the VM

Apply the rules from `vm-classification-rules.md` to determine the type: `api`, `db`, `front`, `cloud_log`, `mixed`.

Display: "Type: **{type}**"

#### 3c. Execute based on type

**If `api`:**
1. Determine the endpoint, method, payload
2. If write action in production — ask authorization: "This VM requires a {METHOD} {URL} call in production. Do you authorize this action? [Y]es / [N]o"
3. Execute the HTTP request
4. Capture: status code, body (relevant extract), timestamp
5. Evaluate: does the response match what the VM expects?

**If `db`:**
1. Build the appropriate SQL query
2. Execute via the project's DB access method (psql, db skill, etc.)
3. Capture: query, result, timestamp
4. Evaluate: does the data match what is expected?

**If `front`:**
1. Read the relevant front-end code in `{WORKTREE_PATH}` (components, routes, pages)
2. Prepare step-by-step instructions for the user:
   - Exact URL to visit
   - Actions to perform (clicks, inputs)
   - Elements to verify visually
3. Display the instructions
4. **HALT**: "Send me a screenshot of the page once you have completed the steps."
5. Upon receiving the screenshot:
   - Examine the content visually
   - Verify that the expected elements are present and conforming
   - If doubt — ask for an additional screenshot or clarification

**If `cloud_log`:**
1. Build the cloud platform CLI command (log query, trace query, etc.)
2. Execute the command
3. Capture: command, relevant result, timestamp
4. Evaluate: do the logs/traces show the expected behavior?

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

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Validate
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
