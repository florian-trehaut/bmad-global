# Domain Sub-File: Audio

Production-grade audio reference for game development. Covers middleware selection (FMOD / Wwise / engine-native), spatial audio standards, dynamic music, VO pipelines, audio compression, implementation patterns, and accessibility.

Master file: `domains/game-dev.md`. JIT-loaded by workflows touching audio implementation, middleware selection, or sound design decisions.

---

## Audio Middleware

Audio middleware abstracts the "code <-> assets" boundary. Sound designers author events in middleware authoring tools; programmers post events by name. This separation is essential at scale.

### FMOD Studio (Firelight Technologies)

- **License (2026)**: Free for indie if annual gross revenue < $200,000 USD and game budget < $500,000. Paid tiers above:
  - Indie (over free tier): $2,000 per title (budget < $600k, revenue < $200k)
  - Basic: $6,000 per title (mid-size teams)
  - Premium: $18,000 per title (larger teams)
- **Strengths**: Permissive free tier, modern UI, strong Unity + Unreal plugins, robust live profiler. Lower learning curve than Wwise.
- **Platform support**: PS5, PS4, Xbox Series X/S, Xbox One, Switch, PC (Windows/Mac/Linux), iOS, Android, WebGL/HTML5.
- **Industry adoption**: Celeste, Hades, Hollow Knight, Inside, Genshin Impact, Forza Horizon series.

### Wwise (Audiokinetic)

- **License (2026)**: Indie tier free (under revenue cap). Above that: Pro from $8,000, Premium from $25,000, Platinum from $50,000 per title. Per-platform licensing.
- **Strengths**: AAA standard, deeper feature set (interactive music tools, advanced spatializer, exhaustive QA pipeline), strong support contracts on Premium+.
- **Platform support**: Same coverage as FMOD plus deeper console certification track record.
- **Industry adoption**: Assassin's Creed series, Cyberpunk 2077, Doom Eternal, Star Wars Jedi: Survivor, Final Fantasy XVI.

### Engine-Native (Unity Audio / Unreal Audio Engine)

- **Cost**: Free (bundled).
- **Unity Audio**: AudioSource + AudioMixer + AudioMixerSnapshots — usable for small projects but lacks event abstraction. Add FMOD or Wwise for serious scope.
- **Unreal Audio Engine + MetaSound**: UE5 brought MetaSound (node-based DSP graph) — surprisingly capable. Includes spatial audio, occlusion, attenuation curves out of the box. Can ship AAA-quality audio without middleware for some projects.
- **Limitation**: Both engines require manual event-system layer (custom asmdef / module) if you want sound-designer-driven workflows. Middleware solves this for free.

### Choosing Middleware

| Budget / Scope | Recommendation |
|----------------|----------------|
| Solo / micro-indie (< 50k budget) | Engine-native (Unity AudioMixer or Unreal MetaSound) |
| Indie (50k-500k budget) | FMOD free tier — best ROI |
| Mid-tier (500k-2M budget) | FMOD Indie/Basic OR Wwise Pro (decide on team familiarity) |
| AAA (2M+ budget) | Wwise Premium / Platinum — deeper QA + support justifies cost |

Switching middleware mid-project costs 1-3 months of senior audio programmer time. Decide before vertical slice.

---

## Spatial Audio

### Platform Standards

| Standard | Platform | Notes |
|----------|----------|-------|
| Sony Tempest 3D AudioTech | PS5 native | Proprietary 3D audio engine, ~5,000 simultaneous sound sources. Renders to Dolby Atmos HDMI devices or stereo headphones with HRTF. |
| Dolby Atmos for Games | Xbox Series X/S, PC, PS5 (via Tempest passthrough) | Object-based, 32 simultaneous sound objects + bed channels. Microsoft Spatial Sound on Xbox / Windows. |
| Microsoft Windows Sonic | Xbox / PC (free alternative to Atmos) | Free spatial audio engine on Windows + Xbox. Less rich than Atmos but no licensing cost. |
| Apple Spatial Audio | iOS / macOS / Apple TV / Vision Pro | Built-in HRTF + head tracking on supported AirPods. |

### VR Spatial Audio

| SDK | Cost | Notes |
|-----|------|-------|
| Meta XR Audio SDK | Free | Quest 2/3/Pro spatial audio, HRTF, room acoustics. |
| Steam Audio (formerly Phonon) | Free, open source (Valve) | Cross-platform: Windows, Linux, macOS, Android. Binaural HRTF, geometry-based occlusion + reverb, no royalties. Integrates with Unity, Unreal, FMOD, Wwise. |
| Resonance Audio (Google) | Free, open source | Cross-platform HRTF spatializer. Maintenance status reduced post-2022 but still functional. |
| Oculus Audio (legacy) | Free | Pre-XR-SDK Meta audio. Mostly subsumed by Meta XR Audio SDK now. |

### HRTF (Head-Related Transfer Function)

Binaural rendering models how listener's head + ears + torso filter incoming sound. Standard for headphone playback. PS5 Tempest, Apple Spatial Audio, Steam Audio, Meta XR Audio all use HRTF.

Trade-off: HRTF improves localization vs naive panning, but personalized HRTF (matching listener's specific anatomy) is still hardware-dependent (Sony PSVR2 eye-tracking-driven HRTF being one frontier).

### Spatializer Selection

For multi-platform titles, **Steam Audio** is the strongest free choice — same audio quality across all platforms, no per-platform conditional code. Middleware (FMOD / Wwise) integrates with Steam Audio plugins.

---

## Dynamic Music

### Interactive Stems

Layered tracks crossfaded by game state. Common pattern:
- Stem 1: ambient / exploration loop
- Stem 2: tension / mid-intensity (enemies nearby)
- Stem 3: combat / high-intensity (engaged)
- Stem 4: percussion / drums (extra urgency on top)

Implementation: middleware sums layers; per-layer volume bus controlled by a "Intensity" parameter. Designer authors curves; engineer just sets the parameter.

### Vertical Remixing

Same compositional bar timed across all stems — layers fade in/out without changing tempo or key. Common in open-world (RDR2, Witcher 3) and roguelikes.

### Horizontal Resequencing

Branching musical segments — when game state changes, jump to a different segment at next musical boundary (downbeat, phrase end). Smoother for genre transitions (exploration → cinematic).

Implementation:
- **Wwise Music Switch** + **Music Playlist** containers — sample-accurate transitions on musical grids
- **FMOD Studio** — parameter automation + multi-instrument timeline + transitions

### Procedural Music

- **MetaSound (UE5)** — node graph for procedural audio, can generate looped textures algorithmically
- **Wwise interactive music + Synth one** — Wwise has a built-in synth + MIDI playback
- Pure code-driven generation (e.g., Pyxis, NEXUS) used in rhythm games (Crypt of the NecroDancer, Beat Saber) — rare outside genre.

### Industry References

- **Halo (Marty O'Donnell)** — vertical remixing combat layers (long-standing standard)
- **Red Dead Redemption 2 (Woody Jackson)** — dynamic score with theme variations at narrative beats
- **Final Fantasy XIV (Masayoshi Soken)** — battle music with phased intensity layers
- **Hades (Darren Korb)** — region-based music with combat overlay
- **Celeste (Lena Raine)** — vertical remix between platforming and dialog states

---

## Voice-Over (VO) Pipeline

### Recording

| Setup | Cost (2026) | Notes |
|-------|-------------|-------|
| Pro studio (LA / London / NY) | $500-$2,000/day + talent + engineer | AAA standard. Studio includes acoustic-treated booth, Pro Tools rig, engineer. |
| Mid-tier regional studio | $200-$500/day | Adequate for non-cinematic VO |
| At-home actor (ISDN / Source-Connect / SessionLink) | Talent rate only | Remote session, common since 2020. Requires actor's home booth meet broadcast standards. |
| AI voice (Replica / ElevenLabs) | $20-$1000/month subscription | Game-dev focused. SAG-AFTRA agreement required for unionized talent. |

### Talent Unions

- **SAG-AFTRA (US)** — 2024-2025 strike led to ratified 2025 Interactive Media Agreement (July 2025). New rates + AI disclosure + consent requirements + strike-protection for digital replicas.
- **Equity (UK)** — separate union; lower rates than SAG-AFTRA typically.
- **JAU (Japan)** — Japan Actors Union; covers Japanese-language VO.

Non-union talent legal but excludes union members and may damage studio relationships for AAA projects.

### AI Voices

| Tool | Pricing (2026) | Use Case |
|------|----------------|----------|
| ElevenLabs Starter | $5/month (≈30 audio-minutes) — commercial use OK | Indie prototyping, NPC barks |
| ElevenLabs Creator | $22/month (≈100 audio-minutes) + Professional Voice Cloning | Custom voices |
| ElevenLabs Pro | $99/month (≈500 audio-minutes) | Mid-tier production |
| ElevenLabs Scale / Business | $299/mo / $990/mo | High-volume production |
| Replica Studios | Subscription pricing on request | Game-dev focused with SAG-AFTRA union compliance for member voices |

**2024 SAG-AFTRA × Replica agreement** allowed union members to license digital voice replicas under fair terms. **2025 Interactive Media Agreement** requires:
- Disclosure of digital replica use
- Performer consent before generating new audio
- Right to suspend consent during strikes
- Usage reports to performers

Llama Productions (Epic Games subsidiary) faced unfair labor practice charge May 2025 over Darth Vader AI voice in Fortnite — a cautionary case for AI VO without union compliance.

### Localization VO

- 10+ languages of full VO = 30-50% of total audio budget
- Cost per language: $500-$5,000 per hour of dialogue (varies by language, market, talent)
- Re-record lipsync animation or accept lip mismatch (most non-cinematic games accept mismatch; AAA cinematics use per-language phoneme tracks)
- Pivot translation: English script first, then localize from English to all targets — keeps voice direction consistent

### Lipsync

| Tool | Cost | Notes |
|------|------|-------|
| Oculus LipSync (Unity / Unreal plugin) | Free | Real-time viseme generation from audio, basic quality |
| JALI Research | License on request | High-quality automated facial animation, used in Cyberpunk 2077 |
| Reallusion CrazyTalk + iClone | $99-$499 | Mid-tier facial animation pipeline |
| Apple ARKit / Live Link Face | Free | iPhone-based real-time face capture, exports to Unreal |

---

## Audio Standards

### Compression Targets

| Asset Type | Codec | Bitrate | Sample Rate | Channels |
|------------|-------|---------|-------------|----------|
| Music | Opus (modern) or Vorbis (legacy) | 256 kbps | 48 kHz | Stereo |
| SFX (general) | Opus | 96-128 kbps | 44.1 kHz | Mono (3D source) or Stereo (UI/cinematic) |
| SFX (small UI) | Opus | 64-96 kbps | 22.05 kHz | Mono |
| Voice-Over (dialogue) | Opus | 64-96 kbps | 22.05 kHz | Mono |
| Voice-Over (cinematic stereo) | Opus or Vorbis | 128-192 kbps | 44.1 kHz | Stereo |

Opus is dominant in 2026 — single codec covers speech (low bitrate) and music (higher bitrate) with consistent quality. Vorbis remains for legacy pipelines / platforms without Opus decoder.

### Audio Memory Budgets

| Platform | Streaming Budget | Resident Budget |
|----------|------------------|-----------------|
| Mobile | ≤ 64 MB | ≤ 32 MB |
| Switch | ≤ 128 MB | ≤ 64 MB |
| Last-gen console | ≤ 256 MB | ≤ 128 MB |
| Current-gen (PS5/XSX) | ≤ 512 MB | ≤ 256 MB |

Streaming = decoded from disk on demand (music, long dialogue). Resident = loaded into RAM (SFX, short barks). Going over resident budget = audio dropouts.

### Sample Rates

48 kHz is the modern default (matches video standard). 44.1 kHz is CD-quality legacy still common. 22.05 kHz acceptable for compressed dialogue / minor SFX. Never go below 22.05 kHz for shipped content — aliasing artifacts become audible.

---

## Audio Implementation Patterns

### Audio Events

Abstract layer between code and assets:
- Code posts: `AudioEvent.Post("Player_Footstep_Wood")`
- Middleware (FMOD/Wwise event) decides: which sample, what volume, what pitch variation, what spatializer config
- Sound designers iterate on the event in middleware; no code changes

Anti-pattern: directly referencing audio clips in code. Hardcoded clip references prevent sound design iteration and complicate localization VO swapping.

### Mixer States / Snapshots

Pre-authored audio mixer presets switched by game state:
- **Combat snapshot** — boost SFX, duck music
- **Cinematic snapshot** — boost dialogue, lower SFX, no UI
- **Menu snapshot** — UI sounds prominent, ambient bed faded out
- **Pause snapshot** — duck game world, leave menu UI

Implemented via Unity AudioMixer Snapshots, FMOD Mixer Snapshots, Wwise States.

### Ducking

Dialogue automatic priority over SFX/music — when VO plays, music + SFX bus auto-attenuates by 6-12 dB. Critical for narrative clarity.

Implementation: sidechain compression in middleware mixer; or middleware-native "ducking" mechanism (FMOD compressor + sidechain, Wwise Auto-Ducking).

### 3D Attenuation Curves

Volume/filter rolloff with distance:
- **Linear**: simple but unnatural at distance
- **Logarithmic**: realistic (real-world inverse square)
- **Custom designer-authored**: most middleware allows hand-drawn curves for artistic intent

Standard curves: min distance (full volume) ≈ 1-3 m for character sounds; max distance (silent) ≈ 20-50 m for general SFX, 100-200 m for explosions / loud events.

### Occlusion

Raycast from listener to sound source through scene geometry. If raycast hits a wall:
- Apply low-pass filter (cuts high frequencies — muffled sound)
- Reduce volume
- Optional reverb send to a "behind wall" reverb bus

Steam Audio + Wwise Spatial Audio handle geometric occlusion + reflection automatically using scene mesh.

---

## Accessibility

Audio accessibility is now baseline-expected, increasingly mandated (EAA in EU from June 2025 for new releases of large publishers).

### Mono Audio Option

Setting that downmixes all audio to identical mono signal in both ears — critical for hearing-impaired players with single-ear hearing or asymmetric loss.

Implementation: AudioMixer global "Mono" toggle in settings menu; downmix all panning to center.

### Visual Sound Indicators

Common accessibility feature:
- **Compass pings** showing direction of nearby footsteps / gunshots
- **Damage direction indicators** (visual + haptic) for hits from off-screen
- **Subtitle annotations** for non-speech audio: `[Door creaks]`, `[Footsteps approaching from right]`

Industry references: The Last of Us Part II (extensive accessibility), Forza Horizon 5 (visual audio cues), Sea of Thieves (proximity chat indicators).

### Subtitles + Closed Captions

Minimum requirements (2026 standard):
- Subtitles can be toggled on/off
- Subtitle font size selectable (small / medium / large)
- Subtitle background opacity adjustable (0-100%)
- Speaker name labels for dialogue
- Closed captions including non-speech audio descriptions
- High-contrast color option (white-on-black or yellow-on-black)
- Subtitle position adjustable (top/bottom) to avoid UI overlap

### Independent Volume Sliders

Minimum required separation:
- **Master**
- **Music**
- **SFX**
- **Voice / Dialogue**
- **Ambient** (optional but recommended)

Some titles add: **UI**, **Menu music**, **Voice chat (multiplayer)**.

### Spatial Audio Toggle

Some players (especially hearing-impaired or those using specific headphone setups) prefer to disable HRTF/spatial audio in favor of basic stereo. Provide a toggle.

### Audio Compatibility

Test with:
- Stereo headphones
- 5.1/7.1 surround speakers
- Single-ear headset (accessibility scenario)
- Mono TV speakers (common in casual setups)
- Bluetooth headphones (compressed, often higher latency)

---

## Sources

- [FMOD Studio licensing (official)](https://www.fmod.com/licensing)
- [Wwise pricing (Audiokinetic)](https://www.audiokinetic.com/en/wwise/pricing/)
- [Steam Audio SDK + docs (Valve)](https://valvesoftware.github.io/steam-audio/)
- [Sony Tempest 3D AudioTech (PS5)](https://www.playstation.com/en-us/accessories/3d-audio/)
- [ElevenLabs pricing (official)](https://elevenlabs.io/pricing)
- [SAG-AFTRA Interactive Media Agreement 2025](https://www.sagaftra.org/contracts-industry-resources/interactive/2025-interactive-media-video-game-agreement)
- [SAG-AFTRA × Replica Studios AI Voice Agreement (CES 2024)](https://www.sagaftra.org/sag-aftra-and-replica-studios-introduce-groundbreaking-ai-voice-agreement-ces)
- [Variety: SAG-AFTRA video game contract ratified](https://variety.com/2025/gaming/news/video-game-actors-strike-contract-ratified-sag-aftra-1236451291/)
- [Unreal Engine MetaSound documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/metasounds-overview-in-unreal-engine)
- [Unity Audio documentation](https://docs.unity3d.com/Manual/Audio.html)
