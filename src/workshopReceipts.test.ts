import { describe, expect, it } from 'vitest';
import { firstWorkshopReceipt, readWorkshopTransfer, shareWorkshopReceipt } from './workshopReceipts';
import { confirmedReceiptChanges, updateReceiptPr, workshopReceiptEdit } from './workshopReceiptEdit';

const t3Run = {
  threadId: 'mcp:6579044f-866e-454c-b38a-46e5f264e9a7',
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
      thread: { ...t3Run, threadId: 'mcp:7d63c324-5400-4807-9400-63b152685d79',
        latestRunId: firstWorkshopReceipt.runId, status: 'settled' }
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

  it('rejects mismatched or malformed thread/run IDs before opening an editor', () => {
    for (const mismatch of [
      { ...t3Run, threadId: 'mcp:other' },
      { ...t3Run, threadId: undefined },
      { ...t3Run, latestRunId: t3Run.latestRunId.replace(':ordinal:1', ':ordinal:0') },
      { ...t3Run, latestRunId: t3Run.latestRunId.replace('%3A', ':') }
    ]) {
      expect(readWorkshopTransfer(JSON.stringify({ thread: mismatch }), [firstWorkshopReceipt])).toBeNull();
    }
  });

  it('fills gaps in an old shared receipt from the stored receipt', () => {
    const old = { ...firstWorkshopReceipt, prUrl: '', ciUrl: '', ci: 'unknown' as const, elapsedSeconds: null };
    const preview = readWorkshopTransfer(shareWorkshopReceipt(old), [firstWorkshopReceipt]);
    expect(preview).toEqual(firstWorkshopReceipt);
    expect(confirmedReceiptChanges(firstWorkshopReceipt, preview!)).toEqual([]);
  });

  it('requires review of explicit changes and discards pending changes when editing is cancelled', () => {
    const original = firstWorkshopReceipt;
    const changed = { ...original, elapsedSeconds: null, prUrl: '', ci: 'failed' as const, ciUrl: '' };
    const edit = workshopReceiptEdit({ version: 0 }, { type: 'open', draft: original, previous: original });
    const changes = confirmedReceiptChanges(edit.previous, changed);
    expect(changes.map(({ label, after }) => [label, after])).toEqual([
      ['PR URL', '未記録'], ['CI URL', '未記録'], ['CI結果', '失敗'], ['所要時間', '未計測']
    ]);
    const reviewing = workshopReceiptEdit(edit, { type: 'review', receipt: changed, changes });
    expect(reviewing.approval?.receipt).toEqual(changed);
    const cancelled = workshopReceiptEdit(reviewing, { type: 'close' });
    expect(cancelled).toEqual({ version: 2 });
    const reopened = workshopReceiptEdit(cancelled, { type: 'open', draft: original, previous: original });
    expect(reopened.draft).toEqual(firstWorkshopReceipt);
    expect(reopened.approval).toBeUndefined();
  });

  it('clears prefilled CI on a manual PR change and previews all three actual changes', () => {
    const original = firstWorkshopReceipt;
    const prUrl = original.prUrl.replace('/24', '/25');
    const edited = { ...original, ...updateReceiptPr(original, prUrl) };
    expect(edited).toMatchObject({ prUrl, ci: 'unknown', ciUrl: '' });
    expect(confirmedReceiptChanges(original, edited)).toEqual([
      { label: 'PR URL', before: original.prUrl, after: prUrl },
      { label: 'CI URL', before: original.ciUrl, after: '未記録' },
      { label: 'CI結果', before: '成功', after: '未確認' }
    ]);
    expect(updateReceiptPr(original, original.prUrl + '/')).toMatchObject({ ci: 'passed', ciUrl: original.ciUrl });
  });

  it('never inherits missing or stale CI evidence when a shared receipt changes the PR', () => {
    const original = firstWorkshopReceipt;
    const prUrl = original.prUrl.replace('/24', '/25');
    const stale = { ...original, prUrl };
    for (const shared of [stale, { ...stale, ci: 'unknown' as const, ciUrl: '' }]) {
      const next = readWorkshopTransfer(shareWorkshopReceipt(shared), [original])!;
      expect(next).toMatchObject({ prUrl, ci: 'unknown', ciUrl: '', elapsedSeconds: original.elapsedSeconds });
      expect(confirmedReceiptChanges(original, next).map(({ label }) => label)).toEqual(['PR URL', 'CI URL', 'CI結果']);
    }
    const ciUrl = prUrl + '/checks';
    const explicit = readWorkshopTransfer(shareWorkshopReceipt({ ...stale, ciUrl }), [original]);
    expect(explicit).toMatchObject({ prUrl, ci: 'passed', ciUrl });
  });

  it('includes newly supplied PR and CI values in the approval of an existing receipt', () => {
    const original = firstWorkshopReceipt;
    const previous = { ...original, prUrl: '', ci: 'unknown' as const, ciUrl: '' };
    expect(confirmedReceiptChanges(previous, original)).toEqual([
      { label: 'PR URL', before: '未記録', after: original.prUrl },
      { label: 'CI URL', before: '未記録', after: original.ciUrl },
      { label: 'CI結果', before: '未確認', after: '成功' }
    ]);
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
