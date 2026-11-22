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
