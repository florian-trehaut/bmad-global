# Stack: TypeScript / Node.js

**Loaded by:** Protocols `concurrency-review.md` and `null-safety-review.md` when the project's tech-stack section includes `typescript`, `ts`, `nodejs`, `node`, `javascript`, or `js`.

**Conventions:** TypeScript and Node.js share the runtime model. Single-threaded JS event loop ≠ no race conditions: async tasks interleave on shared module-level / closure state. The most insidious bugs come from this misunderstanding plus loose null handling.

---

## Concurrency

### Anti-patterns to flag

- **`Promise.all` where `Promise.allSettled` is correct** (MAJOR)
  - Detection: `await Promise.all(...)` over a fan-out where partial failure is expected (e.g., notifying multiple webhooks, fetching multiple optional resources).
  - Why: `Promise.all` rejects on the FIRST rejection; remaining promises continue but their results are discarded. If the caller wanted "do all, report individually," `all` silently drops successes.
  - Fix: `Promise.allSettled` returns `{ status: 'fulfilled' | 'rejected', value | reason }` per input; iterate and act on each.

- **Fire-and-forget without explicit handling** (MAJOR)
  - Detection: a function returning `Promise<T>` is called without `await` or `.catch(...)`. ESLint rule `@typescript-eslint/no-floating-promises` flags this.
  - Why: rejections become unhandled `unhandledPromiseRejection` events; in Node 15+ the process exits by default. In tests it pollutes other tests.
  - Fix: always `await` OR explicitly `.catch(handleError)` OR `void promise.catch(handleError)` if intentional.

- **Check-then-act on shared module-level state** (MAJOR)
  - Detection: `if (cache.has(key)) { ... } else { cache.set(key, await fetch(...)) }` where the `if` and the `await fetch` interleave with concurrent calls.
  - Why: two requests for the same key both miss the cache, both fetch, both set — wasted work and possible duplicate side effects.
  - Fix: store the in-flight `Promise` itself (`cache.set(key, fetchPromise)`); subsequent callers `await` the same promise. Or use `async-mutex`/`p-limit` with key-based locking.

- **Unbounded `Promise.all(items.map(asyncFn))` over external input** (MAJOR)
  - Detection: `Promise.all` over an array whose size is user-controlled or unbounded (request body, file listing, DB query result without `LIMIT`).
  - Why: spawns N concurrent operations; each may open DB connections, network sockets, file descriptors. Exhausts pools, OOMs.
  - Fix: `p-limit` with explicit concurrency, `pMap(items, asyncFn, { concurrency: N })`, or batched processing.

- **Missing `await` (forgotten promise)** (MAJOR)
  - Detection: a call to an `async` function whose result is ignored — `someAsyncFn()` instead of `await someAsyncFn()`. ESLint rules `@typescript-eslint/await-thenable` and `@typescript-eslint/no-misused-promises` flag this.
  - Why: the function runs but the caller continues without waiting; ordering broken; errors silently swallowed.
  - Fix: enable strict ESLint rules; always `await`.

- **`async` function used in a `forEach` / `map` callback when the result must complete** (MAJOR)
  - Detection: `array.forEach(async (item) => await fn(item))` where the caller assumes all `fn` calls complete before the next line.
  - Why: `forEach` does not wait for async callbacks; the iteration returns immediately with `Promise<void>[]` discarded.
  - Fix: `for (const item of array) { await fn(item); }` (sequential), or `await Promise.all(array.map(fn))` (parallel).

- **`setInterval` / `setTimeout` callbacks that mutate shared state without `Promise` boundary** (MAJOR)
  - Detection: timer callbacks that update a counter or array; concurrent timer firings (e.g., overlapping HTTP polls) can interleave reads/writes.
  - Why: even single-threaded JS interleaves at every `await`; a timer callback that does `count++; await fetch(...); count--;` can decrement before increment when timer firings overlap.
  - Fix: serialize via `async-mutex`, or use a queue, or compute deltas atomically.

### Required guardrails

- **ESLint rules that MUST be enabled** (TypeScript projects):
  - `@typescript-eslint/no-floating-promises`
  - `@typescript-eslint/no-misused-promises`
  - `@typescript-eslint/await-thenable`
  - `@typescript-eslint/require-await` (catches `async fn() {}` without `await` inside)
- **Stress test** for any module mutating shared state under concurrent calls. Pattern: `await Promise.all(Array.from({ length: 100 }, () => fn(sharedKey)))` and assert state consistency.
- **`pino` / `winston` over `console.log`** for observability under concurrency.

### Language-specific principles

- **Single-threaded ≠ race-free.** Every `await` is an interleaving point.
- **Locking primitives that work in JS:** `async-mutex` (`Mutex`, `Semaphore`), `p-limit`, `bottleneck`. Use them for serialisation.
- **In-flight deduplication.** When two callers request the same expensive operation, share the in-flight Promise — don't kick off twice.
- **Backpressure matters even in Node.** Streams, queues, and `for-await-of` over a paginated source must bound concurrency.
- **`Promise.race` is rarely what you want.** It returns the first to settle (resolve OR reject); the loser keeps running. For "first success," use a custom helper.
- **Cancellation: AbortController.** Long-running async work should accept `AbortSignal`; on cancel, propagate.

---

## Null Safety

### Anti-patterns to flag

- **`value || default` when `0` / `""` / `false` are valid** (MAJOR)
  - Detection: `grep -rn "|| 0\|\|| ''\|\|| \"\"\|\|| false"` on critical fields (port, count, name, flag).
  - Why: `||` triggers on any falsy value. `const port = process.env.PORT || 3000` returns `3000` even when `process.env.PORT === "0"` (or the string `"0"` after parsing). Years of subtle production bugs.
  - Fix: `??` (nullish coalescing) — only triggers on `null`/`undefined`. `const port = parsedPort ?? 3000`.

- **Non-null assertion `!`** (MAJOR)
  - Detection: `grep -rn "!\." --include="*.ts"` for postfix `!` (be careful of false positives: logical not, type negation).
  - Why: `value!.foo` tells the type system "trust me, not null" — but it's a type-system lie. At runtime, if the value is null/undefined, it throws. Worse: TypeScript stops warning about future null checks downstream.
  - Fix: explicit null-check with `if (value == null) { ... }` and a real error path. Reserve `!` for cases where you have provable invariant (DOM API after `getElementById` post-existence-check).

- **`tsconfig.json` missing `strictNullChecks`** (BLOCKER)
  - Detection: `cat tsconfig.json | jq '.compilerOptions.strictNullChecks // .compilerOptions.strict'` returns `false` or absent.
  - Why: without strict null checks, the type `string` includes `null` and `undefined` silently. Nothing catches `value.length` on a null `value`.
  - Fix: enable `"strict": true` (which enables `strictNullChecks`). Migrating an old codebase: enable per-file with `// @ts-strict` comments and progress incrementally.

- **`tsconfig.json` missing `noUncheckedIndexedAccess`** (MAJOR)
  - Detection: same lookup, `noUncheckedIndexedAccess` absent or false.
  - Why: without this flag, `array[i]` is typed as `T` (not `T | undefined`); out-of-range access crashes at runtime with no compile-time warning.
  - Fix: enable `"noUncheckedIndexedAccess": true`. Forces explicit handling of indexed accesses.

- **Optional chaining `?.` followed by call without null check** (MINOR)
  - Detection: `obj?.method()` where the result is then used as if non-undefined (`const x = obj?.method().property`).
  - Why: if `obj` is null, `obj?.method()` is `undefined`, and `undefined.property` throws.
  - Fix: chain consistently — `obj?.method()?.property` — and handle the final `undefined` case.

- **`any` cast erasing nullability** (MAJOR)
  - Detection: `as any`, `as unknown as T`, or `: any` annotations.
  - Why: bypasses the type system entirely; null safety lost.
  - Fix: define a proper type, narrow with type guards, or use Zod/Valibot at boundaries.

- **`JSON.parse` result used without validation** (MAJOR)
  - Detection: `JSON.parse(str) as MyType` or untyped result accessed directly.
  - Why: `JSON.parse` returns `any`; the `as MyType` is unchecked. If the JSON shape differs, runtime errors at access time, not at parse time.
  - Fix: validate with Zod (`schema.parse(JSON.parse(str))`) or a hand-written type guard. Cast only after validation.

### Required guardrails

- **`tsconfig.json`** MUST include:
  - `"strict": true` (or at minimum `"strictNullChecks": true`)
  - `"noUncheckedIndexedAccess": true`
  - `"noImplicitAny": true` (covered by `strict`)
  - `"exactOptionalPropertyTypes": true` (recommended)
- **Boundary validation library** (Zod, Valibot, io-ts, ArkType) — ALL external input goes through it.
- **ESLint rule `@typescript-eslint/no-non-null-assertion`** — error level.

### Language-specific principles

- **The type system is your null-safety net.** Configure it strictly OR don't claim TypeScript is helping you.
- **`null` and `undefined` are different.** Pick one for your API; document it. Common convention: `null` = explicit absence, `undefined` = "field not present."
- **`??` over `||` for nullable defaults.** Always.
- **Validate at the boundary, then trust types.** Once a value passes a Zod schema, downstream code may access it without re-checking.
- **`!.` is a code smell.** Each one is a place future-you will debug a `Cannot read properties of undefined`.

---

## Sources

- [Promise.all() — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Node.js race conditions (nodejsdesignpatterns.com)](https://nodejsdesignpatterns.com/blog/node-js-race-conditions/)
- [Tackling Asynchronous Bugs in JavaScript: Race Conditions and Unresolved Promises](https://dev.to/alex_aslam/tackling-asynchronous-bugs-in-javascript-race-conditions-and-unresolved-promises-7jo)
- [Optional Properties and Null Handling in TypeScript (Better Stack)](https://betterstack.com/community/guides/scaling-nodejs/typescript-optional-properties/)
- [TypeScript 3.7 — Optional Chaining and Nullish Coalescing](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)
- [StrictNullChecks in TypeScript (Scaler)](https://www.scaler.com/topics/typescript/strictnullchecks/)
