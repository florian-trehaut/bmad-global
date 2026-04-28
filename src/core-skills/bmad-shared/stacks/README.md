# Stacks — Language-Specific Rule Files

**Purpose:** A global catalog of language-specific runtime-robustness rules consumed by BMAD protocols. Each file in this directory describes idiomatic patterns, anti-patterns, and guardrails for a single language.

**Loaded by:**

- `~/.claude/skills/bmad-shared/protocols/concurrency-review.md` — reads the `## Concurrency` section
- `~/.claude/skills/bmad-shared/protocols/null-safety-review.md` — reads the `## Null Safety` section

Future protocols may add new H2 sections (e.g., `## Performance`, `## Error Handling`) to the same files. Existing protocols ignore unknown sections — the files are additive.

---

## File naming convention

| Identifier | File | Aliases (matched by tech-stack-lookup) |
|---|---|---|
| Go | `go.md` | `golang` |
| Rust | `rust.md` | — |
| TypeScript / Node.js | `typescript.md` | `ts`, `nodejs`, `node`, `javascript`, `js` |
| Python | `python.md` | `py` |

The canonical filename is the lowercase, primary identifier. The `tech-stack-lookup` protocol matches aliases case-insensitively before resolving to a stack file.

---

## Required structure

Each stack file (other than this `README.md`) MUST contain:

```markdown
# Stack: {Language}

**Loaded by:** Protocols `concurrency-review.md` and `null-safety-review.md`
when the project's tech-stack section includes `{language}` (or aliases).

## Concurrency

### Anti-patterns to flag

- **{name}** ({severity: BLOCKER|MAJOR|MINOR})
  - Detection: {grep / AST / lint signal}
  - Why: {risk in plain English}
  - Fix: {idiomatic alternative}

### Required guardrails

- {test / lint / build flag the project must use}

### Language-specific principles

- {short, actionable bullets}

## Null Safety

### Anti-patterns to flag

- **{name}** ({severity})
  - Detection: ...
  - Why: ...
  - Fix: ...

### Required guardrails

- {compiler / lint configuration the project must enforce}

### Language-specific principles

- {bullets}
```

Validator rule #15 (`tools/validate-skills.js`) checks that both `## Concurrency` and `## Null Safety` H2 sections are present in every stack file (excluding this README). A missing section produces a warning, not a hard error, so partial files are allowed during development.

---

## Relationship to `bmad-code-review/data/stack-grep-bank/`

There is a SEPARATE per-language directory at `src/bmm-skills/4-implementation/bmad-code-review/data/stack-grep-bank/`. The two serve **different purposes** and are kept distinct for v1:

| | `bmad-shared/stacks/` (this directory) | `bmad-code-review/data/stack-grep-bank/` |
|---|---|---|
| Scope | Global — shared by all bmad-* skills | Local — consumed only by `bmad-code-review` meta-agents |
| Content | Idiomatic rules, principles, anti-patterns, guardrails (semantic) | Pre-baked grep patterns for fast pattern matching (mechanical) |
| Consumed by | `concurrency-review`, `null-safety-review`, future protocols | meta-1..meta-6 sub-axes (2a, 3a, 4a, etc.) |
| Format | H2 sections per concern (`## Concurrency`, `## Null Safety`) | H2 sections per sub-axis (`## Zero Fallback (sub-axis 2a)`) |

A future story may consolidate the two — out of scope here. Until then:

- **DO NOT** copy grep patterns verbatim from `stack-grep-bank/` into stacks files.
- **DO NOT** copy semantic principles from stacks files into `stack-grep-bank/`.
- Authors of new languages: create both files (`stacks/{lang}.md` AND `stack-grep-bank/{lang}.md`) if the language is reviewed by both systems.

---

## Adding a new language

1. Create `src/core-skills/bmad-shared/stacks/{lang}.md` following the structure above.
2. Add the canonical name and aliases to the `tech-stack-lookup` protocol (if needed for alias resolution).
3. Run `npm run validate:skills` to confirm rule #15 passes.
4. Run `node tools/bmad-npx-wrapper.js install --force` to deploy.
5. Optionally also create `bmad-code-review/data/stack-grep-bank/{lang}.md` if the language is reviewed by code-review meta-agents.

The bundled v1 set covers Go, Rust, TypeScript, and Python. Other languages (Java, Kotlin, Ruby, C#, Swift, Elixir, …) can be added by users without modifying the protocols.

---

## When a stack file is missing for a detected language

The protocols `concurrency-review.md` and `null-safety-review.md` log INFO and apply only the generic (language-agnostic) principles. They do NOT halt. The user can choose to add the missing stack file later.

---

## Versioning

Each stack file is independent — no cross-file version constraint. Adding, modifying, or deleting a stack file does not require a knowledge-schema bump (this directory is in `bmad-shared/`, not in project knowledge).

If a future schema change requires per-stack metadata, the files will gain YAML frontmatter at that point.
