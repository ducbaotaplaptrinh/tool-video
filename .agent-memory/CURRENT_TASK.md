# VietSu AI Studio — Current Task

> **Active Sprint:** Video Quality Improvement & Pacing Hardening
> **Status:** ALL TASKS COMPLETED (100% Tested & Verified)
> **Branch:** `feat/video-quality-improvement`

---

## Task Checklist & Execution Record

- [x] **Task 1: Speech Pacing & Voice Selection Enhancement**
  - Added voice gender selection: `vi-VN-NamMinhNeural` (male) / `vi-VN-HoaiMyNeural` (female).
  - Increased speech tempo to `+18%` (speed ratio `1.18` via FFmpeg `atempo`, preserving authentic pitch and resonance).
  - Benchmarked voice configurations across word-per-minute metrics (increased from ~130 WPM to ~190 WPM).
  - Implemented dual-engine resilience: Edge-TTS with automatic fallback to Google Neural TTS (`gTTS`). Zero silent mock fallback in live mode.

- [x] **Task 2: Acoustic Sentence Boundary Subtitle Synchronization**
  - Replaced naive linear interpolation with acoustic sentence boundary detection using FFmpeg `silencedetect` (`noise=-30dB`, `d=0.2`).
  - Mapped words strictly to active spoken segments, eliminating subtitle drift during punctuation pauses.
  - Mathematically bounded the final word subtitle end to match audio duration within 0.15s.

- [x] **Task 3: Word Budgeting & Duration Control**
  - Script Agent targets 45s Reels with word budgeting (~2.8 words/sec, ~120-130 words across 4 scenes).
  - Version B output verified at 40.32s, strictly within the 30-60s Facebook Reels envelope (compared to Version A's 47.51s).

- [x] **Task 4: Dynamic Multi-Shot Visual Rhythm**
  - Extended Remotion composition with `visualShots` supporting dynamic sub-shots (4-6s per shot).
  - Added smooth `cut` and `crossfade` transitions in `KenBurnsScene.tsx`.
  - Auto-split scenes $\ge 7$s into 2 shots in `EditorAgent`.

- [x] **Task 5: Zero-Watermark & Clean Canvas Mandate**
  - Set default `showBranding: false` and `showHistoricalBadge: false`.
  - Removed all `VIỆT SỬ STUDIO` overlays and badges.
  - Cleaned mock SVG graphics generator of all era text banners, topic titles, and bottom watermarks.

- [x] **Task 6: Epistemic Honesty & Verification Level**
  - Wikipedia citations honestly classified as `verificationLevel: 'WIKIPEDIA_SECONDARY_SOURCE'` with `isIndependentlyVerified: false`.
  - QA Agent and tests updated to require primary ancient chronicle / excavation evidence for independent verification.

- [x] **Task 7: A/B Testing, Benchmarking & Interactive HTML**
  - Rendered Version A (Baseline: 47.51s, 0% speed, watermark, 1 shot/scene) and Version B (Improved: 40.32s, +18% speed, clean canvas, multi-shot).
  - Generated side-by-side interactive comparison web player at `storage/ab_preview.html`.
  - Ran full test suite: 18 Phase 1 tests PASSED, 6 Phase 2 live tests PASSED, 100% build PASSED.
