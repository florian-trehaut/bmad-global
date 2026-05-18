# Stack Sub-File: Rust — Performance

**Parent stack**: `stacks/rust.md`
**Loaded by**: future `performance-review.md` protocol (when implemented) or referenced by code-review when language detection includes Rust. Currently consumed inline by reviewers querying performance characteristics.

---

Rust's zero-cost abstractions, ownership model, and aggressive LLVM-driven optimizations make it natively fast — but real performance still requires deliberate craft. Allocations, locking, monomorphization choices, build profile mis-configuration, and naive idiomatic constructs (`.clone()`, `String`, boxed iterators, default `HashMap`) routinely cost 2x–10x in production workloads. This sub-file enumerates the cases reviewers must flag, the guardrails every Rust project should adopt, and the canonical tooling stack (criterion / divan / iai-callgrind for measurement; flamegraph / samply / Tracy / dhat for profiling; mold / lld / Wild for linking; sccache / rust-cache for CI). It mirrors the structure of `concurrency.md` and `null-safety.md`. Severity tags map to the BMAD review verdict ladder: BLOCKER (correctness or measurable production failure), MAJOR (significant perf cost or hidden regression), MINOR (idiomatic / micro-optimisation).

---

## Anti-patterns to flag

- **`.clone()` in hot loops** (MAJOR)
  - Detection: `grep -rn "\.clone()"` inside any function body that contains a `for`, `while`, or iterator chain marked hot via benchmark or profiler attribution (`#[inline]` callers, render/game loops, request handlers).
  - Why: `.clone()` on `String`, `Vec<T>`, or any owned type allocates and `memcpy`s. In a 60-FPS render loop or a per-request hot path, a single avoidable clone of a 1 KiB struct costs ~50–500 ns per call — multiplied by call frequency, this dominates frame time or request latency.
  - Fix: borrow with `&T`/`&str`/`&[T]`; use `Cow<'a, T>` when sometimes owned/sometimes borrowed; use `Arc<T>` / `Rc<T>` for shared ownership (clone is just a refcount bump, not a deep copy — and is explicitly recommended as cheap by the std docs). See [Rust Performance Book — Heap Allocations](https://nnethercote.github.io/perf-book/heap-allocations.html) and [Cow<T> std::borrow](https://doc.rust-lang.org/std/borrow/enum.Cow.html).

- **Unbounded `Vec::push` without capacity hint** (MINOR)
  - Detection: a `let mut v = Vec::new();` followed by a `for ... { v.push(...) }` where the loop iteration count is statically or dynamically knowable.
  - Why: `Vec` grows by doubling — each growth event reallocates and `memcpy`s the entire buffer. For a final size N, `Vec::new()` + N pushes performs ~log₂(N) reallocations totalling ~2N copies. `Vec::with_capacity(N)` performs zero reallocations.
  - Fix: `Vec::with_capacity(expected_size)` whenever the size is known or estimable. For unknown but bounded sizes, prefer a conservative over-estimate. See [Rust Performance Book — Vec](https://nnethercote.github.io/perf-book/heap-allocations.html#vec).

- **Allocating inside game loops / per-frame hot paths** (MAJOR)
  - Detection: in functions called per-frame (`update`, `render`, `tick`, system functions in ECS): any `Vec::new()`, `String::new()`, `format!()`, `Box::new()`, `HashMap::new()` — particularly inside nested loops.
  - Why: heap allocation involves a global lock in most allocators, dirties cache lines, and triggers eventual deallocation (also a syscall in some configurations). In a 60 FPS / 16.6 ms budget, even 10 µs spent in `malloc`/`free` per frame is 0.06% of frame time — multiplied across systems, this trivially destroys frame consistency.
  - Fix: pre-allocate scratch buffers in struct fields, reuse with `Vec::clear()` (preserves capacity), or use an arena allocator like `bumpalo` for per-frame allocations that are freed wholesale at frame end. See [bumpalo docs](https://docs.rs/bumpalo) and [Rust Performance Book — Heap Allocations](https://nnethercote.github.io/perf-book/heap-allocations.html).

- **`String` in performance-critical signatures** (MINOR)
  - Detection: function signature `fn foo(name: String)` or `fn bar(input: String) -> String` where the function does not need to take ownership.
  - Why: forces the caller to either clone (heap allocation) or move (loses ownership), even if the callee only reads. `&str` is zero-cost: a fat pointer (16 bytes on 64-bit) with no allocation.
  - Fix: take `&str` for read-only; return `Cow<'a, str>` when the function sometimes returns a borrowed slice and sometimes constructs a new string. See [Rust Performance Book — String](https://nnethercote.github.io/perf-book/heap-allocations.html#string).

- **`Box<dyn Trait>` where generic monomorphization is possible** (MINOR)
  - Detection: `fn foo(x: Box<dyn MyTrait>)` or struct fields typed `Box<dyn ...>` where a generic parameter `<T: MyTrait>` would compile.
  - Why: `dyn Trait` uses a vtable for dispatch — every method call is an indirect jump, defeating inlining and most LLVM optimisations. Generic `T: MyTrait` monomorphises one specialised copy per concrete type, fully inlined.
  - Fix: prefer `<T: MyTrait>` generics. Use `dyn Trait` only when (a) you need heterogeneous collections like `Vec<Box<dyn Trait>>`, (b) plugin dispatch / polymorphism is genuinely required, or (c) reducing binary size matters more than runtime speed (monomorphisation can explode `.text` size). See [rustc-dev-guide — Monomorphization](https://rustc-dev-guide.rust-lang.org/backend/monomorph.html).

- **Boxed iterators without justification** (MINOR)
  - Detection: `Box<dyn Iterator<Item = T>>` returned from a function or stored in a struct.
  - Why: iterator chains compile to inlined state machines when concretely typed; once boxed, each `.next()` call is an indirect vtable dispatch. The LLVM optimiser cannot reason across the dynamic boundary.
  - Fix: `-> impl Iterator<Item = T>` for return types (stable since Rust 1.26), or expose a concrete iterator type. Use `Box<dyn Iterator>` only for heterogeneous returns. See [Rust Performance Book — Iterators](https://nnethercote.github.io/perf-book/iterators.html).

- **Single-threaded code where Rayon parallelism is trivial** (MINOR)
  - Detection: a `for` or `iter()` chain over a `Vec`/slice doing CPU-bound independent work, with no shared mutable state.
  - Why: missed parallelism on multi-core hardware. Modern dev machines are 8–32 cores; serial code uses 1/N.
  - Fix: add the `rayon` crate, replace `.iter()` with `.par_iter()`. Rayon handles work-stealing and load-balancing transparently. Measure: parallel speedup is often near-linear for embarrassingly parallel workloads with > ~10 µs of work per item. See [Rayon docs](https://docs.rs/rayon).

- **`.collect::<Vec<_>>()` for a short-lived intermediate** (MINOR)
  - Detection: an iterator chain that collects into a `Vec`, then immediately re-iterates without using the intermediate as a collection (e.g., for `.len()`, indexing, sorting).
  - Why: forces a heap allocation purely to materialise data that flows through.
  - Fix: chain iterators directly. Iterator adapters (`.map`, `.filter`, `.flat_map`) are lazy and zero-cost. If `.len()` is needed, use `.count()` (still consumes the iterator but no allocation). See [Rust Performance Book — Iterators](https://nnethercote.github.io/perf-book/iterators.html).

- **`HashMap` default hasher (SipHash) when DoS resistance is not required** (MINOR)
  - Detection: `std::collections::HashMap<K, V>` (default `RandomState`) used in performance-critical internal data structures (e.g., compiler internals, ECS component lookups, cache implementations) where keys come from trusted sources.
  - Why: std's default SipHash-1-3 is cryptographically secure but ~3–10x slower than alternatives. For non-DoS-exposed maps, the security guarantee is wasted compute.
  - Fix: `rustc_hash::FxHashMap` (FxHash, fastest for integers and pointers — used internally by rustc) or `ahash::AHashMap` (hardware-accelerated via AES-NI, faster on strings, mild DoS resistance). For maps fronted by network input, keep `std::collections::HashMap`. Note: as of Rust 1.76+, the std hashbrown internal uses `foldhash` instead of SipHash by default in some contexts — verify your toolchain. See [Rust Performance Book — Hashing](https://nnethercote.github.io/perf-book/hashing.html), [rustc-hash](https://github.com/rust-lang/rustc-hash), [ahash](https://docs.rs/ahash).

- **Deep `.clone()` of complex graphs** (MAJOR)
  - Detection: `.clone()` on a struct containing `Vec`, `HashMap`, or other heap-owning fields, especially in event-handler / per-message paths.
  - Why: derives a deep recursive copy of every owned allocation. A `Vec<HashMap<String, Vec<u8>>>` with 1k entries can be hundreds of allocations and tens of MiB copied per clone.
  - Fix: wrap in `Arc<T>` for shared immutable data (clone = refcount++); use `Arc<Mutex<T>>` for shared mutable; use `Cow` for sometimes-owned. If the clone is genuinely needed, consider whether the data structure should be redesigned (e.g., immutable persistent data structure via `im` or `rpds` crates).

- **Synchronous file I/O / blocking syscalls in async runtimes** (MAJOR)
  - Detection: in an `async fn` or `tokio::spawn` block: `std::fs::*`, `std::net::*`, `std::process::Command::output()`, large CPU-bound loops, `std::thread::sleep`, FFI calls into blocking C libraries.
  - Why: Tokio's executor uses a small thread pool (default ~num_cpus). A single blocking call on a worker thread stalls _all_ tasks scheduled on that thread — under load, blocking calls cause cascading latency. As of Tokio 1.47+ LTS, this remains the most common Tokio bug in production.
  - Fix: `tokio::fs` for filesystem (wraps blocking I/O on `spawn_blocking` thread pool — note `tokio::fs` is ~1-2 orders of magnitude slower per-call than `std::fs`, batch reads/writes when possible via `BufReader`/`BufWriter`), `tokio::net` for networking, `tokio::task::spawn_blocking(|| { /* CPU-bound */ })` for CPU work, `tokio::process::Command` for subprocesses. Use a separate Rayon thread pool for CPU-heavy parallel work, not Tokio. See [tokio::fs](https://docs.rs/tokio/latest/tokio/fs/index.html) and Tokio issue [#3664](https://github.com/tokio-rs/tokio/issues/3664).

- **Reference counting (`Rc`/`Arc`) when ownership move suffices** (MINOR)
  - Detection: `Arc<T>` or `Rc<T>` where only one owner exists at a time and the value could be moved.
  - Why: `Arc` clone/drop is two atomic operations (CAS / fetch-add); `Rc` is two non-atomic increments. Either is wasted work if there's no sharing. Atomic operations also generate memory fences that limit reordering.
  - Fix: pass `T` by move, or `&T` by borrow. Use `Arc`/`Rc` only when shared ownership is genuinely required (e.g., callbacks, signal handlers, graph nodes).

- **`dbg!()` / `println!()` in hot paths** (MAJOR)
  - Detection: `dbg!()` calls left in code; `println!`/`eprintln!` inside loops or per-request handlers.
  - Why: both lock `stdout`/`stderr` via a global Mutex, format synchronously, and perform a syscall per write. A `println!` in a render loop trivially destroys frame consistency.
  - Fix: use `tracing` / `log` with a non-blocking subscriber (e.g., `tracing-appender` non-blocking writer). Compile out debug output in release via `tracing::trace!` filtered out by env-filter. Never commit `dbg!()` — enforce via clippy lint `clippy::dbg_macro`.

- **`format!()` in hot paths** (MINOR)
  - Detection: `format!("{}...", ...)` in any function called frequently, especially error paths used as fast paths.
  - Why: every `format!()` heap-allocates a new `String`. The formatter machinery is also non-trivial (~50–100 ns minimum).
  - Fix: pre-format and store as constants when possible; use `write!()` to an existing buffer (`&mut String` or `&mut impl Write`); for error paths, prefer enum errors with `thiserror` — defer formatting to the error display sink (the user) rather than the call site.

- **Bounds-checked indexing in tight numeric loops** (MINOR)
  - Detection: `for i in 0..arr.len() { sum += arr[i]; }` style loops over slices.
  - Why: each `arr[i]` does a bounds check; LLVM often elides these when the loop pattern is recognised, but not always — particularly with conditional access or non-monotonic indices. Bounds checks also block some vectorisation passes.
  - Fix: use `.iter()` (`for x in arr.iter() { sum += *x; }`) — no bounds check, friendlier to auto-vectorization. If profiling proves bounds checks are the bottleneck and the index is provably in-range, `unsafe { *arr.get_unchecked(i) }` removes it — but only after proof, never speculatively. See [Rust Performance Book — Bounds Checks](https://nnethercote.github.io/perf-book/bounds-checks.html).

- **Missing `#[inline]` on small cross-crate hot functions** (MINOR)
  - Detection: a small (< ~10 LoC) function in a library crate is hot in profiles but its body does not show up inline at call sites.
  - Why: by default, only generic functions are eligible for cross-crate inlining. Concrete functions stop at the crate boundary unless tagged `#[inline]`.
  - Fix: add `#[inline]` for "the compiler should consider inlining"; `#[inline(always)]` _only_ with measurement proving benefit — over-aggressive inlining can blow up `.text` and harm i-cache. See [Rust Performance Book — Inlining](https://nnethercote.github.io/perf-book/inlining.html).

- **`std::time::Instant::now()` + `elapsed` for ad-hoc microbenchmarks** (MINOR)
  - Detection: manual `let start = Instant::now(); ... start.elapsed()` in tests or in `main.rs` to "measure" performance.
  - Why: no warm-up, no statistical analysis, no outlier detection, no confidence interval. Subject to CPU frequency scaling, thermal throttling, page faults, scheduler noise. Reports a single number that is rarely meaningful.
  - Fix: criterion / divan / iai-callgrind. See "Benchmarking tooling" below.

## Required guardrails

- **`[profile.release]` configured for runtime speed.** Defaults are conservative — explicitly opt into `lto = "fat"` and `codegen-units = 1` for production binaries. See "Build profile recipes" below.
- **`[profile.bench]` inherits `release` + keeps debug symbols.** Benchmarks must use release-quality codegen but retain symbols for profilers.
- **`criterion` (or `divan`) is the standard benchmark harness — not `#[bench]`.** The nightly `#[bench]` attribute and `test::Bencher` are deprecated for stable use; criterion (v0.8.x as of May 2026) and divan (v0.1.x) are the supported choices. iai-callgrind (v0.14+) for environment-deterministic CI benchmarking.
- **`cargo build --timings` in CI.** Generates an HTML report showing per-crate compile-time. Track regressions across PRs — a 2x compile-time increase from a heavy `serde`-derived structure is a real cost.
- **`cargo bloat` on every release.** Track binary-size regressions per crate; large dependencies imported transitively (e.g., a tiny utility pulling in `regex` for one match) are visible immediately.
- **CI benchmark regression gates.** Run `cargo bench` on PRs; fail if statistically significant regression > threshold (criterion produces % diffs natively). For deterministic CI, prefer iai-callgrind — wall-clock benchmarks in containers are too noisy.
- **`sccache` or `Swatinem/rust-cache` in CI.** Without compile caching, CI builds repeat work on every push, dominating pipeline time.
- **Linker choice declared explicitly in `.cargo/config.toml`.** As of Rust 1.90 (Sept 2025), `rust-lld` ships and is the default on `x86_64-unknown-linux-gnu`. For maximum link speed on large projects, `mold` (Linux/macOS) or `Wild` (Linux, Rust-native) outperform `lld` further. Specify via `[target.x86_64-unknown-linux-gnu] linker = "clang"` + `rustflags = ["-C", "link-arg=-fuse-ld=mold"]`.
- **Profile-guided optimisation (PGO) for shipped binaries.** `cargo pgo` (community tool) automates the two-pass PGO build. Typical wins: 5–20% on dispatch-heavy workloads.

## Language-specific principles

- **Zero-cost abstractions are real but not automatic.** Iterators, generics, `Result`/`Option`, RAII guards — all designed to compile to the same code as hand-written equivalents _when the compiler can see across boundaries_. Boxing, dynamic dispatch, and crate boundaries break that property.
- **Prefer iterators over explicit indexed loops.** LLVM optimises `for x in slice.iter()` better than `for i in 0..slice.len() { slice[i] }` because the iterator API encodes the no-aliasing invariant the bounds check cannot prove.
- **`&str` over `String` in function signatures.** Callers retain ownership; callees do not allocate. Same principle: `&[T]` over `Vec<T>`.
- **`Cow<'a, T>` when sometimes owned, sometimes borrowed.** Avoids gratuitous clones in `to_lowercase`-style functions where the input is often already lowercase.
- **Monomorphization trades binary size for speed.** Generic `<T: Trait>` is faster than `dyn Trait` but generates one copy per concrete type. Heavy use can blow up `.text` (visible via `cargo bloat`) — accept this for hot code, mitigate via shared monomorphised helper functions (see Federico Mena's "Reducing binary size by removing an unnecessary generic struct" pattern).
- **Pre-allocate when size is knowable.** `Vec::with_capacity(N)`, `String::with_capacity(N)`, `HashMap::with_capacity(N)`. Free wins.
- **`#[cold]` and `#[inline(never)]` for error paths.** Tells LLVM to lay out branches with the common case in the hot i-cache line and rare-error code elsewhere.
- **`const fn` and `const` for compile-time evaluation.** Pre-compute lookup tables, constants, even moderately complex initialisation at compile time. Each `const fn` evaluation saves runtime work.
- **`repr(C)` only when FFI requires it.** Without `repr(C)`, the compiler is free to reorder struct fields for tighter packing and better cache locality. Adding `repr(C)` defensively can silently cost performance.
- **No `unsafe` for performance without benchmark proof.** "I'll use `get_unchecked` to skip bounds checks" should always come with a benchmark showing the bounds check is the bottleneck and a comment proving the safety invariant.
- **The borrow checker is a performance feature.** Exclusive `&mut` aliasing enables LLVM optimisations equivalent to C's `restrict` everywhere — automatically. Designs that fight the borrow checker also fight the optimiser.
- **Measure before optimising.** Compiler optimisations (especially with `lto = "fat"`) frequently make "obvious" micro-optimisations counter-productive. Always profile, never assume.

## Build profile recipes

The default `[profile.release]` is conservative (`opt-level = 3`, `lto = false`, `codegen-units = 16`, `panic = 'unwind'`, `strip = "none"`, `debug = false`). For production binaries, configure explicitly per [Cargo Book — Profiles](https://doc.rust-lang.org/cargo/reference/profiles.html) and [Rust Performance Book — Build Configuration](https://nnethercote.github.io/perf-book/build-configuration.html):

```toml
# Cargo.toml

# Production binaries: maximum runtime speed.
[profile.release]
opt-level = 3            # full optimisation (default for release)
lto = "fat"              # whole-program LTO across crates (~10-20% runtime gain, slower compile)
codegen-units = 1        # single codegen unit = maximum LLVM scope (slower compile, better optimisation)
panic = "abort"          # smaller binary, faster panic path; only safe if you don't catch_unwind
strip = "symbols"        # remove debug symbols from final binary (smaller, slower to debug)
debug = false            # no debug info in release (smaller)
incremental = false      # disable incremental for release (default)
overflow-checks = false  # disable integer overflow checks (default for release)

# Benchmarks: release codegen + symbols for profilers.
[profile.bench]
inherits = "release"
debug = true             # keep symbols so flamegraph / samply / perf can resolve names
strip = "none"           # do not strip — profilers need symbols

# Dev mode: fast compile of your code, fast deps.
[profile.dev]
opt-level = 1                       # basic optimisations, much faster than -O0 dev defaults
debug = "line-tables-only"          # smaller debug info, faster link
split-debuginfo = "unpacked"        # store debug info separately for faster builds

# Dev mode: optimise dependencies fully (compiled once, fast to run).
[profile.dev.package."*"]
opt-level = 3                       # deps in dev mode get full optimisation
debug = false                       # no debug info for deps in dev

# Release-with-debug: profiling / production crash dumps.
[profile.release-with-debug]
inherits = "release"
debug = true
strip = "none"
```

For binary-size optimisation (embedded, WASM, distribution):

```toml
[profile.release]
opt-level = "z"          # optimise for size (over speed)
lto = "fat"
codegen-units = 1
panic = "abort"
strip = "symbols"
```

`cargo build --release --timings` produces `target/cargo-timings/cargo-timing.html` — a per-crate Gantt chart of compile time. Use to identify bottleneck dependencies.

## Benchmarking tooling

- **[criterion](https://docs.rs/criterion/) (v0.8.x as of May 2026) — the de-facto standard.** Statistics-driven micro-benchmarking: warms up, samples 100x, performs outlier detection, builds 95% confidence intervals, detects regressions vs the previous run, emits HTML reports with plots. Industry default — supports stable Rust, integrates with `cargo bench`. Active maintenance (bheisler/criterion.rs). Supports the last three stable Rust minor releases.
- **[cargo-criterion](https://crates.io/crates/cargo-criterion) — official CLI frontend.** Provides nicer interactive output, machine-readable result formats, history tracking.
- **[divan](https://github.com/nvzqz/divan) — newer, ergonomic alternative.** Simpler API than criterion (`#[divan::bench]`), built-in generic-function benchmarking, allocation measurement, sample-size scaling for CI noise reduction. Author Nikolai Vázquez. Active development; ~1k GitHub stars; in use by ~800 projects (as of 2026).
- **[iai-callgrind](https://docs.rs/iai-callgrind) (v0.14+) — instruction-count benchmarking for deterministic CI.** Wraps Valgrind's Callgrind / Cachegrind / DHAT. Reports CPU instructions executed (deterministic across runs, immune to noisy environments — perfect for CI gating). Slower per-run than criterion (Valgrind overhead). Recommended _in addition to_ criterion: criterion for wall-clock on dev machines, iai-callgrind for regression gating in CI. Supports multi-threaded and multi-process applications since 0.14.
- **[bencher.dev](https://bencher.dev) — continuous benchmarking platform.** Supports criterion, divan, iai-callgrind. Useful for tracking benchmark history across commits.
- **Anti-pattern: hand-rolled `Instant::now() + elapsed`.** Always use criterion or divan for any benchmark whose result will influence a decision. See [Rust Performance Book — Benchmarking](https://nnethercote.github.io/perf-book/benchmarking.html).
- **Anti-pattern: `#[bench]` + `test::Bencher`.** Nightly-only, deprecated for stable use, no statistics, no warm-up. Migrate to criterion or divan.
- **Use `std::hint::black_box(...)` to defeat optimisations in benchmarks.** Without it, the compiler may constant-fold the entire benchmark body. Available on stable since Rust 1.66 (Dec 2022). See [std::hint::black_box](https://doc.rust-lang.org/std/hint/fn.black_box.html). Limitations: best-effort only — never rely on `black_box` for correctness, only for benchmark fidelity.

## Profiling tooling

- **[cargo-flamegraph](https://github.com/flamegraph-rs/flamegraph) — the entry-level profiler.** Wraps `perf` on Linux, DTrace on macOS/FreeBSD/NetBSD. Generates interactive SVG flame graphs from a single command (`cargo flamegraph`). The standard recommendation in 2026 for "I want to know where my Rust binary spends time." Requires the binary to be built with `debug = true` symbols (use `[profile.release-with-debug]` or `[profile.bench]`).
- **[samply](https://github.com/mstange/samply) — cross-platform sampling profiler.** Written in Rust by Markus Stange (Mozilla). Cross-platform (macOS, Linux, Windows). On macOS uses `dtrace`; on Linux uses `perf`; on Windows uses ETW. Produces Firefox-Profiler-compatible output with interactive timeline, call tree, flame graph. As of 2026, samply is increasingly the recommended cross-platform choice over cargo-flamegraph for new projects.
- **[perf](https://perf.wiki.kernel.org/) (Linux) — low-level kernel-CPU profiler.** Hardware-counter-aware (cycles, cache-misses, branch-mispredicts, IPC). Use when flame graphs aren't enough — e.g., diagnosing cache locality or branch prediction issues. Requires `perf_event_paranoid` tuning on most distros.
- **[Tracy](https://github.com/wolfpld/tracy) + [tracing-tracy](https://docs.rs/tracing-tracy) — real-time profiler, ideal for games / live applications.** Nanosecond-precision timeline; instrument with `tracing` spans, attach the Tracy desktop client over TCP. Profiles GPU (OpenGL, Vulkan, D3D11/12, Metal, OpenCL, CUDA), memory allocations, locks, context switches. Frame markers correlate timeline with game frames. Industry standard for game profiling. Slight runtime overhead — ship with feature flag, not enabled in production.
- **[dhat-rs](https://github.com/nnethercote/dhat-rs) — heap profiler.** Rust-native, runs in-process without Valgrind. Tracks every allocation, reports peak memory, allocation hot spots, lifetime distribution. Supports allocation testing (`assert!(stats.total_blocks <= 100)` in unit tests). Maintained by Nicholas Nethercote (author of the Rust Performance Book and rustc memory work).
- **[Valgrind / DHAT / Cachegrind / Callgrind](https://valgrind.org) — heavyweight, deterministic.** Run binary under emulation (10–50x slowdown), report exact memory access patterns, instruction counts, cache misses. Linux-only. Use for one-off deep dives, not routine profiling.
- **[heaptrack](https://github.com/KDE/heaptrack) — Linux heap profiler with interactive GUI.** Lower overhead than Valgrind/DHAT; tracks allocations over time with a Qt-based viewer.
- **[Instruments](https://help.apple.com/instruments/) (macOS) — Apple's native profiler.** CPU sampling, allocations, leaks, system trace. Works on Rust binaries with debug symbols (`debug = true` in profile).
- **[Visual Studio Profiler / WPA](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/) (Windows) — ETW-based profiler.** Works on Rust binaries with `.pdb` debug info.
- **[pprof-rs](https://github.com/tikv/pprof-rs) — in-process sampling profiler.** Useful when external profilers cannot be attached (containers, embedded, production with strict deploy constraints). Emits flamegraph or pprof-format output.
- **`cargo-bloat`** — not a profiler in the runtime sense, but `cargo bloat --release --crates` is essential for understanding which dependency contributes how much to binary size. Run on every release.
- **`tracing` instrumentation** — instrument hot paths with `#[tracing::instrument]`; attach a sampling subscriber (e.g., `tracing-tracy`, `tracing-flame`, OpenTelemetry exporter) to get distributed-trace-quality data without an external profiler.

See [Rust Performance Book — Profiling](https://nnethercote.github.io/perf-book/profiling.html) for the canonical comparison matrix.

## Optimization patterns

Concrete patterns — apply only with profile evidence. Anchor references in the Rust Performance Book.

- **Reduce allocations.** Pre-allocate (`with_capacity`), reuse (`Vec::clear` preserves capacity), pool (e.g., `object-pool` crate), arena-allocate (`bumpalo` for short-lived batched allocations — drop the `Bump` once, frees everything; ideal for compilers, parsers, per-frame game allocations). See [Rust Performance Book — Heap Allocations](https://nnethercote.github.io/perf-book/heap-allocations.html).

- **Intern strings.** Interning replaces repeated `String` allocations with cheap-to-clone handles. Crates: `string_cache`, `lasso`, `internment`. Worth it when the same strings recur across data (e.g., identifiers in a compiler, tags in an ECS).

- **Reduce indirection.** Prefer `Vec` over `LinkedList` (cache-friendly contiguous memory); `&` over `Box` for ephemeral data; avoid `Box<dyn Trait>` when generics work. Each pointer-chase is a potential cache miss (~10–100 ns).

- **Cache locality: Struct of Arrays (SoA) over Array of Structs (AoS).** When you iterate primarily over one field of a struct, separate that field into its own contiguous `Vec`. Examples: ECS component storage, columnar data. Crates: `soa-derive`, `soa_derive`, hand-rolled. Trade-off: more code, harder to refactor. Justify with profile.

- **Avoid bounds checks where proven safe.** `iter()` over indexed access removes most. `unsafe { *slice.get_unchecked(i) }` removes the rest — but only with a comment proving safety, and only with measurement showing the elimination matters. Bounds-check elimination is also blocked by certain control flow patterns; see [Rust Performance Book — Bounds Checks](https://nnethercote.github.io/perf-book/bounds-checks.html).

- **Inline annotations with care.**
  - `#[inline]` — hint to consider inlining across crate boundaries. Default for small generic functions.
  - `#[inline(always)]` — force inlining. Use only with measurement; aggressive use harms i-cache.
  - `#[inline(never)]` — prevent inlining. Useful for cold error paths to keep them out of the hot text segment.
  - `#[cold]` — annotation that the function is rarely called; tells LLVM to lay out branches favorably.
    See [Rust Performance Book — Inlining](https://nnethercote.github.io/perf-book/inlining.html).

- **Const-evaluate at compile time.** `const` over `let` for compile-time-knowable values; `const fn` for compile-time-knowable functions. Move work from runtime to build time. The 2024 edition (Rust 1.85, Feb 2025) stabilised more `const fn` use cases (`std::mem::size_of_val`, `std::mem::swap` in `const`, etc.).

- **Cold-path hints.** `#[cold]` on error-handling functions, `std::hint::cold_path()` / `std::hint::likely()` / `std::hint::unlikely()` (status varies — `likely`/`unlikely` are nightly; `cold_path` stabilised in newer versions, verify your toolchain). Allows the optimiser to lay out the common path linearly and branch out of line for the rare path.

- **`std::hint::black_box`** to defeat optimisations in benchmarks. Stable since Rust 1.66. Wrap inputs and outputs in benchmark functions to prevent the compiler from constant-folding them away.

- **`std::hint::unreachable_unchecked`** — declare that a code path is statically unreachable. Allows the optimiser to assume it. Unsafe — UB if actually reached. Document the proof in a comment.

- **Vectorisation.** Auto-vectorisation requires: aligned data, iterator-friendly loops, no early breaks, predictable control flow. Check with `cargo asm` (or godbolt.org) whether LLVM emitted SIMD instructions. For hand-rolled SIMD:
  - **Stable**: `std::arch::x86_64::*`, `std::arch::aarch64::*` (target-specific intrinsics, unsafe, low-level).
  - **Nightly**: `std::simd` (portable SIMD, ergonomic). Still unstable as of May 2026 — pin nightly version if used. See [std::simd docs](https://doc.rust-lang.org/std/simd/index.html) and [portable-simd repo](https://github.com/rust-lang/portable-simd).
  - **Stable on-stable alternatives**: `wide` crate (portable SIMD on stable), `pulp` crate (used internally by `faer`, built-in target multiversioning).
  - **High-level math**: `glam` (game/graphics linear algebra, SSE2/NEON/wasm SIMD); `ndarray` (n-dimensional arrays, BLAS-backed); `faer` (high-perf linear algebra, dense matrices, SIMD-accelerated).

- **Generic over types vs. dyn dispatch.** Monomorphisation = zero-cost dispatch, larger binary. `dyn Trait` = vtable indirection, smaller binary. Hot paths: generics. Plugin/heterogeneous collections: `dyn`. Combine via "shared monomorphisation": small generic wrapper that calls a non-generic inner function with `&dyn` arguments. See Federico Mena's [Reducing code size by removing an unnecessary generic struct](https://viruta.org/reducing-binary-size-generics.html).

- **Profile-guided optimisation (PGO).** Two-pass build: instrument, run on representative workload, recompile using collected profile data. Typical wins 5–20% on dispatch-heavy code. Automated via `cargo-pgo`. See [Rust Performance Book — PGO](https://nnethercote.github.io/perf-book/build-configuration.html#profile-guided-optimization).

- **Linker choice.**
  - **GNU ld** — default historical, slowest.
  - **lld** (LLVM's linker, bundled with rust-lld since Rust 1.90) — ~7x faster than ld on incremental rebuilds, ~40% end-to-end compile-time reduction on projects like ripgrep. Default on `x86_64-unknown-linux-gnu` since Rust 1.90.
  - **mold** — 3–5x faster than lld for large projects, max parallelism. Higher RAM usage. No incremental linking (intentional). Linux + macOS (mold/sold).
  - **Wild** (v0.8 as of Jan 2026) — Rust-native, very fast, targets incremental linking long-term. Linux-only currently. Worth tracking; consider for very large projects.
    Configure via `.cargo/config.toml`:

  ```toml
  [target.x86_64-unknown-linux-gnu]
  rustflags = ["-C", "link-arg=-fuse-ld=mold"]
  ```

- **Compile cache.**
  - **sccache** (Mozilla) — wraps rustc, caches per-crate compilation. Supports local + remote (S3, GCS, GHA cache, Redis) backends. Set via `RUSTC_WRAPPER=sccache`.
  - **Swatinem/rust-cache** (GitHub Action) — Rust-aware wrapper around GitHub Actions cache. Caches `~/.cargo/registry`, `~/.cargo/git`, `target/`. Standard for Rust projects on GHA in 2026.
  - Trade-off: sccache works across CI providers and supports remote backends; rust-cache is simpler if you're GitHub-only.

- **Reduce monomorphisation cost.** Each generic instantiation = one copy in `.text`. For widely-instantiated generics over many concrete types (e.g., `serde::Deserialize`), this dominates binary size and compile time. Mitigations: shared monomorphised helpers (one non-generic inner function called by a thin generic wrapper); `#[inline]` to dedupe via LTO; `dyn Trait` where appropriate. Analyse with `cargo bloat` and `cargo llvm-lines`.

## Sources

- [The Rust Programming Language (Book)](https://doc.rust-lang.org/book/) — official language reference
- [The Rust Performance Book (nnethercote)](https://nnethercote.github.io/perf-book/) — canonical performance reference; chapters: Build Configuration, Linting, Profiling, Inlining, Hashing, Heap Allocations, Type Sizes, Standard Library Types, Iterators, Bounds Checks, I/O, Logging, Wrapper Types, Machine Code, Parallelism, General Tips, Compile Times, Benchmarking
- [The Cargo Book — Profiles](https://doc.rust-lang.org/cargo/reference/profiles.html)
- [The rustc Book — Codegen Options](https://doc.rust-lang.org/rustc/codegen-options/index.html)
- [Rust 1.85 release announcement (2024 Edition stabilisation, Feb 2025)](https://blog.rust-lang.org/2025/02/20/Rust-1.85.0/)
- [Faster linking times with 1.90.0 stable on Linux using LLD (Sept 2025)](https://blog.rust-lang.org/2025/09/01/rust-lld-on-1.90.0-stable/)
- [criterion.rs documentation](https://docs.rs/criterion/) — benchmark harness (v0.8.x)
- [criterion.rs GitHub repository](https://github.com/bheisler/criterion.rs)
- [Criterion.rs Book](https://bheisler.github.io/criterion.rs/book/)
- [divan benchmark crate](https://github.com/nvzqz/divan)
- [iai-callgrind benchmark crate](https://docs.rs/iai-callgrind) — deterministic instruction-count benchmarks
- [cargo-flamegraph](https://github.com/flamegraph-rs/flamegraph)
- [samply profiler](https://github.com/mstange/samply) — cross-platform Firefox-Profiler-compatible
- [Tracy frame profiler](https://github.com/wolfpld/tracy)
- [tracing-tracy](https://docs.rs/tracing-tracy/) — Tracy integration via tracing crate
- [dhat-rs heap profiler](https://github.com/nnethercote/dhat-rs)
- [mold linker](https://github.com/rui314/mold)
- [Wild linker](https://github.com/davidlattimore/wild) — Rust-native ELF linker, v0.8 Jan 2026
- [sccache](https://github.com/mozilla/sccache)
- [Swatinem/rust-cache](https://github.com/Swatinem/rust-cache) — GitHub Actions cache for Rust
- [cargo-bloat](https://github.com/RazrFalcon/cargo-bloat) — binary-size analyser
- [cargo-deny (Embark Studios)](https://embarkstudios.github.io/cargo-deny/) — dependency / license / advisory linting (v0.19.5+ as of May 2026)
- [ahash hasher](https://docs.rs/ahash/) — fast hardware-accelerated HashMap hasher
- [rustc-hash (FxHash)](https://github.com/rust-lang/rustc-hash) — fastest hasher for integer/pointer keys
- [hashbrown](https://github.com/rust-lang/hashbrown) — SwissTable HashMap implementation (std backend)
- [bumpalo arena allocator](https://docs.rs/bumpalo/) — bump-allocation arena
- [Rust portable SIMD (std::simd, nightly)](https://github.com/rust-lang/portable-simd)
- [std::hint::black_box](https://doc.rust-lang.org/std/hint/fn.black_box.html) — benchmark fence (stable since 1.66)
- [Cow<T> in std::borrow](https://doc.rust-lang.org/std/borrow/enum.Cow.html)
- [rustc-dev-guide — Monomorphization](https://rustc-dev-guide.rust-lang.org/backend/monomorph.html)
- [Tokio runtime (v1.47 LTS as of May 2026)](https://docs.rs/tokio/) — async runtime, see `concurrency.md` for concurrency-focused issues
- [tokio::fs documentation](https://docs.rs/tokio/latest/tokio/fs/index.html) — async filesystem wrapper
- [Federico Mena — Reducing code size by removing an unnecessary generic struct](https://viruta.org/reducing-binary-size-generics.html)
- [johnthagen/min-sized-rust](https://github.com/johnthagen/min-sized-rust) — canonical binary-size minimisation guide
- [Rayon — data parallelism](https://docs.rs/rayon/) — work-stealing parallel iterators
