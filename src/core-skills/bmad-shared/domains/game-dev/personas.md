# Domain Sub-File: Personas

**Parent:** `domains/game-dev.md`
**Scope:** Game-development personas useful for `bmad-create-prd`, `bmad-create-story`, `bmad-party-mode`, and team-spawning workflows. Combines (a) the BMGD persona descriptors imported from upstream and (b) industry-standard roles NOT covered by BMGD that workflows should still surface in discovery / spec-writing.
**Source pin:** Upstream BMGD v0.5.0 SHA `9dcd1253` (MIT, attribution preserved) + canonical industry references (GDC talks, published books, postmortems).

---

## BMGD Personas (imported from upstream MIT-licensed module)

Descriptors for the 5 published BMGD agents. **Status** column tracks which are imported as skills in this fork vs descriptor-only. Per OOS-2 of the originating story `standalone-presets-foundation-and-game-dev-pilot.md`, only Cloud Dragonborn is imported in v1; the remaining 4 are planned for **Phase C** of the game-dev enrichment program.

| Persona | Role | Tone | Status |
|---|---|---|---|
| **Cloud Dragonborn** | Game Architect — technical architecture, engine design, infrastructure decisions | RPG-sage, 20 years shipping 30+ titles; cites Carmack / Sweeney patterns; 60 FPS philosophy | **IMPORTED** — `bmad-agent-game-architect` skill |
| **Samus Shepard** | Game Designer — gameplay loops, narrative beats, level progression | Player-empathy, design-pattern fluent (juiciness / game feel / Csikszentmihalyi flow) | Descriptor only (planned for Phase C) |
| **Indie** | Solo-dev generalist — scope discipline, MVP-first | Pragmatic, anti-feature-creep, embraces constraints | Descriptor only (planned for Phase C) |
| **Link Freeman** | QA Tester — playthrough verification, edge-case hunting | Methodical, finds the soft-locks and the speedrun glitches | Descriptor only (planned for Phase C) |
| **Paige** | Producer — scope, schedule, team coordination | Risk-aware, milestone-driven, ships | Descriptor only (planned for Phase C) |

**Invocation:**

- Cloud Dragonborn: `skill: bmad-agent-game-architect` (loads SKILL.md + customize.toml from `src/bmm-skills/3-solutioning/bmad-agent-game-architect/`).
- The 4 descriptor-only personas may be surfaced in workflow discovery prompts ("Should we engage a Producer-style scoping pass before sprint planning?") but cannot be invoked as a standalone skill until Phase C imports them.

**Note on the broader BMGD roster.** Upstream BMGD v0.5.0 also describes `Max` (Scrum Master) and `GLaDOS` (Game QA, distinct from Link Freeman); these are out of scope for this descriptor table because they overlap with BMM-default workflow roles already covered by the core BMM skills.

---

## Industry-Standard Game-Dev Roles (not covered by BMGD)

The BMGD lineup covers Architect / Designer / Solo-dev / QA / Producer at a generalist level. Real production teams break these down further. The 8 roles below are surfaced as discovery hints by `bmad-create-prd`, `bmad-create-story`, and team-spawning workflows when `project_type: game` is active. None of them are imported as skills in this fork; they are descriptors only.

### 1. Level Designer

- **Responsibilities:** Layout architecture of playable spaces (rooms, encounters, set-pieces). Pacing — alternating intensity (combat / exploration / dialogue). Difficulty curve calibration. Affordance placement (where the player sees what's available). Collaboration with combat/gameplay designers to embed mechanics in the geometry itself.
- **Typical deliverables:** Greybox / whitebox levels, pacing diagrams, encounter-density heat-maps, level-completion telemetry plans, signposting passes (where the player needs visual cues).
- **Canonical reference:** *The Level Design Book* — open-source community reference, covers preproduction → playtesting. <https://book.leveldesignbook.com/>
- **When to engage:** Concept → preproduction phases for genre-defining levels; alpha → beta for difficulty tuning.

### 2. Combat / Gameplay Designer

- **Responsibilities:** Mechanics tuning. Balance (numerical balancing of stats, damage, costs, cooldowns). "Game feel" (Steve Swink's framework: input → response → context → polish → metaphor → rules). Hit-stop, screen-shake, haptic feedback, frame-data tuning for fighting/action games. Coordinates closely with VFX + audio for impact moments.
- **Typical deliverables:** Combat design docs, frame-data tables, balance spreadsheets, prototype playtests with telemetry, "juiciness" patches.
- **Canonical reference:** Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation* (2008). <https://www.routledge.com/Game-Feel-A-Game-Designers-Guide-to-Virtual-Sensation/Swink/p/book/9780123743282> — and Mark Brown's *Game Maker's Toolkit* YouTube series on game feel for working-designer accessibility.
- **When to engage:** Vertical slice (prove the core verb feels good) → alpha (tuning) → live ops (rebalancing).

### 3. Narrative Designer

- **Responsibilities:** Branching narrative structure, dialogue scripting, cutscene direction, character voice/tone consistency, narrative-system integration with mechanics (quest logs, dialogue trees, world-state flags).
  - **Overlap with Samus Shepard (BMGD).** Samus's BMGD scope covers high-level narrative beats; the Narrative Designer role is the dedicated specialist for branching dialogue and writing-intensive RPGs / adventure games. If Samus is imported in Phase C, the Narrative Designer remains a complementary descriptor.
- **Typical deliverables:** Branching dialogue trees (`articy:draft`, `Twine`, `Yarn Spinner`, `Inky`), character bibles, scene scripts, cutscene storyboards, narrative-system integration specs.
- **Canonical reference:** GDC Vault — *Technical Tools for Authoring Branching Dialogue* <https://gdcvault.com/play/1026384/Technical-Tools-for-Authoring-Branching>. Tool comparison: <https://blog.arcweave.com/top-10-tools-for-narrative-design>.
- **When to engage:** Concept (narrative pillars) → preproduction (branching skeleton) → production (writing passes) → localisation prep.

### 4. Audio Designer / Audio Director

- **Responsibilities:** SFX design (footsteps, weapons, ambience). Music direction (linear scores, adaptive music systems, vertical layering). Spatial audio (3D positioning, occlusion, reverb zones). Voice-over direction (casting, recording, integration). Audio mix balancing across platforms.
- **Typical deliverables:** Audio design docs, Wwise / FMOD project files, music cue sheets, VO scripts, mix bus configurations, Dolby Atmos object channel maps for premium platforms.
- **Canonical reference:** GDC Audio track + Audiokinetic blog — examples include the Baldur's Gate 3 Dolby Atmos session at GDC 2024. Industry middleware: **Wwise** (dominant in AAA), **FMOD**, **MetaSounds** (Unreal-native).
- **When to engage:** Vertical slice (audio identity established early; SFX placeholders block "feel" decisions) → alpha (full content pass) → ship (mix + localisation VO).

### 5. Build Engineer / DevOps for Games

- **Responsibilities:** CI/CD pipelines spanning Editor builds + cooked builds for each target platform. Asset cooking (transforming source assets to per-platform optimised formats). Distributed build caching (Unreal DDC, Unity Accelerator). Artifact signing + store-upload automation. Performance budget enforcement in CI (frame-time regression alerts).
- **Typical deliverables:** Build pipeline configs (TeamCity, GitHub Actions, GitLab CI, Jenkins, **SpeedrunCI**), build farm topology, asset-cooking dashboards, regression-baseline tooling. Multi-platform automation often via **Unreal Automation Tool** (UE) or Unity Cloud Build.
- **Canonical reference:** *How to Manage CI/CD for Game Development* (Semaphore) <https://semaphore.io/how-to-manage-ci-cd-for-game-development-unity,-unreal,-large-binaries>. Unreal Automation Tool docs: <https://dev.epicgames.com/documentation/en-us/unreal-engine/building-multi-platform-games-in-unreal-engine>.
- **When to engage:** Preproduction (set up the build pipeline before content scales) → continuous through ship and live ops.

### 6. UX Designer (for games)

- **Responsibilities:** FTUE (First-Time User Experience) — onboarding, tutorial, first 5 minutes. Menu UX (navigation flows, controller-vs-keyboard-vs-touch parity). HUD design (information density, readability under combat stress). Accessibility (colour-blind modes, subtitles, motor accommodations, cognitive accessibility, screen-reader for menu narration). Cross-platform UI design (touch / controller / KB+mouse / TV-distance).
- **Typical deliverables:** UX wireframes, FTUE flow diagrams, accessibility audit reports against Game Accessibility Guidelines (GAG), tutorial drop-off telemetry plans, HUD readability tests at multiple screen sizes.
- **Canonical reference:** **Game Accessibility Guidelines** (free, industry-standard reference) <https://gameaccessibilityguidelines.com/full-list/>. Industry talks: GDC's *UX Summit* track.
- **When to engage:** Concept (FTUE design pillars) → preproduction (menu wireframes) → alpha (FTUE playtesting) → ship (accessibility certification for storefronts that require it).

### 7. QA / Test Automation Lead

- **Responsibilities:** Test plan authorship. Automated playtest (AI-driven test agents — Razer QA Companion-AI, WeTest, Nvidia Cloud Playtest). Replay systems (recording inputs + game state for deterministic re-execution). Performance regression detection (frame-time, memory, load-time baselines). Platform-certification compliance (TRC / TCR / Lotcheck readiness audits for Sony / Microsoft / Nintendo). Bug-tracker triage discipline.
  - **Overlap with Link Freeman (BMGD).** Link is the methodical generalist tester; the QA / Test Automation Lead is the dedicated systems / pipeline role for studios at scale.
- **Typical deliverables:** Automated test suites, replay-recording infrastructure, perf-regression CI gates, certification submission checklists, defect-density dashboards.
- **Canonical reference:** GDC Vault — *Accelerating the QA Test Cycle Via Metrics and Automation* <https://gdcvault.com/play/1011982/Accelerating-the-QA-Test-Cycle>. Industry certification: ISTQB Game Testing CT-GaMe <https://isqi.org/ISTQB-Certified-Tester-Game-Testing-CT-GaMe/CT-GaMe.82>.
- **When to engage:** Vertical slice (automation framework setup) → alpha (test coverage scales) → beta + ship (certification submissions) → live ops (regression gating).

### 8. Live Ops Manager

- **Responsibilities:** Seasonal content cadence (battle pass / season pass / event pass). Live events (limited-time modes, holiday events, collabs). Monetisation tuning (IAP placement, premium currency balancing). Player segmentation + LTV analysis. A/B testing on offers, events, retention hooks. Coordinates closely with engineering (feature flags), narrative (event story), and analytics.
- **Typical deliverables:** Season roadmaps, event briefs, monetisation models, retention dashboards, A/B test result reports, post-event retrospectives.
- **Canonical reference:** *LiveOps Strategy for Mobile Games* (Game Growth Advisor) <https://gamegrowthadvisor.com/blog/2026-03-31-liveops-strategy-mobile-games-guide/>. Sensor Tower live-ops report: <https://sensortower.com/blog/top-grossing-mobile-games-live-ops-strategies-2025-report>. GDC Vault — *Player Centric Live Ops Monetization* <https://www.gdcvault.com/play/1022202/Player-Centric-Live-Ops-Monetization>.
- **When to engage:** Pre-launch (live-ops architecture and Season 0 plan) → ship → continuous live operations.

---

## When to engage each persona

Phase-mapped index. Use as a discovery hint in `bmad-create-prd` / `bmad-create-story` to suggest which roles should review the story before it goes to dev.

| Phase | Engage primarily | Engage as needed |
|---|---|---|
| **Concept / pre-pitch** | Designer (Samus), Producer (Paige), Architect (Cloud) | Narrative Designer, Live Ops Manager (if live-service game) |
| **Preproduction** | Architect (Cloud), Designer (Samus), Level Designer, UX Designer, Audio Designer | Narrative Designer, Build Engineer (pipeline setup), Combat / Gameplay Designer |
| **Vertical slice** | Combat / Gameplay Designer, Level Designer, Audio Designer, Architect (Cloud), Designer (Samus) | UX Designer (FTUE skeleton), QA Lead (automation framework) |
| **Alpha** | All design + engineering roles. Level Designer + Combat Designer in heavy tuning mode. QA Lead scaling automation. | Narrative Designer (writing passes), Audio Designer (full SFX/music pass) |
| **Beta** | QA Lead (cert prep), UX Designer (accessibility audit), Producer (Paige) | Build Engineer (release pipelines), Live Ops Manager (Season 0 prep) |
| **Ship** | Producer (Paige), QA Lead (cert submission), Build Engineer (gold master pipeline) | Live Ops Manager (Day-0 / Week-1 ops), Audio Designer (localisation VO) |
| **Live ops** | Live Ops Manager, Combat / Gameplay Designer (rebalancing), QA Lead (regression gating) | Narrative Designer (event story), Audio Designer (event SFX) |

**Solo / micro-team caveat.** Indie (BMGD) and 2-3-person studios collapse most of these roles into one or two people. The taxonomy is still useful as a checklist — "did we think about FTUE design? did we plan the build pipeline?" — even when no dedicated role exists.

---

## Sources

### BMGD provenance

- BMGD upstream repository (MIT) — <https://github.com/bmad-code-org/bmad-module-game-dev-studio>
- BMGD releases — <https://github.com/bmad-code-org/bmad-module-game-dev-studio/releases>
- v0.5.0 SHA `9dcd1253` — pinned source for Cloud Dragonborn import + descriptors above

### Level design

- The Level Design Book — <https://book.leveldesignbook.com/>
- Pacing chapter — <https://book.leveldesignbook.com/process/preproduction/pacing>

### Combat / game feel

- Steve Swink, *Game Feel* (Routledge / Morgan Kaufmann, 2008) — <https://www.routledge.com/Game-Feel-A-Game-Designers-Guide-to-Virtual-Sensation/Swink/p/book/9780123743282>
- Game Feel chapter 1 (open-access PDF) — <http://mycours.es/gamedesign2014/files/2014/10/Game-Feel-Steve-Swink-chapter-1.pdf>

### Narrative design

- GDC Vault — Technical Tools for Authoring Branching Dialogue — <https://gdcvault.com/play/1026384/Technical-Tools-for-Authoring-Branching>
- Top tools for narrative design — <https://blog.arcweave.com/top-10-tools-for-narrative-design>

### Audio design

- Wwise / FMOD / MetaSounds comparison — <https://www.strayspark.studio/blog/wwise-fmod-metasounds-audio-middleware-comparison>
- Audiokinetic GDC theater sessions — <https://blog.audiokinetic.com/audiokinetic-theater-gdc-2024/>
- atmoky spatial audio plugin overview — <https://atmoky.com/products/true-spatial/>

### Build engineering

- Semaphore — How to Manage CI/CD for Game Development — <https://semaphore.io/how-to-manage-ci-cd-for-game-development-unity,-unreal,-large-binaries>
- Unreal Automation Tool / multi-platform builds — <https://dev.epicgames.com/documentation/en-us/unreal-engine/building-multi-platform-games-in-unreal-engine>
- JetBrains TeamCity gamedev guide — <https://www.jetbrains.com/guide/gamedev/links/game-devops-elevating-your-unity-and-unreal-build-pipelines-with-teamcity/>
- SpeedrunCI (Unreal-specific CI) — <https://speedrun.ci/>
- Unity Cloud Build / CI-CD product — <https://unity.com/solutions/ci-cd>

### UX / accessibility

- Game Accessibility Guidelines (full list) — <https://gameaccessibilityguidelines.com/full-list/>
- GAG home — <https://gameaccessibilityguidelines.com/>

### QA / automation

- GDC Vault — Accelerating the QA Test Cycle — <https://gdcvault.com/play/1011982/Accelerating-the-QA-Test-Cycle>
- GDC Vault — Improving the QA Process — <https://gdcvault.com/play/1013387/Improving-the-QA>
- ISTQB Game Testing certification — <https://isqi.org/ISTQB-Certified-Tester-Game-Testing-CT-GaMe/CT-GaMe.82>
- Razer QA Companion-AI (GDC 2026 announcement) — <https://www.razer.com/blog/ai-that-plays-to-test-razer-qa-companion-ai-at-gdc-2026>
- Nvidia Cloud Playtest for GeForce Now — <https://www.pcguide.com/news/nvidia-introduces-cloud-playtest-for-geforce-now-making-qa-easy-for-game-devs-on-virtually-any-device/>

### Live ops

- LiveOps Strategy for Mobile Games — <https://gamegrowthadvisor.com/blog/2026-03-31-liveops-strategy-mobile-games-guide/>
- Sensor Tower live-ops report — <https://sensortower.com/blog/top-grossing-mobile-games-live-ops-strategies-2025-report>
- GDC Vault — Player Centric Live Ops Monetization — <https://www.gdcvault.com/play/1022202/Player-Centric-Live-Ops-Monetization>
- Beyond Battle Passes (Beamable) — <https://beamable.com/blog/beyond-battle-passes-the-future-of-monetization-in-live-games>
