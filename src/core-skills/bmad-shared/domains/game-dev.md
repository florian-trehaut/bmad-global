# Domain: Game Development

**Loaded by:** Protocol `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` when `workflow-context.md` declares `project_type: game` (matching the CSV row whose `domain_stack` column references this file).

**Source pin:** Substrate synthesised from upstream `bmad-code-org/bmad-module-game-dev-studio` v0.5.0 SHA `9dcd1253` (date 2026-05-15) + engine vendor official documentation (Unity 6.3 LTS, Unreal Engine 5.6, Godot 4.6, Phaser 4.0, Bevy 0.18, Stride 4.3+, Cocos Creator) + GDC postmortems + industry KPI benchmarks (May 2026). Patterns + URLs only ; no engine vendor code copied (licensing — see OOS-5 of the originating story `standalone-presets-foundation-and-game-dev-pilot.md`).

---

## How to use this domain

This file is the **entry point** of a multi-file domain stack. It carries the overview + table of contents + cross-cutting summaries. Detailed sections live in companion sub-files under `domains/game-dev/` and are **JIT-loaded by consumer workflows when needed** (no eager load of the whole stack — each workflow Reads only the sub-file relevant to its task).

The split exists because the full game-dev knowledge surface (engines + design + production + business + observability + compliance) is ~5000 lines — far above the 600-line target for a single domain file (NFR Performance of the originating story).

## Sub-files index

| Sub-file | Topic | Loaded by (typical) |
|---|---|---|
| [`game-dev/engines.md`](./game-dev/engines.md) | Unity 6.3 / Unreal 5.6 / Godot 4.6 / Phaser 4 / Bevy / Stride / Cocos — idiomatic patterns, gotchas, performance baselines, pricing, sourced URLs | bmad-create-architecture, bmad-agent-game-architect, bmad-dev-story (engine choice) |
| [`game-dev/personas.md`](./game-dev/personas.md) | 5 BMGD personas (Cloud Dragonborn / Samus Shepard / Indie / Link Freeman / Paige) + 8 industry-standard roles | bmad-create-story step-02d, bmad-sprint-planning, party-mode |
| [`game-dev/discovery-hints.md`](./game-dev/discovery-hints.md) | Genre-specific discovery (FPS / RPG / RTS / Platformer / Roguelike / MOBA / MMO / Sandbox / Puzzle / Sim / Battle Royale / Fighting / Racing / Survival) + scope-aware indie/AA/AAA + core verbs / compulsion loop framework | bmad-create-story step-02d, bmad-create-prd |
| [`game-dev/nfr-baselines.md`](./game-dev/nfr-baselines.md) | Performance per platform (PS5 / PS5 Pro / Xbox / Steam Deck / Quest 3 / Switch 2 / mobile / web) + network / memory / loading / asset budgets | bmad-create-story step-09 NFR, bmad-validation-frontend, bmad-tea-framework |
| [`game-dev/security-baseline.md`](./game-dev/security-baseline.md) | GDPR / CCPA / COPPA / PIPL / EAA / CVAA / regional compliance (CN ISBN / Korea loot box law / DE USK / RU sanctions) / IAP / DRM | bmad-create-story step-10 Security Gate, bmad-code-review-perspective-security |
| [`game-dev/observability.md`](./game-dev/observability.md) | Crash reporting (Sentry / Backtrace / Crashlytics / Unity Cloud Diagnostics) + analytics (GameAnalytics / Amplitude / Datadog / PlayFab / Nakama) + dashboards + cohort tracking | bmad-create-story step-11 Observability, bmad-code-review-perspective-operations |
| [`game-dev/asset-pipeline.md`](./game-dev/asset-pipeline.md) | DCC tools (Blender / Maya / ZBrush / Substance / Houdini) + texture atlasing + LOD / imposters + animation rigging + VCS (Perforce / Git LFS) + AI-generated assets | bmad-create-architecture, bmad-dev-story (asset work) |
| [`game-dev/audio.md`](./game-dev/audio.md) | FMOD / Wwise / engine-native + spatial audio + dynamic music + VO recording + audio accessibility | bmad-create-story (audio-affecting features), bmad-validation-frontend |
| [`game-dev/localization.md`](./game-dev/localization.md) | CJK / RTL / regional pricing / VO 10+ langues / cultural adaptation / text expansion / date/number/currency formats | bmad-create-story (loc scope), bmad-validation-frontend |
| [`game-dev/qa-testing.md`](./game-dev/qa-testing.md) | Test pyramid for games + automated playtest + replay verification + save-state fuzzing + platform certification + accessibility testing | bmad-test-design, bmad-tea-framework, bmad-validation-metier |
| [`game-dev/live-ops.md`](./game-dev/live-ops.md) | Seasons / battle passes / events / hotfix deployment / content deprecation / live-service KPIs | bmad-create-prd (live-service projects), bmad-sprint-planning |
| [`game-dev/monetization.md`](./game-dev/monetization.md) | F2P / Premium / Subscription / loot box laws / IAP psychology / store cuts / regional pricing / ad networks | bmad-create-prd, bmad-create-story (monetisation features) |
| [`game-dev/architecture-patterns.md`](./game-dev/architecture-patterns.md) | ECS / state machine / behavior tree / GOAP / blackboard / event bus / save serialization / scene streaming / object pooling | bmad-create-architecture, bmad-agent-game-architect |
| [`game-dev/design-patterns.md`](./game-dev/design-patterns.md) | Juiciness / FTUE / retention loops / flow state / compulsion loops / novelty curve / narrative patterns / onboarding anti-patterns | bmad-create-story (game-feel work), bmad-agent-game-designer |
| [`game-dev/kpis-metrics.md`](./game-dev/kpis-metrics.md) | D1/D7/D30 retention / DAU/MAU / ARPDAU / ARPPU / LTV / NPS / CPI / K-factor + tiers indie/AA/AAA | bmad-create-prd (success metrics), bmad-sprint-status |
| [`game-dev/anti-cheat.md`](./game-dev/anti-cheat.md) | Per-genre threat model + defense strategies (server authority / replay verification / behavioral detection) + EAC / BattlEye / VAC / Vanguard | bmad-create-architecture (competitive games), bmad-code-review-perspective-security |
| [`game-dev/multiplayer-architecture.md`](./game-dev/multiplayer-architecture.md) | Topology (dedicated / P2P / server-relayed) + netcode (lockstep / rollback / client prediction) + matchmaking + voice chat + libraries (Photon / Mirror / Nakama / PlayFab) | bmad-create-architecture, bmad-agent-game-architect |
| [`game-dev/ci-cd.md`](./game-dev/ci-cd.md) | Build farm + content cooking + automated testing + store deployment automation + versioning + hot-patching live games + quality gates | bmad-tea-ci, bmad-tea-framework |

## Engines — Quick Reference

For idiomatic patterns / gotchas / performance baselines / pricing / sourced URLs per engine, **Read [`game-dev/engines.md`](./game-dev/engines.md)**. Summary :

| Engine | Stable version (May 2026) | Strength | Pricing model |
|---|---|---|---|
| Unity | 6.3 LTS | Generalist, mobile, AR | Seat-based ($0-$300/seat/mo). Runtime Fee cancelled Sep 2024. |
| Unreal Engine | 5.6 | AAA, photo-realism, console | 5% royalty after $1M revenue |
| Godot | 4.6 | Open-source, 2D leader | Free, MIT |
| Phaser | 4.0 "Caladan" | Web casual games | Free, MIT |
| Bevy | 0.18 | Rust-native, simulation | Free, MIT/Apache-2.0 dual |
| Stride | 4.3+ | C# .NET 10 alternative | Free, MIT |
| Cocos Creator | latest | China + WeChat instant games | Free |

## Personas — Quick Reference

For full descriptors of BMGD personas + 8 industry-standard roles, **Read [`game-dev/personas.md`](./game-dev/personas.md)**.

| Persona | Role | This fork status |
|---|---|---|
| Cloud Dragonborn (🏛️) | Game Architect | Imported as `bmad-agent-game-architect` |
| Samus Shepard (🎲) | Game Designer | Imported as `bmad-agent-game-designer` |
| Indie (🎮) | Solo Dev | Imported as `bmad-agent-game-solo-dev` |
| Link Freeman (🕹️) | Game Developer | Imported as `bmad-agent-game-dev` |
| Paige (📚) | Tech Writer (game-specific) | Imported as `bmad-agent-game-tech-writer` |

Plus 8 industry-standard roles documented in `game-dev/personas.md` (Level Designer / Combat Designer / Narrative Designer / Audio Designer / Build Engineer / UX Designer for games / QA Lead / Live Ops Manager).

## NFR Baselines — Quick Reference

For per-platform deep-dive (PS5 / PS5 Pro / Xbox Series X / Series S / Steam Deck / Quest 3 / Switch 2 / mobile / web), **Read [`game-dev/nfr-baselines.md`](./game-dev/nfr-baselines.md)**. Summary :

| Category | Default baseline | Override per platform |
|---|---|---|
| Performance | 60 FPS hot path / 30 FPS mobile / 90 FPS VR | PS5 Pro 4K@60 or 1440p@120 ; Steam Deck 720p@30 ; Quest 3 90 Hz ; Switch 2 docked 1080p@60 |
| Input latency | ≤ 100 ms acceptable / ≤ 50 ms imperceptible | Competitive shooters target ≤ 50 ms |
| Reliability | Crash-free sessions > 99% on shipped builds | AAA target > 99.5% |
| Memory (mobile) | ≤ 400 MB heap total | iPhone 12 kill threshold ~150 MB heap |
| Loading time | ≤ 30 sec initial / ≤ 3 sec transitions | Switch cert requires ≤ 10 sec initial |

## Security Baseline — Quick Reference

For full compliance matrix (GDPR / CCPA / COPPA / PIPL / EAA / CVAA / regional / IAP / DRM / loot box laws), **Read [`game-dev/security-baseline.md`](./game-dev/security-baseline.md)**. Cross-cutting principles :

- Client-trust = zero. Authoritative server for all game-affecting state.
- Receipt validation server-side ONLY (Apple/Google guidelines).
- Never store credit cards (PCI scope) — tokenise via Stripe/Apple Pay/Google Pay/platform store.
- Never store passwords plaintext — OAuth via Sign in with Apple/Google/Steam/Xbox Live/PSN.
- EU EAA effective 28 June 2025 : online game stores in scope (EN 301 549 / WCAG 2.1 AA).
- CVAA US extended to games since 2024.

## Observability Defaults — Quick Reference

For full vendor matrix + custom event taxonomy, **Read [`game-dev/observability.md`](./game-dev/observability.md)**. Industry-baseline triad : **crash reporting** (Sentry or Backtrace) + **analytics** (GameAnalytics or Amplitude) + **performance instrumentation** (in-engine + server-side metrics).

## AI Integration Trends (May 2026)

Per 2026 State of the Game Industry Report :

- **20% of Steam games disclose AI usage** as of May 2025 (doubled YoY).
- **36% of game-dev professionals use AI tools** : 81% for research / brainstorming, 47% for coding.
- **Sentiment is mixed** : 7% see AI positively (down from 13% in 2025) due to job displacement concerns.
- **Morgan Stanley estimates $22B AI opportunity** for studios going AI-native (NPCs with persistent memory, real-time world generation, dynamic narrative).
- **AI-generated assets** : Meshy (text-to-3D, $20/mo), Tripo (image-to-3D), Stable Diffusion / Midjourney (concept art only — copyright risk for shipping textures), ElevenLabs (AI VO with 2024 SAG-AFTRA disclosure + consent framework).
- See [`game-dev/asset-pipeline.md`](./game-dev/asset-pipeline.md) for AI-asset workflow + copyright / IP considerations.

## Industry Context (May 2026)

- **Switch 2 launched 5 June 2025** — already on market. Lineup : Yoshi (21 May), Star Fox (25 June), Splatoon Raiders (23 July).
- **PS5 Pro adoption growing** : PSSR upscaling + 1440p@120 mode standard for AAA.
- **Xbox in transition** post-Activision-Blizzard acquisition (2023-2025).
- **Steam discoverability crisis** : 10000+ games / year shipping ; algorithmic recommendation + community wishlists are the primary discovery path.
- **Live-service vs premium reset** : Helldivers 2 / Black Myth Wukong success showed premium-with-light-live-touch model viability vs pure F2P fatigue.

## External References (canonical)

| Source | URL | Why |
|---|---|---|
| Game Programming Patterns (Bob Nystrom) | <https://gameprogrammingpatterns.com> | Free online canonical book on patterns |
| Game Engine Architecture (Jason Gregory) | <https://www.gameenginebook.com> | 3rd ed. 2018, AAA architecture reference |
| Real-Time Rendering (Akenine-Möller et al.) | <https://www.realtimerendering.com> | SOTA graphics |
| Data-Oriented Design (Richard Fabian) | <https://www.dataorienteddesign.com/dodbook> | Free online, ECS conceptual foundation |
| Mathematics for 3D Game Programming (Eric Lengyel) | <https://www.mathfor3dgameprogramming.com> | Math reference |
| AI for Games (Ian Millington) | <https://www.aiforgames.com> | Behaviour Trees, GOAP, pathfinding |
| The Book of Shaders | <https://thebookofshaders.com> | Free online shader theory |
| GDC Vault | <https://www.gdcvault.com> | Postmortems + technical talks |
| Game Developer (formerly Gamasutra) | <https://www.gamedeveloper.com> | Industry news + best practices |
| Game Maker's Toolkit (Mark Brown, YouTube) | <https://www.youtube.com/@GMTK> | Design analysis videos |
| Freya Holmér (YouTube) | <https://www.youtube.com/@acegikmo> | Math + graphics educational |
| r/gamedev | <https://reddit.com/r/gamedev> | Community forum |
| gamedev.net | <https://www.gamedev.net> | Forums + tutorials |
| 2026 State of the Game Industry | <https://gdconf.com/state-of-game-industry> | Annual industry pulse (GDC + Game Developer published report) |
| BCG Video Gaming Report 2026 | <https://www.bcg.com/publications/2025/video-gaming-report-2026-next-era-of-growth> | Market sizing + AI trends |

Engine-specific URLs live in `game-dev/engines.md`. Vendor-specific URLs (observability, audio, etc.) live in their respective sub-files.
