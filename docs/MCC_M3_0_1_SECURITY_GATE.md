# MCC-M3.0.1 Security & Human Acceptance Gate

2026-10-22 JST / PR #1 / baseline `1024c67dffd3d0acb7054d061f778894a0887612`.

## Decision

Dependency audit: **11 affected packages → 0** (including development dependencies).
Local engineering checks passed. Human acceptance: **NOT RUN / HOLD**.
Merge/publish: not performed. Owner can decide after the human checklist and green current-head CI; an audit with zero findings does not prove absence of all security defects.

This is added to PR #1 because it closes that PR's explicitly recorded security and acceptance gates. No separate runtime feature or unrelated dependency migration is introduced.

## Scope of the update

Direct constraints: Vite `^7.0.0` → `^7.3.7`; Vitest `^3.0.0` → `^4.1.12`.
React, React DOM, TypeScript, React plugin and their direct constraints remain unchanged.
Targeted transitive updates: `@babel/core baseline-browser-mapping browserslist postcss nanoid source-map-js esbuild` plus their required dependency closure. The larger lockfile diff includes platform-specific esbuild packages and Vitest's changed dependency graph. No blanket latest update, forced audit fix or override was used.

Vite stays on major 7. Vitest 3.2.6 fixes its old critical UI-server issue, but the current advisory set also affects mocker before 4.1.12 and Tinypool before 2.1.2. Using Vitest 4.1.12 removes Tinypool from this dependency graph and avoids unsupported cross-major overrides. All 58 existing tests run unchanged under Vitest 4.

Vite's declared Node requirement is `^20.19.0 || >=22.12.0`; use **Node 22.12+ LTS or Node 24** for this cockpit. The doctor reports only a Node major number and is not a complete dependency compatibility check. Local verification used Node 24.14.0; CI uses Node 22 on Windows and Ubuntu.

## All findings and disposition

These are npm audit package counts, not eleven independent CVEs. Parent findings can aggregate child advisories. The raw [before](evidence/mcc-m3.0.1/audit-before.json) report preserves every advisory URL, affected range, severity and dependency node. The selected fixed versions below were installed and checked against the live audit service, not inferred solely from a version number.

| Package / previous | Severity | Cause and potential impact | Fixed version used / disposition |
|---|---|---|---|
| vitest 3.2.4 | critical | Listening Vitest UI server can expose/read/execute arbitrary files; also aggregates mocker and pool issues. MCC uses `vitest run`, not a UI server, but the vulnerable tool was installed. | 4.1.12; old UI issue fixed in >=3.2.6, broader mocker fix needs 4.1.12 |
| tinypool 1.1.1 | critical | Prototype-polluted worker/run options can become code execution. Requires attacker influence over options/prototypes; no exploitability claim for current fixtures. | Removed by Vitest 4; upstream affected range ends before 2.1.2 |
| vite 7.3.2 | high | Windows alternative-path deny bypass, launch-editor command/UNC handling, filesystem allow bypass, middleware cross-origin issues. Dev server exposure and attacker input matter; loopback is not a substitute for patching. | 7.3.7 (7.x findings cover <=7.3.6) |
| browserslist 4.28.2 | high | Unbounded query cache can exhaust memory; untrusted custom statistics can cause crash/prototype write. Reachable through build tooling, not an added browser API. | 4.29.4 (affected <=4.28.6) |
| nanoid 3.3.12 | high | Non-secure/custom generator edge-case sizes can cause infinite loops/DoS. Transitive build dependency; this app does not expose size input to users. | 3.3.20 (both listed issues excluded at >=3.3.18) |
| postcss 8.5.14 | high | Attacker-controlled sourceMappingURL can read/disclose local map files during CSS processing, including an incomplete earlier fix. | 8.5.31 (combined affected <=8.5.22) |
| source-map-js 1.2.1 | high | Malicious indexed source-map section offsets can block the event loop. Build chain input boundary. | 1.2.2 |
| @vitest/mocker 3.2.4 | moderate | Redirect-mock traversal/file reading and unauthenticated manual mock code injection. Test-serving surface. | 4.1.12 |
| baseline-browser-mapping 2.10.27 | moderate | Invalid input can terminate the process. Build metadata processing. | 2.11.30 (affected <2.11.0) |
| @babel/core 7.29.0 | low | sourceMappingURL may cause arbitrary local reads while transforming code. | 7.29.7 (affected <=7.29.0) |
| esbuild 0.27.7 | low | Windows development server arbitrary file reads. | 0.28.2 (affected >=0.27.3 <0.28.1) |

After report: [audit-after.json](evidence/mcc-m3.0.1/audit-after.json), all severity counts zero. Exact versions and lockfile SHA-256: [resolution.json](evidence/mcc-m3.0.1/resolution.json). Registry metadata and audit were queried on the date above. Future advisories may change these results.

## Reproduction and engineering evidence

```text
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run mcp:smoke
```

- Clean `npm ci` from updated lockfile: passed on Windows; audit 0.
- Unit/contract regression: **58/58**, five test files. Includes unknown/ambiguous goals, fixed commands, malformed/stale/future/oversized/duplicate report rejection, missing metadata, source hashes, bounded file reads, secret exclusion and symlink/junction containment.
- Production build: passed. JS/CSS output filenames stayed identical to M3.0, consistent with no application logic change.
- MCP smoke: passed; [transcript](evidence/mcc-m3.0.1/mcp-smoke.txt). Five read-only tool names unchanged. Existing backup/prompt tests passed; no API or localStorage migration.
- Windows startup: `npm.cmd run dev -- --host 127.0.0.1 --port 53152 --strictPort` started Vite 7.3.7. The command-tool's `npm` wrapper produced no startup output, so the native npm.cmd entrypoint was used; direct Vite startup on 53151 was also verified.
- Windows-hosted IAB session on fresh origin 53151: initial default state rendered; expanded diagnostics; selected actual doctor JSON through file chooser; observed timestamp/Node 24 and detected vs incomplete rows. MCC/MSO files detected; MGSF/MAF incomplete. These refer to local checkout contents/access, not upstream implementation or runtime readiness.
- Copy: completion status displayed, then clipboard independently read as exactly `mgsf edenspark-plan fixtures/edenspark/mission-neon-001.json`. An immediate clipboard read before async completion was empty; verification used the completed UI state.
- Error result: diagnostic/dependency next-step appeared. Switching workflow reset result to 未実行 and exposed unavailable filenames without changing command or calling a model.
- No live external harness, model, billing, engine or publishing action was run.

CI now runs this same baseline on **windows-latest and ubuntu-latest**, Node 22, and fails on **any npm audit severity** including dev tools. Registry failure also fails the gate. Current-head job results are on PR #1; do not reuse the earlier M3.0 green run as proof for this change.

## Human acceptance remains separate

Use [the five-minute checklist](MCC_M3_0_1_HUMAN_ACCEPTANCE.md). Agent-driven browser interaction is engineering evidence only. No human tester, completion time, ease-of-use score or human approval is fabricated. Until the user records the outcome, this gate remains HOLD.

Rollback is a revert of this security commit, which restores the prior dependencies **and their known vulnerabilities**. It is not a security-approved fallback. Existing MCP and data remain compatible; no automatic downgrade or paid fallback exists.
