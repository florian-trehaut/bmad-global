# Auto-Flow Team Configuration — 5 phase-scoped teams (axe 5)

**This is the FIRST `team-workflows/team-config.md` implementation in BMAD using the team-per-phase architecture.** It serves as the reference for future orchestrator skills.

**Loaded by:** `step-04-team-create.md` (lifecycle guide), and EACH of `step-03-spec-phase.md`, `step-05-review-phase.md`, `step-06-dev-phase.md`, `step-07-code-review-phase.md`, `step-08-validation-phase.md` to build that phase's `TeamCreate` payload.

---

## Lifecycle convention (per axe 5 of `auto-flow-context-reduction`)

Each lifecycle phase instantiates its OWN team via `TeamCreate(name="{phase}-{RUN_ID}")` at phase start, runs `TaskCreate(s)` per the composition declared below, awaits `phase_complete` from each teammate, then `TeamDelete(name="{phase}-{RUN_ID}")` before transitioning. Each team respects `max_teammates ≤ 5` (per Anthropic Agent Teams §Best practices).

`RUN_ID` is set in step-01-entry as `{ISO-timestamp}-{slug}`. Team names follow the pattern `{phase}-{RUN_ID}` :

| Phase step | TeamCreate name |
|------------|-----------------|
| step-03 | `spec-{RUN_ID}` |
| step-05 | `review-{RUN_ID}` |
| step-06 | `dev-{RUN_ID}` |
| step-07 | `codereview-{RUN_ID}` |
| step-08 | `validation-{RUN_ID}` |

---

## Team for Phase 1 — Spec (step-03-spec-phase.md)

**Team name** : `spec-{RUN_ID}`
**Composition** : 5 teammates total (1 spec-investigator + 1 external-researcher + 3 spec-validators)
**Lifecycle** : TeamCreate at phase start → parallel TaskCreate(s) for delegated sub-tasks (real-data investigation, external research, multi-validator review) → await phase_complete from each → TeamDelete at phase end.

| Role | Count | Workflow_to_invoke | Reserve? | Read-only? | Persona |
|------|-------|---------------------|----------|------------|---------|
| `spec-investigator` | 1 | `~/.claude/skills/bmad-create-story/workflow.md` step 05 + 07 (full) OR `~/.claude/skills/bmad-quick-spec/workflow.md` step 02 (quick) — **fused task** for real-data + code investigation per Adv-4 race-condition mitigation | NO | YES | Real-data investigator + code archaeologist (mirrors bmad-create-story step-05/07 personas) |
| `external-researcher` | 1 | `~/.claude/skills/bmad-create-story/workflow.md` step 06 (full) OR step 02 (quick) — external research subset | NO | YES | Documentation / RFC / best-practices researcher (mirrors bmad-create-story step-06 persona) |
| `spec-validator-A` | 1 | `~/.claude/skills/bmad-create-story/workflow.md` step 12 (full) OR `~/.claude/skills/bmad-quick-spec/workflow.md` step 06 (quick) — multi-validator review | NO | YES | Adversarial spec validator (one of 3 in full profile, single in quick profile) |
| `spec-validator-B` | 1 | same as spec-validator-A — full profile only | NO | YES | Same persona, independent review pass |
| `spec-validator-C` | 1 | same as spec-validator-A — full profile only | NO | YES | Same persona, independent review pass |

In `quick` profile, only `spec-investigator + external-researcher + spec-validator-A` (3 teammates) are task-assigned — `spec-validator-B/C` are still part of TeamCreate but receive no TaskCreate.

**Fields (all roles)** :
- Knowledge files : per `knowledge_mapping.{role}` in workflow-context.md ; default project.md + domain.md for investigators/validators ; project.md for researcher
- Tracker writes : `false` (lead is sole tracker writer)
- Autonomy policy : `strict` (questions route to lead — lead has user)
- Trace path : `{TRACE_FOLDER}/{role}-{task_id}.md`
- Deliverable format : `yaml_report` with findings/summary

---

## Team for Phase 5 — Spec Review (step-05-review-phase.md)

**Team name** : `review-{RUN_ID}`
**Composition** : 1 teammate
**Lifecycle** : TeamCreate → 1 TaskCreate → await phase_complete → TeamDelete

| Role | Count | Workflow_to_invoke | Reserve? | Read-only? | Persona |
|------|-------|---------------------|----------|------------|---------|
| `spec-reviewer` | 1 | `~/.claude/skills/bmad-review-story/workflow.md` (full workflow — adversarial spec review) | NO | YES | Adversarial spec reviewer (mirrors `bmad-review-story` persona) |

**Fields** :
- Knowledge files : per `knowledge_mapping.spec-reviewer` (project.md, domain.md)
- Tracker writes : `false`
- Autonomy policy : `strict`
- Trace path : `{TRACE_FOLDER}/spec-reviewer-1.md`
- Deliverable : `yaml_report` with verdict APPROVE / FINDINGS

---

## Team for Phase 6 — Dev (step-06-dev-phase.md)

**Team name** : `dev-{RUN_ID}`
**Composition** : N=`agent_teams.dev_team_size` (default 1, clamped to `[1, max_teammates]`)
**Lifecycle** : TeamCreate → N TaskCreate(s) → await all phase_complete → TeamDelete

| Role | Count | Workflow_to_invoke | Reserve? | Read-only? | Persona |
|------|-------|---------------------|----------|------------|---------|
| `dev` | N | If `SPEC_PROFILE == 'quick'` → `~/.claude/skills/bmad-quick-dev/workflow.md` ; else (`SPEC_PROFILE == 'full'`) → `~/.claude/skills/bmad-dev-story/workflow.md` | NO | NO (writes code) | Developer (mirrors `bmad-dev-story` or `bmad-quick-dev` persona) |

**Fields** :
- Knowledge files : per `knowledge_mapping.dev` (project.md, api.md)
- Tracker writes : `false` (lead processes `tracker_write_request` SendMessage)
- **Autonomy policy : `spec-driven`** (BAC-2 / TAC-4) — dev teammate auto-acknowledges spec-verbatim decisions, auto-resolves TACTICAL items from spec patterns, HALTs on STRUCTURAL divergence per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §Autonomy policy enforcement`
- Trace path : `{TRACE_FOLDER}/dev-{i}.md`
- Deliverable : `yaml_report` with `commit_id`, `mr_url`, `test_results`, `trace_files`, `autonomy_decisions`

---

## Team for Phase 7 — Code Review (step-07-code-review-phase.md)

**Team name** : `codereview-{RUN_ID}`
**Composition** : 5 teammates total (3 always : specs/correctness/security ; 2 reserve : operations/user-facing — TaskCreate only on diff-scope trigger)
**Lifecycle** : TeamCreate (5 teammates) → 3+N triggered TaskCreate(s) → await all triggered phase_complete → TeamDelete (5 teammates total even if 2 reserve idle)

| Role | Count | Workflow_to_invoke | Reserve? | Read-only? | Activation predicate |
|------|-------|---------------------|----------|------------|---------------------|
| `code-reviewer-specs` | 1 | `~/.claude/skills/bmad-code-review-perspective-specs/workflow.md` | NO | YES | Always (Meta-1) |
| `code-reviewer-correctness` | 1 | `~/.claude/skills/bmad-code-review-perspective-correctness/workflow.md` | NO | YES | Always (Meta-2) |
| `code-reviewer-security` | 1 | `~/.claude/skills/bmad-code-review-perspective-security/workflow.md` | NO | YES | Always (Meta-3) |
| `code-reviewer-operations` | 1 | `~/.claude/skills/bmad-code-review-perspective-operations/workflow.md` | YES | YES | TaskCreate only if diff matches `(.github/workflows|Dockerfile|docker-compose|terraform|infra|deploy|ci|cd)` (Meta-5) |
| `code-reviewer-user-facing` | 1 | `~/.claude/skills/bmad-code-review-perspective-user-facing/workflow.md` | YES | YES | TaskCreate only if diff matches `(ui|frontend|web|app/|components|pages|views|public)` (Meta-6) |

**5 teammates ≤ max_teammates=5** (TAC-23). Reserve teammates without TaskCreate stay idle until TeamDelete (consume minimal tokens).

**NFR trade-off acknowledged** (per spec §Performance) : 5-teammate stable team upfront introduces ~30-40% Phase 7 token overhead on runs without ops/UI changes (2 idle reserve teammates). Trade-off accepted for the stability of the principle "team upfront stable per phase". Future opt-in possible via `lifecycle_artifacts.spawn_reserves: false` (out of scope this story).

**Fields (all roles)** :
- Knowledge files : per `knowledge_mapping.code-reviewer-{perspective}`
- Tracker writes : `false`
- Autonomy policy : `strict`
- Trace path : `{TRACE_FOLDER}/code-reviewer-{p}-1.md`
- Deliverable : `yaml_report` with verdict APPROVE / FINDINGS, findings tagged `meta: N`

---

## Team for Phase 8 — Validation (step-08-validation-phase.md)

**Team name** : `validation-{RUN_ID}`
**Composition** : 1 teammate
**Lifecycle** : TeamCreate → 1 TaskCreate → await phase_complete → TeamDelete

| Role | Count | Workflow_to_invoke | Reserve? | Read-only? | Persona |
|------|-------|---------------------|----------|------------|---------|
| `validator` | 1 | `~/.claude/skills/bmad-validation-metier/workflow.md` (default), `bmad-validation-frontend/workflow.md` if frontend type, `bmad-validation-desktop/workflow.md` if desktop type. Type detected from spec or asked at orchestrator step-08 | NO | YES | Exacting Product Owner (mirrors `bmad-validation-*` persona) |

**Fields** :
- Knowledge files : per `knowledge_mapping.validator`
- Tracker writes : `false`
- Autonomy policy : `strict`
- Trace path : `{TRACE_FOLDER}/validator-1.md`
- Deliverable : `yaml_report` with verdict PASS / FAIL, per-VM verdicts

---

## Team distribution

`teammate_mode: 'self-service'` (default — teammates claim tasks from the pool). Tasks are pre-tagged with the role, and only teammates with the matching role claim them.

If `teammate_mode: 'assigned'` is configured in workflow-context.md, the orchestrator assigns tasks at TaskCreate time using the task_id field as the binding key.

---

## Spawn template

Every teammate spawn prompt follows `~/.claude/skills/bmad-shared/teams/spawn-protocol.md` with these orchestrator-specific additions:

```yaml
task_contract:
  team_name: '{phase}-{RUN_ID}'             # Per-phase team name
  task_id: '{role}-{seq}'
  role: '{role-key from above}'

  workflow_to_invoke: '{absolute path}'      # REQUIRED per BAC-8 / TAC-24 — teammate executes this workflow integrally per teammate-mode-routing.md §Required Workflow Application

  scope_type: 'review' | 'investigation' | 'generation' | 'validation'
  scope_files: [...]
  scope_domain: '{phase-specific scope}'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'                # MUST be non-null (TAC-28)
      content: |
        {full spec content from step-03}
    # Plus phase-specific artifacts (diff, document, etc.)

  deliverable:
    format: 'yaml_report'
    send_to: '{LEAD_NAME}'                    # the orchestrator's lead identifier

  constraints:
    read_only: {true|false per role above}
    worktree_path: '{WORKTREE_PATH}'          # single shared, set in step-02
    tracker_writes: false                     # ALWAYS false for orchestrator-spawned tasks
    autonomy_policy: '{strict|spec-driven per role above}'   # NEW per axe 2 / TAC-4
    trace_path: '{TRACE_FOLDER}/{role}-{task_id}.md'         # NEW per axe 4 / TAC-13
    halt_conditions: [...]

  metadata:
    orchestrator_invoked: true                # D16 override flag
    orchestrator_skill: 'bmad-auto-flow'      # validated against orchestrator-registry.md
    parent_phase: '{spec|review|dev|code-review|validation}'
```

---

## Consensus rules

| Phase | Consensus rule |
|-------|----------------|
| spec | Lead aggregates findings from spec-validators + integrates investigator + researcher summaries — lead is the final composer of the spec body |
| review | Single teammate — verdict is its own |
| dev | Single teammate (default 1) — verdict is its own. If `dev_team_size > 1`, the orchestrator coordinates merge of independent dev work (advanced — currently OOS for v1.0) |
| code-review | Aggregate findings from triggered teammates (3+N reserve). Per workflow-adherence Rule 8 (Findings Handling Policy) : all findings fixed by default regardless of severity, unless documented skip reason applies. Overall verdict = APPROVE if 0 findings remaining, else FINDINGS. |
| validation | Single teammate — verdict is its own |

---

## Fallback configuration

```yaml
fallback:
  mode: 'sequential-inline'   # When TEAM_MODE=false (BAC-9, TAC-12)
  startup_banner: |
    ⚠️  TEAM_MODE=false — running phases sequentially inline in this lead's context.
    Phases 1-5 (spec, review, dev, code-review, validation) will execute one after another in YOUR session, not in isolated teammates.
    Question routing is direct (no batching). Tracker writes are direct (no SendMessage).
    To enable team mode: set `agent_teams.enabled: true` in workflow-context.md and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1.
```

When TEAM_MODE=false, no TeamCreate/TeamDelete calls happen ; each phase step's logic runs inline in the orchestrator's context. The team-per-phase architecture is the TEAM_MODE=true happy path.

---

## Cross-references

- `~/.claude/skills/bmad-shared/teams/orchestrator-registry.md` — registry where `bmad-auto-flow` is the only authorized orchestrator
- `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` — teammate-side detection, autonomy policy enforcement, trace work to disk
- `~/.claude/skills/bmad-shared/teams/task-contract-schema.md` — task contract schema with `autonomy_policy`, `trace_path`, `workflow_to_invoke` fields
- `~/.claude/skills/bmad-shared/teams/agent-teams-config-schema.md` — `agent_teams` configuration schema with `lifecycle_artifacts` block
- `~/.claude/skills/bmad-shared/teams/spawn-protocol.md` — spawn prompt template with trace + autonomy enforcement
- `data/question-routing.md` — orchestrator-side question batching protocol
- `templates/team-config-template.md` — empty template for future orchestrator skills to mimic this pattern
- `_bmad-output/planning-artifacts/spec-agent-teams-integration.md` Amendment 2026-04-30 — architectural decisions A1-A4 documented
