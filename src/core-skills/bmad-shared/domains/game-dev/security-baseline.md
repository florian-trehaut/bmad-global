# Domain Sub-File: Security Baseline (Game Dev)

Cross-cutting security, privacy, compliance, accessibility and integrity requirements that apply to any game shipping commercially. This file covers the LEGAL and PLAYER-TRUST baseline (what regulators or platform holders will reject the build for); engine-specific guidance is in adjacent sub-files (`anti-cheat.md` for cheat defense detail, `multiplayer-architecture.md` for server-authoritative netcode).

Most rows below have direct legal/policy citations. When a vendor or law changes scope or fee structure, update both this file and any referencing story spec.

## Player Data Protection

Cross-jurisdictional privacy regimes that apply when a game collects, processes, or transmits player personal data (account, telemetry, payment, social, biometrics). All four major regimes share the same conceptual primitives (lawful basis, data minimisation, right to delete, right to export, retention limits) but differ on enforcement, fines, and consent rules.

### GDPR (European Union)

- **Scope.** EU Regulation 2016/679. Applies to any operator processing personal data of natural persons located in the EU, regardless of where the operator is established (extraterritorial under Art. 3(2)).
- **Lawful basis required.** Consent (Art. 6(1)(a)), contract performance (Art. 6(1)(b)), legitimate interest (Art. 6(1)(f)) are the typical bases for games. Account creation typically uses contract; telemetry/marketing typically requires consent.
- **Right to erasure (Art. 17).** Player can request deletion. Operator must respond within 1 month. Anonymisation is accepted as an alternative to physical deletion if reversibility is mathematically infeasible — EDPB's 2025 coordinated audit found many controllers' "anonymisation" still allowed re-identification, exposing them to fines.
- **Right to data portability (Art. 20).** Player can request a machine-readable export of all personal data they provided. Format must be structured, commonly used, machine-readable (JSON, CSV, XML acceptable).
- **Data minimisation (Art. 5(1)(c)).** Collect only data needed for the declared purpose. Telemetry should be pseudonymised by default; raw IP, device ID, MAC must be hashed or truncated unless legally required.
- **Retention.** Maximum period must be declared in the privacy policy. Inactive account closure (typical 24-36 months) is the industry standard.
- **Breach notification (Art. 33).** 72 hours to notify the supervisory authority once a personal data breach is detected.
- **Fines.** Up to EUR 20M or 4% of global annual turnover (whichever is higher).

### CCPA / CPRA (California, USA)

- **Scope.** California Civil Code 1798.100 et seq. Applies to for-profit entities doing business in California meeting one of three thresholds: USD 25M+ annual revenue, processes data of 100k+ California residents/households, or derives 50%+ revenue from selling/sharing personal data.
- **Right to know, delete, correct.** Effective since 2020 (CCPA) and expanded in 2023 (CPRA).
- **Right to opt out of sale/sharing.** Consumer can require the business to stop selling or sharing their data. Effective January 1, 2026, the business MUST send a confirmation that the opt-out request has been processed.
- **Mobile-app rule.** California AG enforcement guidance (Jam City settlement, USD 1.4M, 2025) clarifies: if a mobile app sells or shares personal info, the OPT-OUT must be available INSIDE the app — a link to an external website is not sufficient.
- **Minors.** Opt-IN consent required to sell/share data of consumers under 16 (CCPA 1798.120(c)).
- **Fines.** USD 2,500 per violation (intentional: USD 7,500); USD 7,500 per intentional violation involving a minor.

### PIPL (China)

- **Scope.** Personal Information Protection Law (PIPL), effective November 1, 2021. Applies extraterritorially when processing personal data of natural persons in mainland China.
- **Cross-border transfer.** Personal data of Chinese residents may not be exported until one of three mechanisms is satisfied: (a) CAC security assessment, (b) Personal Information Protection Certification, or (c) China Standard Contract (CSC) signed with the foreign recipient. Separate, explicit consent is required for the transfer in addition to the original consent.
- **Sensitive personal data.** Stricter consent for biometric, location, financial, religious, health data, and any data of minors under 14 (the latter is also covered by the Minors Protection Law).
- **Fines.** Up to RMB 50M or 5% of previous year's revenue, plus business suspension and confiscation of illegal gains.

### LGPD (Brazil)

- **Scope.** Lei Geral de Proteção de Dados (Law 13.709/2018), effective September 2020.
- **Player rights.** Largely mirrors GDPR: access, correction, anonymisation, deletion, portability, information about sharing, revocation of consent.
- **Brazilian DPA (ANPD).** Enforcement active since 2023; fines up to 2% of Brazil revenue, capped at BRL 50M per violation.
- **Brazilian minors (under 18).** Specific consent of parents/legal guardian required.

### EU Digital Services Act (DSA) for UGC games

- **Scope.** Regulation (EU) 2022/2065, fully applicable since February 17, 2024.
- **Trigger for games.** If the game hosts and disseminates user-generated content (skins, mods, custom levels, in-game stores), the developer is potentially classified as a "hosting service" or "online platform", triggering DSA obligations.
- **Required.** Notice-and-action mechanism with reasoned explanation, internal appeals, out-of-court dispute settlement availability, transparency reports, statement of reasons for moderation decisions (must be sent to the user AND to the EU DSA Transparency Database).
- **Bans/suspensions.** Players have the right to challenge content moderation decisions. Sample compliance: Nintendo's DSA Transparency Report (February 2025) catalogues moderation volume and reversal rates per region.
- **Fines.** Up to 6% of global annual turnover.

## COPPA + Kids' Games

Children's Online Privacy Protection Act (US, 15 USC 6501-6506; FTC rule 16 CFR Part 312) — applies to any operator with actual knowledge of collecting personal information online from a child under 13.

- **Verifiable Parental Consent (VPC).** Required BEFORE collecting personal information from a known under-13 user. Sliding-scale options (FTC-approved methods, expanded 2025):
  - Government-ID + face-match (knowledge-based authentication using government photo IDs compared to device-taken photos)
  - Signed consent form returned via paper, fax, or scan
  - Credit/debit/payment-method transaction (any monetary OR transactional verification — "monetary" was removed from the FTC requirement in 2025)
  - "Text-plus" method (text-message notification to a parent's verified phone, follow-up confirmation)
  - Video conferencing with a trained operator
  - Knowledge-based authentication (KBA)
- **Age gate.** Mandatory at first launch on any mixed-audience game. Neutral question ("In what year were you born?") — NOT "Are you over 13?" (the latter is held to invite false declarations). If user indicates under 13, either (a) refuse data collection, or (b) obtain VPC.
- **No targeted ads under-13.** Behavioural advertising forbidden. Use a separate kids-mode SDK (e.g., AdMob Kids, ironSource Kids, Unity Ads Kids Mode) that strips device ID and contextual-only targeting.
- **Separate analytics SDK for kids.** Standard adult analytics SDKs (Firebase Analytics with ad-ID, Amplitude with persistent ID) require COPPA-safe mode or replacement with COPPA-certified equivalents (e.g., SuperAwesome Kids Web Services).
- **Fines.** FTC enforcement actions have ranged USD 4M (TikTok subsidiary) to USD 520M (Epic Games / Fortnite, December 2022, the largest COPPA fine to date).
- **ESRB Privacy Certified.** Optional safe-harbour program — operators following ESRB's COPPA-compliant practices receive presumption of compliance during FTC enforcement.

## Accessibility Compliance

Accessibility is now a hard legal requirement in the EU and US, plus a platform-cert requirement on console. Failing accessibility blocks publication, not just sales.

### EU European Accessibility Act (EAA) — effective 28 June 2025

- **Directive (EU) 2019/882**, applied since June 28, 2025.
- **In scope.** Online game stores, e-commerce gaming services, communication services within games (chat, voice), banking and payment surfaces in games, e-readers, and ICT products sold to EU consumers. The directive does NOT specifically name "video games", but covers most surrounding services and IS used by national regulators to scrutinise game features.
- **Standard.** EN 301 549 (harmonised European standard) — itself incorporates **WCAG 2.1 Level AA** for web and mobile interfaces.
- **Coverage.** Manufacturers, importers, distributors, authorised representatives, and service providers in the EU. Includes non-EU operators selling to EU consumers.
- **Penalties.** Per Member State — Italy: 5% of annual turnover for large companies; Spain: EUR 30k-600k + 2-year ban; Ireland: possible imprisonment.

### CVAA (US) — extended to games since 2019

- **Twenty-First Century Communications and Video Accessibility Act (47 USC 617)**, enforced by FCC.
- **Scope.** Advanced Communication Services (ACS) — covers in-game chat, voice, text, video messaging, video conferencing.
- **Compliance date.** All new games released on or after January 1, 2019 and pre-existing games undergoing "substantial upgrades" must comply. The video-game industry's regulatory waiver expired December 31, 2018.
- **FCC 2024 Biennial Report.** Released October 8, 2024 — confirms ongoing applicability of CVAA to game communications.

### Required Accessibility Features (baseline)

These features should be present in every commercial game release. Several are now mandatory under EAA + CVAA + platform certification (Microsoft Game Stack accessibility certification, PlayStation accessibility cert, Nintendo Switch family settings):

- **Closed captions / subtitles.** All dialogue and meaningful sounds. Customisable size, colour, opacity, background opacity. Speaker identification.
- **Subtitle burn-in option** for streaming-output use cases.
- **Colorblind modes.** Three baseline modes:
  - **Deuteranopia** (red-green deficiency, missing green receptor) — ~5% of XY chromosome population
  - **Protanopia** (red-green deficiency, missing red receptor) — ~1% of XY chromosome population
  - **Tritanopia** (blue-yellow deficiency) — ~0.5% of population
  - Bonus: per-mode strength slider (0-10), as seen in Fortnite (99 intermediate levels).
- **Never colour-only signaling.** All information conveyed by colour must be additionally conveyed by shape, pattern, position, or text.
- **Remappable controls.** Full keyboard and gamepad rebinding. Hold-to-toggle conversion for any "press-and-hold" mechanic.
- **Audio cues for color-only info.** Reactive sound for events that would otherwise only be visible by colour change.
- **Screen reader for menus.** UI text spoken by OS screen reader (NVDA, VoiceOver, TalkBack, Xbox Narrator, PlayStation Screen Reader).
- **High-contrast / large-text modes.** OS-level setting respected by in-game UI.
- **Camera shake / motion-blur / flash off** toggles (photosensitive epilepsy / vestibular disorder).
- **Adjustable difficulty / assist modes.** Industry-standard since The Last of Us Part II (2020), Celeste (2018), Forza Horizon series.

### Platform Family Controls (parental + accessibility)

- **Nintendo Switch Parental Controls / Family Manager.** Time limit, age rating cap, communication off, posting to social-media off, screenshot/video sharing limits.
- **PlayStation Family Manager.** Per-child time limit, monthly spending cap, communication scope (friends only / off), VR age cap, web-browser restriction.
- **Xbox Game Pass Family / Microsoft Family Safety.** Per-child screen time, spending limits, content filters, multiplayer scope (none / friends / everyone), purchase approval required.

## Regional Compliance

Beyond global GDPR/COPPA, several jurisdictions impose game-specific licensing, age-rating, and content rules.

### China

- **ISBN license.** Required to publish any commercial game (mobile, PC, console). Issued by NPPA (National Press and Publication Administration).
- **Foreign studio path.** Foreign companies CANNOT obtain the B25 Commercial ICP License directly. They MUST partner with a Chinese publisher (Tencent, NetEase, Perfect World, etc.) who applies on their behalf.
- **Approval cadence.** NPPA processes batches of approvals every 1-2 months. April 2026: 154 games approved; Tencent-Ubisoft Rainbow Six China entered first beta Spring 2026 after a license obtained August 2024.
- **Content rules.** No blood, no bones/skeletons, no gambling visuals, no anti-China political content, no LGBTQ themes (in approval practice).
- **Real-name registration.** Mandatory for all in-game accounts (national ID number).
- **Minors playtime cap.** Under-18 limited to 1 hour/day on Friday, Saturday, Sunday, holidays. Mandatory facial recognition for randomised re-verification (2021+ rule).
- **CAC anti-addiction.** Strict gameplay-curfew compliance auditable by Cyberspace Administration of China.

### Germany

- **USK (Unterhaltungssoftware Selbstkontrolle)** age ratings: 0, 6, 12, 16, 18.
- **Historical Section 86a restriction (Nazi imagery).** Pre-2018: USK refused ratings for any game depicting Nazi symbols, forcing publishers to ship censored DE-only SKUs (Wolfenstein, Return to Castle Wolfenstein).
- **Relaxed August 2018.** Under the "social adequacy clause" the USK began permitting Nazi imagery on a case-by-case basis. Wolfenstein: Youngblood and Wolfenstein: Cyberpilot (2019) were the first beneficiaries.
- **Doom / id Software (2011).** Doom (1993) was on the Index of Media Harmful to Young Persons until 2011 (banned from public display/advertising for 18 years). Lifted retroactively after re-rating.

### Korea (South)

- **GRB (Game Rating and Administration Committee)** age rating mandatory.
- **Loot box odds disclosure (effective March 2024).** Under the Game Industry Promotion Act (GIPA), all games must disclose the probability of each loot-box outcome inside the game UI and on the marketing page.
- **2025 enforcement.** GRAC deployed 27 monitoring personnel auditing 1,255 games — 266 violations (21.2% non-compliance rate); foreign-developed games accounted for 60% of violations. Compliance rates: 84% Korea vs 64% UK self-regulation vs 35% Netherlands.
- **2025 amendments (effective January 31, 2025).** Burden of proof shifted to game operators to prove no wilful misconduct.
- **Proposed 2025 bill.** Up to 3% of revenue (capped at KRW 1B / USD 692k) for loot box violations.

### Russia

- **Sanctions.** Since 2022, the United States and EU export-control regimes treat Unreal Engine 4.27+ (and major versions of Unreal Engine 5) as restricted to Russia and Belarus end users. Most western engines, art-asset stores, and gaming middleware have suspended sales / asset embargoes to Russia and Belarus.
- **Roskomnadzor.** Domestic communications regulator; can block or fine games for content (LGBTQ-themed games are de facto banned for under-18 due to the 2023 "LGBT extremism" ruling).

### Australia

- **Australian Classification Board** issues game ratings (G, PG, M, MA15+, R18+).
- **R18+ rating** has existed for games since January 2013. Before that, games failing MA15+ were "Refused Classification" (de facto banned).
- **Loot boxes.** December 2024 — Classification Board began requiring "M" or higher rating + warning label on games with paid loot boxes; the underlying classification regulation took effect throughout 2025.

### Brazil

- **DJCTQ (Departamento de Justiça, Classificação, Títulos e Qualificação)** age rating mandatory for all games sold in Brazil since 2025. Pre-2025 this was best-effort; 2025+ it is binding.

## Anti-Cheat (cross-genre baseline)

`anti-cheat.md` covers vendor + threat-model details. The baseline-level rules applicable to ANY online-leaderboard or multiplayer game:

- **Client = zero-trust.** Treat any state coming from the client as adversarial input. Validate everything server-side.
- **Authoritative server.** All game-affecting state (position, hit registration, inventory, currency, kills) computed by the server. Client only sends inputs and renders authoritative state.
- **Anti-tamper signing.** Production binaries signed by one of: Easy Anti-Cheat (EAC, free for indies via Epic Online Services), BattlEye, VAC (Steamworks-bundled, free), Vanguard (Riot proprietary), Denuvo Anti-Cheat.
- **Replay verification for leaderboards.** Top-N submissions must include the input log + seed; server replays the simulation to verify.
- **Rate-limit suspicious patterns.** Statistical outlier detection (impossible kill-time, impossible movement vector, impossible XP/hour) triggers automated review or shadow-ban queue.

See `anti-cheat.md` for full vendor matrix, ban-strategy options, and per-genre threat model.

## IAP / Payment Security

- **Receipt validation server-side ONLY.** Both Apple App Store Server API (replaced legacy `verifyReceipt`) and Google Play Developer API issue verifiable receipts. Client-side validation alone is trivially bypassed.
- **Apple App Store Server Notifications V2.** Webhook delivery of subscription/refund events (`SUBSCRIBED`, `DID_RENEW`, `EXPIRED`, `REFUND`, `REFUND_DECLINED`, `CONSUMPTION_REQUEST`). Mandatory for any subscription business model.
- **Google Play Real-Time Developer Notifications (RTDN).** Pub/Sub topic delivers analogous purchase / subscription / refund events.
- **Idempotency on receipt processing.** Each transaction ID processed at most once. Persist receipt ID set; reject re-presentation.
- **Refund webhooks revoke items.** On chargeback or refund event, server MUST revoke any virtual goods, currency, or status granted by the original transaction. Repeated chargeback abuse triggers permanent account lock.
- **No credit-card storage.** Never store PAN, CVV, or card data. Use platform IAP (Apple Pay, Google Pay) or tokenised processors (Stripe, Braintree, Adyen) for non-platform transactions (WebGL, PC standalone). Apple Pay / Google Pay tokenisation collapses PCI scope to "MERCHANT" level for direct integrations, near-zero for platform-IAP-only models.
- **No password storage.** Use OAuth: Sign in with Apple (mandatory iOS), Sign in with Google, Steam OpenID, Xbox Live, PlayStation Network, Epic Games, Discord. Self-managed credentials require Argon2id / bcrypt password hashing + email verification + MFA option.

## Loot Box Transparency Laws

Country-by-country regulatory status of paid loot boxes (random virtual-item draws purchased with real money). Status as of 2026:

| Country | Status | Effective | Source |
|---|---|---|---|
| **Belgium** | BANNED (Gaming Commission ruled loot boxes = gambling, criminal prosecution for unlicensed operation) | April 2018 | Belgian Gaming Commission |
| **Netherlands** | Restricted (first-type loot boxes permitted post-court-ruling 2022; EA fined EUR 5M for FIFA Ultimate Team packs 2018-2020) | 2018-2022 | Kansspelautoriteit |
| **Korea** | Odds disclosure MANDATORY | March 2024 | Game Industry Promotion Act (GIPA), amended Jan 31, 2025 |
| **China** | Odds disclosure MANDATORY (including drop rates) | 2017 | Ministry of Culture rules; reinforced by 2019 anti-addiction rules |
| **Japan** | "Kompu gacha" (collecting full sets through randomised draws to unlock a rare reward) BANNED | 2012 | Consumer Affairs Agency interpretation under Premiums Display Law |
| **Australia** | Disclosure + classification label warning required | 2025 (Classification Board ruling, December 2024) | Australian Classification Board |
| **UK** | Self-regulation (UKIE pledge 2020); industry voluntary disclosure | Ongoing | UKIE / DCMS |
| **USA** | No federal regulation; state-level activity in California, Hawaii (failed 2018), Minnesota | None | n/a |

Industry-wide: ESRB / PEGI / IARC all now require an "In-Game Purchases (Includes Random Items)" content descriptor on the box and store listing.

## DRM / EULA Enforcement

- **Steamworks DRM.** Built-in binary wrapping for Windows / macOS / Linux. Free with publishing on Steam. Not a strong protection (commonly cracked within days for AAA), but raises bar for casual piracy.
- **Console SDK enforcement.** Closed platforms (Xbox, PlayStation, Switch) enforce digital signing / TitleID checks at OS level; no first-party EULA implementation needed beyond standard SDK use.
- **EULA acceptance.** Click-through accept tracked server-side (timestamp + version). Must be re-presented on EULA version bumps. EU regulators (DSA, GDPR) require plain-language summaries.
- **Chargeback handling.** Repeat-offender chargebacks → permanent account lock. Document threshold (typically 2 chargebacks within 6 months) in TOS.
- **Account banning for cheat / RMT (Real Money Trading).** Banning policy must be documented in TOS; appeal path required by EU DSA for hosting-service-class games. Ban categories typically: warning, temporary suspension (24h / 7d / 30d), permanent account ban, hardware ban (HWID + account).

## Mod System Security

Applicable when the game allows user-supplied scripts, levels, or assets (Steam Workshop, Mod.io, Nexus Mods, in-game UGC editor).

- **Sandbox mod scripts.** Run user scripts in a constrained interpreter:
  - **Lua**: industry-standard for game mod scripting (Sandbox via `sol2` / LuaSandbox / sandboxed Lua state with disabled `io`, `os.execute`, `package`, `dofile`, `loadfile`).
  - **WebAssembly (WASM)**: sandboxed-by-design execution model; emerging in modern engines.
  - **C# scripting (Roslyn)**: harder to sandbox safely — full .NET runtime exposes I/O / network unless wrapped.
- **Anti-RCE for user-generated content.** Disable arbitrary file I/O, network sockets, OS command execution, shared-library loading. Whitelist game-engine APIs; deny everything else by default.
- **Workshop moderation pipeline.** All UGC must support reporting and takedown per DSA (EU) and platform store policies (Steam, Microsoft, Sony, Nintendo). Moderation queue + automated heuristics + human review.
- **Asset sanitisation.** Image/audio assets parsed by isolated process (sandboxed parser) — image decoder vulnerabilities (libpng, libjpeg, freetype, libtiff) are a routine RCE vector when applied to attacker-controlled UGC.

## Sources

- [GDPR, Regulation (EU) 2016/679 — EUR-Lex consolidated text](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [EDPB 2025 coordinated audit on right-to-erasure findings — TechGDPR digest](https://techgdpr.com/blog/data-protection-digest-19022026-when-using-anonymisation-for-deletion-controllers-have-differing-degrees-of-success/)
- [CCPA Statute effective January 1, 2026 — California Privacy Protection Agency](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf)
- [Jam City CCPA settlement (USD 1.4M, mobile-app in-app opt-out) — TrueVault analysis](https://www.truevault.com/learn/jam-city-fined-1-4m-for-ccpa-non-compliance)
- [PIPL official compliance summary — China Briefing](https://www.china-briefing.com/doing-business-guide/china/company-establishment/pipl-personal-information-protection-law)
- [PIPL on Wikipedia (statute and 2021 enforcement history)](https://en.wikipedia.org/wiki/Personal_Information_Protection_Law_of_the_People's_Republic_of_China)
- [European Accessibility Act (Directive (EU) 2019/882) full guide — Player Research](https://www.playerresearch.com/blog/european-accessibility-act-video-games-going-over-the-facts-june-2025/)
- [EAA and EN 301 549 (WCAG 2.1 AA harmonised standard) — Acquia](https://www.acquia.com/blog/european-accessibility-act-and-en-301-549-your-complete-compliance-guide)
- [FTC COPPA Final Rule amendments 2025 — WSGR Data Advisor](https://www.wsgrdataadvisor.com/2025/01/new-federal-childrens-privacy-requirements-are-not-childs-play-ftc-amends-coppa-rule-imposing-new-obligations-on-child-directed-services/)
- [FTC "Complying with COPPA: Frequently Asked Questions"](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [CVAA — FCC consumer guide on accessibility of communications in video games](https://www.fcc.gov/consumers/guides/accessibility-communications-video-games)
- [Korea loot box probability disclosure law (compliance study 2025) — Tech Xplore](https://techxplore.com/news/2025-09-south-korea-loot-law-strong.html)
- [Korea revenue-based loot box fines proposal (Sept 2025) — Glitch Rant](https://www.glitchrant.com/south-korea-loot-box-law-revenue-fines/)
- [Belgian Gaming Commission loot-box ban (2018) — Game Developer](https://www.gamedeveloper.com/business/belgian-gaming-commission-declares-loot-boxes-illegal)
- [Netherlands EA FIFA loot-box fine (EUR 5M) — Clifford Chance](https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2022/09/the-ultimate-loot-drop-the-netherlands-is-planning-to-ban-loot.html)
- [China game ISBN license / NPPA — AppInChina guide](https://appinchina.co/blog/the-complete-guide-to-chinas-game-publishing-isbn/)
- [USK Germany age categories official](https://usk.de/en/the-usk-age-ratings/)
- [USK Wolfenstein Nazi imagery clause (Wikipedia summary)](https://en.wikipedia.org/wiki/Unterhaltungssoftware_Selbstkontrolle)
- [EU Digital Services Act, Regulation (EU) 2022/2065 — European Commission](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act)
- [DSA practical impact on game developers — PONT Data&Privacy](https://privacy-web.nl/en/nieuws/play-by-the-rules-wat-de-digital-services-act-betekent-voor-gameontwikkelaars/)
- [Apple App Store Server API documentation (replaces verifyReceipt)](https://developer.apple.com/documentation/appstoreserverapi)
- [PCI DSS Tokenization Guidelines (official supplement)](https://www.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf)
- [Stripe gaming payment processing reference](https://stripe.com/resources/more/gaming-payment-processing-strategies)
- [Game accessibility colorblind design (Alan Zucconi)](https://www.alanzucconi.com/2015/12/16/color-blindness/)
- [Game Accessibility Guidelines (community standard)](https://gameaccessibilityguidelines.com/)
