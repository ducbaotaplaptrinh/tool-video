# VietSu AI Studio — Agent Handoff Protocol

> **Purpose:** Ensures seamless session transitions without context degradation or token re-exploration.

---

## Session State at Last Handoff
- **Git Branch:** `feat/video-quality-improvement`
- **Base PR:** PR #2 (`feat/phase2-agent-memory-and-real-ai` -> `main`, 100% Green CI on GitHub Actions).
- **Working Tree:** All video quality improvements complete, compiled, tested, and verified.
- **Test Baselines:**
  - `npm run test`: 18 PASSED, 0 FAILED (Phase 1 Hardening & Regression Suite).
  - `npm run test:live`: 6 PASSED, 0 FAILED (Phase 2 Real AI & Dual Topic Video Generation Suite).
- **Rendered Artifacts:**
  - `storage/videos/bach_dang_938_version_A_baseline.mp4` (Duration: 47.51s, Size: 21.95 MB, 1080x1920 30fps H.264/AAC).
  - `storage/videos/bach_dang_938_version_B_improved.mp4` (Duration: 40.32s, Size: 24.74 MB, 1080x1920 30fps H.264/AAC, Multi-shot dynamic cuts & crossfade, 0 watermarks).
  - `storage/ab_preview.html`: Interactive A/B video player with technical metrics table and comparison.
  - Real authentic Wikipedia records, Pollinations AI imagery, and Edge-TTS/gTTS Vietnamese neural speech (+18% tempo).

---

## Instructions for Incoming Agent (Step-by-Step)
1. **Verify Git State**: Run `git status` and `git branch`. Confirm on `feat/phase2-agent-memory-and-real-ai`.
2. **Review Memory Files**:
   - Read `.agent-memory/PROJECT_STATE.md` (Architecture, Database & Pipeline components).
   - Read `.agent-memory/CURRENT_TASK.md` (Sprint status & verified deliverables).
   - Read `.agent-memory/BLOCKERS.md` (Constraints: $0 paid API mandate, no hallucination, no direct push to main).
   - Read `.agent-memory/TEST_STATUS.md` (Commands and test coverage).
3. **Query Graphify**:
   - Run `graphify explain "<component>"` before modifying any core module (e.g. `WorkflowEngine`, `LiveLLMProvider`, `EdgeTTSProvider`, `QAAgent`).
   - Run `graphify path "<source>" "<target>"` to check dependency links across monorepo packages.
4. **Run Verification Commands**:
   - `npm run build`
   - `npm run test`
   - `npm run test:live`
5. **Update Handoff Before Turn Exit**:
   - Always record modified files, test outputs, and new decisions in `.agent-memory/`.
