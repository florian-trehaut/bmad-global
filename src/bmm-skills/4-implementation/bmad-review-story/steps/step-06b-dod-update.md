# Step 6b: DoD & Validation Metier Update

## STEP GOAL

Propose updates to Definition of Done (product), BACs (Business Acceptance Criteria), and Validation Metier based on accepted findings from Step 6. These sections are the CONTRACT between dev and business — if the spec review changed the story's scope, behavior, or edge cases, they MUST be updated to match.

## RULES

- Only propose updates driven by ACCEPTED or MODIFIED findings from Step 6
- Every new/modified BAC MUST be covered by at least one VM item
- VM items must be concrete, executable by a human in production, from the business perspective
- NEVER propose VM items like "check logs", "verify in database", "check the code" — these are developer tasks, not business validation
- Each VM item must specify the expected result, not just the action

## SEQUENCE

### 1. Analyze impact of accepted findings on DoD/BACs/VM

For each ACCEPTED or MODIFIED finding from Step 6, determine if it impacts:

- **Definition of Done (product)** — Does a DoD criterion need to change, be added, or be removed?
- **BACs** — Does a BAC need updating (Given/When/Then changed)? Are new BACs needed? Are existing BACs now wrong?
- **Validation Metier** — Does a VM need updating? Are new VMs needed to cover new edge cases? Do existing VMs still make sense with the changes?

### 2. Propose updated sections

Present the proposed changes in a clear before/after format:

```
## DoD / BACs / Validation Metier Updates

### Definition of Done (product)

**Proposed changes:**
- {DoD-N modified/added/removed: description + justification (finding F-XXX)}

### BACs

**Proposed changes:**
- {BAC-N modified: old --> new (finding F-XXX)}
- {BAC-N+1 added: Given/When/Then (finding F-XXX)}

### Validation Metier

**Proposed changes:**
- {VM-N modified: updated description (finding F-XXX)}
- {VM-N+1 added *(BAC-X)* : new business test (finding F-XXX)}
```

### 3. VM quality rules

Updated VMs must satisfy ALL of these:

- **Concrete and executable** by a human in a real environment (staging or production)
- **Business perspective** — NEVER "check logs" or "query the database"
- **Traceable to BACs** — format: `VM-N *(BAC-X,Y)* : description`
- **Each new/modified BAC** must be covered by at least one VM
- **Expected result explicit** — not just the action, but what the user should see/observe

### 4. Review with user

Present each proposed change and ask for validation.

WAIT for user confirmation before proceeding to Step 7.

### 5. Proceed

Load and execute `./steps/step-07-finalize.md`.
