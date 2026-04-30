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

**As of 2026-04-28, this rule is MANDATORY for ALL bmad-\* workflows — no exceptions, no phases, no "overhead-sensitive" loophole.**

The earlier 3-phase migration plan (high-stakes first, daily workflows last) was deprecated after a documented incident: the "overhead-sensitive" classification of `bmad-quick-dev` was used as a rationalization to skip steps 02-06 of an actual workflow execution. Any classification that says "this workflow is allowed to be lighter" becomes the porte-de-sortie for ALL rationalisation patterns. Killed.

Every workflow MUST satisfy:

- Rule 1 — `CHK-{N}` checkpoints at every state transition
- Rule 2 — `CHK-INIT` Read Receipt at INITIALIZATION end
- Rule 3 — Anti-Skim phrasing at every step transition (the FULL phrase, not abbreviated variants)
- Rule 4 — `CHK-STEP-{NN}-ENTRY` and `CHK-STEP-{NN}-EXIT` at top and bottom of every step file
- Rule 5 — `<!-- CHK -->` comment markers around in-step checkpoints
- **Rule 6 (NEW)** — `## NO-SKIP CLAUSE` block at the top of every step file (see Section "NO-SKIP CLAUSE" below)
- **Rule 7 (NEW)** — `CHK-WORKFLOW-COMPLETE` Read Receipt at the end of the last step

The validator (`tools/validate-skills.js`) **enforces** these rules via the `HARD-01` through `HARD-08` rule family, severity HIGH, exit 1 in `--strict` mode. CI runs `--strict`. New skills cannot be added without satisfying these rules — `bmad-create-skill` templates are pre-hardened.

---

## Rationalization Patterns That Are FORBIDDEN

This is the closed list of arguments Claude MUST NOT use to skip a step. The list exists because each one of these has been observed in practice. **None is a valid skip reason.** The ONLY valid reason to skip a step is an explicit user instruction in the current conversation that names the specific step.

| ID | Pattern | Forme typique |
|----|---------|---------------|
| R-01 | Simplicité perçue | "tâche simple", "trivial", "one-liner" |
| R-02 | Type de fichier | "juste du .md", "que de la spec", "que de la config" |
| R-03 | Validators verts | "tests passent déjà", "lint clean", "CI green" |
| R-04 | Profil utilisateur | "user expert", "tu sais déjà", "senior dev" |
| R-05 | Compréhension auto-déclarée | "j'ai compris ce que ce step fait" |
| R-06 | Disproportion ressentie | "overkill pour ce cas", "lourdeur inutile" |
| R-07 | Conditionalité bidouillée | "ce step est pour tel mode" alors qu'il s'applique vraiment |
| R-08 | Substitution par autre | "j'ai fait l'équivalent ailleurs", "couvert par step-X" |
| R-09 | Pression efficacité | "auto mode actif", "user veut aller vite", "pas le temps" |
| R-10 | Implicite vs explicite | "fait implicitement via un autre tool call" |
| R-11 | Échappatoire de classification | "Phase 3 / overhead-sensitive donc moins exigeant" — **DEPRECATED**, was the incident trigger |
| R-12 | Compaction | "au step X je n'avais plus le contexte initial" |

**Rule of detection:** if you find yourself constructing any of these arguments, STOP. The argument IS the rationalization. Execute the step.

**Exception clause (sole valid skip path):**

> "User said in this conversation, verbatim: \"{quote}\", which explicitly requests skipping {step_NN_or_workflow_section}."

If you cannot quote the user verbatim with citation in conversation, the skip is forbidden. No exceptions.

---

## NO-SKIP CLAUSE — Mandatory Block at Top of Every Step File

Every step file (after the H1, optionally after frontmatter) MUST open with this exact block:

```markdown
## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.
```

The validator enforces this as `HARD-03`. Skills that omit this block cannot pass `npm run validate:skills --strict`.

---

## CHK-WORKFLOW-COMPLETE — Final Read Receipt

The last step file (or a dedicated section in `workflow.md`) MUST emit a workflow-level receipt enumerating every CHK-STEP-NN-EXIT emitted in the conversation:

```markdown
## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

\`\`\`
CHK-WORKFLOW-COMPLETE PASSED — workflow {name} executed end-to-end:
  steps_executed: [01, 02, ..., N]   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
\`\`\`

Si steps_executed != [01..N] sequentiel ET steps_skipped sans citation user verbatim => HALT.
```

The validator enforces this as `HARD-06`.

---

## Anti-Skim Canonical Phrasing — Every Transition

Every "Next:" line in any step file MUST follow this exact pattern (the FULL phrase — abbreviated variants like "Read fully and follow" are rejected by `HARD-08`):

```markdown
**Next:** Read FULLY and apply: `path/to/next-step.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
```

---

## Conditional Skip — CHK-STEP-NN-SKIPPED

For steps that are mode-specific by design (e.g. step-08 of `bmad-create-story` runs only in Discovery mode), the alternative mode emits an explicit skip receipt with citation of the workflow.md condition that justifies it:

```
CHK-STEP-08-SKIPPED — Enrichment mode bypasses review step per workflow.md table line 127 (mode column = "Discovery")
```

The skip is **never silent**. The condition is **always cited** with its source location.

---

## Examples (3-5 diverse, per Anthropic best practices)

### Example 1 — INITIALIZATION Read Receipt for bmad-troubleshoot

```markdown
### CHK-INIT — Initialization Read Receipt

CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: 5 core files (core/knowledge-loading.md, core/no-fallback-no-false-data.md, core/project-root-resolution.md, core/retrospective-step.md, core/workflow-adherence.md) + JIT-loaded subdirs per workflow type (spec/, lifecycle/ for troubleshoot)
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
- It does NOT apply to subagent contracts — those have their own anti-deviation contracts (see `bmad-shared/teams/spawn-protocol.md`, `bmad-shared/teams/task-contract-schema.md`)

---

## Cross-references

- `core/knowledge-loading.md` — what files MUST be loaded (source of truth for the read-receipt content)
- `core/no-fallback-no-false-data.md` — applies to data integrity; this rule applies to process integrity
- `validation/validation-protocol.md#proof-principles` — "code analysis is NEVER proof"; this rule applies the same idea to workflow execution: "claiming you read the workflow is not proof — emit the receipt"
- `spec/evidence-based-debugging.md` — companion rule for the troubleshoot workflow specifically (proof via reproduction)
