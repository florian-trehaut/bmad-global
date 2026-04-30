# Evidence-Based Debugging

**This document is loaded by all bmad-\* workflow skills at initialization.** It defines the mandatory standard for what counts as proof of a diagnosis when investigating bugs, errors, or unexpected behaviour.

**Companion to:** `no-fallback-no-false-data.md` (data integrity), `validation-proof-principles.md` (business validation proof), and `workflow-adherence.md` (process integrity). This rule covers **diagnostic integrity**.

**Primary consumer:** `bmad-troubleshoot`. Secondary consumers: any workflow that performs root-cause analysis (review-story when investigating reported bugs, dev-story when reproducing a flaky test, validation-\* when verifying a bug is actually fixed).

---

## The Cardinal Principle

> Reading the code does not prove the bug. Running the code, capturing real output, and showing the output diverges from expected — that proves the bug.

Code analysis can inform WHAT to investigate. It can never BE the investigation result.

This applies symmetrically:

- "I read the code and I think the bug is X" → **NOT a diagnosis**
- "I ran the failing scenario, observed exit code 1 with stderr `{verbatim}`, traced it to `file.ext:42`, and confirmed the offending line by reverting it and re-running with exit code 0" → **diagnosis with proof**

---

## The Reproduction Hierarchy

When investigating a bug, the diagnostic value of evidence follows this strict ordering. **You MUST climb this ladder as far as possible before presenting a diagnosis.** If you stop on a lower rung, you MUST explicitly justify why a higher rung was unreachable.

| Rung | Evidence type | What it proves | When valid |
|------|--------------|----------------|------------|
| **1 (best)** | **Local reproduction via automated test** | The bug is real, deterministic, locally reproducible, and a regression test now exists | DEFAULT REQUIREMENT for bmad-troubleshoot. Skipping requires explicit justification (see exceptions below) |
| **2** | **Local reproduction via manual run** | The bug is real and locally reproducible, but no test artifact yet | Acceptable as intermediate; MUST be promoted to rung 1 before fix is shipped |
| **3** | **Captured production artifact** (log line + correlation ID, DB snapshot, stack trace, distributed trace) | The bug occurred at least once with the captured fingerprint | Acceptable when rung 1-2 are unreachable AND the artifact is timestamped, retrievable, and immutable |
| **4** | **Live production observation** (real-time tail, dashboard, current DB query) | The bug is occurring NOW in production | Lower than rung 3 because the artifact is ephemeral; must be screenshotted or copied to a durable location |
| **5** | **User report + supporting evidence** (screenshot, error message text from the user) | The user encountered something — but the artifact may be misinterpreted | Use only as a STARTING POINT; cannot be the final proof |
| **REJECTED** | **Code reading + reasoning alone** | Nothing about the actual failure | NEVER acceptable as proof |
| **REJECTED** | **"It seems like..." / "Probably..." / "Logically..."** | Speculation | NEVER acceptable as proof |
| **REJECTED** | **Mocked test that passes** | The mock matches your assumption — not that the system fails | NEVER acceptable as proof of a bug (a mocked test can be a STARTING point for rung 1, but only after the mock is removed and the test fails on real dependencies) |

**Why mocks are rejected for proof:** if the mock encodes your assumption about how the system fails, the test passing only confirms the mock matches your assumption — it doesn't confirm the assumption matches reality. Real dependencies (real DB, real API, real file system) are required for rung-1 proof.

---

## Exception Cases — When Rung 1 is Unreachable

The user explicitly granted that reproduction-via-test is NOT always possible. The following are the documented exception cases. When ANY of these applies, you MAY climb only to the highest rung that is reachable, but you MUST:

1. State the exception class explicitly in the diagnosis ("rung-1 unreachable: race condition")
2. Climb to the highest rung that IS reachable for that case
3. Document a follow-up to introduce reproduction tooling (load generator, chaos test, time-mocking) when feasible

### Exception E-1: Production-only state

The bug depends on a specific record, tenant, or aggregate state that exists only in production. Without exfiltrating that data (forbidden), local reproduction is impossible.

**Highest reachable rung:** 3 (captured production artifact). Capture the offending record's structure (anonymised if necessary) plus the failing query/operation, plus the stack trace.

**Follow-up:** add a fixture or seed script that synthesises an equivalent state for future regression coverage.

### Exception E-2: Non-deterministic timing / race conditions

The bug is a race between two concurrent operations and only manifests under specific scheduling. Local reproduction is possible **probabilistically** but not deterministically.

**Highest reachable rung:** 1 (test that flakes), but classify the test as "race-reproduction" not as a regression test. The actual fix MUST be a structural change (lock, ordering, idempotency) — not "the test passes 9 times out of 10."

**Follow-up:** introduce deterministic concurrency test tooling (e.g., a scheduler that forces specific interleavings) for future races.

### Exception E-3: Infrastructure-dependent

The bug only manifests under production load, network conditions, kernel version, container runtime, or hardware specifics that local dev cannot replicate.

**Highest reachable rung:** 3 (captured artifact from staging or canary). If staging cannot reproduce either, fall to rung 4 (live production observation with care).

**Follow-up:** if the project has a load-test environment, add a load-test scenario that reproduces the failure profile.

### Exception E-4: Third-party API state

The bug depends on a partner system's specific response or state. Mocking the partner's response would encode your assumption about the failure (rejected).

**Highest reachable rung:** 3 (captured real partner response from logs, headers, body). Use the captured response as a fixture for the regression test — but the test asserts the fix handles the captured response, not a synthetic one.

**Follow-up:** request a sandbox or replay capability from the partner.

### Exception E-5: One-shot events

The bug occurred during a specific deploy, migration, batch job, or background task that already completed. The state that caused it no longer exists.

**Highest reachable rung:** 3 (captured logs / DB state from the event). The diagnosis is post-mortem — rung 1 is structurally impossible.

**Follow-up:** the fix is a guard or invariant check that would have caught the state during the event. The regression test exercises that guard against synthesised inputs.

### Exception E-6: Heisenbugs

The bug manifests only in the absence of debugger, specific monitoring, or instrumentation that perturbs timing.

**Highest reachable rung:** 3 (captured artifact from the unmonitored run). Rung 1 reproduction inherently masks the bug.

**Follow-up:** introduce production-grade observability (sampled tracing, statistical profiling) that does not perturb timing.

### Exception E-7: Time-of-day / calendar-dependent

The bug only manifests at DST changeover, leap second, fiscal year boundary, etc.

**Highest reachable rung:** 1 (test with mocked clock). This is reachable because clock can be mocked deterministically — which is itself a hint that the underlying code should accept a clock as a dependency rather than calling `now()` directly.

**Follow-up:** refactor the calling code to accept an injected clock, removing the mock necessity.

### Exception E-8: Hardware / OS-specific

The bug only manifests on certain CPU architectures, GPUs, mobile devices, or OS versions.

**Highest reachable rung:** 3 (captured artifact from the affected device class). Local reproduction requires access to the same hardware, which may be infeasible.

**Follow-up:** add the affected device class to the CI matrix, if possible.

---

## What Counts As "Reproduction"

A rung-1 reproduction is valid only if:

1. **It runs against real dependencies** — real DB (or test container of the same version), real file system, real network where applicable. No mocks of the suspected failing component.
2. **It fails BEFORE the fix** — the test must demonstrably fail at `baseline_commit` (the state before the fix). Run it. Confirm `exit_code != 0`. Capture the exact failure output.
3. **It passes AFTER the fix** — apply the fix, re-run the same test, confirm `exit_code == 0`.
4. **It exercises the failure mode**, not a happy path. A test that asserts "function returns a value" when the bug is "function returns the wrong value under condition X" is not reproducing the bug.

**Output format for proof in the diagnosis:**

```
### Reproduction Proof

Test file: `path/to/test.ext:NN`

Pre-fix run (at baseline_commit {SHA}):
  $ {test_command} -- path/to/test.ext
  ...
  FAILED — {1-line summary of the failure}
  exit_code: {N}

Post-fix run (at HEAD):
  $ {test_command} -- path/to/test.ext
  ...
  PASSED — {1-line summary}
  exit_code: 0
```

---

## Anti-Patterns

These are forbidden as evidence in any diagnosis:

| Anti-pattern | Example | Why forbidden |
|--------------|---------|---------------|
| Code-tour proof | "I read `auth.ts` and the bug is on line 42 because the null check is missing" | Reading is not running. The actual control flow may differ from your reading |
| Speculative root cause | "The bug is probably caused by the recent migration" | "Probably" is not proof. Either the migration is the cause (with proof) or it is not |
| Mocked-test pseudo-proof | "I added a test where the DB returns null, and the function crashes — bug confirmed" | The test confirms your assumption about the DB returning null. It does not confirm the DB ever returns null in production |
| CI-says-it-works | "The CI pipeline went green, so the fix is verified" | CI tests against test fixtures, not production state. CI green means "the test we wrote passes" — not "the bug is fixed" |
| Static-analysis proof | "Linter / type-checker passes, so it's correct" | Style and type checks prove syntax, never behaviour |
| Hand-waved staging check | "I deployed to staging and it looks OK" | "Looks OK" is not a captured artifact. Capture the specific request/response that demonstrates the fix |
| Symptom-based proof | "After my fix, the error message no longer appears in the logs" | The symptom may have shifted, the underlying race may still exist, the failure mode may have moved silently downstream |

---

## Application by Workflow Phase

| Workflow | When this rule applies | What changes |
|----------|----------------------|---------------|
| **bmad-troubleshoot** | step-03 (investigate) and step-06 (fix). The diagnosis at step-04 MUST cite the rung achieved | Rung 1 is mandatory for the fix in step-06 unless an E-N exception is documented |
| **bmad-dev-story** | When the story is "fix bug X". The TDD red phase is the rung-1 reproduction | The failing test must demonstrably fail BEFORE the fix at the baseline commit |
| **bmad-review-story** | When reviewing a bug-fix spec. The reviewer asks: does this spec have a reproduction strategy? | If no rung-1 strategy is described, request justification (E-N) or rejection of the spec |
| **bmad-validation-\*** | The validation-proof-principles already enforce real-environment proof; this rule is the upstream debugging-time analog | Validation rejects diagnoses that cite only rung 5 (user report) without supporting captured artifacts |

---

## Globally-Known: Reference from CLAUDE.md

Projects using BMAD that want this principle visible globally (not only inside workflow execution) SHOULD add this section to the project CLAUDE.md (the `bmad-project-init` template includes this by default for new projects):

```markdown
## Evidence-Based Debugging

When investigating any bug, error, or unexpected behaviour, follow `~/.claude/skills/bmad-shared/spec/evidence-based-debugging.md`. The cardinal principle: code reading is never proof. Reproduce locally via test (rung 1) before presenting a diagnosis. If rung 1 is unreachable, document the exception class and climb to the highest reachable rung.
```

This makes the rule applicable in ad-hoc debugging conversations (not only inside `/bmad-troubleshoot` invocations).

---

## Cross-references

- `validation-proof-principles.md` — proof principles for **business validation** (rejects code analysis); this rule is the **debugging-time** analog
- `no-fallback-no-false-data.md` — data integrity (a fallback hides a bug); this rule applies when investigating that hidden bug
- `workflow-adherence.md` — process integrity; CHK-INVESTIGATE checkpoints in troubleshoot step-03 emit which rung was achieved as part of the receipt
