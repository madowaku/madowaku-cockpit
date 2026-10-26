# MCC-M4 Development Hygiene Guard (audit-only)

Status: experimental, read-only. No deletion feature is included.

## Why this exists

Git worktrees and temporary build areas accumulate during AI-assisted development. A clean `git status` is not evidence that deleting a worktree is safe. This standalone audit complements, rather than replaces, the [development-cleanup](https://github.com/nempro/development-cleanup) idea and preserves the read-only MCP security baseline.

## Run locally

Requires Node.js 22+, Git, and a trusted local repository. No npm install, model, account or API key is required for this scanner.

```sh
node tools/development-hygiene/audit.mjs --repo /path/to/trusted/repo
# Or: cd /path/to/repo && node /path/to/cockpit/tools/development-hygiene/audit.mjs
```

The command prints a JSON report to stdout and does not save it, create a cache, remove files, change branches, or mutate the Git index. Do not publish raw reports without reviewing local paths. The browser-based Cockpit viewer accepts a report pasted manually: there is **no** backend scanner, shell integration, or automatic upload.

## Classification

| Value | Meaning |
| --- | --- |
| `MUST_KEEP` | Primary/active checkout, untracked or changed files, ignored contents, non-ancestor commit, Git lock or stale registration; do not delete |
| `UNKNOWN_KEEP` | Git checks failed, config or environment is unsafe, or registration cannot be verified; do not delete |
| `REVIEW_REQUIRED` | Basic Git checks found no blockers; still **not deletion authorization** |

Checks include `git worktree list --porcelain -z`, a bounded Git status, ignored-content detection, and an ancestry test against the primary checkout. It detects configured external clean/process filters or fsmonitor before status and fails closed. `GIT_OPTIONAL_LOCKS=0` and `--no-optional-locks` avoid optional Git index writes. A maximum of 40 worktrees and bounded output/time limits prevent sweeping unrestricted scans.

**Unverified by the scanner:** other chats, process ownership, OS launchers/shortcuts, hardlinks, symlinks/junction aliases, external references, independently cloned repositories, unique model/game/test/build artifacts, and all alternate branch integration semantics. Squashed work may appear unmerged, intentionally favoring retention. A result can never be used alone as a deletion approval.

## Safety boundary

- Separate CLI under `tools/development-hygiene/`, not a new MCP tool. The MCP tool-name allowlist and no-shell/no-write boundary are untouched.
- Neither `apply`, `delete`, `--force`, `git clean`, `git worktree remove`, nor branch deletion are implemented.
- The UI is an opt-in viewer. Pasted text is in React memory only, not transmitted or added to localStorage.
- The source is original implementation, informed by `nempro/development-cleanup`. No upstream code has been copied. Upstream MIT license remains at its own repository.
- Never test cleanup against actual user data. Synthetic tests create temporary repositories and remove only their own fixtures.

## Future reviewed stages

1. Review UI and paste-only output on Windows and Ubuntu.
2. Add cross-OS process and owner evidence as a separately authorized, fail-closed collector.
3. Design individual review tickets and expiration/fingerprint checks.
4. Only after threat modeling, make a separate opt-in cleanup agent; **never** add a write or shell action to the read-only MCP bridge.

## Local verification

```sh
node --test tools/development-hygiene/audit.nodecheck.mjs
npm test
npm run build
npm run mcp:smoke
```

Human review remains a HOLD gate for UX, Windows runtime behavior, Codex-managed ownership and unintended Git config behavior.
