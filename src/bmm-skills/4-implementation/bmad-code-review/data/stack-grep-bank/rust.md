# Stack Grep Bank — Rust

**Consumed by:** Meta-2 (2a), Meta-3 (3a, 3b), Meta-4 (4a, 4d). Dispatched when `stack.md: language: rust`.

---

## Zero Fallback (sub-axis 2a)

```bash
# unwrap / expect on operations that can fail in production (use Result handling)
grep -rnE "\.unwrap\(\)|\.expect\(" --include="*.rs" {changed_files_dirs} | grep -v "_test.rs" | grep -v "tests/"

# unwrap_or / unwrap_or_default — hides missing value
grep -rnE "\.unwrap_or(_default|_else)?\(" --include="*.rs" {changed_files_dirs} | grep -v "tests/"

# match arms catch-all returning default
grep -rnE "_ => (0|\"\"|None|Default::default)" --include="*.rs" {changed_files_dirs}
```

## Security (sub-axis 3a)

```bash
# Command execution via shell
grep -rnE "Command::new\(.*(sh|bash|cmd)" --include="*.rs" {changed_files_dirs}

# SQL string formatting
grep -rnE "format!\(.*(SELECT|INSERT|UPDATE|DELETE)" --include="*.rs" {changed_files_dirs}

# Unsafe blocks
grep -rn "unsafe {" --include="*.rs" {changed_files_dirs} | grep -v "tests/"

# Weak crypto (md5 / sha1 crates)
grep -rnE 'use\s+md5|use\s+sha1::' --include="*.rs" {changed_files_dirs}

# Hardcoded credentials
grep -rnE '(password|secret|api_key|token)\s*:\s*"[A-Za-z0-9]{10,}"' --include="*.rs" {changed_files_dirs}
```

## AI / Agentic Safety (sub-axis 3b)

```bash
# Rust LLM SDK usage
grep -rnE 'use\s+(async_openai|anthropic|candle|llm_chain)' --include="*.rs" {changed_files_dirs}
```

## Code Quality (sub-axis 4a)

```bash
# println! / dbg! left in prod code
grep -rn "println!(\|dbg!(" --include="*.rs" {changed_files_dirs} | grep -v "tests/" | grep -v "src/bin/" | grep -v "examples/"

# TODO / FIXME
grep -rnE "//\s*(TODO|FIXME|XXX|HACK)" --include="*.rs" {changed_files_dirs} | grep -v "tests/"

# Clippy allow attributes without justification
grep -rn "#\[allow(" --include="*.rs" {changed_files_dirs} | grep -v "tests/"
```

## QA & Testing (sub-axis 4d)

```bash
# Mocks (prefer traits + in-memory fakes)
grep -rn "use mockall\|#\[automock\]" --include="*.rs" {changed_files_dirs}

# Ignored tests
grep -rn "#\[ignore\]" --include="*.rs" {changed_files_dirs}
```

## API Contract (sub-axis 1b)

Rust public API changes detected via `cargo-semver-checks`. Meta-1 invokes:

```bash
cargo semver-checks check-release --manifest-path Cargo.toml
```

Any breaking change output → BLOCKER.
