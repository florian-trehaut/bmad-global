# Workflow Adherence Protocol

**This document is loaded by all bmad-\* workflow skills at initialization.** It defines mandatory mechanisms that prevent the workflow-skipping failure mode reliably observed in Claude Code, where a workflow is invoked but its instructions are condensed, summarized, or partially read instead of being executed step by step.

**Companion to:** `knowledge-loading.md` (file-loading enforcement) and `no-fallback-no-false-data.md` (data integrity enforcement). This rule covers **process integrity**.

---

## Why this exists

Community evidence (verifiable):

| Source | Observation |
|--------|-------------|
| [anthropics/claude-code#36997](https://github.com/anthropics/claude-code/issues/36997) | "Claude Code ignores memory/CLAUDE.md instructions for mandatory post-change steps (version bump + tag) — completely skipping the steps documented in both CLAUDE.md and memory" |
| [anthropics/claude-code#20024](https://github.com/anthropics/claude-code/issues/20024) | "Claude consistently skips mandatory workflow steps despite explicit 'EVERY time' and 'CANNOT' instructions. Even after being corrected multiple times in the same session, Claude rationalizes skipping gates with 'this is simple enough'." Closed as duplicate, **no documented mitigation**. |
| [anthropics/claude-code#32290](https://github.com/anthropics/claude-code/issues/32290) | "Claude reads files but ignores actionable instructions contained in them. Reading and extracting actionable items appear to be weakly coupled." |
| [anthropics/claude-code#18454](https://github.com/anthropics/claude-code/issues/18454) | "Claude Code ignores CLAUDE.md and Skills files during multi-step tasks" |
| [bmad-code-org/BMAD-METHOD#387](https://github.com/bmad-code-org/BMAD-METHOD/issues/387) | "Claude Code is not following the dev agent's critical instructions and does not load coding-standards or tech-stack documents". Resolved with the `MANDATORY-CHECKPOINT` pattern. |
| [HumanLayer blog 2026](https://www.humanlayer.dev/blog/stop-claude-from-ignoring-your-claude-md) | "Claude judges relevance and may skip rules it deems unrelated to the current task" |
| Hacker News thread #46102048 | "CLAUDE.md instructions get followed about 70% of the time" — community estimate |

**Root cause** (verbatim from #20024 maintainer-acknowledged comment):

> The model's default behavior pattern prioritizes action over verification. Workflow gates require an interrupt/check before the action instinct, but this interrupt isn't happening reliably regardless of instruction strength.

Instruction strength alone (CAPS, "EVERY time", "CANNOT", "MUST") is **insufficient**. The community has converged on three mechanisms that work in pure markdown (without hooks or external scaffolding):

1. **CHK-{N} checkpoints** — explicit named checkpoints that Claude must echo back as proof of execution
2. **Read receipts** — short structured outputs that prove specific files were loaded
3. **Anti-skim step entry markers** — directives that force full-file reads, not skims

This rule operationalizes these mechanisms.

---

## Rule 1 — `CHK-{N}` Mandatory Checkpoint Pattern

When a workflow has a high-stakes verification point (initialization complete, all required files loaded, step transition with state to preserve), the workflow MUST declare a **named checkpoint** using this format:

```markdown
### CHK-{N} — {Short Name}

Before proceeding, confirm by emitting EXACTLY this line:

```
CHK-{N} PASSED — {short_name}: {one-line summary of what was verified}
```

If you cannot emit this line truthfully, HALT and report which precondition failed.
```

**Why the literal echo:** The user (and any reviewer reading the conversation) gets immediate proof the checkpoint executed. Skipping the checkpoint is observable: no `CHK-{N} PASSED` line means the workflow drifted.

**Required checkpoint locations:**

| Location | Checkpoint | Verifies |
|----------|------------|----------|
| End of INITIALIZATION | `CHK-INIT` | Shared rules + project knowledge + worktree state all loaded |
| Before each step file load | `CHK-STEP-{N-ENTRY}` | Required variables from prior step are set |
| After any HALT-eligible decision | `CHK-{name}` | The decision was actually made by Claude with evidence, not bypassed |

**Naming:** Checkpoint identifiers are stable strings — never numbered globally, always scoped. `CHK-INIT`, `CHK-STEP-03-ENTRY`, `CHK-WORKTREE-CLEAN` are all valid.

---

## Rule 2 — Read Receipt at INITIALIZATION

Every bmad-\* workflow's INITIALIZATION section MUST end with a Read Receipt that lists every file actually loaded. This is the operational form of `CHK-INIT`.

**Template:**

```markdown
### CHK-INIT — Initialization Read Receipt

Emit EXACTLY this block (filling in actual values you read), then proceed to the first step. If any line cannot be filled truthfully, HALT.

```
CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: {N} files (list filenames, e.g. knowledge-loading.md, no-fallback-no-false-data.md, ...)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md ({"loaded" | "not required" | "required-but-missing"})
    - api.md ({"loaded" | "not required" | "required-but-missing"})
  worktree_path: {WORKTREE_PATH or "n/a"}
  team_mode: {true | false}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```
```

**Why this works** (per BMAD#387 community resolution): forcing Claude to enumerate the loaded files makes "I forgot to read X" detectable in real-time. The user sees the receipt and can correct before any step runs.

**Forbidden:** abbreviating the receipt ("All files loaded ✓"), skipping fields, or filling with placeholders. Each value must reflect what was actually read in the conversation.

---

## Rule 3 — Anti-Skim Step Transition

When a workflow.md or step file points to the next step, the directive MUST say "Read FULLY and follow" (not just "Next: step-XX").

**Forbidden** (allows skim):

```markdown
Next: step-03-investigate.md
```

**Required** (forces full read):

```markdown
**Next:** Read FULLY and apply: `./steps/step-03-investigate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
```

The phrase "do not summarise from memory, do not skip sections" is mandatory because Claude's default optimization is to skip re-reads when it has the file's "gist" in context. The directive blocks that optimization.

---

## Rule 4 — Step File Entry Check

Each step file SHOULD open with a "STEP ENTRY" mini-section listing prerequisites. This makes Claude verify state before executing the step body.

**Template at top of any step file:**

```markdown
## STEP ENTRY (CHK-STEP-{NN}-ENTRY)

Before executing this step, confirm:

- [ ] Previous step completed (CHK-STEP-{NN-1}-EXIT emitted, OR this is step 01)
- [ ] Variables in scope: `{var1}`, `{var2}`, `{var3}` (HALT if any are unset)
- [ ] Working directory: `{expected_path}` (or document that `pwd` differs and why)

Emit:

```
CHK-STEP-{NN}-ENTRY PASSED — entering {step name} with vars {var1}={value}, ...
```
```

This is HEAVIER than other rules. Apply only to steps where state-loss is high-risk:

| Apply to | Rationale |
|----------|-----------|
| Steps that depend on a prior step's output (e.g., `WORKTREE_PATH`, `BASELINE_COMMIT`, `ISSUE_ID`) | Forgetting the input = silent drift |
| Steps that perform writes or pushes | A skipped precondition becomes a destructive action |
| Steps that spawn subagents with task contracts | The contract requires inputs that must exist |

DO NOT apply to short, stateless steps (e.g., a step that only formats output). The protocol overhead is not worth it.

---

## Rule 5 — Section Anchors Use the `<!-- CHK -->` Comment

When a workflow's step contains an in-step checkpoint that is NOT a step boundary, surround it with the comment markers:

```markdown
<!-- CHK-NAME -->
{checkpoint instructions and required echo line}
<!-- /CHK-NAME -->
```

This is purely for grep/audit purposes — `grep -rE "<!-- /?CHK-" src/` lists every checkpoint in the codebase. The validator may later enforce coverage rules using these anchors.

---

## Application Strategy

This rule is **opt-in per workflow during migration** (additive, no breakage):

1. **Phase 1 — High-stakes workflows first:** `bmad-troubleshoot`, `bmad-dev-story`, `bmad-code-review`, `bmad-review-story`. Apply Rule 2 (Read Receipt) and Rule 3 (Anti-Skim) at minimum.
2. **Phase 2 — Validation workflows:** `bmad-validation-*`. Apply Rules 2 and 3.
3. **Phase 3 — Quick / Daily workflows:** Apply Rule 2 only (overhead-sensitive).

A workflow that has not yet adopted the pattern continues to function — this rule **does not break** existing workflows. It defines the target pattern.

The validator (`tools/validate-skills.js`) MAY add an inference-only rule (severity: INFO) that warns when a high-stakes workflow lacks `CHK-INIT`. This is a future enhancement, not enforced today.

---

## Examples (3-5 diverse, per Anthropic best practices)

### Example 1 — INITIALIZATION Read Receipt for bmad-troubleshoot

```markdown
### CHK-INIT — Initialization Read Receipt

CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: 17 files (knowledge-loading.md, no-fallback-no-false-data.md, project-root-resolution.md, retrospective-step.md, spawn-protocol.md, task-contract-schema.md, team-router.md, validation-intake-protocol.md, validation-proof-principles.md, validation-verdict-protocol.md, worktree-lifecycle.md, knowledge-schema.md, agent-teams-config-schema.md, daily-planning-awareness.md, evidence-based-debugging.md, workflow-adherence.md, SKILL.md)
  project_context: /Users/florian/projects/myapp/.claude/workflow-context.md (schema_version: 1.0)
  project_knowledge:
    - project.md (schema_version: 1.0)
    - domain.md (loaded)
    - api.md (loaded)
  worktree_path: /Users/florian/projects/myapp-troubleshoot-2026-04-28
  team_mode: false
  user_name: Florian TREHAUT
  communication_language: Français
```

### Example 2 — Step entry check skipped (correctly) for a stateless step

```markdown
# step-04-format-summary.md

## STEP GOAL

Format the diagnosis summary for display. Pure output formatting — no state mutation.

## SEQUENCE

1. Read `DIAGNOSIS` from prior step state.
2. Apply template `../templates/diagnosis-summary.md`.
3. Display to user.

## CHK-STEP-04-EXIT

Emit:

```
CHK-STEP-04-EXIT PASSED — formatted summary, length {N} lines
```
```

(No `CHK-STEP-04-ENTRY` because there is no critical state to verify.)

### Example 3 — Anti-Skim step transition

```markdown
**Next:** Read FULLY and apply: `./steps/step-08-verify.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
```

### Example 4 — In-step checkpoint with comment markers

```markdown
### 3. Push and create MR

Run quality gate.

<!-- CHK-QUALITY-GATE -->
After the quality gate command exits, emit:

```
CHK-QUALITY-GATE PASSED — exit_code=0, lint=clean, format=clean, tests=passed (N tests, M ms)
```

If exit_code != 0: HALT, report failures, do not proceed.
<!-- /CHK-QUALITY-GATE -->

git push origin HEAD
```

### Example 5 — High-stakes step that requires entry check

```markdown
# step-13-push.md

## STEP ENTRY (CHK-STEP-13-ENTRY)

Before executing this step, confirm:

- [ ] CHK-STEP-12-EXIT was emitted (traceability complete)
- [ ] Variables in scope: `WORKTREE_PATH`, `BASELINE_COMMIT`, `STORY_PATH`, `MR_TITLE` (HALT if any are unset)
- [ ] Quality gate has passed (CHK-QUALITY-GATE was emitted in step-12)

Emit:

```
CHK-STEP-13-ENTRY PASSED — entering push with WORKTREE_PATH={path}, BASELINE_COMMIT={sha}, MR_TITLE={title}
```

Then proceed to the SEQUENCE below.
```

---

## What this rule does NOT do

- It does NOT replace HALT directives — HALTs remain the primary stop mechanism
- It does NOT enforce execution mechanically — that requires hooks (out of scope for skill markdown)
- It does NOT solve every adherence issue — it raises the floor from "I think Claude read it" to "Claude emitted a receipt confirming it"
- It does NOT apply to subagent contracts — those have their own anti-deviation contracts (see `bmad-shared/spawn-protocol.md`, `bmad-shared/task-contract-schema.md`)

---

## Cross-references

- `knowledge-loading.md` — what files MUST be loaded (source of truth for the read-receipt content)
- `no-fallback-no-false-data.md` — applies to data integrity; this rule applies to process integrity
- `validation-proof-principles.md` — "code analysis is NEVER proof"; this rule applies the same idea to workflow execution: "claiming you read the workflow is not proof — emit the receipt"
- `evidence-based-debugging.md` — companion rule for the troubleshoot workflow specifically (proof via reproduction)
