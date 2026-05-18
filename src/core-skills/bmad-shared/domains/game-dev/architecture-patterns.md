# Domain Sub-File: Architecture Patterns (Game Dev)

Engineering patterns used by game projects to manage simulation scale, AI behaviour, runtime communication, persistence, and content streaming. This file covers WHAT-THE-PATTERN-IS, WHEN-IT-APPLIES, and which engine-native or third-party tools implement it in 2026. Genre-specific composition (e.g., "RTS = ECS + pathfinding + RTS-grid networking") lives in `genres-archetypes.md`. Networking deep-dives live in `multiplayer-architecture.md`. Persistence ops considerations live in `live-ops.md`.

## ECS (Entity Component System)

### Concept

ECS decomposes game objects into three orthogonal concerns:

- **Entities**: opaque identifiers (typically a 32- or 64-bit integer), no behaviour, no data.
- **Components**: pure data structs attached to entities (`Position`, `Velocity`, `Health`, `RenderableMesh`).
- **Systems**: pure functions that iterate over components and transform data (`MovementSystem` reads `Position` + `Velocity`, writes `Position`).

This is a **data-oriented** decomposition rather than an object-oriented one. Inheritance is replaced by composition; polymorphism is replaced by query-driven iteration ("for every entity with `Position` and `Velocity`, do X").

### Cache Locality Benefits

ECS frameworks store components in contiguous arrays (Structure of Arrays / SoA layout) rather than as fields inside heap-allocated objects (Array of Structures / AoS). Iterating 100k `Position` components becomes a tight loop over a packed array, fitting in L1/L2 cache lines and enabling SIMD vectorisation. The same operation over 100k `MonoBehaviour` instances incurs scattered heap allocation, cache misses on virtual dispatch, and GC pressure.

The canonical reference is Mike Acton's CppCon 2014 talk "Data-Oriented Design and C++" and Richard Fabian's book *Data-Oriented Design* (free online at <https://www.dataorienteddesign.com/dodbook/>).

### Frameworks

- **Unity DOTS (Data-Oriented Technology Stack)**. Production-ready in Unity 6.x. Three pillars: ECS for Unity (Entities package), C# Job System (multi-threaded scheduling), Burst Compiler (LLVM-backed AOT compilation of C# to native code with SIMD intrinsics). Unity 2026's Burst 3.2 is the first DOTS release with full ARMv9 SVE/SVE2 support for mobile CPUs (Snapdragon 8 Gen 3, MediaTek Dimensity 9300). Powers Havok Physics for Unity, providing deterministic large-scale simulation.
- **Unreal Mass Entity**. Native C++ simulation processor, introduced in UE 5.0 as experimental, marked production-ready in UE 5.2. Still under active development through UE 5.5-5.8; API changes are documented per-release. Integrates with State Tree, Smart Objects, and the Mass AI module. <!-- TODO verify: UE 5.5+ stability claims drawn from official docs and community samples, but the "still in active development" caveat persists per Epic's documentation. -->
- **Bevy ECS**. Rust-native, idiomatic. Bevy 0.18 (March 2026) marks the maturity inflection: ECS scheduler hit performance targets, asset pipeline rewrite from 0.15 settled, ecosystem (input, UI, audio, physics) reached usable assembly-without-rebuild state. Working editor preview shipped. Reasonable choice for new indie projects on Rust.
- **Flecs**. C / C++ / C# / Rust standalone library, MIT-licensed. Flecs 4.1 (June 2025) supports both archetype-style and sparse-set/independent-storage layouts in the same library — first open-source ECS to do so. World minimum footprint decreased 5x vs 4.0; overall RAM consumption up to 2x lower depending on workload. Engine-agnostic.
- **EnTT**. Header-only C++17 library, sparse-set based, MIT-licensed. Version 3.16.0 released 2026-01-05. Used in production by Minecraft (Mojang), ArcGIS Runtime SDKs (Esri), and various AAA C++ engines. No compile-time component registration required.

### When ECS

- 1000+ entities sharing similar behaviour (RTS units, bullet-hell projectiles, particle simulations, swarm AI, simulation-heavy games like *Factorio* or *Dwarf Fortress*).
- Performance-critical inner loops where SIMD and cache locality matter.
- Deterministic simulation requirements (rollback netcode, replay systems).
- Need to parallelise simulation across cores (DOTS Jobs, Bevy parallel schedulers).

### When NOT ECS

- Low entity count (< 100 actors with bespoke behaviour) — overhead of ECS query infrastructure exceeds gains.
- Prototype / game-jam phase — ECS demands upfront component decomposition design; refactoring an OOP prototype to ECS late is expensive.
- Deeply hierarchical actors with rich inheritance chains (e.g., Diablo-style RPG items). Composition is possible but verbose; OOP is often pragmatic.
- Single-developer indie projects where time-to-prototype dominates frame-time concerns.

### Trade-off

ECS imposes architectural rigour up front. Teams new to the paradigm typically over-engineer component decomposition on first attempt. Recommend prototyping in OOP, profiling, then migrating bottleneck subsystems to ECS — rather than ECS-by-default for the whole game.

## State Machine Pattern

### Finite State Machine (FSM)

States, transitions, and events. Each state defines `OnEnter` / `OnUpdate` / `OnExit` handlers; transitions fire on events or condition checks. Canonical for character controllers, UI flow, input modes.

### Hierarchical State Machine (HSM)

FSM with nested states. A parent state ("Combat") contains child states ("Aiming", "Firing", "Reloading"); transitions can be local (within parent) or global (override). Reduces transition explosion in complex controllers.

### Implementation Options

- **Unity Animator State Machine**. Built-in. Designed for animation blending (Animator + Animator Controller asset), but routinely co-opted for character-logic FSM. Sub-state machines and Any-State transitions support HSM-style nesting. Caveat: tightly coupled to animation system; pure-logic FSMs are cleaner in code.
- **Stateless (C# library)**. Fluent-API FSM library, popular for non-animation logic in Unity and .NET projects. Self-documenting transition tables, supports guards, entry/exit actions, and reentry handling.
- **NodeCanvas (Unity Asset Store)**. Visual graph editor for Behaviour Trees, State Machines, and Dialogue Trees. Async graph loading, zero allocations after initialisation, handles hundreds of concurrent graphs. Integrates with FlowCanvas visual scripting.
- **Unreal State Tree**. UE5 native, declared general-purpose in UE 5.4-5.6. Combines Selectors from Behaviour Trees with States + Transitions from state machines. UE 5.5 added utility-function-based state selection (assign weights to determine which state currently most relevant). Runs on regular Actors without requiring an AI Controller — a major advantage over UE Behaviour Trees. Used internally by Mass AI, Smart Objects, and the Gameplay Camera System (Camera Direct State Tree Schema, UE 5.5.4+).

### Common Character States

`Idle` / `Walk` / `Run` / `Jump` / `Fall` / `Land` / `Attack` / `Hit` / `Stunned` / `Dead`. Reusable skeleton across action / platformer / brawler genres.

### Anti-Pattern: God-State

A single "ActiveCombat" state with 50+ exit transitions, 30+ entry conditions, and inline behaviour for half the game's combat logic. When a state grows past ~10 transitions, refactor to:

- HSM with child states (preferred for control flow), or
- Behaviour Tree (preferred when the logic is decision-tree-shaped rather than state-shaped).

## Behaviour Tree (BT) Pattern

### Concept

A tree of nodes representing AI decision-making. Ticked each frame from the root downward, the tree returns one of three statuses per node: `Success`, `Failure`, `Running`. Decisions cascade through:

- **Composite nodes** — `Selector` (try children until one succeeds), `Sequence` (all children must succeed in order), `Parallel` (run multiple children simultaneously).
- **Decorator nodes** — `Inverter`, `RepeatUntilSuccess`, `Cooldown`, `Conditional` (guards a child with a precondition).
- **Leaf nodes** — `Action` (do something: move, attack, play animation), `Condition` (check world state).
- **Service nodes** (Unreal-specific) — tick on a schedule while a sub-tree is active, used to update perception or blackboard data.

### Tools

- **Unreal Behaviour Tree**. Built-in, mature since UE 4.x. Visual editor + blackboard. Increasingly being supplemented or replaced by Unreal State Tree (per Epic's official documentation, State Tree is intended to subsume many BT use cases going forward). Both remain supported in UE 5.6.
- **Unity Behaviour Designer**. Third-party (Opsive, Unity Asset Store). Visual editor, large built-in node library, hundreds of marketplace add-ons.
- **NodeCanvas**. Visual BT + FSM + dialogue, mentioned above under State Machines.
- **Behavior3**. Open-source, multi-engine (JS, Python, C++, Lua adapters). MIT-licensed, lightweight, defines BT serialisation format.

### Common Nodes

- `Selector` — fallback chain (try patrol → if interrupted, chase → if lost, return-to-post).
- `Sequence` — strict pipeline (move-to-cover → aim → fire — all required).
- `Decorator` — gate a sub-tree on a precondition (`HasLineOfSight?`, `EnemyInRange?`).
- `Service` — periodic perception update (every 0.5s, scan for enemies; write result to blackboard).
- `Conditional Loop` — repeat a sub-tree while a condition holds.

### When BT

- NPC AI with prioritised behaviours (patrol → react to threat → fight → flee).
- Enemy decision-making in stealth or combat games.
- Encounter-design scripted behaviours that benefit from designer-visible visual editing.

### When NOT BT

- Reactive systems where state matters more than decision priority — use a state machine.
- Goal-directed behaviour where the same goal can be reached by multiple action sequences — use **GOAP** (below).
- Simulation actors (crowds, traffic, ambient NPCs) at scale — BT per-actor cost becomes prohibitive; consider Mass AI processors or coarse FSM at the population level.

## GOAP (Goal-Oriented Action Planning)

### Concept

Actions are declared with **preconditions** (world state required to execute) and **effects** (world state changes produced). Goals are declared as desired world states. An A\* planner searches the action graph at runtime to find the cheapest action sequence that transitions the current world state to the goal state.

The canonical industry example is **F.E.A.R.** (Monolith Productions, 2005), where soldiers planned cover-flanking-suppression sequences emergently from a small action set, producing tactical-looking behaviour without scripted scenarios. Roots trace to **STRIPS** planning (Stanford, 1971).

### Tools

- **ReGoap (luxkun)**. Generic C# GOAP library, MIT-licensed, with Unity examples. Comparator-based state matching via `ReGoapCondition` (count thresholds, inventory checks, cooldown gates). Goal selection deterministic or weighted-random.
- **Mountain GOAP (caesuric)**. C# library, composition over inheritance, supports multiple weighted goals and selects the highest-utility plan among candidates.
- **CrashKonijn GOAP**. Multi-threaded GOAP system for Unity. ScriptableObject-driven configuration, includes a GOAP Visualizer for debugging.

### When GOAP

- Emergent behaviour from a small action set (immersive sims, sandbox NPCs).
- NPCs with multiple goals competing on utility (an NPC who is hungry, tired, AND under threat).
- Simulation games where authoring per-scenario behaviour explicitly does not scale (*The Sims* lineage, colony sims).

### When NOT GOAP

- Tightly-scripted boss encounters with predictable beats — BT or hand-rolled FSM is easier to author and debug.
- Performance-critical inner loop with hundreds of agents — A\* planning per agent per frame is expensive; cap re-planning frequency or use a population-level abstraction.

## Blackboard Pattern

### Concept

A shared, typed key-value store used as the communication channel between AI subsystems. Sensors write (`PlayerLastSeenPosition`, `AlertLevel`, `NearestCoverPoint`), behaviours read. Decouples perception from decision-making.

### Implementations

- **Unreal Blackboard**. Built-in, tied to Behaviour Tree and State Tree. Defines typed entries (`Vector`, `Object`, `Enum`, `Bool`, `Float`). Editor-authored, accessible from C++ and Blueprints.
- **Unity third-party**. NodeCanvas and Behavior Designer ship custom blackboard equivalents.
- **Custom**. Dictionary<string, object> with type-checked accessors and change-event listeners.

### Use Case

An enemy AI knows the player's last seen position (perception writes), the squad's alert level (squad coordinator writes), the time-since-last-seen (timer writes), and the nearest cover point (pathfinding writes). The combat BT reads all four to pick between hold-position / advance / flank / fall-back.

### Anti-Pattern

A "global game state" blackboard with 200+ keys touched by every system in the codebase. Use scoped blackboards (per-actor, per-squad, per-encounter) and resist the temptation to centralise unrelated state.

## Event Bus / Mediator Pattern

### Concept

Decouple event emitters from subscribers via a central dispatcher. Emitters publish typed events; subscribers register handlers by event type. No direct coupling between gameplay systems.

### Implementations

- **Unity Events (UnityEvent)**. Built-in. Inspector-friendly (designers wire subscribers in the editor), serialisable. Trade-off: reflection-based dispatch, allocations on invocation, not allocation-free.
- **C# `event` keyword + static dispatcher**. Custom roll-your-own. Cheap, type-safe, but doesn't survive scene transitions unless dispatcher is `DontDestroyOnLoad` or pure static.
- **MessagePipe (Cysharp)**. High-performance pub/sub library for .NET and Unity. Zero allocations per Publish. Async handlers, mediator patterns with return-value handlers, pre/post filters. Includes a MessagePipe Diagnostics Window editor extension for visualising subscription state.
- **Unreal Delegates**. Native Multicast Delegates and Dynamic Multicast Delegates (the latter Blueprint-exposed). Built into UCLASS / UFUNCTION reflection system; type-safe and editor-integrated.

### Use Case

`PlayerDied` event published once → UI HUD fades to death screen, AchievementManager evaluates "Die Without Healing" achievement, SaveSystem persists death count, AudioManager triggers stinger, AnalyticsService logs telemetry event. Subscribers don't know about each other.

### Anti-Pattern: God-Bus

A single bus with 100+ event types and no naming discipline ("StuffHappened", "ThingChanged"). Symptoms: tracing a bug requires grepping for event names; subscribers fire in undefined order. Mitigations: typed events (one C# type per event), scoped buses (UI bus separate from gameplay bus), and explicit ordering where required (UniRx / R3 observables when ordering matters).

## Save Game Serialisation

### Formats

| Format | Size | Speed | Schema | Game-Dev Use |
|---|---|---|---|---|
| **JSON** | Large | Slow | Optional | Indie debug builds, modding, human-readable saves |
| **BinaryFormatter** (.NET) | Medium | Medium | Type embedded | Deprecated since .NET 5, removed in .NET 9. Do not use. |
| **MessagePack** | Compact | Fast (3× JSON), zero-alloc with MessagePack-CSharp | Optional / schema-based | Indie / mid-tier, fastest serialisation |
| **Protocol Buffers** | Smallest | Fast | Required (.proto) | Cross-language, network-safe payloads, cloud sync |
| **FlatBuffers** | Compact | Fastest deserialisation (zero-copy) | Required (.fbs) | AAA games, memory-mappable save files, instant load |
| **Custom binary** | Tightest possible | Tightest possible | Hand-rolled | When every byte counts; high migration cost |

Selection guidance (synthesised from 2026 benchmark references):

- **FlatBuffers** wins on deserialisation latency because data is accessible directly from the buffer without an intermediate parse step. Best for save files that benefit from memory-mapping (large open-world player progression, character/inventory snapshots loaded incrementally).
- **MessagePack** wins on serialisation speed and zero-allocation publish path. Best when save frequency is high (every level transition, every autosave tick). MessagePack-CSharp library is the canonical .NET / Unity implementation.
- **Protocol Buffers** wins on the smallest wire format and best cross-language ecosystem. Best for cloud sync where payload size and language interop matter.

### Encryption

For offline anti-tamper baseline: **AES-256-GCM** (authenticated encryption — detects tampering as well as preventing reads). Key material derived per-install from a device identifier + a per-game secret. Caveat: cannot defend against a determined cheater with full local access; the goal is "raise the friction" not "make impossible". Online competitive games must validate on the server.

### Versioning

Embed a `schema_version` field at the top of every save. On load:

1. Read version field FIRST, before deserialising the rest.
2. If version < current, run a chain of migration functions (`Migrate_V1_to_V2`, `Migrate_V2_to_V3`).
3. If version > current, refuse to load and inform the user (do NOT silently corrupt forward saves).

Keep migrations until at least 2-3 game-versions back; older saves can be quarantined with a clear user-facing message.

### Cloud Sync Backends

- **Steam Cloud**. Free for Steam-shipped games. ISteamRemoteStorage API. Per-app quota (typically 1 GB), per-file size limits.
- **PlayFab (Microsoft)**. Cross-platform LiveOps suite, includes player data storage. Pay-as-you-go above free tier.
- **GameSparks (Amazon Web Services)**. Heritage live-ops platform; service status fluctuated post-acquisition; verify current support tier before adopting. <!-- TODO verify: GameSparks 2026 status remains ambiguous in public sources. -->
- **Firebase Realtime Database / Firestore (Google)**. Mobile-first, free tier generous, real-time sync. Watch egress costs at scale.

### Conflict Resolution

Three strategies, picked per game type:

- **Last-write-wins**. Simplest. Acceptable for single-player progression where the player is the only writer.
- **Merge**. Per-field heuristics ("union of unlocked achievements, max of total-play-time"). Common for casual mobile games where the device alternates often.
- **Manual**. Present user a UI to pick which save (cloud vs local) to keep. Required when player has multiple devices with active sessions and divergent progression.

## Scene Streaming

### Open-World Streaming

Load and unload chunks of the world based on player position, rather than holding the entire world resident in memory. Critical for any world larger than the platform memory budget.

### Unity Tooling

Unity Addressables + per-scene loading. The canonical pattern: chunk the world into additive scenes (a tile or grid cell per scene), tag each as Addressable, load/unload based on player position. The Oculus AssetStreaming sample (open-source) demonstrates the conversion-to-Addressables workflow for an open-world VR project. DOTS + Burst + Addressables compose well for large simulated worlds. Best practice (2026): one Addressables group per spatial chunk, with dependency on a shared "common assets" bundle to avoid duplication.

### Unreal Tooling

UE5 native **World Partition** + **HLOD** + **Data Layers**. World Partition handles spatial streaming (Cell-based, automatic). Data Layers provide logical state control (e.g., "day version" vs "night version" of the same area). HLOD (Hierarchical Level-Of-Detail) generates simplified proxy meshes for distant objects, reducing draw calls and material complexity at long range. The three subsystems integrate rather than fight; this is the canonical UE5 open-world stack. <!-- TODO verify: community reports of HLOD generation reliability and streaming performance vary by project size and source-asset hygiene; per Epic's docs the system has matured through 5.4-5.6 but real-world adoption stories show mixed results. -->

### Async Loading

Loading must happen on a background thread to avoid stalling the render thread. Both Unity (AsyncOperation) and Unreal (asynchronous level streaming) provide this; the design challenge is **avoiding pop-in** (the moment a chunk becomes visible before its assets finish loading). Mitigations: pre-load chunks within prediction radius, use HLOD/Impostors as placeholder geometry until the LOD chain finishes streaming.

### Memory Budget

Approximate platform targets in 2026:

- **Mobile**: 1-2 GB working set (highly dependent on device, OS overhead).
- **Console (current-gen)**: 4-8 GB working set after OS reserve.
- **PC (target-mid)**: 6-12 GB working set (assuming 16 GB system RAM).

Streaming budget = total memory budget minus persistent allocations (engine, audio, UI, player). Profile per platform.

### Streaming Volumes / Triggers

Geometric regions in the world that, when intersected by the player, trigger load/unload of associated chunks. Both engines support these; designers tune the volume shape and lead-time so loading completes before the player enters visibility range.

## Object Pooling

### Concept

Pre-allocate N instances of a frequently spawned object at level start, store them in a pool, hand out/return instead of instantiating/destroying at runtime. Eliminates the GC pressure and allocation cost of `new` / `Destroy()` in hot paths.

### When

- Bullets, projectiles, missiles in shooters and shmups.
- Particle effects (impact, muzzle flash, footstep dust).
- Enemy spawns in waves or hordes.
- UI prefabs that are shown/hidden frequently (damage numbers, popup notifications).
- Audio sources for short SFX (one-shots).

Rule of thumb: anything spawned more than once per second is a pooling candidate.

### Frameworks

- **Unity `ObjectPool<T>`**. Built-in since Unity 2021.1, mature in Unity 6.x. Generic class in `UnityEngine.Pool`. Constructor takes `createFunc`, `actionOnGet`, `actionOnRelease`, `actionOnDestroy`, optional `collectionCheck` (assertion that an item isn't double-released), starting capacity, and max size. `collectionCheck` adds overhead and should be enabled in development builds only.
- **Unreal**. No first-party generic pool; the engine encourages reusing actors via `SetActorHiddenInGame` + `SetActorEnableCollision`. Community pool plugins exist on the Marketplace. Larger projects typically roll a custom `UActorPool` subsystem.
- **Custom**. `Queue<T>` of inactive instances with `Reset()` / `OnSpawn()` / `OnDespawn()` lifecycle callbacks. ~20 lines of code; preferred when the built-in `ObjectPool<T>` doesn't fit (e.g., pool of non-MonoBehaviour POCOs, pool with priority eviction).

### Anti-Pattern

Pool everything by default, including objects spawned once at level start. Pooling adds complexity; only pool when profiler measurements show allocation cost in the hot path. Monitor pool sizes during gameplay — a pool that constantly grows beyond initial capacity is mis-sized and should be re-tuned.

## Command Pattern (Undo / Redo / Replay)

### Concept

Encapsulate an action as an object with `Execute()` and `Undo()` methods. Push executed commands onto a stack; pop and call `Undo()` to revert. The pattern enables undo/redo, replay recording (serialise command stream), and rollback netcode (re-apply commands deterministically).

### Use Case

- Level editor undo/redo (place object → undo → object removed).
- Turn-based games rollback (move unit → opponent claims invalid → revert).
- RTS replay system (record command stream, replay deterministically).
- Rollback netcode (re-apply local commands after server reconciliation).

### Reference

Chapter "Command" in Robert Nystrom's *Game Programming Patterns* (free online: <https://gameprogrammingpatterns.com/command.html>). Worked examples include input remapping, AI-controlled bots, and undo stacks.

## Service Locator vs Dependency Injection

### Service Locator

A global registry (`ServiceLocator.Get<IAudioService>()`). Easy to call from anywhere, hard to test because dependencies are implicit and hidden. Encourages tight coupling to the locator itself.

### Dependency Injection (DI)

Constructors / inspectors declare their dependencies explicitly; a container resolves and injects them at construction time. Testable (inject mocks). Self-documenting (the constructor signature lists what the class needs).

### Unity DI Containers

- **Zenject**. Feature-rich, mature, extensible. Heavyweight in scene startup (looks up all GameObjects in scene via reflection when scene starts). Long-standing community standard.
- **VContainer**. Modern, lightweight, GC-free in `Resolve()` after warm-up. Roughly 5-10× faster than Zenject on resolve benchmarks. Does NOT do scene-wide GameObject reflection. Supports pure-C# entry points (decouple domain logic from `MonoBehaviour`). Default recommendation for new Unity projects in 2026.
- **Microsoft.Extensions.DependencyInjection**. The .NET-standard container. Usable in Unity via NuGetForUnity; idiomatic for teams sharing code with .NET services.

### Unreal DI Culture

UE has historically embraced **Subsystems** (`UGameInstanceSubsystem`, `UWorldSubsystem`, `ULocalPlayerSubsystem`, `UEngineSubsystem`) as the lifecycle-scoped service locator equivalent. DI containers exist in Marketplace plugins but are not idiomatic. Use Subsystems for engine-managed lifetime + dependency wiring.

## Component-Based Design

### Canonical Implementations

- **Unity `MonoBehaviour`**. The default component model. `GameObject` + N `MonoBehaviour` components composed in the Inspector.
- **Unreal `UActorComponent`**. Reusable behaviour attached to an `AActor`. `USceneComponent` adds transform; `UPrimitiveComponent` adds rendering/physics.

### Composition Over Inheritance

A `Player` is not a subclass of `Character` is not a subclass of `Pawn`. Instead, a `GameObject` (or `AActor`) composed of `MovementComponent`, `HealthComponent`, `InputComponent`, `InventoryComponent`. Adding a new behaviour means adding a component, not editing the class hierarchy.

### Anti-Pattern: Deep MonoBehaviour Inheritance

`PlayerCharacter : Character : Pawn : Actor : NetworkActor : SyncedObject : Loadable : MonoBehaviour` — 7 levels deep. Symptoms: cannot reuse `PlayerCharacter` logic for AI characters because base classes drag UI/input dependencies; changing a base class breaks unrelated subclasses; null-reference bugs across base/derived. Refactor: collapse to `MonoBehaviour` + composed components.

## Replication Patterns (Networking)

Brief inventory; full deep-dive in `multiplayer-architecture.md`.

- **Server-authoritative state.** Server is the single source of truth. Client sends inputs, server simulates, server broadcasts state. Required for competitive multiplayer where cheating is a real threat.
- **Client-side prediction + reconciliation.** Client applies input locally immediately for responsiveness, then validates against server state when the authoritative snapshot arrives. On mismatch, rewind and replay subsequent inputs.
- **Snapshot interpolation.** Render the world ~100 ms in the past, interpolating between two received server snapshots. Eliminates visible jitter at the cost of input-to-screen latency.
- **Delta compression.** Send only state that has changed since the last acknowledged snapshot. Critical at scale (60 Hz × 100 entities × 32 fields = a lot of bandwidth without deltas).

See `multiplayer-architecture.md` for protocol choices (TCP / UDP / QUIC / WebRTC), tick rate selection, and matchmaking architecture.

## Reference Books

Canonical engineering references for the patterns above:

- **Game Programming Patterns** — Robert Nystrom. Free online at <https://gameprogrammingpatterns.com/>. Covers Command, Observer / Event Queue, State, Component, Service Locator, Object Pool, Update Method, Dirty Flag, Spatial Partition. Pragmatic, source-driven, AAA-experience-backed.
- **Game Engine Architecture** — Jason Gregory (3rd ed., CRC Press). Architecture-level reference: rendering, animation, audio, AI, networking, scripting, tools pipeline. Used as the de facto textbook for the field.
- **Data-Oriented Design** — Richard Fabian. Free online at <https://www.dataorienteddesign.com/dodbook/>. ECS rationale, cache-aware data layout, transformation-oriented programming.
- **Real-Time Rendering** — Tomas Akenine-Möller et al. (4th ed.). Reference for graphics pipeline architecture (not strictly engineering-patterns but pairs with the rendering side of engine design).
- **AI for Games** — Ian Millington (3rd ed., CRC Press). Comprehensive: pathfinding, decision-making (FSM / BT / GOAP / utility / planning), tactical AI, learning. Canonical AI reference.

## Sources

- [DOTS - Unity's Data-Oriented Technology Stack](https://unity.com/dots)
- [Mass Entity in Unreal Engine | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/mass-entity-in-unreal-engine)
- [Bevy 0.18 release notes](https://bevy.org/news/bevy-0-18/)
- [Flecs ECS — Sander Mertens](https://github.com/SanderMertens/flecs) and [Flecs 4.1 release notes](https://ajmmertens.medium.com/flecs-4-1-is-out-fab4f32e36f6)
- [EnTT — skypjack](https://github.com/skypjack/entt)
- [State Tree in Unreal Engine | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/state-tree-in-unreal-engine)
- [NodeCanvas | Paradox Notion](https://nodecanvas.paradoxnotion.com/)
- [CrashKonijn GOAP](https://github.com/crashkonijn/GOAP) and [ReGoap — luxkun](https://github.com/luxkun/ReGoap)
- [MessagePipe — Cysharp](https://github.com/Cysharp/MessagePipe)
- [Unity ObjectPool<T> documentation](https://docs.unity3d.com/6000.2/Documentation/ScriptReference/Pool.ObjectPool_1.html)
- [VContainer DI Container](https://vcontainer.hadashikick.jp/) and [Comparing to Zenject](https://vcontainer.hadashikick.jp/comparing/comparing-to-zenject)
- [MessagePack-CSharp](https://github.com/MessagePack-CSharp/MessagePack-CSharp), [FlatBuffers Benchmarks](https://flatbuffers.dev/benchmarks/)
- [Unity Addressables Manual (Unity 6)](https://docs.unity3d.com/6000.4/Documentation/Manual/com.unity.addressables.html) and [Content update builds](https://docs.unity3d.com/Packages/com.unity.addressables@1.21/manual/content-update-builds-overview.html)
- [World Partition in Unreal Engine | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine)
- [Game Programming Patterns — Robert Nystrom (free online)](https://gameprogrammingpatterns.com/)
- [Data-Oriented Design — Richard Fabian (free online)](https://www.dataorienteddesign.com/dodbook/)
