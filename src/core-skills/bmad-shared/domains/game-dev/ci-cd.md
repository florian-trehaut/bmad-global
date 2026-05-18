# Domain Sub-File: CI/CD (Game Dev)

Continuous Integration / Continuous Deployment patterns specific to game development. Game CI is unusual: builds are long (30 min - 4 h), cooking pipelines produce gigabytes of binary artefacts, target platforms include locked-down consoles, and distribution channels each impose certification and submission constraints. This file covers WHICH-PLATFORM, HOW-TO-AUTOMATE-DEPLOY, and HOW-TO-GATE-QUALITY. Engine choice considerations live in `engines.md`; observability / crash-reporting in `observability.md`; live-ops patching in `live-ops.md`.

## CI Platform Choices

### Unity Build Automation (formerly Cloud Build)

Unity's first-party managed CI service, rebranded as part of Unity DevOps. Pricing changed 2026-03-01 to a fully-metered model.

- **Free tier** (per organisation, monthly): 200 build minutes on Windows Micro runners, 100 minutes Mac Standard, 100 minutes Linux Micro. 25 GB storage free. 100 GB egress free.
- **Paid usage**: Standard Storage $0.14 GB/month after the free tier. Build minute metering varies by runner class (Micro / Standard / Power) and platform; verify the live pricing page.
- **Strengths**: Native Unity-version management, license activation handled, Unity-aware caching of the Library folder.
- **Trade-off**: Locked into Unity ecosystem; not useful for non-Unity workflows.
- **Removed friction (2026)**: No longer billed for adding members to a DevOps project.

### GitHub Actions

Universal, integrates with GitHub-hosted projects. The de facto default for indie / mid-tier game CI in 2026.

- **GameCI** (open-source, MIT, community-maintained since 2020) bridges GitHub Actions to Unity: `game-ci/unity-builder` (build Unity projects), `game-ci/unity-test-runner` (run EditMode + PlayMode tests), `game-ci/unity-activate` (license activation), `game-ci/steam-deploy` (push to Steam branches). Personal Unity licenses supported — does not require Pro/Plus tier (unlike Unity Cloud Build).
- **Hosted runners** are cheap for Linux but expensive for macOS (5× minute multiplier). For Mac-heavy iOS / macOS builds, self-hosted Mac runners reduce cost.
- **Trade-off**: Self-hosted Windows/Mac runners for Unity Editor builds require Unity Pro licenses or Personal license tied to a specific machine.

### GitLab CI

On-premise-capable, generous free tier on GitLab.com. Pipeline-as-YAML, runner self-hosting straightforward. Used by studios that need to keep source code inside their network (publisher requirements, console SDK NDA constraints).

### Buildkite

Per-build pricing, self-hosted agents on your own hardware. Popular in mid-to-large studios because the model scales economically: pay for orchestration, run heavy build workloads on owned hardware.

- **Personal tier** (free): 1 user, 3 concurrent jobs, 500 hosted minutes/month.
- **Pro tier**: $30/user/month. Unlimited self-hosted agents, unlimited users, 2 000 hosted minutes. Hosted Linux runners $0.013-$0.052/min, hosted Mac M4 runners $0.18-$0.36/min.
- **Strengths**: Mature parallelisation, retry / artefact / pipeline DSL, security model designed for sensitive workloads (console SDKs, signing keys).

### TeamCity (JetBrains)

Enterprise-oriented, self-hosted or cloud. Strong build chain visualisation and parameterised template support. Heavyweight to operate.

- **TeamCity Cloud**: $45/user/month.
- **Professional On-Premise**: free with limited concurrency.
- **Enterprise On-Premise**: $2 399/year base + $359/year per additional build agent.

### Jenkins

Open-source, mature, infinite plugin ecosystem. Used by AAA studios as the build-orchestration substrate with custom Groovy pipelines. High operational cost (plugin churn, security patching, scaling).

### Codemagic

Mobile-focused (iOS / Android / Flutter / React Native), now positions itself for Unity mobile builds. Strong code-signing UX (Apple certificate management, Google Play Service Account JSON).

- **Free tier**: 500 build minutes/month, 120-minute timeout per build.
- **Pay-as-you-go**: $0.10/minute Mac VM after the free tier.
- **Team plan**: from $3 990/year — 3 concurrencies, unlimited minutes and users.

### Recommendations by Studio Profile

| Profile | CI choice |
|---|---|
| Solo / indie, Unity, hobby | GitHub Actions + GameCI free tier |
| Indie shipping cross-platform | GitHub Actions + GameCI + self-hosted Mac runner for iOS |
| Mid-tier mobile-first | Codemagic (mobile UX) OR GitHub Actions + Fastlane |
| Mid-tier console-shipping | Buildkite + self-hosted agents (NDA-safe) |
| AAA / publisher | Jenkins or TeamCity on owned infrastructure, plus parallel cloud runners for non-NDA builds |

## Build Farm Architecture

### Multi-Platform Requirements

A console-shipping game targets at minimum: Windows (x64), macOS (Universal Binary: Intel + Apple Silicon), Linux (x64), iOS (ARM64), Android (ARM64 + ARM32 for older devices), PlayStation 5 (custom AMD), Xbox Series X|S (custom AMD), Nintendo Switch (ARM, Tegra X1), Nintendo Switch 2 (ARM, Tegra T239). Optionally: WebGL, tvOS, Apple Vision Pro.

Each platform implies:

- A runner of the matching host OS (you cannot build iOS on a non-Mac host without violating Apple's licence).
- A platform SDK installed at a vetted version (PS5 SDK, Xbox GDK, Nintendo NDI, Apple Xcode, Android NDK).
- Platform code-signing material (Apple provisioning profile + certificate, Android keystore, Windows Authenticode certificate, console submission keys).
- A licensing channel: Unity license per editor, Unreal source build per platform, console SDK NDA-gated downloads.

### License Servers

- **Unity License Server** (formerly Unity Floating License Server). Centralised license pool for build farm agents. Required if your CI runs multiple Unity Editor builds in parallel; otherwise you race for activations and hit the activation limit.
- **Unreal Engine source distribution**. UE is source-available; building from source on the farm avoids the launcher dependency. Console-platform-specific builds require GitHub access linked to the console developer account (Sony / Microsoft / Nintendo each have a separate authorisation channel).

### GPU Runners

Shader compilation and lighting baking are GPU-accelerated workloads. A typical configuration uses NVIDIA T4 / L4 / A10 instances on cloud or owned RTX hardware on-premise. Shader pre-warming and Light Baking can take **30 minutes to 4 hours** for a large AAA scene; running on a GPU runner cuts wall-clock time significantly versus a CPU-only host.

### Storage and CDN

Build artefacts are large: a typical AAA build is 80-150 GB across platforms; per-commit artefacts in a 100-engineer team rapidly produce terabytes. Architecture choices:

- **Hot tier** (S3 standard / equivalent) for the last 7-14 days of builds — engineers download daily.
- **Warm tier** (S3 IA / Glacier Instant Retrieval) for the last 90 days — QA bug reproduction.
- **Cold tier** (Glacier Deep / equivalent) for historical builds, retention 1-7 years per audit / regulatory requirements.
- **CDN distribution** (CloudFront, Cloudflare, Fastly) for QA download throughput across distributed teams.

### Parallel Build Concurrency

Per-platform runner pools. Typical sizing:

- Indie: 1 runner per platform.
- Mid-tier: 2-5 runners per platform.
- AAA: 20-50 simultaneous runners across platforms; matrix builds on PR merge.

## Content Cooking Pipelines

### Unity "Build Player"

The Unity Player build process: code compilation (C# → IL2CPP for AOT platforms), asset processing (texture compression, mesh optimisation, shader variant generation), scene cook, AssetBundle (or Addressables group) packaging.

Critical CI tip (per official Unity guidance, 2026): **cache the `Library/` folder** between builds. Library contains the imported-asset representation; rebuilding it from scratch on every CI run multiplies build time by 3-10×. Cache keying should incorporate the Unity version and the assets-folder hash.

Shader variant prefiltering can reduce warm build times by **up to 90%** in the most aggressive cases. Configure variant-stripping in the URP Config Package or via custom build callbacks. <!-- TODO verify: 90% figure is the Unity team's documented best-case from a 2024 forum thread; real projects see 30-60% more typically. -->

### Unreal "Cook"

Unreal cook produces platform-specific asset packages. Cook commands are platform-suffixed: `RunUAT BuildCookRun -platform=IOS`, `-platform=PS5`, `-platform=XSX`. Iterative cook (`-iterate`) reuses the prior cook output for unchanged assets — essential for CI cadence.

For mobile, Unreal additionally distinguishes iPhone vs iPad targets (cook-target metadata) so device-specific optimisation hooks fire.

### Shader Compilation

Platform-specific shader formats:

- **PC**: DXIL (Direct3D 12), SPIR-V (Vulkan), MSL (Metal for macOS).
- **Console**: vendor-specific compiled formats, distributed via console SDK.
- **Mobile iOS**: MSL.
- **Mobile Android**: SPIR-V or GLSL ES depending on device tier.

Total shader compilation time depends on shader-variant count (number of `#pragma multi_compile` permutations × keyword combinations). Unity Manual: "Optimizing shader variants" provides the canonical variant-reduction guidance; the Caching Shader Preprocessor (Unity 2021 LTS+) caches pre-processed include files for incremental recompiles.

### Texture / Mesh Compression

Target platform dictates format:

- **iOS / modern Android** (ARM64): ASTC (Adaptive Scalable Texture Compression) — block-size 4×4 to 12×12, fine-grained quality/size trade-off.
- **PC**: BC7 (high-quality) / BC1-BC5 (legacy) / DXT (legacy).
- **Console**: BC7 + platform-specific extensions (e.g., PS5 supports additional formats via the platform SDK).

Mesh compression: Unity's Mesh Compression Quality (Low / Medium / High); Unreal's per-LOD reduction settings. Both pipelines benefit from offline tooling (Simplygon, InstaLOD) for AAA workflows.

### Streaming Bundle Construction

Unity Addressables groups and Unreal `.pak` files are built per CI run. Build determinism matters: identical input + version should produce byte-identical output, or differential patches blow up in size. Validate determinism by hashing two CI runs of the same commit.

## Automated Testing in CI

### Test Pyramid for Games

| Level | Cadence | Scope |
|---|---|---|
| **Unit tests** | Every commit, blocking merge | Logic units (combat math, inventory rules, savegame serialisation) |
| **Integration tests** | Every commit OR nightly | Subsystem composition (UI flow, scene transitions, AssetBundle load) |
| **Smoke tests (boot test)** | Every PR | Game launches, main menu loads, save/load works |
| **Performance regression** | Nightly OR weekly | Frame-time per scene, memory peak, load time — compare against baseline |
| **Playthrough automation** | Weekly OR per-release | Scripted player or AI agent completes first hour |
| **Visual regression** | Per-release OR on graphics-touching PRs | Per-frame screenshot diff (RenderDoc captures, custom comparators) |

### Unity Test Framework

EditMode tests (Editor process, no scene) and PlayMode tests (in-scene, MonoBehaviour-driven). Both run from CLI via `Unity.exe -batchmode -runTests`. GameCI's `unity-test-runner` action wraps the CLI for GitHub Actions.

### Unreal Automation System

`Automation` and `Functional Test` frameworks. Tests run from the Unreal command-line via `UnrealEditor-Cmd.exe -ExecCmds="Automation RunTests <suite>"`. Output as XML; can be parsed into the CI's JUnit-format reporter.

### Performance Baselines

Per-scene frame-time histograms captured on a reference device. Regression detection rule: a PR is blocked if **average frame-time on the reference scene exceeds the baseline by more than X%** (typical thresholds: 5% for critical scenes, 10% for less-frequently-played scenes). Tooling: Unity Performance Testing Extension, Unreal Insights with custom comparators.

## Store Deployment Automation

### Steam

- **steamcmd** (Valve official CLI). Builds upload via Content Builder configuration (`app_build.vdf` + `depot_build.vdf` per platform).
- **Beta branches** (e.g., `internal_qa`, `staging`, `public_beta`) for staged rollout — push a build to the QA branch, validate, promote to default branch.
- **Automation tooling**: `game-ci/steam-deploy` GitHub Action, `cm2network/steampipe` Docker image (replicates a minimal Steamworks SDK + steamcmd installation, suitable for CI).
- **Authentication**: SteamGuard sentry file generated on first login; subsequent CI logins reuse the sentry without prompting. Encrypt + store the sentry as a CI secret.

### Epic Games Store

- **BuildPatchTool** (Epic's CLI). Wraps the EGS upload protocol; produces and uploads chunk-deduplicated builds.
- Less mature CI tooling than Steam; most automation is hand-rolled shell wrappers around BuildPatchTool.

### GOG (Galaxy SDK)

- **GOG Galaxy SDK** + GOGcom DevPortal. Auto-upload via the SDK; staged-rollout less granular than Steam.

### Apple App Store Connect (iOS / iPadOS / macOS / tvOS / Vision Pro)

- **Fastlane** (`deliver` lane, `pilot` for TestFlight). Industry-standard for iOS CI; handles provisioning profiles, certificates, IPA upload, App Store metadata.
- **App Store Connect API** (modern alternative to fastlane for some flows). Native programmatic upload via JWT-authenticated REST endpoints.
- **TestFlight** for beta testing — invitations, build expiration (90 days), feedback channel integration.

### Google Play (Android)

- **Fastlane** (`supply` lane). Handles APK / AAB upload, listing metadata, screenshot upload.
- **Google Play Developer API**. Internal Testing track, Closed Testing, Open Testing, Production rollout (staged percentage rollout). Service Account JSON authentication.

### PlayStation Partner Network (PS5, PS4)

- **SubmissionTool** (Sony's official CLI). Semi-automated — package generation is CLI, submission to certification is partially web-based. NDA-gated SDK and tooling.
- Most studios automate the package generation phase and manage submission manually.

### Xbox Partner Center (Xbox Series X|S, Xbox One, PC Game Pass)

- **GDK (Game Development Kit)** CLI tools. `MakePkg` for packages, ingestion via Partner Center.
- Game Pass deployment is a separate channel; coordination with Microsoft business team required.

### Nintendo Developer Portal (Switch, Switch 2)

- Manual upload via the developer portal as of 2026. Automation tooling community-built rather than first-party.
- **Lotcheck** (Nintendo's certification process) is workflow-heavy; expect 30+ days from submission to release window.

### itch.io

- **butler** (itch.io's official CLI, MIT-licensed, Windows/macOS/Linux). The indie favourite — `butler push <dir> <user>/<game>:<channel>` uploads with incremental patching. A 300 MB build typically transmits ~120 MB over the network thanks to butler's diff transport.
- GitHub Actions integration: `dulvui/itchio-butler-upload` and the `manleydev/butler-publish-itchio-action`.

## Versioning Strategy

### Semantic Versioning (SemVer)

`MAJOR.MINOR.PATCH` (1.2.3). Conventional in software; works for games until "Season X.Y" or "Patch X.Y" content models override it.

### Game-Specific Schemes

- **Season-based** (live-service games): `Season 4.2` where Season is a content drop and `.2` is a within-season balance patch.
- **Hotfix appendix**: `1.2.3-hotfix-2025-11-05` for emergency patches between MINOR releases.

### Build Number

A monotonic integer auto-incremented per CI run, used for crash report correlation and store-side build identification (e.g., `CFBundleVersion` on iOS must monotonically increase between TestFlight uploads).

### Release Channels

- `alpha` — internal team only.
- `beta` — external beta testers (TestFlight, Steam beta branch, Google Play Closed Testing).
- `rc` (release candidate) — content-locked, certification-bound builds.
- `public` — shipped to all players.

### Branching

Common pattern combining trunk-based + release branches:

- `main` — current development trunk.
- `develop` (optional, GitFlow heritage) — pre-merge staging.
- `release/X.Y` — version-stabilisation branch, only bug fixes accepted.
- `hotfix/X.Y.Z` — branched from the live release tag, fast-tracked back to `main` and the affected release branch.

Trunk-based development is increasingly preferred (fewer long-lived branches) for live-service titles with continuous delivery cadence.

## Hot-Patching Live Games

### What Can Be Patched Without Store Resubmission

- **Server-side config** (feature flags, balance numbers, event schedules). Modify via remote config service (Firebase Remote Config, Unity Remote Config, LaunchDarkly, custom service). No client update required.
- **Remote AssetBundles / Addressables** (Unity). Per Unity's official content-update workflow: enable Build Remote Catalog, host on CDN, Addressables checks for updated catalog at runtime, downloads delta bundles. Provides hot-patching for assets (textures, audio, UI, prefabs, scenes-as-data) without binary rebuild.
- **Remote `.pak` files** (Unreal). Equivalent: chunk content into pak files, host remotely, mount at runtime. More involved than Unity Addressables — typically a custom solution per studio.

### What Cannot Be Hot-Patched

- **Native code changes** require store resubmission on iOS, Android, and consoles.
- **C# script changes** in Unity require a binary rebuild for AOT platforms (iOS, IL2CPP-on-Android). On Mono-Android, scripts can in principle be hot-loaded, but it violates Google Play policy for shipped games.
- **Engine version changes** always require resubmission.

### Patch Propagation Timelines

| Platform | Propagation time |
|---|---|
| Steam | < 1 hour after publish |
| Epic Games Store | Hours |
| iOS | 24-72 hours (App Store review, expedited reviews available) |
| Android | Hours - 24 hours (Google Play review, depending on rollout type) |
| PS5 / Xbox / Switch | 1-7 days (certification process per platform) |

### Anti-Pattern: Hot-Patching Around Cert

Using remote-config flags to fundamentally change game behaviour after launch (e.g., enable a major mechanic the certification team did not test). Console-platform compliance teams treat this as TOS violation if discovered. Treat remote config as **tuning** (balance, feature on/off, schedule), not **ship-after-cert behaviour**.

## Regression Test Suite

### Smoke Test

The most basic gate — does the game start? Run on every PR build:

1. Launch executable.
2. Main menu renders within N seconds.
3. New Game starts, first scene loads.
4. Save → Quit → Load round-trip works.
5. Quit gracefully.

If smoke fails, the build is unshippable; merge is blocked.

### Critical-Path Tests

Scripted playthrough of the first 30-60 minutes of the game. Typical breakdown:

- Tutorial completion.
- First save point reached.
- First combat encounter survived.
- First scene transition / level change.

Automated via per-engine scripting (Unity Test Framework PlayMode tests, Unreal Functional Tests).

### Platform-Specific Tests

- **Controller hot-swap**: disconnect, reconnect — game continues without losing input mapping.
- **Network disconnect / reconnect**: game handles graceful loss of connectivity.
- **Suspend / resume**: console / mobile interrupt (incoming call, home button, system overlay) restores state.
- **Memory warning** (mobile): game responds to low-memory signal without crash.

These map directly to console certification requirements (TRC / TCR / Lotcheck).

### Save Migration Tests

Load saves from versions N-1, N-2, N-3 (and earlier per retention policy) and verify they migrate successfully to current schema. Block release if any supported-version save fails.

### Localisation Smoke

For every shipping language, verify the main menu renders without text overflow, missing glyphs, or untranslated string IDs. Automated via screenshot capture per language.

## Build Quality Gates

A merge / release is blocked if any of:

- **Tests pass: 100%** required. Flaky tests must be quarantined out of the gating set, not ignored — track flake rate as a separate metric.
- **Lint clean: 0 warnings** on policy-critical rules (security, undefined behaviour, banned APIs). Game-dev codebases tolerate cosmetic warnings more than web/SaaS, but treat security and correctness warnings as blockers.
- **Asset audit clean**: no missing references, no orphaned assets, no duplicate GUIDs (Unity), no missing redirector targets (Unreal).
- **Performance budget**: average frame-time on reference scenes within **5%** of baseline (or per-team threshold).
- **Memory budget**: peak heap / texture / streaming-pool usage within **10%** of baseline.
- **Build size budget**: total package size growth **≤ 5%** without explicit sign-off — drift discipline matters at scale.

## Distribution Channels

Commission and reach trade-offs as of 2026:

| Channel | Commission | Reach / Audience |
|---|---|---|
| **Steam** | 30% (drops to 25% after $10M lifetime gross, 20% after $50M) | The dominant PC platform; ~70% of indie PC revenue |
| **Epic Games Store** | 12% | Lower discoverability than Steam; periodic publisher incentives (free-game promotion, MegaGrant) |
| **GOG.com** | 30% (CD Projekt-owned) | DRM-free, niche but engaged audience |
| **itch.io** | Configurable, default 10% (developer sets the cut) | Indie-friendly, lowest friction to publish |
| **App Store (Apple)** | 15-30% (15% for indies via Small Business Program, < $1M annual revenue) | iOS / iPadOS / macOS / Vision Pro |
| **Google Play** | 15-30% (15% on first $1M annual, 30% above) | Android |
| **Console digital** (PS, Xbox, Switch) | 30% standard | Console reach; certification cost and time inherent |
| **Subscription services** | Negotiated (typically lump sum or revenue share) | Xbox Game Pass, PS Plus Premium, Apple Arcade, Netflix Games. Distribution + revenue model differ from direct sale |

Notes:

- Industry sentiment survey (PC Gamer, 2024): only 3% of developers polled felt the 30% Steam / GOG cut was fair, but Steam's reach typically dominates the alternative-platform calculus.
- Epic's 12% remains the largest commission disruptor; trade-off is significantly lower native discovery and a smaller user base.

## Compliance in CI

### License Scanning

Detect third-party code with incompatible licences before shipping. Tooling: SPDX-format license-detection scanners (FOSSA, SCANCODE, Black Duck). Block merges that introduce GPL-licensed code into a closed-source build, copyleft surprises, or unattributed third-party assets.

### Anti-Virus Scan

Pre-distribution Windows builds should be scanned with Defender + a secondary scanner (ClamAV, ESET) to catch false-positive triggers — game executables frequently flag heuristics (anti-cheat, DRM, packed binaries). Distributing a flagged build damages user trust irreversibly.

### Code Signing

- **Windows Authenticode**: EV (Extended Validation) certificate ($300-700/year) — required for SmartScreen reputation; OV (Organisation Validation) sufficient for small studios but accumulates trust slowly.
- **macOS notarisation**: required by Apple Gatekeeper since macOS 10.15; integrate Apple `notarytool` in CI.
- **iOS code signing**: Apple Developer ID + provisioning profile + certificate. Fastlane Match for shared certificate / profile distribution across team and CI.
- **Android signing**: Google Play App Signing (managed: Google holds the upload key, signs the released APK/AAB on Google's side). Sign-key rotation supported since 2021.
- **Console signing**: handled by platform SDK; keys are NDA-gated and machine-bound.

### GDPR / Privacy Compliance

For EU-distributed games:

- **Data export test**: run an automated integration test that exercises the GDPR data-export endpoint and validates schema completeness. Each per-player-data field declared in the privacy policy must be present in the export.
- **Right-to-erasure test**: exercise deletion flow, verify downstream backups and analytics platforms also purge.
- **Cookie / tracker disclosure**: client-SDK telemetry vendors (analytics, ads, attribution) must be enumerated in the privacy policy. Track per-CI-run which SDKs ship in the binary; alert on drift.

### Age / Content Rating

ESRB (US), PEGI (EU), USK (Germany), CERO (Japan), ACB (Australia) and others. Rating bodies require submission of game content (gameplay video, scenario script for narrative games, exhaustive content questionnaire). The compliance gate is partly automated (questionnaire) and partly manual; CI's role is to track which content rating each release is certified for and prevent shipping past expiration.

## Sources

- [Understanding New Unity DevOps Pricing (Mar 1, 2026)](https://support.unity.com/hc/en-us/articles/34748492914964-Understanding-New-Unity-DevOps-charges-starting-from-Mar-1-2026)
- [GameCI](https://game.ci/) and [game-ci/unity-builder GitHub Action](https://github.com/game-ci/unity-builder)
- [Buildkite Pricing](https://buildkite.com/pricing) and [Codemagic Pricing](https://codemagic.io/pricing/)
- [TeamCity Pricing](https://www.jetbrains.com/teamcity/buy/)
- [Fastlane — fastlane.tools](https://fastlane.tools/) and [Fastlane GitHub](https://github.com/fastlane/fastlane)
- [itch.io butler manual](https://itch.io/docs/butler/) and [butler GitHub](https://github.com/itchio/butler)
- [game-ci/steam-deploy GitHub Action](https://github.com/game-ci/steam-deploy) and [cm2network/steampipe Docker](https://github.com/CM2Walki/steampipe)
- [Unity Addressables Content Update Workflow](https://docs.unity3d.com/Packages/com.unity.addressables@1.21/manual/content-update-builds-overview.html)
- [Console Certification Process — N-iX Games](https://gamestudio.n-ix.com/console-certification-process-and-releasing-a-game-on-playstation-xbox-and-switch-what-you-should-know/) and [How to Port Your Indie Game to Consoles in 2026 — Gamedō](https://gamedo.live/news/how-to-port-indie-game-consoles-2026/)
- [Platform Fees in the Videogame Industry — 1d3.com](https://www.1d3.com/blog/platform-fees) and [Comparing Online Game Stores for Indie Game Developers — Getgud.io](https://www.getgud.io/blog/comparing-online-game-stores-for-indie-game-developers/)
- [How to Manage CI/CD for Game Development (Unity, Unreal, Large Binaries) — Semaphore](https://semaphore.io/how-to-manage-ci-cd-for-game-development-unity,-unreal,-large-binaries)
- [Unity Shader Compilation Manual](https://docs.unity3d.com/6000.3/Documentation/Manual/shader-compilation.html) and [Optimizing Shader Variants — Unity Blog](https://unity.com/blog/engine-platform/shader-variants-optimization-troubleshooting-tips)
