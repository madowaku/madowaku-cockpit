import { describe, it, expect } from 'vitest';
import { parseHygieneReport } from './developmentHygiene';

const head = 'a'.repeat(40);
const payload = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  schema: 'mcc-development-hygiene/v1',
  mode: 'READ_ONLY',
  repository: '/tmp/example',
  summary: { mustKeep: 999, unknownKeep: 999, reviewRequired: 999 },
  worktrees: [
    { path: '/tmp/example', branch: 'refs/heads/main', head, classification: 'MUST_KEEP', reasons: ['primary_checkout'], dirty: false, ignored: false, unmerged: false }
  ],
  ...overrides
});

describe('MCC-M4 report input', () => {
  it('accepts a bounded audit payload and recomputes counts instead of trusting pasted summary', () => {
    const report = parseHygieneReport(payload());
    expect(report.summary).toEqual({ mustKeep: 1, unknownKeep: 0, reviewRequired: 0 });
  });
  it('rejects malformed or non-audit JSON', () => {
    expect(() => parseHygieneReport('{')).toThrow(/JSON/);
    expect(() => parseHygieneReport(JSON.stringify({ mode: 'WRITE', worktrees: [] }))).toThrow(/MCC-M4/);
  });
  it('never accepts an invented deletable classification', () => {
    const report = JSON.parse(payload());
    report.worktrees[0].classification = 'SAFE_TO_DELETE';
    expect(() => parseHygieneReport(JSON.stringify(report))).toThrow(/worktree/);
  });
  it('rejects unbounded input or suspiciously large worktree lists', () => {
    expect(() => parseHygieneReport('x'.repeat(128001))).toThrow(/128KB/);
    const report = JSON.parse(payload());
    report.worktrees = Array.from({ length: 41 }, () => report.worktrees[0]);
    expect(() => parseHygieneReport(JSON.stringify(report))).toThrow(/worktree/);
  });
  it('rejects incomplete items instead of displaying unsupported facts as safe', () => {
    const report = JSON.parse(payload());
    delete report.worktrees[0].ignored;
    expect(() => parseHygieneReport(JSON.stringify(report))).toThrow(/worktree/);
  });
});
