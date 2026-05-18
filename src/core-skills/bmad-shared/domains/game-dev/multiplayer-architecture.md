# Domain Sub-File: Multiplayer Architecture (Game Dev)

Network topology, netcode patterns, matchmaking, voice chat, networking libraries, scaling backend, and performance targets for online multiplayer games. This sub-file complements `anti-cheat.md` (which assumes a server-authoritative topology) and `security-baseline.md` (which establishes the client-zero-trust principle this architecture must enforce).

## Topology Choice

The fundamental architectural choice that determines cost, scalability, anti-cheat strength, and player experience.

### Dedicated Server

- **Description.** Authoritative game server runs on operator infrastructure (cloud or owned hardware). All clients connect to it. Server simulates the canonical game state.
- **Pros.** Authoritative (max anti-cheat); consistent latency for all players; scales linearly with budget; ideal for competitive / ranked play.
- **Cons.** Expensive (~USD 0.01-0.10 per concurrent player per hour depending on infrastructure choice and region); requires backend ops team; cold-start latency on instance scale-up.
- **Used by.** Valorant, CS2, Apex Legends, Fortnite, Overwatch 2, Rainbow Six Siege, all major ranked / eSport titles.

### Listen Server (Player-Hosted Authoritative)

- **Description.** One player's machine is both client and server. Other players connect to that player. Authority on the hosting client.
- **Pros.** Free for the operator (host pays in CPU + bandwidth). Simpler than dedicated.
- **Cons.** Host has lag advantage (zero latency to themselves); host migration on disconnect is hard; anti-cheat weak (host can manipulate state).
- **Used by.** Most casual co-op games (Stardew Valley, Terraria, 7 Days to Die multiplayer, Minecraft self-hosted), classic Halo/Gears multiplayer historical.

### Pure Peer-to-Peer (P2P)

- **Description.** All clients communicate directly. Authority distributed or rotated; in practice many "P2P" games still elect a host.
- **Pros.** Free for the operator. Resilient (no single point of failure).
- **Cons.** Anti-cheat very weak (every client is a potential cheater authority); NAT traversal hard (NAT punching success rate 70-85% in practice); voice/chat scaling complex.
- **Used by.** GGPO-based fighting games (rollback netcode is inherently P2P), some racing games, casual co-op games where cheating doesn't matter much.

### Server-Relayed P2P (TURN Servers)

- **Description.** Hybrid — clients negotiate a direct P2P connection where possible; fall back to a TURN relay when NAT traversal fails.
- **Pros.** Compromise between cost and reach. Steam Datagram Relay (SDR) is the canonical implementation — relays packets without disclosing IPs, prevents DDoS.
- **Cons.** Relay traffic is metered (still cheaper than dedicated servers).
- **Used by.** Steam P2P multiplayer (default with SDR), Epic Online Services Lobby + NAT traversal.

## Netcode Patterns

The four canonical patterns. Choice is driven by genre (input latency tolerance), bandwidth budget, and determinism feasibility.

### Lockstep

- **Description.** All clients run the same deterministic simulation. Only inputs are transmitted. Simulation advances when all inputs for tick N have been received from all players.
- **Pros.** Tiny bandwidth (only inputs). Perfectly synchronized state. Replay = input log.
- **Cons.** Latency = slowest player's RTT (must wait for all inputs). Demands strict determinism across all platforms (floating-point reproducibility is hard).
- **Used by.** Classic RTS (StarCraft, Age of Empires, Warcraft III). Some fighting games before rollback.

### Snapshot Interpolation

- **Description.** Server sends periodic full or delta snapshots of world state to clients. Clients interpolate between snapshots to smooth visual rendering. Player sees the world ~100ms in the past.
- **Pros.** Simple to implement. Server-authoritative. Works regardless of determinism.
- **Cons.** Visible delay (peeker's advantage in FPS — defender sees the attacker later than attacker sees defender).
- **Used by.** Half-Life / Source engine titles (CS:GO, TF2, L4D), early MOBAs, many MMORPGs.

### Client-Side Prediction + Reconciliation

- **Description.** Client predicts its own outcome of inputs locally and renders immediately. Server validates and may correct (reconcile). Industry standard since Quake (1996).
- **Pros.** Responsive feeling for the player (zero-latency input feedback locally). Server-authoritative.
- **Cons.** Reconciliation may snap-back the player ("rubber-banding") on mispredictions. Complex to implement correctly.
- **Used by.** Most modern FPS (Overwatch, Valorant, Apex Legends, CoD), almost all action-multiplayer titles.

### Rollback Netcode

- **Description.** Like prediction + reconciliation, but for ALL players' inputs. Client predicts inputs from all remote players based on previous inputs; when real inputs arrive, the client rolls back the simulation and re-runs forward with corrected inputs.
- **Pros.** Game feels offline-responsive (Tony Cannon's GGPO is the canonical SDK). Tolerant of latency up to ~100ms RTT.
- **Cons.** Requires full deterministic simulation. CPU cost: rollback + re-simulate up to N frames per tick.
- **Used by.** Modern fighting games (Guilty Gear Strive, Street Fighter 6, Tekken 8, Mortal Kombat 1, Skullgirls), GGPO-based titles, some sports games.

### State Sync (MMO Pattern)

- **Description.** Server is the authoritative state holder. Clients receive partial state updates (only the relevant subset within their AoI — Area of Interest). Often layered on snapshot interpolation.
- **Pros.** Scales to thousands of players in shared world. Bandwidth-efficient via AoI filtering.
- **Cons.** Complex AoI logic; spatial-database optimization needed; lag visible for distant players entering AoI.
- **Used by.** World of Warcraft, Final Fantasy XIV, Lost Ark, New World, EVE Online.

## Matchmaking

How players are paired into matches. Multi-criteria optimization problem (skill + latency + party + queue time).

### Skill-Based Matchmaking (SBMM)

- **Algorithms.**
  - **Elo.** Two-player only; rating updated based on expected vs actual outcome. Chess heritage. Limited for team games and multi-team free-for-alls.
  - **Glicko / Glicko-2.** Extension of Elo with rating-deviation parameter. Faster convergence than TrueSkill in 2-player games. Limited to two-player matches in the base formulation.
  - **TrueSkill (Microsoft Research).** Generalises Glicko to N teams of M players each. Gaussian skill model. Industry-standard for team-based games — Halo, Forza, Gears of War. Designed to minimize matches needed to estimate skill.
  - **TrueSkill 2 (2018).** Improvements for early-match skill assessment + per-mode skill tracking.
- **Application.** Match players within a skill band; widen the band over queue time to keep wait times bounded.

### Latency-Based Matchmaking

- **Region routing.** Players matched into their nearest available data center based on measured ping. Prevents NA players from being placed in EU servers.
- **Latency band relaxation.** Initial band is tight (< 50ms); widens over queue time to avoid infinite waits.

### Party Support

- **Queue with friends.** Average / max / weighted skill of the party computed; matchmaker treats the party as a single skill cluster.
- **Backfill of parties.** When a party of 3 queues for a 4-player match mode, system finds a solo player with compatible skill to fill the empty slot.

### Backfill (Mid-Match)

- **Replace disconnected players.** Pull from a backfill queue (players opt-in to entering matches already in progress). Used in BR (Apex Legends, Warzone) for early-game disconnects.
- **Quitter penalty.** Players abandoning matches face escalating sanctions: queue ban duration scales with frequency (Overwatch competitive: 10min → 30min → 24h → season ban).

### Leaver Penalty

- **Definition.** Player exits a ranked match before its natural end.
- **Sanctions.** Loss of MMR / Elo, queue timeout, ranked play suspension for repeat offenders.

### Smurf Detection

- **Definition.** High-skill player using a low-skill alt account.
- **Detection.** Account behavioural fingerprinting + abnormal skill convergence in placement matches. See `anti-cheat.md` for details.

## Lobby Systems

How players gather before matches.

- **Browser-based (legacy).** Player picks from a public server list. Quake III, Counter-Strike Source. Mostly deprecated for ranked play.
- **Quick-play matchmaking (modern).** Player clicks "Play" → system finds a match. Standard for modern competitive games.
- **Custom games / private lobbies.** Password-protected; invite-only; used for tournaments, training, casual community games.
- **Tournament mode.** Brackets, scheduled starts, broadcast features (observer mode, casting tools). Riot, Faceit, ESL integrations.

## Voice Chat

Real-time voice between players in same match / party.

### Vivox (Unity Multiplayer Services)

- **Coverage.** Unity, Unreal, custom (Core SDK). Engine-agnostic.
- **Capabilities.** Voice + text + AI moderation (Player Safety). Channel-based workflow.
- **Platform support.** Windows, macOS, iOS, Android, PS4, PS5, Xbox One, Xbox Series, Switch, Switch 2, Vision OS, Meta Quest.
- **Pricing.** Free up to 5,000 Peak Concurrent Users (PCUs).
- **Used by.** Fortnite, PUBG, League of Legends, many AAA titles.

### Photon Voice

- **Coverage.** Unity, Unreal Engine; integrates seamlessly with Photon networking stack.
- **Capabilities.** Real-time voice over PUN / Bolt / Fusion sessions; familiar API for Photon devs.
- **Pricing.** Per-CCU on Photon billing.

### Discord SDK / Embedded App Integration

- **Coverage.** Discord-integrated voice in-game; allows players to invite Discord friends, talk via the existing Discord voice channel.
- **Capabilities.** Activity Status (game name / current state in Discord), Rich Presence, voice / video / screen-share embedded.
- **Used by.** Many indie titles integrating with already-active Discord communities.

### Steam Voice (Steamworks-bundled)

- **Coverage.** Steam-only titles; Windows / macOS / Linux.
- **Capabilities.** Voice via Steam Friends + game lobbies; free with Steamworks publishing.

### Accessibility Considerations

- **Push-to-talk vs voice activation.** Both modes mandatory for accessibility (some players cannot maintain voice activation due to physical conditions).
- **Voice-to-text transcription.** Increasingly required (Xbox Game Pass certification, EAA, CVAA in US).
- **Real-time moderation.** AI moderation services (Vivox Player Safety, Modulate ToxMod) flag harassment, hate speech for human review.

## Networking Libraries / SDKs

The market landscape for game multiplayer SDKs in 2026.

### Photon Engine

- **Products.** Photon Quantum (deterministic, ECS-based), Photon Bolt (legacy), Photon Fusion (current general-purpose).
- **Pricing.** Per-CCU tiered subscription.
- **Strengths.** Bandwidth-efficient — Photon Fusion's bandwidth usage is 6x smaller than NGO or Mirror. Optimized to consume less CPU on the server. Includes lag compensation, rollback, prediction, deterministic state syncing options.
- **Best for.** Unity-first studios needing scalable multiplayer with proven CCU handling.

### Mirror (Unity, Open Source)

- **Pricing.** Free / open source.
- **Strengths.** Full control over codebase (community-driven, customisable). No CCU limits unlike Photon. Strong indie + custom-server community.
- **Weaknesses.** Steeper learning curve; no managed CCU billing.
- **Best for.** Indie / custom server projects where engineering bandwidth is available.

### Unity Netcode for GameObjects (NGO)

- **Status.** Official Unity multiplayer solution; replaces UNet (deprecated). Free with Unity.
- **Capabilities.** Server-authoritative gameplay, Unity-native integration with prefab + scene system.
- **Best for.** Small-to-mid Unity-native co-op games (2-10 players). Unity tutorials default to NGO.

### Unreal Engine Replication (built-in)

- **Status.** Built into Unreal Engine; replicates Actors, Components, and Properties automatically.
- **Capabilities.** Industry-grade. Dedicated server build target. Powers most AAA Unreal multiplayer titles.
- **Best for.** Any Unreal project — no reason to use anything else as primary multiplayer.

### Steam Networking Sockets (ISteamNetworkingSockets)

- **Owner.** Valve, free with Steamworks publishing.
- **Capabilities.** P2P + Steam Datagram Relay (SDR) NAT traversal; always relays without exposing IPs; UDP fallback on success.
- **Modern API.** ISteamNetworkingSockets and ISteamNetworkingMessages (older ISteamNetworking deprecated).
- **Best for.** Steam-exclusive titles wanting free, robust P2P with NAT punching.

### Nakama (Heroic Labs)

- **Status.** Open-source game backend (since 2015). MIT-licensed.
- **Capabilities.** Authoritative + relayed multiplayer; matchmaker; leaderboards; chat; in-game currencies; server scripts in Go / TypeScript / Lua.
- **Adoption.** Paradox, Zynga, Gram Games.
- **Best for.** Studios wanting self-hosted full-stack control without per-MAU costs.

### PlayFab (Microsoft)

- **Status.** Microsoft Azure-hosted LiveOps platform.
- **Capabilities.** Identity, inventory, leaderboards, matchmaking, multiplayer servers, A/B testing, analytics.
- **Pricing.** Free tier (10k DAU); per-MAU thereafter.
- **Best for.** Multi-discipline live-service teams already on Azure.

### Edgegap

- **Status.** Multiplayer server hosting + auto-scaling on edge infra.
- **Capabilities.** Integrates with multiple netcode libraries; spawns servers nearest the matched players (latency optimization).
- **Best for.** Studios prioritising minimum latency without managing their own region fleet.

## Performance Targets

Hardware-dependent budgets for any multiplayer game targeting competitive / responsive play.

### Tick Rate (Hz)

| Tier | Tick rate | Used by |
|---|---|---|
| Mobile competitive | 8-15 Hz | Mobile Legends, COD Mobile |
| Standard co-op | 16-30 Hz | Most co-op games |
| FPS standard | 32-64 Hz | Apex Legends, CS:GO until 2023, Overwatch baseline |
| Competitive FPS | 128 Hz | Valorant, CS:GO 128-tick servers, FACEIT |
| Sub-tick (CS2) | Variable | CS2 introduced "sub-tick" model rendering 64-tick but recording sub-tick precision |

### Packet Size Budget

- **UDP MTU (Maximum Transmission Unit).** ~1200 bytes safe budget per packet to avoid IP-level fragmentation. Larger packets fragment unreliably.
- **Typical state update.** 50-300 bytes per tick depending on game state size + delta compression effectiveness.

### Latency Budgets (RTT)

| Genre | Target RTT (p95) | Tolerance ceiling |
|---|---|---|
| Competitive FPS | < 50ms | 100ms degrades; > 150ms unplayable |
| MOBA | < 80ms | 150ms degrades |
| Battle Royale | < 100ms | 150ms degrades |
| Co-op action | < 150ms | 250ms degrades |
| MMORPG | < 200ms | 400ms degrades |
| Turn-based / async | N/A | seconds OK |

### Concurrent Players per Match

| Genre | Players |
|---|---|
| Small co-op | 2-4 |
| Squad shooter | 4-12 |
| Standard FPS / MOBA | 10 (5v5 typical: Valorant, Overwatch) |
| 16-32 (mid) | Rainbow Six, Battlefield smaller modes |
| Battle Royale | 60-150 (Apex 60, PUBG 100, Warzone 150) |
| Large-scale persistent | 200+ (MMO, MMO sandbox) |
| Sandbox MMO (cluster) | 5,000+ (EVE Online time-dilated battles) |

## Scaling Backend

How to actually run a multiplayer game at scale.

### Dedicated Server Fleet Providers

- **AWS GameLift Servers.** AWS-native game server hosting (formerly GameLift), with managed EC2 + managed container fleets. Unity plugin + CloudFormation templates. Sample integrations available.
- **Google Cloud Game Servers (legacy).** Deprecated 2023; migration path to Agones (open-source) on GKE.
- **Multiplay (Unity Gaming Services).** Hosts Among Us (post-2020 viral growth migration), Call of Duty Warzone, Apex Legends regional fleets, Hunt: Showdown, many AAA titles.
- **Pragma Engine.** Game backend platform (matchmaking + party + identity + inventory + leaderboards) — commercial offering for AAA live-service studios.
- **Edgegap.** Edge-cloud server orchestration with auto-spawning closest to matched players.
- **Hathora.** Per-room serverless game servers (similar concept).
- **i3D / Gameye.** Independent server hosting specialised in low-latency.

### Auto-Scaling

- **Pre-warmed instances.** Keep N idle servers always available; scale up on queue-depth signal.
- **Demand-based.** Scale server fleet up/down based on concurrent player count, by region.
- **Hot zones.** Concert / launch events / esports finals — manually pre-scale a region to handle the spike.

### Geographic Distribution

- **Edge regions.** Minimum: US East, US West, EU West, APAC (Japan or Singapore). Standard AAA: also EU Central (Frankfurt), South America (Sao Paulo), South Africa, Australia, Korea, China (separate vendor due to Great Firewall).
- **Region selection.** Player picks region or auto-selected by RTT measurement. Cross-region play allowed but typically penalised by latency.

### Live Ops Cost ($/CCU)

- **Indie hosted on AWS Spot Instances.** ~USD 0.005-0.02 per CCU-hour.
- **AAA AWS GameLift Managed.** USD 0.03-0.08 per CCU-hour.
- **AAA Multiplay with Unity Gaming Services.** Negotiated enterprise pricing; reportedly USD 0.03-0.10 per CCU-hour at AAA scale.
- **At scale.** A game with 50k CCU at USD 0.05/CCU-hour = USD 2,500/hour = USD 1.8M/month in raw infrastructure. Adds matchmaking, telemetry, voice = ~USD 2-3M/month in backend infra for a successful live-service.

### Cautionary Tale — Among Us 2020 Scaling Crisis

Among Us went from 500k DAU pre-Aug 2020 to 60M DAU within weeks (eventually 100M+ total downloads). The original 4-person Innersloth team's homemade server stack collapsed under load:
- Frequent disconnects + inability to join lobbies dominated player complaints for months.
- Online multiplayer originally took 2 months + a full rework to implement; Innersloth had built no scaling headroom.
- Resolution: partnership with Unity Multiplay (June 2021) replaced homemade infra; the planned "Among Us 2" sequel was cancelled and effort redirected to scaling Among Us itself.

Lesson: design backend with horizontal scaling primitives from day one, even if launch-day target is modest. The cost is small in pre-production; the cost is existential mid-viral-growth.

### Cautionary Tale — Valorant 128-Tick + Riot Direct

Valorant's architecture is the published reference for competitive netcode in 2026:
- **128-Hz tick rate** server-authoritative simulation, fixed timestep regardless of client framerate.
- **< 35ms baseline target latency** for most players, achieved via:
  - "Riot Direct" — Riot's own private ISP-grade backbone, peering with last-mile ISPs.
  - Regional servers everywhere (NA, EU, KR, JP, BR, LATAM, MENA, AU, SEA).
  - Bandwidth provisioning at peering edges to minimise contention.
- **Peeker's advantage reduction** by ~40ms (28% baseline reduction) due to combined tick rate + latency investment.

This is the gold standard. Most competitive titles target a fraction of this investment, accepting higher peeker's advantage in exchange for lower infra cost.

## Sources

- [Photon Fusion (current Photon multiplayer for Unity)](https://www.photonengine.com/fusion)
- [Photon vs NGO vs Mirror comparison — Code Monkey](https://unitycodemonkey.com/question.php?q=how-does-unity-netcode-for-gameobjects-compare-to-other-multiplayer-solutions-like-photon-fusion-normcore-or-mirror)
- [Mirror open-source Unity networking on GitHub](https://github.com/MirrorNetworking/Mirror)
- [Unity Netcode for GameObjects (NGO) docs](https://docs-multiplayer.unity3d.com/netcode/current/about/)
- [Steam Networking & Steam Datagram Relay](https://partner.steamgames.com/doc/features/multiplayer/networking)
- [Steam Datagram Relay (SDR) — Steamworks docs](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay)
- [Nakama open-source game backend — Heroic Labs](https://heroiclabs.com/nakama/)
- [PlayFab LiveOps platform — Microsoft](https://playfab.com/liveops/)
- [Amazon GameLift Servers — AWS](https://aws.amazon.com/gamelift/)
- [Edgegap edge multiplayer hosting](https://edgegap.com/)
- [Valorant 128-tick server architecture — Riot Tech blog](https://technology.riotgames.com/news/valorants-128-tick-servers)
- [Peeking into Valorant's Netcode — Riot Tech blog](https://technology.riotgames.com/news/peeking-valorants-netcode)
- [Valorant backend deep-dive — Edgegap analysis](https://edgegap.com/blog/game-backend-deep-dive-valorant-riot-games)
- [GGPO rollback netcode (Tony Cannon)](https://www.ggpo.net/)
- [GGPO Wikipedia (rollback history)](https://en.wikipedia.org/wiki/GGPO)
- [Vivox in-game voice — Unity Multiplayer Services](https://unity.com/products/vivox)
- [Photon Voice — Photon Engine](https://www.photonengine.com/voice)
- [TrueSkill Ranking System — Microsoft Research](https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/)
- [Among Us scaling crisis — Innersloth devlog Sept 2020](https://innersloth.itch.io/among-us/devlog/61029/server-issues-and-a-new-update)
- [Among Us / Unity Multiplay partnership case study](https://unity.com/case-study/innersloth-among-us)
