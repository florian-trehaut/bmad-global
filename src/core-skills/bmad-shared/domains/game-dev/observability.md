# Domain Sub-File: Observability (Game Dev)

Crash reporting, telemetry, performance instrumentation, and live-ops dashboards for shipped games. This file covers the WHAT-TO-COLLECT and WHICH-VENDOR baseline. Genre-specific KPIs are in `kpis-metrics.md`; back-end infra cost considerations are in `multiplayer-architecture.md`.

## Crash Reporting Vendors

The major SaaS crash reporting choices in 2026. Selection criteria: engine integration depth, console support, symbol upload pipeline, retention period, free tier coverage.

### Sentry

- **Coverage.** Multi-engine (Unity, Unreal, Godot, custom), multi-platform (Windows / macOS / Linux / iOS / Android / WebGL), console GA since September 2025 (Xbox, PlayStation 5, Nintendo Switch 1+2 — PS4 in progress).
- **Capabilities.** Readable stack traces, breadcrumbs of events leading to a crash, built-in symbol server (upload debug files directly to Sentry), tags + device context (console model, build number, region, device state), release tracking with regression detection, source maps for JS, minidump symbolication, performance monitoring.
- **Game-specific docs.** Dedicated `sentry.io/solutions/game-developers`. Engine-specific docs at `docs.sentry.io/platforms/{unity,unreal,godot}/`.
- **Free tier.** 5k errors/month + 10k performance units/month for individual developer. Team / Business / Enterprise tiers scale to billions of events.
- **Best for.** Studios shipping cross-platform, especially with console builds. AAA console GA gives Sentry an edge over alternatives lacking console-cert SDKs.

### Backtrace (Sauce Labs)

- **Coverage.** Cross-platform crash + exception reporting (Windows / macOS / Linux / iOS / Android / Xbox / PlayStation / Nintendo Switch / Stadia legacy). Native C/C++/C#, deep Unity Verified Solutions Partner integration, deep Unreal Engine integration.
- **Capabilities.** Per-crash full memory snapshot (variable values at crash time), attachment of save files / logs / screenshots to crash reports, deduplication with crash fingerprinting, symbolication for native and managed code, retention policies, querying via SQL-like language.
- **Engine integration.** Documented at `backtrace.io/unity` and `backtrace.io/unreal`. Now distributed via Sauce Labs platform (post-acquisition); deep Unity integration via Unity Verified Solutions program.
- **Best for.** AAA console game teams that need rich crash detail (memory snapshots, asset attachments, replayable repro state) — superior to lighter-weight crash reporters when full debugger-equivalent context matters.

### Crashlytics (Firebase)

- **Coverage.** Apple (iOS/macOS), Android, Flutter, Unity. Limited desktop (Windows/Mac/Linux dedicated), no console (Xbox/PlayStation/Switch).
- **Capabilities.** Fatal crashes, non-fatal errors, Android ANR (Application Not Responding) detection. Web console (Firebase) and IDE integration (Android Studio App Quality Insights). Crash grouping with regression detection.
- **Pricing.** Free as part of Firebase (Spark plan).
- **Best for.** Indie / mid-tier mobile-first studios. Free, deep Android/iOS integration, but weak desktop/console — leaves AAA console-ship developers stranded.

### Unity Cloud Diagnostics

- **Coverage.** Unity engine native, multi-platform via Unity build targets.
- **Capabilities.** In-engine crash reporting, basic stack traces, build symbol storage. Native integration with Unity Dashboard.
- **Pricing.** Free tier on Unity Personal / Plus / Pro.
- **Best for.** Unity-only indie/MVP teams who want zero integration friction. Limited compared to Sentry/Backtrace for serious post-launch ops.

### Bugsnag (SmartBear)

- **Coverage.** iOS, Android, Unity, Unreal Engine, Electron, web; growing console support.
- **Capabilities.** Crash detection with breadcrumbs, releases tracking, error grouping, severity classification, integrations with Slack/PagerDuty/Jira.
- **Best for.** Mobile-leaning studios with mixed web/desktop product lines that want a single reporter across both.

### Honeycomb (observability for live-ops infra)

- **Coverage.** Not a client crash reporter. Server-side / infra observability with structured events.
- **Capabilities.** High-cardinality event analysis, OpenTelemetry-native ingestion, distributed tracing for matchmaking + match server + DB / cache, BubbleUp anomaly detection.
- **Best for.** Live-service game backend teams (matchmaking, master server, leaderboards, inventory service) needing the kind of observability used by SaaS / web teams — Honeycomb is widely used by Riot for Valorant infra and similar studios.

### Recommendations by Studio Profile

| Profile | Crash reporter combo |
|---|---|
| Indie mobile (Unity, no console) | Crashlytics (free) OR Unity Cloud Diagnostics |
| Indie cross-platform PC + mobile | Sentry (developer tier) — best free tier, broad coverage |
| Mid-tier (Unity / Unreal, PC + mobile, optional console) | Sentry team + Honeycomb (if live service) |
| AAA console shipping (Xbox / PS5 / Switch) | Sentry team/business + Backtrace OR Backtrace + Honeycomb |
| Live-service multiplayer at scale | Sentry (client crashes) + Honeycomb (backend tracing) + custom Datadog / Grafana for infra metrics |

## Telemetry & Analytics Vendors

Behavioral analytics, funnel analysis, monetisation insight, retention measurement. Selection criteria: free tier generosity, game-dev funnel pre-templates, cohort/segmentation depth, real-time vs batch.

### GameAnalytics

- **Free tier.** Generous — unlimited events forever on basic version (no event volume cap).
- **Engine support.** Unity, Unreal, custom SDKs (C++, C#, JS, Lua).
- **Pre-baked funnel templates.** Onboarding (FTUE) funnel, Level Progression funnel, Purchase Conversion funnel. Two funnel types: Standard Funnels (Design + Resource + Progression events) and Progression Funnels (Progression events with additional result metrics).
- **Dashboards.** Pre-configured DAU/MAU, retention curve, ARPDAU, conversion, monetisation, level analytics.
- **Best for.** Mobile / indie / mid-tier game teams starting analytics with minimal setup. Generous free tier makes it a default starter pick.

### Amplitude

- **Coverage.** Behavioral analytics platform (not game-specific), strong for product / mobile / web.
- **Capabilities.** AI-powered behavioural insights, funnel diffing across cohorts, retention curve with cohort segmentation, A/B-test integration (Amplitude Experiment).
- **Strengths for games.** Funnel diffing post-launch (which feature flag improved D7 retention?), structured analytics governance with planning + repeatable analysis for larger orgs.
- **Best for.** Mid-tier and AAA live-service teams that need behavioural-product-analytics depth across multiple games / SKUs in a unified org.

### Mixpanel

- **Coverage.** Event-based behavioural analytics, generalist platform.
- **Capabilities.** Custom event tracking, real-time analytics, segmentation by event properties, retention cohort analysis, funnels, JQL-like queries (Mixpanel JQL legacy), no-code reports.
- **Strengths for games.** Fast time-to-insight with straightforward event + properties tracking; strong for retention and segmentation; suitable for live-operations monitoring.
- **Best for.** Teams switching from product-analytics culture into game projects; teams prioritising real-time ops view over deep planning governance.

### Datadog (gaming)

- **Coverage.** Generalist infra observability platform with custom event ingestion + traces + logs + metrics + RUM.
- **Capabilities for games.** Custom event ingestion paired with infra metrics, unified dashboards for client + server, distributed tracing, real-user monitoring (RUM) for HTML5/WebGL games, dashboards composable with engineering's existing Datadog ops view.
- **Pricing.** Expensive at scale (per-host + per-event + per-ingested-GB billing).
- **Best for.** Live-service teams with existing Datadog spend who want one platform for backend infra + game telemetry, accepting the cost.

### Unity Analytics

- **Coverage.** Unity engine native; auto-instrumented core events (session start, level start, transaction).
- **Capabilities.** Funnel report, retention, transaction events, custom events, screen flow analysis, real-time monitoring.
- **Pricing.** Free with Unity (Personal / Plus / Pro).
- **Best for.** Unity-only MVP shipping fast. Limited compared to Amplitude/Mixpanel for behavioural deep-dive once player base is >100k DAU.

### PlayFab (Microsoft)

- **Coverage.** Full LiveOps platform: identity, inventory, leaderboards, matchmaking, analytics + experimentation.
- **Capabilities.** Player data analytics, segment-based delivery, A/B testing, real-time scaling on Azure, GDPR-compliant ExportMasterPlayerData / DeleteMasterPlayerData APIs.
- **Pricing.** Free tier (10k DAU); per-MAU pricing thereafter.
- **Best for.** Multiplayer / live-service games where player data + matchmaking + economy + analytics need unified backend. AAA productions integrate well with Azure infra.

### Nakama (Heroic Labs)

- **Open source** game backend (since 2015): multiplayer, matchmaking, leaderboards, chat, social features, in-game currencies. Server scripts in Go, TypeScript, or Lua.
- **Satori Live Operations.** Heroic Labs' analytics + experimentation companion service (separate paid product on top of open-source Nakama).
- **Customers.** Paradox, Zynga, Gram Games.
- **Best for.** Teams that need on-premise / self-hosted backend control without per-MAU pricing. Open source + scalable + game-engine-agnostic.

## Required Custom Events (Industry Baseline)

Minimum event schema for ANY game wanting to measure tutorial-funnel, session, monetisation, multiplayer, virality. Every event below should include: `event_name`, `timestamp`, `user_id` (pseudonymised), `session_id`, `app_version`, `platform`, `region`, plus event-specific properties.

| Event | When | Required properties |
|---|---|---|
| `tutorial_started` | First tutorial step shown | `tutorial_id`, `tutorial_version` |
| `tutorial_step_complete` | Each tutorial step finished | `tutorial_id`, `step_index`, `time_on_step_ms` |
| `tutorial_completed` | All steps done | `tutorial_id`, `total_time_ms` |
| `tutorial_skipped` | User declined / skipped tutorial | `tutorial_id`, `step_at_skip` |
| `first_session_end` | First-ever session terminates (window closed, app backgrounded > N seconds) | `session_duration_ms`, `last_screen` |
| `session_end` | Any session ends | `session_duration_ms`, `last_screen` |
| `level_started` | Level/match attempt begins | `level_id`, `difficulty`, `attempt_number` |
| `level_complete` | Level/match success | `level_id`, `duration_ms`, `score`, `attempts` |
| `level_failed` | Level/match failure | `level_id`, `fail_reason`, `time_to_fail_ms`, `attempts` |
| `purchase_initiated` | Player taps "buy" in store | `sku`, `price_local`, `currency_code`, `store_screen` |
| `purchase_completed` | Server confirms receipt | `sku`, `price_usd`, `transaction_id`, `is_first_purchase` |
| `purchase_failed` | Platform/server rejects purchase | `sku`, `fail_reason`, `fail_stage` |
| `crash_recovered` | Game survives a crash via auto-resume | `crash_signature`, `recovery_path` |
| `save_corrupted` | Save file fails integrity check | `save_slot`, `corruption_type` |
| `share_invoked` | Player uses social share | `share_target`, `share_content_type` |
| `multiplayer_match_started` | Matchmaking returns a match | `match_id`, `mode`, `region`, `queue_time_ms` |
| `match_completed` | Match ends naturally | `match_id`, `duration_ms`, `result`, `mvp_status` |
| `match_disconnected` | Player drops out mid-match | `match_id`, `disconnect_reason`, `time_in_match_ms` |

Critical convention: `purchase_completed` MUST be sent ONLY after server-side receipt confirmation, never on client signal alone — see `security-baseline.md` for IAP receipt validation rules.

## Performance Instrumentation

Client-side performance telemetry needed to detect frame-rate regressions, network problems, and memory issues at scale.

- **FPS samples every N seconds.** Sample at 1 Hz (or 5 Hz on QA/dev builds). Aggregate to p50, p95, p99 per session. Alert if p95 < 60 FPS sustained (or < 30 FPS for mobile budget) on any region/device/SKU.
- **Frame-time histogram.** Capture frame-time distribution on dev/QA builds. Bimodal distribution (cluster at 16.7 ms + cluster at 33.3 ms) usually indicates GPU/CPU scheduling stalls.
- **GC allocation rate.** In managed-memory engines (Unity C#, Unreal Blueprint), per-frame allocation rate correlates with frame-hitches. Alert if any frame allocates > 1 MB managed memory.
- **Network RTT histogram.** For multiplayer titles, capture per-tick RTT to authoritative server. Histogram p50/p95/p99. Alert on packet loss > 1% sustained or RTT p95 > regional latency budget (see `multiplayer-architecture.md` for budgets per genre).
- **Memory ceiling.** Capture peak working set per session. Track regressions release-over-release.
- **Battery / thermal (mobile).** iOS `UIDevice.batteryLevel` + thermal state, Android `BatteryManager` + thermal state. Alert on builds that drain > N%/hour or trigger thermal throttling within 10 minutes of intense gameplay.

## Live Ops Dashboards

Industry-standard dashboards expected of any live-service game team:

- **DAU / MAU / ARPU.** Plotted on time series with per-region, per-platform, per-acquisition-channel facets. Tools: Looker, Tableau, Grafana, Mode, Metabase.
- **DAU/MAU ratio (stickiness).** > 20% = sticky game; > 50% = highly engaged base.
- **ARPU / ARPPU / ARPDAU.** All three required. ARPU (revenue / active users), ARPPU (revenue / paying users), ARPDAU (revenue / daily active users).
- **Battle pass engagement curves.** Per-tier completion rate over time; identifies when most players plateau.
- **Seasonal event drop-off.** Daily active rate during an event vs baseline; identifies events that didn't land.
- **A/B testing infrastructure.** Industry-standard: Amplitude Experiment, Statsig, Optimizely, LaunchDarkly. Each supports server-side feature flags + variant exposure logging + automatic significance tests. Mandatory for any meaningful balance change post-launch.

## Crash Symbolication Pipeline

Every native-code (C/C++/managed C# IL2CPP, Unreal native) crash report arrives as raw addresses; the team needs symbols to translate them back to function names + file:line:

- **Symbol upload.** CI pipeline uploads symbols immediately after build completion. Tools: Sentry CLI (`sentry-cli upload-dif`), Bugsnag CLI, Backtrace `coresnatch`, Crashlytics Fastlane plugin.
- **Build artifact storage.** Retain symbols per release for 6+ months (minimum). AAA console builds: retain forever or until next major SKU.
- **Symbol formats by platform.**
  - Windows: PDB (Microsoft program database)
  - macOS / iOS / tvOS: dSYM (DWARF + symbols, separate from binary)
  - Linux: DWARF debug info, either inline or in a separate `.debug` file
  - Android NDK: split-debug ELF
  - Switch / Xbox / PlayStation: platform-specific (NRO + SDK-specific symbol bundles)
- **DWARF symbol stripping.** Release builds ship with symbols stripped; symbols archived separately and uploaded to crash backend.

## Cohort Tracking

Cohort = a group of players sharing an entry condition (install date, first-purchase event, first-multiplayer-match, acquisition campaign). Tracking retention by cohort is the industry KPI standard (see `kpis-metrics.md` for the benchmarks).

- **D1 / D7 / D30 retention.** Percentage of players returning N days after install. Industry benchmarks: D1 puzzle/casual 40%+, mid-core 35%+, hardcore/RPG 30%+; D7 typically half of D1; D30 puzzle 5.35%, match 7.15%, RPG 3.48%, strategy 2-4% (Liftoff / data.ai mobile benchmarks 2024-2025).
- **D30 ≈ D365.** Per Solsten and industry consensus: D30 retention is a strong predictor of long-term game health.
- **Churn analysis.** Per-level, per-session-N, per-day cohort drop-off curves. Identifies the precise step at which the funnel leaks (level design issue, monetisation friction, technical regression).
- **Acquisition channel attribution.** Track install source: Facebook Ads, TikTok Ads, Google Ads, App Store / Play Store organic, store featured, cross-promo, partnership. ARPU + retention + LTV computed PER channel — informs marketing spend reallocation.
- **MMR / Elo / Glicko / TrueSkill segmentation.** For competitive games, retention often tracked by skill band — high-MMR vs low-MMR players churn for different reasons.

## Sources

- [Sentry game console GA announcement (September 2025)](https://sentry.io/about/press-releases/sentry-announces-error-monitoring-for-gaming-consoles/)
- [Sentry game developers solutions](https://sentry.io/solutions/game-developers/)
- [Sentry Game Consoles docs (Unity)](https://docs.sentry.io/platforms/unity/game-consoles/)
- [Backtrace Unity integration (Unity Verified Solutions Partner)](https://backtrace.io/unity)
- [Backtrace Unreal Engine integration](https://backtrace.io/unreal)
- [Firebase Crashlytics official documentation](https://firebase.google.com/docs/crashlytics)
- [GameAnalytics Funnels documentation](https://docs.gameanalytics.com/products-and-features/analytics-iq/funnels/)
- [GameAnalytics blog "A Deep Dive into Funnel Reporting for Games"](https://www.gameanalytics.com/blog/exploring-gaming-funnels)
- [Mixpanel vs Amplitude comparison 2026](https://prettyinsights.com/mixpanel-vs-amplitude-complete-guide-and-comparison/)
- [PlayFab LiveOps platform overview](https://playfab.com/liveops/)
- [PlayFab data and analytics docs](https://learn.microsoft.com/en-us/gaming/playfab/data-analytics/)
- [Nakama (Heroic Labs) open source game backend](https://heroiclabs.com/nakama/)
- [Heroic Labs GitHub (Nakama)](https://github.com/heroiclabs/nakama)
- [Honeycomb observability platform](https://www.honeycomb.io/)
- [Mobile game KPI benchmarks 2026 — Game Growth Advisor](https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-kpis-benchmarks-2026/)
- [D1/D7/D30 retention drivers — Solsten research](https://solsten.io/blog/d1-d7-d30-retention-in-gaming)
- [Unity Cloud Diagnostics overview](https://docs.unity.com/ugs/manual/cloud-diagnostics/manual/welcome)
- [Bugsnag (SmartBear) platform docs](https://docs.bugsnag.com/)
