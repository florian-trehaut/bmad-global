# Stack: Python

**Loaded by:** Protocols `concurrency-review.md` and `null-safety-review.md` when the project's tech-stack section includes `python` or `py`.

**Conventions:** Python concurrency comes in three flavors (threading, asyncio, multiprocessing) with very different rules. The GIL makes single-statement operations atomic in CPython but does NOT save multi-step operations from races. Null safety in Python centers on `None`, `KeyError`, and `AttributeError` — silent at the cause, loud at the crash site.

---

## Concurrency

### Anti-patterns to flag

- **Mutable global accessed from threads / asyncio without `threading.Lock` / `asyncio.Lock`** (BLOCKER)
  - Detection: a module-level `dict`, `list`, `set`, or counter mutated by `def` functions called from `threading.Thread`, `concurrent.futures.ThreadPoolExecutor`, or `async def` coroutines.
  - Why: the GIL serialises bytecode but NOT logical operations. `counter += 1` is read/add/store — three bytecodes, interruptible. Multi-step mutations on shared state race.
  - Fix: `threading.Lock` for sync, `asyncio.Lock` for async. Or compute deltas atomically with `threading.local` per thread + final reduce.

- **CPU-bound work in `asyncio` blocking the event loop** (MAJOR)
  - Detection: a synchronous compute-heavy function (large loops, image processing, hashing, regex on huge strings) called directly from an `async def` coroutine without `loop.run_in_executor`.
  - Why: asyncio runs all coroutines on a single OS thread; blocking it stalls every other task.
  - Fix: `await loop.run_in_executor(None, cpu_bound_fn, *args)` (uses default thread pool), or move to `multiprocessing` for true parallelism.

- **Mixing threading and asyncio without `asyncio.run_coroutine_threadsafe` / `loop.run_in_executor`** (MAJOR)
  - Detection: a thread directly awaits a coroutine, or a coroutine directly calls `thread.join()`.
  - Why: asyncio loop affinity — coroutines must run on their loop's thread; cross-thread awaiting blocks both.
  - Fix: `asyncio.run_coroutine_threadsafe(coro, loop)` from threads to asyncio; `loop.run_in_executor(None, blocking_fn)` from asyncio to threads.

- **Unbounded `asyncio.gather` over external input** (MAJOR)
  - Detection: `await asyncio.gather(*[fn(item) for item in unbounded_source])`.
  - Why: same as TypeScript `Promise.all` — exhausts connections, file descriptors, OOM.
  - Fix: `asyncio.Semaphore(N)` to bound concurrency, or `asyncio.as_completed` with batched processing, or `aiometer.run_on_each`.

- **`asyncio.gather` rejecting on first error when partial results matter** (MAJOR)
  - Detection: `await asyncio.gather(*coros)` where some failures are expected and tolerable.
  - Why: by default `gather` propagates the first exception, cancelling others; partial results lost.
  - Fix: `await asyncio.gather(*coros, return_exceptions=True)` returns a list with exceptions in place of values; iterate and handle per-element.

- **`time.sleep` inside an async function** (BLOCKER)
  - Detection: `time.sleep(...)` inside `async def`.
  - Why: blocks the event loop for the duration; every other task halts.
  - Fix: `await asyncio.sleep(...)`.

- **Concurrent `dict[k]` mutations without lock** (BLOCKER)
  - Detection: thread A does `d[k] = v`, thread B does `del d[k]`, no lock.
  - Why: depending on CPython version, the GIL may serialise the write but iteration during mutation raises `RuntimeError: dictionary changed size during iteration`.
  - Fix: `threading.Lock`, or `queue.Queue` for handoff, or `concurrent.futures` for fan-out.

- **`requests` library in async code** (MAJOR)
  - Detection: `import requests; await requests.get(...)` (won't even compile) OR `requests.get(...)` inside an `async def`.
  - Why: `requests` is synchronous and blocks the event loop.
  - Fix: `httpx.AsyncClient` or `aiohttp` for async HTTP.

### Required guardrails

- **`pytest-asyncio`** for testing coroutines.
- **Stress test pattern**: `await asyncio.gather(*[fn(shared) for _ in range(100)])` against any module with shared state, then assert consistency.
- **`async_timeout`** to bound coroutine execution and detect hangs.
- **`mypy --strict`** with `--strict-equality` catches some asyncio misuse (e.g., `await` on non-awaitable).
- **`ruff` rule `ASYNC100`** (blocking call in async function) and `ASYNC101` (sync HTTP client in async).

### Language-specific principles

- **GIL is not a lock for your code.** It serialises bytecode execution; multi-bytecode operations race.
- **Pick a model and stick to it.** Within one module/component, prefer all-async OR all-threaded. Mixing is error-prone.
- **`asyncio.Lock` for async; `threading.Lock` for threads.** They are not interchangeable.
- **CPU-bound → multiprocessing or executor.** asyncio doesn't help for compute.
- **`concurrent.futures.Executor.map` with `max_workers` bound** is the simplest worker pool.
- **Cancellation is cooperative.** A coroutine receiving `CancelledError` should clean up and re-raise; swallowing it leaks resources.

---

## Null Safety

### Anti-patterns to flag

- **`dict[k]` on potentially-missing key** (MAJOR)
  - Detection: `grep -rnE "[a-z_]+\[\s*['\"]" --include="*.py"` for direct `dict[key]` access. Distinguish from list indexing by context.
  - Why: `KeyError` raised at access; the error message names the key but not the calling context. Far from the deserialise/parse site that produced the partial dict.
  - Fix: `dict.get(k, default)` if a default is meaningful; `dict.get(k)` returning `None` if absent is meaningful; or explicit `if k in d:` guard with `KeyError` raised by intent.

- **Chained `dict.get(...)` without intermediate None checks** (MAJOR)
  - Detection: `data.get('a').get('b').get('c')`.
  - Why: if the first `get` returns `None` (key absent), the second `.get` raises `AttributeError: 'NoneType' object has no attribute 'get'` — far from the actual problem.
  - Fix: `data.get('a', {}).get('b', {}).get('c')` (chain default empty dicts), or use a parser like `pydantic` to validate the structure upfront.

- **Missing `Optional[T]` type hints** (MAJOR)
  - Detection: a function with `def f() -> str` whose body has `return None` paths.
  - Why: callers don't know to handle `None`; mypy flags it but only if `--strict` is on; lax projects miss it entirely.
  - Fix: `def f() -> Optional[str]` (Python 3.9+) or `def f() -> str | None` (Python 3.10+). Run `mypy --strict`.

- **Bare `except:` swallowing `AttributeError` / `KeyError`** (MAJOR)
  - Detection: `except:` or `except Exception:` without re-raise or logging.
  - Why: hides null-induced errors; debug nightmares.
  - Fix: catch specific exceptions; if generic catch is necessary, log and re-raise.

- **`getattr(obj, 'attr')` without default** (MINOR)
  - Detection: `getattr(obj, attr_name)` without third argument.
  - Why: raises `AttributeError` if absent — same problem as `dict[k]`.
  - Fix: `getattr(obj, attr_name, default)` if a default is meaningful, otherwise explicit `hasattr` check.

- **`if x:` instead of `if x is not None:`** (MAJOR)
  - Detection: truthy check on a value that may legitimately be `0`, `""`, `[]`, `{}`.
  - Why: same bug as TypeScript's `||`. `if count:` returns False when `count == 0`, treating valid zero as missing.
  - Fix: `if x is not None:` for null check; `if x:` only when "empty == missing" is intentional.

- **`assert x is not None` in production code** (MAJOR)
  - Detection: `assert` statements used for null-checking in non-test code.
  - Why: Python `-O` flag strips assertions. In production with `python -O`, the check disappears, and the next access raises a less helpful error.
  - Fix: explicit `if x is None: raise ValueError(...)`. Use `assert` only for invariants you accept may not run.

### Required guardrails

- **`mypy --strict`** in CI (or `pyright --strict`). Both catch most `Optional` mishandling.
- **`ruff` rules** to enable: `B008` (mutable default), `B011` (assert False), `S101` (assert in production), `RUF013` (PEP 604 union with None).
- **`pydantic`** for boundary validation (API request bodies, config, deserialised JSON).
- **CI runs with `python -O` and `python` both** to catch `assert`-in-production bugs.

### Language-specific principles

- **EAFP ≠ "let it crash."** "Easier to Ask Forgiveness than Permission" means catch the specific exception you're prepared to handle, not a bare `except:`.
- **`Optional[T]` everywhere it applies.** `mypy --strict` catches missing annotations.
- **`dict.get(k, default)` is idiomatic.** Use it.
- **Validate at boundaries with pydantic / dataclasses + post-init.** Don't propagate raw dicts.
- **The "billion-dollar mistake" is alive in Python.** None can flow far before exploding; type hints + strict checking are the practical mitigation.
- **Tests cover the absent-value path.** For every `Optional[T]` parameter / field, at least one test with `None`.

---

## Sources

- [Python's 'Ask Forgiveness, Not Permission': A Practical Approach (sqlpey)](https://sqlpey.com/python/python-eafp-vs-lbyl/)
- [How to Fix 'AttributeError: NoneType' in Python (oneuptime)](https://oneuptime.com/blog/post/2026-01-25-fix-attributeerror-nonetype-python/view)
- [Python KeyError: How to fix and avoid key errors (LearnDataSci)](https://www.learndatasci.com/solutions/python-keyerror/)
- [Mastering Python Dictionaries: Common Mistakes (Glinteco)](https://glinteco.com/en/post/tips-common-mistakes-with-python-dictionaries/)
- [Python `concurrent.futures` documentation](https://docs.python.org/3/library/concurrent.futures.html)
- [Python `asyncio` documentation](https://docs.python.org/3/library/asyncio.html)
