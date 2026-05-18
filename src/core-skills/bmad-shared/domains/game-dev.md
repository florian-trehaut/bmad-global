# Domain: Game Development

**Loaded by:** Protocol `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` when `workflow-context.md` declares `project_type: game` (matching the CSV row whose `domain_stack` column references this file).

**Source pin:** Substrate synthesised from upstream `bmad-code-org/bmad-module-game-dev-studio` v0.5.0 SHA `9dcd1253` (date 2026-05-15) + engine vendor official documentation (Unity 6.x, Unreal Engine 5.5, Godot 4.6, Phaser 3.x — May 2026). Patterns + URLs only; no engine vendor code copied (licensing — see OOS-5 of the originating story `standalone-presets-foundation-and-game-dev-pilot.md`).

---

## Engines

This section describes idiomatic patterns, known gotchas, performance baselines, and sourced URLs for the four engines most commonly encountered in game-dev projects using this fork. Engine ordering reflects market presence (Unity > Unreal > Godot > Phaser for indie/SaaS workflows as of May 2026).

### Unity (6.x)

**Idiomatic patterns:**

- DOTS (Data-Oriented Technology Stack) — stable in Unity 6.x. Use for performance-critical simulation code (100k+ entities at 60 FPS on mid-range laptop per Unity's published 6.0 benchmarks). Entities + Burst Compiler + Job System are the canonical trio.
- GPU Resident Drawer — render path improvement shipped with Unity 6. Reduces CPU overhead for scenes with many static mesh renderers. Enable per-render-pipeline-asset (URP / HDRP).
- Addressables — preferred asset management strategy over legacy Resources/AssetBundles. Catalogue-backed, supports remote content, hot-reload friendly.
- ScriptableObjects for data-driven config (items, abilities, level metadata). Avoid serialised MonoBehaviour fields for shared static data.

**Known gotchas:**

- Mobile rendering pipeline choice (URP vs HDRP) is one-way at project creation time. Switching mid-project is a rewrite — decide in the architecture step.
- Mono → IL2CPP backend switch breaks Reflection-heavy code (serialisation, dependency injection containers). Test the IL2CPP build path early.
- Editor-only code (`#if UNITY_EDITOR`) leaking into runtime assemblies is a common build break — separate Editor assemblies.
- Garbage allocations in `Update()` loops kill mobile FPS. Profile with Unity Profiler's Hierarchy → "GC.Alloc" column.

**Performance baselines:**

- Hot path: 60 FPS minimum on target hardware.
- Mobile baseline: 30 FPS minimum on representative mid-tier device (e.g. Samsung Galaxy A54, iPhone 12). 60 FPS preferred for action genres.
- VR baseline: 90 FPS minimum (Quest 3 / PCVR). Below 90 FPS = motion sickness risk.
- DOTS reference: 100k animated entities @ 60 FPS on mid-range laptop (Unity 6.0 official benchmark).

**Sourced URLs:**

- Unity 6 release notes — <https://unity.com/releases/unity-6/support>
- Unity 6 LTS support windows — <https://unity.com/products/unity-lts>
- DOTS overview — <https://docs.unity3d.com/Packages/com.unity.entities@latest>
- URP performance guide — <https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@latest>
- Profiler Hierarchy view — <https://docs.unity3d.com/Manual/ProfilerHierarchy.html>

### Unreal Engine (5.5)

**Idiomatic patterns:**

- Gameplay Framework: `AActor` + `UActorComponent` composition. Avoid deep inheritance hierarchies — prefer Components for orthogonal capabilities.
- Blueprints + C++ hybrid is the canonical authoring model. Designers iterate in Blueprints; engineers expose C++ APIs as `BlueprintCallable` / `BlueprintImplementableEvent`.
- Lyra sample project is the reference architecture for live-service multiplayer games. Mirror its module structure (`LyraGame`, `LyraGameRuntime`, `LyraGameCore`).
- Enhanced Input system — replaces legacy Input. Use Input Mapping Contexts + Input Actions.

**Known gotchas:**

- Blueprint VM cost: tight loops in Blueprints are 10-100x slower than C++ equivalents. Profile with Stat Game / Stat GPU first.
- Garbage Collector pauses (UObject GC) cause frame hitches if too many UObjects are spawned/destroyed per frame. Use object pools.
- Hot reload (Live Coding) drifts state — full editor restart needed after structural changes to UPROPERTY declarations.
- Mobile renderer (forward renderer) has feature parity gaps vs PC deferred. Test mobile build early — features like dynamic shadow distance, post-process volumes have mobile-specific paths.

**Performance baselines:**

- Hot path: 60 FPS on console-target hardware (PS5 / Xbox Series X).
- Mobile baseline: 30 FPS on iPhone 12 / mid-tier Android (Snapdragon 8 Gen 2 class). 60 FPS attainable but expensive.
- VR baseline: 90 FPS minimum (PCVR). Quest standalone benefits from FFR (Fixed Foveated Rendering) for sustained 90 FPS.
- Mobile renderer 5.5 features: D-buffer decals, rect area lights, volumetric fog now mobile-supported (Unreal 5.5 release).

**Sourced URLs:**

- Unreal Engine 5.5 release notes — <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-5-release-notes>
- Lyra sample project — <https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-sample-game-in-unreal-engine>
- Mobile rendering performance — <https://dev.epicgames.com/documentation/en-us/unreal-engine/mobile-rendering-performance-considerations>
- Enhanced Input — <https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine>
- Stat commands reference — <https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine>

### Godot (4.6)

**Idiomatic patterns:**

- Node-based scene composition — each scene is a tree of nodes; instance scenes hierarchically.
- Signals (Godot's observer pattern) for inter-node communication. Avoids tight coupling vs direct node references.
- GDScript for most gameplay code (Python-like, tightly coupled to Godot APIs). C# for performance-critical or shared-library code (Mono / .NET 8 in 4.x).
- Resource files (`.tres`) for shared configuration — Godot's equivalent to Unity ScriptableObjects.

**Known gotchas:**

- 4.x is NOT backward-compatible with 3.x — projects migrating require a deliberate port effort. Don't try to gradually migrate.
- GDScript performance is a fraction of compiled C# / C++. Profile early; rewrite hot loops in C# or GDExtension (C++).
- Editor → Export pipeline for mobile (iOS) requires platform-specific signing/provisioning. Setup is one-time but Godot's docs are sparser than Unity/Unreal here.
- 2D rendering throughput is Godot's strength — ~75 FPS @ 1000 sprites on mid-range laptop per Godot 4.4 benchmark (~40% faster than Unity 6 for pure 2D).

**Performance baselines:**

- Hot path: 60 FPS on target hardware.
- 2D throughput (Godot's sweet spot): 1000 sprites @ 75 FPS mid-range laptop, 3000+ sprites @ 60 FPS desktop.
- Mobile baseline: 30 FPS on mid-tier device; 60 FPS attainable for 2D / low-poly 3D.
- Android device mirroring (4.6 feature) shortens iteration time for mobile builds.
- StoreKit 2 integration (4.6) for iOS in-app purchases.

**Sourced URLs:**

- Godot 4.6 release — <https://godotengine.org/article/dev-snapshot-godot-4-6/>
- Godot 4 documentation — <https://docs.godotengine.org/en/stable/>
- GDScript performance tips — <https://docs.godotengine.org/en/stable/tutorials/performance/general_optimization.html>
- C# integration — <https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/index.html>
- 2D performance benchmarks (community) — <https://github.com/godotengine/godot-benchmarks>

### Phaser (3.x)

**Idiomatic patterns:**

- Scene-based architecture (Phaser.Scene) — each game state (menu / gameplay / pause) is a scene. Switch via `this.scene.start()`.
- TypeScript-first for non-trivial projects. Phaser 3.x ships TypeScript types; community templates (Phaser + Vite + TS) are the canonical bootstrap.
- Sprite + Physics (Arcade / Matter) — Arcade for AABB-based platformers/shooters; Matter for realistic 2D physics.
- Asset Pack JSON for batch asset loading — keeps preload phase declarative.

**Known gotchas:**

- WebGL 1 vs WebGL 2 fallback — WebGL 2 features (instancing, MRT) won't be available on iOS Safari < 15. Phaser falls back to WebGL 1 automatically but performance drops.
- Audio on iOS Safari requires user-gesture-initiated context resume — design around the touch-to-start pattern.
- Browser tab backgrounding pauses `requestAnimationFrame` — use Phaser's `game.events.on('hidden')` to handle gracefully.
- Phaser 4 (alpha as of May 2026) is NOT yet stable; stay on 3.x for production.

**Performance baselines:**

- Hot path: 60 FPS in Chrome / Firefox / Edge on mid-tier desktop.
- Mobile web baseline: 30 FPS minimum on iPhone 12 Safari; 60 FPS achievable with Arcade physics + sprite-sheet atlases.
- Memory budget: aim for < 200 MB heap on mobile to avoid Safari kill (especially iOS).
- Asset budget: < 50 MB total download for casual web games (gated by mobile data caps).

**Sourced URLs:**

- Phaser 3 documentation — <https://docs.phaser.io/phaser/getting-started>
- Phaser 3 API reference — <https://docs.phaser.io/api-documentation/api-documentation>
- Phaser + Vite + TypeScript template — <https://github.com/phaserjs/template-vite-ts>
- Mobile web performance guide — <https://phaser.io/news/2024/12/phaser-mobile-optimization>

---

## Personas

Descriptors for the 5 BMGD agents (sourced from upstream BMGD v0.5.0 SHA `9dcd1253`, MIT-licensed, attribution preserved). Cloud Dragonborn is imported as a skill (`bmad-agent-game-architect` per Task 7 of the originating story); the other 4 are descriptors only — not imported in v1 per OOS-2.

| Persona | Role | Tone | Status in this fork |
|---|---|---|---|
| **Cloud Dragonborn** | Game Architect — technical architecture, engine design, infrastructure decisions | RPG-sage, 20 years shipping 30+ titles; cites Carmack / Sweeney patterns; 60 FPS philosophy | IMPORTED — `bmad-agent-game-architect` skill |
| **Samus Shepard** | Game Designer — gameplay loops, narrative beats, level progression | Player-empathy, design pattern fluent (juiciness / game feel / Csikszentmihalyi flow) | Descriptor only (OOS-2) |
| **Indie** | Solo-dev generalist — scope discipline, MVP-first | Pragmatic, anti-feature-creep, embraces constraints | Descriptor only (OOS-2) |
| **Link Freeman** | QA Tester — playthrough verification, edge-case hunting | Methodical, finds the soft-locks and the speedrun glitches | Descriptor only (OOS-2) |
| **Paige** | Producer — scope, schedule, team coordination | Risk-aware, milestone-driven, ships | Descriptor only (OOS-2) |

To invoke Cloud Dragonborn in this fork: `skill: bmad-agent-game-architect` (loads SKILL.md + customize.toml from `src/bmm-skills/3-solutioning/bmad-agent-game-architect/`).

To consult the other 4 personas (descriptor-level), workflows reading this domain file may surface them in discovery questions ("Should we engage a Producer-style scoping pass before sprint planning?"). Future stories may import them as skills.

---

## GDD Discovery Hints

Questions and prompts that game-dev consumers (`bmad-create-story` step-02d, `bmad-create-prd` step-02-discovery, etc.) should surface when `project_type: game` is active:

**Engine + platform** (preselect from CSV `key_questions`):

- Which engine? (Unity / Unreal / Godot / Phaser / custom). If "custom", which language + render API?
- Which platforms target ship? (PC / console / mobile / web / VR — multi-select)
- Online multiplayer? (none / async / realtime client-server / P2P) — informs scope, infra, anti-cheat
- Performance budget: 60 FPS hot path / 30 FPS mobile / 90 FPS VR — which is the binding constraint for this story?

**Gameplay + design** (Samus Shepard descriptor turf):

- Which gameplay loop is touched? (core loop / meta loop / progression loop). If unsure, the story risks being too vague.
- Is a Game Design Document (GDD) section affected? If yes, list the GDD section(s). Cross-reference architecture decisions back to GDD intent.
- Narrative beat impact? (cinematic / dialog / cutscene / branching choice). Often invisible to engineers but blocks ship.
- Telemetry plan? (custom events tied to gameplay milestones — first-death, tutorial-complete, level-1-clear). Required for funnel analytics.

**Scope discipline** (Indie / Paige descriptor turf):

- What's the smallest playable thing that proves this works? Aim for that, not the full feature.
- Which engine version is target? (Unity 6.3 LTS / Unity 6.4 / Unreal 5.5 / Godot 4.6 / Phaser 3.x). Locking the version avoids mid-project upgrade churn.
- Asset pipeline impact? (new texture format, new shader, new animation rig) — these are scope multipliers.

**Quality + ship** (Link Freeman descriptor turf):

- Edge cases: input edge cases (controller disconnect mid-frame), state edge cases (save during cinematic), platform edge cases (suspended app on mobile).
- Speedrun / soft-lock risk? Players will find the broken corners — anticipate.

---

## NFR Baselines

Default NFR values for game-dev stories. These feed into the spec's NFR Registry as defaults — projects override per their target market/platform.

| Category | Default | Rationale |
|---|---|---|
| **Performance** | 60 FPS hot path (PC/console), 30 FPS mobile minimum, 90 FPS VR minimum | Player-perceptible. Below threshold = ship-blocker for action genres. |
| **Scalability** | Single-player: not applicable. Multiplayer: target CCU per shard (project-specific). | Multiplayer scope shifts NFR profile entirely — separate ADR recommended. |
| **Availability** | Live-service: 99.5% monthly. Single-player: not applicable. | Live-service equivalent to SaaS B2B baseline. |
| **Reliability** | Crash-free sessions > 99% on shipped builds. | Industry baseline per Sentry/Backtrace public benchmarks. |
| **Security** | See "Security Baseline" section below. | Domain-specific (player data, anti-cheat, COPPA for kids' titles). |
| **Observability** | See "Observability Defaults" section below. | Crash + telemetry + gameplay funnel are the industry-standard trio. |
| **Maintainability** | Asset pipeline reproducibility (build agent → same build artefact for same SHA). | Asset pipeline drift is the silent killer of long-running game projects. |
| **Usability** | Tutorial completion > 80%. Drop-off heat-map on tutorial steps. | Per industry post-mortems; tutorials are the highest-leverage UX surface. |

**Storage budgets** (informational, project-dependent):

- Mobile install: < 200 MB initial, on-demand chunks for additional content. iOS in particular limits over-cellular downloads.
- Console: 50-150 GB envelopes typical for AAA; indie aims for < 10 GB.
- Web (Phaser): < 50 MB total download for casual web games.

**Latency budgets** (online multiplayer):

- Realtime PvP: < 100 ms server round-trip target. < 50 ms ideal.
- Co-op (relaxed): < 250 ms tolerable.
- Async (turn-based): minutes are acceptable.

---

## Security Baseline

Domain-specific security considerations for game-dev projects:

**Player data (GDPR / CCPA):**

- Player accounts → PII handling. Apply GDPR (EU players) / CCPA (California players) / PIPL (China players) per regional reach.
- Right-to-delete: account deletion must propagate to telemetry, leaderboards, cloud saves, friend lists.
- Right-to-export: player data export endpoint required for GDPR (Art. 20 portability).
- Data minimisation: don't collect player demographics you don't need.

**COPPA (kids' games — players < 13):**

- Verifiable parental consent required for any data collection from under-13 players.
- No targeted advertising to under-13 players.
- Default to age-gate at first launch.
- If targeting under-13: separate analytics SDK (or disable analytics entirely) per platform store rules.

**Anti-cheat (competitive multiplayer):**

- Client-trust = zero. Authoritative server for all game-affecting state.
- Anti-tamper signing on competitive builds (Easy Anti-Cheat / BattlEye / VAC for Steam).
- Replay verification for leaderboards (server replays the input log, compares against client-claimed outcome).
- Rate-limit suspicious patterns: > N actions/second, impossible movement vectors, achievement-unlock races.

**IAP fraud (mobile + console):**

- Receipt validation server-side, NEVER client-side (per Apple/Google store guidelines).
- Idempotency on receipt processing — same receipt processed twice does NOT grant the item twice.
- Refund-aware: handle the refund webhook (revoke item if player chargebacks).

**Save data integrity:**

- Cloud save conflict resolution policy: last-write-wins, manual-resolve, or merge — pick deliberately per game type.
- Save corruption recovery: keep N rolling backups (typical N=3) on local + cloud.

**Crypto + payments (NEVER do):**

- Never store credit card numbers (PCI scope). Always tokenise via Stripe / Apple Pay / Google Pay / platform store.
- Never store player passwords in plaintext or reversible encryption. Use platform OAuth (Sign in with Apple, Google, Steam, Xbox Live, PSN) when possible.

---

## Observability Defaults

Patterns + vendor URLs for game-dev observability. Patterns only — no copied vendor code per OOS-5.

**Crash reporting (industry baseline):**

| Vendor | Strength | URL |
|---|---|---|
| **Sentry** | Multi-engine support; console GA since Sep 2025 (Xbox / PlayStation / Switch); release tracking; minidump symbolication | <https://sentry.io/solutions/game-developers> |
| **Backtrace** (now part of Sauce Labs) | Game-dev-specific call stacks + memory + variable values; asset attachments; deep Unity + Unreal integrations | <https://backtrace.io/> |
| **Crashlytics** (Firebase) | Free, deep Android/iOS integration; weaker for desktop/console | <https://firebase.google.com/products/crashlytics> |

**Recommendation:** Sentry for cross-platform titles shipping to console. Backtrace for engine-deep call-stack investigation (esp. Unreal). Crashlytics for mobile-only indie.

**Telemetry / analytics (gameplay funnel + retention):**

| Vendor | Strength | URL |
|---|---|---|
| **GameAnalytics** | Free tier generous, game-dev-specific funnel templates (tutorial completion, progression funnel, monetisation), pre-baked dashboards | <https://gameanalytics.com/> |
| **Datadog** (gaming) | Custom event ingestion; pair with infra metrics for live-service titles; expensive at scale | <https://www.datadoghq.com/solutions/gaming/> |
| **Amplitude** | Behavioural analytics, funnel diffing across cohorts | <https://amplitude.com/gaming> |
| **Unity Analytics** (in-engine) | Free with Unity, OK for shipped MVP; limited custom-event flexibility | <https://docs.unity3d.com/Packages/com.unity.services.analytics@latest> |

**Recommendation:** GameAnalytics for indie/MVP. Amplitude when funnel diffing across cohorts matters (post-launch retention work). Datadog when paired with infra metrics for live-service.

**Required custom events (industry baseline):**

- `tutorial_started` / `tutorial_step_complete` / `tutorial_completed` / `tutorial_skipped`
- `first_session_end` / `session_end` (with duration)
- `level_started` / `level_complete` / `level_failed` (with retry count)
- `purchase_initiated` / `purchase_completed` / `purchase_failed` (IAP) — server-confirmed only
- `crash_recovered` / `save_corrupted` (player-impacting errors)
- `share_invoked` (social share — informs viral coefficient)

**Performance instrumentation:**

- FPS sample every N seconds → aggregate p50 / p95 / p99 on shipped builds. Surface p95 < 60 FPS as performance regression alert.
- Frame-time histogram on dev builds. Bimodal frame-time distribution = scheduling problem.
- GC allocation rate (Unity, .NET-backed Godot). Spikes correlate with frame hitches.

---

## External References

Sourced URLs grouped by topic. One link per claim. All URLs verified accessible as of May 2026.

**Engine versions + LTS strategies:**

- Unity 6 release support — <https://unity.com/releases/unity-6/support>
- Unity LTS overview — <https://unity.com/products/unity-lts>
- Unreal Engine 5.5 release notes — <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-5-release-notes>
- Godot 4.6 release — <https://godotengine.org/article/dev-snapshot-godot-4-6/>
- Phaser 3 documentation — <https://docs.phaser.io/phaser/getting-started>

**Performance + profiling:**

- Unity Profiler — <https://docs.unity3d.com/Manual/Profiler.html>
- Unreal stat commands — <https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine>
- Godot performance tutorials — <https://docs.godotengine.org/en/stable/tutorials/performance/index.html>
- Browser performance for Phaser — <https://phaser.io/news/2024/12/phaser-mobile-optimization>

**Observability vendors:**

- Sentry game-dev — <https://sentry.io/solutions/game-developers>
- Backtrace — <https://backtrace.io/>
- Crashlytics — <https://firebase.google.com/products/crashlytics>
- GameAnalytics — <https://gameanalytics.com/>
- Datadog gaming — <https://www.datadoghq.com/solutions/gaming/>
- Amplitude gaming — <https://amplitude.com/gaming>

**Compliance + regulation:**

- GDPR text (official EUR-Lex) — <https://eur-lex.europa.eu/eli/reg/2016/679/oj>
- COPPA FAQ (FTC) — <https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions>
- Apple App Store guidelines — <https://developer.apple.com/app-store/review/guidelines/>
- Google Play policies — <https://support.google.com/googleplay/android-developer/answer/9858738>

**Anti-cheat:**

- Easy Anti-Cheat — <https://www.easy.ac/>
- BattlEye — <https://www.battleye.com/>
- VAC (Steam) — <https://help.steampowered.com/en/faqs/view/571A-97DA-70E9-FF74>

**BMGD source pin (provenance):**

- Upstream repo (MIT) — <https://github.com/bmad-code-org/bmad-module-game-dev-studio>
- v0.5.0 SHA `9dcd1253` — pinned source for Cloud Dragonborn + this domain stack research substrate
- BMGD module.yaml — <https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/main/src/module.yaml>

**General game-dev knowledge:**

- GDC Vault — <https://www.gdcvault.com/> (postmortems, technical talks)
- Gamasutra (now Game Developer) — <https://www.gamedeveloper.com/>
