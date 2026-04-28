# Out-of-Scope Template

Reference template for Step 11 out-of-scope statement (explicit non-goals).

## Why Out-of-Scope Matters

Without an explicit out-of-scope statement:

- Reviewers cannot detect scope creep (any addition is "fine, it's related")
- Implementers waste effort on adjacent work that is not the story's purpose
- Stakeholders argue about what "should have been included"
- AI agents assume liberal interpretation and do too much

Explicit non-goals give every consumer (dev-story, code-review, review-story) a hard boundary.

## Format

```markdown
### Out of Scope

The following items are **explicitly NOT part of this story**:

| # | Non-goal | Why excluded | Where it might land |
| - | -------- | ------------ | -------------------- |
| OOS-1 | {feature / refactor / fix that someone might expect to be included}        | {1-line reason: separate concern, deferred priority, requires ADR, etc.} | {next story / future epic / never / TODO ticket} |
| OOS-2 | {Migrating existing refunds to new schema}                                  | Backfill is a separate operational concern with rollback plan           | Future story REFUND-42 |
| OOS-3 | {Updating the admin UI to show refund reasons}                              | UI work blocked on UX design                                            | UX backlog item |
| OOS-4 | {Refactoring billing provider client to async}                              | Pre-existing tech debt, not caused by this story                        | Tech debt board |

**Scope-creep policy:** any modification to files / behaviour outside this story's `Files to Create / Modify` list AND that delivers any OOS-N item → BLOCKER finding in code-review, must be split into a separate PR/story.
```

## Checklist

- [ ] At least 2 items in the out-of-scope register (forces honest thinking)
- [ ] Each item names something a reasonable reader might EXPECT to be included
- [ ] Each item has a 1-line reason for exclusion
- [ ] Each item points to where it WILL be done (or "never")
- [ ] Out-of-scope register cross-references with `Scope: Excluded` section in the spec body (no contradiction)
- [ ] Scope-creep policy active: dev-story scope-completeness + code-review meta-1 enforce

## Guidelines

**GOOD non-goals:**
- "Backfilling existing refunds to the new schema" (related, but separate operational concern)
- "Adding refund analytics dashboard" (consumer, not producer)
- "Migrating from REST to GraphQL" (architectural shift, requires ADR)

**BAD non-goals (do not list these — they are obvious):**
- "Building a time machine"
- "Solving world hunger"
- "Refactoring everything"

The point of OOS is to name the **adjacent work that a thoughtful reader would mistakenly assume is included**. Not to list everything else in the universe.

## Anti-patterns

- Empty out-of-scope section → REJECT, you haven't considered scope creep
- "Nothing is out of scope" → REJECT, that's not a story, that's an epic
- Naming things that are obviously unrelated to bulk up the list → REJECT, only adjacent risks
- OOS items that contradict the in-scope section → REJECT, fix the conflict
- "Maybe out of scope, will decide later" → REJECT, decide now or it will land in PR review as a fight
