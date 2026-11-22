import { describe, expect, it } from 'vitest';
import { firstWorkshopReceipt, readWorkshopTransfer, shareWorkshopReceipt } from './workshopReceipts';

const t3Run = {
  latestRunId: 'run:thread:mcp%3A6579044f-866e-454c-b38a-46e5f264e9a7:ordinal:1',
  title: 'LW-M02-23-01 Receipt review checklist',
  status: 'completed',
  providerInstanceId: 'codex',
  model: 'gpt-6-luna',
  createdAt: '2026-11-22T06:28:35.581Z',
  updatedAt: '2026-11-22T08:30:50.752Z'
};

describe('workshop receipt transfer', () => {
  it('imports observed T3 fields without deriving elapsed time or PR/CI state from thread data', () => {
    const result = readWorkshopTransfer(JSON.stringify({
      thread: { ...t3Run, pullRequests: [{ url: firstWorkshopReceipt.prUrl }] },
      messages: [{ text: 'This message should not be stored.' }]
    }), []);
    expect(result).toEqual({
      runId: t3Run.latestRunId, task: t3Run.title, agent: 'T3 Code / codex / gpt-6-luna',
      state: 'completed', elapsedSeconds: null, applyMode: 'unknown', prUrl: '', ci: 'unknown', ciUrl: ''
    });
  });

  it('retains confirmed evidence and keeps ambiguous status unknown', () => {
    const result = readWorkshopTransfer(JSON.stringify({
      thread: { ...t3Run, latestRunId: firstWorkshopReceipt.runId, status: 'settled' }
    }), [firstWorkshopReceipt]);
    expect(result).toMatchObject({
      state: 'unknown', task: firstWorkshopReceipt.task, ci: 'passed', ciUrl: firstWorkshopReceipt.ciUrl,
      applyMode: 'manual', elapsedSeconds: 145, prUrl: firstWorkshopReceipt.prUrl
    });
  });

  it('records an outstanding T3 approval or question as blocked', () => {
    const thread = { ...t3Run, status: 'running', pendingRequestCount: 1 };
    expect(readWorkshopTransfer(JSON.stringify({ thread }), [])?.state).toBe('blocked');
  });

  it('copies only receipt fields and rejects invalid or oversized transfers', () => {
    const source = { ...firstWorkshopReceipt, extra: 'Do not share me' };
    const shared = shareWorkshopReceipt(source);
    expect(shared).not.toContain(source.extra);
    expect(readWorkshopTransfer(shared, [])).toEqual(firstWorkshopReceipt);
    expect(readWorkshopTransfer(shared.replace(firstWorkshopReceipt.prUrl, 'javascript:alert(1)'), [])).toBeNull();
    expect(readWorkshopTransfer(JSON.stringify({ thread: { ...t3Run, latestRunId: null } }), [])).toBeNull();
    expect(readWorkshopTransfer(' '.repeat(16_385), [])).toBeNull();
  });
});
