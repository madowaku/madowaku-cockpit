import { isProjectCollection, type BackupProject } from './backup';
import type { WorkshopReceipt } from './workshopReceipts';

export const projectStorageKey = 'madowaku-codex-cockpit-v0-1';
const storeName = 'workspace';
const recordKey = 'projects';

export type ProjectChange = (projects: BackupProject[]) => BackupProject[];
type LegacyProjects = () => BackupProject[];

export function readStoredProjects(storage: Pick<Storage, 'getItem'>, defaults: BackupProject[]) {
  const saved = storage.getItem(projectStorageKey);
  if (saved === null) return defaults;
  const projects: unknown = JSON.parse(saved);
  if (!isProjectCollection(projects)) throw new Error('保存済みデータを確認できません。上書きせず中止しました。');
  return projects;
}

function openProjectDatabase(factory: IDBFactory | undefined): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!factory) {
      reject(new Error('このブラウザーでは排他制御が利用できないため、保存を中止しました。'));
      return;
    }
    const request = factory.open(projectStorageKey, 1);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onblocked = () => {
      blocked = true;
      reject(new Error('別のタブが保存領域を使用しています。閉じてから再試行してください。'));
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
  });
}

export async function accessProjects(
  factory: IDBFactory | undefined, readLegacy: LegacyProjects, change?: ProjectChange
): Promise<BackupProject[]> {
  const database = await openProjectDatabase(factory);
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, change ? 'readwrite' : 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(recordKey);
      let projects: BackupProject[];
      let failure: unknown;
      transaction.oncomplete = () => resolve(projects);
      transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('保存を中止しました。'));
      request.onsuccess = () => {
        try {
          const latest: unknown = request.result === undefined ? readLegacy() : request.result;
          if (!isProjectCollection(latest)) throw new Error('保存済みデータを確認できません。上書きせず中止しました。');
          projects = change ? change(latest) : latest;
          if (change) store.put(projects, recordKey);
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
    });
  } finally {
    database.close();
  }
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
