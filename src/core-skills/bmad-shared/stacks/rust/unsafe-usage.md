# Stack Sub-File: Rust — Unsafe Usage

**Parent stack**: `stacks/rust.md`
**Loaded by**: reviewers + FFI / soundness / performance hotspot queries.

---

`unsafe` is Rust's "manual-proof" mode: the compiler stops verifying memory safety, aliasing, and validity invariants — you must prove they hold. The keyword does NOT unlock new functionality; it unlocks five superpowers (dereference raw pointers, call `unsafe` fn, access mutable statics, implement unsafe traits, access union fields) and shifts the proof burden onto the author. Violating any documented invariant is **undefined behavior (UB)**, which the LLVM optimiser is free to assume cannot happen — making the bug arbitrarily worse than what the source code "looks like" it does.

## When `unsafe` is justified

1. **FFI** — calling C, C++, or system libraries. `extern "C"` blocks are inherently unsafe; on Rust 2024 edition `extern` blocks themselves **must be marked `unsafe extern { ... }`** (see Rust 2024 unsafe-extern guide). Individual items can be marked `safe` if the signature can be safely called.
2. **Hardware operations** — embedded register access, SIMD intrinsics (`std::arch::x86_64::*`), inline assembly (`asm!`), volatile reads/writes for memory-mapped IO.
3. **Performance hotspot with proven safe alternative inadequate** — `slice::get_unchecked()` after a bounds proof, only after `cargo bench` confirms the safe equivalent (`slice::get(i)?`) is the bottleneck. Profile before, profile after, document the delta.
4. **Lock-free data structures** — atomics with explicit memory ordering (`AtomicPtr`, `compare_exchange`), Mutex / RwLock primitives, hazard pointers, epoch-based reclamation.
5. **Self-referential structures** — when `Pin` + safe abstractions are insufficient (rare; usually `pin-project-lite` covers this).
6. **`MaybeUninit<T>` staged initialization** — performance-critical large arrays, partial buffers, in-place serialization, where zero-init would be wasted.
7. **Compiler intrinsics** — `core::intrinsics::*` (nightly only). Requires careful audit; most have stable replacements.
8. **Implementing core marker traits with internal invariants** — `unsafe impl Send/Sync for MyType` when the type contains raw pointers but the author proves thread-safety holds.
9. **Custom global allocators** — `impl GlobalAlloc` is unsafe by definition; every method has alignment + size preconditions.
10. **Type punning** — converting between bitwise-compatible types when `MaybeUninit` + `ptr::read` is more correct than `mem::transmute` (which is hard to audit).

## When `unsafe` is NOT justified

- **Silencing the borrow checker** — refactor instead. If borrow rules block your design, the design is wrong, not the compiler.
- **Avoiding `Result` / `?` propagation** — error handling is not a performance problem.
- **Performance with no measurement** — profile FIRST (`cargo bench`, `criterion`, `flamegraph`). "Faster" without a benchmark is unjustified.
- **Replicating C-style code** — redesign in idiomatic Rust (slices instead of pointer+len, owned types instead of malloc/free).
- **Working around `Send` / `Sync`** — fix the underlying threading model (channels, message passing, `Arc<Mutex<T>>`).
- **Manual memory management when `Box<T>` / `Vec<T>` / `Rc<T>` suffice** — these are zero-overhead.
- **"It's faster"** — needs verifiable benchmark proof (delta, std-dev, n-runs).
- **"I know what I'm doing"** — Miri may disagree, and Miri is the source of truth.
- **Pre-2024 `unsafe { unsafe_op() }` inside `unsafe fn`** — Rust 2024 makes `unsafe_op_in_unsafe_fn` warn-by-default; not wrapping is a lint.

## Anti-patterns to flag

- **`unsafe` block without `// SAFETY:` comment** (MAJOR)
  - Detection: `clippy::undocumented_unsafe_blocks` lint, or grep for `unsafe {` lines without a `// SAFETY` comment within 3 lines above.
  - Why: invariants are invisible to reviewers and future-you; the unsafe is unauditable.
  - Fix: add a `// SAFETY: ...` comment immediately above the block, stating which invariants hold and why.

- **`unsafe fn` exposed publicly without `# Safety` rustdoc section** (BLOCKER)
  - Detection: `clippy::missing_safety_doc` lint; grep `pub unsafe fn` and inspect doc comments.
  - Why: callers cannot uphold preconditions they don't know about — anyone calling the function correctly is by accident.
  - Fix: add `# Safety` heading to the doc comment, enumerate every precondition the caller MUST uphold, link to invariants documented elsewhere.

- **`unsafe impl Send` / `unsafe impl Sync` without invariant justification** (BLOCKER)
  - Detection: grep `unsafe impl (Send|Sync)`; check for SAFETY comment + doc explaining why thread-safety holds.
  - Why: incorrect Send/Sync causes data races, which are UB. Most uses of raw pointers should be encapsulated behind a sufficient abstraction that Send and Sync can be derived (Rustonomicon).
  - Fix: document the invariant verbatim. If you cannot articulate it, the impl is unsound — remove it and redesign.

- **Soundness leak across crate boundary** (BLOCKER)
  - Detection: a public safe API takes user input and routes it into an unsafe block without validation. Code review.
  - Why: a caller can trigger UB from purely safe code — by definition, the crate's API is unsound.
  - Fix: validate at the boundary (return `Result`, `Option`, or panic on impossible input). The public API must enforce every precondition the unsafe code assumes.

- **Raw pointer arithmetic without bounds proof** (BLOCKER)
  - Detection: `ptr.add(n)`, `ptr.offset(n)`, `ptr.wrapping_add(n)` without a comment proving `n` is in-bounds.
  - Why: UB if the result is outside the allocation (or one-past-end for `add`/`offset`).
  - Fix: prove via length check; prefer `ptr::slice_from_raw_parts` then index a `slice` (compiler-checked bounds).

- **`mem::transmute` for non-trivial type conversion** (BLOCKER unless audited)
  - Detection: grep `transmute::<`, `mem::transmute`.
  - Why: `transmute` reinterprets bytes — UB if source and target validity invariants differ (e.g., `&T` to `&MaybeUninit<T>` is unsound because safe code could then observe uninit memory).
  - Fix: prefer `MaybeUninit<T>` + `ptr::write` + `assume_init`, or `bytemuck::Pod`/`Zeroable` traits for plain-data conversions.

- **`std::ptr::read` followed by drop on same memory** (BLOCKER — double-free)
  - Detection: `ptr::read(p)` where the original `p` is still owned by `Box`/`Vec`/etc., letting drop run.
  - Why: `ptr::read` produces a duplicate ownership of `T`; both copies will run `Drop`, causing double-free.
  - Fix: `ptr::read` only when the source location will not be dropped (e.g., `ManuallyDrop` wrapper, raw allocation, after `mem::forget`).

- **`ptr::copy` on overlapping ranges without intent** (MAJOR)
  - Detection: grep `ptr::copy(`; check whether ranges can overlap.
  - Why: `ptr::copy` allows overlap (memmove semantics); `ptr::copy_nonoverlapping` is faster but UB on overlap. Wrong choice = wrong correctness or wrong performance.
  - Fix: use `ptr::copy_nonoverlapping` only when ranges provably disjoint; document the proof in SAFETY.

- **`&mut T` aliasing via raw pointers** (BLOCKER)
  - Detection: deriving two `&mut T` (or `&mut T` + `&T`) to the same memory via `*mut T`. Common in linked-list / cursor code.
  - Why: Rust enforces `&mut T` is exclusive; LLVM applies `noalias` to mut references. Aliasing UB even if "works" — optimisations may reorder, vectorise, or delete reads.
  - Fix: split via `slice::split_at_mut`, use indices instead of pointers, or wrap with `UnsafeCell` (and accept that the safe API must not expose simultaneous `&mut`).

- **Lifetime extension via `'static` cast in unsafe** (BLOCKER)
  - Detection: `transmute::<&'a T, &'static T>`, `std::mem::transmute_copy`, or unsafe `Box::leak` followed by aliasing.
  - Why: forging `'static` from a shorter lifetime allows use-after-free.
  - Fix: redesign ownership (`Arc<T>`, `Rc<T>`, `OnceCell<T>`); never lie to the borrow checker about lifetimes.

- **`unsafe fn` exposed publicly without `# Safety` rustdoc section** (BLOCKER)
  - Detection: `clippy::missing_safety_doc`.
  - Why: same as soundness leak — caller has no contract to uphold.
  - Fix: document every precondition; if there are no preconditions, the function shouldn't be `unsafe fn`.

- **Multiple unsafe operations per block** (MAJOR)
  - Detection: `clippy::multiple_unsafe_ops_per_block` lint.
  - Why: a single `unsafe { ... }` block with 5 unsafe ops can have its SAFETY comment "cover" all 5 generically — auditing each operation individually is impossible.
  - Fix: split into smaller `unsafe { ... }` blocks, each with its own SAFETY comment per operation. Pair with `clippy::undocumented_unsafe_blocks`.

- **Calling `unsafe fn` inside `unsafe fn` without inner `unsafe` block** (MAJOR — Rust 2024)
  - Detection: `unsafe_op_in_unsafe_fn` lint (warn-by-default in Rust 2024 edition, allowed-by-default pre-2024).
  - Why: the outer `unsafe fn` marker says "callers must uphold MY preconditions"; it does NOT exempt the body from per-operation auditing. Pre-2024 behaviour conflated the two.
  - Fix: even inside `unsafe fn`, wrap each unsafe op in `unsafe { ... }` with its own SAFETY comment.

- **Unjustified raw pointers in public API** (MAJOR — encapsulation broken)
  - Detection: `pub fn foo(p: *mut T)` or `pub fn bar() -> *const T`.
  - Why: callers cannot use the API without `unsafe`; the abstraction has leaked.
  - Fix: return references with lifetimes, owned types (`Box<T>`, `Vec<T>`), or wrap in a newtype enforcing invariants.

- **Conditional `unsafe`** (MAJOR — split testing surface)
  - Detection: `if cfg!(safety) { safe_path } else { unsafe { fast_path } }`.
  - Why: two code paths, two correctness proofs, two test matrices — and one is rarely exercised in CI.
  - Fix: pick one path. If the unsafe is justified, use it always (and prove it sound). If not, use the safe path always.

- **`std::mem::uninitialized` usage** (BLOCKER — deprecated, always unsound)
  - Detection: grep `mem::uninitialized`.
  - Why: producing an uninit value of any type other than `MaybeUninit<T>` is immediate UB (deprecated since Rust 1.39).
  - Fix: replace with `MaybeUninit::<T>::uninit()`, then `ptr::write` to initialize, then `.assume_init()`.

## Required guardrails

- **Every `unsafe { ... }` block carries a `// SAFETY: ...` comment** — enforced by `clippy::undocumented_unsafe_blocks`. Explain WHY each invariant holds (not "this is safe because I said so"). One SAFETY comment per unsafe operation when `clippy::multiple_unsafe_ops_per_block` is active.
- **Every `pub unsafe fn` has a `# Safety` doc section** — enforced by `clippy::missing_safety_doc`. List preconditions the caller MUST uphold.
- **`#![deny(unsafe_op_in_unsafe_fn)]` in production crates** — Rust 2024 makes this warn-by-default; deny-level promotes the warning to a hard error.
- **`#![forbid(unsafe_code)]` in pure-safe crates** — and `#![allow(unsafe_code)]` per module ONLY where unsafe is justified and reviewed.
- **`cargo +nightly miri test`** on every unsafe-touching path; run regularly (separate CI job; nightly-only — allow failures while iterating).
- **Sanitizers (asan / tsan / msan)** in a nightly CI matrix for FFI-heavy code.
- **`cargo-geiger`** to track `unsafe%` in transitive deps — flag any dependency increase.
- **`cargo-fuzz`** harness for boundary parsers (deserialization, framing, custom binary formats) that touch unsafe.
- **2+ reviewers** for any new `unsafe` block — one domain expert, one safety reviewer.
- **Audit history in commit messages** — when adding/modifying `unsafe`, the commit explains the invariant proof in the body.

Clippy lints to enable (deny-level):

```rust
#![deny(unsafe_op_in_unsafe_fn)]
#![deny(clippy::undocumented_unsafe_blocks)]
#![deny(clippy::multiple_unsafe_ops_per_block)]
#![deny(clippy::missing_safety_doc)]
#![deny(clippy::transmute_undefined_repr)]
#![deny(clippy::not_unsafe_ptr_arg_deref)]
```

## Language-specific principles

- **`unsafe` ≠ "ignore Rust rules"** — it ≠ permission, it = "manual proof required". Every UB in safe Rust is a soundness bug; every UB in unsafe Rust is YOUR responsibility.
- **~90% of unsafe is FFI** — the remaining ~10% (perf, lock-free, low-level) needs deeper audit because the safe alternative was rejected for a reason.
- **Minimize unsafe scope** — smaller `unsafe { ... }` blocks = easier audit. Don't wrap a 50-line function body in one block.
- **Document invariants verbosely** — future-you forgets why. State the precondition, the proof, the consequence of violation.
- **Encapsulate unsafe behind a safe API** — the caller of a safe API must NEVER be able to trigger UB by any input. If they can, the API is unsound — fix the crate, not the caller.
- **Test unsafe with Miri, sanitizers, AND fuzzing** — each catches different bugs. Miri = UB; sanitizers = production-like ASan/TSan; fuzzing = adversarial inputs.
- **Don't expose raw pointers in public API** — use references with lifetimes, or owned types. Public raw pointers leak `unsafe` to the caller.
- **`&mut T` is exclusive** — raw-pointer aliasing breaks this. LLVM emits `noalias` on `&mut T` parameters; violating aliasing is UB even if the code "works".
- **Pointer provenance matters** — Rust formally adopts provenance as part of the language model (RFC 3559, stabilised Rust 1.84). Use Strict Provenance APIs (`addr()`, `with_addr()`, `expose_provenance()`/`with_exposed_provenance()`) instead of integer-pointer casts.
- **Stacked Borrows / Tree Borrows define aliasing rules** — Miri enforces them. Tree Borrows (RalfJung, 2023+) is a newer, less-strict alternative; both are checking the same underlying soundness question.
- **LLVM optimisations rely on noalias / validity / provenance** — unsafe violations = UB even if a snapshot run "works". The next compiler version may reorder, vectorise, or delete code based on the assumption you violated.
- **Reviewers ALWAYS read the SAFETY comment, then verify each clause holds at the call site** — no SAFETY comment = automatic reject.

## SAFETY comment convention

The Rust API Guidelines and `clippy::undocumented_unsafe_blocks` define the convention: every unsafe block carries a `// SAFETY: ...` comment immediately above (or on the same line). The comment cites the invariants that hold and references the `# Safety` section of the called function.

Concrete example — calling `ptr::read`:

```rust
/// Reads `count` initialized `T` values starting at `ptr`.
///
/// # Safety
///
/// - `ptr` must be non-null and aligned for `T`.
/// - The memory at `ptr` must contain `count` initialized `T` values.
/// - `count * size_of::<T>()` must not exceed `isize::MAX`.
/// - No other reference (mutable or immutable) to the memory may exist
///   for the duration of this call.
pub unsafe fn read_initialized<T: Copy>(ptr: *const T, count: usize) -> Vec<T> {
    let mut out = Vec::with_capacity(count);
    for i in 0..count {
        // SAFETY: per the function's `# Safety` section:
        //   - `ptr` is non-null and aligned for `T`,
        //   - the memory holds `count` initialised `T` values (so `i < count` => initialised),
        //   - `count * size_of::<T>()` <= isize::MAX (so `ptr.add(i)` is in-bounds),
        //   - no aliasing references exist (caller-upheld).
        // Hence `ptr.add(i)` is a valid pointer to an initialised `T` we can read.
        let value = unsafe { ptr::read(ptr.add(i)) };
        out.push(value);
    }
    out
}
```

Anti-pattern — useless SAFETY:

```rust
// SAFETY: this is safe.
let x = unsafe { ptr::read(p) };
```

Useless because it states a tautology, not the proof. Reject in review.

## Common unsafe patterns

- **FFI wrapper**

  ```rust
  unsafe extern "C" {
      fn c_strlen(s: *const std::ffi::c_char) -> usize;
  }

  pub fn safe_strlen(s: &std::ffi::CStr) -> usize {
      // SAFETY: `CStr::as_ptr` returns a valid, NUL-terminated C string pointer
      // for the lifetime of `s`. `c_strlen` requires exactly that.
      unsafe { c_strlen(s.as_ptr()) }
  }
  ```

  Pre-2024: `extern "C" { ... }` was implicitly unsafe-to-import. **Rust 2024 edition requires `unsafe extern "C" { ... }`**, and individual items can be marked `safe` if the signature truly is safe to call (e.g., a pure C function with no preconditions on its inputs):

  ```rust
  unsafe extern "C" {
      pub safe fn sqrt(x: f64) -> f64;                 // callable from safe Rust
      pub unsafe fn strlen(p: *const c_char) -> usize; // requires NUL-terminated input
      pub safe static IMPORTANT_BYTES: [u8; 256];
  }
  ```

- **Slice from raw parts**

  ```rust
  // SAFETY:
  //   - `ptr` is non-null and aligned for `T`,
  //   - `len` elements of `T` are initialised at `ptr`,
  //   - the memory is valid for reads for the lifetime `'a`,
  //   - no mutable references to this memory exist during `'a`.
  let slice: &'a [T] = unsafe { std::slice::from_raw_parts(ptr, len) };
  ```

- **Box from raw**

  ```rust
  // SAFETY: `raw` was produced by `Box::into_raw` and has not been freed; ownership is transferred back.
  let boxed: Box<T> = unsafe { Box::from_raw(raw) };
  ```

- **MaybeUninit pattern** — preferred over `mem::uninitialized` (which is always UB):

  ```rust
  let mut data: MaybeUninit<[u8; 4096]> = MaybeUninit::uninit();
  // SAFETY: writing through a raw pointer to uninitialised memory of the same type.
  unsafe { ptr::write(data.as_mut_ptr(), [0u8; 4096]); }
  // SAFETY: every byte was initialised above.
  let initialized: [u8; 4096] = unsafe { data.assume_init() };
  ```

- **Custom allocator**

  ```rust
  // SAFETY: implementing GlobalAlloc requires fulfilling every Layout precondition
  // and never returning a pointer that doesn't satisfy `Layout::align`.
  unsafe impl GlobalAlloc for MyAllocator { /* ... */ }
  ```

- **Lock-free pattern**

  ```rust
  use std::sync::atomic::{AtomicPtr, Ordering};
  // Acquire-Release pairing: writer uses Release, reader uses Acquire,
  // establishing happens-before across the load/store.
  ```

- **Type punning** — use `MaybeUninit` + writes; reserve `transmute` for primitives of identical layout (e.g., `f32` ↔ `u32` bit-conversion). For plain-data conversions prefer `bytemuck::Pod` / `bytemuck::cast`.

## FFI patterns

- **`#[link(name = "...")]`** — static / dynamic linking declaration on `extern` blocks.
- **`extern "C"`** — standard C calling convention; the most common FFI ABI.
- **`extern "C-unwind"`** (stable since Rust 1.71) — for C functions that may unwind a foreign exception (C++ throw, longjmp variants). Without it, unwinding through a plain `extern "C"` boundary is UB. **Compiling with `panic=abort`** still aborts on `panic!` regardless of ABI.
- **`#[unsafe(no_mangle)]`** — in Rust 2024, `no_mangle`, `export_name`, and `link_section` are **unsafe attributes** (RFC 3325): they can cause UB without an `unsafe` block (symbol collisions, wrong section placement). Migration via `unsafe_attr_outside_unsafe` lint.
- **Null-pointer checks at the FFI boundary** — Rust references (`&T`) are never null; FFI raw pointers can be. Validate before dereferencing.
- **Lifetime translation** — C strings via `CStr` (borrowed, NUL-terminated) and `CString` (owned). C arrays via `(ptr, len)` pairs converted to `slice::from_raw_parts`.
- **Error code translation** — C `int` return → Rust `Result<T, E>` with explicit enum variants.
- **Caller-vs-callee allocation responsibility** — document who owns the buffer. Returning `*mut c_char` from Rust to C requires the C side knows whether to `free` (rare) or call back into a Rust-defined free function (common).
- **`bindgen`** — auto-generate FFI bindings from C headers: <https://github.com/rust-lang/rust-bindgen>. Configure to emit `unsafe extern` blocks (issue #3147 tracks 2024-edition compatibility).
- **`cbindgen`** — auto-generate C/C++ headers from Rust: <https://github.com/mozilla/cbindgen>.
- **`safer_ffi`** — type-safe FFI helpers, optional alternative for new code.

## Auditing unsafe with Miri

Miri (<https://github.com/rust-lang/miri>) is a Rust MIR interpreter that detects undefined behaviour in `cargo test` and example runs. It is the closest thing to a UB-checking compiler for Rust.

- **What it catches**: use-after-free, uninit reads, invalid pointer arithmetic, stacked-borrows / tree-borrows violations, single-thread data races, alignment violations, invalid char/bool/enum bit patterns, integer overflow under `-Coverflow-checks`, NULL dereferences, dangling references.
- **What it misses**: real concurrency races across multiple OS threads (only single-thread interleavings), stack overflows in production code paths, FFI calls into actual C (Miri can simulate some shims; the C side runs no checks), heisenbugs that depend on machine state.
- **Run**:

  ```bash
  cargo +nightly miri test           # run the test suite under Miri
  cargo +nightly miri run --example foo
  cargo +nightly miri setup          # one-time install of Miri sysroot
  ```

- **Speed**: 10-100× slower than native; run a focused subset in CI, full suite nightly.
- **Aliasing models**:
  - `MIRIFLAGS="-Zmiri-strict-provenance"` — stricter checks: integer-to-pointer casts disallowed (use Strict Provenance APIs instead).
  - `MIRIFLAGS="-Zmiri-tree-borrows"` — Tree Borrows model (RalfJung, 2023+), less restrictive than Stacked Borrows on legitimate patterns, still catches the same soundness bugs. Implies `-Zmiri-strict-provenance`.
  - `MIRIFLAGS="-Zmiri-symbolic-alignment-check"` — checks that pointer alignment is preserved across operations.
- **CI integration**: separate nightly job, often `continue-on-error: true` while a project iterates on legacy unsafe.
- **Coverage**: Miri only checks code paths your tests exercise. Combine with `cargo-fuzz` for adversarial inputs that exercise edge cases the test suite misses.

## Sound vs unsound code

The distinction matters more than "uses unsafe" or "doesn't":

- **Sound** — no caller, supplying any safe input, can trigger UB. The unsafe code's invariants are upheld either internally or via documented preconditions on `unsafe fn`. **The unsafe is encapsulated correctly.**
- **Unsound** — there EXISTS some sequence of safe-Rust calls that triggers UB. **This is a BUG to fix immediately**, even if no test currently demonstrates it, even if all known callers happen to avoid the path.

Audit checklist for each `unsafe` block:

1. **Inputs**: what does the surrounding safe API guarantee about the values used in this block?
2. **Invariants**: does the unsafe code maintain Rust's invariants (no aliased `&mut`, no out-of-bounds, no uninit reads, no provenance escape, no dangling pointers)?
3. **Preconditions**: if the block lives inside an `unsafe fn`, does the `# Safety` section list every precondition the caller must uphold? Are they all required for soundness?
4. **API enforcement**: if the block lives inside a safe `pub fn`, does the function validate / type-restrict every input that the unsafe relies on?
5. **Drop**: does any code path leave a value in a half-initialised state that would run `Drop` incorrectly on panic?
6. **Exception safety**: panics between two `unsafe` operations can leave invariants violated. Use `ManuallyDrop`, `mem::forget`, or `catch_unwind` to control unwinding.

Historical unsound bugs to learn from:

- **`mem::uninitialized<T>`** — deprecated; always unsound for non-`MaybeUninit<T>` types because the returned value is immediately in an invalid state.
- **`String::from_utf8_unchecked` + invalid UTF-8** — passing invalid bytes from safe Rust then operating on the resulting `String` triggers UB downstream (e.g., in `str` indexing). The function is `unsafe fn` for a reason; calling it on unvalidated bytes is the caller's fault.
- **`transmute::<&T, &MaybeUninit<T>>`** — even though `T` and `MaybeUninit<T>` are ABI-compatible, this `&mut`-version is unsound because safe code could then write uninit through the `&mut MaybeUninit<T>` and the original `&mut T` observer would read garbage.

## Sources

- [The Rustonomicon — Meet Safe and Unsafe](https://doc.rust-lang.org/nomicon/meet-safe-and-unsafe.html)
- [The Rustonomicon — FFI](https://doc.rust-lang.org/nomicon/ffi.html)
- [The Rustonomicon — Send and Sync](https://doc.rust-lang.org/nomicon/send-and-sync.html)
- [The Rust Reference — Unsafety](https://doc.rust-lang.org/reference/unsafety.html)
- [The Rust Reference — Behavior considered undefined](https://doc.rust-lang.org/reference/behavior-considered-undefined.html)
- [The Rust Reference — External blocks](https://doc.rust-lang.org/reference/items/external-blocks.html)
- [The Rust Reference — The `unsafe` keyword](https://doc.rust-lang.org/reference/unsafe-keyword.html)
- [The Rust Reference — Panic](https://doc.rust-lang.org/reference/panic.html)
- [Rust Edition Guide 2024 — Unsafe extern blocks](https://doc.rust-lang.org/edition-guide/rust-2024/unsafe-extern.html)
- [Rust Edition Guide 2024 — `unsafe_op_in_unsafe_fn` warning](https://doc.rust-lang.org/edition-guide/rust-2024/unsafe-op-in-unsafe-fn.html)
- [Rust Edition Guide 2024 — Unsafe attributes](https://doc.rust-lang.org/edition-guide/rust-2024/unsafe-attributes.html)
- [Announcing Rust 1.85.0 and Rust 2024 (Feb 2025)](https://blog.rust-lang.org/2025/02/20/Rust-1.85.0/)
- [RFC 2585 — `unsafe_op_in_unsafe_fn`](https://rust-lang.github.io/rfcs/2585-unsafe-block-in-unsafe-fn.html)
- [RFC 2945 — `C-unwind` ABI](https://rust-lang.github.io/rfcs/2945-c-unwind-abi.html)
- [RFC 3325 — Unsafe attributes](https://rust-lang.github.io/rfcs/3325-unsafe-attributes.html)
- [RFC 3484 — Unsafe extern blocks](https://rust-lang.github.io/rfcs/3484-unsafe-extern-blocks.html)
- [RFC 3559 — Rust has provenance](https://rust-lang.github.io/rfcs/3559-rust-has-provenance.html)
- [`std::ptr` — Strict Provenance and Exposed Provenance](https://doc.rust-lang.org/std/ptr/index.html)
- [`std::mem::MaybeUninit`](https://doc.rust-lang.org/std/mem/union.MaybeUninit.html)
- [`std::mem::transmute`](https://doc.rust-lang.org/std/mem/fn.transmute.html)
- [Rust API Guidelines — Predictability](https://rust-lang.github.io/api-guidelines/predictability.html)
- [Miri](https://github.com/rust-lang/miri)
- [Miri: Practical Undefined Behavior Detection for Rust (Jung et al., POPL 2026)](https://research.ralfj.de/papers/2026-popl-miri.pdf)
- [Tree Borrows — From Stacks to Trees (RalfJung)](https://www.ralfj.de/blog/2023/06/02/tree-borrows.html)
- [Unsafe Code Guidelines — Stacked Borrows (work-in-progress)](https://github.com/rust-lang/unsafe-code-guidelines)
- [Sanitizers — `rustc` book](https://doc.rust-lang.org/unstable-book/compiler-flags/sanitizer.html)
- [Clippy lint `missing_safety_doc`](https://rust-lang.github.io/rust-clippy/master/#missing_safety_doc)
- [Clippy lint `undocumented_unsafe_blocks`](https://rust-lang.github.io/rust-clippy/master/#undocumented_unsafe_blocks)
- [Clippy lint `multiple_unsafe_ops_per_block`](https://rust-lang.github.io/rust-clippy/master/#multiple_unsafe_ops_per_block)
- [Clippy lint `not_unsafe_ptr_arg_deref`](https://rust-lang.github.io/rust-clippy/master/#not_unsafe_ptr_arg_deref)
- [Clippy lint `transmute_undefined_repr`](https://rust-lang.github.io/rust-clippy/master/#transmute_undefined_repr)
- [`bindgen` — generate Rust FFI bindings from C](https://github.com/rust-lang/rust-bindgen)
- [`cbindgen` — generate C/C++ headers from Rust](https://github.com/mozilla/cbindgen)
- [`cargo-geiger` — track unsafe usage in deps](https://github.com/geiger-rs/cargo-geiger)
- [`cargo-fuzz` — fuzz Rust crates with libFuzzer](https://github.com/rust-fuzz/cargo-fuzz)
- [Rust Fuzz Book](https://rust-fuzz.github.io/book/)
- [Sherlock — Rust Security & Auditing Guide 2026](https://sherlock.xyz/post/rust-security-auditing-guide-2026)
- [Targeted Fuzzing for Unsafe Rust Code (arXiv, 2025)](https://arxiv.org/html/2505.02464v1)
- [Learn Rust the Dangerous Way (Cliff Biffle)](https://cliffle.com/p/dangerust/)
- [Ralf Jung's blog — UB / Stacked Borrows / Tree Borrows research](https://www.ralfj.de/blog/)
