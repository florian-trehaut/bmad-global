# Domain Sub-File: QA & Testing

Production-grade QA and testing reference for game development. Covers test pyramid adapted for games, automated playtest frameworks, replay verification, save fuzzing, platform certification, performance regression, bug triage, beta programs, and accessibility/compliance testing.

Master file: `domains/game-dev.md`. JIT-loaded by workflows touching test planning, CI integration, platform submission, or release readiness gates.

---

## Test Pyramid for Games

Games have unique testing challenges: nondeterministic AI, frame-rate dependencies, hardware variance, multiplayer concurrency. The classic test pyramid still applies but tilts toward expensive integration / E2E levels for gameplay-critical paths.

### Unit

Pure game logic in isolation, no engine dependency:
- Combat damage calculation (DPS formulas, armor mitigation, crit multipliers)
- Inventory operations (add/remove/stack/split)
- Save/load serialization (round-trip a save → confirm bytes-equal output)
- AI decision tree node evaluation
- Math utilities (vector ops, interpolation curves)
- Loot drop probability distributions
- Quest state machine transitions

Tooling: NUnit (Unity), Catch2 / GoogleTest (C++ Unreal modules), Boost.Test, custom XCTest for game logic.

**Anti-pattern**: unit-testing logic that depends on Unity `MonoBehaviour` or Unreal `UObject` lifecycle. If you must mock the engine, the code is too coupled — refactor logic out to plain-C# / plain-C++ classes.

### Integration

Multiple systems collaborating with real dependencies (engine, DB, network):
- Combat + inventory + UI (kill enemy → loot drops → UI updates)
- Save system + game state (save mid-quest → restart → quest resumes)
- Multiplayer net sync (two clients fire weapons → server resolves → state syncs)
- Audio + animation event sync (footstep anim event → SFX plays at right frame)

Tooling: Unity Test Framework PlayMode tests, Unreal Functional Testing (BP-driven scenarios), custom Python harnesses calling into engine via CLI.

### Playthrough (E2E for games)

Automated AI / scripted-agent plays full game sequences:
- Boot game → main menu → load save → play 5 minutes → quit cleanly
- Tutorial completion run (verify every tutorial step gates correctly)
- Speedrun-style validation (known-good replay path)
- AI agent (RL / LSTM) drives random exploration for hours, detects crashes

Rare but high-value for:
- Roguelikes (procgen content needs broad coverage)
- Live-service games (regression suite for every patch)
- Long-tail post-launch maintenance

### Performance

Automated perf regression suite:
- Frame-time per scene (target 16.67 ms = 60 fps, 33.33 ms = 30 fps)
- Memory growth over time (heap profile every 60 seconds, fail on monotonic climb)
- GPU stalls (RenderDoc / PIX captures, automated frame analysis)
- Load times (cold start, level transition, asset bundle download)
- Network bandwidth + packet rates

### Compatibility

Matrix of OS + GPU + driver + input device combinations:
- Windows 10 / 11, macOS 14 / 15, Linux (Steam Deck = Proton on Arch)
- NVIDIA / AMD / Intel GPU (last 3-5 driver versions each)
- Xbox controller / DualSense / Switch Pro / generic HID controller
- Steam Deck verified status

Many indie studios offload compat testing to QA vendors (PTW, Lionbridge, Keywords) — cheaper than maintaining device labs.

---

## Automated Playtest Frameworks

### Unity Test Framework

- **NUnit-based** — write tests in C# (UnityTest attribute for coroutines)
- **EditMode tests** — run in editor, no game loop (pure logic / asset validation)
- **PlayMode tests** — run in game loop, can test MonoBehaviour lifecycle, scene transitions
- **Test Runner window** — manual + CLI invocation
- **CI integration** — `Unity -batchmode -runTests -testPlatform PlayMode -testResults results.xml`
- Plus packages: NSubstitute (mocking — use sparingly), FluentAssertions

### Unreal Automation Framework

- **Gauntlet** — Epic's framework for automation of "boot game → run scenario → assert outcomes". Used internally on Fortnite.
- **Functional Testing** — Blueprint-driven test maps, place actor that runs sequence + asserts
- **Automation tests** — C++ `IMPLEMENT_SIMPLE_AUTOMATION_TEST` macro for unit-ish tests
- **Stress tests** — Standalone executables driving game with synthetic input
- **CI integration** — `UE4Editor-Cmd ExecCmds="Automation RunTests..."`

### Godot Testing

- **GUT (Godot Unit Test)** — community framework, GDScript + C# support, the de-facto standard
- **Godot Test Framework (engine-native)** — basic, less mature than GUT
- **CI integration**: GUT supports headless runs via `godot --headless --quit`

### AI Playthrough

Recent advances (2023-2026) made automated playthrough viable for non-trivial games:
- **Trained RL agents** (PPO, IMPALA) — play game to maximize score / exploration
- **LSTM action models** — imitate human player traces, run regression playtests
- **LLM-driven QA** (experimental, 2025+) — GPT-4 / Claude controls character via tool-calls, exercises narrative branches

Open-source frameworks: Unity ML-Agents, OpenAI Gym game environments.

---

## Replay Verification

Critical for deterministic games (fighting games, rhythm, racing) and useful as regression tool elsewhere.

### Components

- **Input log** — every input event with timestamp / frame number
- **RNG seed** — deterministic random source, recorded at session start
- **Initial state** — game state snapshot at session start
- **Deterministic simulation** — fixed timestep, no float drift across platforms

### Replay Process

1. Replay input log on second machine
2. Compare outcomes (frame-perfect for fighting games; milestone-equivalent for RPGs)
3. Diff failure: replay diverged — bug introduced OR non-determinism leak

### Use Cases

- **Leaderboard validation** — verify submitted high score was achievable from replay
- **Cheat detection** — replay shows whether claimed run is consistent with rules
- **Regression testing** — known-good replay run nightly, fails if game logic changes silently
- **Bug repro** — players submit replay file with bug report, reproducer is exact

### Determinism Pitfalls

- `float` math drift across CPU architectures — use fixed-point for deterministic sims
- Multithreaded execution order — single-thread or seed every thread's RNG
- Asset version mismatch — bake replay metadata with asset GUIDs

Example titles using replay verification: Street Fighter series, StarCraft series, Rocket League, Slay the Spire (cheat-resistant leaderboards).

---

## Save State Fuzzing

Save corruption + version migration are major sources of player-facing crashes.

### State Machine Testing

- Transition every state pair in game state machine
- Save in each state → load → verify state restored correctly
- Save mid-transition (between states) → load → verify recovery

### Corrupted Save Handling

Fuzz save files with:
- **Truncation** — chop random bytes off end (incomplete write simulation)
- **Bit flips** — flip random bytes (disk corruption simulation)
- **Version mismatch** — save from old build → load with new build
- **Format swap** — load saves from totally different game (negative test, must reject cleanly)
- **Empty file** — zero-byte save (newly created, not written)
- **Oversized file** — gigabyte-sized save (malicious or bug-induced)

Game MUST gracefully fail-out on every variant — never crash, never lose user's other saves.

### Migration Testing

For long-lived games (live-service, sequels supporting save imports):
- Save from v1.0 → load in v1.5 → save in v1.5 → load in v2.0 (cumulative migration)
- Skip-version: save from v1.0 → load in v2.0 directly
- Cross-platform: PS5 save → Xbox cloud sync → load on PC

CI gate: every save format version bump must include migration test from previous N versions.

---

## Platform Certification Process

### Sony PlayStation 5 (TRC)

- **TRC (Technical Requirements Checklist)** — Sony's mandatory compliance document. PS5 TRC stricter than PS4 TRC in some localization items, plus PS5-specific Activities UI element requirements.
- **Key checks**: crash-free operation, initial boot < 30 seconds, controller disconnect handling, sleep/resume, profile switching, save data location + roaming, trophy registration, Activities integration, Game Help, Game Hubs.
- **Typical cycles**: 2-3 submissions before pass.
- **Patch certification**: weeks-long process; day-one patches submitted ~1-1.5 months before release.

### Microsoft Xbox (XR / GameCore)

- **XR (Xbox Requirements)** — Microsoft equivalent of TRC. Cert-tested XRs documented at `learn.microsoft.com/gaming/gdk`.
- **GameCore SDK** — unified SDK for Xbox One, Xbox Series X/S, PC GamePass.
- **Key checks**: Quick Resume support, save data roaming across generations (XR-052), controller-only navigation (no compulsory keyboard/mouse), Smart Delivery for cross-gen titles, achievements registration, GameDVR + capture support, Discord rich presence (optional).
- **Top failing test cases** documented publicly — review before submission.

### Nintendo Switch (Lotcheck)

- **Lotcheck** — Nintendo's name for the cert process. Performed at Nintendo Quality Assurance facility (Redmond, WA, US, and Tokyo, JP).
- **Strict on**: docked/handheld switching, suspended-mode resume, controller pairing flow, save data + cloud handling, online play guidelines, parental controls.
- **Switch SDK** — Nintendo Developer Portal access required; NDA-bound.
- **Switch 2 (2025+)** — successor console with updated lot check requirements; backward compatibility with original Switch retail catalog.

### Steam (Steamworks Review)

- **Minimal certification** — no comprehensive technical cert. Reviewed for store compliance (legal terms, content rating consistency, no malware).
- **Steam Direct** — $100 deposit per app to publish.
- **Content guidelines** — pornographic content allowed in unfiltered build; hate speech / sexual minors / etc. banned.
- **AI disclosure** — required since 2024 if generative AI used (asset / audio / text / code).

### Apple App Store

- **App Review** — average 24-48 hours turnaround.
- **Common rejection reasons**:
  - In-app purchase issues (must use Apple IAP for digital goods sold in-app)
  - Privacy nutrition labels missing / inaccurate
  - Hidden features not visible in initial review build
  - Copycat / spam apps
  - Misleading marketing claims
- **Subscription content** — must pass periodic review.

### Google Play

- **Faster turnaround** than Apple — hours to a day typical.
- **Automated review + manual flag** — most apps pass automated, manual review on flagged content.
- **Content rating** via IARC questionnaire.
- **Play Console policies**: ads disclosure, in-app billing for digital goods, no hidden features, no malware.

### Common Rejection Reasons per Platform

| Platform | Top Reasons |
|----------|-------------|
| Sony | Controller disconnect mishandling, trophy data corruption, suspend/resume crashes, age rating mismatch, localization missing required strings |
| Microsoft | Save roaming failures (XR-052), achievement registration errors, Smart Delivery broken on cross-gen, Quick Resume issues |
| Nintendo | Docked/handheld input handling, parental control bypasses, online play violations, save cloud sync edge cases |
| Apple | IAP not used for digital content, privacy label gaps, hidden adult/dev features, misleading promo screenshots |
| Google | IAP policy violations, ads disclosure missing, sensitive permissions over-requested |

---

## Performance Regression Suite

### Frame-Time Tracking

- Per scene / per area, measure 95th and 99th percentile frame times
- Alert on regression > 5% vs baseline
- Tools: Unity Profile Analyzer (compares profiling sessions), Unreal Insights (.utrace files)

### Memory Leak Detection

- Run game for 30+ minutes in test scenario (typical play loop)
- Sample heap every minute
- Failure: monotonic growth > 1 MB/min sustained (clear leak)
- Tools: Unity Memory Profiler, Unreal Memory Insights, RAD's Telemetry

### Load Time Benchmarks

- Cold boot to main menu (start of test)
- Main menu → first playable scene
- Scene-to-scene transitions
- Asset bundle / Addressables download
- Network handshake (multiplayer) timing
- Save load time

PS5 / Xbox Series X target: < 5 seconds from menu to gameplay; mobile target: < 10 seconds; PC: < 15 seconds.

### Network Packet Loss / Latency Simulation

- **Clumsy** (Windows) — free, simulates packet loss, latency, throttle on Windows network stack
- **NetEm** (Linux) — kernel-level network emulation
- **Network Link Conditioner** (macOS) — Apple developer tool
- **Charles Proxy** — HTTPS inspection + throttle
- **Mininet** — full network topology simulation

Standard scenarios: 0% / 1% / 5% / 10% packet loss; 50 ms / 100 ms / 200 ms / 500 ms latency; jitter envelopes.

### GPU Profiling Automation

- **RenderDoc** — open-source, captures D3D/Vulkan/OpenGL frames for offline analysis
- **PIX for Windows** — Microsoft GPU profiler (DX12, Xbox)
- **Razor (PS5)** — Sony first-party profiler (NDA-bound)
- **Xcode Metal Debugger** — iOS/macOS Metal frames
- **NVIDIA Nsight Graphics** — driver-level GPU profiling
- **AMD Radeon GPU Profiler** — AMD-specific

CI integration: capture frame on test runs, diff against baseline, alert if draw call count or GPU time exceeds threshold.

---

## Bug Triage

### Severity Levels (industry standard)

| Severity | Definition |
|----------|------------|
| Critical (S0) | Crash, data loss, save corruption, online disconnect on entire build |
| High (S1) | Game-breaking — quest blocker, progression halted, no workaround |
| Medium (S2) | Significant — workaround exists, content inaccessible until fixed |
| Low (S3) | Cosmetic — visual glitch, typo, audio anomaly, doesn't block play |
| Trivial (S4) | Polish — minor visual / audio inconsistency, no gameplay impact |

### Bug Report Fields (minimum)

- **Title** — concise summary
- **Severity** — S0-S4
- **Frequency** — Always / Often / Sometimes / Once
- **Repro steps** — numbered, every action explicit
- **Expected vs Actual**
- **Build version** — exact hash / changelist
- **Platform / hardware** — OS, GPU, driver, controller
- **Save file** — attached when possible
- **Screenshot / video / crash dump**
- **Log file** — engine + game log up to crash point

### Bug Trackers

- **Jira (Atlassian)** — industry standard for AAA. Powerful but heavy.
- **Linear** — modern, fast, lighter. Indie + mid-tier adoption growing.
- **GitHub Issues** — sufficient for small open-source / indie projects.
- **TestRail** — test plan management + bug tracking; common in AAA QA orgs.
- **Mantis** — open-source classic, declining usage.
- **YouTrack** (JetBrains) — Jira alternative.

### Crash Deduplication

Auto-grouping crashes by stack trace + build version:
- **Sentry** — game-aware crash reporting, $26-$80/month indie tiers
- **Backtrace** (Sauce Labs) — game-focused, AAA usage
- **Crashlytics** (Firebase) — free, mobile-focused, Google ecosystem
- **Bugsplat** — game-industry origin, native code support
- **Custom internal** — many AAA studios build internal crash backends

Critical metric: top 10 crashes by frequency × player-impact = focus list for hotfix patches.

---

## Beta + Playtest Programs

### Closed Beta

- **Invite-only** access (allowlist of email addresses or Steam IDs)
- NDA optional (often required for unfinished content protection)
- Smaller pool — typically 100 to 5,000 testers
- Strong feedback signal-to-noise ratio
- Higher-engagement testers, often power-users

### Open Beta

- Public sign-up, no NDA, anyone can join
- Pre-release marketing function as much as testing
- Pool sizes from 10,000 to millions (Call of Duty Open Beta hits 10M+)
- Validates server scale + matchmaking + day-one issues at scale

### Steam Playtest

- Free Steamworks feature since 2021 (formally released 2022)
- No store page for playtest itself — visible as section on base game's store page
- Limited or open signup modes
- Test build is separate app ID linked to main game
- No paid keys to manage; no impact on main game reviews / wishlists
- Built-in Steam Input, Cloud, achievement support
- Best for indie / mid-tier — no AAA equivalent simplicity

### Discord / PlayFab Community Programs

- Discord server for tester recruitment + feedback channels
- PlayFab matchmaking + analytics for backend testing
- Custom community-management workflows
- Often combined with Steam Playtest (Steam = build distribution, Discord = communication)

### Insights Collected

- **Qualitative** — surveys (Typeform / Google Forms), focus groups, individual interviews
- **Quantitative** — telemetry (PlayFab, Unity Analytics, custom), heatmaps, retention curves, session length distributions
- **Behavioral** — videos of sessions (with consent), keystroke logs

### Notable Postmortems

- **Slay the Spire** (Mega Crit) — open beta on Steam Early Access exposed thousands of card balance issues, automated playtest framework caught regression in card interactions
- **Loop Hero** (Four Quarters) — beta playtest data shaped final pacing
- **Hades** (Supergiant) — Early Access on Epic for 2 years before 1.0; community-driven balance + content tuning

---

## Accessibility Testing

### Screen Reader Compatibility

- **Windows**: NVDA (open-source), JAWS (commercial, dominant in workplace)
- **macOS / iOS**: VoiceOver (system-provided)
- **Android**: TalkBack (system-provided)
- **Switch**: Nintendo accessibility limited; rely on visual + haptic
- **PlayStation**: Screen Reader built into PS5 system since 2.0 firmware
- **Xbox**: Narrator built into system

Verify menus, in-game text, settings all accessible via screen reader. Implement TextMeshPro accessibility (Unity) or Slate accessibility (Unreal).

### Colorblind Testing

Three forms of colorblindness:
- **Protanopia** — red-blind (~1% of men)
- **Deuteranopia** — green-blind (most common, ~5% of men)
- **Tritanopia** — blue-blind (~0.01% of men)

Plus achromatopsia (full colorblind, very rare).

Tools:
- **Coblis** — web-based simulator
- **Color Oracle** — desktop overlay, simulates colorblindness in real time
- Unity Universal Render Pipeline (URP) — built-in colorblind simulation Renderer Feature
- Unreal Engine post-process colorblind simulation

Test all UI elements relying on color (health bars, faction indicators, status effects) — never use color as sole information channel.

### Audio Cues Alternative

Visual or haptic alternative for color-only info:
- Damage indicators (visual flash + controller vibration)
- Footstep proximity (visual radar instead of audio panning)
- Alert sounds duplicated with screen-edge highlights

### Subtitle / Closed Caption Verification

Test that every speech event has subtitle, including:
- NPC barks during gameplay
- Cinematic dialogue
- Off-screen / radio dialogue
- Sound effect captions for hearing-impaired players (`[Door creaks]`)
- Speaker names labeled on dialogue lines

### Controller / Keyboard Alternatives

- Verify keyboard alternative for every controller action
- Remappable keybinds (every action remappable)
- Single-handed control schemes (one-hand mode option)
- Hold-to-toggle alternative for press-and-hold actions

---

## Compliance Testing

### EAA WCAG 2.1 AA Verification

EU Accessibility Act applies to digital products from June 2025 for new releases by large publishers. WCAG 2.1 AA conformance criteria:
- Perceivable (alt text, captions, color contrast 4.5:1 minimum)
- Operable (keyboard accessible, no flashing > 3 Hz, adjustable timing)
- Understandable (predictable behavior, error identification, readable language)
- Robust (compatible with assistive technologies)

Tooling: axe-core for web-based portions; Game Accessibility Guidelines (gameaccessibilityguidelines.com) for game-specific criteria.

### GDPR Data Deletion Request Handling

- Player data deletion endpoint (typically `support@studio.com` or in-game settings)
- Backend able to anonymize / delete player data on request within 30 days
- Includes: account info, save data on servers, telemetry events, support tickets, chat logs
- Test the deletion flow end-to-end — failures here are regulatory fines

### COPPA Age-Gate Verification

- Children's Online Privacy Protection Act (US, ages < 13)
- Age gate at account creation or first play
- For < 13 players: parental consent required, restricted data collection, no targeted ads, no third-party social features without parental opt-in
- Test bypass attempts — game must reliably enforce age-gate

### Other Regulatory

- **CCPA / CPRA** (California) — California-specific privacy disclosures
- **PIPEDA** (Canada) — privacy framework
- **APPI** (Japan) — Japan personal information protection
- **LGPD** (Brazil) — Brazil GDPR equivalent
- **China**: anti-addiction system mandatory for under-18 players (online time limits)

---

## Sources

- [Unity Test Framework](https://docs.unity3d.com/Packages/com.unity.test-framework@latest)
- [Unreal Automation System](https://dev.epicgames.com/documentation/en-us/unreal-engine/automation-system-overview)
- [Steam Playtest (Steamworks)](https://partner.steamgames.com/doc/features/playtest)
- [Xbox certification requirements (Microsoft Learn)](https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/console/certification-requirements)
- [PlayStation TRC overview (NipsApp)](https://nipsapp.com/console-certification-process/)
- [PlayStation 5 TRC localization requirements (SandVox)](https://sandvox.io/game-localization/playstation-localization/)
- [Console compliance QA testing (Ixie Gaming)](https://www.ixiegaming.com/blog/console-compliance-testing/)
- [Sentry crash reporting](https://sentry.io/for/game-development/)
- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/)
- [European Accessibility Act overview](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en)
