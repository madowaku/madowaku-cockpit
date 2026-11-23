import { sameWorkshopEvidenceUrl, workshopApplyModes, workshopCiStates, workshopRunStates, type WorkshopReceipt } from './workshopReceipts';

type EvidenceChange = { label: string; before: string; after: string };

export type WorkshopReceiptEdit = {
  version: number;
  draft?: WorkshopReceipt;
  previous?: WorkshopReceipt;
  approval?: { receipt: WorkshopReceipt; changes: EvidenceChange[] };
};

type Action =
  | { type: 'open'; draft: WorkshopReceipt; previous?: WorkshopReceipt }
  | { type: 'review'; receipt: WorkshopReceipt; changes: EvidenceChange[] }
  | { type: 'back' }
  | { type: 'close' };

export function workshopReceiptEdit(state: WorkshopReceiptEdit, action: Action): WorkshopReceiptEdit {
  switch (action.type) {
    case 'open':
      return { version: state.version + 1, draft: action.draft, previous: action.previous };
    case 'review':
      return { ...state, approval: { receipt: action.receipt, changes: action.changes } };
    case 'back':
      return { ...state, approval: undefined };
    case 'close':
      return { version: state.version + 1 };
  }
}

type ReceiptEvidence = Pick<WorkshopReceipt, 'prUrl' | 'ci' | 'ciUrl'>;

export function updateReceiptPr(evidence: ReceiptEvidence, prUrl: string): ReceiptEvidence {
  if (sameWorkshopEvidenceUrl(evidence.prUrl, prUrl)) return { ...evidence, prUrl };
  return { prUrl, ci: 'unknown', ciUrl: '' };
}

export function confirmedReceiptChanges(previous: WorkshopReceipt | undefined, next: WorkshopReceipt): EvidenceChange[] {
  if (!previous) return [];
  const fields = [
    { label: '担当AI', before: previous.agent, after: next.agent },
    { label: 'タスク', before: previous.task, after: next.task },
    { label: '実行状態', before: previous.state === 'unknown' ? '' : workshopRunStates[previous.state],
      after: workshopRunStates[next.state] },
    { label: 'PR URL', before: previous.prUrl, after: next.prUrl },
    { label: 'CI URL', before: previous.ciUrl, after: next.ciUrl },
    { label: 'CI結果', before: previous.ci === 'unknown' ? '' : workshopCiStates[previous.ci], after: workshopCiStates[next.ci] },
    { label: '所要時間', before: previous.elapsedSeconds === null ? '' : `${previous.elapsedSeconds}秒`,
      after: next.elapsedSeconds === null ? '未計測' : `${next.elapsedSeconds}秒` },
    { label: '反映方法', before: previous.applyMode === 'unknown' ? '' : workshopApplyModes[previous.applyMode],
      after: workshopApplyModes[next.applyMode] }
  ];
  const prChanged = previous.prUrl !== next.prUrl;
  const prEvidence = ['PR URL', 'CI URL', 'CI結果'];
  return fields.filter(({ label, before, after }) => before !== after && (before || (prChanged && prEvidence.includes(label))))
    .map((field) => ({
      ...field,
      before: field.before || (field.label === 'CI結果' ? workshopCiStates.unknown : '未記録'),
      after: field.after || '未記録'
    }));
}
