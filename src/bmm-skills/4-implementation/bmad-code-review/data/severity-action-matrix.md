# Severity × Action Classification Matrix

**Consumed by:** `subagent-workflows/judge-triage.md` — every finding in the `consolidated_report` is tagged with BOTH a `severity` (impact: what is broken?) AND an `action` (disposition: what should happen?).

The two fields are orthogonal. A BLOCKER can be a `patch` (fix in the PR) OR a `decision_needed` (requires discussion), depending on ambiguity. A WARNING can be deferred or patched. Treating them separately lets the judge surface what needs human decision vs what can be automated.

---

## The axes

### Severity (impact)

| Value | Meaning | Examples |
|-------|---------|----------|
| `BLOCKER` | PR cannot merge as-is | JWT `alg=none`, dropped column without expand phase, missing auth guard, regression from stale rebase |
| `WARNING` | Problem that should be fixed but doesn't block merge | Missing timeout on outbound call, doc-comment drift, small scope creep |
| `RECOMMENDATION` | Polish, consistency, minor improvement | Unused import, formatting, inconsistent naming |
| `QUESTION` | Clarification needed from author | Undocumented design decision, scope question, architectural choice |

### Action (disposition)

| Value | Meaning |
|-------|---------|
| `patch` | Fix automatically (formatter/lint) OR one-line trivial fix that the orchestrator or author applies now |
| `decision_needed` | Requires explicit human decision before proceeding — orchestrator HALTS at presentation step, user picks a path |
| `defer` | Record in `deferred-work.md` or separate issue — not this PR |
| `dismiss` | Judge determined the finding is a false positive — MUST include a `dismiss_reason` |

---

## Decision matrix

| Severity × situation | Resulting action |
|---|---|
| BLOCKER AND trivial fix available | `patch` |
| BLOCKER AND ambiguous or architectural | `decision_needed` |
| BLOCKER AND judge determines false-positive | `dismiss` (with `dismiss_reason`) |
| WARNING AND fix is one-liner / formatter-safe | `patch` |
| WARNING AND fix requires judgement | `decision_needed` |
| WARNING AND out-of-scope for this PR | `defer` |
| WARNING AND false-positive | `dismiss` (with `dismiss_reason`) |
| RECOMMENDATION AND automated fix exists | `patch` |
| RECOMMENDATION AND manual touch | `defer` (unless quick to fix) |
| QUESTION AND mid-impact | `decision_needed` |
| QUESTION AND low-impact | `defer` (author answers in the MR description or a comment) |

**Default rule (uncertainty):** `decision_needed`. Judge errs on the side of surfacing — NEVER silently `dismiss` without a documented reason.

---

## Orchestrator routing after judge-triage

Once the consolidated report is in hand, the orchestrator (step-04-present) routes actions:

| Action | Orchestrator behaviour |
|--------|------------------------|
| `patch` | Apply trivial fix in-place (format, lint), amend the last commit |
| `decision_needed` | HALT the workflow — present the finding to the user with options (accept/reject/modify) |
| `defer` | Write to `{MAIN_PROJECT_ROOT}/_bmad-output/implementation-artifacts/deferred-work.md` and tag the MR description |
| `dismiss` | Log the dismiss_reason only — do NOT surface to the user as a finding |

---

## Output contract (on every finding)

```yaml
- id: 'F001'
  severity: BLOCKER | WARNING | RECOMMENDATION | QUESTION
  action: decision_needed | patch | defer | dismiss
  meta: 1
  sub_axis: '1a'
  perspectives: ['specs_compliance']
  file: 'apps/api/src/auth.controller.ts'
  line: 42
  title: '{short title}'
  detail: '{full description}'
  fix: '{suggested fix}'
  pattern_ref: 'apps/ref/auth.ts:15'
  dismiss_reason: null   # required if action=dismiss
  consensus: CONFIRMED | SINGLE_REVIEWER   # Meta 3a/3b only
```

Every finding MUST carry both `severity` and `action`. Missing either = schema violation (caught by VM-11).
