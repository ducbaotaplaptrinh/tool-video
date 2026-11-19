# VietSu AI Studio — Project State

> **Updated:** 2026-11-19
> **Current Phase:** Phase 2 (Real AI Integration & Agent Memory)
> **Branch:** `feat/phase2-agent-memory-and-real-ai` (based on hardened `feat/phase1-hardening-and-verification`)
> **PR References:** 
> - PR #1 (`feat/phase1-hardening-and-verification` -> `main`): CI Green 100% (`44487394294`)
> - PR #2 (`feat/phase2-agent-memory-and-real-ai` -> `main`): CI Green 100% (`44508576148`, `44508567543`)

---

## 1. Monorepo Architecture Overview
The repository is an npm workspace monorepo consisting of:
- `packages/shared`: Data schemas, domain types, Zod validators (`ResearchDossier`, `ScriptDocument`, `VietSuReelProps`, `QAReport`, `SubtitleLayoutSpecs`).
- `packages/ai-providers`: Abstract interfaces (`ILLMProvider`, `IImageProvider`, `ITTSProvider`, `IVideoProvider`), `ProviderRegistry`, Mock implementations, and Live implementations.
- `apps/backend`: Express.js + Prisma ORM + Multi-Agent Workflow Engine + Local Storage.
- `apps/video-renderer`: Remotion composition (1080×1920 @ 30fps) + FFmpeg rendering engine.
- `apps/frontend`: React 18 + Vite + Tailwind CSS + Lucide React dashboard.

## 2. Active AI Agent Pipeline
1. **Research Agent**: Queries authentic history, categorizes into `CONFIRMED_FACT`, `HISTORICAL_HYPOTHESIS`, `FOLKLORE_LEGEND` with verified citations.
2. **Script Agent**: Generates 3-act story (Hook, Context, Climax, Resolution) with scene breakdowns and camera motions.
3. **Visual Agent**: Produces 9:16 aspect ratio cinematic historical imagery.
4. **Voice Agent**: Produces Vietnamese voiceover with word-level boundary timestamps.
5. **Editor Agent**: Synchronizes audio duration to video frames, layers kinetic subtitles in Reels safe zone.
6. **QA Agent**: 5-point quality assurance checking duration, subtitle monotonicity, safe-zone bounding box, audio-waveform presence, and epistemic source verification.

## 3. Database State & Schemas
- SQLite local database via Prisma at `apps/backend/prisma/dev.db`.
- Entities: `Project`, `ResearchItem`, `Script`, `Scene`, `MediaAsset`, `Job`, `CostLog`.
- Status Lifecycle: `DRAFT` → `RESEARCHING` → `RESEARCH_PENDING_APPROVAL` → `SCRIPTING` → `SCRIPT_PENDING_APPROVAL` → `GENERATING_ASSETS` → `EDITING` → `QA_CHECKING` → `READY_TO_RENDER` → `RENDERING` → `COMPLETED` (or `FAILED`).
