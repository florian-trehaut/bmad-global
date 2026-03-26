# Step 6: Interactive Review

## STEP GOAL

Present ALL findings at once to the user, then collect decisions on each. Before presenting, resolve any findings that propose multiple options by proactively investigating to determine the best recommendation.

## RULES

- Present ALL findings in a single message — do not drip-feed one by one
- Order: BLOCKERs first, then MAJORs, then MINORs, then INFOs
- **PROACTIVE INVESTIGATION (CRITICAL):** Before presenting findings, review each proposed action. If ANY finding proposes multiple options or alternatives (e.g., "Option A: ... or Option B: ..."), you MUST autonomously investigate to determine the best option BEFORE presenting. This means: query databases, read code, search for best practices on the web, check documentation — whatever it takes. Then present a SINGLE recommended action with evidence for why it's the best choice. The user should receive a clear recommendation, not an open question.
- Track decisions: ACCEPTED / REJECTED / MODIFIED / SKIPPED
- Do not apply modifications yet — that happens in Step 7

## SEQUENCE

### 1. Pre-presentation: resolve open options

Before presenting anything, scan all findings:

For EACH finding where `proposed_action` contains multiple options or an unresolved choice:
1. **Investigate autonomously** — query code, databases, APIs, web search for best practices
2. **Pick the best option** — based on evidence gathered
3. **Rewrite `proposed_action`** — as a single, clear, executable recommendation
4. **Add `investigation_notes`** — brief explanation of what you checked and why this option wins

Only present to the user AFTER all options are resolved.

### 2. Present all findings at once

Present a summary header followed by ALL findings in a single message:

```
## Review Summary

- **Total findings:** {count}
- **BLOCKERs:** {count}
- **MAJORs:** {count}
- **MINORs:** {count}
- **INFOs:** {count}

---

### Finding {id} — {severity} — {category}

**{title}**

**Story says:** {story_says}
**Reality:** {reality}
**Evidence:** {evidence}

**Recommended action:** {proposed_action}
{if investigation_notes: **Investigation notes:** {investigation_notes}}

---

{... repeat for all findings ...}

---

For each finding, reply with its ID and verdict:
**[A]**ccept | **[R]**eject | **[M]**odify | **[S]**kip

Example: "F-001 A, F-002 A, F-003 M: change X to Y, F-004 S"
Or review one at a time — your call.
```

WAIT for user response.

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

The user may respond in bulk ("F-001 A, F-002 A, F-003 R") or one at a time. Handle both styles. If some findings need discussion (M), handle those individually after processing the bulk decisions.

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
