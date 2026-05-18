# Stack: Rust

**Loaded by:** Protocols `concurrency-review.md` and `null-safety-review.md` (resolve to `stacks/rust/{concurrency,null-safety}.md` sub-files first, fall back to this master file's H2 sections if sub-files are missing). Other axes (performance, error-handling, memory-layout, unsafe-usage, tooling, async) are loaded inline by reviewers when their respective axes are in scope.

**Conventions:** Rust-specific runtime-robustness rules. Rust's type system catches many issues at compile-time, but `.unwrap()`, `.expect()`, async deadlocks, unsafe soundness, allocation in hot paths, and unsafe-induced UB remain real production hazards. The 8 sub-files below break down each axis with anti-patterns, guardrails, principles, and sourced URLs (May 2026 fresh research).

---

## How to use this stack

This master file carries the **overview + cross-cutting summary + Sub-files index**. The actual rules live in the 8 sub-files under `stacks/rust/` and are **JIT-loaded by the consuming protocol or reviewer**.

The split exists because Rust's runtime-robustness knowledge surface (concurrency / null-safety / performance / error-handling / memory layout / unsafe usage / tooling / async) is ~3500+ lines — well above the 600-line single-file target.

Other stacks (Go, Python, TypeScript) stay single-file until their content grows large enough to warrant a split — same rule, same migration path. The two protocols that consume stack files (`concurrency-review.md`, `null-safety-review.md`) support both single-file and multi-file layouts transparently.

## Sub-files index

| Sub-file | Topic | Loaded by (typical) |
|---|---|---|
| [`rust/concurrency.md`](./rust/concurrency.md) | `MutexGuard` across await, lock ordering, channels over `Arc<Mutex>`, `Send`/`Sync` proof, cancellation safety | `concurrency-review.md` protocol (auto), code reviewers on async/threaded changes |
| [`rust/null-safety.md`](./rust/null-safety.md) | `.unwrap()` / `.expect()` in production, slice indexing, integer cast truncation, `&str` byte boundary, `Option<T>` vs `Result<T, E>` | `null-safety-review.md` protocol (auto), code reviewers on parsing / boundary code |
| [`rust/performance.md`](./rust/performance.md) | Hot-path allocations, `clone()` cost, iterator-over-loop, build profiles, `criterion` benchmarking, flamegraph / samply / Tracy profiling, mold linker, SIMD | Reviewers on performance-sensitive changes ; future `performance-review.md` protocol |
| [`rust/error-handling.md`](./rust/error-handling.md) | `thiserror` (libraries) vs `anyhow` / `eyre` (apps) vs `miette` (diagnostics), `?` propagation, error context, `From` conversions, panics-when-justified, async error patterns, FFI boundaries | Reviewers, API design discussions |
| [`rust/memory-layout.md`](./rust/memory-layout.md) | `repr(C)` / `repr(transparent)` / `repr(packed)`, niche optimisation, `Pin`/`Unpin`, `Cow`/`Arc`/`Rc`, `MaybeUninit`, Miri + sanitizers (asan/tsan/msan), Stacked Borrows | Reviewers on FFI / unsafe / performance hotspots |
| [`rust/unsafe-usage.md`](./rust/unsafe-usage.md) | When unsafe is justified, SAFETY comment convention, soundness audit, FFI patterns (`bindgen` / `cbindgen`), Miri exhaustive testing, sanitizers, `cargo-geiger` | Reviewers on any unsafe block, FFI changes |
| [`rust/tooling.md`](./rust/tooling.md) | rustup / `rust-toolchain.toml`, clippy 600+ lints, rustfmt, rust-analyzer, cargo-nextest, mold/wild/lld linkers, sccache, cargo-deny / cargo-audit / cargo-machete, code coverage via cargo-llvm-cov, mdBook docs | Reviewers, CI / DevX engineers |
| [`rust/async.md`](./rust/async.md) | tokio (current LTS 1.x), runtime ecosystem (async-std / smol / embassy / monoio / glommio / bevy_tasks), `async fn` in traits (Rust 1.75+), cancellation safety, `JoinSet` / `JoinHandle`, `select!`, streams, tokio-console, tracing | Reviewers on async / networking / runtime code |

## Cross-cutting summary

For protocols that consume stack rules JIT (concurrency-review / null-safety-review), the sub-files are the canonical source.

For reviewers running an ad-hoc code review on Rust code, the recommended reading order depends on the change :

| Change touches… | Read first |
|---|---|
| Async fn / futures / runtime | `async.md` + `concurrency.md` (cancellation, locks-across-await) |
| Public API surface | `error-handling.md` (Result types) + `null-safety.md` (no panics) |
| FFI / extern C / bindgen | `unsafe-usage.md` + `memory-layout.md` (repr, ABI) |
| Hot loops / per-frame code | `performance.md` (allocations, iterators) + `memory-layout.md` (cache locality) |
| CI config / `Cargo.toml` / lint setup | `tooling.md` |
| Game-dev (Bevy / Wgpu / Macroquad) | `domains/game-dev/rust-gamedev.md` (cross-domain, not stack-axis) |

## Rust 2024 Edition (stabilized 1.85.0 — Feb 2025)

Major edition features impacting all sub-files :

- `unsafe_op_in_unsafe_fn` lint now default-on (forces inner `unsafe { ... }` blocks within `unsafe fn`) — see `unsafe-usage.md`
- RPIT (return-position impl Trait) lifetime capture rules — see `async.md`
- `cargo` workspace inheritance — see `tooling.md`
- `let_chains` stabilised — affects guard patterns in `concurrency.md` examples

Set `edition = "2024"` in `[package]` of `Cargo.toml` to opt in.

## Sources (cross-cutting)

Each sub-file carries its own `## Sources` section with axis-specific canonical URLs. The cross-cutting references are :

- The Rust Programming Language (book) : <https://doc.rust-lang.org/book/>
- Rust By Example : <https://doc.rust-lang.org/rust-by-example/>
- Rust API Guidelines : <https://rust-lang.github.io/api-guidelines/>
- The Cargo Book : <https://doc.rust-lang.org/cargo/>
- Clippy Lints : <https://rust-lang.github.io/rust-clippy/master/>
- Rustonomicon (Unsafe) : <https://doc.rust-lang.org/nomicon/>
- Rust 2024 Edition Guide : <https://doc.rust-lang.org/edition-guide/rust-2024/>
- Rust Performance Book (Nicholas Nethercote) : <https://nnethercote.github.io/perf-book/>
- Async Book : <https://rust-lang.github.io/async-book/>
- Rust 1.85 release notes (Feb 2025, 2024 Edition GA) : <https://blog.rust-lang.org/2025/02/20/Rust-1.85.0.html>
