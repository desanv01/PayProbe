# PayProbe development rules

Read PayProbe-Implementation-Gameplan-v2-2026-11-10.md and PROJECT-STATE.md before phase work. User instructions prevail.

- Work only in C:\Users\Dv\Desktop\PayProbe. No worktrees, local git initialization, or local Git commits.
- Remote repository: desanv01/PayProbe. Publish each coherent completed task/subtask and fix using GitHub APIs, preserving granular commits and one draft PR per main phase. Never recursively upload the workspace. Explicitly exclude secrets, .env.local, databases, node_modules and private artifacts.
- Use one persistent Sol Medium worker chat per main phase; do not spawn more workers. Main orchestrator owns cross-phase coordination. Reuse phase chats for repair.
- Implement/connect P1-P4 before broad stabilization P5. Fix blockers now; track nonblocking bugs and continue. No repeated broad reviews/suites or speculative refactors.
- Sandbox PayPal only, actual buyer approval and independently observed payment truth. No hardcoded successes presented as implementation.
- Runtime AI uses DeepSeek, not OpenAI. The openai npm package is permitted as transport only with explicit DeepSeek baseURL/key. No provider fallback or separate desktop harness.
- User must approve actual UI mockups before branded TUI, styled CLI or browser UI implementation. Plain headless commands/JSON diagnostics are allowed earlier. UI APPROVAL IS PENDING.
- Create .env.local without overwriting existing content, ignore it and never print secrets. Commit blank .env.example only. Prefer checking credential presence without revealing values.
- Never claim live provider verification without real evidence. Document external blockers and continue independent implementation.
- Maintain concise PROJECT-STATE.md and a phase handover: changes, connections, checks, problems, next needs. Record remote SHA/PR/issue IDs.
- Restricted shell may misreport GitHub auth/network. A verified escalated network call works; do not ask the user to sign in repeatedly based only on restricted-shell errors. Prefer GitHub connector for supported operations; use authenticated gh/API fallback with needed network permission.

