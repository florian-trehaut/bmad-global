# Domain Sub-File: Asset Pipeline

Production-grade asset pipeline reference for game development teams. Covers DCC tool selection, texture/mesh/animation pipelines, version control, build-time cooking/baking, naming standards, and the 2026 reality of AI-generated assets.

Master file: `domains/game-dev.md`. This sub-file is JIT-loaded by workflows touching art/content authoring, build pipelines, or asset versioning decisions.

---

## DCC Tool Selection

DCC (Digital Content Creation) tooling drives 60-80% of the art budget on a game. Choose tools by license cost, team expertise, and engine integration — not by raw feature lists.

### 3D Modeling

| Tool | License (2026) | Strength | Typical Use |
|------|----------------|----------|-------------|
| Blender | Free, GPL | Full DCC stack, modeling + sculpting + animation + simulation. Industry adoption climbing (Embark, Ubisoft pilots). | Indie default; AAA optional |
| Maya | $1,875/year (or $245/month) | AAA animation pipelines, Mocap retargeting, robust rigging. Industry standard for cinematics. | AAA studios |
| 3ds Max | $1,875/year | ArchViz + Games hybrid, strong modifier stack. | ArchViz studios, some game studios |
| Modo | $719/year (subscription) | Procedural modeling, replication tools. | Smaller pipelines |
| Cinema 4D | $116.91/month or $1,403/year | Motion graphics, marketing assets. | Cinematic / marketing |

**Recommendation matrix:**
- Solo / micro-indie: Blender (zero license cost, complete pipeline)
- Indie (2-10 people): Blender for content, optional Maya seat for rigging lead
- Mid-tier (10-50): Maya core seats + Blender on outsourced contractors
- AAA (50+): Maya enterprise + studio-specific custom tools

### Sculpting

| Tool | License (2026) | Notes |
|------|----------------|-------|
| ZBrush (Maxon) | $49/month or $399/year (includes ZBrush for iPad) | Industry leader for hi-poly sculpting, retopology, normal map baking. ZBrush 2026.x cycle as of May 2026. |
| Maxon One bundle | $99.91/month annual | ZBrush + Cinema 4D + Red Giant + Redshift + Forger — best deal if you need C4D too |
| Blender Sculpt | Free | Capable for organic forms, less optimal for hard-surface than ZBrush. Multires + Dyntopo workflows. |
| 3DCoat | $379 perpetual / $99/year subscription | Voxel sculpting + retopo + texture painting in one tool. |

### Texturing

| Tool | License (2026) | Notes |
|------|----------------|-------|
| Substance 3D Painter (Adobe) | $24.99/month or $249.88/year (Texturing plan) — perpetual $199.99 still available | Industry standard PBR texturing. Adobe announced subscription price increase in 2025. |
| Substance 3D Collection | $59.99/month or $599.88/year — adds Designer, Sampler, Stager, Modeler | Recommended if pipeline includes procedural materials (Designer) |
| Substance 3D Teams | $119.99/month or $1,439.88/year | Multi-seat with cloud asset sharing |
| Quixel Mixer | Free (Epic ownership, indefinite free tier) | Mixer + Megascans library integration, smart materials. |
| 3DCoat Texture room | Bundled with 3DCoat license | PBR painting integrated in voxel + retopo workflow |

### Procedural / Simulation

| Tool | License (2026) | Notes |
|------|----------------|-------|
| Houdini Indie (SideFX) | $299/year — eligibility: < $100k annual gross revenue, max 3 seats | Procedural king. Cinematics VFX, environment generation, destructible meshes, simulations. |
| Houdini Core / FX | $1,995/year (Core) / $4,495/year (FX) studio | Full commercial license, no revenue cap. |
| Houdini Engine Indie | Free addon to Indie | Background processing / command-line cook |
| Embergen (JangaFX) | $19.99/month indie ($299/year) / $49.99/month studio | Real-time VFX simulation (fire, smoke, explosions). Outputs flipbooks / VAT. |

### 2D Pixel Art

| Tool | License (2026) | Notes |
|------|----------------|-------|
| Aseprite | $19.99 one-time on Steam or direct (source-available under EULA) | De-facto pixel art standard. Animation timeline, onion skinning, tilemap, Lua scripting. |
| Pyxel Edit | $9 one-time (Windows / Mac, single-developer maintenance) | Strong for tileset authoring |
| Pro Motion NG | $42 (Hobby) / $79 (Pro) one-time | Classic Amiga-lineage tool, large palette workflows |

### 2D Vector / Illustration

| Tool | License (2026) | Notes |
|------|----------------|-------|
| Affinity Designer 2 | $69.99 one-time (Mac/Win/iPad) | Strong indie alternative to Illustrator, no subscription |
| Adobe Illustrator | $22.99/month (single app) | Industry default for marketing/UI vector |
| Inkscape | Free, GPL | Open-source vector editor, SVG-native |
| Krita | Free, GPL | Concept art / digital painting, animation timeline since 4.x |

### License Cost Matrix (annualized, indie team of 5)

| Stack | Annual Cost |
|-------|-------------|
| All free (Blender + Krita + Inkscape + Mixer) | $0 |
| Indie standard (Blender + ZBrush + Substance Painter + Aseprite x2) | ~$1,200 |
| Indie premium (add Houdini Indie + Cascadeur Indie) | ~$1,600 |
| Mid-tier (Maya x2 + ZBrush x3 + Substance Teams + Houdini Core x1) | ~$13,000 |
| AAA section pipeline (Maya x10 + ZBrush x10 + Substance x10 + Houdini FX x3) | ~$55,000+ |

---

## Texture Strategies

### Texture Atlasing

Two strategies:
- **Eager atlasing** — bake atlas at build/import time. Predictable runtime, larger build size. Unity Sprite Atlas, Unreal Texture Atlas.
- **Runtime atlasing** — DOTS sprite batcher (Unity) packs sprites per frame. Better for highly dynamic content (UI, cards).

Atlas size budget: 2048x2048 (PC/console), 1024x1024 (mobile). Exceeding GPU max texture size (4096 on low-end mobile) fails on load.

### Texture Compression

| Format | Use Case | Notes |
|--------|----------|-------|
| ASTC | Mobile baseline (iOS Metal, Android Vulkan/GLES 3.2) | Block-based, variable bitrate. Replaces ETC2 on modern mobile. |
| BC7 / BC1-BC5 (DXT) | PC / Console PBR pipelines | BC7 for color/normal high-quality, BC5 for normal maps (2-channel), BC1 (DXT1) legacy diffuse. |
| ETC2 | Legacy Android (pre-Vulkan, GLES 3.0) | Falling out of use 2026; keep as fallback when targeting < Android 8. |
| Crunch / Basis Universal | Cross-platform transcoded format | Stored as Basis, transcoded to platform-native at load. Reduces download size; runtime CPU cost. |

PBR pipeline minimum: BaseColor (BC7), Normal (BC5), MetallicRoughness packed (BC7 or BC5).

### Texture Streaming

- **Unity Texture Streaming** — mip-based streaming, budget-driven (`QualitySettings.streamingMipmapsMemoryBudget`).
- **Unreal Virtual Texturing (VT) / Runtime Virtual Texturing (RVT)** — page-based VT, only resident pixels loaded. Essential for open-world titles (8K+ heightmaps).
- **Sparse Virtual Textures (SVT)** — used by id Tech / Avalanche engines; not standard in Unity/Unreal as of 2026.

### Mip Mapping

Always generate mip chains at import for any texture used in 3D space — without mips, distant textures alias and burn fillrate. Exceptions: UI textures (always sampled 1:1).

### Memory Budget Reference

| Scene Class | VRAM Texture Budget |
|-------------|---------------------|
| Mobile 720p | 256-512 MB |
| Mobile 1080p (high-end) | 512 MB - 1 GB |
| Console 1080p (last gen) | 2-3 GB |
| Console 1440p (PS5/XSX) | 4-6 GB |
| PC 4K Ultra | 8-12 GB |

A typical "1080p AAA scene" averages 2-4 GB texture VRAM after compression and streaming.

---

## Mesh Pipeline

### LOD Generation

| Tool | Notes |
|------|-------|
| Simplygon (Microsoft) | Industry-standard, owned by Microsoft. Free for indies meeting revenue criteria (Microsoft games policy); enterprise pricing on request. Unity package + Unreal plugin. Auto LOD chains, HLOD generation, remeshing. |
| Unity built-in LODGroup | Manual LOD assignment, no auto-decimation. Use with Simplygon or third-party decimators. |
| Unreal Auto LOD | Built into editor, configurable LOD bias per platform. Plus Simplygon Unreal plugin for higher quality. |
| InstantMeshes | Free, open-source auto-retopology |
| Quad Remesher (Exoside) | $109 one-time (indie) / $349 (commercial) — high-quality auto-retopology |

### Imposters

For distant high-poly objects (trees, crowds, hero props), bake to camera-facing billboards or octahedral imposters:
- **Amplify Impostors** (Unity Asset Store, ~$60)
- **Unreal Impostor Plugin** (built-in 5.x)
- **Custom Houdini imposter generation**

Typical use: trees beyond 50m, crowd characters beyond 30m. Saves 90%+ tri/draw cost.

### Polygon Budgets per Platform (2026 typical)

| Platform | Hero Character (tris) | Background Prop (tris) |
|----------|----------------------|------------------------|
| Mobile (Android mid-tier) | 5,000-10,000 | 200-800 |
| Switch | 10,000-20,000 | 500-1,500 |
| Last-gen console (PS4/XB1) | 30,000-50,000 | 1,000-3,000 |
| PS5 / Xbox Series X | 50,000-150,000 (Nanite removes budget) | 2,000-5,000 |
| PC (Ultra) | 100,000+ | 5,000+ |

Note: Unreal Nanite changes this on PS5/XSX/PC by streaming clusters from a hi-poly mesh; no LOD chain required for opaque static meshes.

### Normal Map Bake

Standard workflow: 30k-200k sculpt mesh → 5k-15k retopologized low-poly → bake normal/AO/curvature in Substance Painter or Marmoset Toolbag. This decouples silhouette detail from surface detail.

---

## Animation Pipeline

### Rigging

| Tool | License | Notes |
|------|---------|-------|
| Unity Humanoid Rig | Engine-native, free | Standard skeleton, allows Mocap retargeting between characters |
| Unreal Skeletal Mesh + Skeleton Asset | Engine-native, free | Per-character skeleton, supports IK rigs + Control Rig |
| Mixamo (Adobe) | Free, royalty-free for commercial | Web-based auto-rigger + animation library. Adobe ID required. |
| Advanced Skeleton (Maya) | $349 one-time | Production-grade auto-rigger for Maya |

### Mocap

| Tool | Cost (2026) | Use Case |
|------|-------------|----------|
| Rokoko Smartsuit Pro II | Suit ~$2,999 + Studio software $20-50/month per seat. Full bundle (gloves + face + Studio Pro) $3,500-5,000. | Indie / mid-tier markerless mocap |
| Move.ai | Subscription-based, markerless multi-camera AI mocap | iPhone-based capture for indie |
| Xsens MVN Animate | $5,995-$12,000+ per suit | Professional inertial mocap, IMU-based |
| Vicon / OptiTrack | Studio install $40k-$500k+ | AAA optical mocap volumes |
| Perception Neuron (Noitom) | $1,499-$3,999 | Mid-tier inertial mocap |

### Animation Tools

| Tool | License | Notes |
|------|---------|-------|
| Cascadeur Indie | $99/year ($8/month) — all export formats, commercial use OK | Physics-aware AI-assisted keyframe animation. AutoPosing + AutoPhysics. |
| Cascadeur Pro | $399/year ($49/month) | Full features for studio pipelines |
| Autodesk MotionBuilder | $2,540/year | Industry standard for mocap cleanup and retargeting |
| Blender NLA + Action Editor | Free | Open-source non-linear animation editor |

### Compression

- **Unity Animation Stripping** — strip unused curves at build (Animation Compression settings)
- **Unreal Animation Compression Library (ACL)** — open-source plugin, 5-15x size reduction, drop-in. ACL is the de-facto standard now.
- Without ACL/equivalent compression, mocap-heavy games balloon 100+ MB just in anim data.

### State Machines

- Unity Animator Controller — visual state machine, blend trees
- Unity Mecanim Playable Graph — code-driven, runtime composition
- Unreal Anim Graph + State Machines — Blueprint visual editor
- Unreal Control Rig — runtime IK + procedural overrides

---

## Asset Version Control

Game asset trees grow to TBs. Standard Git breaks at gigabyte scale on binary assets.

| System | Cost (2026) | Best For |
|--------|-------------|----------|
| Perforce Helix Core | Free for up to 5 users self-hosted. Paid: ~$39/user/month (Assembla cloud) or ~$600/user/year traditional license. P4 Cloud managed for teams < 100. | AAA standard. Scales to TBs. File-based locking, optional partial sync (streams). |
| Git LFS | GitHub free up to 1 GB LFS storage + 1 GB/month bandwidth, then $5/month per 50 GB pack. GitLab includes more in default tiers. | Indie projects, small binaries (< 100 MB per file). |
| Plastic SCM (Unity Codeworks DevOps) | Free for small teams (up to 3 users private) / Unity DevOps Cloud Pro $7/user/month | Indie/mid-tier alternative to Perforce, smoother UX. Branch-per-task workflows. |
| Azure DevOps Repos | Free up to 5 users, then $6/user/month | Enterprise option, Git + TFVC. Pairs with Azure Pipelines for CI. |
| Subversion (SVN) | Free | Legacy choice. Still used at some studios for very-large repos; declining. |

### Choosing Matrix

| Team Size | Asset Volume | Distributed? | Recommendation |
|-----------|--------------|--------------|----------------|
| 1-5 | < 10 GB | Yes | Git + Git LFS |
| 1-5 | 10-100 GB | Yes | Plastic SCM (free tier) or Perforce free (≤ 5 users) |
| 5-25 | 100 GB - 1 TB | Mixed | Plastic SCM Cloud or Perforce P4 Cloud |
| 25+ | 1 TB+ | Mostly office | Perforce Helix Core (self-hosted or cloud) |

Locking: AAA pipelines need file locks (binary assets are non-mergeable). Perforce locks natively; Plastic SCM supports locks; Git LFS supports locks but with caveats.

---

## Build Cooking / Baking

### Light Baking

- **Unity Progressive Lightmapper (GPU/CPU)** — bake lightmaps to textures + light probes for indirect on dynamic objects.
- **Unreal Lightmass** — legacy GI baker. Bake into lightmaps + Indirect Lighting Cache (ILC).
- **Unreal Lumen** — real-time GI (UE5+). Removes most lightmap baking for opaque scenes. Software ray tracing fallback for non-RT GPUs.
- **Bakery (Unity Asset Store)** — third-party GPU baker, higher quality + speed than Progressive on some scenes.

Light bake times: small interior scene 5-30 min on workstation; large open world 4-24 hours (often run overnight on render farm).

### Shader Compilation

- **Unity** — Shader variants explode combinatorially with `#pragma multi_compile`. Variant stripping (preprocess + GraphicsSettings preloaded shaders) is critical for mobile; without stripping, build time + memory footprint balloon 10x+.
- **Unreal** — Material editor compiles permutations per shader platform. UE5 PSO precaching addresses runtime hitches (Permanent Shader Object). Console builds require PSO collection profiling pass.

### Texture Compression (Cook Step)

Engines compress textures to platform-native formats at cook/build time:
- Unity: `TextureImporter.SetPlatformTextureSettings` per build target
- Unreal: Texture compression settings + per-platform overrides

Cook texture compression alone for a large project can take 1-4 hours; cache builds (DDC for Unreal, Library/ArtifactDB for Unity) save hours on incremental builds.

### Audio Compression at Bake

| Format | Use Case | Notes |
|--------|----------|-------|
| ADPCM | Short SFX, low CPU decode | Fixed compression ratio ~4:1, no quality control |
| Vorbis (Ogg) | Music, ambient — legacy default | Variable quality (0-10), ~128 kbps target |
| Opus | Modern default — replaces Vorbis on most platforms 2026 | Better quality at lower bitrate; supports both speech and music in single codec |
| PCM (uncompressed) | Hot UI sounds where decode cost matters | 10x size of compressed |

### Asset Bundle / Addressables / Cook Stage

- **Unity Addressables** — built on AssetBundles, runtime-loadable, supports remote CDN, content updates without app store re-submit. Replaces deprecated Resources folder pattern.
- **Unreal Cook stage** — packages all referenced content per platform. Plus iostore + chunking for PS5/XSX fast streaming.

---

## Asset Standards

### Naming Conventions (UE5-style, broadly adopted)

| Asset Type | Prefix | Example |
|------------|--------|---------|
| Texture | `T_` | `T_Character_Hero_BaseColor_2K.png` |
| Material | `M_` | `M_Floor_Stone_01.mat` |
| Material Instance | `MI_` | `MI_Floor_Stone_Mossy.mat` |
| Static Mesh | `SM_` | `SM_Crate_Wood_01.fbx` |
| Skeletal Mesh | `SK_` | `SK_Hero_Body.fbx` |
| Skeleton | `SKEL_` | `SKEL_Hero.uasset` |
| Animation | `A_` or `Anim_` | `A_Hero_Idle_Loop.fbx` |
| Particle / Niagara | `PS_` / `NS_` | `NS_Fire_Torch.uasset` |
| Sound Cue / Event | `SC_` or `SFX_` | `SFX_Footstep_Wood_01.wav` |
| Blueprint | `BP_` | `BP_DoorInteractable.uasset` |
| UI Widget | `WBP_` (Widget Blueprint) | `WBP_MainMenu.uasset` |

Suffix conventions for textures: `_BaseColor` / `_Normal` / `_OcclusionRoughnessMetallic (ORM)` / `_Emissive` / `_Mask`. Resolution suffix optional: `_2K`, `_4K`.

### Folder Structure

Two camps:

**Per-feature folders** — `Content/Characters/Hero/`, `Content/Environments/Forest/`. Tight encapsulation; easier asset deletion when feature cut. Preferred for vertical-slice + AAA pipelines.

**Per-type folders** — `Content/Textures/`, `Content/Materials/`, `Content/Meshes/`. Easier asset discovery, simpler for small teams. Common in Unity Asset Store ecosystem.

**Industry default**: per-feature top-level + per-type sub-folders within. `Content/Characters/Hero/Meshes/`, `Content/Characters/Hero/Textures/`, etc.

### Pivot Conventions

- **Props**: pivot at center bottom (allows snap-to-ground)
- **Characters**: pivot at ground between feet (Unity Humanoid expects this)
- **Modular kit pieces**: pivot at grid origin (snap-grid placement)
- **UI sprites**: pivot at center or anchor point (sprite renderer dependent)

### Unit Scale

- Unity: 1 unit = 1 meter (default, except 2D pixel-perfect setups)
- Unreal: 1 unit = 1 cm (default since UE3 — keep consistent across pipeline)
- Godot: 1 unit = 1 meter (default)
- Blender export: ensure FBX export uses correct scale factor (Maya/Max use cm internally, must export with scale=1 if target engine is Unreal)

Mismatched scale is one of the most common pipeline bugs — characters appearing 100x too big or too small.

---

## AI-Generated Assets (2026 reality)

Generative AI is now mainstream in game pipelines. As of 2025+, **20% of new Steam releases disclose AI use** (up 800% year-over-year), and 7% of the entire Steam library carries AI disclosure (Steam disclosure rules became mandatory in 2024, voluntary historically). 60% of disclosures are for visual asset generation.

### Common Tools

| Tool | Cost (2026) | Use |
|------|-------------|-----|
| Meshy | Free (100 credits/month), Pro $20/mo, Max $60/mo, Enterprise/API $90/mo | Text-to-3D / image-to-3D mesh generation. Pro+ unlocks private + customer-owned assets, API access. |
| Tripo3D | Free tier + paid plans | Image-to-3D + auto-rig, growing competitor to Meshy |
| Stable Diffusion (local / DreamStudio) | Free if self-hosted; cloud ~$0.005-0.02 per image | Concept art ideation. Do NOT ship raw outputs as final textures — copyright risk. |
| Midjourney | $10/month (Basic) / $30 (Standard) / $60 (Pro) | Concept art, mood boards. Same copyright caveats. |
| Suno | Free tier, Pro $10/month, Premier $30/month | Music ideation; output license terms shift — verify before shipping. |
| ElevenLabs | $5/month Starter (≈30 audio-minutes) up to $99/month Pro (≈500 audio-minutes). Scale $299/mo, Business $990/mo. | AI voice. Commercial use starts at Starter tier. Free tier has NO commercial rights. |
| Replica Studios | SAG-AFTRA AI Voice Agreement signed Jan 2024 | Game-dev focused AI voice with union-compliant talent licensing |

### Copyright + Usage Rights

- **Training data lawsuits** ongoing (Stability AI, Midjourney, OpenAI defendants). 2026 outcomes still unsettled.
- **Platform policies shift** — Steam disclosure required since 2024; Sony, Microsoft, Nintendo platform policies under review.
- **IP ambiguity** — US Copyright Office has held that purely AI-generated images cannot be copyrighted (Thaler v. Perlmutter); human authorship required for IP protection. Translating to games: your hand-edited final art is protected; raw AI output may not be.
- **Voice / likeness** — SAG-AFTRA 2025 Interactive Media Agreement requires disclosure of digital replica use in video games and consent from union members. Llama Productions (Epic Games subsidiary) faced unfair labor practice charge in May 2025 over Darth Vader AI voice in Fortnite.

### Risks Checklist

Before integrating AI-generated assets, verify:
1. Tool's training data license + indemnification (Adobe Firefly indemnifies; many tools do not)
2. Output ownership clause (some tools claim joint or non-exclusive rights)
3. Disclosure obligations on target storefront (Steam: mandatory; PlayStation/Xbox: case-by-case)
4. Union compliance if voice / motion / likeness used
5. Documentation: keep prompts, model versions, output dates — audit trail for IP disputes
6. Final art passes through human review + edits — never ship raw outputs as final assets

---

## Sources

- [FMOD Studio licensing (official)](https://www.fmod.com/licensing)
- [Houdini Indie product page](https://www.sidefx.com/products/houdini-indie/)
- [Maxon ZBrush plan options](https://www.maxon.net/en/zbrush-plan-options)
- [Adobe Substance 3D plans](https://www.adobe.com/products/substance3d/plans.html)
- [Aseprite FAQ + licensing](https://www.aseprite.org/faq/)
- [Perforce Helix Core pricing](https://www.perforce.com/resources/vcs/helix-core-pricing)
- [Simplygon Unity features](https://www.simplygon.com/features/unity)
- [Simplygon Unreal Engine features](https://simplygon.com/features/ue)
- [Mixamo FAQ + auto-rigger](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)
- [Rokoko Smartsuit Pro II](https://www.rokoko.com/products/smartsuit-pro)
- [Cascadeur pricing plans](https://cascadeur.com/plans)
- [Meshy pricing](https://www.meshy.ai/pricing)
- [Steam AI Content Disclosure (Steamworks)](https://store.steampowered.com/news/group/4145017/view/3862463747997849618)
- [Steam AI disclosures up 800% in 2025 (VGC)](https://www.videogameschronicle.com/news/steam-games-disclosing-generative-ai-use-are-up-800-this-year/)
- [Unity Localization Manual](https://docs.unity3d.com/Manual/com.unity.localization.html)
