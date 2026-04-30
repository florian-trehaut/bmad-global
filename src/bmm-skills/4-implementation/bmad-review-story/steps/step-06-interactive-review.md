# Step 6: Interactive Review


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Interactive Review with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present ALL findings at once to the user, then collect decisions on each. Before presenting, resolve any findings that propose multiple options by proactively investigating to determine the best recommendation.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`, when TEAMMATE_MODE=true:

- **Reroute the AskUserQuestion call**: emit a `question` SendMessage to `LEAD_NAME` with all findings as the payload. Block on the reply (which contains the user's per-finding decisions).
- The reply is delivered via SendMessage with `type: question_reply`, mapping each finding to ACCEPTED / REJECTED / MODIFIED / SKIPPED.
- TAC-18 unwanted-pattern: invoking AskUserQuestion directly while TEAMMATE_MODE=true → HALT.

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below as normal.

## RULES

- Present ALL findings in a single message — do not drip-feed one by one
- Order: BLOCKERs first, then MAJORs, then MINORs, then INFOs
- **PROACTIVE INVESTIGATION (CRITICAL):** Before presenting findings, review each proposed action. If ANY finding proposes multiple options or alternatives (e.g., "Option A: ... or Option B: ..."), you MUST autonomously investigate to determine the best option BEFORE presenting. This means: query databases, read code, search for best practices on the web, check documentation — whatever it takes. Then present a SINGLE recommended action with evidence for why it's the best choice. The user should receive a clear recommendation, not an open question.
- Track decisions: ACCEPTED / REJECTED / MODIFIED / SKIPPED
- Do not apply modifications yet — that happens in Step 7
- **Surface story-spec v2 findings explicitly**, in this order of priority:
  1. **EARS conformance violations** (TACs not matching one of the 5 patterns / TACs without BAC reference / BACs not in G/W/T) — usually MAJOR
  2. **Risks register gaps** (HIGH-impact risks without mitigation in scope, INVALIDATED assumptions silently ignored) — usually MAJOR-to-BLOCKER
  3. **Phase B quality gaps** (shallow Real-Data Findings or External Research on stories that warrant them) — usually MINOR-to-MAJOR
  4. **Out-of-Scope contradictions** (an OOS-N item that contradicts the in-scope section) — MAJOR
  5. **Boundary contradictions** (story-specific items contradicting project baseline, or single-item buckets) — MAJOR
  6. **NFR / Security Gate / Observability quality gaps** (categories left blank without N/A justification, security gate without binary verdict) — MAJOR-to-BLOCKER
  7. **INVEST self-check failures** (any NO without remediation action) — MAJOR
  These v2-specific findings are tagged in the table with a `[v2]` label.

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

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Interactive Review
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
