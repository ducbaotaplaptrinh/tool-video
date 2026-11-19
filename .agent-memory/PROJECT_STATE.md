# VietSu AI Studio — Project State

> **Updated:** 2026-11-19
> **Current Phase:** Phase 2 Video Quality Improvement
> **Branch:** `feat/video-quality-improvement` (based on `feat/phase2-agent-memory-and-real-ai`)
> **PR References:** 
> - PR #1 (`feat/phase1-hardening-and-verification` -> `main`): CI Green 100% (`44487394294`)
> - PR #2 (`feat/phase2-agent-memory-and-real-ai` -> `main`): CI Green 100% (`44508576148`, `44508567543`)
> - Active Working Branch: `feat/video-quality-improvement`

---

## 1. Monorepo Architecture Overview
The repository is an npm workspace monorepo consisting of:
- `packages/shared`: Data schemas, domain types, Zod validators (`ResearchDossier`, `ScriptDocument`, `VietSuReelProps`, `QAReport`, `SubtitleLayoutSpecs`, `VisualShot`).
- `packages/ai-providers`: Abstract interfaces (`ILLMProvider`, `IImageProvider`, `ITTSProvider`, `IVideoProvider`), `ProviderRegistry`, Mock implementations, and Live implementations (EdgeTTS with gTTS fallback + acoustic boundary alignment, Wikipedia researcher, Pollinations + SVG fallback).
- `apps/backend`: Express.js + Prisma ORM + Multi-Agent Workflow Engine + Local Storage.
- `apps/video-renderer`: Remotion composition (1080×1920 @ 30fps) with multi-shot transitions (cut & crossfade) + FFmpeg rendering engine.
- `apps/frontend`: React 18 + Vite + Tailwind CSS + Lucide React dashboard.

## 2. Active AI Agent Pipeline
1. **Research Agent**: Queries authentic history via Wikipedia API, categorizes into `CONFIRMED_FACT`, `HISTORICAL_HYPOTHESIS`, `FOLKLORE_LEGEND` with honest `verificationLevel` (`WIKIPEDIA_SECONDARY_SOURCE`).
2. **Script Agent**: Generates 3-act story (Hook, Context, Climax, Resolution) with word budgeting (~2.8 words/sec, target 45s reel) and camera motions.
3. **Visual Agent**: Produces 9:16 aspect ratio cinematic historical imagery without text clutter or banners.
4. **Voice Agent**: Produces Vietnamese voiceover with +18% natural tempo and acoustic sentence boundary timestamps via FFmpeg `silencedetect`.
5. **Editor Agent**: Auto-splits scenes into dynamic 4-6s sub-shots (`cut` and `crossfade`), renders zero-watermark clean canvas.
6. **QA Agent**: 5-point quality assurance checking duration, subtitle monotonicity, safe-zone bounding box, audio-waveform presence, and epistemic source verification.

## 3. Database State & Schemas
- SQLite local database via Prisma at `apps/backend/prisma/dev.db`.
- Entities: `Project`, `ResearchItem`, `Script`, `Scene`, `MediaAsset`, `Job`, `CostLog`.
- Status Lifecycle: `DRAFT` → `RESEARCHING` → `RESEARCH_PENDING_APPROVAL` → `SCRIPTING` → `SCRIPT_PENDING_APPROVAL` → `GENERATING_ASSETS` → `EDITING` → `QA_CHECKING` → `READY_TO_RENDER` → `RENDERING` → `COMPLETED` (or `FAILED`).
