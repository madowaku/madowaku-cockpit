---
name: development-hygiene-guard
description: 開発後のGit worktreeを読み取り専用で調査し、削除や設定変更を行わずに安全な保留・要確認候補を報告する。明示的な削除依頼が来てもこのSkill自身は削除しない。
---

# MCC-M4 Development Hygiene Guard

Use the separate `tools/development-hygiene/audit.mjs` script, not the read-only MCP server, when the user asks for a development cleanup audit. This Skill does **not** implement deletion.

## Workflow

1. Confirm the one trusted repository root that is already in the user's working context. Do not recursively search drives or unrelated repositories.
2. Run `node tools/development-hygiene/audit.mjs --repo "<project-root>"` in an environment where shell access is already explicitly available and authorized. Otherwise give a copy-only command, and do not claim execution.
3. Treat `MUST_KEEP` and `UNKNOWN_KEEP` as protected. Treat `REVIEW_REQUIRED` as a manual investigation queue, not a delete recommendation.
4. Summarize branch/HEAD, dirty/ignored/unmerged indicators and missing evidence. Do not expose secrets; minimize sharing of local paths.
5. Never run `git clean`, `git worktree remove`, `rm -rf`, `reset`, branch deletion, or Codex archive functions under this Skill. A separate authorized cleanup workflow, with full ownership and artifact checks, is required.

The scanner cannot establish whether another Codex/Claude session is using a worktree or whether ignored content is disposable. Unknown means keep. Do not create report files without a direct user request. Do not place scanner output into public issues or chat transcripts without reviewing paths.

See `docs/development-hygiene-guard.md` at the repository root for safety gates.
