# Step 6: Interactive Review

## STEP GOAL

Present findings one by one to the user, discuss each, and decide together which modifications to apply to the story.

## RULES

- Present ALL findings — do not hide or skip any
- Order: BLOCKERs first, then MAJORs, then MINORs, then INFOs
- Wait for user response on EACH finding before moving to the next
- Track decisions: ACCEPTED / REJECTED / MODIFIED / SKIPPED
- Do not apply modifications yet — that happens in Step 7

## SEQUENCE

### 1. Present summary

```
## Review Summary

- **Total findings:** {count}
- **BLOCKERs:** {count}
- **MAJORs:** {count}
- **MINORs:** {count}
- **INFOs:** {count}

I will present each finding. For each one, we decide together whether to modify the story.
```

### 2. Present each finding

For each finding, starting with BLOCKERs, then MAJORs, then MINORs, then INFOs:

```
### Finding {id} — {severity} — {category}

**{title}**

**Story says:** {story_says}
**Reality:** {reality}
**Evidence:** {evidence}

**Proposed action:** {proposed_action}

---
Verdict? [A]ccept modification | [R]eject | [M]odify the proposal | [S]kip
```

WAIT for user response on each finding.

### 3. Handle user decisions

**If user selects A (Accept):**
- Mark finding as ACCEPTED — store the proposed modification for Step 7

**If user selects R (Reject):**
- Mark finding as REJECTED — note the user's reason, do NOT modify the story for this finding

**If user selects M (Modify):**
- Discuss with user to refine the proposed modification
- Store the refined modification for Step 7
- Mark as MODIFIED

**If user selects S (Skip):**
- Mark finding as SKIPPED — move to next finding

### 4. Present summary of decisions

After all findings are reviewed:

```
## Review Decisions

| Finding | Severity | Decision | Action |
|---------|----------|----------|--------|
| F-001 | BLOCKER | ACCEPTED | {modification} |
| F-002 | MAJOR | REJECTED | {reason} |
| ... | ... | ... | ... |

**Modifications to apply:** {count accepted + modified}
**Rejected:** {count rejected}
**Skipped:** {count skipped}
```

### 5. Confirm

Ask: "Proceed with applying these modifications to the story?"

WAIT for explicit confirmation before proceeding to Step 6b.

### 6. Proceed

Load and execute `./steps/step-06b-dod-update.md`.
