export type HygieneClassification = 'MUST_KEEP' | 'UNKNOWN_KEEP' | 'REVIEW_REQUIRED';

export type HygieneRecord = {
  path: string;
  branch: string | null;
  head: string;
  classification: HygieneClassification;
  reasons: string[];
  dirty: boolean | null;
  ignored: boolean | null;
  unmerged: boolean | null;
};

export type HygieneReport = {
  schema: 'mcc-development-hygiene/v1';
  mode: 'READ_ONLY';
  repository: string;
  worktrees: HygieneRecord[];
  summary: { mustKeep: number; unknownKeep: number; reviewRequired: number };
};

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseHygieneReport(text: string): HygieneReport {
  if (text.length > 128_000) throw new Error('レポートが大きすぎます (128KB 上限)。');
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('正しいJSONを貼り付けてください。');
  }
  if (!object(value) || value.schema !== 'mcc-development-hygiene/v1' || value.mode !== 'READ_ONLY') {
    throw new Error('読み取り専用のMCC-M4監査JSONではありません。');
  }
  if (typeof value.repository !== 'string' || value.repository.length > 2048 ||
      !Array.isArray(value.worktrees) || value.worktrees.length > 40) {
    throw new Error('リポジトリまたはworktree一覧が不正です。');
  }
  const categories: HygieneClassification[] = ['MUST_KEEP', 'UNKNOWN_KEEP', 'REVIEW_REQUIRED'];
  const worktrees = value.worktrees.map((entry: unknown) => {
    if (!object(entry) || typeof entry.path !== 'string' || entry.path.length > 2048 ||
        !categories.includes(entry.classification as HygieneClassification) ||
        typeof entry.head !== 'string' || !/^[a-f0-9]{40,64}$/i.test(entry.head) ||
        !(entry.branch === null || typeof entry.branch === 'string') ||
        !Array.isArray(entry.reasons) || entry.reasons.length > 25 ||
        !entry.reasons.every((reason: unknown) => typeof reason === 'string' && reason.length <= 120) ||
        ![true, false, null].includes(entry.dirty as boolean | null) ||
        ![true, false, null].includes(entry.ignored as boolean | null) ||
        ![true, false, null].includes(entry.unmerged as boolean | null)) {
      throw new Error('worktreeのデータに不正な項目があります。');
    }
    return {
      path: entry.path,
      branch: entry.branch as string | null,
      head: entry.head,
      classification: entry.classification as HygieneClassification,
      reasons: entry.reasons as string[],
      dirty: entry.dirty as boolean | null,
      ignored: entry.ignored as boolean | null,
      unmerged: entry.unmerged as boolean | null
    };
  });
  // Never trust unverified summary counts from pasted JSON.
  return {
    schema: 'mcc-development-hygiene/v1', mode: 'READ_ONLY', repository: value.repository,
    worktrees,
    summary: {
      mustKeep: worktrees.filter((item) => item.classification === 'MUST_KEEP').length,
      unknownKeep: worktrees.filter((item) => item.classification === 'UNKNOWN_KEEP').length,
      reviewRequired: worktrees.filter((item) => item.classification === 'REVIEW_REQUIRED').length
    }
  };
}
