# Domain Sub-File: Anti-Cheat (Game Dev)

Threat models, defense strategies, vendor matrix, and ban-strategy options for protecting competitive integrity in any online game with leaderboards, ranked play, or multiplayer competition. This sub-file complements `security-baseline.md` (which establishes the universal client-zero-trust principle and signing requirement) and `multiplayer-architecture.md` (which covers server-authoritative netcode in detail).

## Threat Model by Genre

The cheat threat surface varies dramatically by genre. Mapping the cheat economy onto genre helps prioritize defenses — a fighting game needs determinism + replay validation; an MMO needs bot detection + duplication prevention; a competitive FPS needs every defense at once.

### Competitive FPS (Valorant, CS2, Apex Legends, Rainbow Six, Call of Duty Warzone)

- **Aim-bots.** Automated target acquisition. Detection: input-pattern analysis (impossibly smooth crosshair tracking, sub-tick reaction time), hardware-input fingerprinting (XIM, Cronus Zen, Titan Two adapters that translate mouse to gamepad on console — Apex Legends banned 2,911 such accounts in a single sweep, March 2026).
- **Wall-hacks / ESP (Extra-Sensory Perception).** Visual overlay revealing player positions through walls. Detection: client-side scan for unauthorised render passes (kernel-level only), DMA (Direct Memory Access) hardware cheats (Apex banned 1,103 in same sweep).
- **Recoil scripts.** Macro-based recoil compensation. Detection: input timing analysis, pattern recognition over multiple matches.
- **Lag switches.** Player-induced packet delay to "warp" behind enemies. Detection: server-side RTT spike detection + automatic lag-compensation disable for outliers.
- **HWID (Hardware ID) spoofers.** Used to evade hardware bans. Apex Legends banned 1,071 in a single week (March 2026), reaching 4,405 over a broader window in a later sweep.

### Battle Royale (Apex, Warzone, Fortnite, PUBG)

- **All competitive-FPS threats + scale.** Servers handle 60-150 players per match; statistical outlier detection at scale is harder.
- **Radar hacks.** Network-traffic-based ESP via packet sniffing. Defense: encrypt position updates; only send positions that should be visible to client (limit information disclosure).
- **Item duplication.** Server-state desync abuse. Defense: authoritative item ledger; transactional inventory updates with idempotency.
- **Stream-sniping.** Watching the opponent's stream live to gain info. Defense: stream delay enforced; some games hide enemy positions even from the player's own UI when not visually verified.

### MMORPG (WoW, FFXIV, New World, Lost Ark)

- **Gold farming bots.** Automated grinding to generate currency, sold for real money (RMT — Real Money Trading). Detection: input-pattern recognition, statistical outliers on session length / actions-per-hour / route repetition. New World had publicly documented bot-volume problems in 2021-2022.
- **Bot accounts.** Sub-pennies-per-hour botted accounts at industrial scale. Defense: account creation friction (phone verification, payment-method verification), bot detection ML.
- **Item duplication via exploit chains.** Combine multiple game systems to violate invariants (mailbox + trade + crash combo). Defense: transaction logs, automated balance reconciliation, server-side audit of item lifetime.
- **Bot detection frameworks (commercial).** NGUARD (NetEase MMORPGs), SARD Anti-Cheat. Supervised + unsupervised ML pattern detection.

### Fighting Games (Street Fighter 6, Tekken 8, Guilty Gear Strive, Mortal Kombat)

- **Input automation.** Macros for frame-perfect inputs (one-frame links, just-frames). Defense: input timing entropy detection (humans don't hit frames consistently).
- **Frame data exploit.** Programmed inputs that exploit move startup/recovery edge cases. Defense: design-time mitigation (no 0-frame moves), runtime detection less effective.
- **Replay verification.** Easy here because fighting games are typically deterministic — server can re-run inputs and verify outcome.

### Mobile Competitive (Mobile Legends, COD Mobile, PUBG Mobile, Brawl Stars)

- **Speed hacks.** Modified clients that increase game speed. Defense: server-validated movement; reject clients exceeding designed velocity envelope.
- **AutoIt scripts / accessibility-API automation.** Defense: server-side action-rate limits; CAPTCHA / behavioural challenge on suspicious patterns.
- **Modded clients (APK tampering).** Defense: certificate pinning, server-side build-hash validation, Google Play Integrity API + Apple DeviceCheck.
- **Cloud emulator bots.** Whole-game farms on cloud emulators. Defense: emulator detection (CPU instruction fingerprints, GPU driver name, sensor data absence).

### Async / Turn-Based (Hearthstone, Marvel Snap, Clash Royale, Pokemon TCG Live)

- **Leaderboard tampering.** Submitting falsified outcomes. Defense: server-authoritative match resolution (no client trust).
- **Save state manipulation.** Resetting state to retry a bad outcome. Defense: server-tracked match progression; client save = display cache only.

### Solo (Single-Player)

- **N/A unless connected to leaderboards.** Pure offline games don't need anti-cheat. The moment a leaderboard / achievement-sync / cloud-save / online-multiplayer mode is added, the threat model jumps.
- **Cosmetic cheating (mods, trainers).** Acceptable for many publishers; some (Bethesda) embrace it; others (Take-Two, Nintendo) prosecute aggressively.

## Defense Strategies

The defense toolkit is layered. No single technique stops all cheats — defense in depth applies.

### Server Authority

- **Authoritative state.** Server is the only source of truth for any game-affecting state. Client = visual + input only. See `multiplayer-architecture.md` for netcode patterns implementing this.
- **Authoritative hit registration.** Server decides who hit whom, factoring in lag compensation. Valorant's 128-Hz server-authoritative architecture is the gold-standard reference: server rewinds to the shooter's view at fire-time, validating hit on that rewound state.
- **Authoritative inventory.** All item grants, currency changes, progression unlocks computed server-side. Client UI shows only what the server returns.

### Replay Verification

- **Deterministic simulation games (RTS, fighting, lockstep).** Server re-simulates the match from inputs + seed; compare outcome to client-claimed outcome. Disagreement = cheat or desync.
- **Non-deterministic games (FPS, MOBA).** Capture per-tick state snapshots; server validates that client-side prediction matches by sampling.
- **Leaderboard replay verification mandatory above a threshold rank.** E.g., top-100 leaderboard submissions require full input log; manual + automated review.

### Behavioural Detection

- **Impossible movement vectors.** Speed > maximum allowed, teleport > maximum step distance, position update inconsistent with collision geometry.
- **Statistical outliers.** Headshot rate > 90% sustained, kill-time < human reaction (< 100ms after target appears), accuracy patterns matching aimbot signatures, kill/death ratio > population's 99.9th percentile.
- **Rate limiting.** Action/sec, currency-earn/sec, item-acquisition/sec capped to designed envelope; violations trigger investigation queue.

### Memory Scanning

- **EAC / BattlEye client.** Scans process memory for known cheat signatures (known DLL injections, known cheat-binary fingerprints, hook patterns).
- **Limitation.** Cheat developers update faster than signature databases. Effective against amateur cheats, less so against paid premium cheats.

### Kernel-Level Protection

- **Vanguard (Riot).** Loads at OS boot, runs continuously, blocks suspicious drivers from loading, AI-driven behaviour analysis. Most invasive of the major anti-cheats; community-considered hardest to bypass in 2026.
- **EAC / BattlEye.** Kernel-mode driver, but runs only while game is active.
- **Controversy.** Kernel-level access raises privacy / security concerns (any privileged process becomes a potential rootkit if compromised — see Genshin Impact mhyprot2 abuse 2022).

### Hardware Fingerprinting

- **HWID ban.** Ban the hardware, not just the account. CPU serial + motherboard ID + GPU UUID + Disk ID hash = HWID; banned HWIDs cannot create new accounts.
- **Counter-counter: HWID spoofers.** Commercial spoofer tools regenerate HWID on each boot. Apex Legends specifically targets spoofer signatures in its 2026 bans.

### VAC-Style Delayed Bans

- **Strategy.** Don't ban immediately on detection — flag accounts silently. Accumulate detections for 3-4 weeks. Issue bans in waves.
- **Why.** Prevents cheat developers from immediately learning which detection method caught them. Buys time to broaden detection before cheaters patch around.
- **Modern hybrid.** VAC Live (introduced 2023, refined through 2025) reintroduces immediate bans during active gameplay for the most blatant cases, while keeping delayed waves for sophisticated patterns.

## Anti-Cheat Vendors

The 2026 vendor matrix. All major systems now operate at the kernel level, all issue hardware bans, all use behavioural analysis alongside signature scans.

### Easy Anti-Cheat (EAC)

- **Owner.** Epic Games (acquired Kamu 2018).
- **Pricing.** Free for indies via Epic Online Services (EOS) since 2022.
- **Platform coverage.** Windows / macOS / Linux (Proton-supported for SteamDeck) / Xbox / PlayStation / Switch.
- **Architecture.** Kernel-mode driver loaded while the game runs.
- **Strength.** Broad ecosystem (Fortnite, Apex Legends, Rust, Dead by Daylight, Fall Guys, Halo Infinite multiplayer). Cross-game ban-sharing — a single EAC ban affects access to dozens of titles, which makes the ban penalty meaningful.
- **Weakness.** Less invasive than Vanguard; advanced cheats bypass-able with kernel-mode cheat drivers.

### BattlEye

- **Owner.** BattlEye Innovations (privately held).
- **Platform coverage.** Windows / Xbox / PlayStation.
- **Architecture.** Kernel-mode driver, aggressive ban waves.
- **Strength.** Industry-standard for AAA shooters (PUBG, Escape from Tarkov, Rainbow Six Siege, DayZ, Destiny 2). Known for fast hardware bans + per-publisher ban scope.
- **Weakness.** Linux/Proton support limited (gating Steam Deck adoption for some titles).

### Vanguard (Riot)

- **Owner.** Riot Games (proprietary).
- **Platform coverage.** Windows only (no Mac, no Linux, no console).
- **Architecture.** Kernel-level service starting at OS boot — runs even when the game is closed.
- **Used by.** Valorant (always), League of Legends (added 2024).
- **Strength.** Hardest to bypass in 2026; AI-driven behavioural analysis; boot-time loading blocks pre-game cheat injection.
- **Weakness.** Maximum privacy / security concern from community; not portable to other publishers' games (proprietary).

### Denuvo Anti-Cheat

- **Owner.** Irdeto (parent of Denuvo Software Solutions).
- **Platform coverage.** Windows / Xbox / PlayStation.
- **Architecture.** Kernel-mode + integrated with Denuvo DRM tamper protection.
- **Used by.** Doom Eternal (later removed amid backlash), Resident Evil Village, some FromSoftware titles.
- **Strength.** Pairs with Denuvo DRM (anti-piracy + anti-cheat in single integration).
- **Weakness.** Community backlash reduces adoption; Doom Eternal removal cited performance regressions.

### VAC (Valve Anti-Cheat)

- **Owner.** Valve, built into Steamworks.
- **Pricing.** Free with Steamworks publishing.
- **Platform coverage.** Windows / macOS / Linux.
- **Used by.** Counter-Strike 2, Dota 2, Team Fortress 2, many other Steam-published titles.
- **Architecture.** User-mode signature scanner with delayed ban-wave model. VAC Live (2023+) adds real-time bans for the most blatant cases.
- **Strength.** Free, integrated with Steam community + Family Sharing (VAC ban propagates restrictions to shared library use), wide adoption.
- **Weakness.** User-mode only by default (kernel-mode requires anticheat partner); less aggressive than Vanguard.

### AntiCheatExpert (ACE)

- **Owner.** Tencent.
- **Platform coverage.** Windows / Mobile.
- **Used by.** Tencent published titles (Honor of Kings, PUBG Mobile, CrossFire, Call of Duty Mobile).
- **Strength.** Chinese-market specialised, deeply integrated with Tencent's matchmaking + identity stack.

## Replay System Design

Replay systems are dual-purpose: cheat detection AND user-facing share/highlights.

### Deterministic Simulation Games

- **Fighting games.** GGPO-style rollback netcode is built on full determinism. Once the simulation is deterministic, replay = input log + initial state. Server can re-simulate and verify outcomes precisely. See `multiplayer-architecture.md` for GGPO details.
- **RTS / lockstep games.** Same principle. StarCraft II, Age of Empires II Definitive Edition, Brawlhalla all use deterministic-replay as both feature and anti-cheat.

### Procedural Games (Roguelikes)

- **Input log + seed log.** Reproducibility hinges on deterministic RNG (consistent across platforms). Store the seed, the player inputs, the version hash. Replay = re-run engine deterministically.
- **Example.** Hades, Slay the Spire, Spelunky 2 all expose deterministic seeds.

### Turn-Based Games

- **Save state diffs.** Per-turn state diff. Server can validate that each state transition is legal under game rules.

### Non-Deterministic (FPS, MOBA, Battle Royale)

- **State snapshot recording.** Sample server state at N Hz; replay = state stream + player POVs.
- **Validation.** Spot-check client-side predicted state vs server-recorded state; large deviations = cheat or desync.
- **User-facing storage cost.** Large replays (megabytes per minute); cloud-store only top-N matches + tournament replays.

## Leaderboard Integrity

Specific to global leaderboards (asynchronous competitive games or seasonal ranked play).

- **Seasonal wipes.** Periodic reset every 1-3 months. Limits the half-life of cheated scores.
- **Suspicious score detection.** Statistical outlier detection on submitted scores. Score > Nx population mean = flagged for replay review.
- **Replay verification mandatory above threshold rank.** E.g., top-100 must submit replay; replay re-validated by server before the score is ratified.
- **Cheat rollback procedures.** Post-detection: ban the cheater, recompute affected leaderboard, retroactively update legitimate-player ranks (often communicated as "leaderboard restoration").

## Ban Strategies

The ban toolkit. Most games use a combination based on offense severity.

### Account Ban

- **Standard sanction.** Permanent loss of access to the offending account.
- **Caveat.** Trivially evaded by creating a new account. Effective only if account creation has friction (purchased game, phone verification, payment-method verification).

### Hardware Ban (HWID Ban)

- **Stronger sanction.** Banned hardware cannot create new accounts.
- **Counter-attack.** HWID spoofers; commercial market exists. Defense: detect and ban spoofer signatures specifically (Apex Legends 2026 publicly does this).

### IP Ban

- **Weakest sanction.** Trivially evaded by VPN or ISP DHCP renewal. Used mainly for short-term anti-abuse, not permanent bans.

### Shadow Ban

- **Stealth sanction.** Cheater believes they're still playing, but they are matchmade only with other cheaters in an isolated cheater-pool.
- **Effect.** Slows the cheat-arms-race feedback loop — cheater can't tell whether their new cheat works against legitimate players or just other cheaters. Removes the dopamine of "winning" against legitimate players.
- **Used by.** Call of Duty Warzone, Apex Legends, Counter-Strike 2.

### Ban Wave Timing

- **Delayed ban waves.** Wait 3-4 weeks to identify as many cheaters as possible before issuing bans. Prevents cheat developers from quickly identifying which methods were detected.
- **VAC strategy.** Documented standard; VAC bans typically arrive 3-4 weeks after detection.
- **VAC Live (2023+).** Hybrid model: severe / unambiguous cheats trigger immediate in-match bans, while subtle / probabilistic detections feed the delayed wave.

### Appeal Process

- **DSA requirement (EU).** Under EU Digital Services Act (Regulation (EU) 2022/2065), games classified as hosting services must provide a user appeal mechanism for moderation decisions including bans. See `security-baseline.md` for DSA details.
- **Standard appeal path.** Form submission → internal review → automated re-check of evidence → human moderator review for edge cases → final decision communicated within 30 days.
- **False positives.** Acceptable rate by industry consensus: < 1 per 10,000. Higher rates erode player trust.

### Smurf Detection

- **Definition.** High-skill player using a low-skill alt-account to dominate beginners.
- **Detection.** Account behavioural fingerprinting (movement patterns, accuracy stats, decision-making latency that match a known high-skill account). MMR/skill convergence rate above population baseline (skill curve climbs too fast in placement matches).
- **Sanction.** Auto-MMR adjustment (place the smurf at their true skill bracket) or report-based action. Apex Legends Season 9 added a dedicated smurf-reporting option.

## Sources

- [EAC vs BattlEye vs Vanguard vs RICOCHET comparison 2026 — TATEWARE Blog](https://tateware.com/blog/anti-cheat-comparison-2026)
- [Anti-Cheat Systems Explained: EAC vs BattlEye vs Vanguard — InjectKings](https://injectkings.com/info/anti-cheat-explained)
- [Every game with kernel-level anti-cheat 2026 — Levvvel](https://levvvel.com/games-with-kernel-level-anti-cheat-software/)
- [Apex Legends bans 73,000 cheaters Season 28 — GameRiv](https://gameriv.com/apex-legends-bans-over-73000-cheaters-as-anti-cheat-targets-xim-dma-and-hwid-spoofers-ahead-of-season-28-split-2/)
- [Apex Legends Anti-Cheat: 10,909 bans March 2026 — GameRiv](https://gameriv.com/apex-legends-anti-cheat-team-bans-10909-accounts-targets-xim-titan-dma-and-spoofers/)
- [Apex Legends smurf reporting Season 9 — Dexerto](https://www.dexerto.com/apex-legends/apex-legends-clamps-down-on-smurfing-in-season-9-new-option-report-players-1567234/)
- [Valve Anti-Cheat (VAC) official Steam Support](https://help.steampowered.com/en/faqs/view/571A-97DA-70E9-FF74)
- [VAC Wikipedia (ban wave history, VAC Live introduction)](https://en.wikipedia.org/wiki/Valve_Anti-Cheat)
- [How VAC works in CS2 — BusinessCloud](https://businesscloud.co.uk/news/how-valve-anti-cheat-works-in-cs2/)
- [Valorant 128-tick netcode + server-authoritative architecture — Riot Tech](https://technology.riotgames.com/news/valorants-128-tick-servers)
- [Riot Vanguard kernel-level anti-cheat overview — Riot](https://support-valorant.riotgames.com/hc/en-us/articles/360046160933-What-is-Vanguard)
- [Easy Anti-Cheat via Epic Online Services (free integration)](https://dev.epicgames.com/docs/game-services/anti-cheat)
- [BattlEye official site](https://www.battleye.com/)
- [New World botting deep-dive — Tenable TechBlog](https://medium.com/tenable-techblog/new-worlds-botting-problem-169006a4f34f)
- [NGUARD bot detection framework for NetEase MMORPGs (academic paper)](https://www.researchgate.net/publication/326503248_NGUARD_A_Game_Bot_Detection_Framework_for_NetEase_MMORPGs)
- [GGPO rollback netcode for deterministic simulation](https://www.ggpo.net/)
- [TrueSkill ranking system overview — Microsoft Research](https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/)
