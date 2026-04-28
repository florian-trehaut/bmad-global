# Null Safety Review Protocol

**Loaded by:** Any bmad-* workflow that reviews code for null/missing-value safety: `bmad-review-story`, `bmad-dev-story` (step-08, step-11), `bmad-create-story` (step-07-plan), `bmad-code-review` (meta-2).

**Indirection layer for** language-specific null-safety rules consumed via `~/.claude/skills/bmad-shared/stacks/{language}.md#null-safety`.

---

## Purpose

The shared rule `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md` covers the **business angle** of missing data: do NOT fabricate fake values for missing business-critical fields (e.g., `price ?? 0` for a required field). That rule remains authoritative for that concern.

This protocol covers a **distinct, complementary concern**: the **runtime-robustness angle**. Not "don't fabricate," but "don't crash because you forgot the value could be missing." Validate at boundaries, propagate optionality through types, fail loudly at the right level — never silently at the wrong level.

The two concerns sometimes intersect on the same line of code (`port = process.env.PORT ?? 3000` is both a fallback question AND a null-handling question). When a finding addresses both, cite both rules.

---

## Relationship to `no-fallback-no-false-data.md`

| Concern | What it forbids | Example violation |
|---|---|---|
| `no-fallback-no-false-data.md` (business) | Substituting a fake value when real data is required | `price ?? 0` for a required price; mapping unknown enum → "other" |
| `null-safety-review.md` (runtime, this protocol) | Crashing because optionality wasn't acknowledged in the type system | `value!.foo` non-null assertion; `dict[k]` on absent key; `.unwrap()` on `None`; pointer deref without nil check |

Findings under this protocol may explicitly cross-reference `no-fallback-no-false-data.md` when the same code violates both (severity stays BLOCKER for any business-critical field).

---

## Generic null-safety principles (apply regardless of language)

For every change involving optional fields, external input, deserialisation, or boundary crossings (HTTP / RPC / DB / config / CLI args), verify these 6 principles:

1. **Distinguish "absent" from "valid value" in the data model.** `0` is not the same as "no count"; `""` is not "no name"; `false` is not "not specified." If the model conflates them, fix the model — not the code.

2. **Validate nullability at the boundary.** API ingress, deserialisation, config load, CLI parsing — these are the right places for null checks. Use a parser library (Zod, pydantic, `serde`, `encoding/json` + custom validation) that produces a typed result.

3. **Beyond the boundary, treat values as total.** Once a value has been validated and typed as non-nullable, downstream code accesses it without re-checking. Defensive sprinkling of `if x is not None:` everywhere indicates the boundary failed its job.

4. **Use the type system as proof.** `Optional[T]`, `Option<T>`, `T?`, `T | null`, `*T` — these tell the compiler / type-checker that absence is possible. Configure strictness (`strictNullChecks`, `mypy --strict`, `clippy::unwrap_used`) so the system enforces handling.

5. **Reference the business rule for fallbacks.** If a missing value triggers a default substitution, this MUST also pass `no-fallback-no-false-data.md`. Required values throw — they don't default.

6. **Tests cover the absent-value path.** For every nullable field crossing a boundary, at least one test exercises the "absent" case. Without it, the null path ships unverified.

---

## Loading stack-specific rules (JIT)

Language-specific anti-patterns live in `~/.claude/skills/bmad-shared/stacks/{language}.md` under the `## Null Safety` H2 section. The mechanism is identical to `concurrency-review.md`:

### Step 1 — Resolve detected languages

Apply `~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md` to extract the language list from `project.md`.

### Step 2 — JIT load the matching stack files

For each detected language `L`:

```
Read(~/.claude/skills/bmad-shared/stacks/{L}.md)
```

If the file exists, extract the `## Null Safety` section and apply:
- The "Anti-patterns to flag" list — turn each pattern into a finding template
- The "Required guardrails" list — verify the project's compiler / lint config enforces them (`strictNullChecks`, `mypy --strict`, `clippy::unwrap_used`, `go vet` / `staticcheck` / `nilaway`)
- The "Language-specific principles" list — additional rubric on top of the 6 generic principles

If the file does NOT exist for a detected language, log:

```
INFO: No null-safety stack file for language "{L}". Applying only generic principles.
```

Do NOT halt. The generic principles still apply.

### Step 3 — Report which stacks were loaded

```
Null safety review applied:
- Generic principles (always)
- Stacks loaded: typescript, python
- Stacks missing: scala
```

---

## Finding format

```yaml
finding:
  id: F-NULL-{N}
  severity: BLOCKER | MAJOR | MINOR | INFO
  perspective: runtime_robustness          # for dev-story self-review YAML
  sub_axis: 2e                             # for code-review meta-2 (null safety sub-axis)
  category: null_safety
  source: generic | stack-{language}       # which rule fired
  rule_ref: "Generic principle 4 (use type system)" OR "typescript.md#null-safety: || vs ??"
  file: "path/file.ts"
  line: 42
  evidence: "code snippet or grep result"
  why: "plain-English explanation of the runtime risk"
  fix: "concrete idiomatic alternative"
  also_violates_zero_fallback: true | false   # cross-reference flag
```

The `also_violates_zero_fallback` field is set when the same code line ALSO violates `no-fallback-no-false-data.md` (e.g., `price ?? 0` is both null-mishandling and fallback). When true, the finding cites both rules.

---

## Severity rubric

- **BLOCKER**: configuration that disables strict null checks (`strictNullChecks: false` in TypeScript), production code with `.unwrap()` on user input, slice/array indexing without bounds check on external input, missing nil check before dereference on external input.
- **MAJOR**: `||` instead of `??` for nullable defaults, non-null assertion `!`, missing `Optional[T]` hints, chained `.get()` cascading None, `assert` for null check in production code.
- **MINOR**: `Option<T>` returned where `Result<T, E>` is more correct, `getattr` without default when default is meaningful.
- **INFO**: opportunity to tighten types (e.g., introduce `NonEmpty<T>`).

---

## HALT conditions

- `tech-stack` section missing in `project.md` → HALT, run `/bmad-knowledge-refresh`.
- Protocol invoked but the diff contains no boundary-crossing code (pure internal logic, no I/O, no deserialisation) → log INFO and skip.

---

## Why this protocol exists

- **Distinct from business fallback rule**: keeps `no-fallback-no-false-data.md` focused on business semantics; this protocol focuses on runtime robustness. They cross-reference but do not duplicate.
- **Decoupling**: workflows reference this protocol; renaming a stack section updates only this file.
- **Extensibility**: adding a language = creating `stacks/{lang}.md#null-safety`. Zero workflow changes.
- **Coverage transparency**: each consumer reports which stacks were loaded vs missing.

See `~/.claude/skills/bmad-shared/knowledge-schema.md` for the architecture rationale and `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md` for the complementary business rule.
