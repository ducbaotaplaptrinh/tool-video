# VietSu AI Studio — Architectural Decision Records (ADRs)

---

### ADR-001: Monorepo Architecture with Strict Package Boundaries
* **Status:** Accepted
* **Context:** VietSu AI Studio requires code reuse between frontend, backend, video renderer, and AI agents.
* **Decision:** Use npm workspaces with `@vietsu/shared` for domain types/Zod schemas and `@vietsu/ai-providers` for AI interfaces. Enforce topological build ordering: `shared` → `ai-providers` → `video-renderer` → `backend` → `frontend`.

---

### ADR-002: In-Memory Mutex Lock for MVP vs Distributed Redis Lock for SaaS
* **Status:** Accepted
* **Context:** Multiple simultaneous requests caused TOCTOU race conditions creating duplicate jobs.
* **Decision:** In Phase 1 Single-Node MVP, implement a synchronous `acquireLock(projectId)` mechanism in `WorkflowEngine` before any async I/O. For future SaaS multi-worker deployment, transition to Redis Redlock or PostgreSQL Advisory Locks (`pg_advisory_xact_lock`).

---

### ADR-003: Epistemic Grounding & Source Verification (`isIndependentlyVerified`)
* **Status:** Accepted
* **Context:** LLMs often hallucinate historical facts and fake source books.
* **Decision:** `isIndependentlyVerified` defaults to `false`. It can ONLY be `true` when:
  1. The dossier does not use mock engine.
  2. All facts contain verifiable citations.
  3. Every citation has explicit attested evidence (`verificationEvidence` or accredited `verificationUrl`).

---

### ADR-004: Remotion Subtitle Safe-Zone (Y: 280px from bottom)
* **Status:** Accepted
* **Context:** Facebook Reels UI overlays (caption text, audio disc sticker, like/comment buttons) occlude video content below 260px from the screen bottom.
* **Decision:** Set standard subtitle layout to `bottomPx: 280`, `maxWidthPx: 900`, `maxWordsPerChunk: 6`. The QA Agent actively enforces `bottomPx >= 260` and `maxWidthPx <= 900`.

---

### ADR-005: Graphify for Deterministic Local Code Knowledge Graph
* **Status:** Accepted
* **Context:** LLM agents lose context when dealing with large repositories, but vector stores suffer from relationship blindness and high embedding token costs.
* **Decision:** Adopt Graphify (`graphifyy` with Tree-sitter AST parsing) to generate zero-token deterministic code graphs (`graph.json`, `GRAPH_REPORT.md`, `graph.html`).

---

### ADR-006: Hybrid Real AI Provider Stack (Wikipedia + Pollinations + Edge-TTS)
* **Status:** Accepted
* **Context:** Moving from Mock to Real AI without imposing mandatory paid API subscriptions on the user during initial verification.
* **Decision:** 
  1. **Historical Research**: Vietnamese Wikipedia MediaWiki API with strict User-Agent, returning authentic text excerpts, dates, and historical citations.
  2. **AI Visuals**: Pollinations AI (Flux / SDXL) for real 1080×1920 historical imagery.
  3. **Vietnamese TTS**: Microsoft Edge Neural TTS (`vi-VN-NamMinhNeural` / `vi-VN-HoaiMyNeural`) delivering professional voiceover and real word-level boundary timestamps.
  4. **Fallback & Vendor Agility**: Everything abstracted behind `ILLMProvider`, `IImageProvider`, `ITTSProvider` interfaces in `@vietsu/ai-providers`.

---

### ADR-007: Dual Neural TTS Engine & Bounds-Safe Timestamp Alignment
* **Status:** Accepted
* **Context:** Network latency or Windows code-page shell escaping caused occasional `NoAudioReceived` in edge-tts, while naive VTT subtitle parsing could result in timestamps overshooting scene duration.
* **Decision:**
  1. **Dual TTS Engine**: Implement primary execution via `edge-tts` (`vi-VN-NamMinhNeural` / `vi-VN-HoaiMyNeural`), with automatic fallback to Google Neural TTS (`gTTS` Vietnamese neural voice via isolated python script execution using JSON-encoded text).
  2. **Bounds-Safe Alignment**: Guarantee that word timestamps are mathematically bounded within `[0.2, totalDuration - 0.2]`, ensuring zero overflow and 100% QA score compliance.
