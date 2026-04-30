# Step 5: Adversarial Code Review

**Goal:** Construct diff of all changes, perform adversarial review, present findings.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` §A, when TEAMMATE_MODE=true:

- The "present findings" interactive prompt is rerouted via `SendMessage` (a `question` payload with the findings list and per-finding options ACCEPTED/REJECTED/MODIFIED/SKIPPED).
- Block on `question_reply` from the lead.
- TAC-18 unwanted-pattern: invoking AskUserQuestion directly while TEAMMATE_MODE=true → HALT.

When TEAMMATE_MODE=false, proceed below as normal.

---


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Adversarial Code Review with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## AVAILABLE STATE

From previous steps:
- `{baseline_commit}` - Git HEAD at workflow start (CRITICAL for diff)
- `{execution_mode}` - "tech-spec" or "direct"
- Story-spec v2 sections (Mode A) — surfaced by step-02b: BACs / TACs / Out-of-Scope / NFR / Security Gate / Observability / Boundaries / Risks
- step-02b warnings — Phase B sections that were shallow or N/A (informational input for the adversarial reviewer)

---

## v2 Spec Audit Context

The adversarial review takes the **story-spec v2 contract** into account:

- **Out-of-Scope items (OOS-N)** — any modification in the diff that delivers an OOS-N item → BLOCKER finding (scope creep into explicit non-goal)
- **Boundaries Triple — Never-Do** — any action in the diff matching a Never-Do item → BLOCKER (committed secrets, modified migrations already run, removed failing tests, `--no-verify`, etc.)
- **TAC EARS pattern coverage** — for each TAC declared in the spec, verify the test scaffold matches the EARS pattern (Ubiquitous → "always" assertion; Event-driven → setup+trigger+assert; State-driven → state-machine; Optional → feature-flag conditional; Unwanted → negative test)
- **Security Gate FAIL items** — verify each remediation task in the spec has a corresponding implementation in the diff
- **Observability Requirements** — verify mandatory log events / metrics / alerts are wired up

For Mode B (no spec), apply project-baseline boundaries from `~/.claude/skills/bmad-shared/spec/boundaries-rule.md` and the standard adversarial perspectives.

---

## 1. Construct Diff

Build complete diff of all changes since workflow started.

### If `{baseline_commit}` is a Git commit hash:

**Tracked file changes:**
```bash
git diff {baseline_commit}
```

**New untracked files:**
Only include untracked files created during this workflow. For each, include full content.

### If `{baseline_commit}` is "NO_GIT":

Use best-effort diff construction:
- List all files modified during steps 2-4
- Show changes made (before/after or current state)
- Include new files with full content

Merge all changes into `{diff_output}`.

**Note:** Do NOT `git add` anything — this is read-only inspection.

---

## 2. Perform Adversarial Review

Review the `{diff_output}` from these perspectives:

1. **Correctness**: Does the code actually do what was requested? Logic errors? Off-by-one?
2. **Security**: Injection, auth bypass, data exposure, missing validation?
3. **Robustness**: Error handling, edge cases, null/empty states?
4. **Patterns**: Follows codebase conventions? Forbidden patterns used?
5. **Testing**: Adequate coverage? Missing edge case tests?
6. **Performance**: N+1 queries, unnecessary allocations, missing indexes?
7. **Fact-check**: Do all code comments accurately describe what the code does? Are all function/variable names semantically correct? Would a PR description based on these names and comments be truthful?
8. **ADR conformity** (if ADRs loaded): Does the implementation follow all active Architecture Decision Records? Any new patterns that contradict decided approaches? Any architectural choices that should have an ADR but don't?

   If an ADR gap is found, branch on TEAMMATE_MODE + autonomy_policy:

   - **TEAMMATE_MODE=true AND autonomy_policy=spec-driven** : ADR gap is **STRUCTURAL** (arch decision absent from spec — must reach user even if spec didn't anticipate). Per TAC-6, emit `SendMessage(question, critical_ambiguity: true)` to `LEAD_NAME` with the ADR description and options `[A]/[S]/[N]`. Block until reply. Do NOT auto-resolve regardless of how "obvious" the answer seems.
   - **Else (TEAMMATE_MODE=false standalone, or autonomy_policy=strict)** : **HALT** inline. Present the menu:

     > This implementation introduces **{description}** which should be recorded as an Architecture Decision Record.
     >
     > **[A]** Create ADR now (invoke `bmad-create-adr`)
     > **[S]** Skip — will create ADR later
     > **[N]** Not needed — this doesn't warrant an ADR

     WAIT for user selection.

     - **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume the review.
     - **IF S or N:** Log the user's choice and resume the review.

   **NEVER** silently document an ADR need as a "note" or "recommendation". The HALT (or critical_ambiguity escalation) forces an explicit decision.

Apply review perspectives from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION).

---

## 3. Design Decisions Audit

List all design decisions made during implementation that were NOT specified by the user or tech-spec. For each:
- **What was decided** — the choice made
- **Why** — the reasoning
- **Alternatives** — what else could have been done

Present these as part of the findings — they are not defects, but decisions the user should be aware of and can challenge.

## 4. Process Findings

- If zero findings: HALT — this is suspicious. Re-analyze or request user guidance.
- Evaluate severity (Critical, High, Medium, Low) and validity (real, noise, undecided).
- Do NOT exclude findings based on severity or validity.
- Order findings by severity.
- Number the ordered findings (F1, F2, F3, etc.).
- Present findings as a table: ID, Severity, Validity, Description.

---

## NEXT STEP

With findings in hand, read fully and follow: `step-06-resolve-findings.md`.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Adversarial Code Review
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-06-resolve-findings.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
