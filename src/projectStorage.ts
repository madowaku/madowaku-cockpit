import { isProjectCollection, type BackupProject } from './backup';
import type { WorkshopReceipt } from './workshopReceipts';

export const projectStorageKey = 'madowaku-codex-cockpit-v0-1';

export type ProjectChange = (projects: BackupProject[]) => BackupProject[];
type ProjectLocks = { request(name: string, update: () => void): Promise<void> };
type ProjectStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function readStoredProjects(storage: ProjectStorage, defaults: BackupProject[]) {
  const saved = storage.getItem(projectStorageKey);
  if (saved === null) return defaults;
  const projects: unknown = JSON.parse(saved);
  if (!isProjectCollection(projects)) throw new Error('保存済みデータを確認できません。上書きせず中止しました。');
  return projects;
}

export async function writeProjects(
  storage: ProjectStorage, locks: ProjectLocks | undefined, defaults: BackupProject[], change: ProjectChange
) {
  if (!locks) throw new Error('このブラウザーでは排他制御が利用できないため、保存を中止しました。');
  await locks.request(projectStorageKey, () => {
    const latest = readStoredProjects(storage, defaults);
    storage.setItem(projectStorageKey, JSON.stringify(change(latest)));
  });
}

export function setWorkshopReceipt(
  projects: BackupProject[], projectId: string, receipt: WorkshopReceipt, expected?: WorkshopReceipt
) {
  const project = projects.find(({ id }) => id === projectId);
  if (!project) throw new Error('保存先のプロジェクトが見つかりません。');
  const receipts = project.workshopReceipts ?? [];
  const previous = receipts.find(({ runId }) => runId === receipt.runId);
  if (JSON.stringify(previous) !== JSON.stringify(expected)) {
    throw new Error('同じ実行IDの結果票がすでに保存または更新されています。最新の記録を確認してください。');
  }
  return projects.map((item) => item.id === projectId
    ? { ...item, workshopReceipts: [receipt, ...receipts.filter(({ runId }) => runId !== receipt.runId)] }
    : item);
}
