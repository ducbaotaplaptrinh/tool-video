# VietSu AI Studio — Agent Handoff Protocol

> **Purpose:** Ensures seamless session transitions without context degradation or token re-exploration.

---

## Session State at Last Handoff
- **Git Branch:** `feat/phase2-agent-memory-and-real-ai`
- **Base PR:** PR #1 (`feat/phase1-hardening-and-verification` -> `main`, 100% Green CI on GitHub Actions).
- **Working Tree:** All Phase 2 implementations complete, compiled, tested, and ready for commit.
- **Test Baselines:**
  - `npm run test`: 18 PASSED, 0 FAILED (Phase 1 Hardening & Regression Suite).
  - `npm run test:live`: 6 PASSED, 0 FAILED (Phase 2 Real AI & Dual Topic Video Generation Suite).
- **Knowledge Graph:** Updated at `graphify-out/` (663 nodes, 1273 edges, 35 communities).
- **Rendered Artifacts:**
  - `vietsu_a4c4ac3e-ea0d-4817-9853-113567abbe2b_1795083469323.mp4` (Bạch Đằng 938: 1080x1920 30fps H.264/AAC, 33.16 MB).
  - Visual PNG snapshot extracted and verified (562 KB).
  - Real authentic Wikipedia records, Pollinations AI imagery, and Edge-TTS/gTTS Vietnamese neural speech.

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
