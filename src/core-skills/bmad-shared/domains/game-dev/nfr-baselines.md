# Domain Sub-File: NFR Baselines

**Parent:** `domains/game-dev.md`
**Scope:** Default Non-Functional-Requirement baselines for game-dev stories — performance, network, memory, storage, audio, asset budgets, load times. Per-platform numbers sourced from vendor SDK documentation, platform certification guides, and industry-standard middleware docs. These values feed the NFR Registry of `spec-completeness-rule.md` (v2 schema). Projects override per their actual target market.
**Source pin:** Vendor SDK docs (Apple, Google, Sony, Microsoft, Meta, Nintendo, Valve) + middleware docs (Wwise / FMOD) + industry literature (John Carmack on latency, Riot on Valorant tick rate). Verified May 2026.

---

## Performance Baselines

### Frame rate targets per platform

| Platform | Resolution + FPS (typical baseline) | Notes |
|---|---|---|
| **PS5** (base) | 1440p @ 60 FPS (most quality modes) / 4K @ 30 FPS / 1080p @ 120 FPS (performance modes) | Many titles ship dual modes (Quality / Performance). |
| **PS5 Pro** | 4K @ 60 FPS via PSSR upscaling (1440p internal) / 1440p @ 120 FPS / experimental 8K @ 60 FPS with PSSR 2 | PSSR 2 announced for 2026, supports 4K@120 / 8K@60 / 1080p@120 / 1440p@120 locked. Overhead ~2 ms GPU time at 4K. |
| **Xbox Series X** | 4K @ 60 FPS | 13.5 GB GDDR6 available to games (10 GB fast @ 560 GB/s + 6 GB standard @ 336 GB/s; ~2.5 GB reserved for OS). |
| **Xbox Series S** | 1440p @ 60 FPS (target — not 4K) | 8 GB GDDR6 available to games. June-2022 GDK update freed hundreds of MB more for games. |
| **Steam Deck** | 720p @ 30 FPS (Steam Deck Verified baseline) | Verified games must hit at least 720p / 30 FPS on the integrated screen. FSR1 / FSR2 typically used for upscaling to dock 1080p. |
| **Steam Machine** (Verified, 2026) | 1080p @ 30 FPS (Verified baseline) | All Steam Deck Verified games are also Steam Machine Verified. RDNA 3 GPU more powerful than Deck; FSR enables 1440p / 4K above the verified floor. |
| **Quest 3 / Quest 3S** | 90 Hz default — also 72 Hz (legacy), 80 Hz, experimental 120 Hz | 11 ms render budget at 90 Hz. Thermal throttling can step refresh down to 72 Hz first, then frame rate. Dynamic resolution scaling required for CPU/GPU level 5. |
| **Switch 2 docked** | 1080p @ 60 FPS (common AAA target — some titles hit 1440p) | "Handheld Mode Boost" (system update 22.0.0) renders backward-compat original Switch games at 1080p in handheld. |
| **Switch 2 handheld** | 720p @ 30 FPS (typical AAA target) — 1080p @ 60 FPS achievable for tuned titles | Indiana Jones and the Great Circle targets 1080p docked / 720p handheld @ 30 FPS — a representative AAA baseline. |
| **iOS (ProMotion devices)** | 120 Hz adaptive (Pro models) — 60 Hz on standard iPhones | iPhone Pro models from 13 Pro onward support ProMotion (variable refresh up to 120 Hz). |
| **Android (high-end)** | 120 Hz target on premium devices — 60 Hz minimum | Many flagship devices (Galaxy S series, Pixel Pro) support 120-144 Hz displays. |

### Frame pacing + perceived smoothness

- **Bimodal frame-time distribution** (e.g. frames at both 16.6 ms and 33 ms) = red flag. Indicates scheduling / GC / I/O contention. The player perceives micro-stutter, not the average FPS.
- **Jank budget** — fraction of frames exceeding 2× the target frame time. Target < 1% on shipped builds. Above 5% = visible micro-stutter.
- **VSync interaction**: tearing-free presentation requires synchronisation. Triple-buffering trades latency for smoothness. VRR (Variable Refresh Rate) displays (Freesync / G-Sync / HDMI 2.1 VRR) eliminate tearing without the latency cost — preferred where supported.

### Input latency

Per John Carmack's published analysis:

- **≤ 20 ms** total system latency — generally imperceptible.
- **≤ 50 ms** — feels responsive but subtly lagging.
- **≤ 100 ms** — still usable; HCI studies show no measurable usability impact below 100 ms.
- **> 100 ms** — noticeable delay, degrades feel for action / fighting / FPS / VR.

VR has a stricter target: **motion-to-photon latency ≤ 20 ms** is the cybersickness-mitigation threshold. Above that, cybersickness incidence rises sharply.

---

## Network NFR

### Tick rate

| Tick rate | Use case | Notes |
|---|---|---|
| **8 Hz** | Background world sync, async multiplayer | Very low bandwidth; not suitable for action gameplay. |
| **16 Hz / 20 Hz** | MMO non-combat / open-world background | Most MMOs use a variable tick rate — combat zones higher than wilderness. |
| **30 Hz** | Co-op / non-competitive multiplayer | Typical floor for action-feel multiplayer. |
| **60 Hz / 64 Hz** | Standard competitive multiplayer (Counter-Strike default, many shooters) | 64 Hz = update every 15.6 ms. |
| **128 Hz** | High-end competitive shooters (Valorant) | 128 Hz = update every 7.8 ms. Riot ships Valorant on 128 Hz dedicated servers with target < 35 ms region-wide latency. Better hit-registration precision, ~2× the server cost. |

### Packet + bandwidth

- **UDP MTU safe size**: **1200 bytes** is the industry-standard conservative ceiling that avoids fragmentation across most network paths.
- **MTU 1500** is the Ethernet standard but tunnels, VPNs, and some ISPs reduce effective MTU — 1200 is the safe default.
- **Bandwidth per player per tick**: tight games target < 32 KB/s outbound from server per player; budget more for snapshot interpolation buffers.

### Lag compensation + authority models

- **Server-authoritative**: all game-affecting state computed on the server. Required for competitive integrity. The client renders predictions but the server is the source of truth.
- **Client-side prediction**: client speculatively executes player input; reconciles with server snapshots on arrival. Standard for action games (FPS, MOBA).
- **Interpolation buffer**: client renders enemies ~100 ms behind real-time to smooth jitter. Tradeoff between latency and smoothness.
- **Lag compensation (favour-the-shooter)**: server rewinds the world to the shooter's timestamp to verify their shot — historically standard for FPS. Tradeoff: dying behind cover feels unfair, but shot validation is responsive.

### Rollback netcode

- **GGPO-class rollback** (input prediction + speculative execution + re-simulation on input arrival) is the **industry standard for competitive fighting games** as of 2026.
- **Determinism is mandatory**: the simulation must produce identical output for identical inputs across all clients. Fixed-point math or carefully-controlled floating-point.
- **Implementation requirements**: serialise complete game state per frame; rewind + re-execute on remote input arrival; cap rollback window (typically 7-8 frames @ 60 Hz = ~120 ms).
- **GGPO** is the canonical reference SDK (BSD-licensed). Skullgirls, Guilty Gear Strive, Street Fighter 6, Tekken 8, and most modern fighters use rollback (Skullgirls historically pioneered the GGPO integration in fighters).

### Latency budgets per game type

| Game type | Target RTT | Cap RTT | Notes |
|---|---|---|---|
| Competitive FPS / fighter / MOBA | < 50 ms | 100 ms | Above 100 ms, hit-reg + combo timing degrade. |
| Realtime PvP (any non-tournament-tier) | < 100 ms | 250 ms | Co-op shooters, racing, brawlers. |
| Co-op (relaxed) | < 250 ms | 500 ms | PvE co-op (Destiny strikes class). |
| MMO PvE | < 500 ms | 1 s | Tab-target combat tolerates much higher RTT than action combat. |
| Async multiplayer | seconds | minutes | Words With Friends class. |

---

## Memory Budgets

### Mobile

| Target | RAM budget guidance | Notes |
|---|---|---|
| **Android — Build-for-Billions / low-end** | ≤ 150 MB PSS (Proportional Set Size) for games per Android's *Build for Billions* device-capacity guidance | Standard heap 128-256 MB on modern devices; `android:largeHeap="true"` raises to ~512 MB on high-end. |
| **Android — mid / high-end** | 400-800 MB typical envelope | LMK (Low Memory Killer) kills cached apps when global pressure rises. Foreground app priority depends on signalled state. |
| **iOS — typical envelope** | 150-400 MB practical ceiling depending on device | iOS Jetsam kills background-then-foreground apps under pressure. iPhone 12 baseline is the indie-mobile reference; iPhone 15 Pro raises the ceiling significantly. |

### Console

| Platform | RAM / VRAM budget for game | Notes |
|---|---|---|
| **PS5** | ~12.5 GB usable system + GPU shared (16 GB total, ~3.5 GB reserved) | Unified-memory architecture; budget VRAM + system together. |
| **PS5 Pro** | ~14 GB usable | Larger reserve allocated to the OS for PSSR / video features. |
| **Xbox Series X** | 13.5 GB available to games (10 GB fast + 6 GB standard split, ~2.5 GB OS reserve) | The fast-pool / standard-pool split forces deliberate budgeting. |
| **Xbox Series S** | 8 GB available to games | Post-June-2022 GDK update added "hundreds of MB" newly allocated to games. |

### VR / Quest

| Platform | Memory budget | Notes |
|---|---|---|
| **Quest 3 / 3S** | ~2 GB heap practical ceiling for app | 8 GB device RAM; OS + composition reserve large portion. Thermal throttle after extended sessions — design for the steady-state, not peak. |

### Texture / VRAM (PC + console)

| Scene class | VRAM textures envelope | Notes |
|---|---|---|
| 1080p indie scene | 1-2 GB | Tight texturing budgets, atlas-aggressive. |
| 1080p AA scene | 2-4 GB | More variety, higher texel-density. |
| 4K AAA scene | 4-8 GB | Streaming + Nanite / virtual-texturing offsets the budget. |

---

## Loading Time Budgets

| Event | Budget | Source |
|---|---|---|
| **Initial cold-start to title screen** | ≤ 30 sec on console | Industry cert convention; Switch is stricter (≤ 10 sec to playable per published guidance for Lotcheck-adjacent expectations). |
| **Game launch to playable** | ≤ 5 sec target for mobile / web; ≤ 30 sec console | Mobile users churn aggressively above 10 sec. |
| **Level transition (in-game)** | ≤ 3 sec | Above 3 sec, design a "loading masking" (cinematic / autosave / hint screen). |
| **Save / load operation** | ≤ 1 sec | Above 1 sec, async behind a UI feedback element. |
| **Cold-start (after install / update)** | One-time longer load tolerable | Mobile users tolerate up to 10-15 sec on first-run if the game is impressive immediately. |

<!-- TODO verify: Nintendo's official 10-second-to-playable Lotcheck requirement is under NDA — public sources don't disclose the exact number. The 10-second figure is commonly cited by developers but should be confirmed against the current NOA Lotcheck Quality Standards document at story-spec time. -->

---

## Storage Budgets

| Platform / channel | Install size budget | Notes |
|---|---|---|
| **iOS (cellular download)** | ≤ 200 MB initial app bundle | Apple's cellular download cap (raised from 150 MB in 2019). Above 200 MB requires Wi-Fi confirmation or App Thinning + on-demand resources. |
| **iOS — on-demand resources** | Chunks delivered post-install | Use ODR or App Store asset packs for additional content above the 200 MB initial cap. |
| **Google Play** | ≤ 200 MB initial APK / AAB on mobile data; larger via Play Asset Delivery | Play Asset Delivery (PAD) supports install-time, fast-follow, and on-demand asset groups. |
| **Console — AAA** | 50-150 GB typical envelope | Patches stacking can push beyond this; users complain at 200+ GB. |
| **Console — indie** | < 10 GB typical target | Aggressive compression + on-demand DLC. |
| **PC (Steam)** | No hard cap, but > 100 GB is friction at install | Wishlist-conversion drops above 100 GB for non-AAA. |
| **Web (Phaser / HTML5)** | ≤ 50 MB total download for casual | Mobile data caps + first-load expectations. Single-build target. |
| **WeChat Mini Game** | ≤ 4 MB initial package | Platform-enforced. Use WeChat sub-package loading for additional content. |

---

## Audio Budgets

| Resource | Budget | Notes |
|---|---|---|
| **FMOD memory pool — mobile** | 16-32 MB | FMOD docs' published recommendation for mobile builds. |
| **FMOD memory pool — PC / console** | 64-128 MB | Same source. Wwise has analogous tiers via `AK_MEMORY_TIER` settings. |
| **Resident audio (loaded into RAM)** | ≤ 128 MB resident is a typical AAA mobile ceiling; indie is lower | Short SFX, UI sounds, frequently-triggered events — resident. |
| **Streamed audio** | Music, dialog, ambience streamed from disk; ≤ 256 MB streaming buffer total | Picked compression matters: ADPCM / Vorbis / Opus / platform-native (e.g. AT9 on PlayStation). |
| **VO bitrate** | 96 kbps mono, 16-22 kHz typical for in-game VO | Cinematic VO can go higher; in-game VO budget-pressured. |
| **Music bitrate** | 192-256 kbps stereo (Vorbis / Opus) for streamed music | Some AAA titles use 320 kbps; mobile typically 128-160 kbps. |
| **Loaded vs streamed decision rule** | Streamed if > 5 sec OR triggered < 1×/minute; resident otherwise | Reduces seek-time stalls on frequently-triggered short SFX. |

### Spatial audio

- **HRTF (Head-Related Transfer Function) processing** for binaural / VR audio. Wwise Spatial Audio module, FMOD Studio Spatializer, atmoky True Spatial are the common implementations.
- **Dolby Atmos** on premium platforms (PS5, Xbox Series X, Quest 3 via Spatial Audio). Object-based audio rather than channel-based. Baldur's Gate 3 documented a 6-month Atmos implementation effort.

---

## Asset Budgets per Platform

### Polygon counts per scene-frame

| Platform | Triangles visible per frame (rough envelope) | Notes |
|---|---|---|
| **PS5 / Xbox Series X** | ~20 M triangles per frame (with Nanite virtualisation) | UE5 Nanite + similar tech allow trillions of source triangles streamed virtually. |
| **PS5 Pro** | ~25 M effective via PSSR | Upscaling extends effective complexity. |
| **Steam Deck** | ~5 M triangles per frame | Conservative — lower thermal envelope. |
| **Switch 2** | ~8 M triangles per frame (estimated, varies by docked vs handheld) | Roughly 1.5× Switch 1 baseline; portable mode lower. |
| **Quest 3** | ~3 M triangles per frame | Thermal + mobile-SoC constrained. Fixed Foveated Rendering helps. |
| **Mobile (high-end)** | ~2 M triangles per frame | Snapdragon 8 Gen 3 class; lower on mid-tier (Galaxy A54 / iPhone 12 class). |

### Polygon counts per asset

| Asset class | Mobile | Console / PC | Notes |
|---|---|---|---|
| **Background prop (crate, barrel)** | < 500 tris | 1,000-10,000 tris | Hero props higher than ambient. |
| **Character (player or major NPC)** | 1,500-5,000 tris | 15,000-50,000 tris | Mocapped MetaHuman characters can exceed 100K tris with hair / clothing. |
| **Vehicle (racing game)** | 5,000-15,000 tris | 80,000-150,000 tris | Highly visible hero asset. |
| **Foliage instance** | < 100 tris | 100-500 tris | Compensated by instancing + LOD systems. |

### Draw call budgets

| Platform | Draw calls per frame (rough target) | Notes |
|---|---|---|
| **PS5 / Xbox Series X / PC AAA** | < 10,000 with high-end CPU and modern APIs | Modern APIs (DX12, Vulkan, Metal) move CPU cost to setup time; commands are fast at submit. |
| **Steam Deck** | < 3,000 | CPU thermal-limited. |
| **Switch 2** | < 5,000 (estimated) | Lower-CPU envelope. |
| **Quest 3** | < 1,500 | Strict — mobile SoC + VR scheduler reserves headroom. |
| **Mobile** | < 1,000 typical, < 500 ideal | OpenGL ES / Vulkan-mobile drivers expensive per draw call. |

### Texture resolution

| Platform | Typical max single-texture resolution | Notes |
|---|---|---|
| **Console 4K target** | 4K (4096×4096) hero textures | Streaming systems (Unreal Virtual Texturing, Unity Streaming) deliver mipmaps just-in-time. |
| **Mobile** | 2K (2048×2048) maximum; 1K (1024×1024) typical | DXT5 / ETC2 / ASTC compression mandatory. |
| **Quest 3 / VR** | 1080p effective per eye buffer | Two eyes rendered per frame. Foveated rendering reduces peripheral resolution. |
| **Web (Phaser)** | 2K maximum; atlas-pack aggressively | Single-texture-load latency dominates web perf. |

---

## Compliance + cert-driven NFRs

### Storefront-driven minimums (worth flagging in spec)

- **Apple App Store**: < 200 MB cellular install bundle. App Thinning + on-demand resources for the rest.
- **Google Play**: 200 MB initial APK / AAB on cellular; Play Asset Delivery for additional content.
- **Sony / Microsoft / Nintendo** cert processes (TRC / XR / Lotcheck) cover crash-free sessions, controller behaviour, save corruption recovery, and load-time conventions. Specific values are under NDA. Plan a 6-12 week cert window pre-ship.

### Crash-free session rate

- **Industry baseline**: > 99% crash-free sessions on shipped builds (per Sentry / Backtrace public benchmarks).
- **AAA target**: > 99.5%. Day-1 patch frequently lands to address the worst regressions discovered in the cert window.

---

## Sources

### Platform performance baselines

- PS5 Pro PSSR review (Archyde) — <https://www.archyde.com/ps5-pro-review-is-the-upgrade-worth-it-for-serious-gamers-pricing-pssr-tech-buying-guide-march-2026/>
- PS5 Pro overview — <https://www.playstation.com/en-us/ps5/ps5-pro/>
- Xbox Series X|S graphics memory overview (Microsoft GDK) — <https://learn.microsoft.com/en-us/gaming/gdk/_content/gc/graphics/graphics-memory-overview>
- Xbox Series S June-2022 GDK update — <https://www.windowscentral.com/gaming/xbox/microsoft-game-development-kit-update-can-improve-performance-on-xbox-series-s>
- Steam Machine Verified requirements at GDC 2026 — <https://www.gamingonlinux.com/2026/03/valve-detail-steam-frame-and-steam-machine-verified-requirements-at-gdc-2026/>
- Steam Machine Verified — 1080p @ 30 FPS (Insider Gaming) — <https://insider-gaming.com/steam-machine-targets-1080p-at-30-fps-for-deck-verified-games/>
- Switch 2 features (Nintendo official) — <https://www.nintendo.com/us/gaming-systems/switch-2/features/>
- Switch 2 Handheld Mode Boost — <https://www.videogameschronicle.com/guide/handheld-boost-mode-toggle-nintendo-switch-2/>
- Switch 2 1080p / 720p target example (Indiana Jones) — <https://mynintendonews.com/2026/05/01/indiana-jones-and-great-circle-devs-target-1080p-docked-720p-handheld-and-30fps/>

### Quest 3 / VR

- Meta Quest 3 refresh rates — <https://developers.meta.com/horizon/documentation/unreal/unreal-change-display-refresh-rate/>
- Quest 3 dev tips + performance — <https://developers.meta.com/horizon/blog/start-developing-Meta-Quest-3-tips-performance-mixed-reality/>
- VR performance optimisation guidelines — <https://developers.meta.com/horizon/documentation/native/pc/dg-performance-guidelines/>
- Boosting CPU/GPU levels on Quest — <https://developers.meta.com/horizon/documentation/unity/po-quest-boost/>

### Input latency

- John Carmack — latency mitigation strategies — <https://danluu.com/latency-mitigation/>
- John Carmack on VR latency (Road to VR) — <https://www.roadtovr.com/john-carmack-talks-virtual-reality-latency-mitigation-strategies/>
- Cybersickness + latency review (Frontiers) — <https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2020.582204/full>

### Network / netcode

- Valorant 128 Hz tick rate (TweakTown) — <https://www.tweaktown.com/news/70960/riots-new-fps-valorant-128hz-tick-rate-servers-with-35ms-latency/index.html>
- Tick rate fundamentals — <https://33rdsquare.com/what-is-a-good-tick-rate-and-why-should-you-care/>
- CS2 tick rate + sub-tick — <https://tradeit.gg/blog/cs2-tick-rate/>
- Netcode (Wikipedia) — <https://en.wikipedia.org/wiki/Netcode>
- Networking bandwidth + MTU (gamedev guide) — <https://ikrima.dev/ue4guide/wip/unfinished/networking-bandwidth-mtu/>
- Unity Netcode for GameObjects tick + update — <https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/learn/ticks-and-update-rates.html>
- GGPO — <https://www.ggpo.net/>
- GGPO Wikipedia — <https://en.wikipedia.org/wiki/GGPO>
- Rollback netcode architecture (SnapNet) — <https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/>

### Memory

- Android memory allocation — <https://developer.android.com/games/optimize/memory-allocation>
- Android Low Memory Killer (games) — <https://developer.android.com/games/optimize/vitals/lmk>
- Android Low Memory Killer (general) — <https://developer.android.com/topic/performance/vitals/lmk>
- Android Build for Billions — device capacity — <https://developer.android.com/docs/quality-guidelines/build-for-billions/device-capacity>

### Storage / store policies

- Apple cellular download limit history (MacRumors) — <https://www.macrumors.com/2019/05/31/app-store-download-limit-upped-to-200mb/>
- iOS App size limits — <https://www.simplymac.com/ios/ios-app-size-limits>
- App Store Review Guidelines — <https://developer.apple.com/app-store/review/guidelines/>
- Google Play policies — <https://support.google.com/googleplay/android-developer/answer/9858738>

### Audio

- FMOD Core API resource management — <https://www.fmod.com/docs/2.03/api/managing-resources-in-the-core-api.html>
- Wwise / FMOD comparison (The Game Audio Co.) — <https://www.thegameaudioco.com/wwise-or-fmod-a-guide-to-choosing-the-right-audio-tool-for-every-game-developer>
- Optimizing audio assets for mobile (Moldstud) — <https://moldstud.com/articles/p-optimizing-audio-assets-for-enhanced-performance-in-mobile-game-development>
- Audiokinetic Wwise product — <https://www.audiokinetic.com/products/wwise/>
- atmoky True Spatial — <https://atmoky.com/products/true-spatial/>

### Asset budgets

- Polygon Count Guide (CGAxis, 2026) — <https://cgaxis.com/polygon-count-guide-how-many-polys-do-you-really-need-in-2026/>
- Polygon Budget for Next-Gen Games (polycount) — <https://polycount.com/discussion/128626/polygon-budget-for-next-gen-games>

### Certification

- Console compliance QA — <https://www.ixiegaming.com/blog/console-compliance-testing/>
- Cert + submission testing (Kudos QA) — <https://www.kudosqa.com/services/certification-submission-testing>
- Game launch checklist (OVG) — <https://oceanviewgames.co.uk/resources/platform-readiness-checklist>
- NOA Lot Check (Nintendo, Fandom community summary — non-NDA secondary) — <https://nintendo.fandom.com/wiki/NOA_Lot_Check>

### Crash-free baseline

- Sentry game-developers — <https://sentry.io/solutions/game-developers>
- Backtrace — <https://backtrace.io/>
