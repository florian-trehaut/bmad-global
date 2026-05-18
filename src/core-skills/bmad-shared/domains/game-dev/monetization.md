# Domain Sub-File: Monetization

**Parent:** `domains/game-dev.md`
**Scope:** Game business models, in-app purchase taxonomy, regulatory framework for loot boxes and gacha, store platform economics (mobile / console / PC), regional pricing strategy, F2P psychology patterns, ad networks, subscription deals, and anti-pay-to-win practices. Verified May 2026. No vendor SDK code copied (OOS-5 preserved).

Sub-file ordering follows the typical monetisation decision tree: model → IAP design → regulatory constraints → store economics → operational patterns.

---

## Business Models

The seven canonical revenue models in 2026. Choose one as primary; hybrid combinations explicit and intentional.

### Premium (one-time purchase)

- Price band: **$5-70 USD** one-time. Indie sweet spot $15-30; AA $30-50; AAA $60-70.
- Revenue concentrates at launch (~60% within first 90 days for AAA), long-tail via sales events.
- No recurring revenue obligation, no monetisation engine cost.
- Reference: most indie titles, narrative-driven AAA (RDR2, Cyberpunk 2077 launch model, BG3).

### F2P (Free-to-Play)

- Free download, monetisation via IAP. Dominant model in mobile and live-service shooters.
- Revenue distribution: **~95% of revenue from ~5% of paying users** (industry rule of thumb, validated by GameAnalytics data).
- Top 1% (whales) typically spend **$1000+/year**, drive ~50% of revenue. Top 5% drive ~70-80%.
- High operational cost: backend, content treadmill, customer support, anti-cheat, anti-fraud.

### Subscription

- Recurring fee, all-access or curated catalogue. Studios partner with platform holders.
- **Xbox Game Pass** (~$15-20/month tiers), **PlayStation Plus** (3 tiers), **Apple Arcade** ($6.99/month), **EA Play**, **Ubisoft+**.
- Studios receive revenue share + signing bonus + audience exposure. Day-one Game Pass typically loses 50% of direct sales but gains acquisition velocity.

### Premium + DLC

- Initial purchase $40-70 + DLC packs $10-30 (expansion-sized) or $5-10 (cosmetic/level).
- Reference: **The Witcher 3 / Blood and Wine**, **RDR2 / Undead Nightmare-style**, **Elden Ring / Shadow of the Erdtree**.
- DLC release window typically 6-18 months post-launch, single major expansion is the dominant pattern in 2025-2026.

### Premium + live service

- Premium entry + ongoing seasonal pass.
- Reference: **Helldivers 2** ($39.99 + Warbond pass system + Super Credits), **Diablo IV** ($69.99 + seasonal cosmetic shop + paid *Vessel of Hatred* expansion).
- Hybrid resolves the "F2P feels exploitative" tension among premium audience but still operates a recurring revenue engine. Helldivers 2 microtransactions reportedly >50% of total revenue.

### Ad-supported

- Free with banners / interstitials / rewarded video. Casual / hyper-casual mobile dominant.
- Revenue per session very low (eCPM-dependent); requires massive DAU to scale.
- Banner ads: lowest eCPM, highest retention risk. Interstitial: full-screen between sessions, moderate eCPM. Rewarded video: highest eCPM, lowest retention risk (player opts in for in-game value).

### Hybrid F2P + ads

- Both IAP + ad monetisation. Increasingly the default for mid-tier mobile.
- Pattern: rewarded video to bypass timer / earn currency; IAP to skip ads + buy premium content.
- Reference: **Royal Match**, **Coin Master**, **Subway Surfers**. Hybrid ARPDAU often exceeds pure-IAP for the same DAU because monetisation captures both payer and non-payer surplus.

---

## IAP Categories

The six canonical IAP types, ordered roughly by ethical-acceptability (most → least). Choose deliberately. Mixing categories within a single game is normal, but **power IAP** in a competitive multiplayer game is increasingly a regulatory and review risk.

### Cosmetics

- Skins, emotes, sprays, banners, weapon charms.
- No gameplay impact. Pure self-expression / collection.
- Ethical baseline. Path of Exile and Dota 2 are the reference cosmetics-only F2P titles.
- Risk: cosmetic spend ceiling is lower than power-spend ceiling — must compensate with volume + variety.

### Convenience

- XP boosters, time savers, auto-collect upgrades, queue priority.
- Saves time but doesn't grant power that cannot be otherwise earned.
- Risky perception — "pay to skip the grind" is sometimes read as P2W when grind feels mandatory.

### Power

- Direct stat boosts, exclusive weapons unobtainable for free, gameplay advantages.
- Highly P2W. Acceptable in single-player; toxic in competitive multiplayer.
- Regulatory exposure rising (EU consumer protection, some US states examining).

### Loot boxes / gacha

- Randomised reward purchases. Probability-based outcome.
- **Heavily regulated** — see "Loot Box Transparency Laws" below.
- High revenue ceiling (drives Genshin's revenue base), high ethical and legal scrutiny.

### Subscription

- Monthly premium tier with login rewards, free battle pass, exclusive cosmetics.
- Reference: Genshin's Welkin Moon ($4.99/month, daily Primogems for 30 days), CoD's BlackCell, Apex Premier.
- Stable revenue, low churn if value-aligned.

### Currency packs

- "Premium gems" sold in tiered packs at progressively better USD-per-gem ratios.
- **Currency layering** — multi-tier abstraction (USD → premium gems → in-game gold → soft resource → resource pieces) obscures the real-money value of each in-game item.
- Designed to defeat intuitive cost comparison. Regulatory and consumer-protection focus area.

---

## Loot Box Transparency Laws

State of regulation as of May 2026. **This section is not legal advice.** Consult counsel for jurisdiction-specific compliance.

### Belgium

- **Banned for paid use since 2018**. Belgian Gaming Commission classifies paid loot boxes as gambling under existing gaming statute.
- Publishers must remove loot box mechanics or block Belgian players from those mechanics.
- Enforcement: real, multiple high-profile publisher exits (CS:GO cases removal, FIFA pack ban).

### Netherlands

- **Restricted since 2018**, classified as gambling under Dutch Gaming Act for paid randomised outcomes.
- EA successfully appealed €5M fine — weakened enforcement scope. As of May 2026, full ban not yet enacted.
- Status remains under regulatory pressure. Publishers should treat NL loot boxes as high compliance risk.

### South Korea

- **Mandatory probability disclosure since March 2024** under amended Game Industry Promotion Act.
- 2025 study: 84% compliance rate in KR vs 64% UK (voluntary) and 35% Netherlands.
- 2026 enforcement: **revenue-based fines** ratified — penalties scale with publisher revenue, not flat per-violation.

<!-- TODO verify: exact KR 2026 revenue-fine multiplier (sources report it as "significant" but specific ratio varies by case) -->

### China

- **Mandatory probability disclosure since 2017** (MIIT regulation, expanded under Article 23 publishing requirements).
- **Spending limits for minors**: ~400 RMB / month cap, age verification mandatory.
- All games require government approval (banhao license); loot box / gacha mechanics must publish odds on the in-game item store screen.

### Japan

- **"Kompu gacha" (complete gacha) banned 2012** — multi-step gacha requiring assembly of randomly drawn items to unlock further item.
- Standard single-draw gacha remains legal. JSGA (Japan Online Game Association) self-regulation requires probability disclosure.
- Gacha remains a dominant F2P pattern (Genshin, Honkai Star Rail, Fate/Grand Order).

### Australia

- ESRB-equivalent disclosure required 2024+. Mandatory labelling on games containing simulated gambling or loot boxes.

### European Union

- **Digital Services Act (DSA)** may scope loot boxes in future — currently general consumer protection framework, ongoing scrutiny by national consumer agencies.
- Spain, Germany, Austria each have active regulatory consultations.

### United States

- **No federal law** as of May 2026. Voluntary ESRB disclosure (since 2020): "Includes Random Items" label.
- State-level proposals (e.g., Hawaii, Minnesota) have not progressed.
- FTC has held loot box workshops (2019, 2021) but no enforcement action.

---

## Mobile Store Economics

### Apple App Store

- **Standard commission**: 30% of all paid app + IAP + subscription revenue.
- **Subscription year-1**: 30%. **Year 2+**: 15% (loyalty incentive).
- **App Store Small Business Program**: **15% commission** if you and Associated Developer Accounts earned ≤$1M USD total proceeds in the previous calendar year AND year-to-date.
- Crossing $1M threshold mid-year: 30% applies from the following calendar month.
- **EU alternative terms** (DMA-compliant since 2024): **17% commission** + 3% payment processing if using Apple's payment system. **Core Technology Fee** (CTF) of €0.50 per install per year over 1M threshold for apps distributed via alternative marketplaces.
- **EU subscription year 2+ under alternative terms**: 10%.

### Google Play

- **Standard commission**: 30% on paid apps + first-year subscriptions + IAP.
- **First $1M annual revenue**: **15% service fee** for enrolled developers (since July 2021). Crossing $1M: 30% applies on incremental revenue beyond.
- **Subscriptions**: **15% from day one** for all auto-renewing subscriptions (changed in 2022, no longer year-2 threshold).
- **EU alternative billing** (DMA-compliant): reduced service fee + developer's own payment processor.

### In-app currency tax / VAT

- **EU VAT**: applies to IAP. Apple/Google collect and remit on developer behalf — net to developer is commission-after-VAT.
- **India GST**: 18% on IAP. Some platforms collect, some require developer registration.
- **Brazil**: complex regional tax stack, Apple/Google handle in their stores.

### 2026 alternative app stores

- **Epic Games Store mobile** — launched 2024 (EU iOS sideloading via DMA). 12% revenue share. Limited title selection.
- **Apple sideloading EU** — DMA-mandated since 2024. CTF (Core Technology Fee) still applies above 1M installs threshold per year.
- **Setapp Mobile** — Mac App Store subscription model extended to iOS in EU.
- **Alternative app stores remain niche** — outside EU, Apple/Google dominate. Inside EU, adoption is slow.

---

## Console / PC Store Cuts

### Steam (Valve)

- **30% standard** on first $10M lifetime gross revenue per title.
- **25%** on $10-50M tier.
- **20%** above $50M.
- Cuts apply per-title, not per-developer — successful sequel resets tier.

### Epic Games Store

- **12% flat** commission, no tier escalation.
- **First $1M / year per title** for self-published titles: **0%** (Epic First Run if exclusive 6 months).
- Plus 5% user cashback (Epic Rewards) on most purchases.

### PlayStation Store (Sony)

- **30%** standard on digital game sales + IAP.
- Promotional placement / featuring: **paid** — Sony reportedly charges from $25,000 to six-figure fees for store visibility / featuring slots.

### Xbox Store (consoles)

- **30%** standard on Xbox console digital sales + IAP.
- **12%** for IAP processed through Microsoft's own platform IAP system (vs 30% otherwise) — limited to specific eligible categories.

### Microsoft Store (PC)

- **12% flat** for PC game sales (since 2021 cut from 30%).
- Markedly more developer-friendly than the Xbox console store. Reflects Microsoft's PC-Xbox unification strategy.

### Nintendo eShop

- **30%** standard. No tier reduction publicly announced.

---

## Regional Pricing Strategy

### Steam regional pricing

- Steam provides **per-region recommended prices** based on purchasing power parity (PPP), local market data, and historical FX.
- Recommended prices for **emerging markets** typically **40-70% below USD/EUR baseline**:
  - **Brazil (BRL)**: ~40-50% of USD price.
  - **Turkey (TRY)**: ~25-35% of USD price (subject to lira devaluation drift).
  - **India (INR)**: ~30-40%.
  - **CIS region (was Russia)**: ~40-60% — limited operability in 2026 due to sanctions.
  - **Argentina (ARS)**: ~30-40% — heavily revised post-Argentina lira devaluations 2024.
- **Premium markets**: Switzerland, Norway, Australia +10-20% vs USD baseline.
- **Best practice**: follow Steam's official recommendation table unless you have your own data. Direct FX conversion is forbidden — it makes games unaffordable in emerging markets and drives piracy.

### Apple App Store / Google Play tiers

- Apple uses **price tiers** (Tier 1 = $0.99, etc.); Apple manages FX automatically per region.
- Developer chooses tier; price floats with FX per Apple's published table.
- Google Play uses similar tiered system with per-country overrides supported.

### Power-purchasing parity ethics

- Ethical regional pricing reduces piracy in emerging markets (proven correlation, Steam data).
- VPN abuse (buying region-locked price tier from cheaper region) is partially mitigated by IP-region validation + activation restrictions, but cannot be eliminated.
- **Locked-currency prices** (set in local currency rather than auto-FX) become unrealistic after large devaluations (Argentina, Turkey, Russia) — periodic review required.

---

## F2P Monetisation Patterns

### Whale concentration

- **Top 1% spend $1000+/year**, drive ~50% of revenue.
- **Top 5% drive ~70-80% of revenue**.
- Bottom 50% of paying users spend less than $20 lifetime in many F2P titles.
- Whale typical transaction size: ~$20 per purchase (frequency, not size, drives whale revenue).

### First-time-payer (FTP) optimisation

- Critical conversion event: first IAP transforms a free user into a paying user.
- **Starter pack**: typically $0.99-$4.99, deliberately high value ratio (5-10x), one-time-only purchase per account.
- Conversion rate to first IAP: **1-3% F2P mobile average**, **5%+ excellent**, **5-10% on console F2P**.

### Bundle pricing

- Pattern: **5x value at 3x price**. Reference list-price inside the bundle of equivalent solo purchases.
- "Super bundles" / "ultimate packs": end of season clearance, ~10x list value, $50-100 price point.
- Bundles dramatically lift ARPPU among already-paying whales without affecting non-payers.

### Limited-time offers

- **24-72h timer** is the canonical FOMO window.
- Sale screen pinned to main menu. Counter visible.
- Strong revenue lift in the timer's last 4-6 hours.

### Currency layering

- Multi-tier abstraction: USD → premium gems → soft currency → action points → item shards.
- Each layer reduces real-money comparability — players lose track of $-per-cosmetic.
- Regulatory and ethical scrutiny — increasingly highlighted by consumer agencies.

---

## Ad Networks

### Major networks (mobile)

- **AppLovin** — industry leader for monetisation eCPM, especially Western markets. 98%+ fill rate claimed. ~24% Android mediation market share.
- **Google AdMob** — universal mediation. ~28% Android mediation share, top installed base.
- **Unity Ads** / **LevelPlay** (merged ironSource since 2022) — ~13% AdMob share plus ironSource ~5%. Game-engine-native integration.
- **Meta Audience Network** — Facebook / Instagram audience-driven. Often top-fill for tier-1 traffic.
- **Mintegral** — strong Asia coverage, ~11% Android share.
- **IronSource Exchange** — high-quality programmatic.

### Ad format eCPM (USD, 2025 rates)

- **Rewarded video**: **$15-40 tier-1 markets** (US, UK, Japan, Germany, Canada, Australia). **$3-10 tier-2/3** markets. Highest eCPM, player opts in.
- **Interstitial**: $5-20 tier-1. Full-screen between sessions. Mid retention risk if frequency uncapped.
- **Banner**: $0.50-3 tier-1. Lowest eCPM, lowest interruption.
- **Playable ads** (for cross-promo / UA): $20-50 eCPM tier-1. Highest conversion but production cost.

### Ad mediation platform choice

- **AppLovin MAX** vs **Unity LevelPlay** (formerly ironSource) — top-two mediation platforms in 2025-2026.
- Both: AppLovin earns ~4x more on AppLovin MAX than as a guest on competitor mediation. Same Unity/ironSource as guest on AppLovin MAX.
- Choice depends on which network is your strongest demand source — natural pairing usually wins.

---

## Subscription Strategy

### Console subscription deals

- **Xbox Game Pass / PlayStation Plus**: studios receive **signing bonus** (cash up-front for inclusion in catalogue) + **revenue share** (based on hours played / subscriber engagement).
- **Day-one Game Pass**: typically reduces direct sales ~50% but adds acquisition reach (millions of subscribers).
- Subscription deal economics favour mid-tier titles seeking audience over AAA titles already with strong sell-through.

### Apple Arcade

- **Exclusive deal**: no IAP allowed in Apple Arcade titles. Game must be Arcade-only or Apple Arcade variant.
- Apple pays upfront development + ongoing engagement bonuses.
- Suits premium-feeling indie games allergic to F2P monetisation.

### Subscription retention pattern

- **Month 1**: hook (intro pricing, free trial).
- **Month 2**: retention (regular pricing, content drop coverage).
- **Month 3-12**: monetisation flatlines on subscription; revenue depends on retention not transaction.
- Annual subscription typically 15-20% discount vs monthly = retention insurance.

---

## Anti-P2W Best Practices

For competitive multiplayer games where P2W is a community-trust risk.

### Cosmetics-only premium

- **Path of Exile**: cosmetic stash tabs + visual MTX only. Considered the gold standard ethically.
- **Dota 2**: pure cosmetic + arcana skins. Free heroes from day one.
- **Helldivers 2** Warbond model is partially this — weapons exist on free Warbond track, premium track adds variants not strict upgrades.

### Skill > spend matchmaking

- Matchmake by skill rating, not by spend. P2W mechanics neutralised by SBMM if power exists in the game.
- Note: SBMM itself is contentious (it reduces casual win rates), but it functionally blocks pay-to-stomp.

### Capped progression speed

- **Daily / weekly XP caps** prevent spend-to-skip mechanisms.
- Battle pass tier purchase price ($1 / tier) caps maximum P2W ceiling at the price of the pass.

### Transparent loot box odds

- Publish probability tables on the in-game store screen for every loot box / gacha SKU.
- Required by law in CN, KR, JP (kompu); voluntary best practice elsewhere.
- Beyond legality: builds player trust, reduces customer-support load.

### Free-to-earn equivalents

- **Path of Exile**: any cosmetic except limited supporter packs is also drop-from-MTX-box or earnable. There is no power gated behind purchase.
- **Apex Legends** / **Fortnite**: every gameplay-affecting item (legends, weapons) is free; only cosmetics are paid.

---

## Sources

- Apple App Store Small Business Program — <https://developer.apple.com/app-store/small-business-program/>
- App Store fees 2026 guide — <https://www.revenuecat.com/blog/engineering/small-business-program/>
- Google Play service fee — <https://splitmetrics.com/blog/google-play-apple-app-store-fees/>
- Steam revenue share tiers — <https://steamcommunity.com/groups/steamworks/announcements/detail/1697191267930157838>
- Epic Games Store commission — <https://gamerant.com/epic-games-store-revenue-split-explained/>
- Console platform fees overview — <https://www.1d3.com/blog/platform-fees>
- Microsoft Store PC 12% fee — <https://www.thurrott.com/games/xbox/249689/microsofts-store-fee-change-could-come-to-xbox-too>
- Loot box laws comparative analysis — <https://coredo.eu/comparative-analysis-of-loot-box-legislation-in-different-countries/>
- South Korea loot box compliance study 2025 — <https://pmc.ncbi.nlm.nih.gov/articles/PMC12583229/>
- Korea loot box revenue fines 2026 — <https://www.glitchrant.com/south-korea-loot-box-law-revenue-fines/>
- Loot box regulation status (Simmons & Simmons) — <https://www.simmons-simmons.com/en/publications/ck4bm3zxr2dl70a50l90axd3z/the-status-of-loot-box-regulation>
- Steam regional pricing guide 2026 — <https://www.steampageanalyzer.com/blog/steam-regional-pricing-guide>
- Mobile game whales (Udonis) — <https://www.blog.udonis.co/mobile-marketing/mobile-games/mobile-games-whales>
- ARPPU mobile benchmarks (GameAnalytics) — <https://gameanalytics.com/blog/benchmarks-finds-arppu-spending-up/>
- Rewarded video eCPM 2025 — <https://www.globalgamesforum.com/features/how-is-your-ecpm-doing-a-six-month-trend-analysis>
- AppLovin / LevelPlay mediation comparison — <https://bidlogic.io/2025/08/29/unity-levelplay-vs-applovin-max-2025-how-to-choose-the-best-ad-mediation-platform/>
- Helldivers 2 monetisation analysis — <https://screenrant.com/helldivers-2-life-service-game-pvp-microtransactions-cost/>
