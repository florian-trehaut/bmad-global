---
nextStepFile: './step-06-review.md'
---

# Step 5b: Impact Analysis

## STEP GOAL:

Systematically verify that every piece of code we plan to modify has no unplanned side effects on its callers, dependents, and consumers. Detect missing changes before they become production bugs.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator with systems thinking
- Your job is to find what we MISSED -- the ripple effects the plan didn't anticipate
- Collaborative dialogue -- present findings, user validates

### Step-Specific Rules:

- Focus on callers and dependents of modified functions/types -- not the modifications themselves (that was Step 5)
- FORBIDDEN: skipping this step because "it's a small change" -- even a regex change can break callers
- FORBIDDEN: saying "no impact found" without having actually searched
- Approach: for EACH function/type/interface modified, trace ALL callers and verify compatibility

## EXECUTION PROTOCOLS:

- Use subprocess per modified file when available -- each subprocess greps callers and returns structured impact summary
- Follow MANDATORY SEQUENCE exactly
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu

## CONTEXT BOUNDARIES:

- Available: worktree at {SPEC_WORKTREE_PATH}, implementation plan from Step 5
- Focus: reverse dependency analysis -- who calls what we're changing?
- Dependencies: Step 5 completed, all tasks defined

---

## MANDATORY SEQUENCE

### 1. Build Modification Inventory

From the implementation plan (Step 5), extract every function, method, type, interface, or behavior that will change:

```markdown
### Planned Modifications

| # | File | Function/Type | Nature of Change |
|---|------|---------------|-----------------|
| M1 | path/to/file.ts | functionName() | Behavior change: {description} |
| M2 | path/to/file.ts | InterfaceType | Signature/type change |
| ...| ... | ... | ... |
```

### 2. Trace Callers & Dependents

For EACH modification in the inventory, search the ENTIRE codebase for:

**Direct callers:**
- `grep -r "functionName"` across all source directories
- Check imports of the modified file
- Check test files that test the modified function

**Type/interface consumers:**
- If a type or interface changes, find all files that import it
- If a return type changes, find all callers that use the return value

**Behavioral dependents:**
- If the function's behavior changes (e.g., returns different value for same input), find all callers that depend on the old behavior
- If error handling changes (e.g., throw vs. return), find callers that catch or expect the old behavior

**Cross-service consumers:**
- If the change affects an API contract (RPC, REST), find all clients
- If the change affects a shared package, find all consuming apps/services
- If the change affects an event schema, find all listeners

**Data consumers (indirect impact -- no function call):**
- If the change modifies what is WRITTEN to a DB column (e.g., value was NULL, now it's populated; or value format changes), find ALL services/queries/reports that READ that column
- Search for the column name across all apps, not just the writing service -- other services may query the same DB
- Check API responses that expose the column -- downstream consumers may parse it
- Check export/batch jobs that read the data (CSV generators, email templates, reports)
- Check if any scheduled job, bot, or external system reads this data via API or direct DB access
- The question is: "who consumes the DATA we're changing, even without calling our code?"

### 3. Assess Impact per Caller

For each caller/dependent found:

```markdown
### Impact Assessment

| # | Caller | File | Impact | Action Required |
|---|--------|------|--------|-----------------|
| I1 | CallerFunction() | path/to/caller.ts | Compatible -- caller doesn't use the changed aspect | None |
| I2 | OtherCaller() | path/to/other.ts | Needs update -- depends on old behavior X | Add Task N+1 |
| I3 | TestFile | path/to/test.spec.ts | Test needs update -- asserts old behavior | Update in Task N |
| ...| ... | ... | ... | ... |
```

Verdicts:
- **Compatible** -- caller is unaffected by the change. Explain WHY.
- **Needs update** -- caller depends on the changed behavior. MUST add a task to the plan.
- **Test update** -- test asserts old behavior. Include in existing test task.
- **Breaking** -- change will break this caller. MUST address before proceeding.

### 4. Update Plan if Needed

If any impact requires new tasks or modifications to existing tasks:
- Add new tasks to the implementation plan
- Modify existing tasks to include the additional changes
- Update the TAC list if new acceptance criteria are needed

Present changes clearly:

```markdown
### Plan Updates from Impact Analysis

**New tasks added:**
- Task N+1: {description} -- triggered by impact I2

**Tasks modified:**
- Task N: added {change} -- triggered by impact I3

**No changes needed for:**
- I1, I4, I5 -- callers are compatible (reasons documented above)
```

### 5. Generate Non-Regression Validation Metier

For each impacted consumer/caller that is NOT marked trivially compatible, add a **non-regression VM** to the Validation Metier checklist:

```markdown
### Validation Metier -- Non-regression (added by impact analysis)

- [ ] VM-NR-1 *(Impact I4)* : {concrete business test verifying the impacted flow still works}
- [ ] VM-NR-2 *(Impact I10)* : {concrete business test}
```

**Rules for non-regression VMs:**
- Concrete and executable -- from business perspective, not technical
- Trace to the impact that generated them (*(Impact IN)*)
- Verify the impacted flow end-to-end, not just absence of error
- Examples:
  - "VM-NR-1 *(Impact I4)* : After deployment, rerun the batch process on a valid order and verify it completes correctly (non-regression of nominal flow)"
  - "VM-NR-2 *(Impact I9)* : Verify the GET /orders/{id} API returns the expected fields for an existing order"

Also update the **Definition of Done (product)** to include these non-regression VMs in the "Non-regression" section.

### 6. Update WIP File

Append impact analysis section AND non-regression VMs to WIP file. Update `stepsCompleted` to include this step.

### 7. Present MENU OPTIONS

Display: "**Select:** [C] Continue to review (Step 6)"

#### Menu Handling Logic:

- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#7-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Every modified function/type inventoried
- Every caller/dependent traced via grep/search (not guessed)
- Data consumers traced (who reads the DB columns we modify, even without function calls)
- Impact assessed for each caller/consumer with explicit verdict and reasoning
- Plan updated if any caller needs changes
- Non-regression VMs generated for impacted flows
- Definition of Done updated with non-regression section
- WIP file updated

### FAILURE:

- Saying "no impact" without searching
- Missing callers in other services or packages
- Not checking test files for old behavior assertions
- Not updating the plan when an impact is found
