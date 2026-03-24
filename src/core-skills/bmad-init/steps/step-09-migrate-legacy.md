# Step 09 — Migrate Legacy Workflows

**Goal:** Systematically migrate every legacy workflow to a global skill, ensuring nothing is lost and the best of both worlds is preserved.

**When to run:** Only when project state is MIGRATION_IN_PROGRESS (legacy artifacts exist).

---

## CRITICAL RULES

- **NEVER fabricate judgments** ("rarely used", "trivial", "obsolete") without evidence. Default assumption: every workflow IS used.
- **NEVER conflate the 3 levels:**
  - **Global skill** = `~/.claude/skills/bmad-*` — autonomous, uses `workflow-context.md`, step-file architecture
  - **Upstream skill** = `_bmad/` — uses old `workflow.yaml`/`workflow.xml` engine, depends on `_bmad/bmm/config.yaml`
  - **Legacy project workflow** = `.claude/workflows/` + `.claude/commands/` — project-specific wrappers around `_bmad/`
- **A workflow is MIGRATED only if a global skill exists.** Upstream `_bmad/` skills do NOT count.
- **Posture is PROACTIVE:** every unmigrated workflow is a gap to fill, not an item to dismiss.

---

## 1. Build Complete Coverage Map

### 1a. Inventory ALL legacy workflows

List every workflow directory in `.claude/workflows/` that contains a `workflow.yaml` or `instructions.md`.

### 1b. Inventory ALL global skills

List every `bmad-*` directory in `~/.claude/skills/`.

### 1c. Build the mapping table

For EACH legacy workflow:
1. Read its `workflow.yaml` to get `name` and `description`
2. Check if a global `bmad-*` skill exists for this EXACT function
3. Classify:
   - **MIGRATED**: Global skill exists with its own `workflow.md` + step files
   - **NOT_MIGRATED**: No global skill. Must be analyzed and migrated.

Present the FULL table — no truncation, no "... etc":

```
Legacy workflow              | Global skill           | Status
-----------------------------|------------------------|---------------
dev-story                    | bmad-dev-story         | MIGRATED
code-review                  | bmad-code-review       | MIGRATED
sprint-planning              | (none)                 | NOT_MIGRATED
create-prd                   | (none)                 | NOT_MIGRATED
... (ALL workflows listed)
```

Report: `{N} MIGRATED / {M} total ({percentage}%)`

HALT and present to user before proceeding.

---

## 2. Deep Analysis of Each NOT_MIGRATED Workflow

For EACH NOT_MIGRATED workflow, perform ALL of the following:

### 2a. Read the full workflow

Read the legacy workflow's `instructions.md` (not just `workflow.yaml` headers). Understand:
- What it does step by step
- What inputs it needs (Linear issues? Documents? Codebase?)
- What outputs it produces (Linear documents? Issue updates? Local files?)
- What tracker interactions it performs (read/write issues, documents, cycles)
- What forge interactions it performs (MRs, branches)

### 2b. Check for upstream equivalent

Check if `_bmad/` has a corresponding skill/agent/task for this workflow:
- `_bmad/bmm/workflows/` — BMAD Method workflows
- `_bmad/bmm/agents/` — agent definitions that may cover the same function
- `_bmad/core/tasks/` — core tasks
- Available upstream skills in the skill list (e.g., `/create-prd`, `/sprint-planning`, etc.)

### 2c. Diff legacy vs upstream (if both exist)

If the legacy workflow AND an upstream equivalent both exist, **perform a real diff**:
1. Read the legacy `instructions.md` step by step
2. Read the upstream skill's instructions/task
3. Identify:
   - **Legacy-only content**: steps, checks, domain logic that the legacy added on top of upstream
   - **Upstream-only content**: improvements in upstream that the legacy doesn't have
   - **Shared content**: identical or near-identical logic

Present the diff per workflow:
```
{workflow_name} — DIFF:
  Legacy-only (project-specific additions):
    - {description of added step/check/logic}
    - {description}
  Upstream-only (improvements not in legacy):
    - {description}
  Verdict: {UPSTREAM_SUFFICIENT / LEGACY_HAS_VALUE / MERGE_NEEDED}
```

### 2d. Determine migration path

Based on the analysis, classify each workflow:

| Verdict | Meaning | Action |
|---------|---------|--------|
| UPSTREAM_SUFFICIENT | The upstream `_bmad/` skill already covers everything the legacy does. The legacy wrapper adds no value. | Safe to rely on upstream skill. Legacy command can be deleted after confirming upstream works. |
| LEGACY_HAS_VALUE | The legacy workflow contains project-specific logic (domain checks, custom steps, tool integrations) that the upstream doesn't have. | Extract the valuable additions → either add to workflow-knowledge/ or create a project-local skill in `.claude/skills/`. |
| MERGE_NEEDED | Both have unique value. Neither alone is complete. | Create a new global `bmad-*` skill that combines the best of both, OR enhance the upstream skill. |
| NO_UPSTREAM | No upstream equivalent exists at all. The legacy workflow is the only implementation. | Must be migrated to a global skill via `/bmad-create-skill`. |

Present findings per workflow:
```
{workflow_name}:
  What it does: {1-2 sentence summary from reading instructions.md}
  Tracker: {YES/NO — what it reads/writes}
  Forge: {YES/NO — what it reads/writes}
  Upstream equivalent: {skill name or NONE}
  Diff verdict: {UPSTREAM_SUFFICIENT / LEGACY_HAS_VALUE / MERGE_NEEDED / NO_UPSTREAM}
  Legacy-only value: {specific additions, or "none"}
  Migration path: {action to take}
```

---

## 3. Present Migration Plan

Group all NOT_MIGRATED workflows by verdict and present the full plan:

```
============================================================
  Legacy Migration Plan — {project_name}
============================================================

UPSTREAM_SUFFICIENT ({N} workflows):
  These can rely on the existing upstream _bmad/ skills.
  Legacy wrappers add no value and can be cleaned up.
  {list}

LEGACY_HAS_VALUE ({N} workflows):
  These have project-specific additions worth preserving.
  Additions will be extracted to workflow-knowledge/ or project-local skills.
  {list with what will be extracted}

MERGE_NEEDED ({N} workflows):
  Both legacy and upstream have unique value.
  Need to create enhanced global skills or update upstream.
  {list with merge strategy}

NO_UPSTREAM ({N} workflows):
  No equivalent exists anywhere. Must be created as new global skills.
  {list}
============================================================
```

HALT and wait for user approval of the plan.

---

## 4. Execute Migrations

For each workflow, execute the approved migration:

### For UPSTREAM_SUFFICIENT:
- Confirm the upstream skill works (invoke it in test/dry-run if possible)
- Mark the legacy command as safe to delete

### For LEGACY_HAS_VALUE:
- Extract the project-specific additions to the appropriate target:
  - Domain-specific checks → `.claude/workflow-knowledge/{relevant-file}.md`
  - Tool integrations → document in `workflow-context.md` or create a project-local skill
- Verify the extraction preserves all the value

### For MERGE_NEEDED:
- Propose the merge to the user
- If approved, use `/bmad-create-skill` or `/bmad-edit-skill` to create/update the global skill

### For NO_UPSTREAM:
- Use `/bmad-create-skill` to create a new global skill
- The legacy instructions.md serves as the primary input for the new skill design

---

## 5. Legacy Commands Cleanup

After migrations are complete:

### 5a. Classify all legacy commands

For each command in `.claude/commands/` referencing `workflow.xml` or `workflow.yaml`:
1. Identify which workflow it invokes
2. Determine if that workflow is now covered (by global skill OR upstream skill)
3. Classify as REDUNDANT or STILL_NEEDED

### 5b. Present cleanup list

```
REDUNDANT commands (safe to delete — {N}):
  {command_file} → replaced by {global_skill or upstream_skill}
  ...

STILL NEEDED commands (keep until migration — {N}):
  {command_file} → workflow not yet migrated
  ...
```

HALT and ask: **[D] Delete redundant commands / [K] Keep all / [Q] Quit**

If Delete: remove only REDUNDANT commands. Leave STILL_NEEDED.

---

## 6. Final Migration Status

```
============================================================
  Migration Status — {project_name}
============================================================

Before:
  Legacy workflows:    {N}
  Legacy commands:     {N}
  Global skills:       {N}
  Coverage:            {old_percentage}%

After:
  Legacy workflows:    {remaining} (kept: {list of STILL_NEEDED if any})
  Legacy commands:     {remaining}
  Global skills:       {N_new}
  Coverage:            {new_percentage}%

Next steps:
  {list any remaining work — NO_UPSTREAM skills to create, etc.}
============================================================
```

---

## CHECKPOINT

Ask: "Migration step complete. Any corrections needed?"

---

**Next:** The bmad-init workflow is complete.
