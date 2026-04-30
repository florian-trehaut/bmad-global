# Step 2b: Evidence Pass (lightweight Phase B for both modes)

**Goal:** Lightweight evidence pass before implementation. Surface Real-Data Findings + External Research from the v2 spec (Mode A) OR conduct a light investigation if user instructions touch a provider / DB / cloud (Mode B). Warn-only — no HALT — to keep quick-dev rapid.

This step exists to align quick-dev on the **story-spec v2 (monolithic) or v3 (bifurcation) schema** without imposing the full create-story Phase B rigor. For full investigation discipline (HALT on missing access, full provider data sampling, version-specific external research), escalate to `/bmad-create-story`.

---

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "quick mode = pas d'evidence", "scope interne donc skip".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02B-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-01-EXIT emis si Mode A, OU CHK-STEP-02-EXIT emis si Mode B)
- [ ] `{execution_mode}` defined (tech-spec | direct)
- [ ] If Mode A : `{tech_spec_path}` exists
- [ ] If Mode B : plan from step-02 in scope

Emettre EXACTEMENT:

```
CHK-STEP-02B-ENTRY PASSED — entering Step 2b: Evidence Pass with {execution_mode=..., tech_spec_path=..., scope_summary=...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## EXECUTION SEQUENCE

### Mode A — Tech-Spec (read evidence already in spec)

Read the spec at `{tech_spec_path}`. Extract:

- **Real-Data Findings section** — present? terse N/A justified? substantive?
- **External Research section** — present? terse N/A justified? substantive?
- **NFR Registry** — 7 categories addressed?
- **Security Gate** — binary verdict declared?
- **Observability Requirements** — declared?

Quality verdict per section:

| Status | Action |
| ------ | ------ |
| Present + substantive | Log "OK", display 1-line summary |
| Present + terse N/A justified (1-line reason) | Log "N/A accepted" |
| Present but empty / shallow (< 30 chars body) | **WARN** — display: "{section} is shallow. Quick profile allows N/A but requires 1-line justification. Consider escalating to /bmad-create-story for full Phase B." |
| Missing (mandatory section absent) | **WARN** — same message |

Surface findings as a short summary table to the user. Do NOT halt. The implementation in step-03 proceeds; the user is informed of spec gaps.

### Mode B — Direct Instructions (light investigation)

Examine the user's direct instructions for evidence triggers:

| Trigger | If detected, do |
| ------- | --------------- |
| Mentions a provider system (SFTP, FTP, partner API, vendor SDK) | Suggest invoking the project's provider access skill (referenced in workflow-knowledge); OR explicitly note "evidence from provider not gathered — implementation will proceed on assumption" |
| Mentions a DB table / column / migration | Suggest a quick `SELECT 1` against staging via the project's DB skill, OR note "DB evidence not gathered" |
| Mentions a deployed service or cloud platform | Suggest a quick log scan via cloud CLI/MCP, OR note "cloud evidence not gathered" |
| Mentions an external library upgrade or new dependency | Suggest a quick docs/changelog check via WebSearch / Context7; OR note "external research not done" |
| Pure internal refactor (no providers, DB, cloud, new deps) | Note "N/A — pure internal scope" and proceed |

For each trigger detected, branch on TEAMMATE_MODE + autonomy_policy:

**TEAMMATE_MODE=true AND autonomy_policy=spec-driven** (TACTICAL — default to spec-declared evidence) :
- The spec already declared the evidence approach in Real-Data Findings + External Research sections (loaded in step-02). Auto-apply the spec's declared evidence path.
- Skip extra investigation trigger — capture in `AUTONOMY_DECISIONS[]` : `{decision: 'evidence-trigger-tactical', classification: 'tactical', default_applied: 'use spec-declared evidence', rationale: 'TAC-5b — spec Real-Data Findings is the authority'}`.

**Else (TEAMMATE_MODE=false standalone, or autonomy_policy=strict)** — ASK the user:

> Detected: {trigger}. Quick-dev evidence pass options:
> [V] **Verify** — pause and gather real data / docs now (~minutes)
> [A] **Acknowledge & proceed** — implementation proceeds, risk is accepted (logged in spec change log)
> [E] **Escalate** — switch to `/bmad-create-story` for full Phase B rigor

WAIT for user choice per trigger.

If user chooses [A], log the acknowledgement in the wip file (`{wipFile}`) under "Spec Change Log" with timestamp. This becomes evidence for code-review meta-1c (Decision Documentation) later.

If user chooses [E], EXIT quick-dev and direct the user to `/bmad-create-story`.

If no triggers match, log "No evidence triggers detected" and proceed.

### Common — Surface evidence summary

Append to `{wipFile}`:

```markdown
## Quick-dev Evidence Pass (Step 2b)

Mode: {tech-spec | direct}
Triggers detected: {list, or "none"}

{For Mode A}: Spec Phase B quality summary
- Real-Data Findings: {OK | N/A | shallow}
- External Research: {OK | N/A | shallow}
- NFR Registry: {n_present}/7
- Security Gate: {PASS | FAIL | N/A}
- Observability: {covered | partial | absent}

{For Mode B}: Investigation choices
- {trigger} → user chose {V/A/E}: {1-line outcome}

Warnings: {N} (informational, no HALT)
```

### Proceed

Load and execute `step-03-execute.md`.

---

## STEP EXIT (CHK-STEP-02B-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02B-EXIT PASSED — completed Step 2b: Evidence Pass
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {entry in wipFile; warnings count; user choices for Mode B triggers}
  next_step: ./step-03-execute.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-execute.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
