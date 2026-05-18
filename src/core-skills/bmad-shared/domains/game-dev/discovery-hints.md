# Domain Sub-File: Discovery Hints

**Parent:** `domains/game-dev.md`
**Scope:** Discovery prompts surfaced by `bmad-create-story` (step-02d), `bmad-create-prd` (step-02-discovery), `bmad-quick-dev`, and other workflows when `project_type: game` is active. Combines generic cross-genre questions, 14 genre-specific question sets, scope-aware (indie / AA / AAA) differentials, and the canonical conceptual triad — Core Verbs / Core Loop / Compulsion Loop.
**Source pin:** GDC postmortems + canonical references (Steve Swink, Mark Brown, Daniel Cook, Csikszentmihalyi). All citations preserved from the original sources; no copied text beyond minimal quotation.

---

## Generic Game Discovery

Surface these 6-8 questions on every game-dev story or PRD pass. They are platform/genre-agnostic and shape every downstream decision.

1. **Engine.** Which engine? (Unity / Unreal / Godot / Phaser / Bevy / Stride / Cocos Creator / custom). If "custom", which language + render API (Vulkan / Metal / DX12 / WebGPU)?
2. **Core loop.** What does the player do *repeatedly* in 30 seconds? In 5 minutes? In a 30-minute session? (Three nested time horizons — see §"Core Verbs / Core Loop / Compulsion Loop".)
3. **Performance budget.** Hot-path frame rate target? (60 FPS hot path / 30 FPS mobile minimum / 90 FPS VR / 120 FPS competitive). Which is the BINDING constraint for this story?
4. **Ship target.** Which platforms target ship? (PC / PS5 / PS5 Pro / Xbox Series X / Xbox Series S / Switch 2 / Steam Deck / iOS / Android / Quest 3 / Web / multi-select). Which is the **lowest-spec** target? That sets the budget ceiling.
5. **Online posture.** None / async / co-op / realtime PvP / MMO? Each tier multiplies infra + anti-cheat + scope by ~10×.
6. **Monetisation model.** Premium (one-time purchase) / F2P with IAP / F2P with battle pass / subscription / advertising / hybrid. Drives Live Ops + analytics scope from Day 1.
7. **Audience age.** Targeting under-13? COPPA + platform kids-mode rules apply. Targeting 13-17? Different ad / data restrictions. Adult? Wider monetisation latitude.
8. **Live-service vs ship-and-done.** If live-service: what's the post-ship cadence? Season length? Event frequency? Patch pipeline?

---

## Genre-Specific Discovery

14 sub-sections, one per primary genre. Pick the genre that *most* applies and surface its questions; for hybrids, combine question sets and flag the hybrid explicitly in the spec.

### FPS (First-Person Shooter)

1. Single-player campaign / co-op / competitive multiplayer / battle royale variant?
2. Hit-scan or projectile weapons? Mix? (Determines anti-cheat surface area — hit-scan is easier to verify server-side.)
3. Movement style: arena (Doom-fast) / mil-sim (Tarkov-slow) / hero-shooter (Overwatch-class) / extraction (DMZ)?
4. Tick rate target for multiplayer? (8 / 16 / 64 / 128 Hz — see `nfr-baselines.md` §Network NFR.)
5. Aim assist policy on controller? Cross-play parity expectations?
6. Damage model — health bars / one-shot / armour layers / limb-specific?
7. Reload / weapon-swap / interaction animation budget (key game-feel surface).
8. ADS (aim-down-sights) zoom / scope rendering style — picture-in-picture vs full-screen?
9. Pacing: round-based (5-15 min rounds) vs match-based (45-60 min matches) vs continuous-world (no rounds)?

### RPG (Role-Playing Game)

1. Open-world / linear / hub-and-spoke / nonlinear-quest?
2. Class system / skill trees / hybrid / classless? (Determines build-variety + late-game viability.)
3. Combat tempo: real-time (Witcher) / real-time-with-pause (Pillars) / turn-based (Persona) / hybrid (FF7 Remake)?
4. Dialogue branching depth: cosmetic-only / branch-of-2 / fully branching / web of choices with state-flags?
5. Save system: slot-based / auto-checkpoint / single-save permadeath?
6. Inventory pattern: grid-Tetris (Resident Evil 4 style) / weight-based / unlimited-slot / equipment-only?
7. Crafting yes/no? If yes — recipe-discovery / blueprint-purchase / experimentation-driven?
8. Quest log structure: linear chapters / map markers / "investigation" (no markers, deduce from text) / hybrid?
9. Romance / companion mechanics? (Saves + state-tracking complexity.)
10. NG+ (New Game Plus) — affects post-launch retention loop design?

### RTS (Real-Time Strategy)

1. Base-building / unit-control balance? Pure base-building (Anno) / pure unit-control (CoH) / hybrid (StarCraft)?
2. Economy: resource-types / harvesting-mechanics / supply caps?
3. Tech tree: linear / branching / mutually-exclusive sub-trees?
4. Fog-of-war and recon mechanics?
5. APM ceiling — designed-for-pro (StarCraft) or designed-for-relaxation (They Are Billions)?
6. Co-op / 1v1 / team / FFA / asymmetric scenarios?
7. Replay system: deterministic-input-record (preferred for esports) or video-only?
8. Map-pool strategy — fixed competitive set or procedural?

### Platformer

1. 2D / 2.5D / 3D? Side-scrolling / vertical / multi-axis?
2. Tight movement (Celeste — pixel-perfect) / floaty (Mario — generous coyote-time) / momentum-driven (Sonic)?
3. Death model — full-restart / checkpoint-restart / instant-respawn?
4. Collectibles: 100% completion incentive yes/no? (Drives level-replay scope.)
5. Power-ups / persistent abilities / Metroidvania interconnection?
6. Speedrun friendliness as design pillar? (Affects level-geometry decisions — no invisible walls, generous boundaries.)
7. Input-buffer windows for stunts / combos / chains?

### Roguelike / Roguelite

1. Run length target — 20 min (Slay the Spire) / 30-60 min (Hades) / 90+ min (Dead Cells / FTL)?
2. Permadeath strictness — full reset / meta-progression / partial inventory carry-over?
3. Procedural generation: room-templates with random connectors (Spelunky / Hades) / full-procgen / hand-crafted-with-shuffled-decoration?
4. Build variety target — how many distinct viable builds at end-state?
5. Run-to-run narrative — Hades-style (relationship progression on death) or pure-mechanical (no narrative loop)?
6. Difficulty scaling — single-track (one curve) or branching (Ascensions / Heat levels)?
7. Daily-challenge mode planned?

### MOBA (Multiplayer Online Battle Arena)

1. Match length target (typically 25-45 min)?
2. Hero / champion roster size at launch?
3. Map style — three-lane Dota/LoL classic / single-lane / four-lane?
4. Last-hit mechanics or auto-collect on minion kills?
5. Item-shop economy — full-build / categorical / themed-loadout?
6. Esports tier ambition? (Drives netcode investment, anti-cheat depth, observer mode, replay system.)
7. Casual mode separate from ranked?

### MMO (Massively Multiplayer Online)

1. Server topology — shard / sharded-by-region / megaserver / instanced-with-megaserver-hub?
2. Concurrent users per shard target?
3. Quest model — solo-friendly / group-required / raid-required?
4. PvP — none / opt-in / open-world / dedicated-PvP-server?
5. Trade / economy — player-driven / NPC-vendor-anchored / auction-house?
6. Subscription / B2P / F2P / hybrid?
7. Anti-bot / anti-RMT (real-money-trading) strategy?
8. Content-cadence target — weekly / monthly / quarterly major patches?

### Sandbox / Survival

1. World — procedurally-generated / hand-crafted / hybrid?
2. Permadeath / soft-death / no-death?
3. Crafting depth — recipe-discovery / blueprint-based / freeform-combinatorial?
4. Base-building support — yes/no? Multi-floor structures? Power systems?
5. NPC vs AI-creature balance — wildlife / hostile factions / both?
6. Hunger / thirst / temperature simulation?
7. Multiplayer — solo-only / co-op / private-server / dedicated-server / persistent-world?

### Puzzle

1. Static-puzzle (Sokoban) / physics-puzzle (Angry Birds) / logic-puzzle (Picross) / narrative-puzzle (Return of the Obra Dinn)?
2. Per-puzzle solve-time target — under 5 min (mobile) / 5-15 min (desktop) / 30+ min (Antichamber-class)?
3. Hint system — none / per-puzzle / progressive / video-walkthrough?
4. Failure model — retry-only / undo-stack / branching-state-machine?
5. Procedural or fully-hand-authored puzzles?
6. Daily-puzzle mode (NYT-style)?

### Simulation (City-builder / Tycoon / Vehicle-sim / Life-sim)

1. What simulation system is the centrepiece? (Economy / traffic / vehicle physics / social network / industrial chain.)
2. Real-time / pausable / turn-based?
3. Time scale (1 in-game minute = 1 real-world second? hour? Year?)?
4. Mod support — first-class / via Steam Workshop / sandbox-only / none?
5. End-state — open-ended / win-condition / scenarios?
6. UI density — high-info-density (Dwarf Fortress / Anno) vs streamlined (Mini Metro)?

### Battle Royale

1. Player count per match (60 / 100 / 150)?
2. Match length target (20-30 min standard)?
3. Loot density and weapon-tier system?
4. Storm / circle / shrink mechanism?
5. Squad-modes (solo / duo / trio / quad) all from launch or staggered?
6. Tick rate (60-128 Hz standard for competitive BR)?
7. Cross-play and platform-parity strategy?
8. Anti-cheat — kernel-level required for esports tier?

### Fighting

1. 2D plane / 3D plane / 2.5D / 3D arena (Soulcalibur)?
2. Roster size at launch (16-24 typical)?
3. Frame-data exposure — visible in training mode / community-derived / hidden?
4. Combo system depth — chained / linked / cancelled / dial-a-combo?
5. **Rollback netcode required** (industry baseline for competitive fighters — GGPO-class). Delay-based netcode is no longer competitive.
6. Training-mode features — frame-by-frame, hitbox display, recordings playback?
7. Esports tier ambition?
8. Casual modes (story / arcade / online-novice ladder)?

### Racing

1. Arcade / sim / sim-cade balance?
2. Track count at launch and DLC cadence?
3. Vehicle roster — licensed cars (license cost) / original IP only?
4. Online multiplayer with rollback or interpolation netcode?
5. Damage model — cosmetic / functional / both?
6. Career mode structure — championship-based / season-based / open-progression?
7. Cross-play and input-parity (wheel vs gamepad balance)?

### Survival Horror

1. Combat or no-combat (Outlast vs Resident Evil split)?
2. Save-anywhere or save-room-only?
3. Inventory-Tetris (RE4 style) — yes / no?
4. Resource scarcity tuning (ammo, health items, save tokens)?
5. Save-corruption / "this enemy doesn't exist anymore" tension mechanics?
6. Multiplayer / asymmetric (Dead by Daylight class)?
7. PSVR2 / Quest 3 VR target?

---

## Scope-aware Discovery (Indie vs AA vs AAA)

Differential questions to surface based on team-size and budget profile. Use the scope category that best matches the project.

### Indie (1-10 person team)

1. What's the smallest playable thing that proves this works? Aim for that, not the full feature.
2. Can this scope ship in 12-18 months? If not, what's the explicit cut list?
3. Single-platform first, or simultaneous? Single-platform-first reduces port + cert burden by ~3-5×.
4. Engine cost: free engines (Godot / Bevy / Phaser) vs royalty engines (Unreal — 5% after $1M, 3.5% on Epic Store)?
5. Marketing: built-in (Steam Next Fest, demo, wishlist farming) vs paid? Wishlists at Steam launch are the single best leading indicator.
6. Open source / asset-store reliance — credits, licensing audit done?
7. Post-launch plan — patches only / DLC / live-ops / sequel-focus?

### AA (10-50 person studio, $1-20M budget)

1. Multi-platform strategy from Day 1 or staggered? Cert costs $X per platform per submission.
2. Console QA + cert lead-time built into schedule (6-12 weeks typical)?
3. Localisation tier — text-only / text+VO / full-localisation for top 5-10 languages?
4. Performance budgets per platform written down BEFORE alpha?
5. Live-service ambition realistic for team size, or pure ship-and-done?
6. External co-dev — porting / VO / cinematics / animation — identified for the spec?
7. Publisher relationship — first-party / self-publish / regional partner?

### AAA (50+ person studio, $20M+ budget)

1. Multi-engine? (Some AAA studios use proprietary engines + UE for specific titles + Unity for mobile spin-offs.)
2. World-class proprietary tech — when does R&D fork from production?
3. Mocap / VO union rules (SAG-AFTRA for US-based talent) — schedule impact?
4. Crunch-avoidance + sustainable-pace commitments — written into PRD?
5. Marketing budget — typical AAA matches dev budget; affects "ship date locked" pressure on QA.
6. Day 1 patch policy — what fixes get cut from gold vs landed in Day-1?
7. Post-launch roadmap — 12-month / 24-month / live-service-indefinite?
8. Sequel / IP-pipeline plan — affects what tech / tools should be reusable.

---

## Core Verbs / Core Loop / Compulsion Loop

Conceptual framework. Surface in PRD discovery (step-02) and revisit during every Phase 3 spec when the story touches gameplay design.

### Core Verbs

The set of *atomic actions* the player can perform with their input. Examples: "move" (Mario) / "jump" / "shoot" / "pick-up" / "talk" / "place-block" (Minecraft). A canonical exercise: list every core verb in 30 seconds — if you can't enumerate them, your game design is not yet crisp.

**Reference:** Steve Swink's *Game Feel* breaks down each verb into 6 dimensions — Input, Response, Context, Polish, Metaphor, Rules. Mark Brown's *Game Maker's Toolkit* YouTube series translates Swink's framework into working-designer language. <https://www.routledge.com/Game-Feel-A-Game-Designers-Guide-to-Virtual-Sensation/Swink/p/book/9780123743282>

### Core Loop

What the player does **repeatedly** over a short time horizon. Daniel Cook (Lost Garden) describes the loop as: *player has mental model → acts → world responds → player updates mental model → loop*. Simple games have multiple nested loops at different time-scales (30 seconds / 5 minutes / 30 minutes / a session).

**Reference:** Daniel Cook, *Loops and Arcs* (Lostgarden, 2012). <https://lostgarden.com/2012/04/30/loops-and-arcs/>

### Compulsion Loop

The **neurochemical** layer below the core loop — habit-forming, dopamine-mediated, reward-scheduled. Slot-machine loops are pure compulsion loops without meaning; well-designed games pair compulsion loops with meaningful agency.

**Reference:** GameAnalytics — *What Is The Compulsion Loop?* <https://www.gameanalytics.com/blog/the-compulsion-loop-explained>. Csikszentmihalyi's *Flow* describes the **constructive** version of the same psychology — challenge-skill balance, clear goals, immediate feedback. Ethical design pairs flow + meaningful progression, NOT pure compulsion. <https://yukaichou.com/gamification-analysis/flow-theory-complete-guide-csikszentmihalyi-optimal-experience/>

### Discovery prompts (use during PRD)

- Can you name the **3-5 core verbs** in one breath? If not, design is too diffuse.
- Walk me through the **30-second loop**. The **5-minute loop**. The **session-long loop**.
- Where are the **rewards** in each loop? Are they fixed-interval or variable-ratio (the latter is more dopamine-active — and more habit-forming)?
- Are you designing for **flow** (skill-challenge mastery) or **compulsion** (reward-driven repetition)? Both are valid, but be intentional.
- What's the **failure state** of each loop, and does failure feel fair or punishing?

---

## Vertical Slice vs GDD vs Design Pillars

Conceptual triad. Each serves a distinct purpose; conflating them leads to underspecified docs and bloated scope.

### Design Pillars

3-5 short phrases that encapsulate the game's core identity. Each pillar is a tie-breaker for every downstream decision. Example pillars for Hades: "Combat is the message" / "Story is told through every run, not despite them" / "Polish over scope".

- **Format:** 3-5 phrases / one-liners / single words. NOT paragraphs.
- **Authored:** Pre-production, by the design lead. Frozen by start of vertical slice.
- **Tested:** "If we cut this feature, does it violate a pillar? If we add this feature, does it serve a pillar?"
- **When to use:** Every scope discussion. Every "is this a good idea?" debate ends with "which pillar does it serve?"

### Game Design Document (GDD)

The reference manual — mechanics, systems, controls, characters, story, art direction, audio direction. Living document that evolves through development.

- **Format:** Free-form long doc, often 50-200 pages. Modern GDDs are often wikis / Notion / Confluence rather than monolithic PDFs.
- **Authored:** Concept phase → preproduction → keeps evolving.
- **When to use:** Reference for any team member implementing a system; onboarding doc for new hires; cross-team alignment.
- **Anti-pattern:** Treating the GDD as set-in-stone after pre-prod. Game design is iterative; the GDD must reflect what you've *learned*, not just what you *intended*.

### Vertical Slice

A small, fully-polished playable section that demonstrates the game's *quality bar* — not its full *scope*. Single level / single encounter / single 5-15-minute experience, at *near-shippable* polish.

- **Format:** Playable build. Often 10-30 minutes of gameplay. Polished art, polished audio, polished mechanics.
- **Authored:** End of pre-production / start of production.
- **Tested:** Investor demos, publisher pitches, internal "do we have the game?" alignment, marketing teaser source material.
- **When to use:** Prove the team can deliver the envisioned quality before scaling content. Calibrate scope: "if this 30 minutes took 4 months, can we ship 20 hours in 18 months?"

### How they interact

- **Design Pillars** describe *what you're aiming for* in 3-5 phrases.
- **GDD** describes *how the game works* in full detail.
- **Vertical Slice** proves *you can build it* at the intended quality.

A common failure mode is to write the GDD before the pillars are clear — you end up with 200 pages of mechanics with no unifying vision. Pillars first, then GDD, then vertical slice.

**References:**

- Max Pears, *Design Pillars — The Core of Your Game* (Gamasutra/Game Developer). <https://www.gamasutra.com/blogs/MaxPears/20171012/307469/Design_Pillars__The_Core_of_Your_Game.php>
- HacknPlan — *Understanding Vertical Slicing*. <https://hacknplan.com/understanding-vertical-slicing/>
- Mehendysis Game Dev Doc — *Design Pillars*. <https://mehendysis.github.io/GameDevelopment/GDD/game-design-direction/design-pillars/>

---

## Sources

### Game-feel + core-loop framework

- Steve Swink, *Game Feel* — <https://www.routledge.com/Game-Feel-A-Game-Designers-Guide-to-Virtual-Sensation/Swink/p/book/9780123743282>
- Game Feel chapter 1 (open-access PDF) — <http://mycours.es/gamedesign2014/files/2014/10/Game-Feel-Steve-Swink-chapter-1.pdf>
- Daniel Cook, *Loops and Arcs* (Lostgarden) — <https://lostgarden.com/2012/04/30/loops-and-arcs/>
- *What Is The Compulsion Loop?* (GameAnalytics) — <https://www.gameanalytics.com/blog/the-compulsion-loop-explained>
- *What's the difference between a core loop and a compulsion loop?* (Medium) — <https://medium.com/@DanlWebster/whats-the-difference-between-a-core-loop-and-a-compulsion-loop-f02d20479cc7>
- Csikszentmihalyi *Flow* summary (Yu-kai Chou) — <https://yukaichou.com/gamification-analysis/flow-theory-complete-guide-csikszentmihalyi-optimal-experience/>

### GDC postmortems referenced

- *Slay the Spire: Metrics Driven Design and Balance* — <https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics>
- *Slay the Spire: Success through Marketability* — <https://www.gdcvault.com/play/1025667/-Slay-the-Spire-Success>
- *Hades* — Supergiant narrative + perpetual death — <https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death>
- *Hades* — accidentally inventing a subgenre — <https://www.gamedeveloper.com/design/hades-devs-say-accidentally-inventing-a-subgenre-was-surreal->
- *Spelunky* HD postmortem (Derek Yu / Andy Hull, GDC 2011) — <https://www.youtube.com/watch?v=RiDy6CgBKqs>
- *Spelunky 2* — One More Run (GDC Indie Summit) — <https://www.gdcvault.com/play/1027187/Independent-Games-Summit-One-More>
- *Spelunky* procedural-design retrospective (Game Developer) — <https://www.gamedeveloper.com/design/how-i-spelunky-i-got-its-procedural-hook-actually-got-finished>

<!-- TODO verify: Celeste GDC postmortem on tight-platforming was widely cited in 2018-2019 but the GDC Vault URL was not surfaced cleanly in May 2026 search; cite the YouTube secondary sources or omit the Celeste-specific section from claims that require a primary GDC URL. -->

### Design pillars + vertical slice

- Max Pears, *Design Pillars — The Core of Your Game* — <https://www.gamasutra.com/blogs/MaxPears/20171012/307469/Design_Pillars__The_Core_of_Your_Game.php>
- HacknPlan — *Understanding Vertical Slicing* — <https://hacknplan.com/understanding-vertical-slicing/>
- Mehendysis Game Dev Doc — *Design Pillars* — <https://mehendysis.github.io/GameDevelopment/GDD/game-design-direction/design-pillars/>
- *6 pillars of game development: a beginner's guide* (Educative) — <https://www.educative.io/blog/pillars-of-game-development-beginners-guide>

### Genre references

- Wikipedia — List of video game genres — <https://en.wikipedia.org/wiki/List_of_video_game_genres>
- Wikipedia — MOBA — <https://en.wikipedia.org/wiki/Multiplayer_online_battle_arena>
- Wikipedia — Roguelike — <https://en.wikipedia.org/wiki/Roguelike>
- MOBA / RTS / FPS esports genre guide — <https://thesmartwallet.com/moba-fps-rts-and-more-a-guide-to-esports-genres/?articleid=15988>

### Rollback netcode (fighters)

- GGPO official — <https://www.ggpo.net/>
- GGPO Wikipedia — <https://en.wikipedia.org/wiki/GGPO>
- *Netcode Architectures Part 2: Rollback* (SnapNet) — <https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/>
