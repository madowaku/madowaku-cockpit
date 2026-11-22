export const workshopRunStates = {
  unknown: '未確認',
  running: '実行中',
  completed: '応答完了',
  blocked: '保留',
  failed: '失敗',
  stopped: '停止'
} as const;

export const workshopCiStates = {
  unknown: '未確認',
  notRun: '未実行',
  pending: '実行待ち・実行中',
  passed: '成功',
  failed: '失敗'
} as const;

export const workshopApplyModes = {
  unknown: '未確認',
  none: '未適用',
  manual: 'オペレーターが手動適用',
  direct: 'AIが直接編集'
} as const;

export type WorkshopReceipt = {
  runId: string;
  agent: string;
  task: string;
  state: keyof typeof workshopRunStates;
  elapsedSeconds: number | null;
  applyMode: keyof typeof workshopApplyModes;
  prUrl: string;
  ci: keyof typeof workshopCiStates;
  ciUrl: string;
};

export const firstWorkshopReceipt: WorkshopReceipt = {
  runId: 'run:thread:mcp%3A7d63c324-5400-4807-9400-63b152685d79:ordinal:1',
  agent: 'T3 Code 0.1.11 / Codex gpt-6-luna（Standard）',
  task: 'LW-M01-23-01 · コントリビューター向け歓迎ページの原稿作成',
  state: 'completed',
  elapsedSeconds: 145,
  applyMode: 'manual',
  prUrl: 'https://github.com/madowaku/madowaku-cockpit/pull/24',
  ci: 'passed',
  ciUrl: 'https://github.com/madowaku/madowaku-cockpit/actions/runs/44993291806'
};

function isOption(value: unknown, options: object) {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(options, value);
}

function isText(value: unknown, maxLength: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isGitHubLink(value: unknown, path: RegExp) {
  if (value === '') return true;
  if (typeof value !== 'string' || value.length > 350) return false;
  try {
    const url = new URL(value);
    return url.origin === 'https://github.com' && !url.username && !url.password &&
      !url.search && !url.hash && path.test(url.pathname);
  } catch {
    return false;
  }
}

export function isWorkshopReceipt(value: unknown): value is WorkshopReceipt {
  if (typeof value !== 'object' || value === null) return false;
  const receipt = value as Partial<WorkshopReceipt>;
  return isText(receipt.runId, 200) && isText(receipt.agent, 160) && isText(receipt.task, 240) &&
    isOption(receipt.state, workshopRunStates) && isOption(receipt.applyMode, workshopApplyModes) &&
    isOption(receipt.ci, workshopCiStates) &&
    (receipt.elapsedSeconds === null || (typeof receipt.elapsedSeconds === 'number' &&
      Number.isSafeInteger(receipt.elapsedSeconds) && receipt.elapsedSeconds >= 0)) &&
    isGitHubLink(receipt.prUrl, /^\/[\w.-]+\/[\w.-]+\/pull\/\d+\/?$/) &&
    isGitHubLink(receipt.ciUrl, /^\/[\w.-]+\/[\w.-]+\/(?:actions\/runs\/\d+(?:\/job\/\d+)?|pull\/\d+\/checks)\/?$/);
}

const sharingSchema = 'madowaku.workshop_receipt.v1';

function receiptFields(receipt: WorkshopReceipt): WorkshopReceipt {
  const { runId, agent, task, state, elapsedSeconds, applyMode, prUrl, ci, ciUrl } = receipt;
  return { runId, agent, task, state, elapsedSeconds, applyMode, prUrl, ci, ciUrl };
}

export function shareWorkshopReceipt(receipt: WorkshopReceipt) {
  return JSON.stringify({ schema: sharingSchema, receipt: receiptFields(receipt) }, null, 2);
}

function applySharedReceipt(receipt: WorkshopReceipt, existing?: WorkshopReceipt): WorkshopReceipt {
  if (!existing) return receiptFields(receipt);
  const ci = receipt.ci === 'unknown' ? existing.ci : receipt.ci;
  return {
    ...receiptFields(receipt),
    prUrl: receipt.prUrl || existing.prUrl,
    ci,
    ciUrl: receipt.ciUrl || (ci === existing.ci ? existing.ciUrl : ''),
    elapsedSeconds: receipt.elapsedSeconds ?? existing.elapsedSeconds,
    state: receipt.state === 'unknown' ? existing.state : receipt.state,
    applyMode: receipt.applyMode === 'unknown' ? existing.applyMode : receipt.applyMode
  };
}

function matchingT3RunId(threadId: unknown, runId: unknown) {
  if (!isText(threadId, 200) || typeof threadId !== 'string' || threadId.trim() !== threadId ||
      typeof runId !== 'string' || runId.length > 200) return false;
  const prefix = `run:thread:${encodeURIComponent(threadId)}:ordinal:`;
  const ordinal = runId.slice(prefix.length);
  return runId.startsWith(prefix) && /^[1-9]\d*$/.test(ordinal) && Number.isSafeInteger(Number(ordinal));
}

export function readWorkshopTransfer(text: string, receipts: WorkshopReceipt[]): WorkshopReceipt | null {
  if (text.length > 16_384) return null;
  try {
    const input = JSON.parse(text);
    if (input?.schema === sharingSchema) {
      const receipt = input.receipt;
      if (!isWorkshopReceipt(receipt)) return null;
      return applySharedReceipt(receipt, receipts.find(({ runId }) => runId === receipt.runId));
    }

    const thread = input?.thread;
    if (typeof thread?.providerInstanceId !== 'string' || !thread.providerInstanceId.trim() ||
        typeof thread.model !== 'string' || !thread.model.trim() ||
        !matchingT3RunId(thread.threadId, thread.latestRunId)) return null;

    const existing = receipts.find((receipt) => receipt.runId === thread.latestRunId);
    const waiting = thread.status === 'waiting' ||
      (thread.status === 'running' && Number.isSafeInteger(thread.pendingRequestCount) && thread.pendingRequestCount > 0);
    const status = waiting ? 'blocked' : thread.status;
    const receipt = {
      runId: thread.latestRunId,
      agent: existing?.agent ?? `T3 Code / ${thread.providerInstanceId} / ${thread.model}`,
      task: existing?.task ?? thread.title,
      state: isOption(status, workshopRunStates) ? status : 'unknown',
      elapsedSeconds: existing?.elapsedSeconds ?? null,
      applyMode: existing?.applyMode ?? 'unknown',
      prUrl: existing?.prUrl ?? '',
      ci: existing?.ci ?? 'unknown',
      ciUrl: existing?.ciUrl ?? ''
    };
    return isWorkshopReceipt(receipt) ? receipt : null;
  } catch {
    return null;
  }
}
