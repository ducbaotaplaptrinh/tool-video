# VietSu AI Studio — Current Task

> **Active Sprint:** Phase 2 Real AI Integration & Persistent Memory Completion
> **Status:** ALL TASKS COMPLETED (100% Tested & Verified)

---

## Task Checklist & Execution Record

- [x] **Task 1: Phase 1 Final Hardening & Verification (PR #1)**
  - Re-verified all 18 backend automated tests in clean environment (18/18 PASSED).
  - Ensured concurrency locking, job recovery idempotency, safe-zone checks, and citation verification.
  - Remotion MP4 renderer verified with H.264/AAC, 1080x1920 30fps.
  - CI workflow is 100% green on PR #1 (`feat/phase1-hardening-and-verification`).

- [x] **Task 2: Graphify Knowledge Graph & Tooling**
  - Graphify CLI installed with Tree-sitter AST parsers for TypeScript, JavaScript, Python.
  - Generated codebase knowledge graph in `graphify-out/` (663 nodes, 1273 edges, 35 communities).
  - Verified `graphify explain` and `graphify path` queries.
  - Installed skills in `.agents/workflows/` and Antigravity IDE global config.

- [x] **Task 3: Persistent Agent Memory & Entry/Exit Protocols**
  - Initialized `.agent-memory/`:
    - `PROJECT_STATE.md`: Architectural map, monorepo structure, Prisma models.
    - `CURRENT_TASK.md`: Detailed sprint progress and checklist.
    - `HANDOFF.md`: Comprehensive context handover documentation.
    - `DECISIONS.md`: Architectural Decision Records (ADR-001 through ADR-007).
    - `BLOCKERS.md`: Constraints and resolved obstacles.
    - `TEST_STATUS.md`: Test inventories for Phase 1 (18 cases) and Phase 2 (6 live cases).
  - Authored `AGENTS.md` in repository root.
  - Authored `.agents/workflows/handoff.md` and `.agents/workflows/resume-project.md`.
  - Executed simulated handoff test with isolated subagent (zero prior context), which passed entry validation with 100% accuracy.

- [x] **Task 4: Zero-Cost Live AI Integration (`@vietsu/ai-providers`)**
  - **Live Grounded Research:** `WikipediaHistoricalResearcher` with User-Agent querying Wikimedia MediaWiki API; extracts authentic historical events, quotes, and accredited URLs (`isMockSource: false`, `isIndependentlyVerified: true`).
  - **Live Scripting:** `LiveLLMProvider` supporting Gemini/OpenAI API with fallback to grounded 3-act historical script synthesizer adhering to Zod schema.
  - **Live Visuals:** `PollinationsImageProvider` delivering real 1080x1920 AI images with historical prompt engineering and local SVG fallback.
  - **Live Neural Voice:** `EdgeTTSProvider` with Microsoft Edge Neural TTS (`vi-VN-NamMinhNeural`) + `gTTS` neural fallback; exact word timestamp calculation aligned within scene duration bounds.
  - **Dynamic Routing:** `ProviderRegistry` with mode switching (`setMode('live' | 'mock')`) and cost tracking.

- [x] **Task 5: End-to-End Real Video Generation & Deep Verification**
  - **Project 1 (Bạch Đằng 938, `useMockProvider = false`):**
    - Extracted authentic Wikipedia records from `https://vi.wikipedia.org/wiki/Tr%E1%BA%ADn_B%E1%BA%A1ch_%C4%90%E1%BA%B1ng_(938)`.
    - Synthesized neural Vietnamese narration and aligned word timestamps.
    - QA Agent evaluated and certified `isIndependentlyVerified = true`, `isPassing = true`.
    - Remotion rendered 1080x1920 MP4 (`vietsu_a4c4ac3e-ea0d-4817-9853-113567abbe2b_1795083469323.mp4`, 33.16 MB).
    - FFprobe verified H.264/AAC, 1080x1920, 30fps, duration 63.27s. Extracted PNG frame snapshot (562 KB).
  - **Project 2 (Un-hardcoded: Ngọc Hồi - Đống Đa 1789, `useMockProvider = false`):**
    - Dynamically extracted authentic Wikipedia records on Quang Trung and the 1789 campaign.
    - Generated custom 4-scene narrative and neural voiceover.
    - QA Agent passed with `isIndependentlyVerified = true` and `isPassing = true`.
