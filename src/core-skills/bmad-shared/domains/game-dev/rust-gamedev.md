# Domain Sub-File: Rust Game Development

**Parent domain**: `domains/game-dev.md`
**Scope**: idiomatic Rust gamedev patterns, mature engine + library ecosystem (May 2026), build pipelines, WASM target, production-shipped Rust games, community resources.
**Source pin**: WebSearch verified May 2026 for all version numbers, pricing, library status, production milestones. All deltas vs the parent `engines.md` (Unity / Unreal / Godot) are documented here, not duplicated.

---

## When to use Rust for game development

Rust is a strong choice when **at least two** of the following hold:

| Driver | Why Rust fits |
|---|---|
| Long-term codebase, multi-year maintenance | Borrow checker eliminates entire bug classes (use-after-free, data races) that bite multi-year projects |
| Heavy simulation / determinism / multiplayer authoritative server | Same crate compiles to native server + WASM client; deterministic floats easier than C++ undefined behaviour |
| Team prefers strongly-typed, ECS-native, code-first workflow over visual scripting / GUI editors | Bevy ECS is first-class; no "engine politics" of UnityScript-vs-C# style API churn |
| Heavy CPU-bound systems (procedural generation, physics, large worlds) | LLVM-level codegen with `cargo`-driven LTO + codegen-units=1 ships at C++ parity; Tiny Glade and Veloren validate this |
| WASM target is a hard requirement (browser, embed) | `wasm32-unknown-unknown` is a first-class Rust target; Bevy, Macroquad, and Comfy all ship to browser |

Rust is **not** the right choice when:

- You need a polished visual editor *today* (Bevy editor is experimental as of 0.18 — Unity, Unreal, Godot remain ahead by several years).
- The team has zero Rust experience and the deadline is < 6 months — the borrow-checker learning curve is real.
- Console (PS5 / Xbox Series / Switch) ship is a hard launch requirement — there is no first-party Rust toolchain on console (see "Console" section below).
- Visual scripting is a non-negotiable for designers — no Rust engine offers a Blueprint / Visual Script equivalent at parity.

**Hybrid pattern**: ship the engine in Unity / Unreal / Godot but write the heavy simulation / netcode / procgen layer as a Rust `cdylib` exposed via FFI. Veloren, Embark Studios' work, and several Bevy crates (rapier, glam) follow this pattern in reverse — Rust libraries consumed by non-Rust engines.

---

## Engine + Library Landscape (May 2026)

### Bevy — production-capable ECS engine

**Current version**: 0.18 (released March 2026, contributor-driven — 174 contributors, 659 PRs cited in Bevy 0.18 release notes). 0.19 is in release-candidate at `0.19.0-rc.1` (2026-05-13). Repository: <https://github.com/bevyengine/bevy> (~44k stars as of April 2026).

**0.17 → 0.18 highlights** (from migration guide):

- ECS scheduler v3 — multithreaded execution of systems is the default and **fast**; on a 16-core machine, Bevy saturates cores in a way other indie engines do not.
- Asset pipeline rewrite from 0.15 finally settled — async loading, dependency tracking, hot-reloading, content hashing, KTX2 texture support all stable.
- First-party experimental editor (`bevy_editor`) — scene viewing, entity inspection, component editing, hot-reload. Still flagged experimental; sufficient for hobby projects without a dedicated inspector plugin.
- Bevy Feathers widget library — experimental widget toolkit underpinning the editor.
- Real-time raytracing path (Solari) — landing in 0.19 cycle (see <https://jms55.github.io/posts/2026-04-12-solari-bevy-0-19/>).

**Strengths**

- ECS-native architecture (Bevy ECS is one of the fastest production ECS implementations).
- Plugin ecosystem is broad and active — community plugins ship within 2-3 weeks of each Bevy release.
- Code-first, no GUI editor lock-in — engine evolves with the codebase, not a serialized scene file.
- Hot reload via dynamic linking (`bevy_dylib` feature) and via `dexterous_developer` (0.4.0-alpha.3 as of 2026, CLI tool).

**Trade-offs**

- 0.x versioning means **breaking changes every release** (every ~4-5 months). Pinning to a specific minor version for a shipped project is mandatory; community plugin updates lag the core release by 1-3 weeks.
- Learning curve for non-ECS developers (entities, components, systems, schedules, change detection).
- Editor is experimental — production teams still pair with `bevy-inspector-egui` for debug UIs.

**Plugin ecosystem highlights** (May 2026)

| Plugin | Purpose | Status |
|---|---|---|
| `bevy_rapier2d` / `bevy_rapier3d` | Physics (Rapier-backed). `bevy_rapier3d` 0.34.0 released 2026-05-16 | Production |
| `bevy_xpbd_2d` / `bevy_xpbd_3d` | Alternative XPBD physics, ECS-native | Production |
| `bevy_kira_audio` | Audio via Kira | Production |
| `bevy_egui` | egui integration (immediate-mode GUI / debug UIs). Tracks Bevy 0.18 + egui 0.33 | Production |
| `bevy_mod_picking` | Picking and pointer events; multi-backend (rapier, xpbd, raycast, UI, sprite, egui) | Production; planned upstream into Bevy |
| `bevy_replicon` | Server-authoritative replication (high-level netcode) | Production |
| `bevy_quinnet` | QUIC-based client/server transport | Production |
| `bevy_replicon_quinnet` | Glue crate for replicon + quinnet | Production |
| `bevy-inspector-egui` | Live entity / component inspector | Production |
| `bevy_dexterous_developer` | Hot reload via dynamic library + IPC | Alpha |
| `dexterous_developer_cli` | Out-of-process hot reload runner | Alpha |

**Production games shipped on Bevy** (sourced)

- **Tiny Glade** (Pounce Light, Steam release 2024-09-23) — flagship commercial Bevy title. Procedural cozy castle-building sim, written in Rust with Bevy ECS. Two-person studio (Anastasia Opara + Tomasz Stachowiak). Coverage: <https://80.lv/articles/exclusive-tiny-glade-developers-discuss-bevy-proceduralism-publishers-cozy-games>, <https://en.wikipedia.org/wiki/Tiny_Glade>.
- **Toroban** — infinitely wrapping puzzle game, live on Steam.
- **JARL** — Norse fantasy colony builder/simulator, Bevy 0.11.x core (Hanabi, ECS Tilemap, Tweening, Rapier). Site: <https://www.jarl-game.com/>.
- **MegaFactory Tycoon** — 2D factory automation tycoon, released on Steam (App ID 3891760). Bevy-based.
- **POLDERS** — city builder with rising sea level, Steam page live, Bevy-based (cited in "This Week in Bevy" January 2026 issue).
- **Veloren** — open-source multiplayer voxel RPG, ~20 active developers + ~20 artists/composers. GNU GPL 3.0. Last update on GitHub mirror: 2026-05-16. Site: <https://veloren.net/>, Source: <https://gitlab.com/veloren/veloren>.

### Macroquad — simple 2D, WASM-friendly

**Current version**: 0.4.14 (February 2026). Repository: <https://github.com/not-fl3/macroquad>.

- Cross-platform 2D-first (some 3D capability). Raylib-inspired API — minimal friction, single binary deploy.
- Targets desktop (Win/Linux/macOS), web (WASM/HTML5), mobile (Android/iOS) with no platform-specific code.
- Single-command WASM + Android deploys. Built-in immediate-mode UI.
- async/await for cross-platform main loop without an external runtime — no `tokio`, no `async-std`, no `futures-rs` dependency.
- **When to choose**: game jams, prototypes, casual 2D shipping titles. Mature enough for game-jam shipping and small commercial titles; lighter learning curve than Bevy.
- **Migration path**: prototype in Macroquad → port to Bevy if the project grows.

### ggez — Love2D-inspired 2D

**Current version**: 0.9.3 stable (0.10.0 in release-candidate, not officially released as of May 2026). Repository: <https://github.com/ggez/ggez>.

- Lightweight 2D framework, Love2D-inspired API.
- Built on `winit` + `rodio` + `wgpu` (2D drawing engine).
- **Maintenance status**: maintained but slow — community contributors and attention have largely migrated to Bevy. Don't expect frequent updates or new features.
- **When to choose**: small 2D project, simple API preferred over ECS, or you already know Love2D and want a Rust equivalent.

### Fyrox — 3D scene-graph engine

**Current version**: 0.36.2 (February 2026). Site: <https://fyrox.rs/>. Repository: <https://github.com/FyroxEngine/Fyrox>.

- 2D + 3D, scene-graph architecture (not ECS), formerly known as rg3d.
- Ships with **Fyroxed**, a native scene editor — opinionated workflow: build scenes in the editor, load them from code.
- **When to choose**: 3D project where a visual editor is a hard requirement *today* (not in 2027 when Bevy editor matures). Nothing else in Rust comes close to Fyroxed for 3D editing.

### Comfy — opinionated 2D, post-macroquad

**Repository**: <https://github.com/darthdeus/comfy>. Built on `wgpu` + `winit`.

- Designed as a 2D engine fixing macroquad's HDR / `RGBA16F` texture limitation.
- Cross-platform: Win / Linux / macOS / WASM.
- Coordinate system: `[0,0]` centre, y-up, world units (vs macroquad's `[0,0]` top-left, y-down, pixels).
- Built-in z-index for draw call ordering.
- **Status**: under heavy development, API not yet stable. Mature enough for game jam shipping; expect breaking changes for production projects.

### Ambient — multiplayer-first

**Repository**: <https://github.com/AmbientRun/Ambient>.

- Multiplayer-first game engine, powered by Rust + WebAssembly + WebGPU.
- In-game real-time database, automatic synchronization, configurable asset pipelines, PBR rendering.
- Repository last updated 2025-01-07 — **active maintenance is slow** as of May 2026; verify project momentum before committing a production team.

### Standalone "build-your-own-engine" stack

When no off-the-shelf engine fits (niche genre, full control over the loop, no engine politics), assemble the following crates:

| Crate | Role | Notes |
|---|---|---|
| **wgpu** | WebGPU-spec graphics layer | Backends: Vulkan, Metal, DX12, OpenGL/GLES, WebGL2, WebGPU. Core of WebGPU in Firefox, Servo, Deno. WGSL shading. Site: <https://wgpu.rs/>. |
| **glam** | Math (Vec2/3/4, Mat3/4, Quat, Affine2/3) | SIMD-accelerated on x86, x86_64, wasm32, wasm64 via `Vec3A` etc. Outperforms `nalgebra`, `cgmath` per `mathbench`. SSE2 default on x86_64. |
| **Rapier** | 2D + 3D physics (`rapier2d` / `rapier3d`, `*-f64` variants) | Production-quality, by Dimforge. |
| **Kira** | Audio engine | Tweens, mixer, clock, spatial audio. Backend-agnostic. Primary platform: desktop; WASM with limitations. |
| **Lyon** | 2D vector graphics tessellation on GPU | Latest 1.0.19 (2026-05-03). SVG-style fill/stroke. |
| **winit** | Windowing + event loop | Default windowing layer for nearly every Rust gamedev stack. |
| **egui** | Immediate-mode GUI | ~13 million downloads. Used heavily for in-game debug UIs, game tools, editors. Pairs with `egui-winit` for windowing glue. |

**When DIY is right**

- Full control over the render loop, scheduler, memory layout.
- No engine version churn — pin every dependency and ship.
- Niche genres (VJ performance tools, voxel engines, browser-only experiences, deterministic lockstep multiplayer).

**When DIY is wrong**

- Asset pipeline, scene graph, animation, save system, UI — all of these will take 6-12 months you weren't planning to spend.
- Bevy gives you 80% of this for free, with a community of plugins for the rest.

### Other tools — mention briefly

- **Tetra** — small 2D engine, low activity in 2026.
- **Amethyst** — historically the first major Rust ECS engine; the `amethyst` crate is archived (the team migrated efforts). The `bracket-lib` repo is hosted under `amethyst/` GitHub org but is a separate roguelike toolkit, not the engine.
- **Piston** — legacy 2D framework, low activity.

---

## Cargo Workspace Patterns for Gamedev

### Multi-crate workspace layout

For projects above ~10k LOC, split into a workspace:

```
my-game/
├── Cargo.toml                  # [workspace] root manifest
├── crates/
│   ├── game/                   # The actual game (binary)
│   ├── engine/                 # Shared engine layer (library)
│   ├── tools/                  # Asset packer, validator, build tools (binaries)
│   ├── assets-tool/            # Asset baking CLI (binary)
│   └── shared/                 # Common types, errors, math
├── assets/                     # Raw and baked assets (git-LFS friendly)
└── .cargo/
    └── config.toml             # Build profile + linker config
```

### Workspace dependency pinning

Use `[workspace.dependencies]` to single-source ecosystem pins (bevy / wgpu / glam / serde). Each crate then declares `bevy.workspace = true`. Avoids drift across crates.

### Build profiles tuned for gamedev

`Cargo.toml` at workspace root:

```toml
# Fast iteration: own crate at opt-level=1, deps at opt-level=3
[profile.dev]
opt-level = 1
debug = true

[profile.dev.package."*"]
opt-level = 3

# Ship build: maximum runtime perf
[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
strip = "symbols"
panic = "abort"
```

**Rationale**:

- `lto = "fat"` performs whole-program inlining/pruning. Substantially smaller and faster binary; significantly longer link time (a few minutes for a Bevy game on a workstation).
- `codegen-units = 1` further enables cross-module optimisation; trades compile parallelism for runtime speed.
- `panic = "abort"` removes panic-unwinding machinery (smaller binary).
- `strip = "symbols"` removes debug symbols from shipped binary (keep them in a separate `.dwp` / `.dSYM` for crash dumps).
- An alternative allocator (e.g. `mimalloc`, `jemalloc`) is the next lever for runtime performance when LTO is exhausted.

### Faster builds during development

- **`mold` linker** (Linux): 30-70% reduction in link time. Drop-in via `.cargo/config.toml`:
  ```toml
  [target.x86_64-unknown-linux-gnu]
  linker = "clang"
  rustflags = ["-C", "link-arg=-fuse-ld=mold"]
  ```
- **`lld` linker** (cross-platform alternative).
- **`sccache`** — caches `rustc` output across rebuilds. Set `RUSTC_WRAPPER=sccache`. Speeds up test compilation 11-14%; **slows down release builds with `lto="fat"` by up to 50% — disable for ship builds**.
- **`cargo nextest`** — parallel test runner, 35% faster than `cargo test` baseline with warm sccache.

### Asset embedding patterns

| Pattern | When to use | Trade-off |
|---|---|---|
| `include_bytes!` | Small assets (<1 MB), config files, default fonts/sprites | Binary size, no hot reload |
| Runtime load via Bevy `AssetServer` | Bulk assets, hot reload, modding | Disk I/O on startup, asset path management |
| Custom asset bundle (zip / tar / custom) | Shipping a single archive, DRM-light | More tooling, less ergonomic in dev |
| KTX2 textures | First-class in Bevy 0.18, especially for WASM | Requires pre-processing pipeline |

---

## Build & Distribution

### Native targets

#### Windows

- **MSVC toolchain** (`x86_64-pc-windows-msvc`): default for shipping. Required for Steam. Needs Visual Studio Build Tools installed.
- **GNU toolchain** (`x86_64-pc-windows-gnu`): smaller toolchain footprint, useful in CI. Limited debugger interop with VS.
- **Code signing**: Authenticode certificate required for SmartScreen reputation. EV certs are immediately trusted; OV certs build trust over time. Sign with `signtool.exe`.
- **Distribution**: Steam (mandatory MSVC + DRM compatible build), itch.io (any toolchain), Epic, GOG.

#### Linux

- **glibc compatibility**: build on the **oldest** glibc you intend to support (e.g. inside a Docker container running Ubuntu 20.04 or AlmaLinux 8). Newer glibc symbols break older distros at runtime.
- **Distribution**: AppImage (single-file portable), Flatpak (sandboxed), Snap (Canonical-centric), tarball, native packages (`.deb`/`.rpm` for niche distros). Steam runtime is mandatory for Steam shipping.
- **Linker**: prefer `mold` for ship builds — same binary, faster link.

#### macOS

- **Architectures**: Apple Silicon (`aarch64-apple-darwin`) **and** x86_64 (`x86_64-apple-darwin`). Ship a universal binary via `lipo`.
- **Code signing**: Apple Developer ID certificate required. Notarisation via `notarytool` is mandatory for Gatekeeper-trust download.
- **Distribution**: Mac App Store (sandboxed, additional review), direct download (`.dmg` or `.zip`), Steam.

#### Cross-compilation

- **`cross` tool** (<https://github.com/cross-rs/cross>): Docker-based cross-compilation. Recommended over raw `cargo --target=` for non-trivial gamedev dependencies.
- **GitHub Actions matrix**: build all three native targets in parallel on `windows-latest`, `ubuntu-latest`, `macos-latest` runners. Cache `~/.cargo/registry` and `target/` per OS.
- **Symbol strip + LTO** are mandatory for ship builds, never for dev builds.

### WASM target

#### Toolchain

- **Target**: `wasm32-unknown-unknown` (gamedev default).
- **`wasm-server-runner`** (`cargo install wasm-server-runner`): set as Cargo runner for the wasm target — `cargo run --target wasm32-unknown-unknown` boots a local web server and opens the browser.
- **Trunk** (`cargo install trunk`): higher-level WASM bundler with HTML/CSS/asset pipeline. Recommended for shipping; provides `trunk build --release` for deploy artefacts.
- **Macroquad WASM**: simpler workflow than Bevy — `cargo build --target wasm32-unknown-unknown` + a minimal HTML harness; see <https://macroquad.rs/articles/wasm/>.

#### Size optimisation

Bevy WASM binaries are typically **30 MB unoptimised, 15 MB after `wasm-opt`** — the Bevy Cheat Book (<https://bevy-cheatbook.github.io/platforms/wasm/size-opt.html>) is the canonical reference. Levers:

```toml
[profile.wasm-release]
inherits = "release"
opt-level = "z"          # or "s" — optimise for size
lto = true
codegen-units = 1
strip = true
```

Then post-process: `wasm-opt -Oz -o out.wasm in.wasm` (binaryen toolkit). Inspect with `twiggy` for bloat analysis.

#### Hosting

- **itch.io HTML5** — drag-and-drop ZIP upload, supports WASM, the canonical jam-game host.
- **GitHub Pages** — free, custom domain, manual deploy via Actions.
- **Cloudflare Pages** — free, free SSL, edge-cached.
- **CORS / `Cross-Origin-Isolated` headers** required for `SharedArrayBuffer` (threaded WASM). itch.io and Cloudflare Pages support these; GitHub Pages does **not**.

#### Browser compatibility (May 2026)

- **WebGPU** — supported in Chrome (default since 113, 2023), Edge, Firefox (default 121), Safari Tech Preview (still flagged in stable Safari as of 2026).
- **WebGL2 fallback** — universal browser support; wgpu transparently falls back.
- **Bevy WASM** strategy: ship WebGPU build + WebGL2 build, detect at runtime.

#### Asset loading async patterns

- **Bevy AssetServer** — async by default; load assets via `AssetServer.load("path/to/foo.png")`, await readiness in a system using `AssetEvent`.
- **Streaming** — for large worlds, load chunks via async system + `AssetState` tracking.
- **Macroquad** uses `.await` directly in the main loop for asset loads (its built-in async runtime handles this without `tokio`).

### Mobile

#### iOS

- **`cargo-mobile2`** (<https://github.com/tauri-apps/cargo-mobile2>) — fork of the original `cargo-mobile`, used by Tauri. Generates Xcode projects and handles `cargo build --target aarch64-apple-ios` orchestration. **iOS targets are macOS-only** (Xcode required).
- **Bevy on iOS**: well-supported, most features work; multiple shipped games on the App Store.
- Apple Developer Program enrolment required (currently $99/year). TestFlight for beta distribution; App Store Connect for submission. Notarisation does not apply (iOS uses Apple's own signing chain).

#### Android

- **`cargo-apk`** (<https://github.com/rust-mobile/cargo-apk>) — `cargo apk build` / `cargo apk run`. Part of the `rust-mobile` ecosystem.
- **`cargo-mobile2`** also generates Android Studio projects for finer build control.
- **Bevy on Android**: usable but less mature than iOS (per Bevy docs as of 0.12 era). Expect debugging effort and configuration friction.
- Google Play Console enrolment ($25 one-time) for store submission; AAB (Android App Bundle) signing required.

#### Caveats

- Both stores demand specific permission declarations, icon assets, screenshots per device class, and privacy policies.
- Bevy mobile-specific examples are thin in the official repo (the `examples/mobile` README has long-standing issues — track `bevyengine/bevy#19021`).

### Console (state of Rust on console, May 2026)

**No first-party Rust toolchain exists for PS5, Xbox Series, or Switch.** The console SDKs are NDA-locked under proprietary platform-vendor toolchains (Sony, Microsoft, Nintendo) that target C++ via vendor-specific compilers.

Practical options:

- **W4 Games / similar middleware**: in the Godot/Unity space; not Rust-native.
- **Wrap your Rust core as a C ABI library** (`#[no_mangle]` + `cdylib`) and integrate from a C++ engine that has a console SDK.
- **Wait for the engine vendor**: Bevy is not first-party on consoles and there is no roadmap commitment as of May 2026.
- Track the Rust Gamedev WG console issue: <https://github.com/rust-gamedev/wg/issues/90>.

**Recommendation**: if console is a hard launch requirement, choose Unity / Unreal / Godot and revisit Rust for the next title.

---

## Hot reload Strategies

### Bevy dynamic linking

The `bevy_dylib` feature compiles the engine as a dynamic library (`libbevy_dylib.so` / `.dylib` / `.dll`), so recompile of your game crate avoids re-linking the entire engine. Roughly cuts incremental rebuild time by half. **Not** runtime hot-reload — still requires `cargo run` restart.

```toml
[dependencies]
bevy = { version = "0.18", features = ["dynamic_linking"] }
```

### Runtime hot reload — `dexterous_developer`

<https://github.com/lee-orr/dexterous_developer> — experimental runtime hot reload for Bevy. CLI: `cargo install dexterous_developer_cli@0.4.0-alpha.3`. Marks the crate as `dylib`, watches the source, recompiles, then either dlopen-swaps the library or restarts via IPC, with state preservation hooks.

- **Reloadable surface**: systems, components, states, events, resources.
- **Hooks**: reset resources on reload, save/restore game state across reload.
- **Cross-device**: reload from your desktop into a phone via IPC.
- **Status**: alpha. Production teams typically pair with quick-restart workflows or use `bevy_dylib` for the bulk of dev iteration.

### Asset hot reload

Bevy `AssetServer` has `watch_for_changes_override = Some(true)` — file-watcher reloads assets on disk change. First-class for textures, shaders, sounds, GLTF.

### Shader hot reload

Bevy's `wgpu` integration supports WGSL shader reload via asset watch. Custom render-graph pipelines need explicit invalidation calls.

### WASM hot reload

No true hot module replacement for WASM gamedev today. The workflow is full page reload — `trunk serve --watch` or `wasm-server-runner` recompiles and reloads the page on source change.

### Tooling

- **`cargo watch`** (`cargo install cargo-watch`) — `cargo watch -x run` rebuilds on file change.
- **`bevy_asset_loader`** — declarative asset loading at startup, friendly with hot reload.

---

## Performance Baselines (Bevy 0.18)

Numbers are indicative; benchmark in your own scene.

| Metric | Indicative target | Notes |
|---|---|---|
| ECS iteration | ~1M entities at 60 FPS on a desktop CPU | Per Bevy 0.18 release notes; depends on query complexity. |
| Asset loading | Async by default; streaming available | Block only on initial title-screen handful of assets. |
| Render path | `bevy_render` graph-based; Wgpu raw is ~20% leaner if you skip Bevy's render layer | Trade-off vs Bevy plugins (UI, sprites). |
| Frame pacing | Fixed timestep loop via `FixedUpdate` schedule | Render-interpolation supported via `Time<Fixed>` interpolation. |
| Memory budget | Mobile ~400 MB heap, console ~12 GB, desktop ~2-8 GB practical | Same constraints as any engine; Rust eliminates leak/UAF classes but not poor allocation patterns. |

---

## Architecture Patterns Specific to Rust

(For broader cross-engine patterns, see `architecture-patterns.md` and `design-patterns.md`.)

### ECS-first design

Bevy's ECS is **the** Rust-gamedev architecture. Key idioms:

- **Components**: plain `#[derive(Component)]` structs. Prefer many small components over a few god-objects.
- **Systems**: free functions taking `Query<...>`, `Res<...>`, `Commands` arguments. Bevy infers scheduling from the parameter types.
- **Resources**: shared mutable state outside the entity world. Tag with `#[derive(Resource)]`.
- **Events**: decouple producers and consumers via `EventWriter<T>` / `EventReader<T>`.
- **States**: high-level FSM via Bevy `States` — gates entire systems on state transitions.
- **Change detection**: `Changed<T>` / `Added<T>` query filters — skip work when components haven't changed.

### Plugin pattern (Bevy first-class)

Every Bevy feature is a `Plugin` — `app.add_plugins(MyPlugin)`. Encourages a modular codebase. Workspace crate boundaries align naturally with plugin boundaries.

### Error handling

- **`Result<T, GameError>`** for fallible runtime operations.
- **`anyhow::Error`** for application-level errors where the caller will log-and-bail.
- **`thiserror`** for library-level errors with structured variants.
- **`expect("descriptive message")`** is acceptable for invariants you genuinely don't expect to fail; `unwrap()` is a code smell.

### Async patterns

- **`bevy_tasks`** — Bevy's own task pool; integrates with the ECS scheduler. Use for compute-heavy work parallelisable per entity / per chunk.
- **Raw `tokio` / `async-std`** are **not** the Bevy default. Bevy intentionally avoids a runtime dependency. Use only when integrating an external async ecosystem (HTTP clients, networking).
- **Macroquad's `async/await`** — single-threaded, runtime-free, designed for the main loop.

### State management

- **`States`** for high-level (main menu / in-game / paused) — Bevy native.
- **Custom FSM** for fine-grained state (per-entity AI). Many crates exist (`bevy_state`, `seldom_state`).

### Save game

- **`serde` derive** + a binary format — `bincode` (compact, fast), `postcard` (no-std friendly), or `rmp-serde` (MessagePack — debuggable).
- **Versioning**: include a `version: u32` field; write explicit migrations.
- **Cross-platform** save paths: use `dirs` or `directories` crate for OS-aware user-data paths.

---

## Testing Patterns

(Cross-reference `qa-testing.md` for engine-agnostic test strategy.)

### Unit tests

`#[cfg(test)] mod tests { ... }` modules — pure-logic tests. Idiomatic for math, ECS components without engine dependency, save/load logic.

### Integration tests

`tests/` directory — each file is a separate binary, tests the public crate API.

### Bevy headless tests

```rust
use bevy::app::App;
use bevy::MinimalPlugins;

#[test]
fn my_system_runs() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);
    app.add_systems(Update, my_system);
    app.update(); // tick the schedule once
    // assertions on world state
}
```

Pair with `bevy_headless` or `MinimalPlugins` set to skip windowing/render init.

### Property-based testing

**`proptest`** — generate randomised inputs for game logic (procedural generation, combat formulas, save/load round-trip). High signal-to-noise for game systems.

### Benchmarking

**`criterion`** — statistical benchmarking, ships HTML reports. Critical for tight inner loops (ECS iteration, math).

### Replay testing for deterministic games

Deterministic lockstep games: capture input stream + initial seed, replay to reach expected end state. Pair with `criterion` for performance regression detection.

---

## Tooling Ecosystem

### Cargo plugins (Rust-side build/dev tools)

| Plugin | Purpose |
|---|---|
| `cargo-watch` | Rebuild on file change |
| `cargo-flamegraph` | One-shot flamegraph from a `cargo` workload (uses `perf` on Linux, `dtrace` elsewhere) |
| `cargo-bloat` | What's biggest in the binary? `cargo bloat --release --crates` |
| `cargo-machete` | Find unused dependencies |
| `cargo-deny` | Supply-chain audit: licences, advisories, dupes |
| `cargo-audit` | RustSec advisory database check |
| `cargo-nextest` | Parallel test runner, 35% faster than `cargo test` baseline |
| `cargo-expand` | Show macro-expanded source — invaluable when debugging Bevy `#[derive]`s |
| `cargo-mobile2` | iOS / Android project generation |
| `cargo-apk` | Android APK build |

### Lints

- **`clippy`** is mandatory in CI. `cargo clippy -- -D warnings`.
- **Gamedev-specific lint preferences**:
  - Prefer `.expect("reason")` over `.unwrap()` — meaningful failure messages.
  - `#![deny(clippy::unwrap_used)]` at crate root for production code.
  - Allow `#[allow(clippy::type_complexity)]` for ECS queries — they get verbose by design.

### Editor / IDE support

- **rust-analyzer** — canonical LSP; works in VS Code, Neovim, Helix, IntelliJ.
- **VS Code Rust extension** — Microsoft-maintained rust-analyzer wrapper.
- **IntelliJ Rust** — JetBrains plugin, separate analyser; pair with CLion or IntelliJ IDEA.
- **Zed** — newer editor, native rust-analyzer integration.

### Profiling

- **Tracy** — real-time nanosecond-resolution profiler, frame/sampling hybrid. Bevy ships with `trace_tracy` feature: `cargo run --features bevy/trace_tracy`. GPU spans appear as a `RenderQueue` row. Memory tracking: `bevy/trace_tracy_memory`.
- **`tracing-tracy`** crate — integration between Rust's `tracing` framework and the Tracy protocol.
- **`cargo flamegraph`** — flamegraph in one command. Linux: `perf`-based; macOS / Windows: `dtrace` / `xperf`.
- **`samply`** — Rust-written profiler, Firefox Profiler UI; better macOS support than `perf`.

### Build acceleration

- **`mold`** linker (Linux) — 30-70% off link time.
- **`lld`** (cross-platform alt) — Rust 1.74+ ships with built-in `lld` on Linux for `rustc -Z` builds; explicit `linker = "lld"` on stable.
- **`sccache`** — compile cache (`RUSTC_WRAPPER=sccache`). Disable for release builds with `lto="fat"`.
- **GitHub Actions cache**: `Swatinem/rust-cache@v2` is the canonical cache action for `~/.cargo` + `target/`.

---

## Production Stories — Rust Game Postmortems

### Tiny Glade (Pounce Light, 2024)

- Two-person Swedish studio (Anastasia Opara + Tomasz Stachowiak).
- Originally a weekend procedural-wall generator that grew into a full title.
- Bevy ECS + Rust throughout.
- Self-published, free demo June 2024, full release September 2024.
- Discussed in: <https://80.lv/articles/exclusive-tiny-glade-developers-discuss-bevy-proceduralism-publishers-cozy-games>, Bevy GitHub discussion <https://github.com/bevyengine/bevy/discussions/18689>.
- Validates Bevy for indie commercial shipping.

### Veloren (open-source MMO, ongoing)

- Voxel MMORPG in Rust, GNU GPL 3.0.
- ~20 active developers + ~20 artists / composers / designers / writers.
- Server + client share Rust crates — same code on both ends, deterministic where required.
- Last commit on the GitHub mirror: 2026-05-16; continuous releases.
- Source: <https://gitlab.com/veloren/veloren>. Wiki: <https://wiki.veloren.net/>.

### A/B server scaling — Bevy networking

- `bevy_replicon` + `bevy_quinnet` give server-authoritative replication over QUIC.
- QUIC carries TLS 1.3 — authentication and encryption by default.
- Quinnet's synchronous API surface (over async Quinn) is intentionally Bevy-ergonomic.
- Production-readiness: alpha-to-beta — used in indie + tech-demo titles, not yet a household-MMO scale validation.

---

## Community + Resources

### Canonical resources

- **Are We Game Yet?** — <https://arewegameyet.rs/> — canonical gamedev-in-Rust ecosystem dashboard. Has been running for ~8 years. (Note: a forum post in January 2025 mentioned the site had stopped updating in July of that year; check the GitHub repo <https://github.com/rust-gamedev/arewegameyet> for current maintenance status before relying on it as a real-time source.)
- **Bevy News** — <https://bevy.org/news/> — official release notes and roadmap posts.
- **This Week in Bevy** — <https://thisweekinbevy.com/> — community newsletter covering Bevy ecosystem changes, plugins, and shipped games. Active in 2026.
- **This Month in Rust GameDev** — <https://gamedev.rs/news/> — Rust Gamedev Working Group monthly newsletter. Issue cadence has slowed but archives remain valuable.
- **Rust GameDev WG** — <https://github.com/rust-gamedev/wg> — working group, monthly meetings, RFCs.

### Communities

- **r/rust_gamedev** — subreddit.
- **Bevy Discord** — main Bevy community hub (~20k+ members in 2025-2026).
- **Rust GameDev Meetup Discord** — cross-engine Rust gamedev chat.
- **Rust users forum** — <https://users.rust-lang.org> — `gamedev` topic.

### Books / Tutorials

- **"Hands-On Rust"** (Herbert Wolverson, 2021) — paid book, still relevant for learning Rust *via* gamedev. Roguelike-focused.
- **"Roguelike Tutorial in Rust"** — <https://bfnightly.bracketproductions.com/> — free, hosted by Bracket Productions. Uses RLTK (`bracket-lib`). Actively maintained (Chapter 70 added ranged combat as of recent updates).
- **Unofficial Bevy Cheat Book** — <https://bevy-cheatbook.github.io/> — extensive task-oriented Bevy reference (size optimisation, platform notes, ECS patterns). Single most-cited Bevy learning resource in the community.
- **Learn Wgpu** — <https://sotrh.github.io/learn-wgpu/> — canonical wgpu tutorial for the DIY-stack path.

### Curated lists

- **`awesome-rust-gamedev`** — <https://github.com/NightsWatchGames/awesome-rust-gamedev>.
- **`rust-game-development-frameworks`** — <https://github.com/dasifefe/rust-game-development-frameworks>.

---

## Sources

(All URLs verified May 2026.)

### Engines and major crates

- Bevy official — <https://bevy.org/>
- Bevy 0.18 release notes — <https://bevy.org/news/bevy-0-18/>
- Bevy 0.17 → 0.18 migration guide — <https://bevy.org/learn/migration-guides/0-17-to-0-18/>
- Bevy GitHub releases — <https://github.com/bevyengine/bevy/releases>
- Bevy Editor roadmap — <https://bevyengine.github.io/bevy_editor_prototypes/roadmap.html>
- Solari raytracing in Bevy 0.19 — <https://jms55.github.io/posts/2026-04-12-solari-bevy-0-19/>
- Macroquad repo — <https://github.com/not-fl3/macroquad>
- Macroquad WASM guide — <https://macroquad.rs/articles/wasm/>
- ggez — <https://ggez.rs/>, <https://github.com/ggez/ggez>
- Fyrox — <https://fyrox.rs/>, <https://github.com/FyroxEngine/Fyrox>
- Comfy — <https://github.com/darthdeus/comfy>
- Ambient — <https://github.com/AmbientRun/Ambient>
- wgpu — <https://wgpu.rs/>, <https://github.com/gfx-rs/wgpu>
- glam — <https://github.com/bitshifter/glam-rs>
- Rapier — <https://github.com/dimforge/rapier>
- `bevy_rapier3d` — <https://crates.io/crates/bevy_rapier3d>
- Kira — <https://github.com/tesselode/kira>
- Lyon — <https://github.com/nical/lyon>
- egui — <https://github.com/emilk/egui>, <https://www.egui.rs/>
- `bevy_replicon` — <https://docs.rs/bevy_replicon/>
- `bevy_quinnet` — <https://github.com/Henauxg/bevy_quinnet>

### Toolchain and build

- The Cargo Book (Profiles) — <https://doc.rust-lang.org/cargo/reference/profiles.html>
- `cargo-mobile2` — <https://github.com/tauri-apps/cargo-mobile2>
- `cargo-apk` — <https://github.com/rust-mobile/cargo-apk>
- `dexterous_developer` — <https://github.com/lee-orr/dexterous_developer>
- `wasm-server-runner` — <https://github.com/jakobhellermann/wasm-server-runner>
- `mold` linker — <https://github.com/rui314/mold>
- `cargo-flamegraph` — <https://github.com/flamegraph-rs/flamegraph>
- Tracy / Bevy profiling docs — <https://github.com/bevyengine/bevy/blob/main/docs/profiling.md>
- Unofficial Bevy Cheat Book (WASM size opt) — <https://bevy-cheatbook.github.io/platforms/wasm/size-opt.html>

### Production games and case studies

- Tiny Glade interview (80.lv) — <https://80.lv/articles/exclusive-tiny-glade-developers-discuss-bevy-proceduralism-publishers-cozy-games>
- Tiny Glade Wikipedia — <https://en.wikipedia.org/wiki/Tiny_Glade>
- Tiny Glade on Steam — <https://store.steampowered.com/app/2198150/Tiny_Glade/>
- Pounce Light studio — <https://pouncelight.games/>
- JARL — <https://www.jarl-game.com/>
- MegaFactory Tycoon on Steam — <https://store.steampowered.com/app/3891760/MegaFactory_Tycoon/>
- Veloren — <https://veloren.net/>, <https://gitlab.com/veloren/veloren>

### Community + learning

- Are We Game Yet? — <https://arewegameyet.rs/>
- Rust GameDev WG — <https://github.com/rust-gamedev/wg>, <https://gamedev.rs/>
- This Week in Bevy — <https://thisweekinbevy.com/>
- Unofficial Bevy Cheat Book — <https://bevy-cheatbook.github.io/>
- Learn Wgpu — <https://sotrh.github.io/learn-wgpu/>
- Roguelike Tutorial in Rust — <https://bfnightly.bracketproductions.com/>
- awesome-rust-gamedev — <https://github.com/NightsWatchGames/awesome-rust-gamedev>
- rust-game-development-frameworks — <https://github.com/dasifefe/rust-game-development-frameworks>
- StraySpark "Bevy 0.18 in 2026" — <https://www.strayspark.studio/blog/bevy-rust-game-engine-2026-indie-guide>
