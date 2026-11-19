# Workflow: /handoff

When the user or agent invokes `/handoff`:

1. **Monorepo Build & Typecheck**:
   ```bash
   npm run build
   ```
2. **Execute Full Test Suite**:
   ```bash
   npm run test --workspace=@vietsu/backend
   ```
3. **Synchronize Code Knowledge Graph**:
   ```bash
   graphify update .
   ```
4. **Update Agent Memory Files**:
   - Check `git status` and `git log -n 1 --oneline`.
   - Update `.agent-memory/CURRENT_TASK.md` with tasks accomplished in this session.
   - Update `.agent-memory/TEST_STATUS.md` with latest pass counts.
   - Update `.agent-memory/HANDOFF.md` with the latest commit SHA, modified files, and clear resumption steps for the next agent session.
5. **Report to User**:
   - Summarize accomplished tasks.
   - Print commit SHA and branch status.
   - Provide a concise briefing for the next session.
