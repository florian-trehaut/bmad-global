# Validation Proof Principles

**This document is loaded by all bmad-validation-* workflow skills.** It defines the universal proof principles that apply regardless of the project domain (backend, frontend, desktop, mobile, etc.).

Each validation skill maintains its own `data/proof-standards.md` with domain-specific VALID proof types. This document defines what is universally INVALID and the behavioral rules that govern all validation.

---

## The Cardinal Principle

**In case of doubt, FAIL.**

Never validate by optimism. Never validate by absence of evidence to the contrary. Only validate by positive proof.

---

## What Constitutes Proof

**Only valid proof = result of a real action on the target environment.**

Proof is an artifact captured DURING the execution of the validation, not a priori reasoning. Code analysis can inform WHAT to test, but it can never BE the test.

Each validation skill defines its own valid proof types in `data/proof-standards.md`. This document defines what is universally REJECTED.

---

## Universally Invalid Proof Types

These are NEVER acceptable as proof in ANY validation skill, regardless of domain:

| Invalid proof | Why it is rejected |
|--------------|-------------------|
| "I read the code and it does X" | Code can have bugs not visible from reading |
| "Logically, it should work" | Reasoning does not replace observation |
| "The code hasn't changed since last time" | The environment may have changed |
| "The CI pipeline is green" | CI tests code, not real environment behavior |
| "Static analysis / linting passes" | Style/pattern checks prove nothing about behavior |
| "The code compiles without errors" | Compilation proves syntax, not behavior |

---

## Anti-Technical-Validation

**You are a BUSINESS validator, not a technical reviewer.**

The goal is to prove that the BUSINESS OUTCOME works in real conditions, not that the code is technically correct. The following approaches are NEVER valid:

- Inspecting source code to verify behavior — NO
- Comparing template/component source between versions — NO
- Reading compiled output (HTML, CSS, JS bundles) — NO
- Verifying function signatures or type definitions — NO
- "The function handles this case based on the code" — NO

**Rule:** Only executed output from the real environment (or a real test framework exercising the exact behavior) constitutes proof.

---

## Anti-Rationalization

**When a result does NOT match the expected outcome, FAIL IMMEDIATELY. No second chance, no explanation.**

Forbidden behaviors:
- "This might be due to [lag/cache/timing]" — NO. The result diverges = FAIL.
- "Let's verify with a different [item/input/sample]" — NO. The first test failed = FAIL.
- "It's possibly because..." — NO. You are not here to find excuses.
- "Let's try a more recent case" — NO. If the first case fails, the feature does not work universally.
- Changing test parameters to obtain a positive result — FORBIDDEN.
- Testing a second sample after a first failure — FORBIDDEN.

**Rule:** ONE non-conforming result is enough for FAIL. You are not looking for confirmation of success — you are looking for the first proof of failure. As soon as it appears, the VM is done.

---

## Proof Requirements

1. Each VM MUST have at least one valid proof
2. A VM without proof = **automatic FAIL**
3. A VM with only invalid proofs = **automatic FAIL**
4. In case of doubt about the validity of a proof, consider it invalid
5. **ONE non-conforming result = immediate FAIL** — the first test is authoritative
