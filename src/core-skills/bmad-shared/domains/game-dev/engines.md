# Domain Sub-File: Engines

**Parent:** `domains/game-dev.md`
**Scope:** Idiomatic patterns, known gotchas, performance baselines, pricing models, sourced URLs, and recent releases for the 7 engines most commonly encountered in game-dev workflows (as of May 2026).
**Source pin:** Engine vendor official documentation and release notes (verified May 2026). Patterns + URLs only; no engine vendor code copied (OOS-5 preserved).

Engine ordering reflects market presence + workflow relevance, NOT a recommendation: Unity > Unreal > Godot > Phaser > Bevy > Stride > Cocos Creator.

---

## Unity (6.x)

### Recent releases (May 2026)

- **Unity 6.3 LTS** (6000.3) — released December 2025, supported until **December 2027**. The current default for new projects.
- **Unity 6.0 LTS** — earlier LTS, EOL October 2026. Legacy projects on 6.0 should plan a migration window before that date.
- **Unity 6.4 beta** — in preview as of Q1 2026. Adds DirectStorage, expanded XR feature set. Not for production.
- 2026 roadmap: CoreCLR runtime experimentation, "Verified Packages" reliability program.

### Idiomatic patterns

- **DOTS (Data-Oriented Technology Stack)** — stable in Unity 6.x. Use for performance-critical simulation code (100k+ entities at 60 FPS on mid-range laptop per Unity's published 6.0 benchmarks). Entities + Burst Compiler + Job System are the canonical trio.
- **GPU Resident Drawer** — render path improvement shipped with Unity 6. Reduces CPU overhead for scenes with many static mesh renderers. Enable per-render-pipeline-asset (URP / HDRP).
- **Addressables** — preferred asset management strategy over legacy Resources/AssetBundles. Catalogue-backed, supports remote content, hot-reload friendly.
- **ScriptableObjects** for data-driven config (items, abilities, level metadata). Avoid serialised MonoBehaviour fields for shared static data.
- **Unified Render Graph (6.3)** — both URP and HDRP now share the same Render Graph compiler and API; custom render passes ported between pipelines with less rewrite.
- **Box2D v3 (6.3)** — low-level 2D physics API integration of the latest actively-developed Box2D version. Multi-threaded, deterministic, in-Editor visual debugging. Use for new 2D projects targeting 6.3+.
- **xAtlas Lightmap Packing (6.3)** — default packer for new scenes; packs actual UV shapes instead of bounding boxes. Existing scenes keep the legacy packer to avoid layout breaks.
- **URP Kawase / Dual Bloom (6.3)** — mobile-optimised Bloom filters. Significantly cheaper on mobile GPUs than the legacy Gaussian implementation.

### Known gotchas

- **Mobile pipeline (URP vs HDRP) is one-way at project creation time.** Switching mid-project is a rewrite — decide in the architecture step.
- **Mono → IL2CPP backend switch** breaks Reflection-heavy code (serialisation, dependency injection containers). Test the IL2CPP build path early.
- **Editor-only code (`#if UNITY_EDITOR`) leaking into runtime assemblies** is a common build break — separate Editor assemblies.
- **Garbage allocations in `Update()` loops** kill mobile FPS. Profile with Unity Profiler's Hierarchy → "GC.Alloc" column.
- **6.0 → 6.3 upgrade is opt-in but recommended** for the unified Render Graph and Box2D v3. Legacy 2D physics API still works in 6.3 but is on a deprecation path.
- **Havok physics is no longer bundled in 6.3 LTS plans.** Projects requiring Havok must license separately or migrate to Box2D v3 / built-in.

### Performance baselines

- Hot path: 60 FPS minimum on target hardware.
- Mobile baseline: 30 FPS minimum on representative mid-tier device (e.g. Samsung Galaxy A54, iPhone 12). 60 FPS preferred for action genres.
- VR baseline: 90 FPS minimum (Quest 3 / PCVR). Below 90 FPS = motion sickness risk.
- DOTS reference: 100k animated entities @ 60 FPS on mid-range laptop (Unity 6.0 official benchmark).

### Pricing model (effective January 12, 2026)

- **Personal**: free, unlimited seats (3-seat cap removed), revenue threshold raised.
- **Pro**: $2,310/seat/year (or $210/month) — up from $2,200/year following the 2026 5% adjustment. 1:1 seats limit removed.
- **Enterprise**: custom — also +5% in 2026, 1:1 seats limit removed.
- **Runtime Fee**: CANCELLED September 2024. Pricing reverted to seat-based subscription. No retroactive fees.
- DevOps: Unity Version Control hosted in Unity's public cloud — seat charges removed Q1 2026; free pay-as-you-go storage tier expanded from 5 GB to 25 GB.

### Sourced URLs

- Unity 6.3 release notes — <https://docs.unity3d.com/6000.3/Documentation/Manual/WhatsNewUnity63.html>
- Unity 6 release & support — <https://unity.com/releases/unity-6/support>
- Unity LTS overview — <https://unity.com/products/unity-lts>
- Unity 2026 pricing changes — <https://unity.com/products/pricing-updates>
- Runtime Fee cancellation — <https://support.unity.com/hc/en-us/articles/30322080156692-Cancellation-of-the-Runtime-Fee-and-Pricing-Changes>
- DOTS overview — <https://docs.unity3d.com/Packages/com.unity.entities@latest>
- URP performance guide — <https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@latest>
- Profiler Hierarchy view — <https://docs.unity3d.com/Manual/ProfilerHierarchy.html>
- Unity 2026 roadmap (CoreCLR / Verified Packages) — <https://digitalproduction.com/2025/11/26/unitys-2026-roadmap-coreclr-verified-packages-fewer-surprises/>

---

## Unreal Engine (5.6 / 5.7)

### Recent releases (May 2026)

- **UE 5.6** — released June 2025. Current production-recommended LTS-equivalent. Focus: large open worlds at 60 FPS, MetaHuman in-engine authoring.
- **UE 5.7** — full release November 2025; preview was September 2025. Production-ready PCG framework, Substrate materials, MetaHuman Creator real-time animation from external cameras.
- Roadmap: AI-powered Epic Developer Assistant integration, continued Substrate adoption.

### Idiomatic patterns

- **Gameplay Framework**: `AActor` + `UActorComponent` composition. Avoid deep inheritance hierarchies — prefer Components for orthogonal capabilities.
- **Blueprints + C++ hybrid** is the canonical authoring model. Designers iterate in Blueprints; engineers expose C++ APIs as `BlueprintCallable` / `BlueprintImplementableEvent`.
- **Lyra sample project** is the reference architecture for live-service multiplayer games. Mirror its module structure (`LyraGame`, `LyraGameRuntime`, `LyraGameCore`).
- **Enhanced Input system** — replaces legacy Input. Use Input Mapping Contexts + Input Actions.
- **MetaHuman in-engine authoring (5.6+)** — full character creation (faces, bodies, outfits) without round-tripping through external DCC tools. Outfit asset auto-resizes when the MetaHuman body changes.
- **Fast Geometry Streaming Plugin (5.6, experimental)** — for immutable static geometry in massive open worlds. Loads faster with constant frame rates. Works alongside World Partition (not a replacement). NOT yet production-recommended.
- **Substrate (5.7, production-ready)** — modular material authoring framework with native layered/blended material support. Replaces the legacy material model for new projects targeting 5.7+.
- **Procedural Content Generation Framework (5.7, production)** — ~2× faster than the 5.5 implementation. Use for runtime/cook-time procedural placement (foliage, debris, encounters).

### Known gotchas

- **Blueprint VM cost**: tight loops in Blueprints are 10-100× slower than C++ equivalents. Profile with Stat Game / Stat GPU first.
- **Garbage Collector pauses (UObject GC)** cause frame hitches if too many UObjects are spawned/destroyed per frame. Use object pools.
- **Hot reload (Live Coding)** drifts state — full editor restart needed after structural changes to UPROPERTY declarations.
- **Mobile renderer (forward renderer)** has feature parity gaps vs PC deferred. Test mobile build early — features like dynamic shadow distance, post-process volumes have mobile-specific paths.
- **5.6 → 5.7 migration**: Substrate is opt-in. Existing material graphs continue to work on the legacy model. Don't migrate mid-project unless Substrate is needed.
- **Fast Geometry Streaming is experimental**; don't ship to retail on 5.6 without a fallback plan.

### Performance baselines

- Hot path: 60 FPS on console-target hardware (PS5 / Xbox Series X).
- Mobile baseline: 30 FPS on iPhone 12 / mid-tier Android (Snapdragon 8 Gen 2 class). 60 FPS attainable but expensive.
- VR baseline: 90 FPS minimum (PCVR). Quest standalone benefits from FFR (Fixed Foveated Rendering) for sustained 90 FPS.
- Mobile renderer 5.5/5.6 features: D-buffer decals, rect area lights, volumetric fog now mobile-supported.

### Pricing model

- **Free for game developers** until $1M lifetime gross revenue per product.
- **5% royalty on gross revenue above $1M** lifetime threshold per product.
- **3.5% reduced royalty** for games released on the Epic Games Store at-launch or earlier than other stores.
- **Revenue from the Epic Games Store is royalty-free** (no royalty on Epic Store sales regardless of total revenue).
- Non-game seats (enterprise / film / industrial): custom-priced.

### Sourced URLs

- Unreal Engine 5.6 announcement — <https://www.unrealengine.com/news/unreal-engine-5-6-is-now-available>
- Unreal Engine 5.7 release notes — <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-7-release-notes>
- Unreal Engine 5.7 announcement — <https://www.unrealengine.com/news/unreal-engine-5-7-is-now-available>
- UE licensing terms — <https://www.unrealengine.com/license>
- Lyra sample project — <https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-sample-game-in-unreal-engine>
- Mobile rendering performance — <https://dev.epicgames.com/documentation/en-us/unreal-engine/mobile-rendering-performance-considerations>
- Enhanced Input — <https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine>
- Stat commands reference — <https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine>
- Public roadmap (Productboard) — <https://portal.productboard.com/epicgames/1-unreal-engine-public-roadmap>

---

## Godot (4.6)

### Recent releases (May 2026)

- **Godot 4.6** — released January 2026. Focus: polish, QoL, performance optimisation, tighter integration of industry standards.
- **Jolt** is now the **default 3D physics engine** for new projects in 4.6 (replacing the in-house engine).
- **LibGodot**: new ability to embed the engine into custom host applications (control startup, manage the engine loop, integrate into larger systems).
- C# packages target **.NET 8 LTS** (since 4.4+). Proposal to target .NET 10 in a future release is open but NOT confirmed for 4.6.
- **Patch PCK delta encoding**: export workflow now produces smaller update deltas.

### Idiomatic patterns

- **Node-based scene composition** — each scene is a tree of nodes; instance scenes hierarchically.
- **Signals** (Godot's observer pattern) for inter-node communication. Avoids tight coupling vs direct node references.
- **GDScript** for most gameplay code (Python-like, tightly coupled to Godot APIs). **C#** for performance-critical or shared-library code (.NET 8 in 4.x).
- **Resource files (`.tres`)** for shared configuration — Godot's equivalent to Unity ScriptableObjects.
- **Jolt physics (default 4.6+)** — adopt for new 3D projects. Existing projects can opt-in.

### Known gotchas

- **4.x is NOT backward-compatible with 3.x** — projects migrating require a deliberate port effort. Don't try to gradually migrate.
- **GDScript performance** is a fraction of compiled C# / C++. Profile early; rewrite hot loops in C# or GDExtension (C++).
- **Editor → Export pipeline for mobile (iOS)** requires platform-specific signing/provisioning. Setup is one-time but Godot's docs are sparser than Unity/Unreal here.
- **C# web export remains R&D, NOT production.** As of 4.6, exporting C# projects to the Web is not supported. GDScript is the only language usable for web-exported builds.
- **Console export is NOT native to Godot.** Use middleware partners — primarily **W4 Games** (`W4 Consoles` supports Switch, Switch 2 native port, Xbox Series X|S, PS5; optimised for Godot 4.3+) or **Pineapple Works** (porting-as-a-service). Plan for a 4-6 month porting partnership window when targeting consoles.

### Performance baselines

- Hot path: 60 FPS on target hardware.
- 2D throughput (Godot's sweet spot): 1000 sprites @ 75 FPS mid-range laptop, 3000+ sprites @ 60 FPS desktop.
- Mobile baseline: 30 FPS on mid-tier device; 60 FPS attainable for 2D / low-poly 3D.
- Android device mirroring (4.6 feature) shortens iteration time for mobile builds.

### Pricing model

- **MIT-licensed, free, royalty-free** for any use (commercial included). No revenue threshold, no per-platform fees from the Godot Foundation.
- **Console export licensing** has separate cost via W4 Games or Pineapple Works (project-by-project pricing).
- No subscription, no seat fees.

### Sourced URLs

- Godot 4.6 release — <https://godotengine.org/releases/4.6/>
- Godot 4 documentation — <https://docs.godotengine.org/en/stable/>
- C# / .NET integration — <https://docs.godotengine.org/en/4.6/tutorials/scripting/c_sharp/>
- GDScript performance tips — <https://docs.godotengine.org/en/stable/tutorials/performance/general_optimization.html>
- Console support overview — <https://godotengine.org/consoles/>
- W4 Consoles — <https://www.w4games.com/w4consoles>
- W4 Games console support announcement — <https://www.w4games.com/blog/w4-games-news-1/godot-support-for-consoles-is-coming-brought-to-you-by-w4-games-20>
- Pineapple Works — <https://pineapple.works/>

---

## Phaser (4.0 "Caladan")

### Recent releases (May 2026)

- **Phaser 4.0 "Caladan"** — released **10 April 2026**. Largest release in framework history. Ground-up WebGL renderer rewrite, GPU-powered sprites, unified filters, simplified lighting.
- Architecture refactored to allow Canvas / WebGL2 / WebGPU backends to coexist without per-renderer rewrites; the v4.0 initial release targets WebGL 2.0 as the primary backend.
- **WebGPU support is on the roadmap**, not yet shipped in the 4.0 stable line.
- Phaser 3.x remains supported for legacy projects; the Phaser team published a Phaser 3 vs Phaser 4 migration guide.

### Idiomatic patterns

- **Scene-based architecture (`Phaser.Scene`)** — each game state (menu / gameplay / pause) is a scene. Switch via `this.scene.start()`.
- **TypeScript-first** for non-trivial projects. Phaser ships TypeScript types; community templates (Phaser + Vite + TS) are the canonical bootstrap.
- **Sprite + Physics (Arcade / Matter)** — Arcade for AABB-based platformers/shooters; Matter for realistic 2D physics.
- **Asset Pack JSON** for batch asset loading — keeps preload phase declarative.
- **Unified filters (4.0)** — replaces the legacy mixed shader / post-FX system. Single API for both per-object and screen-space effects.
- **GPU-powered sprites (4.0)** — batched submission, less CPU overhead per sprite. Critical for high-sprite-count scenes (bullet-hells, particle-heavy games).

### Known gotchas

- **WebGL 1 fallback** — WebGL 2 features (instancing, MRT) won't be available on older mobile browsers. Phaser falls back automatically but performance drops.
- **Audio on iOS Safari** requires user-gesture-initiated context resume — design around the touch-to-start pattern.
- **Browser tab backgrounding** pauses `requestAnimationFrame` — use Phaser's `game.events.on('hidden')` to handle gracefully.
- **Phaser 4 migration**: ground-up renderer rewrite means custom shaders / pipelines written against Phaser 3.x need porting. Budget migration time accordingly.
- **WebGPU not yet stable** — if your target is WebGPU, defer or use a different framework. The v4.0 architecture supports it but the backend is not shipped.

### Performance baselines

- Hot path: 60 FPS in Chrome / Firefox / Edge on mid-tier desktop.
- Mobile web baseline: 30 FPS minimum on iPhone 12 Safari; 60 FPS achievable with Arcade physics + sprite-sheet atlases.
- Memory budget: aim for < 200 MB heap on mobile to avoid Safari kill (especially iOS).
- Asset budget: < 50 MB total download for casual web games (gated by mobile data caps).

### Pricing model

- **MIT-licensed, free, royalty-free**. No revenue threshold.
- Optional commercial support contracts via Phaser Studio Inc.
- No platform-store cuts from Phaser itself — web distribution / store cuts are vendor-specific (e.g. Poki, CrazyGames, Facebook Instant Games).

### Sourced URLs

- Phaser 4.0 download — <https://phaser.io/download/release/v4.0.0>
- Phaser 3 vs Phaser 4 (transition guide) — <https://phaser.io/news/2026/05/phaser-3-vs-phaser-4>
- Phaser 4.0 forked with WebGL 2.0 — <https://phaser.io/news/2025/11/phaser-40-forked-with-full-webgl-20-support>
- Phaser API & docs — <https://docs.phaser.io/phaser/getting-started>
- Phaser API reference — <https://docs.phaser.io/api-documentation/api-documentation>
- Phaser + Vite + TypeScript template — <https://github.com/phaserjs/template-vite-ts>
- Phaser Dev Logs — <https://phaser.io/devlogs/>

---

## Bevy (0.18, Rust)

### Recent releases (May 2026)

- **Bevy 0.18** — released March 2026. 174 contributors, 659 PRs. Major focus: stable rendering, mature asset pipeline, working editor preview.
- Highlights: Atmosphere Occlusion + PBR Shading (procedural atmosphere affects scene lighting), Cargo Feature Collections (modular compile-time inclusion of 2D / 3D / UI), first-party `fly` and `pan` camera controllers.
- Shipped Bevy games: **Tiny Glade** remains the flagship commercial title. Newer 2026 titles include **Toroban** (Steam — infinitely wrapping puzzle), **JARL** (entering second playtest), **MegaFactory Tycoon** (Steam page live — real-time-simulated factory management).
- 6-week minor release cadence (0.x → 0.x+1 quarterly-ish). Editor still preview-only; production teams typically pair Bevy with code-editor workflows (rust-analyzer, VS Code, Cursor).

### Idiomatic patterns

- **Pure ECS-first**: everything is a Component, every System is a pure function over Queries. No GameObjects / inheritance.
- **Plugin architecture** — features ship as `Plugin` implementations; compose via `App::add_plugins(...)`. The community ecosystem (`bevy_rapier`, `leafwing-input-manager`, `bevy_egui`) follows the same model.
- **Cargo Feature Collections (0.18+)** — select only the subsystems you need. A 2D-only game can drop 3D / animation / PBR features at compile time for smaller binaries and faster iteration.
- **Rust async / parallel** by default — ECS Systems run on a thread pool; data races caught at compile time by Rust's borrow checker.

### Known gotchas

- **API still pre-1.0** — breaking changes between minor versions are expected. Pin `bevy = "0.18"` strictly; budget rewrite time on each upgrade.
- **No mature editor** — the in-tree editor is preview-only. Workflows are code-first (no drag-and-drop scene editor analogous to Unity / Unreal). Pair Bevy with art DCC tooling externally.
- **Console export is not officially supported.** Some community work on Switch and PS5 exists but no first-party path. AAA console targets are out-of-scope for Bevy as of 0.18.
- **Compile times** — Rust + Bevy can be slow on initial builds. Use `mold` linker (Linux), `lld` (cross-platform), and `cargo-watch` for fast iteration.
- **Learning curve** — Rust + ECS-first is steeper than Unity/Godot for designers/scripters. Bevy is engineer-led.

### Performance baselines

- 2D throughput: in the same ballpark as native code engines (millions of sprites possible with batched submission).
- 3D: PBR scene at 60 FPS on mid-range desktop is the baseline; the renderer received major perf work in 0.17/0.18.
- WebAssembly (wasm32) target supported — good for itch.io / web demos. Mobile / console NOT officially targeted.

### Pricing model

- **MIT OR Apache-2.0 dual licensed, free, royalty-free**. No vendor.
- Foundation funded by Bevy Foundation + donations.

### Sourced URLs

- Bevy 0.18 release notes — <https://bevy.org/news/bevy-0-18/>
- Bevy main site — <https://bevy.org/>
- Bevy GitHub — <https://github.com/bevyengine/bevy>
- Bevy releases — <https://github.com/bevyengine/bevy/releases>
- Quick start tutorial — <https://bevy.org/learn/quick-start/introduction/>
- This Week in Bevy (community newsletter) — <https://thisweekinbevy.com/>
- MegaFactory Tycoon (Steam) — <https://store.steampowered.com/app/3891760/MegaFactory_Tycoon/>

---

## Stride (4.3, C# / .NET 10)

### Recent releases (May 2026)

- **Stride 4.3** — currently the headline release, fully compatible with **.NET 10** and leveraging **C# 14**.
- Brings: Bepu Physics integration, Vulkan compute shaders, custom assets, cross-platform build profiles ("strides"), mesh buffer helpers, Rider / VS Code support, performance and stability fixes.
- Visual Studio 2026 Community (free) bundles the .NET 10 SDK; this is the recommended IDE pairing.

### Idiomatic patterns

- **ECS via Component Processors** — user-defined classes that collect and process all components of a given type. Type-safe; supports processing components by interface.
- **Game Studio** — Stride's built-in editor (visual scene composition, asset management). Workflow analogous to Unity Editor but the underlying runtime is pure C# .NET.
- **C# 14 / .NET 10** — new language features (collection expressions, partial properties, params collections) reduce gameplay-code boilerplate.
- **Custom assets** — first-class extensibility: developers can register their own asset types and import pipelines.
- **Cross-platform build strides** — single project descriptor produces builds for Windows / Linux / macOS / Android / iOS.

### Known gotchas

- **Smaller community + ecosystem** than Unity / Unreal. Third-party packages are sparser; expect to write more glue code.
- **Console export is community / partner-driven**, not first-party.
- **No web export** (no WebAssembly target as of 4.3).
- **Stride documentation depth is uneven** — core systems documented well, edge cases (advanced rendering, multiplayer netcode) require source-reading.

### Performance baselines

- Bepu Physics is performant for 3D rigid body simulation; competitive with PhysX for most scenarios.
- Vulkan compute shaders unlock GPGPU workloads (particles, terrain, simulation).
- Performance ceiling tied to .NET 10 runtime + Vulkan — competitive with Unity HDRP for desktop, with the caveat of a much smaller engineering team behind the renderer.

### Pricing model

- **MIT-licensed, free, royalty-free**. Open-source on GitHub (`stride3d/stride`).
- No vendor, no per-platform fees from Stride itself.
- Optional commercial support / training via the Stride team.

### Sourced URLs

- Stride 4.3 announcement (.NET 10) — <https://www.stride3d.net/blog/announcing-stride-4-3-in-dotnet-10/>
- Stride 4.3 release notes — <https://doc.stride3d.net/4.3/en/ReleaseNotes/>
- Stride main site — <https://www.stride3d.net/>
- Stride features — <https://www.stride3d.net/features/>
- Stride GitHub — <https://github.com/stride3d/stride>
- Stride releases — <https://github.com/stride3d/stride/releases>

---

## Cocos Creator (3.x)

### Recent releases (May 2026)

- Active version line: Cocos Creator 3.x. Continued investment in mobile / 2D / instant-games tooling.
- Dominant on the Chinese mobile market and increasingly used overseas for hyper-casual + instant games.
- Distribution targets include: Windows, macOS, iOS, Android, HarmonyOS, Web, Facebook Instant Games, **WeChat Mini Game**, **TikTok Mini Game**, plus Huawei / Xiaomi / Samsung instant gaming platforms (20+ targets total).

### Idiomatic patterns

- **Node + Component architecture** (TypeScript / JavaScript scripting). Similar mental model to Unity GameObjects + MonoBehaviour.
- **WeChat Mini Game-first publishing**: Cocos integrates the WeChat publishing API natively (audio, payments, storage, social).
- **2D-first; 3D capable** — Cocos Creator 3.0 unified the previously-separate 2D (Cocos2d-x) and 3D engines.
- **Asset management** via the Cocos Creator editor — visual hierarchy + drag-drop asset binding.

### Known gotchas

- **Western developer mindshare is small.** English-language documentation has improved but lags behind the Chinese sources. Community Q&A often happens in Chinese.
- **Best fit is mobile / 2D / instant games** — for AAA 3D or console targets, Unity / Unreal remain better choices.
- **Platform-specific quirks for WeChat / TikTok Mini Games**: 4 MB initial package size cap (WeChat), no native code, sandboxed JS runtime. Architect for the sandbox from day 1.

### Performance baselines

- WeChat Mini Game initial package: **≤ 4 MB** (platform cap). Use sub-package loading for additional content.
- Mobile native (iOS / Android): targets 60 FPS on mid-tier devices for 2D / hyper-casual.
- Web: lightweight runtime — competitive with Phaser for casual 2D web games.

### Pricing model

- **MIT-licensed engine**, free. Royalty-free for the engine itself.
- Cocos services (cloud, analytics, ads) are paid optionally.
- Platform store cuts (WeChat, TikTok, Apple App Store, Google Play) apply as usual — not a Cocos charge.

### Sourced URLs

- Cocos Creator product page — <https://www.cocos.com/en/creator>
- Cocos Engine GitHub — <https://github.com/cocos/cocos-engine>
- Cocos Creator for TikTok Games — <https://www.cocos.com/en/post/cocos-creator-can-help-you-build-your-tiktok-games>
- Cocos Creator WeChat games — <https://www.cocos.com/en/post/the-new-best-wechat-games-built-with-cocos-creator>
- Cocos 3.0 launch announcement — <https://gamesbeat.com/cocos-adds-3d-to-its-open-source-2d-game-engine-with-cocos-creator-3-0/>

<!-- TODO verify: Cocos Creator 2026 specific market-share percentages (45% China / 30% overseas) — vendor blog cites these numbers internally but no independent industry report was located in WebSearch as of May 2026. Treat as vendor-reported. -->

---

## Sources

Aggregated canonical URLs used in this sub-file:

### Unity

- <https://docs.unity3d.com/6000.3/Documentation/Manual/WhatsNewUnity63.html>
- <https://unity.com/releases/unity-6/support>
- <https://unity.com/products/unity-lts>
- <https://unity.com/products/pricing-updates>
- <https://support.unity.com/hc/en-us/articles/30322080156692-Cancellation-of-the-Runtime-Fee-and-Pricing-Changes>
- <https://docs.unity3d.com/Packages/com.unity.entities@latest>
- <https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@latest>
- <https://docs.unity3d.com/Manual/ProfilerHierarchy.html>
- <https://digitalproduction.com/2025/11/26/unitys-2026-roadmap-coreclr-verified-packages-fewer-surprises/>

### Unreal Engine

- <https://www.unrealengine.com/news/unreal-engine-5-6-is-now-available>
- <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-7-release-notes>
- <https://www.unrealengine.com/news/unreal-engine-5-7-is-now-available>
- <https://www.unrealengine.com/license>
- <https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-sample-game-in-unreal-engine>
- <https://dev.epicgames.com/documentation/en-us/unreal-engine/mobile-rendering-performance-considerations>
- <https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine>
- <https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine>
- <https://portal.productboard.com/epicgames/1-unreal-engine-public-roadmap>

### Godot + W4 / Pineapple Works

- <https://godotengine.org/releases/4.6/>
- <https://docs.godotengine.org/en/stable/>
- <https://docs.godotengine.org/en/4.6/tutorials/scripting/c_sharp/>
- <https://docs.godotengine.org/en/stable/tutorials/performance/general_optimization.html>
- <https://godotengine.org/consoles/>
- <https://www.w4games.com/w4consoles>
- <https://www.w4games.com/blog/w4-games-news-1/godot-support-for-consoles-is-coming-brought-to-you-by-w4-games-20>
- <https://pineapple.works/>

### Phaser

- <https://phaser.io/download/release/v4.0.0>
- <https://phaser.io/news/2026/05/phaser-3-vs-phaser-4>
- <https://phaser.io/news/2025/11/phaser-40-forked-with-full-webgl-20-support>
- <https://docs.phaser.io/phaser/getting-started>
- <https://docs.phaser.io/api-documentation/api-documentation>
- <https://github.com/phaserjs/template-vite-ts>
- <https://phaser.io/devlogs/>

### Bevy

- <https://bevy.org/news/bevy-0-18/>
- <https://bevy.org/>
- <https://github.com/bevyengine/bevy>
- <https://github.com/bevyengine/bevy/releases>
- <https://bevy.org/learn/quick-start/introduction/>
- <https://thisweekinbevy.com/>
- <https://store.steampowered.com/app/3891760/MegaFactory_Tycoon/>

### Stride

- <https://www.stride3d.net/blog/announcing-stride-4-3-in-dotnet-10/>
- <https://doc.stride3d.net/4.3/en/ReleaseNotes/>
- <https://www.stride3d.net/>
- <https://www.stride3d.net/features/>
- <https://github.com/stride3d/stride>
- <https://github.com/stride3d/stride/releases>

### Cocos Creator

- <https://www.cocos.com/en/creator>
- <https://github.com/cocos/cocos-engine>
- <https://www.cocos.com/en/post/cocos-creator-can-help-you-build-your-tiktok-games>
- <https://www.cocos.com/en/post/the-new-best-wechat-games-built-with-cocos-creator>
- <https://gamesbeat.com/cocos-adds-3d-to-its-open-source-2d-game-engine-with-cocos-creator-3-0/>
