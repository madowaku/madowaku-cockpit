import { describe, expect, it } from 'vitest';
import { OBELISK_EVIDENCE_SCHEMA, prepareObeliskEvidence } from './obeliskEvidence';

const record = (overrides: Record<string, unknown> = {}) => ({
  source: 'codex', session_id: '1234-abc', project: 'cockpit',
  when: '2026-10-30', summary: 'Resolved a UI state bug', ...overrides
});
const input = (records: unknown[]) => JSON.stringify({ schema: OBELISK_EVIDENCE_SCHEMA, records });

describe('Obelisk evidence import', () => {
  it('builds provenance and never elevates historical data to facts or commands', () => {
    const draft = prepareObeliskEvidence(input([record()]));
    expect(draft.count).toBe(1);
    expect(draft.packet).toContain('CONTEXT_PROVENANCE:');
    expect(draft.packet).toContain('session=1234-abc');
    expect(draft.packet).toContain('EVIDENCE_TRUST: DATA_ONLY');
    expect(draft.packet).toContain('confidence=unverified');
  });

  it('rejects raw transcripts, malformed and oversized input', () => {
    expect(() => prepareObeliskEvidence('[{"text":"raw transcript"}]')).toThrow();
    expect(() => prepareObeliskEvidence('not json')).toThrow();
    expect(() => prepareObeliskEvidence('x'.repeat(16385))).toThrow();
  });

  it('limits output to the first six records and removes duplicates', () => {
    const rows = [record(), record(), ...Array.from({ length: 8 }, (_, i) => record({ session_id: 'session-' + i }))];
    const draft = prepareObeliskEvidence(input(rows));
    expect(draft.count).toBe(5);
    expect(draft.warnings.join(' ')).toContain('先頭6件');
    expect(draft.packet).not.toContain('session-7');
  });

  it('redacts recognizable credentials, emails, and user home segments', () => {
    const draft = prepareObeliskEvidence(input([
      record({ summary: 'api_key=abc12345 me@example.com /home/alice/private sk-proj-123456789ABCDEF' })
    ]));
    expect(draft.packet).not.toMatch(/abc12345|me@example.com|\/home\/alice|sk-proj-123456789ABCDEF/);
    expect(draft.packet).toContain('[REDACTED_');
    expect(draft.warnings.join(' ')).toContain('完全な秘密情報検出は保証できません');
  });

  it('drops invalid records and ignores unknown action fields', () => {
    const draft = prepareObeliskEvidence(input([
      record({ source: 'shell' }),
      record({ session_id: 'valid-456', summary: 'Historical note', command: 'rm -rf /' })
    ]));
    expect(draft.count).toBe(1);
    expect(draft.packet).not.toContain('rm -rf');
  });

  it('rejects empty or invalid meaningful records', () => {
    expect(() => prepareObeliskEvidence(input([{ source: 'codex', session_id: 'x', summary: 'no' }]))).toThrow('有効な記録');
    expect(() => prepareObeliskEvidence(input([]))).toThrow('有効な記録');
  });
});
