# VietSu AI Studio — Blockers & Constraints

---

## Active Blockers
*None currently blocking progress.* The system runs 100% locally with free, reliable tools.

---

## Constraints & Operating Boundaries
1. **Zero Paid API Mandate:** Do not activate commercial paid services (OpenAI, Gemini Paid, ElevenLabs, Higgsfield) until formal user approval and API keys are explicitly provided.
2. **No Hallucination in Historical Grounding:** Never invent historical citations. If an event cannot be verified from accredited sources (e.g., Wikipedia API / verified bibliography), flag it as `HISTORICAL_HYPOTHESIS` or `FOLKLORE_LEGEND`, or mark `isIndependentlyVerified: false`.
3. **No Direct Push to `main`:** All work must be conducted on feature branches (`feat/phase1-hardening-and-verification`, `feat/phase2-agent-memory-and-real-ai`) and submitted via Pull Requests. Do NOT auto-merge PR #1.
4. **Local Hardware / Headless Chromium:** Remotion rendering runs headless Chromium with FFmpeg. Base64 data URIs or local file paths must be used instead of insecure `file:///` URLs inside Chromium.
