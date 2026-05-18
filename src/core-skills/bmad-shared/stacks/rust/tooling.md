# Stack Sub-File: Rust — Tooling

**Parent stack**: `stacks/rust.md`
**Loaded by**: reviewers (CI / dev-workflow / cross-platform queries), `bmad-create-story`, `bmad-dev-story`, `bmad-review-story`, `bmad-validation-*` when the project's tech-stack section includes `rust` AND the task touches CI configuration, dependency hygiene, build performance, editor integration, or documentation production.

Tooling decisions are runtime-shaping: the wrong linker doubles compile time, a missing `cargo deny` lets a yanked crate ship to prod, an absent `rust-toolchain.toml` means CI and dev disagree about edition. This file is the canonical checklist a reviewer applies when the diff touches `Cargo.toml`, `.cargo/`, `.github/workflows/`, `rust-toolchain.toml`, `rustfmt.toml`, `clippy.toml`, `deny.toml`, or any other tooling-adjacent artifact.

---

## Toolchain management

### Anti-patterns to flag

- **Missing `rust-toolchain.toml` in repo root** (MAJOR)
  - Detection: `ls rust-toolchain.toml rust-toolchain 2>/dev/null` returns empty AND `Cargo.toml` lacks `rust-version = "..."` field.
  - Why: CI installs `stable` and devs may have `nightly` set as default — drift is silent until a feature-gated path triggers a "feature X is unstable" error in prod, or a stable-only project accepts a nightly-only syntax that breaks the next CI run.
  - Fix: commit a `rust-toolchain.toml` with explicit channel + components + targets, e.g.

    ```toml
    [toolchain]
    channel = "1.89.0"   # or a date-pinned "stable-2026-04-10"
    components = ["clippy", "rustfmt", "rust-src"]
    targets = ["x86_64-unknown-linux-gnu", "wasm32-unknown-unknown"]
    profile = "default"
    ```

    Rustup auto-installs the pinned toolchain on first `cargo` call inside the repo.

- **Stable toolchain pinned but `#![feature(...)]` attributes in source** (BLOCKER)
  - Detection: `grep -rn "#!\[feature(" src/` returns matches AND `rust-toolchain.toml` channel is `stable` or a versioned release.
  - Why: `#![feature(...)]` only compiles on nightly. CI will fail; a downstream consumer importing the crate will fail. This is a category error — either the feature is unneeded (remove it) or nightly is required (declare it).
  - Fix: remove the feature gate if the API is now stable (`cargo check --message-format=json` will tell you), OR switch the toolchain to `nightly` in `rust-toolchain.toml` AND document the nightly requirement in `README.md`.

- **Nightly toolchain without date pin** (MAJOR)
  - Detection: `rust-toolchain.toml` contains `channel = "nightly"` without a date suffix.
  - Why: nightly is a moving target. A `cargo build` that worked yesterday may fail today because an unstable feature was removed, renamed, or gated differently. Reproducibility is gone.
  - Fix: pin to a specific nightly: `channel = "nightly-2026-04-10"`. Bump the pin in a dedicated PR; CI verifies the entire suite still builds.

- **`rust-version` in `Cargo.toml` not matched by `rust-toolchain.toml` channel** (MAJOR)
  - Detection: `Cargo.toml` has `rust-version = "1.78"` but `rust-toolchain.toml` pins `1.85` (or vice versa).
  - Why: the two fields serve different audiences (rust-version is a MSRV contract for downstream consumers; rust-toolchain.toml is the dev/CI build target). Mismatch confuses contributors and may let MSRV-incompatible syntax leak into the library.
  - Fix: keep `rust-version` ≤ `rust-toolchain.toml` channel. Enforce via `cargo msrv verify` (the `cargo-msrv` plugin) in CI.

- **Using system package manager Rust (apt/brew/dnf) instead of rustup** (MAJOR)
  - Detection: `which rustc` resolves to `/usr/bin/rustc` or `/opt/homebrew/bin/rustc` without rustup shim.
  - Why: distro packages lag the stable channel by weeks-to-months, ship without rustup multiplexing, and prevent per-repo toolchain pinning. `rust-toolchain.toml` is ignored.
  - Fix: install rustup (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`), then `rustup default stable`. Document this as a setup step.

### Required guardrails

- **`rust-toolchain.toml` MUST be committed** for any non-trivial project.
- **`Cargo.toml` MUST set `rust-version = "..."`** for any published library — it doubles as the MSRV contract.
- **Edition declaration MUST be explicit**: `edition = "2024"` (or `"2021"`/`"2018"`/`"2015"`) in every crate's `Cargo.toml` `[package]`. Cargo defaults to `2015` for legacy reasons — never rely on the default.

### Language-specific principles

- **Pin the channel; bump in a dedicated PR.** Toolchain bumps surface compiler regressions; isolate them so a bisect is meaningful.
- **Stable is the default.** Nightly is justified only by a stabilization-pending feature (rust-lang/rust tracking issue) and documented in the repo.
- **Components are part of the contract.** If your dev workflow uses `clippy`/`rustfmt`/`miri`/`rust-src`, declare them in `[toolchain].components` — `rustup` will install them automatically.

---

## Build & test acceleration

### Anti-patterns to flag

- **No build cache in CI** (MAJOR)
  - Detection: `.github/workflows/*.yml` shows `actions/checkout` + `cargo build` with no `Swatinem/rust-cache` step (or equivalent).
  - Why: every CI run rebuilds the entire dependency graph from scratch. A 500-dep workspace can spend 5-10 minutes on dependencies that haven't changed. Wall-clock CI time, $$$, and contributor patience all suffer.
  - Fix: add `Swatinem/rust-cache@v2` before the first cargo invocation. It scopes the cache to `Cargo.lock` hash, restores `~/.cargo` and `./target`, and sets `CARGO_INCREMENTAL=0` automatically. Typical gain: 3-10x on warm cache.

- **`sccache` configured locally but not in CI** (MINOR — missed acceleration)
  - Detection: dev `~/.cargo/config.toml` sets `[build] rustc-wrapper = "sccache"` but `.github/workflows/` doesn't.
  - Why: CI is where build time hurts most — every PR pays the full cost. `sccache` with a shared S3/GCS/Azure backend gives compile-output reuse across runs and across branches.
  - Fix: add `mozilla-actions/sccache-action@v0.0.6` in CI, set `SCCACHE_GHA_ENABLED=true` (GitHub Actions cache backend, free) or `SCCACHE_BUCKET=...` for S3. Set `RUSTC_WRAPPER=sccache` env. Cache hit rate ≥ 70% on stable branches.

- **`CARGO_INCREMENTAL=1` in CI** (MINOR)
  - Detection: workflow env sets `CARGO_INCREMENTAL=1` OR uses `cargo build` without rust-cache (which sets it to 0 automatically).
  - Why: incremental compilation writes large intermediate artifacts to `./target/debug/incremental/`. In CI, every run starts from a (possibly stale) cache, so the incremental artifacts are wasted disk space and occasionally cause spurious miscompilation failures.
  - Fix: set `CARGO_INCREMENTAL=0` in CI explicitly (rust-cache does this for you). Keep `CARGO_INCREMENTAL=1` (the dev default) on developer machines.

- **Default `ld` linker on Linux for large workspaces** (MINOR)
  - Detection: `.cargo/config.toml` does not specify a `linker = ...` for `[target.x86_64-unknown-linux-gnu]` AND the workspace has > 50 crates or > 10s link time.
  - Why: GNU `ld` is the slowest mainstream linker. On large workspaces, link time dominates rebuild time. Reviewers should flag missed opportunity even though correctness is not at risk.
  - Fix: pick one:
    - `mold` (Linux, fastest mainstream): install via OS package or `cargo install --git https://github.com/rui314/mold`, then `[target.x86_64-unknown-linux-gnu] linker = "clang"` + `rustflags = ["-C", "link-arg=-fuse-ld=mold"]`. Typically 5-10x faster than `ld`.
    - `lld` (LLVM, cross-platform): `rustflags = ["-C", "link-arg=-fuse-ld=lld"]`. 2-5x faster than `ld`.
    - `wild` (Linux only, x86_64, written in Rust): the newest entrant — v0.8.0 (January 2026) benchmarks at ~2x mold on rustc-driver / clang links. Still pre-1.0; no LTO support, no incremental linking yet. Adopt only when build time is a serious constraint AND debug-info is not required.
  - Fast-build profile `[profile.dev]` benefits most; `[profile.release]` LTO often blocks linker-choice gains.

- **Using `cargo test` instead of `cargo nextest` for large suites** (MINOR — missed acceleration)
  - Detection: CI uses `cargo test` AND test count > ~50 OR suite wall-clock > 30s.
  - Why: `cargo test` uses a single test binary per crate and runs tests as threads. `cargo-nextest` uses a process-per-test model with cores-aware scheduling, retry-on-failure, better TTY output, and partition support for sharding across CI runners. Typical speedup: 1.5-3x; up to 3x on heavily-IO-bound suites.
  - Fix: install (`cargo install cargo-nextest --locked`), invoke via `cargo nextest run --all-features --workspace`. Latest stable as of May 2026: v0.9.135. Nextest does NOT run doc tests — keep a separate `cargo test --doc` step in CI.

- **`cargo install` of build-time tools without `--locked`** (MAJOR)
  - Detection: CI step `cargo install cargo-nextest` (no `--locked`).
  - Why: without `--locked`, cargo ignores the tool's `Cargo.lock` and resolves dependencies fresh — pulling whatever's latest on crates.io. This is non-reproducible and exposes you to supply-chain risk on transitive deps of build tooling.
  - Fix: always pass `--locked`: `cargo install cargo-nextest --locked --version 0.9.135`. Pin the tool version in CI.

### Required guardrails

- **`Swatinem/rust-cache@v2` (or equivalent) MUST be the first step after checkout in CI.**
- **`CARGO_INCREMENTAL=0` MUST be set in CI** (rust-cache handles this; verify if rolling your own cache).
- **`cargo build --timings`** MUST be available for diagnosing slow workspace builds. The generated `target/cargo-timings/cargo-timing.html` shows per-crate compile time and parallelism bottlenecks — review when a CI run jumps >30% wall-clock.

### Language-specific principles

- **Build time IS a feature.** Every minute saved in CI compounds across every contributor.
- **Cache aggressively, invalidate precisely.** `rust-cache` keys on `Cargo.lock` hash, which is the right granularity. Don't add manual cache layers that bypass this contract.
- **Profile before optimizing.** `cargo build --timings` first — don't reach for `mold` or `sccache` blindly. The bottleneck might be a single fat dependency.

---

## Lints & format

### Anti-patterns to flag

- **CI missing `cargo clippy -- -D warnings`** (BLOCKER)
  - Detection: `.github/workflows/*.yml` has no `cargo clippy` step OR runs it without `-D warnings` (warnings don't fail CI).
  - Why: without `-D warnings`, clippy is advisory — devs see the squiggle in their editor and ignore it. Issues accumulate. Eventually a `BLOCKER` lint (`clippy::await_holding_lock`, `clippy::let_underscore_drop`) lands in `main`.
  - Fix:

    ```yaml
    - run: cargo clippy --all-targets --all-features -- -D warnings
    ```

    Add `--no-deps` if dependency lints are noisy (rare for well-maintained deps).

- **`#[allow(clippy::xyz)]` without justifying comment** (MINOR)
  - Detection: `grep -rn "#\[allow(clippy::" src/` — each hit must have a comment on the same line or the line above explaining WHY.
  - Why: `#[allow]` is a license to ignore the lint. Without a justification, the next maintainer cannot tell if the allow is still justified or has become a bug-in-waiting.
  - Fix: every `#[allow(clippy::...)]` MUST be accompanied by a one-line comment: `#[allow(clippy::too_many_arguments)] // public API, breaking change to refactor`.

- **Missing `rustfmt.toml` for non-trivial project** (MINOR)
  - Detection: `ls rustfmt.toml .rustfmt.toml 2>/dev/null` returns empty.
  - Why: defaults change across rustfmt versions. Without an explicit config, two contributors on different rustfmt minor versions may produce diff-only formatting churn.
  - Fix: commit a minimal `rustfmt.toml`:

    ```toml
    edition = "2024"
    tab_spaces = 4
    max_width = 100
    imports_granularity = "Crate"
    group_imports = "StdExternalCrate"
    reorder_imports = true
    ```

    Some options (`imports_granularity`, `group_imports`) require nightly rustfmt — gate behind a `cargo +nightly fmt` CI step OR move to stable-only options.

- **`cargo fmt` not run as CI gate** (MAJOR)
  - Detection: workflow has no `cargo fmt --all --check` step.
  - Why: formatting drift is cheap to introduce and noisy to fix — diffs become mostly whitespace. The gate prevents this at PR time.
  - Fix: `- run: cargo fmt --all --check` as a CI step. Make it the first check (it's the fastest); fail fast on formatting issues.

- **MSRV declared but `clippy.toml` doesn't set `msrv`** (MINOR)
  - Detection: `Cargo.toml` has `rust-version = "1.78"` AND `clippy.toml` (or per-crate equivalent) lacks `msrv = "1.78"`.
  - Why: without `msrv` in clippy config, lints that suggest newer syntax (e.g., `manual_let_else` suggests `let-else` introduced in 1.65) will fire even on codebases targeting older Rust. False positives, then dev frustration, then `#[allow]` everywhere.
  - Fix: align `clippy.toml` with `Cargo.toml`:

    ```toml
    msrv = "1.78"
    ```

  - Alternatively use the `#[clippy::msrv]` attribute on the crate root.

- **Enabling `clippy::pedantic` or `clippy::restriction` group-wide** (MAJOR)
  - Detection: `lib.rs` / `main.rs` has `#![warn(clippy::pedantic)]` or `#![warn(clippy::restriction)]` (the latter is explicitly anti-recommended).
  - Why: `pedantic` is opinionated and creates churn on legitimate code. `restriction` is explicitly NOT meant to be enabled wholesale — its lints contradict each other and target perfectly reasonable code. The clippy book is clear: `restriction` is a menu, not a category-level allow.
  - Fix: enable selective lints, not groups. Example:

    ```rust
    #![warn(
      clippy::all,
      clippy::correctness,
      clippy::suspicious,
      clippy::perf,
      // selective pedantic lints, NOT the whole group:
      clippy::missing_const_for_fn,
      clippy::needless_pass_by_value,
    )]
    ```

### Required guardrails

- **CI MUST run `cargo fmt --check` AND `cargo clippy --all-targets --all-features -- -D warnings`** as gates.
- **`clippy.toml` `msrv` MUST match `Cargo.toml` `rust-version`** when both are set.
- **Selective `#[allow]`s MUST have inline justification comments.**

### Language-specific principles

- **Clippy is the second compiler.** Treat its warnings with the same gravity as `rustc` errors — fix or `#[allow]` deliberately, never ignore.
- **Format on save, format in CI.** No middle ground. Format wars are paid in wasted review cycles.
- **The lint groups are a menu, not a policy.** Pick lints individually; document the reasoning if non-obvious.

---

## Code coverage

### Anti-patterns to flag

- **`cargo-tarpaulin` chosen for new projects** (MINOR — choose llvm-cov instead)
  - Detection: `Cargo.toml` dev-dependencies or CI uses `cargo tarpaulin`.
  - Why: tarpaulin is Linux-only (gcov-based), produces less accurate region/branch coverage than llvm-cov, and is in a slower release cadence. The community has converged on llvm-cov for cross-platform projects.
  - Fix: migrate to `cargo-llvm-cov` (taiki-e). It's LLVM source-based instrumentation, supports macOS/Linux/Windows, works with `cargo test` and `cargo nextest run`, and emits LCOV / JSON / Cobertura XML / HTML. Latest stable as of May 2026: v0.8.5 (released 2026-03-20).

- **Coverage report not uploaded in CI** (MINOR — missed signal)
  - Detection: CI runs `cargo llvm-cov` but produces no artifact / upload step.
  - Why: coverage you can't trend is coverage you can't act on. A single number on a PR is more useful than no number at all.
  - Fix: upload to Codecov, Coveralls, or a Sonar instance:

    ```yaml
    - run: cargo llvm-cov --all-features --workspace --lcov --output-path lcov.info
    - uses: codecov/codecov-action@v4
      with:
        files: lcov.info
        fail_ci_if_error: false
    ```

- **Coverage threshold gate without local-test parity** (MINOR)
  - Detection: CI fails on coverage drop but devs cannot reproduce the number locally.
  - Why: developer frustration; the "fix coverage" PR becomes a guessing game.
  - Fix: document the exact local command (`cargo llvm-cov --all-features --workspace --html` then open `target/llvm-cov/html/index.html`). Match the CI invocation byte-for-byte.

### Required guardrails

- **`cargo-llvm-cov` is the default choice** for new projects.
- **Coverage reports MUST be uploaded as CI artifacts** even if a third-party service is not used — devs can download and inspect.
- **Coverage is signal, not contract.** Don't enforce a hard threshold unless the team agrees — flaky thresholds become tech debt.

### Language-specific principles

- **Coverage measures what was executed, not what was tested.** A line touched by an integration test that never asserts is "covered" but unverified.
- **Branch coverage > line coverage** when chasing real correctness. `cargo-llvm-cov --branch` (currently nightly-only) gives the deeper signal.
- **Doc tests are tests.** `cargo llvm-cov --doctests` includes them in the report.

---

## Dependency hygiene

### Anti-patterns to flag

- **No `cargo deny check` in CI** (MAJOR)
  - Detection: `.github/workflows/*.yml` does not invoke `cargo deny` or equivalent.
  - Why: without a license/advisory gate, a GPL-3.0 dependency can land in a proprietary project (legal liability); a yanked / vuln-flagged crate stays in `Cargo.lock` because nobody noticed.
  - Fix: add `cargo deny check` to CI:

    ```yaml
    - uses: EmbarkStudios/cargo-deny-action@v1
      with:
        command: check
    ```

    Commit a `deny.toml` with explicit license allowlist (e.g., `["MIT", "Apache-2.0", "BSD-3-Clause", "ISC", "Unicode-DFS-2016"]`), advisories config, and ban-duplicate-versions if your binary size matters.

- **No `cargo audit` in CI** (MAJOR)
  - Detection: CI has neither `cargo audit` nor `cargo deny check advisories`.
  - Why: RustSec publishes ~30-50 advisories per quarter. Without a scheduled scan, transitive vulns linger. `cargo audit` is the canonical interface to the RustSec advisory database (curated by the Rust Secure Code working group).
  - Fix: pick one (NOT both — they overlap):
    - `cargo deny check advisories` (preferred if you already have `cargo deny` for licenses/bans).
    - `cargo audit --deny warnings` as a standalone step + a daily/weekly cron workflow.
  - Run on every PR AND on a schedule (advisories drop between PRs).

- **Unused dependencies in `Cargo.toml`** (MINOR)
  - Detection: `cargo machete` reports unused deps.
  - Why: bloated dependency graph slows compiles, expands attack surface, and obscures the real intent of the crate.
  - Fix: install (`cargo install cargo-machete --locked`), run periodically (or in CI), remove false-flagged deps only after verifying they're not behind a `cfg` gate or feature flag (`cargo machete` flagged 8 unused deps in dbsurveyor March 2026 — a manual review caught 2 false positives behind feature gates).

- **`Cargo.lock` not committed for binary crates** (BLOCKER)
  - Detection: `Cargo.lock` is in `.gitignore` AND the crate type includes `bin` (or workspace contains a binary member).
  - Why: without `Cargo.lock`, `cargo build` on a new machine resolves dependencies fresh — different versions than what was tested. Reproducible builds are gone. CVE-vulnerable transitive versions can land in deployed artifacts despite a "fixed" lockfile in CI.
  - Fix: commit `Cargo.lock`. Use `cargo build --locked` in CI to fail if the lockfile is out of sync with `Cargo.toml`.

- **`Cargo.lock` not committed for library crates** (MINOR — debated, now leans commit)
  - Detection: pure library crate (`[lib]` only, no `[[bin]]`) without `Cargo.lock`.
  - Why: the Cargo team revised guidance in August 2023 — committing `Cargo.lock` is now encouraged even for libraries because it benefits dev/test reproducibility, makes `git bisect` reliable, and pins CI to a known-good resolution. Downstream consumers still get their own resolution (they ignore the library's lockfile).
  - Fix: commit `Cargo.lock`. Adjust CI to use `--locked` for the library's own tests AND `--no-default-features` / `--all-features` matrix tests with both `--locked` and a refresh-then-test job.

- **`cargo install` for project dependencies** (MAJOR — wrong tool)
  - Detection: README says "install foo via `cargo install foo`" then the project `use`s `foo` in source.
  - Why: `cargo install` is for installing binaries to `~/.cargo/bin`, not for declaring library deps. The project will not compile on any machine that hasn't run the install.
  - Fix: add to `Cargo.toml` `[dependencies]` (runtime) or `[dev-dependencies]` (tests/examples).

- **Workspace members with independent `Cargo.lock` files** (MAJOR)
  - Detection: nested `Cargo.lock` inside a workspace member directory.
  - Why: a workspace has exactly ONE `Cargo.lock` at the workspace root — that's what guarantees consistent dependency versions across members. A nested lockfile is ignored AND confusing.
  - Fix: delete nested lockfiles; add to `.gitignore`. Verify with `find . -name Cargo.lock -not -path ./Cargo.lock`.

### Required guardrails

- **`cargo deny check` (or equivalent license + advisory gate) MUST run in CI on every PR.**
- **`Cargo.lock` MUST be committed** for binaries; MUST be committed for libraries unless the team has documented a contrary policy.
- **CI MUST use `--locked`** to detect drift between `Cargo.toml` and `Cargo.lock`.
- **`deny.toml` MUST declare an explicit license allowlist** (no `"*"` wildcards).

### Language-specific principles

- **Every dependency is a supply-chain risk.** Audit on add, monitor on schedule, vendor when paranoid.
- **`Cargo.lock` is reproducibility.** Treat it like source code: review the diff in PRs; flag suspicious version bumps.
- **License is non-negotiable.** GPL/AGPL inside proprietary = legal incident. `cargo deny` enforces this mechanically.

---

## CI patterns

### Anti-patterns to flag

- **Single-OS / single-channel build matrix for cross-platform crates** (MAJOR)
  - Detection: crate declares cross-platform support (in README or `Cargo.toml` `targets`) but CI runs only on `ubuntu-latest` with `stable`.
  - Why: Windows path handling, macOS `dyld` linking, target-specific `cfg` blocks — none of these are exercised. A "supports Windows" claim that's never tested in CI is a claim that will break.
  - Fix: matrix on OS × channel:

    ```yaml
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        channel: [stable, beta]
    ```

    Add `nightly` as `continue-on-error: true` for early-warning.

- **No `cargo doc --no-deps` in CI** (MINOR — broken docs lurk)
  - Detection: workflow lacks a doc-build step.
  - Why: broken doc links (`[`MyType`]` to a renamed type) compile fine but produce broken HTML on docs.rs. Users find the broken link after publish.
  - Fix: add `RUSTDOCFLAGS="-D warnings" cargo doc --no-deps --all-features` as a CI step. Catches `broken_intra_doc_links` and `missing_docs` at PR time.

- **CI not pinned to action `@version` (uses `@main`)** (MAJOR)
  - Detection: `actions/checkout@main` or `Swatinem/rust-cache@main` instead of `@v4` / `@v2`.
  - Why: action behavior changes; a `main`-pinned action can break the build overnight without a commit on your side. Worse, it's a supply-chain vector — a compromised action update silently runs in your CI.
  - Fix: pin to a SHA or tagged version. For high-trust orgs, tags (`@v4`) are acceptable. For maximum hygiene, pin to full commit SHA: `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`.

- **No paths-filter for monorepo / mixed-language repo** (MINOR)
  - Detection: full Rust CI runs on every PR even when only `docs/` or `frontend/` changed.
  - Why: wasted CI minutes, slower iteration on non-Rust changes.
  - Fix: use `dorny/paths-filter@v3` or GitHub's native `on.push.paths` to gate Rust jobs on Rust-affecting paths (`**/*.rs`, `Cargo.toml`, `Cargo.lock`, `.cargo/`, `rust-toolchain.toml`).

- **CI script that swallows errors with `|| true`** (BLOCKER)
  - Detection: `cargo test || true` (any cargo command followed by `|| true`).
  - Why: the gate exists to fail on regression. Swallowing the exit code makes the gate ceremonial — a green check that means nothing.
  - Fix: remove the swallow. If the command is allowed to fail (e.g., experimental nightly job), use `continue-on-error: true` on the step, NOT shell-level error suppression. `continue-on-error` makes the step visible as "failed but non-blocking" in the PR UI.

### Required guardrails

- **CI MUST run in this order (fail-fast on the cheap checks first)**:
  1. `cargo fmt --all --check` (fast)
  2. `cargo clippy --all-targets --all-features -- -D warnings`
  3. `cargo build --all-features --workspace`
  4. `cargo nextest run --all-features --workspace` (or `cargo test`)
  5. `cargo test --doc --all-features --workspace` (doc tests, NOT covered by nextest)
  6. `RUSTDOCFLAGS="-D warnings" cargo doc --no-deps --all-features`
  7. `cargo deny check` (or `cargo audit`)
  8. (Optional) `cargo llvm-cov` with artifact upload
- **Matrix MUST cover declared support targets** — at minimum, the OS/channel combinations the README promises.

### Language-specific principles

- **The CI matrix IS the support contract.** What's not tested isn't supported.
- **Fail fast, fail informative.** Order steps cheapest-first; surface the first failure prominently.
- **CI green ≠ production-correct.** It means "the gates we built passed." Add gates as bugs ship.

---

## Profiling & benchmarking tooling

For methodology, methodology-failure-modes, and full benchmarking technique, cross-reference `stacks/rust/performance.md` (when present). This section covers tooling-level guardrails only.

### Anti-patterns to flag

- **`#[bench]` (libtest) for new benchmarks** (MINOR — choose `criterion` instead)
  - Detection: `#[bench]` attribute in source (requires nightly).
  - Why: libtest's `#[bench]` is unstable, nightly-only, and provides minimal statistical analysis. `criterion` is stable, gives bootstrapped confidence intervals, generates HTML reports, and tracks regressions across runs.
  - Fix: replace with `criterion` (`[dev-dependencies] criterion = "0.5"`); place benchmarks in `benches/*.rs`; run via `cargo bench`.

- **Production binary built with `--release` lacks debug symbols when profiling** (MAJOR — misleading flamegraphs)
  - Detection: profiling output (flamegraph, samply, Tracy) shows mostly `???` or low-information symbols.
  - Why: default `--release` strips debug info; profiler can't resolve frames.
  - Fix: enable debug info in release profile while profiling:

    ```toml
    [profile.release]
    debug = "limited"   # or 1 (line tables) or 2 (full) when profiling
    ```

    Or use a dedicated `[profile.bench]` / `[profile.release-with-debug]` custom profile and `cargo build --profile release-with-debug`.

### Required guardrails

- **`criterion`** is the default benchmark crate. Latest stable as of May 2026: `0.5.x`.
- **`cargo flamegraph`** (Linux/macOS; uses `perf` / `dtrace`) for CPU profiling.
- **`samply`** for cross-platform CPU profiling (firefox-profiler UI).
- **`tracing-tracy`** for real-time live profiling (Tracy client).
- **`dhat-rs`** for heap profiling (alternative: `bytehound`, `heaptrack`).
- **`miri`** for UB detection in `unsafe` code paths (cross-references `stacks/rust/concurrency.md` — guardrails section).

### Language-specific principles

- **Benchmark in release mode, with debug info.** `--release` without `debug=...` produces fast-but-unprofileable binaries.
- **Statistical significance > "the number went down."** `criterion` reports p-values; respect them.
- **Profile real workloads, not microbenchmarks.** `cargo bench` is for hot paths you've already identified, not for finding them.

---

## Editor / IDE support

### Anti-patterns to flag

- **No documented editor setup in `README.md` / `CONTRIBUTING.md`** (MINOR)
  - Detection: `grep -i "rust-analyzer\|vscode\|nvim\|editor" README.md CONTRIBUTING.md` returns empty.
  - Why: new contributors fight editor setup before they can run a test. A 10-line "Editor setup" section eliminates dozens of "how do I run tests" questions.
  - Fix: document the canonical path: VS Code + rust-analyzer extension OR Neovim + rustaceanvim OR Helix + native rust-analyzer. Mention `rust-toolchain.toml` will auto-install the right rust-analyzer version.

- **`.vscode/settings.json` committed with personal absolute paths** (MAJOR)
  - Detection: `grep -rn "/Users/\|/home/\|C:\\\\Users" .vscode/`.
  - Why: another contributor's checkout uses your username path; rust-analyzer fails to start, formatter points to a nonexistent binary, etc.
  - Fix: scrub absolute paths. Use workspace-relative paths or environment-variable references. If a team-wide `.vscode/settings.json` is helpful, commit ONLY the truly portable settings (e.g., `"rust-analyzer.check.command": "clippy"`).

### Required guardrails

- **rust-analyzer is the canonical LSP.** VS Code, Neovim (rustaceanvim or rust-tools.nvim), Helix (native), Emacs (lsp-mode), Sublime Text (LSP package), Zed (native) — all consume rust-analyzer.
- **`.vscode/extensions.json`** (when committed) MAY recommend `rust-lang.rust-analyzer` AND `tamasfe.even-better-toml` (TOML support).
- **`rust-toolchain.toml` MUST include `rust-src` in components** if rust-analyzer cross-crate navigation is desired (it's not the default; without it, "go to definition" into stdlib fails).

### Language-specific principles

- **rust-analyzer is non-optional.** No mainstream Rust workflow uses raw rustc errors anymore. Inline type hints catch entire classes of bugs before save.
- **Editor config is contributor onboarding.** Document it explicitly.

---

## Documentation tooling

### Anti-patterns to flag

- **Public crate without `#![warn(missing_docs)]`** (MINOR)
  - Detection: published-to-crates.io crate; `lib.rs` lacks `#![warn(missing_docs)]` or `#![deny(missing_docs)]`.
  - Why: undocumented public items ship to docs.rs as empty pages. Discoverability drops; new users can't tell what a function does without reading source.
  - Fix: add `#![warn(missing_docs)]` (warn lets internal-only types compile during refactor; switch to `deny` for v1.0). Also add `#![warn(rustdoc::broken_intra_doc_links)]` and `#![warn(rustdoc::missing_crate_level_docs)]`.

- **`cargo doc` not run in CI** (MINOR)
  - Detection: see CI patterns above — `cargo doc --no-deps` is missing.
  - Why: broken intra-doc links and missing crate-level docs compile but produce broken HTML.
  - Fix: `RUSTDOCFLAGS="-D warnings" cargo doc --no-deps --all-features` as a CI gate.

- **No doc tests for non-trivial public functions** (MINOR)
  - Detection: public function with `///` documentation that lacks a `# Examples` section.
  - Why: doc tests are both documentation AND executable verification — they prove the example compiles AND runs. A docs-only example may drift from API.
  - Fix: add `# Examples` section with a triple-backtick rust block:

    ```rust
    /// Compute the area of a circle.
    ///
    /// # Examples
    ///
    /// ```
    /// let area = my_crate::circle_area(2.0);
    /// assert!((area - 12.566).abs() < 0.001);
    /// ```
    pub fn circle_area(radius: f64) -> f64 { /* ... */ }
    ```

    Run via `cargo test --doc`. Use `no_run` / `ignore` annotations sparingly when the example has external dependencies (file I/O, network).

- **mdBook docs not built in CI** (MINOR — when present)
  - Detection: `book.toml` exists at repo root or in `docs/` but no CI step runs `mdbook build`.
  - Why: broken `[link](target)` references in the book go undetected until a reader finds them.
  - Fix: add `mdbook build` (and `mdbook test` to verify embedded Rust snippets compile) as a CI step.

### Required guardrails

- **Public crates MUST have `#![warn(missing_docs)]`** as a minimum.
- **`#![warn(rustdoc::broken_intra_doc_links)]`** MUST be enabled.
- **`cargo test --doc`** MUST run in CI (nextest does NOT cover doc tests).
- **`cargo doc --no-deps`** with `-D warnings` MUST run in CI.

### Language-specific principles

- **Doc tests are the contract.** They prove the documentation matches reality.
- **`cargo doc` output IS user-facing.** Treat broken links the way you'd treat a runtime panic.
- **mdBook for tutorials, rustdoc for APIs.** Don't mix — rustdoc is for reference, mdBook for narrative.

---

## Anti-patterns to flag (cross-cutting summary)

For severity-by-severity quick triage:

**BLOCKER** (CI must fail; refusal to merge):

- `#![feature(...)]` on stable toolchain (toolchain management)
- CI swallows errors via `|| true` (CI patterns)
- `Cargo.lock` not committed for binary crates (dependency hygiene)
- `cargo clippy -- -D warnings` missing from CI (lints & format)

**MAJOR** (PR must address before merge):

- Missing `rust-toolchain.toml` (toolchain management)
- `cargo audit` / `cargo deny check` missing from CI (dependency hygiene)
- `cargo install` for project deps (dependency hygiene)
- CI matrix doesn't cover declared OS/channel support (CI patterns)
- `cargo install` of tools without `--locked` (build acceleration)
- `cargo fmt --check` missing from CI (lints & format)
- Enabling `clippy::pedantic` / `clippy::restriction` group-wide (lints & format)
- Workspace nested `Cargo.lock` files (dependency hygiene)
- `rust-toolchain.toml` channel ≠ `Cargo.toml` rust-version (toolchain management)
- Nightly toolchain without date pin (toolchain management)
- `.vscode/settings.json` with absolute paths (editor / IDE)
- System package manager Rust instead of rustup (toolchain management)
- Profiling output without debug symbols (profiling & benchmarking)
- CI actions pinned to `@main` (CI patterns)

**MINOR** (raise in review; fix when convenient):

- No build cache in CI (build acceleration)
- `cargo-tarpaulin` for new projects (code coverage)
- `cargo-machete`-flagged unused deps (dependency hygiene)
- Missing `rustfmt.toml` (lints & format)
- `clippy::msrv` not aligned with `Cargo.toml` `rust-version` (lints & format)
- `cargo doc --no-deps` missing from CI (documentation tooling)
- `#![warn(missing_docs)]` missing on public crate (documentation tooling)
- Default `ld` linker on large Linux workspaces (build acceleration)
- `cargo test` instead of `cargo nextest` on large suites (build acceleration)
- `Cargo.lock` not committed for library crates (dependency hygiene)
- Coverage report not uploaded as CI artifact (code coverage)
- No paths-filter for mixed-language repo (CI patterns)
- No documented editor setup (editor / IDE)
- `#[allow(clippy::xyz)]` without justifying comment (lints & format)
- `CARGO_INCREMENTAL=1` in CI (build acceleration)

---

## Sources

- [rustup — The Rust toolchain installer](https://rustup.rs/)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rust 2024 Edition Guide](https://doc.rust-lang.org/edition-guide/rust-2024/index.html)
- [Announcing Rust 1.85.0 and Rust 2024 (Rust Blog, Feb 2025)](https://blog.rust-lang.org/2025/02/20/Rust-1.85.0/)
- [Cargo.toml vs Cargo.lock — The Cargo Book](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html)
- [Clippy Documentation — Lints index](https://rust-lang.github.io/rust-clippy/master/index.html)
- [Clippy Configuration (clippy.toml + MSRV)](https://doc.rust-lang.org/clippy/configuration.html)
- [rustfmt configuration](https://rust-lang.github.io/rustfmt/)
- [rust-analyzer — manual + editor setup](https://rust-analyzer.github.io/book/other_editors.html)
- [cargo-nextest — changelog (latest v0.9.135, Feb 2026)](https://nexte.st/changelog/)
- [Faster Rust Tests With cargo-nextest (JetBrains, May 2026)](https://blog.jetbrains.com/rust/2026/05/01/faster-rust-tests-with-cargo-nextest/)
- [sccache — Mozilla compile cache](https://github.com/mozilla/sccache)
- [Fast Rust Builds with sccache and GitHub Actions (Depot.dev)](https://depot.dev/blog/sccache-in-github-actions)
- [Swatinem/rust-cache — GitHub Action](https://github.com/Swatinem/rust-cache)
- [mold linker](https://github.com/rui314/mold)
- [Wild Linker 0.8.0 release notes (Jan 2026)](https://medium.com/@trivajay259/wild-0-8-a-rust-powered-linker-that-makes-big-builds-feel-small-636cca27fbca)
- [Recent lld/ELF performance improvements (MaskRay, Apr 2026)](https://maskray.me/blog/2026-04-12-recent-lld-elf-performance-improvements)
- [cargo-deny — Embark Studios](https://embarkstudios.github.io/cargo-deny/)
- [cargo-audit — RustSec](https://github.com/rustsec/rustsec/tree/main/cargo-audit)
- [RustSec Advisory Database](https://rustsec.org/)
- [cargo-machete — unused dependency detector](https://github.com/bnjbvr/cargo-machete)
- [Comparing Rust supply chain safety tools (LogRocket)](https://blog.logrocket.com/comparing-rust-supply-chain-safety-tools/)
- [Rust Security & Auditing Guide 2026 (Sherlock)](https://sherlock.xyz/post/rust-security-auditing-guide-2026)
- [cargo-llvm-cov — taiki-e (latest v0.8.5, Mar 2026)](https://github.com/taiki-e/cargo-llvm-cov)
- [Tips for Faster Rust CI Builds (corrode)](https://corrode.dev/blog/tips-for-faster-ci-builds/)
- [mdBook documentation](https://rust-lang.github.io/mdBook/)
- [Rustdoc-specific lints](https://doc.rust-lang.org/rustdoc/lints.html)
- [criterion.rs — benchmarking](https://github.com/bheisler/criterion.rs)
- [cargo-msrv — Minimum Supported Rust Version checker](https://github.com/foresterre/cargo-msrv)
- [rustaceanvim — Neovim Rust setup](https://github.com/mrcjkb/rustaceanvim)
