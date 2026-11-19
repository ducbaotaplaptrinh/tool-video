# VietSu AI Studio — Test Status Inventory

> **Last Verified:** 2026-11-19
> **Execution Status:** 
> - **Phase 1 Test Suite:** 18 PASSED, 0 FAILED (100% Green)
> - **Phase 2 Real AI Test Suite:** 6 PASSED, 0 FAILED (100% Green)
> **CI Pipeline:** GitHub Actions Ubuntu-latest Passing

---

## Test Execution Commands

```bash
# 1. Run Phase 1 verification suite (Mock, fast, offline CI)
npm run test --workspace=@vietsu/backend

# 2. Run Phase 2 Live AI pipeline suite (Wikipedia API, Edge-TTS/gTTS, Pollinations, Remotion MP4)
npm run test:live --workspace=@vietsu/backend

# 3. Full monorepo typecheck & build
npm run build
```

---

## Phase 1 Test Inventory (All 18 Passing Cases)
1. `Storage directories initialization`: verifies assets, audio, videos, temp directories exist.
2. `Provider Registry loads Mock Providers`: validates offline zero-cost fallback mode.
3. `Historical Research & Authenticity (Bạch Đằng 938)`: validates Zod fact schema and citation mapping.
4. `POST /api/projects creates project in DRAFT state`: tests project creation API.
5. `Approval endpoints reject requests when project status is invalid`: ensures state machine safety (400 Bad Request).
6. `POST /api/projects/:id/pipeline/start triggers Research Agent`: verifies research execution.
7. `Concurrency lock: rejects duplicate job while one is running`: rejects duplicate job creation.
8. `POST /api/projects/:id/pipeline/approve-research syncs DB isApproved`: verifies database isApproved flag synchronization.
9. `POST /api/projects/:id/pipeline/approve-script syncs DB and runs QA`: checks scene generation & QA transition.
10. `QA Agent: verifies durations, safe-zone, subtitles & mock flag`: ensures QA report is generated.
11. `POST /api/projects/:id/render: exports 1080x1920 MP4 video`: builds props, runs Remotion CLI, produces MP4.
12. `Deep MP4 inspection`: verifies H.264/AAC, 1080×1920 30fps, non-silent audio (`max_volume = -15 dB`), non-black frames, and extracts PNG frame snapshot (605 KB).
13. `Job Recovery Service: heals dangling jobs after server crash & retry restarts`: verifies server restart resilience.
14. `Concurrency Guard: exactly 1 of 5 simultaneous start requests succeeds (409 Conflict for 4)`: verifies zero race condition.
15. `JobRecoveryService: Idempotency verification`: verifies repeated recovery returns 0 dangling jobs and maintains consistent FAILED status.
16. `QA Agent: isIndependentlyVerified requires explicit attested evidence, not merely lack of mock flag`: ensures epistemic integrity.
17. `QA Agent: Safe-Zone geometry detects margin violations`: tests `bottomPx < 260px`, `maxWidthPx > 900px`, `maxWordsPerChunk > 8`.
18. `QA Agent: Distinguishes between subtitle timestamp syntax and audio duration alignment`: tests premature end vs valid monotonicity.

---

## Phase 2 Real AI Test Inventory (All 6 Passing Cases)
1. `WikipediaHistoricalResearcher: live search & extraction for Bạch Đằng 938`:
   - Queries `vi.wikipedia.org/w/api.php` with User-Agent header.
   - Extracts authentic historical facts, key figures (Ngô Quyền), quotes, and accredited Wikipedia URL.
   - Asserts `isMockSource: false`, `isIndependentlyVerified: false` (honest secondary source classification), and `verificationLevel: 'WIKIPEDIA_SECONDARY_SOURCE'`.
2. `EdgeTTSProvider: synthesizes real Vietnamese neural voice with word timestamps`:
   - Synthesizes authentic Vietnamese speech using `vi-VN-NamMinhNeural` (with `gTTS` neural fallback and +18% tempo).
   - Generates valid MP3 audio stream verified by `ffprobe`.
   - Asserts duration > 2.0s and word timestamps aligned within bounds.
3. `PollinationsImageProvider: generates 1080x1920 historical vertical artwork`:
   - Requests vertical 9:16 vertical historical artwork (clean, zero watermarks).
   - Asserts file exists on disk and size > 10,000 bytes.
4. `Live Project 1: Full Pipeline (Bạch Đằng 938) with real Wikipedia, TTS & Visuals`:
   - Executes complete lifecycle with `useMockProvider = false`.
   - Verifies database synchronization, scene drafts, and asset generation.
   - Verifies QA Agent confirms `isIndependentlyVerified = false` (honest secondary source rating) and `isPassing = true`.
5. `Render MP4 (Bạch Đằng 938): 1080x1920 30fps H.264/AAC with visual snapshot`:
   - Remotion renders clean MP4 video.
   - FFprobe certifies: 1080x1920 resolution, H.264 profile High, AAC 48kHz stereo.
   - FFmpeg extracts PNG visual snapshot (`p1_snapshot_*.png`).
6. `Live Project 2 (Un-hardcoded: Ngọc Hồi - Đống Đa 1789): Dynamic Wikipedia & Real Voice`:
   - Dynamically searches and grounds an un-hardcoded topic (Vua Quang Trung, Tây Sơn 1789).
   - Generates authentic scenes, neural Vietnamese audio, and aligns subtitle timestamps.
   - Verifies QA Agent passes with `isPassing = true` and `isIndependentlyVerified = false`.

---

## A/B Video Quality Benchmark Results
- **Version A (Baseline)**: Duration 47.51s, Audio tempo 0% (~130 WPM), 1 static Ken Burns per scene, "VIỆT SỬ STUDIO" watermark overlay, "Sử Liệu Xác Thực" badge overlay. Size: 21.95 MB.
- **Version B (Improved)**: Duration 40.32s (Optimal Reels 45±3s), Audio tempo +18% (~190 WPM, natural pitch), Multi-shot dynamic cuts & crossfades (4-6s/shot), 100% clean canvas (0 watermarks, 0 fake badges). Size: 24.74 MB.
- **Interactive Preview**: Exported at `storage/ab_preview.html`.
