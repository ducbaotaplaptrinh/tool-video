# Workflow: /resume-project

When the user or agent invokes `/resume-project`:

1. **Read Protocols & Current State**:
   - Read `AGENTS.md`.
   - Read `.agent-memory/PROJECT_STATE.md`.
   - Read `.agent-memory/CURRENT_TASK.md`.
   - Read `.agent-memory/HANDOFF.md`.
2. **Inspect Git & Workspace**:
   - Run `git status` and `git log -n 1 --oneline`.
   - Verify active branch.
3. **Verify Quality Baseline**:
   - Read `.agent-memory/TEST_STATUS.md`.
   - Read `.agent-memory/BLOCKERS.md`.
4. **Query Graphify**:
   - Query `graphify explain "<target>"` or `graphify path "<from>" "<to>"` to understand the context of the current task.
5. **Output Resumption Briefing**:
   - Present current project state to the user.
   - List completed tasks vs pending tasks.
   - Propose the immediate next action and proceed.
