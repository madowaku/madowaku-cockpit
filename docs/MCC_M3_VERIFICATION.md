# M3.0 verification — 2026-10-22

Historical baseline: the audit and browser-import limitations below describe M3.0. See [M3.0.1 security and acceptance gate](MCC_M3_0_1_SECURITY_GATE.md) for the dependency fixes, zero-finding re-audit and completed agent-driven JSON import check. Human acceptance remains unperformed.

Base: MCC main `a42994ef89f0b8030ac40a28ed4c0699cfb7e2de`.
Environment: Windows / Node v24.14.0. Isolated checkout; original MSO branch and untracked package-lock preserved.

| Gate | Observed result |
|---|---|
| `npm ci` | Passed outside restricted network sandbox; no dependency changes |
| `npm test` | 58/58 passed across five files, including 8 new First Run/doctor cases and existing MCP boundary/backup/prompt regressions |
| `npm run build` | Passed, TypeScript + Vite production bundle |
| `npm run mcp:smoke` | Passed; five existing read-only tools and bounded context pack printed |
| Doctor actual local folders | Ran with explicit projects root. MCC/MSO detected; MGSF incomplete; MAF incomplete. These are sandbox-visible file observations, not readiness or absence claims |
| Browser journey | Real IAB at 127.0.0.1:53149: Japanese game-test goal → plan candidate → fixed MGSF command; error selection → diagnostic next step; unknown dinner goal → no match; asset goal → MAF read-only command; clipboard text exactly matched shown command |
| Existing compatibility | No MCP tool/schema change, no provider additions, no project storage migration, no new dependencies |
| Security audit | Existing lockfile: 11 findings (2 critical, 5 high, 2 moderate, 2 low). Not remediated by this feature. Security release gate remains open |

Security findings include Vitest <3.2.6 UI server arbitrary file read/execution ([GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp)), Vite <=7.3.6 issues and transitive dependencies. Tests use `vitest run`, not its UI server. Local preview binds loopback. A separate dependency maintenance change is required before a broader deployment; this PR must not be described as a clean security audit.

Failures corrected during implementation: Windows case-insensitive TS module-name collision; mixed test-runner discovery. The symlink containment test initially hit sandbox EPERM; the unchanged test passed outside the sandbox. First dependency install failed in the sandbox and passed with approved network access.

## Reproduce

```text
npm ci
npm test
npm run build
npm run mcp:smoke
node scripts/first-run-doctor.mjs --projects-root <parent-folder>
```

Browser acceptance checklist:

- Enter `ゲームの自律テストを準備したい`, select its candidate: plan command, requirements, repository folder and expected artifact appear.
- Select error result: next action calls for diagnosis/dependency checks, never a model fallback.
- Enter `今夜の献立`: explicit no-match; no arbitrary command generated.
- Enter `素材を画面で見たい`, select candidate and copy: clipboard contains only allowlisted MAF command.
- Switch workflows: previous self-report resets to 未実行.
- Import a doctor JSON: file states appear; stale/malformed report must be rejected (parser unit-tested; browser file chooser journey not exercised in this run).

Not established: non-engineer human acceptance, physical mobile layout, all external CLI launches, MGSF live engine playtest, MAF runtime, provider billing, authenticated MCP connectivity. Source inspection and fixed replay/plan guidance do not prove these. First Run status is intentionally ephemeral; retain useful results through existing Logs/next-action workflow.
