# Step 2: Check Merge Requests


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Check Merge Requests with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Review all open Merge Requests authored by the user. Classify each by action needed: ready to merge, waiting for review, has comments to address, or blocked. This feeds the daily script and helps prioritize the day.

## RULES

- Use the forge CLI (`{FORGE_CLI}`) to list open MRs — do not assume MR states
- Cross-reference with tracker issues when MRs reference an issue ID (e.g., PRJ-123 in the title)
- Flag mismatches between tracker status and MR status (e.g., tracker says "In Review" but MR has no reviewers)
- Do NOT merge or approve anything — this step is read-only

## SEQUENCE

### 1. List open MRs

Using the forge CLI:

```bash
{FORGE_CLI} mr list --author=@me
```

If no results, also try listing all open MRs and filtering by the user's forge username.

For each MR, capture: `iid`, `title`, `source_branch`, `state` (open/draft), `reviewers`, `comments_count`, `pipeline_status`.

### 2. Classify each MR

For each open MR, determine the action needed:

| Category | Condition | Action |
|----------|-----------|--------|
| **Ready to merge** | Pipeline green, approved, no unresolved threads | Merge today |
| **Needs review** | No reviewers assigned, or reviewers haven't responded | Follow up with reviewer |
| **Has feedback** | Unresolved comment threads | Address comments |
| **Draft** | MR is marked as draft | Continue working or mark ready |
| **Pipeline failing** | CI red | Fix pipeline |
| **Blocked** | Depends on another MR or external factor | Note blocker |

### 3. Cross-reference with tracker

For each MR that references a tracker issue ID in its title:
- Check the tracker issue status
- Flag if the tracker status doesn't match the MR state (e.g., issue is "To Test" but MR is not merged)

### 4. Present MR summary

Display:

```
Open MRs: {count}
  Ready to merge: {count}
  Needs review: {count}
  Has feedback: {count}
  Draft: {count}
  Pipeline failing: {count}
```

Then list each MR with its classification:

```
| MR | Title | Status | Action needed |
```

Store as `OPEN_MRS`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Check Merge Requests
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-03-load-backlog.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
