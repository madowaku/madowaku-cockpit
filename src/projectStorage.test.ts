import { describe, expect, it, vi } from 'vitest';
import type { BackupProject } from './backup';
import { accessProjects, readStoredProjects, setWorkshopReceipt } from './projectStorage';
import { firstWorkshopReceipt } from './workshopReceipts';

const initial: BackupProject[] = [{
  id: 'lab', name: 'Workshop', description: 'Keep the existing notes',
  task: { title: '', roughGoal: '', status: 'idea', spec: '', plan: '', review: 'review', logs: 'log', nextAction: '' },
  workshopReceipts: [firstWorkshopReceipt]
}];

function setupTabs() {
  let saved: BackupProject[] | undefined;
  let release!: () => void;
  let queue = new Promise<void>((resolve) => { release = resolve; });
  const modes: IDBTransactionMode[] = [];
  const db = {
    close() {},
    transaction(_store: string, mode: IDBTransactionMode) {
      modes.push(mode);
      const get = { result: undefined as BackupProject[] | undefined, onsuccess: () => {} };
      let next: BackupProject[] | undefined;
      let aborted = false;
      const txn = {
        objectStore: () => ({ get: () => get, put: (value: BackupProject[]) => { next = value; } }),
        abort: () => { aborted = true; },
        onabort: () => {},
        oncomplete: () => {}
      };
      queue = queue.then(() => {
        get.result = saved && structuredClone(saved);
        get.onsuccess();
        if (aborted) txn.onabort();
        else {
          if (next) saved = structuredClone(next);
          txn.oncomplete();
        }
      });
      return txn;
    }
  };
  const factory = {
    open() {
      const request = { result: db, onsuccess: () => {} };
      queueMicrotask(() => request.onsuccess());
      return request;
    }
  } as unknown as IDBFactory;
  const readLegacy = vi.fn(() => initial);
  return { factory, readLegacy, modes, release };
}

describe('cockpit project storage', () => {
  it('keeps two tabs’ receipts and the migrated legacy data through queued transactions', async () => {
    const { factory, readLegacy, modes, release } = setupTabs();
    const a = { ...firstWorkshopReceipt, runId: 'tab-a' };
    const b = { ...firstWorkshopReceipt, runId: 'tab-b' };
    const savingA = accessProjects(factory, readLegacy, (latest) => setWorkshopReceipt(latest, 'lab', a));
    const editingNotes = accessProjects(factory, readLegacy, ([project]) => [{ ...project, name: 'Updated Workshop' }]);
    const savingB = accessProjects(factory, readLegacy, (latest) => setWorkshopReceipt(latest, 'lab', b));
    expect(readLegacy).not.toHaveBeenCalled();
    release();
    await Promise.all([savingA, savingB, editingNotes]);
    const [saved] = await accessProjects(factory, readLegacy);
    expect(modes).toEqual(['readwrite', 'readwrite', 'readwrite', 'readonly']);
    expect(readLegacy).toHaveBeenCalledOnce();
    expect(saved.workshopReceipts).toEqual([b, a, firstWorkshopReceipt]);
    expect(saved.name).toBe('Updated Workshop');
    expect(saved.task).toEqual(initial[0].task);
  });

  it('aborts without a transactional store or when the browser rejects access', async () => {
    const change = vi.fn(() => initial);
    const readLegacy = vi.fn(() => initial);
    await expect(accessProjects(undefined, readLegacy, change)).rejects.toThrow('排他制御');
    const denied = { open: () => { throw new Error('Storage unavailable'); } } as unknown as IDBFactory;
    await expect(accessProjects(denied, readLegacy, change)).rejects.toThrow('Storage unavailable');
    expect(readLegacy).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('rejects a stale same-ID edit inside the lock without overwriting the first save', async () => {
    const { factory, readLegacy, release } = setupTabs();
    const newer = { ...firstWorkshopReceipt, elapsedSeconds: 160 };
    const older = { ...firstWorkshopReceipt, elapsedSeconds: 170 };
    const first = accessProjects(factory, readLegacy, (latest) => setWorkshopReceipt(latest, 'lab', newer, firstWorkshopReceipt));
    const second = accessProjects(factory, readLegacy, (latest) => setWorkshopReceipt(latest, 'lab', older, firstWorkshopReceipt));
    const rejected = expect(second).rejects.toThrow('同じ実行ID');
    release();
    await first;
    await rejected;
    expect((await accessProjects(factory, readLegacy))[0].workshopReceipts).toEqual([newer]);
  });

  it('reads existing localStorage projects without rewriting the v1 data', () => {
    const previous = JSON.stringify(initial);
    const storage = { getItem: vi.fn(() => previous) };
    expect(readStoredProjects(storage, [])).toEqual(initial);
  });
});
