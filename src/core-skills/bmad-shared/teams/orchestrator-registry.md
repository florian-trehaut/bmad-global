# Orchestrator Registry — Shared Definition

**Loaded by:** `teammate-mode-routing.md` during INITIALIZATION when `task_contract.metadata.orchestrator_invoked == true` is detected. Defines the closed list of skills authorized to set the `orchestrator_invoked` flag and override Decision D16 of `spec-agent-teams-integration.md` (which otherwise forbids teammates from executing top-level BMAD workflows).

---

## Purpose

Decision D16 of the Agent Teams integration spec forbids teammates from triggering top-level BMAD workflows themselves — only the lead orchestrates. The amendment (`spec-agent-teams-integration.md` §8.1) authorizes a narrow exception: orchestrator skills (initially `bmad-auto-flow`) MAY spawn teammates that execute top-level workflows.

This registry is the **closed list** of skills authorized to make that exception. A spawn prompt that sets `metadata.orchestrator_invoked: true` AND `metadata.orchestrator_skill: '<name>'` MUST have `<name>` listed here, otherwise the teammate's INITIALIZATION HALTs (per TAC-30 of story `auto-flow-orchestrator`).

The registry is the enforcement point that prevents rogue or experimental skills from bypassing D16.

---

## Authorized Orchestrator Skills

| Skill name | Path | Approved on | Purpose |
|------------|------|-------------|---------|
| `bmad-auto-flow` | `src/bmm-skills/4-implementation/bmad-auto-flow/` | 2026-04-29 | Cross-workflow lifecycle orchestrator (spec → review → dev → code-review → validation) |

Any skill not in this table is **NOT** authorized to set `metadata.orchestrator_invoked: true`. Teammates spawned by such skills MUST refuse to execute and HALT.

---

## Validation Rule

When a teammate's INITIALIZATION (via `teammate-mode-routing.md`) detects `task_contract.metadata.orchestrator_invoked == true`:

1. Read `task_contract.metadata.orchestrator_skill` — if absent or empty → HALT with the message in §"HALT messages" below.
2. Look up the value in this registry — if not present → HALT.
3. If present → proceed to the rest of `teammate-mode-routing.md` initialization.

The check is name-based, exact match, case-sensitive. No wildcards, no version ranges.

### HALT messages

**Missing `orchestrator_skill`:**

```
HALT — INITIALIZATION teammate-mode-routing
  reason: task_contract.metadata.orchestrator_invoked is true but metadata.orchestrator_skill is missing or empty
  action: the spawning skill MUST set metadata.orchestrator_skill to its own skill name (e.g., 'bmad-auto-flow')
  reference: src/core-skills/bmad-shared/teams/orchestrator-registry.md
```

**Skill not in registry:**

```
HALT — INITIALIZATION teammate-mode-routing
  reason: metadata.orchestrator_skill='{value}' is not in the orchestrator registry
  action: only registered orchestrator skills may set metadata.orchestrator_invoked=true; this prevents non-orchestrator skills from bypassing Decision D16 of spec-agent-teams-integration.md
  registry_path: src/core-skills/bmad-shared/teams/orchestrator-registry.md
  current_authorized_list: [bmad-auto-flow]
```

---

## How to Add a New Orchestrator Skill

Adding a skill to this registry is an architectural decision that authorizes it to override Decision D16. Process:

1. Open a PR amending this file's "Authorized Orchestrator Skills" table.
2. The PR description MUST include:
   - The skill name and path
   - The orchestrator's purpose (which workflows it composes, why a regular composition pattern is insufficient)
   - The phases it manages and how teammate spawn maps to those phases
   - A reference to the new orchestrator's `team-workflows/team-config.md`
3. The PR MUST be reviewed by a maintainer with `bmad-code-review` perspective coverage on `specs-compliance` and `engineering-quality`.
4. On merge, the registry table is updated. From that point, the new skill is authorized.

**Removal** of a skill follows the same process — a PR removing the row, with rationale (skill deprecated, replaced, etc.).

---

## Why This Is a Separate File

Embedding the authorized list inside `teammate-mode-routing.md` would couple the policy enforcement (the routing rule) with the policy data (who is authorized). Keeping them separate means:

- Adding a new orchestrator skill is a one-line registry change, not a rule change.
- The registry can be audited independently (`grep` for the file path in PR diffs).
- The teammate-mode-routing rule's logic stays stable while the authorized set evolves.

---

## Cross-References

- `src/core-skills/bmad-shared/teams/teammate-mode-routing.md` — the consumer that validates against this registry
- `_bmad-output/planning-artifacts/spec-agent-teams-integration.md` §8.1 Amendments — the architectural authorization for the exception
- `src/core-skills/bmad-shared/teams/task-contract-schema.md` — defines the `metadata.orchestrator_invoked` and `metadata.orchestrator_skill` fields
- `src/bmm-skills/4-implementation/bmad-auto-flow/` — the first (and currently only) registered orchestrator
