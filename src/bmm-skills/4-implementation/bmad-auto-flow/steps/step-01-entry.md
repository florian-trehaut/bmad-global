---
nextStepFile: './step-02-worktree-setup.md'
---

# Step 1: Entry — Greet, Gather Feature, Choose Spec Profile, Banner

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-INIT emis dans la conversation
- [ ] Variables en scope: TEAM_MODE, MAX_TEAMMATES, dev_team_size, code_review_team_size, USER_NAME, COMMUNICATION_LANGUAGE
- [ ] Working state: orchestrator at lead's main session

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Entry with TEAM_MODE={value}, dev_team_size={N}, code_review_team_size={N}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Greet the user in `{COMMUNICATION_LANGUAGE}`, gather the feature description, choose the spec profile (quick / full), display the startup banner including the inherited permission mode (TAC-29 / BAC-14), and warn if `TEAM_MODE=false` (BAC-9).

## MANDATORY SEQUENCE

### 1. Display startup banner

Display:

```
{COMMUNICATION_LANGUAGE}-greeting:
Bonjour {USER_NAME} — auto-flow orchestrator (BMAD lifecycle complete: spec → review → dev → code-review → validation).

Permission mode inherited by all teammates: {permission_mode}
{If TEAM_MODE=false:}
⚠️  TEAM_MODE=false — running phases sequentially inline in this session (no Agent Teams).
   Phases 2-5 will execute in YOUR context, not in isolated teammates. Question routing is direct (no batching). To enable team mode: set `agent_teams.enabled: true` in workflow-context.md and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1.
{End if}
```

The permission_mode value is read from the current Claude Code session (look for the system reminder `Auto Mode Active`, `Plan Mode`, or default mode).

The banner is the operational form of TAC-29 — it MUST appear before any TeamCreate call.

### 2. Gather feature description

Call AskUserQuestion (orchestrator's only direct user-touch points are this step and step-09; teammates' questions get batched per `data/question-routing.md`):

```
"Décris la fonctionnalité que tu veux livrer en 2-3 phrases : quel problème, pour qui, quel résultat attendu."
```

Store as `FEATURE_DESCRIPTION`.

### 3. Choose spec profile

Call AskUserQuestion:

```
Profil spec :
[Q] Quick — bmad-quick-spec (6 steps, condensé, scope interne, pas d'investigation real-data ; bon pour petites évolutions)
[F] Full — bmad-create-story (14 steps, investigation rigoureuse real-data + recherche externe ; bon pour features impactantes ou avec dépendances externes)
```

Store as `SPEC_PROFILE = 'quick' | 'full'`. Per BAC-13, this choice determines which dev workflow is invoked at step-06.

### 4. Slug derivation

`SLUG` = sanitized kebab-case of FEATURE_DESCRIPTION first 4-6 words (max 30 chars). **Explicit sanitization regex (security-critical — used in mkdir -p, audit log JSON, trace_path)** :

```bash
SLUG=$(echo "${FEATURE_DESCRIPTION}" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9 ]//g' \
  | awk '{ for(i=1; i<=NF && i<=6; i++) printf "%s%s", $i, (i<NF && i<6 ? "-" : ""); print "" }' \
  | cut -c 1-30 \
  | sed 's/-$//')
```

Drop everything outside `[a-z0-9-]`. Le regex est canonical source of truth — pas de "kebab-case" informel (security finding F-M3-S1-002 mitigation).

### 5. RUN_ID derivation + trace folder creation (axe 4)

```bash
RUN_ID="$(date +%Y-%m-%dT%H-%M-%S)-${SLUG}"
PROJECT_SLUG=$(echo "{PROJECT_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
TRACE_FOLDER="/tmp/bmad-${PROJECT_SLUG}-auto-flow/${RUN_ID}"

# Security hardening (F-M3-S1-003 mitigation) : umask 077 + explicit perms 0700 + symlink check
umask 077
mkdir -p -m 0700 "${TRACE_FOLDER}"

# HALT if any ancestor is a symlink (multi-user /tmp symlink-race / privesc protection)
for path_component in "/tmp/bmad-${PROJECT_SLUG}-auto-flow" "${TRACE_FOLDER}"; do
  if [ -L "${path_component}" ]; then
    echo "ERROR: trace folder ancestor is a symlink: ${path_component} — refusing (security per F-M3-S1-003)" >&2
    exit 1
  fi
done
```

**HALT explicit** if `mkdir -p` fails (permission denied, disk full, etc.) OR if any ancestor is a symlink — emit error citing the path and the underlying cause ; never silently fall back to a different path (no-fallback-no-false-data.md).

The folder hosts trace files written by every spawned teammate per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §Trace work to disk`. Each spawn contract receives `task_contract.constraints.trace_path: ${TRACE_FOLDER}/{role}-{task_id}.md` (TAC-13).

Store `RUN_ID`, `PROJECT_SLUG`, `TRACE_FOLDER` for use in steps 03/05/06/07/08/09.

### 6. Audit log (if enabled)

If `agent_teams.audit_log_enabled == true` (T-SEC-1):

```bash
mkdir -p "{MAIN_PROJECT_ROOT}/_bmad-output/auto-flow/"
LOG_FILE="{MAIN_PROJECT_ROOT}/_bmad-output/auto-flow/${RUN_ID}.log"

# Structured JSON log entries (T-OBS-1) — use jq for safe JSON construction (avoids quote-injection per F-M3-S1-008)
jq -nc --arg run_id "${RUN_ID}" --arg project_slug "${PROJECT_SLUG}" --arg feature_slug "${SLUG}" --arg spec_profile "{SPEC_PROFILE}" --argjson team_mode "{TEAM_MODE}" --arg autonomy_policy_default "strict" \
  '{event:"auto-flow.run.started", run_id:$run_id, project_slug:$project_slug, feature_slug:$feature_slug, spec_profile:$spec_profile, team_mode:$team_mode, autonomy_policy_default:$autonomy_policy_default}' \
  >> "${LOG_FILE}"

jq -nc --arg run_id "${RUN_ID}" --arg skill_name "ci-watch" --arg path_resolved "${CI_WATCH_SKILL_PATH:-null}" \
  '{event:"auto-flow.skill_discovery", run_id:$run_id, skill_name:$skill_name, path_resolved:$path_resolved}' \
  >> "${LOG_FILE}"

jq -nc --arg run_id "${RUN_ID}" --arg skill_name "deploy-watch" --arg path_resolved "${DEPLOY_WATCH_SKILL_PATH:-null}" \
  '{event:"auto-flow.skill_discovery", run_id:$run_id, skill_name:$skill_name, path_resolved:$path_resolved}' \
  >> "${LOG_FILE}"
```

LOG_FILE et toutes les variables shell sont quotées (F-M3-S1-004 mitigation : portability + injection prevention sur paths avec spaces).

### 7. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: banner displayed (TAC-29 satisfied), FEATURE_DESCRIPTION + SPEC_PROFILE captured, audit log initialized if enabled
- **FAILURE**: skipping the banner, accepting one-word descriptions, omitting the permission_mode line

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Entry
  actions_executed: displayed banner with permission_mode={mode}, gathered FEATURE_DESCRIPTION ({N} chars), chose SPEC_PROFILE={profile}, derived SLUG={slug}, set RUN_ID={run_id}, created TRACE_FOLDER={trace_folder}, audit log {initialized | skipped}
  artifacts_produced: FEATURE_DESCRIPTION, SPEC_PROFILE, SLUG, RUN_ID, PROJECT_SLUG, TRACE_FOLDER, LOG_FILE (if audit_log_enabled)
  next_step: ./steps/step-02-worktree-setup.md
```

**Next:** Read FULLY and apply: `./steps/step-02-worktree-setup.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
