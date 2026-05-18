# Domain Sub-File: KPIs & Metrics

**Parent:** `domains/game-dev.md`
**Scope:** Industry-standard game KPIs by category — retention, engagement, monetisation, acquisition, quality, performance, live-ops-specific, anti-KPIs, and tier benchmarks (indie / AA / AAA). Benchmarks sourced from GameAnalytics 2024-2025 reports, public industry data, and platform-published statistics. Verified May 2026.

Each metric below names the **canonical formula**, **industry benchmark band** (with tier breakdown where available), and **interpretation rule** ("what bad looks like, what good looks like").

---

## Retention KPIs

The single most important KPI cluster — retention determines whether a game has product-market fit before any monetisation matters.

### D1 retention

- **Definition**: % of new users active on day 1 after install (i.e., return for a second session).
- **Industry benchmarks 2024-2025** (GameAnalytics):
  - Top 25% of games: **26.48% to 27.69%** (slightly worse than 2023's 28-29%).
  - Bottom 25% of projects: **10-11.5%**.
  - iOS top 25%: **31-33%**.
  - Android top 25%: **25-27%**.
- **Tier-specific benchmarks**:
  - Casual mobile: 30-40%.
  - Mid-core mobile: ~25-30%.
  - F2P shooter: ~25%.
  - Premium console AAA: ~60%.
  - Indie premium PC: ~50%.
- **Interpretation**: **<20% = critical issue** (likely broken FTUE, tutorial, or hook). 25-30% = average. 40%+ = top-quartile.

### D7 retention

- **Definition**: % of users active 7 days post-install.
- **Industry benchmarks 2024-2025**:
  - Median D7 across all projects: **3.42% to 3.94%**.
  - Top 25%: **7-8%**.
  - Bottom 25%: barely **1.5%**.
- **Tier-specific benchmarks**:
  - Casual mobile: 7-10% (top 25%).
  - Mid-core mobile: ~10%.
  - F2P shooter: ~8%.
  - Indie premium PC: ~30%.
- **Interpretation**: **<5% = poor product-market fit**. D7 is the week-1 hook validation gate.

### D30 retention

- **Definition**: % of users active 30 days post-install.
- **Industry benchmarks 2024-2025**:
  - **75% of mobile projects have D28 retention below 3%**.
  - Top 25% D28: ~5%+.
- **Tier-specific benchmarks**:
  - Casual mobile: 3-5%.
  - F2P shooter: 2-3%.
  - AAA premium console: 15-20%.
- **Interpretation**: long-term hook test. Determines lifetime value ceiling for live-service titles.

### Cohort retention curves

- **Definition**: D1/D3/D7/D14/D30 retention plotted per acquisition cohort over time.
- **Use**: compare each new cohort vs prior cohorts. Improving cohort = live-ops working. Degrading cohort = recent change broke retention.
- **Standard view**: triangle chart (cohort week × retention day), with delta vs baseline highlighted.

---

## Engagement KPIs

### DAU (Daily Active Users)

- **Definition**: unique users active in a 24h window.
- **Industry context**: measured per game per platform. Total DAU across platforms aggregated separately.

### MAU (Monthly Active Users)

- **Definition**: unique users active in a rolling 30-day window.
- **Use**: denominator for stickiness ratio.

### DAU / MAU ratio ("stickiness")

- **Definition**: `DAU / MAU × 100%`.
- **Industry benchmarks**:
  - Standard benchmark: **10-25%**.
  - Successful apps: **20-30%** average.
  - Top games (Google Play): **31% median**.
  - Top performers: 40%+ excellent.
  - Weekly stickiness (DAU/WAU) for top Google Play free games: **55%**.
- **Interpretation**: stickiness measures how many of your monthly users return daily. 30%+ = strong engagement habit.

### Session length

- **Definition**: avg minutes per play session.
- **Industry benchmarks 2024-2025**:
  - Top 25% mobile: 8-9 minutes.
  - Median mobile: 5-6 minutes.
  - Median daily playtime across all mobile: **22 minutes**.
  - Top 2% of mobile projects: up to 4 hours daily playtime.
- **Tier-specific**:
  - Casual mobile: 5-10 min per session.
  - Mid-core mobile: 15-25 min.
  - F2P shooter: 30-45 min.
  - Console premium: 60-120 min.

### Sessions per day

- **Industry benchmarks**:
  - 1-3 sessions = normal mobile engagement.
  - 5+ sessions = very engaged (mobile pattern: open, play 5 min, close, repeat throughout day).
- **DAU return rate** (yesterday's DAU returning today): top Google Play games hit **77%**.

### Time-to-first-meaningful-action

- **Definition**: install → first level complete / first kill / first significant gameplay event.
- **Target**: **< 5 minutes** for mobile, **< 15 minutes** for console.
- **Use**: predictor of D1 retention. Below-target time-to-action correlates with higher retention.

---

## Monetisation KPIs

### Conversion rate

- **Definition**: % of players who make first IAP (free → paying).
- **Industry benchmarks**:
  - F2P mobile: **1-3% average**, **5%+ excellent**.
  - Console F2P: **5-10%**.
- **Interpretation**: below 1% = either game has weak monetisation hooks, or IAP offers feel poor value.

### LTV (Lifetime Value)

- **Definition**: avg revenue per acquired user over their lifetime in the game.
- **Industry benchmarks**:
  - Mobile F2P: **$1-5 typical**, **$10+ excellent**.
  - Console F2P shooter: **$30-100**.
  - Premium console AAA: $60-90 (purchase + DLC + cosmetic shop where applicable).
- **Use**: must exceed CPI by safe margin (typically 2-3x) for profitable acquisition.

### ARPDAU (Avg Revenue Per Daily Active User)

- **Definition**: `total daily revenue / DAU`.
- **Industry benchmarks 2024-2025**:
  - Ad-monetised casual / hyper-casual: **$0.05-$0.15**. Top: $0.20+.
  - IAP-driven mid-core / RPG: **$0.30-$1.00+**.
  - Hybrid (IAP + ads): often **$0.25+** across genres.
- **Use**: revenue-per-DAU metric, easy comparison across game sizes.

### ARPPU (Avg Revenue Per Paying User)

- **Definition**: `total revenue / paying users in period`.
- **Industry benchmarks**:
  - Top 5% spenders across all genres: ~**$66 daily ARPPU**.
  - Casual game top 5%: **$50-60 daily**.
  - Mid-core (strategy / sports / RPG) top 5%: **$50-60 daily**.
  - 2025 platform variation: iOS ARPPU rising (+40% in some cases), Google Play ARPPU declining (-41% in some).
- **Use**: spending depth among payers. Used for whale identification.

### Whale concentration

- **Industry benchmarks**:
  - **Top 1% of spenders drive ~50% of revenue**.
  - Top 5% drive **~70-80%** of revenue.
  - Top 1% lifetime spend: **$1000+/year** typical.
  - Whale typical transaction size: **~$20 per purchase** (frequency drives spend, not size).
- **Use**: identifies churn risk concentration. Single whale loss = measurable revenue dip.

### First-time-payer (FTP) conversion

- **Definition**: % of free users who make their first IAP in first 30 days.
- **Use**: leading indicator of LTV. Optimised via starter pack ($0.99-$4.99 with 5-10x value).

---

## Acquisition KPIs

### CPI (Cost Per Install)

- **Industry benchmarks** (paid acquisition channels):
  - Mobile casual: **$1-5 per install**.
  - Mid-core mobile: **$5-15**.
  - Premium / hardcore: **$20+**.
- **Variation**: tier-1 countries (US, UK, JP, DE, AU) 3-5x higher than tier-2/3 markets.
- **Channel mix**: Meta Ads, TikTok, Google Ads, AppLovin, Unity Ads, IronSource.

### K-factor (viral coefficient)

- **Definition**: `(invites sent per user) × (invite accept rate)`.
- **Interpretation**: K > 1 = exponential organic growth from existing users. K = 0.3 = 30% organic boost via referrals.
- **Industry reality**: K-factor >1 is extremely rare outside viral hits. K = 0.1-0.3 is typical for games with referral mechanics.

### NPS (Net Promoter Score)

- **Definition**: % Promoters (score 9-10) - % Detractors (score 0-6). Scale: -100 to +100.
- **Industry benchmarks 2025**:
  - **>0**: net recommends.
  - **>30**: good.
  - **>50**: excellent.
  - **>70**: world-class.
  - 2022 average: ~29.66 across all industries.
- **Use**: correlates with retention + organic growth.

### Acquisition channel attribution

- **Standard channels**:
  - Organic (App Store / Play Store search).
  - Paid social (Meta Ads, TikTok Ads).
  - Paid search (Google Ads, ASA Apple Search Ads).
  - Ad networks (AppLovin, Unity, IronSource).
  - Store featuring (Apple Featured, Google Editors' Choice).
  - Cross-promotion (from own portfolio or partner network).
- **Attribution tooling**: AppsFlyer, Adjust, Singular, Branch. SKAdNetwork (Apple) since iOS 14.5 limits raw attribution.

---

## Quality KPIs

### Crash-free sessions

- **Definition**: % of game sessions that don't crash.
- **Target**: **>99% on shipped builds**.
- **Tooling**: Sentry, Backtrace, Crashlytics, Bugsnag.
- **Interpretation**: 99.5%+ = healthy. 98% = noticeable. <97% = customer support flooded.

### Crash-free users

- **Definition**: % of unique users who never crashed in a window.
- **Target**: **>99.5%**.
- **Sensitivity**: more sensitive than crash-free sessions (one bad user crashes once = 1 affected user).

### Customer support contact rate

- **Definition**: % of players contacting support per month.
- **Target**: **<5%**.
- **Interpretation**: >5% indicates systemic issue (broken purchase, lost progress, bug pattern).

### Steam refund rate

- **Definition**: % of purchases refunded (Steam policy: 2h playtime + 14 day window).
- **Target**: **<5%**.
- **Interpretation**: >8% = pricing or quality mismatch. >15% = launch crisis.

---

## Performance KPIs (Player-Side)

### Avg FPS p95

- **Definition**: 95th-percentile frame rate (i.e., 95% of frames hit target).
- **Targets**:
  - Mobile casual / mid-core: 30 FPS p95 minimum, 60 p95 preferred.
  - Console: 60 FPS p95 minimum on target hardware for action genres.
  - PC: variable; "stable 60" or "stable 120" depending on positioning.
  - VR: **90 FPS p95 minimum** (Quest 3 / PCVR). Below 90 = motion sickness.

### Frame-time stability (jank index)

- **Definition**: consecutive frames within target frame-time budget. Spikes = jank.
- **Tooling**: Android GFXTrace, Unity Profiler, Unreal Insights, PIX on Xbox.
- **Interpretation**: 60 FPS avg with 30 FPS p95 = jank-heavy, feels worse than locked 45 FPS.

### Loading time

- **Definition**: client-measured time from action to playable state.
- **Targets**:
  - Cold launch: <10s mobile, <30s console.
  - Level load: <5s mobile, <15s console.
- **Tracked**: 50th / 90th / 99th percentile, not just mean.

### Network packet loss

- **Definition**: % of packets lost between client and server.
- **Target competitive multiplayer**: **<1% packet loss**.
- **Tooling**: server-side telemetry + client-side network quality indicator.

---

## Live Ops Specific

### Battle pass completion rate

- **Definition**: % of pass purchasers who reach max tier.
- **Industry benchmarks**: **30-50% reach max tier** = healthy engagement.
- **Interpretation**: <20% = pass too long or rewards undertuned. >70% = pass too short or grind too easy.

### Event participation rate

- **Definition**: % of DAU joining a specific event during its run.
- **Industry benchmarks**:
  - Headline event: **>70% participation = strong**.
  - Side event: **30-50%** typical.
  - **<30%** = event misfire (theme, timing, or rewards off).

### Cosmetic equip rate

- **Definition**: % of cosmetic-owning players who equip it within 30 days of acquisition.
- **Use**: signal of cosmetic desirability. Owned-but-unequipped cosmetics = overpriced or undesired.

### Friend invite rate

- **Definition**: avg invites sent per player.
- **Use**: viral mechanic strength. Combines with K-factor for organic growth model.

---

## Anti-KPIs to Watch

Negative-signal metrics worth tracking proactively.

### Churn warning signals

- Decreased session length over 2-week rolling window.
- Missed last 2 events / battle pass weeks.
- No IAP for 30+ days after previous purchasing pattern.
- Cosmetic equip changes infrequent.
- Guild / clan activity drops.

### Burnout signals

- > 10 hours/day same player consistently.
- Late-night-only sessions (3am+ regular play, no other windows).
- Sudden churn after months of heavy engagement.
- Use case: voluntary play-time alerts (Steam total hours, China-mandated minor play caps).

### Cheating signals

- Impossible win rate (90%+ in matchmade games).
- Suspicious progression pace (mat-cap reached in minutes, not hours).
- Aim accuracy outliers in shooters (auto-aim signature).
- Velocity / position anomalies (speed hacks).

### Fraud signals

- Chargeback spike from a single payment method / region.
- Multi-account refund patterns.
- Promo code abuse (one user, many accounts).
- Stolen credit card patterns (high-velocity purchases, mismatched billing).

---

## KPI Tiers (Indie / AA / AAA)

Reference KPI bands by tier, for benchmarking project expectations.

### Indie premium PC (Steam)

- **D7 retention**: ~30%.
- **LTV**: $10-20.
- **Refund rate**: <5%.
- **Steam reviews**: 80%+ positive = healthy launch.
- **CPI**: $0 (no paid acquisition typical) — relies on store featuring + community.

### Mid-core F2P mobile

- **D7 retention**: ~10%.
- **D30 retention**: ~3%.
- **ARPDAU**: $0.30 (top quartile).
- **LTV**: $1-5.
- **CPI**: $5-15.

### AAA F2P shooter (Apex, Fortnite, CoD Warzone)

- **D7 retention**: ~25%.
- **D30 retention**: ~10%.
- **ARPPU**: ~$100 monthly among payers.
- **Conversion**: 8%.
- **Whale spend**: top 1% drive ~50% of revenue.

### AAA premium console (RDR2, BG3, Elden Ring)

- **D30 retention**: 30%+.
- **LTV**: $70 base + $30 DLC = ~$100.
- **Refund rate**: <3%.
- **NPS**: 50+ for hits.
- **Sell-through**: 50-70% of pre-orders convert to first-week launch.

---

## Sources

- GameAnalytics 2025 mobile gaming benchmarks — <https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks>
- GameAnalytics Q1 2024 mobile games benchmarks — <https://www.gameanalytics.com/reports/mobile-games-benchmarks-q1-2024>
- GameAnalytics mobile gaming benchmarks summary 2025 — <https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks>
- ARPPU mobile benchmarks (GameAnalytics) — <https://gameanalytics.com/blog/benchmarks-finds-arppu-spending-up/>
- Mobile game KPIs 2026 — <https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-kpis-benchmarks-2026/>
- Mobile game whales overview (Udonis) — <https://www.blog.udonis.co/mobile-marketing/mobile-games/mobile-games-whales>
- Mobile gaming stickiness (Udonis) — <https://www.blog.udonis.co/mobile-marketing/mobile-games/stickiness>
- NPS for game publishers — <https://blog.tapresearch.com/what-is-nps>
- Mobile game retention benchmarks (Mistplay) — <https://business.mistplay.com/resources/mobile-game-retention-benchmarks>
- Mobile game retention benchmarks (MAF) — <https://maf.ad/en/blog/mobile-game-retention-benchmarks/>
- Google Play retention strategy (tomorrow focus) — <https://medium.com/googleplaydev/why-focusing-on-tomorrow-brings-back-players-in-the-long-run-e57c51bd3481>
- 10 key metrics for mobile game developers — <https://tracker.my.com/blog/10-key-metrics-that-mobile-game-developers-should-track>
