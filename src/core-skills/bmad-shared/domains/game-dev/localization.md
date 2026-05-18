# Domain Sub-File: Localization

Production-grade localization reference for game development. Covers scope tiering, text expansion, RTL/CJK technical support, translation workflows, VO localization, regional pricing, and cultural adaptation beyond text.

Master file: `domains/game-dev.md`. JIT-loaded by workflows touching i18n/L10n architecture, market launch planning, or regional release decisions.

---

## Localization Scope per Tier

Localization scope is a budget decision. Pick a tier early — retrofitting locale support post-launch costs 2-5x more than baking it in.

### Indie Minimal (1-4 languages)

- **EN** (English) — baseline
- Plus 1-3 priority markets driven by audience analytics:
  - **FR / DE / ES** (Western Europe focus)
  - OR **zh-CN / ja / ko** (East Asia focus)

Typical scope: text only, no VO. Auto-translation (DeepL or GPT-4) plus a single human review pass per language.

### AAA Standard (10-12 languages)

Industry default for major releases:
- **FIGS**: French (FR), Italian (IT), German (DE), Spanish (ES-EU)
- **ES-LATAM** (Latin American Spanish — distinct from EU Spanish)
- **pt-BR** (Brazilian Portuguese)
- **Russian (RU)** — sanctions-impacted but still major install base
- **Polish (PL)**
- **Turkish (TR)**
- **zh-CN** (Simplified Chinese)
- **zh-TW** (Traditional Chinese — distinct script, distinct vocabulary)
- **ja** (Japanese)
- **ko** (Korean)
- Optional: Arabic (AR), Dutch (NL)

Typical scope: full text + VO for cinematic dialogue + subtitles for everything.

### Mobile Global (15-20+ languages)

Mobile F2P expands further to chase install base:
- All AAA Standard languages plus:
- **Hindi (hi)**
- **Indonesian (id)**
- **Thai (th)**
- **Vietnamese (vi)**
- **Arabic (AR)** if not already included
- **Persian (fa)**, **Hebrew (he)** — RTL pair
- **Malay (ms)**, **Filipino/Tagalog (tl)**

Mobile typically text-only (no VO) due to budget. Heavy use of MT (machine translation) with selective human review.

---

## Text Expansion Reality

Translated text expands or contracts vs English. Layout MUST tolerate variance without breaking.

| Target Language | Length Change vs English | Layout Risk |
|-----------------|--------------------------|-------------|
| German (DE) | +35% (compound nouns) | Highest risk — buttons + labels overflow constantly |
| French (FR) | +20% | Common overflow on UI labels |
| Spanish (ES) | +15-20% | Common overflow |
| Russian (RU) | +30% | Cyrillic + length, double risk |
| Polish (PL) | +30% | Long words + diacritics |
| Italian (IT) | +15% | Generally manageable |
| Portuguese (BR) | +25% | Watch button widths |
| Dutch (NL) | +30% | Long compounds like German |
| Japanese (JA) | -30 to -50% | Shorter visually, but vertical layout + ruby (furigana) edge cases |
| Chinese (zh-CN/TW) | -30 to -40% | Shorter; spacing rules differ |
| Korean (KO) | -10 to -20% | Closer to English than CJK Chinese |
| Arabic (AR) | -10 to +10% | Variable; RTL layout is the bigger concern |

### Design Rule

UI MUST tolerate **+40% text expansion** without breaking layout. Test with pseudo-localization (`[!!! eXpAnDeD tEsT sTrInG !!!]`) before vendor delivers real translations.

Common breakage patterns:
- Fixed-width buttons with hardcoded labels overflow
- Tooltips clip
- Menu entries overlap
- Score/HUD numeric labels truncate behind icons

---

## RTL (Right-to-Left) Support

### Languages

- **Arabic (AR)** — most spoken RTL language, ~400M speakers
- **Hebrew (he)** — Israel + diaspora
- **Persian / Farsi (fa)** — Iran + Afghanistan (Dari)
- **Urdu (ur)** — Pakistan + India
- **Pashto (ps)** — Afghanistan + Pakistan

### Engine Support

- **Unity 6** — TextMeshPro UTF-8 with built-in Arabic shaping + bidirectional algorithm. Use TMP, NOT legacy Text component.
- **Unreal 5.x** — Slate UI framework supports bidi; FText handles bidi at render. Some legacy widgets still buggy with RTL — test thoroughly.
- **Godot 4.x** — Native RTL support since 4.0, BiDi via ICU integration.

### UI Mirroring

When rendering RTL languages, mirror non-text UI elements:
- Icons indicating direction (arrows, "next" / "previous", "forward")
- Sliders (high-low direction reversed)
- Progress bars (fill direction reversed)
- Game UI showing reading order (HUD layouts)
- Map mini-icons, compass directions (DON'T mirror compass — north stays north, but UI bezel mirrors)

What NOT to mirror:
- Numbers (digits read left-to-right even in RTL contexts)
- Latin-script brand names embedded in RTL UI
- Time displays (clock 9:00 AM, not AM 9:00)

### Bidirectional Text Mixing

Common edge case: English brand/game name in Arabic UI sentence. Bidi algorithm handles this but requires:
- Proper Unicode control characters (LRM, RLM markers) on boundary
- Font that includes both Latin + Arabic glyphs
- Testing with real translator-provided strings, not engineer-typed test strings

---

## CJK (Chinese / Japanese / Korean) Support

### Font Strategy

CJK fonts are large — 20-50 MB per weight per font family (Hiragino Sans, Noto Sans CJK). Strategies:
- **Font subsetting** — include only glyphs used in shipped text. Tools: `pyftsubset`, FontForge. Reduces 50 MB → 5 MB common.
- **Dynamic font loading** — Unity TMP Dynamic Font generates glyphs on demand. Trade-off: first-display hitch.
- **Per-language font swap** — load different font asset per locale.

CJK fonts commonly used (free / open-source):
- **Noto Sans CJK SC / TC / JP / KR** (Google)
- **Source Han Sans / Source Han Serif** (Adobe)
- **GenJyuuGothic / GenEi Gothic** (free Japanese variants)

### Vertical Text (Legacy CJK)

Traditional CJK setting reads top-to-bottom, right-to-left columns. Rare in modern games but appears in:
- Period-set Japanese titles (Sekiro inscriptions, Persona menus)
- Stylistic Chinese UI elements
- Specific narrative books / in-game text

Most modern Asian-language games ship horizontal (left-to-right) for UX consistency.

### Simplified vs Traditional Chinese

- **zh-CN** (Simplified Chinese — mainland China + Singapore + Malaysia) — official China market
- **zh-TW** (Traditional Chinese — Taiwan) — distinct script (different glyph shapes) and partly distinct vocabulary
- **zh-HK** (Traditional Chinese — Hong Kong) — Traditional script + Cantonese vocabulary; sometimes shipped separate from zh-TW for premium localization

Common shortcut: ship zh-CN + zh-TW (HK speakers fall back to TW). AAA Tencent / NetEase publishers may demand all three for China-region releases.

### Korean Specifics

- Hangul (한글) is alphabetic + syllabic. Word-spacing differs from CJK Chinese/Japanese.
- Modern Korean rarely uses Hanja (Chinese characters in Korean) — drop Hanja from font subset unless content explicitly uses it.
- Honorific levels matter — translator briefs must specify formality (game protagonist addressing elder vs peer differs grammatically).

### Japanese Specifics

- Three scripts mixed: Hiragana (ひらがな), Katakana (カタカナ), Kanji (漢字)
- Ruby annotations (furigana) — small reading hints above Kanji. Implement via inline markup if target audience is children or Kanji-light.
- Honorifics (-san, -sama, -kun, -chan) — preserve in localization where character relationships matter.

---

## Translation Workflow

### String Extraction

- **Unity Localization Package** — Free official Unity package (com.unity.localization, version 1.5+). Localizes strings, assets (textures, audio, prefabs), supports XLIFF, CSV, Google Sheets I/O. Use this for all new Unity projects from 2022.3+.
- **Unreal Localization Dashboard** — Built-in. Gathers FText sources, exports to PO (Portable Object) files, imports translated PO, compiles to runtime LocRes.
- **Godot Translations** — CSV-based, simple but functional. Plus official PO support.
- **Custom .json / .csv tables** — Older projects. Easy to roll but lacks plural / gender / context handling.

Tag every string with **context note** for translators: "This is a button label, max 12 chars" or "Spoken by villain in formal register".

### CAT Tools (Computer-Assisted Translation)

Translators use CAT tools for consistency + memory:
- **MemoQ** — desktop + cloud, used by many vendors
- **SDL Trados Studio** — desktop industry-standard, expensive
- **Crowdin** — cloud-native, integrates Unity / Unreal plugins, glossary + screenshots + AI assist. Pricing: $0-$450/month range, four tiers (Free, Team, Business, Enterprise). Hosted-words-based pricing.
- **Lokalise** — alternative cloud SaaS
- **POEditor** — affordable cloud SaaS, common indie choice
- **Smartling** — enterprise

### Localization Vendors

| Vendor | Strengths | Target |
|--------|-----------|--------|
| Keywords Studios | 80+ languages text, 50+ audio. 700+ in-house LQA teams. Full-service AAA. KantanAI proprietary MT. | AAA |
| Lionbridge / Lionbridge Games | Global scale, multi-language audio | AAA, enterprise |
| LocalizeDirect | Game-specialized, dialog-heavy projects | Mid-tier + AAA |
| Altagram | Multi-language voice + text | AAA, console |
| Native Prime | Audio-focused (voice direction) | AAA cinematic |
| FluentLocalizers / individual freelancers | Lower cost, smaller scope | Indie |

### Machine Translation

Quality benchmarks (2026):
- **DeepL** — best quality for European languages
- **Google Translate API** — broadest coverage, decent for Asian languages
- **GPT-4 / GPT-5** — context-aware (can take system prompt with terminology + tone), best for narrative
- **Claude 3.5 / 4** — competitive with GPT-4, often preferred for stylistic preservation

MT-only ships only in low-stakes indie + mobile. Most quality-conscious projects use MT for first pass, human editor for second pass (post-editing workflow, "MTPE").

### In-Context Preview

Show translators where strings appear:
- Screenshot-attached strings (Crowdin, Lokalise supports natively)
- Live in-game preview build with translator login
- "Locale toggle" debug command in dev builds

Best practice: pseudo-locale internal build shows ALL strings expanded with markers — catches missing strings (anything English in pseudo-build is a hardcoded leak).

---

## Voice-Over Localization

### Cost per Language

- **Casting + recording**: $500 - $5,000 per hour of finished dialogue
- **Studio + engineer**: $200-$1,000/day
- **Talent rates**: union vs non-union; senior vs junior actor
- **Director fees**: $500-$1,500/day for VO direction
- **Total per language for ~10 hours of dialogue**: $20,000 - $100,000

For a AAA title with 50+ hours of dialogue × 10 languages, VO localization alone runs $1M - $5M.

### Lipsync Considerations

Three approaches:
1. **Accept mismatch** — record VO per language, do not regenerate lipsync animation. Most cost-effective. Players in CN/JP markets often expect lip mismatch for English-origin games.
2. **Regenerate phonemes** — automated lipsync (Oculus LipSync, JALI) per language audio track. Mid-cost.
3. **Full per-language facial animation** — re-record motion capture per language. AAA cinematic standard (Witcher 3 cinematics, FFXVI). Most expensive.

### Cultural Adaptation in VO

- Japanese: honorific suffixes (-san, -kun, -sama), preserved register, name order Family-First
- Spanish: formal/informal pronouns (tú/usted, vos/vosotros for ES vs LATAM)
- Korean: honorific verb conjugations matching social hierarchy
- French: tu/vous formality
- German: du/Sie formality

Brief translators with character profile + relationship matrix to lock formality choices early.

### Pivot Language Model

- Translate script to English first (the "pivot")
- Localize from English to all targets
- Pros: voice direction in English; translators can specialize in English-to-X
- Cons: double-translation losses for non-English origin titles (Japanese RPGs going JA → EN → FR lose nuance vs JA → FR direct)

AAA Japanese studios increasingly do JA → EN + JA → CN/KR direct.

---

## Regional Pricing

### Steam Regional Pricing (2026)

Valve updated regional pricing tools in 2026 with three conversion methods:
1. Currency exchange rate only
2. Local purchasing power data
3. Combined data (PPP + comparable goods + exchange rate) — Valve's recommended default

Steam supports **35 different currencies** with granular per-region pricing.

| Region | Recommended Discount vs USD | Notes |
|--------|------------------------------|-------|
| Argentina | -75% to -85% | Severe currency volatility |
| Brazil | -50% to -70% | Reflects local income |
| Turkey | -65% to -75% | High inflation, lower local income |
| Russia / CIS | -40% to -60% | Sanctions complicate revenue extraction in 2026 |
| India | -60% to -70% | Mass market price sensitivity |
| Mexico | -30% to -40% | Mid-tier discount |
| China (zh-CN) | -30% (RMB) | Steam unofficial in China — most CN players use overseas storefront or non-Steam alternatives |
| Eurozone | -5% to +10% | EUR pricing typically equal or slightly above USD |
| UK | +/- 0% | GBP near parity |
| Japan | +/- 0% to +20% | Tradition of slightly higher console prices, less so on Steam |

### Console Storefront Pricing

- **PlayStation Store** — Sony-set price tiers per region; publishers select from tiers
- **Microsoft Xbox Store** — granular price tiers per region; auto-FX in many regions
- **Nintendo eShop** — Nintendo-controlled tier system; less regional discount flexibility than Steam

### Mobile Pricing

- **Apple App Store** — Apple price tiers; automatic FX adjustment introduced 2024 (vs prior static tiers)
- **Google Play** — per-country price points, more flexible than Apple historically

### Power-Purchasing Parity (PPP)

Recommended ethical pricing approach: adjust prices so cost-to-income ratio is consistent across regions. This is what Steam's 2026 "combined data" method approximates.

PPP-adjusted pricing increases install base in low-income markets without significantly cannibalizing high-income market revenue.

---

## Cultural Localization Beyond Text

### Color Symbolism

- **Red**: Lucky / festive in China, danger / stop in West, mourning in South Africa
- **White**: Purity / weddings in West, mourning in some East Asian cultures (Japan, Korea, China — though shifting)
- **Yellow**: Royalty in some Asian cultures, cowardice in West, sacred in Buddhist tradition
- **Green**: Islam / paradise in Middle East, money / envy in West, fertility in Mexico
- **Black**: Mourning / formal in West, can carry positive connotations in East Asia (depending on context)

UI / icon design should account for symbolism in target markets, especially for status indicators.

### Religious + Political Symbols

Adjust or remove per region:
- **Cross / crucifix** — neutral in West, can be sensitive in China / Middle East
- **Swastika** — Hindu / Buddhist symbol (positive) vs Nazi symbol (banned in Germany / Austria / many EU countries when in Nazi context)
- **Star of David** — Israeli flag context vs religious symbol
- **Pentagrams** — fantasy game iconography vs religious sensitivity

Germany historically banned Nazi imagery in games until 2018, when USK ruled case-by-case; still, many games ship "censored" SKU for German market.

### Calendar / Holidays

- Lunar New Year mode for CN / KR / VN / TW players (red theming, lantern UI, special rewards)
- Christmas / Halloween primarily Western
- Ramadan content / pauses for Muslim-majority markets
- Golden Week (Japan, May), Obon (Japan, August)

Live-service games typically run regional event tracks in parallel.

### Sensitive Content per Region

| Region | Restrictions |
|--------|--------------|
| Germany | Violence ratings (USK), historical Nazi imagery in non-documentary contexts |
| China | Skeletons must be covered (flesh/colored), no blood-on-screen, no gambling mechanics, no LGBTQ+ depictions in most categories. NPC must wear no-revealing clothing. |
| Saudi Arabia / UAE / Gulf states | LGBTQ+ depictions, alcohol, pork, gambling, religious iconography |
| Russia | LGBTQ+ depictions restricted under 2023 "extremism" laws |
| South Korea | Game time limits historically (Shutdown Law repealed 2021), gambling adjacent mechanics regulated |
| Australia | R18+ rating exists but specific content (drug use rewarded) banned |
| Japan | Sexual content restrictions per CERO + platform-specific |

---

## Date / Number / Currency Formats

| Format | Locale Examples |
|--------|-----------------|
| `MM/DD/YYYY` | US (en-US), Philippines |
| `DD/MM/YYYY` | UK, EU, India, Latin America |
| `YYYY-MM-DD` | ISO standard, Japan, Korea, China |
| `DD.MM.YYYY` | German (DE), Russian (RU), Turkish (TR) |

| Number Format | Locale Examples |
|--------------|------------------|
| `1,000.50` (comma thousands, dot decimal) | US, UK, China, Japan |
| `1.000,50` (dot thousands, comma decimal) | EU (DE/IT/ES/NL), Brazil |
| `1 000,50` (space thousands, comma decimal) | France, Russia |
| `1'000.50` (apostrophe thousands) | Switzerland (Swiss German) |

| Currency Display | Locale Examples |
|------------------|------------------|
| `$1,000.50` | US |
| `1.000,50 €` | Germany |
| `1 000,50 €` | France |
| `£1,000.50` | UK |
| `¥1,000` (no decimals — yen has no sub-unit) | Japan |
| `1.000,50 R$` | Brazil |
| `1,000.50 元` or `¥1,000.50` | China |
| `₩1,000` (no decimals — won has no sub-unit) | South Korea |

Use platform locale APIs (`CultureInfo` in .NET, `NSLocale` in Apple, `ICU` library) — never hand-format. Hardcoded `string.Format("{0:N2}")` with `en-US` culture leaks US formatting into FR/DE UIs.

---

## Sources

- [Unity Localization Manual](https://docs.unity3d.com/Manual/com.unity.localization.html)
- [Unreal Engine Localization Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/localization-and-internationalization)
- [Crowdin pricing (official)](https://crowdin.com/pricing)
- [Crowdin game localization guide](https://crowdin.com/blog/game-localization)
- [Keywords Studios localization services](https://www.keywordsstudios.com/en/services/globalize/localization/)
- [Steam regional pricing update 2026 (SteamDB)](https://steamdb.info/blog/valve-price-matrix-2026-update/)
- [Steam price conversion explorer (Steamworks)](https://partner.steamgames.com/pricing/explorer)
- [DeepL Pro for developers](https://www.deepl.com/pro)
- [PlayStation Localization + Certification Requirements](https://sandvox.io/game-localization/playstation-localization/)
- [Inlingo: Localization in Unity and Unreal](https://inlingogames.com/blog/localization-in-unity-and-unreal-engine/)
