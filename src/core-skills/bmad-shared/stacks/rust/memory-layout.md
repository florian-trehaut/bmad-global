# Stack Sub-File: Rust — Memory Layout & Safety

**Parent stack**: `stacks/rust.md`
**Loaded by**: reviewers + FFI / performance / unsafe-related queries.

---

Rust's safety guarantees end at the `unsafe` keyword and at the FFI boundary. Inside an `unsafe` block, the programmer signs a contract with the compiler: the listed invariants WILL hold, the compiler is FREE to optimize as if they do, and any violation is Undefined Behavior (UB) — not a controlled panic, not a recoverable error, but unbounded compiler liberties that can manifest as silent miscompilation, security vulnerabilities, or platform-specific crashes that disappear under debugger. This sub-file enumerates the failure modes worth flagging in review, the guardrails that catch them mechanically, and the layout primitives required to write correct unsafe code in 2026.

## Anti-patterns to flag

- **`unsafe` block without `// SAFETY:` justification** (MAJOR)
  - Detection: any `unsafe { ... }` or `unsafe fn` whose preceding line is not a `// SAFETY:` comment enumerating the invariants the caller relies on. Clippy lint: `clippy::undocumented_unsafe_blocks` and `clippy::missing_safety_doc`.
  - Why: an `unsafe` block is a contract between the writer and the compiler; without the contract written down, the next reviewer cannot verify it. The Rust standard library MANDATES `// SAFETY:` comments on every internal `unsafe` block, and the `unsafe-code-guidelines` recommend the same for crate code.
  - Fix: above each `unsafe` block write `// SAFETY: <invariant 1>; <invariant 2>; ...` enumerating what makes the operation sound. Example: `// SAFETY: ptr was returned from Box::into_raw above, has not been freed, and is not aliased.`

- **`mem::transmute` outside FFI/serialization with documented bit-pattern guarantees** (BLOCKER)
  - Detection: `mem::transmute::<A, B>(x)` calls; clippy lint `clippy::transmute_*` family.
  - Why: `transmute` reinterprets bits with NO type check beyond size. Transmuting `&T` to `&mut T` is UB; transmuting `Vec<T>` to `Vec<U>` is UB (the allocator metadata differs); transmuting a pointer to a non-pointer type loses provenance and is UB. The Rustonomicon describes `transmute` as "incredibly unsafe" with "a vast number of ways to cause UB".
  - Fix: prefer `*const T as *const U` for pointer casts, `<T as TryFrom<U>>::try_from` for fallible conversions, `bytemuck::cast` for proven-safe POD reinterpretations (compile-time checked), or `safe-transmute` for verified layouts. Use `mem::transmute` only when the byte layout is part of an FFI ABI contract documented in the function header.

- **`repr(C)` missing on FFI-exchanged struct** (MAJOR)
  - Detection: any `struct` or `enum` whose type appears in an `extern "C"` function signature or is passed through `bindgen`/cbindgen, without `#[repr(C)]`.
  - Why: the default Rust representation (`repr(Rust)`) authorizes the compiler to reorder fields for cache locality or alignment, insert arbitrary padding, and choose any niche-based enum layout. There is NO stable ABI guarantee. C code reading the struct gets garbage.
  - Fix: `#[repr(C)]` for predictable C-compatible layout; `#[repr(transparent)]` for single-field newtype wrappers passed by-value through FFI; `#[repr(u8)]`/`#[repr(i32)]` for C-style enums where the tag size matters.

- **Self-referential struct without `Pin` / `PhantomPinned`** (BLOCKER)
  - Detection: a struct whose field is a raw pointer or reference to another field of the same struct, and the struct is movable (no `Pin` wrapper, no `PhantomPinned` opt-out).
  - Why: when the struct moves, the internal pointer is invalidated, but the field still points to the old address — every dereference is UB (use-after-free, dangling pointer). The Rust compiler treats moves as bitwise copies and does NOT update internal pointers.
  - Fix: wrap construction in `Box::pin(...)` and access fields through `Pin<&mut Self>` projections (manual or via the `pin-project` crate). Add `_pin: PhantomPinned` to opt out of `Unpin` so the compiler refuses to move the value.

- **`Pin<T>` misuse — assuming `Unpin` on a `!Unpin` type** (MAJOR)
  - Detection: calls to `Pin::get_mut`, `pin.as_mut().get_mut()`, or `mem::swap` on a `Pin<&mut T>` where `T: !Unpin`.
  - Why: `Pin::get_mut` requires `T: Unpin`; if `T` is `!Unpin` (most commonly an async block future or a self-referential struct) you must use `unsafe { Pin::get_unchecked_mut }` and uphold the invariant that the value never moves again. Calling `mem::swap` on a `!Unpin` value is UB.
  - Fix: never call `get_unchecked_mut` outside a documented `// SAFETY:` block. Use `pin-project` for safe field projections; the macro generates the unsafe code with audited invariants.

- **Double-free via manual `ptr::read` then `Drop`** (BLOCKER)
  - Detection: `let owned = ptr::read(src);` followed by the same location being read or dropped again; or `Box::from_raw(p)` on a pointer that another `Box` already owns.
  - Why: `ptr::read` performs a bitwise copy and DOES NOT prevent the original location from running its `Drop`. If `T: !Copy` and `Drop`, both the copy and the original will be dropped, producing a double-free.
  - Fix: pair `ptr::read` with `mem::forget(src)` or `ptr::write` of a forgotten replacement; better, use `mem::replace`/`mem::take`. For boxed pointers, ensure exactly one `Box::from_raw` per `Box::into_raw`.

- **`Arc<RefCell<T>>` shared across threads** (BLOCKER)
  - Detection: an `Arc<RefCell<T>>` field that is `Send`-bounded or transferred via `tokio::spawn` / `thread::spawn`.
  - Why: `RefCell<T>` is `!Sync` because its borrow counter is non-atomic. Sharing one `RefCell` across threads is a data race on the counter — instant UB. The compiler usually catches this (because `Arc<RefCell<T>>` is `!Send`), but `unsafe impl Send` silences it dangerously.
  - Fix: `Arc<Mutex<T>>` for thread-shared mutable state; `Arc<RwLock<T>>` if reads dominate; `Rc<RefCell<T>>` only for SINGLE-thread reference graphs.

- **`Box::leak` / `Vec::leak` without `'static` justification** (MINOR)
  - Detection: `Box::leak(b)`, `Vec::leak(v)`, or `String::leak(s)` calls outside `main` initialization, lazy_static, or one-shot globals.
  - Why: leaks the allocation forever. Acceptable for `'static` references (lazy globals, ahead-of-time arenas) but a smell elsewhere — accumulates RSS until the process dies.
  - Fix: `Box::into_raw` if you intend to reclaim later; `OnceLock<Box<T>>` for lazy globals; `Arc<T>` if multiple owners suffice.

- **`Box<T>` for small `Copy` values** (MINOR)
  - Detection: `Box<u8>`, `Box<u32>`, `Box<bool>`, `Box<(i32, i32)>` — heap allocations for stack-friendly data.
  - Why: each `Box::new(x)` is a malloc; pointer-chasing destroys cache locality; useless overhead for values ≤ word size.
  - Fix: pass by value or by `&T`; the compiler already keeps small `Copy` types in registers.

- **`String` for compile-time constant text** (MINOR)
  - Detection: `let s = String::from("hello");` or `"hello".to_string()` for keys, error variants, or labels that never mutate.
  - Why: heap allocation + copy on every construction; `&'static str` is zero-cost.
  - Fix: `const NAME: &str = "hello";`, or `&'static str` field types. Reach for `String` only when you need owned, mutable, or runtime-built text.

- **`Vec::clear()` retaining unbounded capacity** (MINOR)
  - Detection: a long-lived `Vec<T>` that receives bursts, then `.clear()` resets length but capacity grows monotonically.
  - Why: capacity is never shrunk; memory grows to the largest burst size and stays there.
  - Fix: `vec.shrink_to(reasonable_cap)` after `clear()`, or replace with `mem::take(&mut vec)` + drop, or use a bounded ring buffer (`VecDeque` with capped capacity).

- **FFI allocator mismatch — Rust-allocated freed by C `free`, or vice versa** (BLOCKER)
  - Detection: pointer returned from `Box::into_raw` / `Vec::into_raw_parts` passed to a C function that calls `free()`; or pointer from C `malloc` reconstructed via `Box::from_raw`.
  - Why: Rust's default allocator and the C library's allocator may differ (Rust uses the system allocator on most platforms but is NOT required to). Mixing them is UB; the heap free-list metadata corrupts.
  - Fix: free Rust allocations on the Rust side (`Box::from_raw` + drop), free C allocations on the C side (`free`). Expose paired `xxx_new` / `xxx_free` symbols across the FFI boundary; never let the other side allocate-or-free directly.

- **`mem::zeroed()` on types with non-zero invariants** (BLOCKER)
  - Detection: `mem::zeroed::<T>()` where `T` is `&T`, `&mut T`, `Box<T>`, `NonZeroU32`, `NonNull<T>`, `bool` (in some patterns), `char`, or an enum without an all-zero variant.
  - Why: zero-initializing a reference is INSTANT UB even if never used. The Rust Reference: "having an invalid value of any type is undefined behavior". Zero is not a valid bit-pattern for these types.
  - Fix: `MaybeUninit::<T>::zeroed()` if you must work with the zero bit pattern; `MaybeUninit::<T>::uninit()` for general uninit storage; never `mem::zeroed::<T>()` on types with restricted validity. Note: `mem::uninitialized` is DEPRECATED — always `MaybeUninit` since Rust 1.36.

- **`MaybeUninit<T>::assume_init()` before fully writing every field** (BLOCKER)
  - Detection: `let m = MaybeUninit::<T>::uninit(); ...; m.assume_init();` without writes covering every byte of `T`.
  - Why: reads uninitialized memory as `T`. UB regardless of whether the field is later used. Optimizer may eliminate the entire surrounding code on the assumption that uninit reads cannot happen.
  - Fix: write every field via `ptr::write`/`MaybeUninit::write` BEFORE `assume_init`. Use `MaybeUninit::write_slice` or `MaybeUninit::fill` for arrays. For partial init, expose `&[MaybeUninit<T>]` slices instead.

- **Field reordering assumed without `repr(C)`** (MAJOR)
  - Detection: code that reads a struct's fields via offset arithmetic (`std::mem::offset_of!`, raw pointer arithmetic) without `#[repr(C)]`.
  - Why: `repr(Rust)` allows the compiler to reorder fields for alignment (largest-first packing) and version-to-version may change. Offsets are NOT stable.
  - Fix: `#[repr(C)]` (predictable C order) or use `std::mem::offset_of!(StructName, field)` (Rust 1.77+ stable) which is computed at compile time.

- **Padding bytes leaked across FFI / serialization** (MINOR — but security-sensitive)
  - Detection: `#[repr(C)] struct S { a: u8, b: u64 }` (7 bytes of padding between `a` and `b`) sent verbatim via `write_all(slice::from_raw_parts(&s as *const _ as *const u8, size_of::<S>()))`.
  - Why: the padding bytes are uninitialised memory readable by the recipient, may leak prior heap contents (passwords, keys). The Linux kernel's `INFOLEAK` CVE class.
  - Fix: zero the padding (`MaybeUninit::<S>::zeroed()`, then write fields), or use a packed layout (`#[repr(C, packed)]` — but beware unaligned access UB), or use a serialization library (`bincode`, `postcard`, `bytemuck::Zeroable`) that handles padding.

- **`repr(packed)` accessed without `read_unaligned` / `write_unaligned`** (MAJOR)
  - Detection: `#[repr(packed)] struct P { a: u32 }` with direct field access `&p.a` or `p.a` on architectures requiring alignment.
  - Why: taking a reference to a packed field produces an unaligned reference, which is UB on every architecture (ARM <v8 traps; x86 silently slow but still UB by Rust's model). Rust 1.78+ rejects this with a hard error.
  - Fix: `unsafe { ptr::read_unaligned(addr_of!(p.a)) }` for reads, `ptr::write_unaligned` for writes; or avoid `repr(packed)` entirely — use explicit byte arrays + manual encoding.

## Required guardrails

- **`cargo +nightly miri test`** on any crate or module containing `unsafe`. Miri interprets Rust's mid-level IR and catches use-after-free, uninitialised reads, invalid pointer arithmetic, aliasing violations (Stacked Borrows / Tree Borrows), and integer-from-pointer casts. Run in CI as a nightly job; expect 10-100x slowdown vs native.
- **`MIRIFLAGS="-Zmiri-strict-provenance"`** for the strictest pointer-provenance checks (catches `usize` round-trips that hide pointer-tag info).
- **`MIRIFLAGS="-Zmiri-tree-borrows"`** to opt into Tree Borrows (54% fewer false positives than the legacy Stacked Borrows, PLDI 2025 Distinguished Paper) — recommended for crates using interior-mutability or raw-pointer chains where Stacked Borrows is too restrictive.
- **`RUSTFLAGS="-Zsanitizer=address"` (AddressSanitizer)** for buffer overflows, use-after-free, double-free, leak detection. Nightly only.
- **`RUSTFLAGS="-Zsanitizer=thread"` (ThreadSanitizer)** for data races on unsafe concurrency code. Nightly only.
- **`RUSTFLAGS="-Zsanitizer=memory"` (MemorySanitizer)** for reads of uninitialised memory. Nightly only.
- **`RUSTFLAGS="-Zsanitizer=hwaddress"` (HWASan)** on aarch64 — same coverage as ASan with ~2x slowdown instead of ~10x.
- **`cargo +nightly careful test`** runs the standard library with debug assertions enabled, plus extra runtime checks (catches bugs the release stdlib silently allows). Optional `-Zcareful-sanitizer` flag combines with ASan.
- **`#[repr(C)]`** on every FFI-exchanged struct/enum. Verified manually + by `bindgen --opaque-type` for non-C-compatible types.
- **`#[repr(transparent)]`** for newtype wrappers passed by-value through FFI (e.g., `struct FileDescriptor(c_int)`).
- **`#![forbid(unsafe_code)]`** at the crate root for any crate that has no business writing unsafe. Allows audit at the dependency level — `cargo geiger` reports the unsafe footprint per crate.
- **`#![deny(clippy::undocumented_unsafe_blocks)]`** and `#![deny(clippy::multiple_unsafe_ops_per_block)]` to force `// SAFETY:` comments and one-unsafe-op-per-block discipline.
- **Bounded indexing** — `slice.get(i)?` instead of `slice[i]` on untrusted input (cross-ref `null-safety.md`).
- **Periodic `valgrind --tool=memcheck`** or `heaptrack` runs (Linux primary) for leak hunting in long-running services; complement to sanitizers, which require nightly.
- **`cargo geiger`** to count unsafe lines in the dependency graph; flag any dep with disproportionate unsafe relative to its scope.

## Language-specific principles

- **Default to safe Rust; `unsafe` is the last resort with an audit trail.** Every `unsafe` block must justify why the safe alternative is insufficient (performance measured, FFI mandated, no safe API exists). "I felt like it" is not a reason.
- **Comment every `unsafe` block with invariants.** Format: `// SAFETY: <what makes this sound>`. The reviewer's job is to verify the comment matches reality; the absence of a comment is a review block.
- **Prefer `&T` / `&mut T` over `*const T` / `*mut T`.** Raw pointers have no aliasing rules, no lifetime, no automatic drop; references give you all three. Use raw pointers only when the lifetime/aliasing rules genuinely don't apply (FFI, intrusive structures, manual memory management).
- **`Pin` is for self-references, not for general "don't move this".** Outside async (compiler-generated state machines) and intrusive collections, you rarely need `Pin`. Reach for `Box` first; `Pin` only when the value MUST not move and there's an internal pointer that would dangle.
- **`Cell<T>` for `Copy` types interior mutability (zero runtime cost).** Use for counters, flags, small POD interior mutability within a single thread.
- **`RefCell<T>` for runtime-borrow-checked interior mutability (panics on conflict).** Same single-thread restriction. Use only when the compile-time borrow checker is too coarse; expect a panic if the discipline slips.
- **`Mutex<T>` / `RwLock<T>` for cross-thread interior mutability.** `parking_lot::Mutex` is faster than `std::sync::Mutex` on contention; `tokio::sync::Mutex` only when held across `.await` (cross-ref `concurrency.md`).
- **`Arc<T>` for cross-thread shared ownership.** Atomic refcount; pays the atomic-op overhead on every clone/drop. Use sparingly.
- **`Rc<T>` for single-thread shared ownership.** Non-atomic refcount; cheaper than `Arc<T>`. Use within a single thread's data graphs.
- **`Cow<'a, T>` for "sometimes owned" patterns.** Configuration values, parsed strings that USUALLY borrow from input but OCCASIONALLY need to allocate (escaped characters, normalisation). Cheaper than `String` everywhere; cheaper than `&str` plus separate fallback.
- **`Box<T>` is rare in idiomatic Rust.** Most heap allocation is hidden inside `Vec<T>`, `String`, `HashMap<K, V>`, `Arc<T>`. Reach for `Box<T>` for trait objects (`Box<dyn Trait>`), recursive types, or genuinely-heap-only data (large struct that won't fit on stack).
- **`mem::forget` skips `Drop` — think before using.** Memory is leaked, file descriptors stay open, locks stay held. Legitimate uses: `ManuallyDrop` for FFI ownership transfer, `forget` to suppress double-free after raw pointer transfer. Otherwise it's a bug.
- **Drop order is LIFO within a struct (fields top-to-bottom in declaration order, drop in reverse).** Matters when fields have explicit `Drop` impls with ordering dependencies (e.g., child handle dropped before parent).
- **The default Rust layout is NOT stable across compiler versions.** Two consecutive `rustc` releases may reorder fields. `repr(C)` is the ONLY layout guarantee for cross-version, cross-platform, or cross-language code.
- **Niche optimization is a compiler reward for honest types.** `Option<NonZeroU32>` has the same size as `u32`; `Option<&T>` has the same size as `&T`; `Option<Box<T>>` has the same size as `Box<T>`. The compiler exploits the invalid bit-pattern (0) of the inner type as the `None` tag — but ONLY if you let the compiler choose the layout (`repr(Rust)`).

## Struct layout & repr attributes

Rust's type layout system is documented in the Rust Reference (Type Layout chapter) and the Rustonomicon (Data Layout / Other Reprs chapters). Five representation modes are stable in 2026:

### `repr(Rust)` — the default

- Field order: **compiler-decided**. The compiler may sort fields by alignment (largest-first) to minimize padding, or by frequency-of-access if profile-guided.
- Padding: inserted between fields to satisfy alignment requirements of each field's type.
- Size: at least the sum of field sizes; usually larger due to padding; at most rounded up to the struct's alignment.
- Alignment: max of field alignments (or higher if `#[repr(align(N))]`).
- ABI: **unstable across compiler versions**. NEVER pass `repr(Rust)` structs through FFI, serialize them via `transmute`-to-bytes, or assume their offsets.
- Niche optimization: ENABLED. Compiler may use invalid bit patterns of fields (`NonZero`, references, `bool`) to fold the discriminant of enclosing enums into the data, producing `Option<T>` same-size-as-`T` when `T` has a niche.

### `#[repr(C)]` — C-compatible layout

- Field order: **declaration order, no reordering**.
- Padding: inserted to satisfy each field's natural alignment, identical to `struct` in C.
- Size: identical to the equivalent C struct on the same target ABI (System V on Linux/macOS x86_64, Windows x64 ABI, etc.).
- Alignment: max of field alignments.
- ABI: **stable** as long as the target ABI doesn't change. Safe for FFI, serialization, memory-mapping.
- Niche optimization: DISABLED for top-level enum tags (cannot omit the tag byte). Field-level niches inside the struct still apply.
- Use cases: every struct exchanged through `extern "C"`, any struct whose byte layout is part of a file format or network protocol.

### `#[repr(transparent)]` — newtype passthrough

- Constraint: exactly ONE non-zero-sized field (other fields must be `()`, `PhantomData`, or zero-sized).
- Layout: byte-identical to the single inner field.
- ABI: identical to the inner type — `struct Fd(c_int)` is passed in registers exactly like `c_int`.
- Use cases: typed wrappers (`Fd`, `Handle`, `UserId(u64)`), FFI handle types, unit-of-measure newtypes.
- Cannot combine with `#[repr(C)]` (the compiler rejects `#[repr(C, transparent)]`); use one or the other.

### `#[repr(packed)]` / `#[repr(packed(N))]` — no padding

- Field order: declaration order.
- Padding: **NONE** (or aligned to N, where N ≤ natural alignment).
- Alignment: 1 (or N).
- Danger: **direct field access produces unaligned references, which are UB.** Rust 1.78+ rejects `&p.field` on a packed struct with a hard error.
- Access: `ptr::read_unaligned(addr_of!(p.field))` and `ptr::write_unaligned`.
- Use cases: matching hardware register layouts, parsing tightly-packed network protocols, embedded targets. Avoid otherwise.

### `#[repr(align(N))]` — explicit alignment

- Forces alignment of the struct to N bytes (N must be a power of 2 and ≥ the natural alignment).
- Use cases: cache-line padding (`#[repr(align(64))]`) for false-sharing avoidance, SIMD alignment (`#[repr(align(16))]` for SSE, `align(32)` for AVX2), DMA buffer alignment in embedded.
- Does NOT change field order or padding within the struct, only the alignment of the struct AS A WHOLE.

### Enum reprs

- `#[repr(u8)]` / `#[repr(u16)]` / `#[repr(u32)]` / `#[repr(u64)]` / `#[repr(i8)]` etc. — fixed tag size for C-style enums.
- `#[repr(C)]` on an enum — C-style tag, platform-dependent (typically `int`).
- `#[repr(C, u8)]` — C-style with explicit tag size, useful for tagged unions exchanged with C.
- Adding any explicit `repr` to an enum **suppresses the niche optimization** for that enum's tag.

### `std::alloc::Layout` API

For manual allocations (custom allocators, ring buffers, intrusive collections):

```rust
let layout = Layout::new::<T>();                          // single T
let layout = Layout::array::<T>(n)?;                       // array of n T
let layout = Layout::from_size_align(size, align)?;        // arbitrary
let ptr = unsafe { alloc::alloc(layout) };
// ... use ptr ...
unsafe { alloc::dealloc(ptr, layout) };  // MUST pass the same Layout
```

`Layout` is the contract between allocator and deallocator — mismatched layouts on dealloc are UB.

### `std::mem::offset_of!` (Rust 1.77+, stable 2024)

```rust
let off = std::mem::offset_of!(MyStruct, field);
```

Compile-time field offset. ONLY meaningful on `#[repr(C)]` or `#[repr(transparent)]` structs (Rust layout may differ between compiles). Use for FFI offset assertions or raw-pointer arithmetic on stable layouts.

## Pin/Unpin and self-referential types

`Pin<P>` is a smart-pointer wrapper that guarantees the pointee will NEVER be moved in memory until it is dropped (with `T: !Unpin`) or until the `Pin` itself is dropped (with `T: Unpin`, which is trivial). It is the only safe way in Rust to construct self-referential types and is heavily used in async (compiler-generated futures are usually self-referential).

### Core mechanics

- `Pin<&mut T>` is a pinned reference; `Pin<Box<T>>` is a pinned heap allocation; `Pin<&T>` is a pinned shared reference (rare).
- `Unpin` is an **auto trait**: most types implement it automatically. A type is `Unpin` if it is safe to move after being pinned (no self-references, no internal pointers to its own fields).
- `PhantomPinned` is a marker that opts a struct OUT of `Unpin`, signalling "this type relies on its address staying fixed". Add it as a private zero-sized field: `_pin: PhantomPinned`.
- `Box::pin(value)` — heap-allocates and pins; trivially correct because heap allocations have stable addresses.
- `pin!(value)` macro (Rust 1.68+, stable) — stack-pins a local; the value cannot escape the scope.
- `Pin::new(value)` — only callable for `T: Unpin` types (no actual restriction; just type-system bookkeeping).
- `Pin::new_unchecked(ptr)` — unsafe; caller asserts the pointee will not move; requires `// SAFETY:` justification.

### When `Pin` is needed

- Self-referential structs: intrusive linked lists, parser state with pointers into its input buffer, futures generated by `async {}` blocks (the compiler creates state machines whose later states reference earlier fields).
- Async functions: every `async fn` returns an opaque `impl Future` that is typically `!Unpin`. The executor polls it via `Pin<&mut F>`.
- FFI structures with embedded callbacks that capture `&self`.

### Field projection

If `S: !Unpin` and you have `Pin<&mut S>`, you must "project" to individual fields:

- Fields that are pinned with the struct (`#[pin]`): the projection yields `Pin<&mut Field>`.
- Fields that are NOT pinned (regular fields): the projection yields `&mut Field`.

Hand-written projection is unsafe and easy to get wrong. The **`pin-project` crate** (and the lighter `pin-project-lite`) generates safe projections via macro:

```rust
use pin_project::pin_project;
#[pin_project]
struct MyFuture {
    #[pin] inner: SomeFuture,
    counter: u32,
}
impl Future for MyFuture {
    type Output = ();
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        let this = self.project();          // safe projection
        // this.inner: Pin<&mut SomeFuture>
        // this.counter: &mut u32
        ...
    }
}
```

The Rust 2026 project goals include native **field projections** (RFC pending), aiming to subsume `pin-project` and other projection patterns (RcuMutex, etc.) into the language.

### Async fn in traits (AFIT) and `Pin`

Async fn in traits stabilized in Rust 1.75 (December 2023). The returned futures are `!Unpin` and require `Pin` for polling. Dynamic dispatch (`dyn Trait` with async methods) is still pending — the `dynosaur` crate is the current bridge while the language solution is under development per the 2025/2026 async project goals.

### Common bugs

- Calling `Pin::get_mut` on a `!Unpin` type (compile error — but `get_unchecked_mut` is unsafe and easy to misuse).
- `mem::swap`, `mem::replace`, or `mem::take` on a `Pin<&mut T>` where `T: !Unpin` (UB).
- Returning a stack-pinned value from a function (the pin ends with the scope; the value is dropped).
- Constructing a self-reference before pinning (the initial move invalidates the pointer).

## Cow, Arc, Rc — ownership patterns

### `Cow<'a, T>` — Clone-on-Write

```rust
pub enum Cow<'a, B: ?Sized + 'a + ToOwned> {
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

Use cases:
- A function that USUALLY returns a borrowed slice of its input but OCCASIONALLY needs to allocate (e.g., normalizing a string, escaping characters, decoding URL escapes).
- Configuration values where most consumers don't mutate (borrow), some do (own).
- Parser output where tokens are usually slices into the source buffer.

Common alias: `Cow<'a, str>` (borrowed `&'a str` or owned `String`), `Cow<'a, [T]>` (borrowed slice or owned `Vec<T>`).

```rust
fn normalize(s: &str) -> Cow<'_, str> {
    if s.contains('\r') {
        Cow::Owned(s.replace('\r', ""))
    } else {
        Cow::Borrowed(s)
    }
}
```

Caller gets `&str` cheaply via `Deref`; pays the allocation only when normalization is needed.

### `Arc<T>` — Atomic Reference Counted, thread-safe

- Shared ownership across threads. `clone()` increments an atomic counter; `drop()` decrements.
- Pays atomic-op overhead on every clone/drop. Roughly 2-10x slower than `Rc` on contended workloads, similar in uncontended.
- `Arc<T>` is `Send`/`Sync` iff `T: Send + Sync` (mutable access requires `Arc<Mutex<T>>` or `Arc<RwLock<T>>`).
- `Arc::downgrade(&arc)` produces a `Weak<T>` — non-owning, doesn't keep the value alive; used to break reference cycles.
- `Arc::new_cyclic(|weak| ...)` constructs an `Arc<T>` whose contents already hold the `Weak<Self>` — solves the chicken-and-egg of cyclic init.
- `Arc::make_mut(&mut arc)` — Clone-on-Write for shared values; if refcount is 1, returns `&mut T`; else clones.

### `Rc<T>` — Reference Counted, single-thread

- Identical API to `Arc<T>` minus the atomic ops; ~3-5x faster.
- `Rc<T>` is `!Send` and `!Sync`. Sending it across threads is a compile error (which is GOOD — the non-atomic counter would race).
- Use inside single-thread reference graphs: tree/DAG structures, AST nodes with shared sub-trees, single-thread event handlers.
- `Rc::downgrade`, `Rc::new_cyclic`, `Rc::make_mut` mirror the `Arc` API.

### `Weak<T>` — non-owning, cycle-breaker

```rust
use std::rc::{Rc, Weak};
use std::cell::RefCell;

struct Node {
    parent: RefCell<Weak<Node>>,    // Weak — does NOT keep parent alive
    children: RefCell<Vec<Rc<Node>>>,
}
```

Pattern: parent owns children via `Rc<Child>`; child references parent via `Weak<Parent>`. Cycle broken; both sides clean up when last `Rc` drops.

Without `Weak`, `Rc<RefCell<Node>>` with bidirectional `Rc` references LEAKS forever — the cycle keeps the refcount ≥ 1 even when the graph is unreachable.

### `Box<T>` — single-owner heap

- Useful for: trait objects (`Box<dyn Trait>`), recursive types (`enum List { Cons(i32, Box<List>), Nil }`), large structs that don't fit on the stack.
- Avoid for: small `Copy` types, short-lived data, anywhere `&T` or `Vec<T>` suffices.
- `Box::into_raw` / `Box::from_raw` for manual ownership transfer (FFI, intrusive collections). Pair them exactly once.

### Decision matrix

| Pattern | Mutability | Threads | Cost |
|---------|-----------|---------|------|
| `T` | Owned | N/A | Stack, free |
| `&T` | Read-only | Same thread or via `Send`/`Sync` bounds | Free |
| `Box<T>` | Owned, heap | One owner, transferable | malloc + free |
| `Rc<T>` | Shared, read-only | Single thread only | Non-atomic refcount |
| `Arc<T>` | Shared, read-only | Multi-thread (`T: Send + Sync`) | Atomic refcount |
| `Rc<RefCell<T>>` | Shared, mutable | Single thread | Refcount + runtime borrow check |
| `Arc<Mutex<T>>` | Shared, mutable | Multi-thread | Atomic refcount + mutex |
| `Cow<'a, T>` | Borrowed-or-owned | Either, via the inner type | Pay only on mutation |

Cross-ref `concurrency.md` for the `Arc<Mutex<T>>` vs message-passing trade-off.

## Sanitizers and Miri

### Miri — the MIR interpreter

[Miri](https://github.com/rust-lang/miri) is a nightly-only interpreter for Rust's mid-level intermediate representation. It runs Rust programs (including unsafe code) in an emulated machine and detects:

- Use-after-free, double-free, dangling pointers.
- Reads of uninitialised memory.
- Out-of-bounds pointer arithmetic.
- Type punning that violates pointer provenance (`-Zmiri-strict-provenance`).
- Aliasing violations under Stacked Borrows (default) or Tree Borrows (`-Zmiri-tree-borrows`).
- Data races on `Atomic*` (with `-Zmiri-disable-isolation` for time-based tests).
- Memory leaks at program exit.

Run:

```bash
rustup +nightly component add miri
cargo +nightly miri test
cargo +nightly miri run --example my_example
MIRIFLAGS="-Zmiri-strict-provenance -Zmiri-tree-borrows" cargo +nightly miri test
```

Speed: 10-100x slower than native execution. Run in a nightly CI job, not on every commit. Exhaustively run on any module that contains `unsafe`.

### Stacked Borrows vs Tree Borrows

- **Stacked Borrows** (`-Zmiri-stacked-borrows`, default historically): the original aliasing model by Ralf Jung et al. Models each location's permission stack; tag-based; rejects some legitimate patterns (especially in raw-pointer chains and interior-mutability tricks).
- **Tree Borrows** (`-Zmiri-tree-borrows`): the 2025 successor (PLDI 2025 Distinguished Paper). Tree-based instead of stack-based; rejects 54% fewer test cases on the top 30,000 crates while preserving all the soundness guarantees Stacked Borrows enforced. The Rust unsafe-code-guidelines working group is moving toward Tree Borrows as the recommended model; the final language aliasing model is likely to be a further refinement.

If your code panics in Miri under Stacked Borrows but you believe it is sound, try `-Zmiri-tree-borrows` before filing a bug. If both panic, the code is wrong.

### Sanitizers (nightly only)

Run via `RUSTFLAGS`:

```bash
RUSTFLAGS="-Zsanitizer=address"   cargo +nightly test --target x86_64-unknown-linux-gnu
RUSTFLAGS="-Zsanitizer=thread"    cargo +nightly test --target x86_64-unknown-linux-gnu
RUSTFLAGS="-Zsanitizer=memory"    cargo +nightly test --target x86_64-unknown-linux-gnu
RUSTFLAGS="-Zsanitizer=leak"      cargo +nightly test --target x86_64-unknown-linux-gnu
RUSTFLAGS="-Zsanitizer=hwaddress" cargo +nightly test --target aarch64-unknown-linux-gnu
```

| Sanitizer | Detects | Slowdown | Note |
|-----------|---------|----------|------|
| AddressSanitizer (ASan) | Buffer overflows, use-after-free, double-free, leaks | ~2x | Most widely deployed. Default Sanitizer in `cargo-careful`. |
| ThreadSanitizer (TSan) | Data races between threads | ~5-15x | Requires recompiling stdlib via `-Zbuild-std`. |
| MemorySanitizer (MSan) | Reads of uninitialised memory | ~3x | Requires recompiling stdlib + all deps with MSan. |
| LeakSanitizer (LSan) | Memory leaks at program exit | <1.1x | Included in ASan by default; can run standalone. |
| HWASan | Same as ASan but using hardware tags | ~2x | aarch64 only; lower memory overhead than ASan. |

All sanitizers require `-Zbuild-std` and a target triple; cross-compiling under sanitizer is awkward. Run as nightly CI jobs on a Linux x86_64 host primarily.

### `cargo-careful` — extra-safe execution

[`cargo-careful`](https://github.com/RalfJung/cargo-careful) (by Ralf Jung, the author of Stacked Borrows/Tree Borrows):

```bash
cargo install cargo-careful
cargo +nightly careful test
cargo +nightly careful run
cargo +nightly careful test -Zcareful-sanitizer        # adds ASan
cargo +nightly careful test -Zcareful-sanitizer=memory # adds MSan
```

Does three things:
1. Builds the standard library with debug assertions enabled — catches UB in `Vec`, `String`, `HashMap` that the release stdlib silently allows.
2. Sets `rustc` flags that insert extra runtime checks for known UB classes.
3. Optionally combines with a sanitizer.

Requires a nightly toolchain from the last ~3 months. Run as part of a nightly CI matrix alongside Miri.

### `valgrind` and `heaptrack`

External tools, no recompile required:

- **`valgrind --tool=memcheck ./target/release/myapp`** — detects leaks, use-after-free, uninitialised reads, double-free. Slow (10-50x). Works on stable Rust.
- **`heaptrack ./target/release/myapp`** then `heaptrack_gui heaptrack.myapp.PID.gz` — heap profiler, leak detector, allocation flamegraphs. Excellent for "where is RSS going?" investigations.
- Both are Linux-primary. macOS users: `leaks` (built-in) for basic leak detection; for deeper analysis use Instruments (Xcode).

These complement sanitizers and Miri — they run on stable Rust and on production-built binaries, whereas Miri/sanitizers require nightly + special build flags. Use them on staging or pre-release builds.

### Recommended CI matrix for crates with `unsafe`

| Job | Frequency | Tooling |
|-----|-----------|---------|
| Build + test stable | Every push | `cargo test --all-features` |
| Clippy unsafe-aware | Every push | `cargo clippy -- -D clippy::undocumented_unsafe_blocks -D clippy::multiple_unsafe_ops_per_block` |
| Miri (Stacked Borrows) | Nightly | `cargo +nightly miri test` |
| Miri (Tree Borrows) | Nightly | `MIRIFLAGS="-Zmiri-tree-borrows -Zmiri-strict-provenance" cargo +nightly miri test` |
| ASan + LSan | Nightly | `RUSTFLAGS="-Zsanitizer=address" cargo +nightly test --target x86_64-unknown-linux-gnu` |
| TSan (if unsafe concurrency) | Nightly | `RUSTFLAGS="-Zsanitizer=thread" cargo +nightly test --target x86_64-unknown-linux-gnu` |
| `cargo-careful` | Nightly | `cargo +nightly careful test` |
| `cargo geiger` audit | Weekly | Track unsafe lines per dep |

## Sources

- [The Rustonomicon — Dark Arts of Unsafe Rust](https://doc.rust-lang.org/nomicon/)
- [The Rustonomicon — Data Layout](https://doc.rust-lang.org/nomicon/data.html)
- [The Rustonomicon — Other reprs](https://doc.rust-lang.org/nomicon/other-reprs.html)
- [The Rustonomicon — Transmutes](https://doc.rust-lang.org/nomicon/transmutes.html)
- [The Rustonomicon — Unchecked Uninitialized Memory](https://doc.rust-lang.org/nomicon/unchecked-uninit.html)
- [The Rust Reference — Type Layout](https://doc.rust-lang.org/reference/type-layout.html)
- [The Rust Reference — Behavior considered undefined](https://doc.rust-lang.org/reference/behavior-considered-undefined.html)
- [`std::pin` — module documentation](https://doc.rust-lang.org/std/pin/index.html)
- [`Pin` — type documentation](https://doc.rust-lang.org/std/pin/struct.Pin.html)
- [`pin-project` crate](https://docs.rs/pin-project/)
- [`pin-project-lite` crate](https://docs.rs/pin-project-lite/)
- [Rust Project Goals 2026 — Field Projections](https://rust-lang.github.io/rust-project-goals/2026/field-projections.html)
- [Rust Project Goals 2025h1 — Async parity](https://rust-lang.github.io/rust-project-goals/2025h1/async.html)
- [`MaybeUninit` documentation](https://doc.rust-lang.org/std/mem/union.MaybeUninit.html)
- [`std::alloc::Layout`](https://doc.rust-lang.org/std/alloc/struct.Layout.html)
- [`std::mem::offset_of!` macro (1.77+)](https://doc.rust-lang.org/std/mem/macro.offset_of.html)
- [`Cow` — borrow module](https://doc.rust-lang.org/std/borrow/enum.Cow.html)
- [`Arc` — sync module](https://doc.rust-lang.org/std/sync/struct.Arc.html)
- [`Rc` — rc module](https://doc.rust-lang.org/std/rc/struct.Rc.html)
- [`Weak` (Arc variant)](https://doc.rust-lang.org/std/sync/struct.Weak.html)
- [Miri — interpreter and undefined-behavior detector](https://github.com/rust-lang/miri)
- [`cargo-careful` — Ralf Jung](https://github.com/RalfJung/cargo-careful)
- [Rust Unstable Book — sanitizer](https://doc.rust-lang.org/unstable-book/compiler-flags/sanitizer.html)
- [Rust unsafe-code-guidelines working group](https://github.com/rust-lang/unsafe-code-guidelines)
- [Tree Borrows — Iris Project paper (PLDI 2025 Distinguished Paper)](https://iris-project.org/pdfs/2025-pldi-treeborrows.pdf)
- [Tree Borrows explained — Rust Internals](https://internals.rust-lang.org/t/tree-borrows-explained/18587)
- [Stacked Borrows model — original POPL 2020 paper](https://dl.acm.org/doi/10.1145/3371109)
- [Pin, Unpin, and why Rust needs them — Cloudflare blog](https://blog.cloudflare.com/pin-and-unpin-in-rust/)
- [without.boats — Pin](https://without.boats/blog/pin/)
- [Clippy lint `undocumented_unsafe_blocks`](https://rust-lang.github.io/rust-clippy/master/#undocumented_unsafe_blocks)
- [Clippy lint `missing_safety_doc`](https://rust-lang.github.io/rust-clippy/master/#missing_safety_doc)
- [Clippy lint `multiple_unsafe_ops_per_block`](https://rust-lang.github.io/rust-clippy/master/#multiple_unsafe_ops_per_block)
- [`bytemuck` — safe POD reinterpretation](https://docs.rs/bytemuck/)
- [`cargo-geiger` — unsafe accounting](https://github.com/geiger-rs/cargo-geiger)
- [RFC 1758 — `repr(transparent)`](https://rust-lang.github.io/rfcs/1758-repr-transparent.html)
- [RFC 2645 — Transparent unions](https://rust-lang.github.io/rfcs/2645-transparent-unions.html)
- [Secure Rust Guidelines — Memory management (ANSSI)](https://anssi-fr.github.io/rust-guide/unsafe/memory.html)
