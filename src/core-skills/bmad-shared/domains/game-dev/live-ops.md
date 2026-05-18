# Domain Sub-File: Live Ops

**Parent:** `domains/game-dev.md`
**Scope:** Live-service operating model — service archetypes, seasonal cadence, content drop strategy, battle pass design, event calendar, tooling, player lifecycle, deprecation policy, server live ops, and live-service KPIs. Verified May 2026 against public GDC talks, vendor pricing pages, and shipped-game patterns. No vendor SDK code copied (OOS-5 preserved).

Sub-file ordering of sections follows the typical live-ops planning order: model → cadence → content → tooling → measurement.

---

## Live Service Model Types

Three archetypes, distinguished by purchase model and monetisation pressure. Choose deliberately during the architecture step — the model dictates server topology, content factory size, and KPI targets.

### Pure live-service

- Free entry (F2P) OR low-friction subscription. Player acquisition is the only one-time barrier.
- Continuous content treadmill. Drift means churn.
- Monetisation engine is core, not optional — IAP, battle pass, cosmetics, gacha. Revenue scales with engagement.
- Reference titles: **Fortnite** (Chapter 6, 2026), **Apex Legends** (Season 29, May 2026 — Overclocked), **Genshin Impact** (5.x patch cadence), **Destiny 2** (Year 12 of service), **World of Warcraft** (sub-based variant, in service since 2004).
- Studio implications: large LiveOps team (10-50+), 24/7 SRE coverage, content pipeline measured in months not weeks.

### Hybrid (premium + live-service)

- One-time premium purchase ($30-70) THEN ongoing seasons / passes / DLC.
- Monetisation is opt-in but normalised — first purchase already covered, additional spend is for cosmetics or expansion content.
- Reference titles: **Helldivers 2** ($39.99 base + Warbond battle pass system, free + paid tracks, Super Credits earnable in-mission), **Diablo IV** ($69.99 base + cosmetic-only seasonal shop + paid expansion *Vessel of Hatred*), **Cyberpunk 2077** post-*Phantom Liberty* (premium + expansion DLC + free content updates).
- Sweet spot for premium audience that resents F2P friction but accepts ongoing content.
- Helldivers 2 specifically: microtransactions reportedly >50% of total revenue post-launch despite premium entry — proves hybrid is not "monetisation-light", it is "monetisation-deferred".

### Single-player live-touch

- Premium one-time purchase. No monetisation engine after sale.
- Occasional free content drops to keep community alive and drive long-tail sales spikes.
- No FOMO pressure, no recurring revenue obligation, no SLA on uptime.
- Reference titles: **Terraria** (free major content updates 2011-2024), **Stardew Valley** (free 1.5 / 1.6 updates), **Hades** (post-launch updates pre-Hades II).
- Studio implications: small ops team or none, content drops scheduled around studio capacity not contractual cadence.

---

## Seasonal Content Pattern

### Season length conventions

- **Fortnite**: ~10 weeks typical for full chapters; "mini-seasons" (Chapter 6 Season 3 *Galactic Battle*) shorten to ~5 weeks with reduced 52-tier passes. Standard seasons remain 100-tier.
- **Apex Legends**: highly regimented — average 91 days, with 84 / 91 / 97 day variants. 12 of 29 seasons hit exactly 91 days (41%). Season 29 *Overclocked* launched May 2026 on this cadence.
- **Valorant**: ~8 week act cadence, 3 acts per episode.
- **Genshin Impact**: 6-week patch cadence (5.x line in 2026), each patch ships new banner + region + events.
- **Destiny 2**: episodic model since 2024, ~3-4 month episodes replaced seasonal model.

### Battle pass model

- **Tier count**: 100+ tiers canonical (Fortnite standard, Apex, CoD), 50-60 for mini-seasons.
- **Price**: $9.99 USD typical premium track entry. Premium+ tier $24.99-29.99 (skip ~25 tiers + exclusive variant cosmetic).
- **Tracks**: dual track — free + premium. Premium typically pays for itself in earned premium currency (Fortnite V-Bucks, Apex Coins) if completed fully — explicit retention hook.
- **Cosmetic mix**: skins, emotes, sprays, weapon charms, banners, loading screens, premium currency.

### Season theme

- Narrative arc tied to live story beats (Fortnite chapter-spanning lore).
- Cosmetic theme (Apex *Overclocked* — cyberpunk aesthetic).
- Gameplay rotation — map changes, modes vault/unvault, ranked split mid-season.

### Off-season events

- 1-2 week bridge content between seasons. Limited-time modes, themed cosmetics, free login rewards.
- Purpose: dampen the engagement cliff between season-end and season-start.

---

## Content Drop Strategy

### Drop type taxonomy

- **Major patch** — 6-8 week cadence. New season content, new heroes/weapons/maps, balance pass, narrative beats.
- **Mid-season patch** — typically 4 weeks into a season. Balance pass on overperforming/underperforming content + accumulated bug fixes + mid-season cosmetic drop.
- **Hotfix** — 24-72h response window for critical bugs, exploits, dupes, game-breaking imbalance. Server-side preferred (no client patch).
- **Live event** — limited-time mode 2-7 days, often tied to real-world calendar or community goals.

### Rollout pacing

- Most live-service titles avoid Friday deploys (weekend support cost).
- Tuesday / Wednesday US-morning deploys are conventional (overlaps with EU afternoon, off-peak APAC).
- Hotfixes deploy when ready — no schedule, only urgency.

---

## Battle Pass Design

### Tier progression

- **XP-based**, gated by **daily / weekly cap** to prevent no-life completion in week 1.
- Typical progression: ~7-10h focused play per week clears all weekly tiers. Casual schedule (3-4 sessions/week) completes the pass over the full season.
- Catch-up: bonus XP weeks (3x XP final 2 weeks), free tier skips for purchase, friend XP bonus.

### Free track design

- **30-40% of items on free track** — sufficient to feel valued, insufficient to skip premium.
- Free track ships premium currency at lower tiers (creates FTP→paying conversion ramp).
- Anchored cosmetics on free track must be visually clean (else they damage cosmetic shop value perception).

### Premium track design

- Front-loaded "instant unlock" hero skin or weapon skin at tier 1 (purchase satisfaction).
- Tier 100 ultra-rare animated/legendary variant (completion incentive).
- Mid-pass: 5-10 "wow tier" rewards spaced to keep weekly engagement.
- Premium+ ($25-30): tier skip (typically 25 tiers) + exclusive variant of the tier-1 skin.

### Pass-end content

- 5-10 high-end tier items at tier 90-100 that justify the grind: gold/animated skins, exclusive emotes, legendary weapon variants.
- Pass-end items are typically the most "shown off" cosmetics — they signal commitment.

---

## Event Calendar

### Holiday events

- **Christmas / Winter**: December 1 - January 5 window. Snow map variants, winter cosmetics, double XP weekends. Universal.
- **Lunar New Year**: late January / February. Strongly weighted in CN/KR/JP markets, lighter in NA/EU. Red/gold cosmetics, zodiac themes.
- **Halloween**: October 15 - November 5. Horror modes, spooky cosmetics.
- **Valentine's Day**: February 7-14. Lower-stakes, often skipped by hardcore titles, leaned into by casual titles (Royal Match, Match-3).
- **Pride Month**: June. Optional cosmetics, badges. Regional caveat — some publishers restrict in markets with regulatory risk.

### Real-world tie-ins

- **FIFA World Cup**: quadrennial, June-July. Football-adjacent cosmetics, prediction events.
- **Olympics**: quadrennial. Less leveraged due to IOC licensing cost.
- **Anniversary**: 1-year game anniversary — free signature skin or event mode. High retention impact.

### Community goals

- Aggregate progress events (e.g., "destroy 1B enemy ships globally over 7 days"). Worldwide tracker, completion unlocks free reward for all participants.
- Strong narrative + community engagement. Used heavily in Destiny 2, Helldivers 2 (galactic war).

---

## Live Ops Tooling

### Remote config / feature flags

- **LaunchDarkly** — industry default for feature flag SaaS. Per-user targeting, gradual rollout, kill switches. Pricing scales with MAU.
- **Firebase Remote Config** — included with Firebase, free at small scale. Common in indie/mid-tier mobile.
- **AWS AppConfig** — feature flag service inside AWS account. Pay-per-API-call. Common when game backend already runs on AWS.
- **Statsig** — combines feature flags + A/B testing + analytics. Growing in game-dev.

### Live ops platforms

- **PlayFab** (Microsoft Azure) — game services + LiveOps. Tiers: free <100K users, pay-as-you-go, $99/month standard, $1,999/month premium. Owned by Microsoft, tight Azure integration.
- **Heroic Labs Nakama** — open-source backend server (Apache 2.0). Self-hostable or via Heroic Labs managed cloud. Indie-friendly free tier on managed offering; custom pricing for larger studios.
- **Beamable** — Unity-focused managed backend. Subscription begins $10 per million API calls; free indie tier for solo or unfunded teams; special pricing >200M API calls.
- **Metaplay** — backend-as-service for mid-core games, server-authoritative simulation, used by hyper-casual / mid-core mobile.

### A/B testing

- **Amplitude Experiment** — A/B testing built on Amplitude analytics. Common in mobile.
- **Statsig** — full-stack experimentation + analytics + feature flags.
- **Optimizely** — enterprise experimentation platform. Heavier integration cost, used by AAA.
- Typical variables tested: battle pass length (40 vs 100 tiers), starter pack price ($0.99 vs $4.99), tutorial step order, store layout (cosmetic-first vs currency-first).

### Analytics dashboards

- **Looker** (Google Cloud) — SQL-driven BI, common in studios with BigQuery data lake.
- **Tableau** — established BI, dragged into game-dev via finance/BI teams.
- **Grafana** — open-source, common for ops/SRE dashboards (server health, latency, error rates).
- **GameAnalytics** — game-specific SaaS, free tier, built-in retention/monetisation/engagement dashboards. Widely used indie + mid-tier mobile.

---

## Player Lifecycle

### D1 / D7 / D30 retention as live-service viability test

- **D1**: first session experience quality. Casual mobile 26-28% (top 25%), F2P shooter ~25%, AAA premium ~60%, indie premium ~50%. Below 20% = critical product issue.
- **D7**: week-1 hook validation. Casual mobile 7-8% (top 25%), F2P shooter ~8%, indie premium ~30%. Below 5% = poor product-market fit.
- **D30**: long-term monetisation viability. Casual mobile 3-5%, F2P shooter 2-3%, AAA premium 15-20%.

### Engagement loop

The canonical daily compulsion loop:

```
daily login → daily mission → reward → progression visible → social touch (guild/friends) → main session → next-day reminder
```

Each step removed weakens the loop. Daily login = streak. Mission = direction. Reward = dopamine. Progression = endowment. Social = belonging. Session = play. Reminder = return.

### Churn warning signals

- Decreased session length over 2-week rolling window.
- Missed last 2 events (engagement disengagement).
- No IAP for 30+ days after previous purchasing pattern.
- Cosmetic equip changes infrequent (loss of self-expression interest).
- Guild/clan activity drops (social anchor loosening).

### Win-back campaigns

- **Push notification / email** at D14 / D21 / D30 / D60 lapsed.
- **Re-engagement gift** at first login back (free pack of premium currency, free legendary cosmetic).
- **Comeback questline** — bespoke onboarding back into new mechanics introduced since lapse.
- Industry rule of thumb: 5-15% of lapsed players reactivate from a well-tuned win-back; declines sharply >60 days lapsed.

---

## Content Deprecation

### Owned cosmetics policy

- Once purchased / earned, **stay in inventory**. Removing earned cosmetics generates community backlash strong enough to threaten the game itself.
- Stop selling = acceptable. Remove from inventory = forbidden absent extraordinary circumstance.

### Vaulted maps / modes

- Maps / modes can be **rotated out of active pool** but typically **return as Legacy / Throwback mode**.
- Vaulted weapons / abilities may return in limited-time modes.
- Examples: Fortnite's "OG mode" returns rotated maps; Apex's Olympus / Kings Canyon rotation.

### Removed cosmetics

- **Limited-time event-only**: explicitly time-gated when sold. Becomes status symbol post-event. Industry-standard practice.
- **Removed for IP / licensing**: refund or substitute (Marvel/DC tie-in items when license expires).
- **Removed for sensitivity reasons** (politically charged, posthumous, controversial): typically silent removal, no refund.
- **Vintage battle pass items**: owners keep, can no longer be purchased by new players. FOMO mechanic by design.

---

## Server Live Ops

### Hotfix deployment

- **Zero-downtime preferred**: rolling restart (kill 10% of fleet at a time, drain connections, restart, repeat), blue-green deployment (provision parallel fleet, cutover traffic).
- Maintenance window deploys: increasingly rare for AAA — last resort for migrations / breaking schema changes.

### Regional rollout

- Staged region rollout to limit blast radius. Conventional sequence:
  - AU/NZ first (smallest population, off-peak globally) → EU (mid-Pacific Asia awake, no large NA impact) → NA (largest single market last) → CN handled separately (regulatory partition, often by a different publisher).
- Detected anomaly during early-stage rollout = pause + rollback, before NA enters peak hours.

### Rollback plan

- **Per-feature flag** preferred over redeploy — disable broken feature live without rebuilding/redeploying.
- Schema migrations: forward-compatible writes for at least 1 release cycle so rollback is safe.
- Database snapshots before major patches.
- Documented runbook with named owner per system.

### Postmortem culture

- **Public communication** after major outage: status page during, postmortem within 1-2 weeks.
- **Internal blameless postmortem** within 1-2 days of incident.
- Compensation policy: in-game currency / cosmetics / battle pass extension proportional to outage duration is industry-standard.

---

## Live-Service KPIs

The KPI surface specific to live-service operation. For full-stack KPI definitions see `kpis-metrics.md`.

### Engagement

- **DAU** / **MAU** / **DAU/MAU ratio** — stickiness. 20-30% normal, 31% median for top games (Google Play data), 40%+ excellent.
- **Session length** + **sessions per day**.

### Monetisation

- **ARPDAU**: avg revenue per daily active user. $0.05-0.15 ad-monetised casual; $0.30-1.00+ IAP-driven mid-core; $0.25+ hybrid.
- **ARPPU**: avg revenue per paying user. $50-60 daily ARPPU for top 5% spenders across genres; $66 average across all genres.
- **Conversion rate**: % of players who make first IAP. Mobile F2P 1-3% average, 5%+ excellent. Console F2P 5-10%.
- **Whale concentration**: top 1% of spenders drive ~50% of revenue. Top 5% drive ~70-80%.

### Sentiment

- **NPS** (Net Promoter Score): >0 = recommends, >30 = good, >50 = excellent, >70 = world-class. Industry average ~29.
- **Reddit / Twitter / Discord sentiment**: tracked via tooling (Brandwatch, Sprinklr) or manually by community team. Leading indicator for review-bomb risk.

### Battle pass / event participation

- **Battle pass completion rate**: 30-50% reach max tier (engagement signal). Below 20% = pass is too long or rewards undertuned.
- **Event participation rate**: % of DAU joining a given event. Headline event >70% = strong, <30% = misfire.

---

## Sources

- Fortnite Battle Pass — <https://www.fortnite.com/battle-pass>
- Fortnite Chapter 6 Season 3 *Galactic Battle* season structure — <https://esportsinsider.com/fortnite-chapter-6-season-3-ranked-changes>
- Apex Legends seasons + cadence (Season 29 *Overclocked* May 2026) — <https://seasontimer.live/apex/>
- Apex Legends seasons timeline — <https://seasontimer.live/blog/apex-legends-all-seasons-dates/>
- Genshin Impact monetisation breakdown — <https://genshin-impact.fandom.com/wiki/Monetization>
- Helldivers 2 monetisation analysis — <https://screenrant.com/helldivers-2-battle-pass-super-credits-cost-price/>
- Helldivers 2 microtransaction revenue (>50%) — <https://icon-era.com/threads/microtransactions-make-up-more-then-50-of-helldivers-2-revenue.17677/>
- GameAnalytics 2024 mobile benchmarks (D1/D7/D30) — <https://gamedevreports.substack.com/p/gameanalytics-benchmarks-in-mobile>
- GameAnalytics 2025 mobile gaming benchmarks — <https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks>
- PlayFab pricing tiers — <https://slashdot.org/software/p/PlayFab/alternatives>
- Heroic Labs Nakama vs PlayFab — <https://codewizards.io/nakama-vs-playfab-online-player-services/>
- Beamable backend pricing — <https://beamable.com/blog/choosing-the-right-backend-beamable-vs-nakama>
- Mobile game backend providers 2026 — <https://www.metaplay.io/blog/best-mobile-game-backend-providers>
- Mobile game stickiness benchmarks (DAU/MAU) — <https://www.blog.udonis.co/mobile-marketing/mobile-games/stickiness>
- NPS for game publishers — <https://blog.tapresearch.com/what-is-nps>
