# VietSu AI Studio — Agent Operating Protocol (AGENTS.md)

Welcome to VietSu AI Studio. Every AI coding agent joining this project must strictly comply with this protocol to maintain continuity, prevent context degradation, and preserve zero-hallucination standards.

---

## 1. Agent Entry Checkpoint (On Session Start)

Before executing or proposing any code changes, every Agent must perform the following entry sequence:

1. **Read Core Protocols**:
   - Read this file (`AGENTS.md`).
   - Read `.agent-memory/PROJECT_STATE.md` (Active architecture & state machine).
   - Read `.agent-memory/CURRENT_TASK.md` (Current scope & goals).
   - Read `.agent-memory/HANDOFF.md` (Latest handoff briefing).
2. **Verify Git State**:
   - Run `git status` and `git log -n 1 --oneline`.
   - Ensure the working tree is clean or changes are understood.
   - Do NOT push directly to `main`.
3. **Check Quality Gates**:
   - Read `.agent-memory/TEST_STATUS.md` and verify all tests pass (`npm run test --workspace=@vietsu/backend`).
   - Read `.agent-memory/BLOCKERS.md` to avoid repeating known constraints.
4. **Query Codebase via Graphify**:
   - Use `graphify explain "<NodeName>"` to inspect dependencies before editing modules.
   - Use `graphify path "<Source>" "<Target>"` to trace multi-hop architectural connections.
   - Run `graphify update .` if code structure has changed.

---

## 2. Agent Exit Checkpoint (Before Turn Completion)

Before ending the session or handing over to another agent:

1. **Verify Builds & Tests**:
   - Run `npm run build` across the monorepo.
   - Run `npm run test --workspace=@vietsu/backend` and confirm 100% pass.
2. **Update Code Knowledge Graph**:
   - Run `graphify update .` to synchronize `graphify-out/graph.json` with new symbols.
3. **Update Agent Memory**:
   - Update `.agent-memory/CURRENT_TASK.md` (Mark completed items).
   - Update `.agent-memory/PROJECT_STATE.md` (If architectural state changed).
   - Update `.agent-memory/TEST_STATUS.md` (Record any new tests).
   - Update `.agent-memory/HANDOFF.md` with:
     - Latest Git commit SHA.
     - Files modified.
     - Immediate next steps for the incoming agent.
4. **Commit & Push**:
   - Commit changes to the active feature branch with descriptive conventional commit messages.
   - Push to remote and verify GitHub Actions CI.

---

## 3. Core Development Principles

- **Zero Hallucination:** Never fabricate historical citations or facts. If unverified, label as `HISTORICAL_HYPOTHESIS` or `FOLKLORE_LEGEND`, or mark `isIndependentlyVerified: false`.
- **Zero Paid API Without Approval:** All baseline workflows must operate cleanly with free/mock/local providers. Never activate commercial paid billing without explicit user consent.
- **Contract-First Design:** All data exchanged between agents must be validated with Zod schemas in `@vietsu/shared`.
- **Facebook Reels Safe-Zone:** Subtitles must be positioned at `bottom: 280px` ($Y \ge 260\text{px}$ and $\le 600\text{px}$, width $\le 900\text{px}$, chunk density $\le 8$ words).
