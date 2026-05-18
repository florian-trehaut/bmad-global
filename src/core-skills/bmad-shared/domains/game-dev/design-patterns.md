# Domain Sub-File: Design Patterns

**Parent:** `domains/game-dev.md`
**Scope:** Canonical game-design patterns covering game feel, onboarding (FTUE), retention loops, flow state, compulsion mechanics, novelty curves, risk/reward balance, narrative patterns, and onboarding anti-patterns. References Steve Swink's *Game Feel*, Csikszentmihalyi's *Flow*, GDC talks, and published postmortems. Verified May 2026. Anti-patterns explicitly labelled.

Sub-file ordering follows the natural design lifecycle: feel → first contact → engagement loops → progression depth → narrative → anti-patterns to avoid.

---

## Game Feel ("Juiciness")

The tactile, moment-to-moment satisfaction of input → response in a game. Canonical reference: **Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation*** (Morgan Kaufmann, 2008).

### Real-time response

- **Input → action ≤ 16 ms** target (1 frame at 60 FPS). Visible lag corrupts the feel of "I did this".
- Touch latency on mobile is harder — typical mobile touch-to-photon latency is 50-100 ms; design must compensate with anticipation (e.g., button-pressed animation starts at touch, before mechanic resolves).
- VR specifically: **motion-to-photon latency target ≤ 20 ms**, anything above induces motion sickness.

### Screen shake

- On significant hits, large actions, explosions. **Cheapest single feel improvement** per Jan Willem Nijman's GDC 2013 talk "The Art of Screenshake" (Vlambeer / *Nuclear Throne*).
- Amplitude calibration matters — too much shake fatigues; too little has no impact. Tune per-hit-class, not per-game.

### Particle effects

- Layered, abundant, disposable. Hit sparks, dust kick-ups, casing ejection.
- Each individual particle short-lived (≤ 0.5s). Persistence creates visual clutter.
- Trade-off: mobile GPU budget — typical mobile mid-tier device particle budget ~500-1000 concurrent.

### Sound layering

- **Pitch variation** ± 5-10% on every sample to mask repetition (gunshot, footstep, hit sound).
- **Layered samples** — base hit + impact transient + tail decay; mixed live.
- **Frequency separation** — bass effects, mid impact, high sparkle. Each layer occupies a different EQ band.

### Animation principles

- **Anticipation**: micro wind-up before action (sword raises before swing).
- **Follow-through**: motion continues briefly after action ends (sword arc continues 0.1s past hit).
- These are Disney's 12 principles of animation, ported wholesale into game feel.

### Camera moves

- **Zoom-in on critical moments**: boss telegraphs, final-blow slow-mo.
- **Follow smoothing** with deadzone — camera moves with player but allows local exploration without re-centering.
- **Counter-shake**: camera nudge in opposite direction of player movement to amplify perceived speed.

### Tweening

- **Ease-out** for natural feel — fast start, slow finish. Linear motion feels robotic.
- Bounce / elastic curves on rewards (loot pop, level-up notification).

### Reference talks

- Jan Willem Nijman (Vlambeer), "The Art of Screenshake" — INDIGO Classes 2013. Most cited GDC-adjacent talk on feel.
- Martin Jonasson + Petri Purho, "Juice It or Lose It" — Develop 2012. Original "juiciness" coinage.

---

## FTUE (First Time User Experience)

The first session is the conversion bottleneck. Mobile D1 retention 26-28% (top 25% of games, per GameAnalytics 2024) — meaning 70%+ of new users churn before day 2. FTUE quality directly drives D1.

### Hook within 30 seconds

- **Core gameplay verb in first minute**. Players must do the thing your game is about, not watch cutscenes about it.
- Reference: **Hades** starts combat 90 seconds in (after a Zagreus monologue). **Slay the Spire** is immediately in combat after a 1-screen intro. **Stardew Valley** delays a couple of in-game minutes but front-loads narrative hook.

### Diegetic tutorials

- **Tutorial embedded in story / mechanics**, not "press X to jump" modal popups.
- **Half-Life 2**'s training is the gameplay (gravity gun introduced via puzzle, not tutorial).
- **Portal**'s training is the gameplay (sequential test chambers that ARE the tutorial).

### Tutorial completion target

- **>80% of first-time users should complete the tutorial**. Lower = FTUE is broken (too long, too friction, too unclear).
- Track funnel: each tutorial step has a completion rate. Find the cliff.

### No early friction

- **Skip account creation** until necessary (after first reward / engagement). Defer email, defer phone, defer subscription pitch.
- **Sign-up walls before play** drop D1 retention by 10-30% empirically.
- Apple sign-in / Google sign-in / "Continue as guest" are the conventional minimum-friction options.

### Compulsion peak at first-session-end

- End first session with **cliffhanger / unlocked reward / next-session bait**.
- Hades unlocks weapons. Slay the Spire unlocks the next ascension level. Genshin unlocks the next world quest.
- The "tomorrow hook" determines D1 retention more than session-end satisfaction in isolation.

### Reference postmortems

- **Hades** onboarding — Greg Kasavin (Supergiant) interviews discuss compulsion peak design.
- **Slay the Spire** first run — Mega Crit talks emphasise immediate combat exposure.
- **Stardew Valley** intro — Eric Barone (ConcernedApe) prioritised story hook in opening 10 minutes.

---

## Retention Loops

### Daily login

- **Streak-based rewards** in a **7-day cycle**. Day 7 reward typically jumps to high-tier (cosmetic, premium currency drop).
- Streak break: **gracious** (Genshin doesn't reset on miss), **harsh** (some mobile titles reset to day 1 — declining practice).
- Daily login bait: **1 currency drop, 1 stamina refresh, 1 "click to claim" interaction** is enough — 30 seconds of in-game time.

### Compulsion loop

- The 4-stroke engine of engagement design:
  ```
  action → reward → progression visible → next action
  ```
- **Variable reward schedule** (Skinner box) creates the most engagement, ethically grey:
  - Fixed ratio: every Nth action rewards. Predictable.
  - Variable ratio: average N actions per reward, with randomness. Slot-machine pattern.
  - Variable interval: time-based randomness. Notification drives return.

### Social loop

- **Guilds / clans / friends list boost retention 2-3x** vs solo players in F2P MMOs (industry rule).
- Mechanisms: guild quests, guild chat, friend invites, async PvP leaderboards.
- The defensive value: leaving the game means losing the social network — hardest churn to recover from.

### Achievement loop

- **Visible progress + completion satisfaction**. Each achievement unlocks a tiny dopamine pulse.
- Steam achievements, PlayStation trophies, in-game badge collections.
- Anti-pattern: 100% completion lists that include grind achievements (kill 10,000 X) — adds workload, not satisfaction.

### Collection loop

- **Pokemon-style** collection drives long-tail engagement. Genshin character roster, Honkai Star Rail, Marvel Snap card collection.
- Strong synergy with gacha — chase mechanic for missing collectible items.

---

## Flow State (Csikszentmihalyi)

Mihály Csikszentmihalyi's **Flow Theory** — optimal experience as the narrow channel between **anxiety** (challenge > skill) and **boredom** (skill > challenge). Originally psychology (1975, *Beyond Boredom and Anxiety*; 1990 *Flow: The Psychology of Optimal Experience*), adopted by game design via Jenova Chen's MFA thesis (2006) and *flOw* the game.

### Flow conditions

- **Clear goals** — player always knows what to do next.
- **Immediate feedback** — actions resolve visibly within 1 frame.
- **Challenge ≈ skill** — slight skill stretch, neither trivial nor punishing.
- **Sense of control** — perceived agency over outcome.
- **Loss of self-consciousness** — absorption in the activity.
- **Time distortion** — sessions feel shorter than wall-clock.

### Difficulty curve

- **Match curve to expected skill growth**. Early game: trivial baseline, teach mechanics one at a time. Mid game: layered challenges. Late game: mastery tests.
- Stair-step pattern (each new task begins easier than the prior task's end) is the common shape — softens fatigue while net-rising.

### Dynamic difficulty adjustment (DDA)

- **Controversial** — players who detect DDA report frustration ("the game cheated for me").
- **Subtle DDA**: enemy spawn density, ammo drop rates, hidden hit-point fudging (Resident Evil 4 famously increased ammo drops when low). When invisible, accepted.
- **Visible DDA**: explicit difficulty sliders ("Easy / Normal / Hard"). Player-controlled, no perception risk.
- **Adaptive in Left 4 Dead's AI Director**: adjusts spawn pace and item placement based on stress detection. Reference implementation.

### Choice + consequence

- **Meaningful decisions** that change outcomes (not cosmetic branches).
- Cost is roughly N² content — branching paths multiply work.
- *Disco Elysium*, *Detroit: Become Human*, *Mass Effect* trilogy = examples of high-investment choice design.

### Goal clarity

- **Always know next objective.** Quest markers, narrative pointers, level objectives.
- Open-world risk: too many quests, paralysis. Solution: highlighted main quest + tracked optional.

### Reference

- Csikszentmihalyi, *Flow* (1990).
- Jenova Chen, "Flow in Games" (2006 MFA thesis, USC) — the canonical adaptation to game design.

---

## Compulsion Loop Patterns

Patterns that drive compulsive engagement. **Each is ethically grey to varying degrees** — used responsibly, they retain players in games they enjoy; abused, they exploit psychological vulnerability.

### Skinner box (variable reward)

- **Slot machine psychology**. Variable-ratio reward schedule = most resistant to extinction (psychology research, B.F. Skinner).
- Implemented as: loot boxes, gacha, random drops, crit chance.
- Ethical floor: published odds (legal in CN, KR, JP). Above-floor: cap spending, prevent grind-required randomness in core progression.

### Streak rewards

- Reference: **Duolingo's streak system** — daily login streak with strong loss aversion ("don't lose your 100-day streak").
- Reward escalation: small daily reward, large weekly milestone, massive monthly anniversary.

### Endowment effect

- **"Your" item creates loss aversion** stronger than gain motivation.
- "Trial cosmetic for 24 hours" → "buy now to keep" leverages this.
- "Limited-time skin in your inventory, leaves at end of season" — keep mechanic uses endowment.

### Goal proximity

- **Progress bars 80% full = peak motivation**. (Behavioural economics research, Kivetz et al.)
- Front-load progress bar with bonus on opening (Subway loyalty card pre-stamped 2 of 10). Implementation: starter pack gives instant 20% level-up.

---

## Novelty Curve

The arc of player experience over the natural lifecycle of a single playthrough or live-service tenure.

### Week 1: honeymoon

- Exploration, discovery, all systems new.
- Engagement at peak. Tutorial coverage 60-80% of time.

### Week 2-4: reveal mid-game systems

- Crafting, progression specialisation, faction reputation, advanced combat.
- Each reveal is a new dopamine hit.
- Risk: revealing too late = boredom. Too early = overwhelm.

### Month 2-3: end-game / mastery content

- Optimisation, leaderboards, mastery challenges, hardcore mode.
- This is where casual players churn (most have left by month 2 in mid-core F2P, M30 retention 2-3%).
- Hardcore retention strategy: PvP, raid content, prestige systems.

### Month 6+: seasonal content (live-service)

- Without seasonal content, novelty exhausted by month 6 for almost all genres.
- Live-service titles must ship new content on cadence (see `live-ops.md` season cadence section).

---

## Risk / Reward Balance

### High-risk encounters

- **Asymmetric rewards** — risky path yields higher-tier loot than safe path.
- Reference: **Souls-like** approach — bonfire safe zone, lost souls on death = pulse of tension.

### Risk transparency

- **Telegraph danger before damage**. Tells (boss wind-up animations, environmental cues, audio stings).
- "Cheap deaths" = damage taken before player could react = uniformly criticised.

### Recovery options

- **Retreat / heal / safe respawn** must be available, even in punishing games.
- Dark Souls returns to last bonfire on death — punishing but consistent.
- Hades replays the run — death is content, not failure (Greg Kasavin's "death is progression" design pillar).

### Reference

- *Hades* death loop — Supergiant Games, GDC talks 2020-2021 on roguelike progression.
- *Spelunky*'s permadeath — Derek Yu, *Spelunky* (2008/2012/2020) postmortem book.

---

## Narrative Patterns

### Show don't tell

- **Environment storytelling**: skeletons positioned to convey events without text.
- Reference: **Half-Life 2**'s Ravenholm, **Subnautica**'s wreck site narratives, **Dark Souls**'s placed corpses.
- Cost: rewards observant players, ignored by players who skip everything. Trade-off accepted.

### Player agency

- **Choices that matter** vs **illusion of choice**.
- Mass Effect 1/2 → 3 → famously suffered ending-choice perception of illusion (only colour changes).
- Disco Elysium succeeds: every dialogue choice affects skill checks downstream.

### Branching depth

- **Meaningful diverging paths cost N² content** — each branch doubles the asset budget.
- Solutions: **convergent branches** (paths diverge then re-merge with state preserved). Telltale-style.
- Pure branching feasible only for short games or with truly modular systems (Disco Elysium dialogue + thought cabinet).

### Companion systems

- Reference: **Mass Effect** loyalty quests, **Persona** social links (S-Links).
- Each companion has independent arc + relationship gauge + romance / friendship branching.
- High asset cost — typical AAA RPG: 8-12 companions, 10-20 hours of unique content each.

---

## Onboarding Anti-Patterns

The five most common FTUE failures, documented from player feedback / postmortems / review aggregation.

### Tutorial wall

- **10+ minutes before gameplay begins**.
- Player has not yet committed; they evaluate "is this game fun?" before they buy the cost of learning.
- Solution: front-load gameplay verb; teach mechanics in context as needed.

### Modal overload

- **"Press X to learn..."** popup for every single mechanic, including obvious ones (pressing forward to walk).
- Solution: only modal when an action is non-obvious. Use diegetic teaching otherwise.

### Disconnected tutorial level

- Separate tutorial level / sandbox / training mode that is not the real game.
- Player learns mechanics that may not apply in real play (different geometry, different enemy density).
- Solution: tutorial IS the first level of the real game.

### Account creation gate

- **Email / phone before play**.
- Drops D1 retention by 10-30% empirically (industry rule, GDC live-ops talks).
- Solution: "Continue as Guest" or platform auth (Apple, Google, Steam) — defer email collection until after engagement.

### Force-online for offline-capable game

- Single-player game requires permanent connection ("phone home" DRM).
- Inflated 1-star reviews on Steam, refund requests.
- Examples: SimCity (2013) launch, Diablo IV initial requirements.
- Solution: offline playable, online optional for cloud save / social features.

---

## Sources

- Steve Swink, *Game Feel* book overview — <https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient>
- Jan Willem Nijman, "The Art of Screenshake" (Vlambeer, INDIGO 2013) — <https://www.youtube.com/watch?v=AJdEqssNZ-U>
- Vlambeer / Game Feel cultural overview — <https://thoughtsofathirdworldfilmmaker.wordpress.com/2016/10/15/vlambeer-game-feel-and-everything-in-between/>
- Jenova Chen, "Flow in Games" MFA thesis — <https://www.jenovachen.com/flowingames/Flow_in_games_final.pdf>
- Csikszentmihalyi flow theory applied to game design — <https://medium.com/@icodewithben/mihaly-csikszentmihalyis-flow-theory-game-design-ideas-9a06306b0fb8>
- Cognitive flow in great game design — <https://www.gamedeveloper.com/design/cognitive-flow-the-psychology-of-great-game-design>
- Mark Brown, Game Maker's Toolkit — <https://gamemakerstoolkit.com/>
- Why focusing on tomorrow brings back players (Google Play) — <https://medium.com/googleplaydev/why-focusing-on-tomorrow-brings-back-players-in-the-long-run-e57c51bd3481>
- Flow Theory in Game Design (Blood Moon Interactive) — <https://www.bloodmooninteractive.com/articles/flow-theory.html>
- Game retention design strategies (Juego Studio) — <https://www.juegostudio.com/blog/how-to-increase-user-retention-and-increase-your-games-lifetime>
