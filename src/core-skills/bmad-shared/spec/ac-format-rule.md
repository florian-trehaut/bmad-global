# Acceptance Criteria Format Rule

**This document is loaded by all bmad-* workflow skills that produce or consume story specs.** It defines the canonical format for acceptance criteria.

## The Rule

A story spec contains TWO classes of acceptance criteria, each with a mandatory format:

### Business Acceptance Criteria (BACs) — Given / When / Then

Read by: PM, business stakeholders, validation-metier executors, review-story.

**Format:** `Given {context}, when {action}, then {observable result}.`

```markdown
- [ ] BAC-1: Given a customer with an active subscription, when they request a refund within 14 days, then the system processes the refund within 24 hours.
```

### Technical Acceptance Criteria (TACs) — EARS

Read by: dev-story, code-review (meta-1), tea-atdd, scope-completeness audits.

**Format:** one of the 5 EARS patterns (see `bmad-shared/data/ears-acceptance-criteria-template.md`):

1. **Ubiquitous** — `The {system} shall {action}.`
2. **Event-driven** — `When {trigger}, the {system} shall {action}.`
3. **State-driven** — `While {state}, the {system} shall {action}.`
4. **Optional** — `Where {feature is enabled}, the {system} shall {action}.`
5. **Unwanted** — `If {undesired condition}, then the {system} shall {action to prevent / handle it}.`

```markdown
- [ ] TAC-1 *(Ubiquitous, refs BAC-1)*: The RefundService shall enforce idempotency keys on every POST /refunds.
- [ ] TAC-2 *(Event-driven, refs BAC-1)*: When a refund request is received, the RefundService shall validate `subscription_id` against the billing provider before persisting.
```

## Why split BAC vs TAC

- **BACs** are user-value statements. PM and business stakeholders read them. G/W/T is the universal BDD format (Cucumber, SpecFlow). Native to validation-metier and review-story.
- **TACs** are system-behaviour statements. EARS' 5 patterns eliminate ambiguity that G/W/T cannot express: ubiquitous behaviour (no trigger), state-driven behaviour (while a state holds), unwanted behaviour (negative assertion).

## Cross-references

- Every TAC `*(Pattern, refs BAC-N)*` MUST reference at least one BAC. TACs without BAC ref → MAJOR finding (orphan technical AC).
- Every BAC SHOULD have at least one TAC implementing it. BACs without TAC → MAJOR finding (untraced business ask).

## Anti-patterns

- BACs in EARS → REJECT, rewrite as G/W/T (PM cannot read EARS easily)
- TACs in G/W/T → REJECT, rewrite as one of the 5 EARS patterns
- Mixed format inside a single AC → REJECT, pick one
- Vague language ("the system should be fast", "users should be happy") → REJECT, no pattern matches
- TAC with multiple `shall` actions → REJECT, split into separate TACs

## Application by Workflow Phase

| Workflow | How to apply |
|----------|-------------|
| **create-story** | Step-11-plan generates BACs in G/W/T (from business context) and TACs in EARS (from technical model). Validate format before output. |
| **quick-dev** | Same format enforcement, embedded in spec-template.md. |
| **review-story** | Step-05-analyze rejects format violations as MAJOR findings. |
| **dev-story** | Step-12-traceability traces BACs and TACs to code/tests separately. |
| **code-review** | Meta-1 parses BAC list and TAC list using format-aware extractors. Format violations → BLOCKER. |
| **tea-atdd** | Step-01-preflight uses EARS pattern to select test scaffold (ubiquitous → "always" assert; event-driven → setup+trigger+assert; state-driven → state-machine; optional → feature-flag conditional; unwanted → negative test). |
| **tea-trace** | Step-01-context assigns IDs as `BAC-N` and `TAC-N` (not generic `AC-N`) to preserve type information downstream. |
| **validation-frontend / desktop / metier** | VMs derive from BACs (G/W/T friendly). TACs are not consumed directly by validation-* (covered by automated tests). |
| **troubleshoot** | scope-completeness audits both BAC and TAC coverage in the diff. |

## Exemption rule

The only valid exemption is an explicit user instruction in the conversation citing this rule by name. Generic excuses ("simple story", "trivial fix", "validators green") are forbidden rationalizations per `workflow-adherence.md`.
