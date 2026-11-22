import { describe, expect, it, vi } from 'vitest';
import type { BackupProject } from './backup';
import { projectStorageKey, readStoredProjects, setWorkshopReceipt, writeProjects } from './projectStorage';
import { firstWorkshopReceipt } from './workshopReceipts';

const initial: BackupProject[] = [{
  id: 'lab', name: 'Workshop', description: 'Keep the existing notes',
  task: { title: '', roughGoal: '', status: 'idea', spec: '', plan: '', review: 'review', logs: 'log', nextAction: '' },
  workshopReceipts: [firstWorkshopReceipt]
}];

function setupTabs() {
  let raw = JSON.stringify(initial);
  const storage = {
    getItem: vi.fn(() => raw),
    setItem: vi.fn((_key: string, value: string) => { raw = value; })
  };
  let release!: () => void;
  let tail = new Promise<void>((resolve) => { release = resolve; });
  const locks = {
    request: vi.fn((_name: string, callback: () => void) => {
      const result = tail.then(callback);
      tail = result.catch(() => {});
      return result;
    })
  };
  return { storage, locks, release };
}

describe('cockpit project storage', () => {
  it('keeps receipts from two tabs and unrelated edits while requests wait on the same exclusive lock', async () => {
    const { storage, locks, release } = setupTabs();
    const a = { ...firstWorkshopReceipt, runId: 'tab-a' };
    const b = { ...firstWorkshopReceipt, runId: 'tab-b' };
    const savingA = writeProjects(storage, locks, initial, (latest) => setWorkshopReceipt(latest, 'lab', a));
    const editingNotes = writeProjects(storage, locks, initial, ([project]) => [{ ...project, name: 'Updated Workshop' }]);
    const savingB = writeProjects(storage, locks, initial, (latest) => setWorkshopReceipt(latest, 'lab', b));
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    release();
    await Promise.all([savingA, savingB, editingNotes]);
    const [saved] = readStoredProjects(storage, initial);
    expect(locks.request.mock.calls.map(([name]) => name)).toEqual(Array(3).fill(projectStorageKey));
    expect(saved.workshopReceipts).toEqual([b, a, firstWorkshopReceipt]);
    expect(saved.name).toBe('Updated Workshop');
    expect(saved.task).toEqual(initial[0].task);
  });

  it('aborts without a lock, including when the browser refuses to grant one', async () => {
    const { storage } = setupTabs();
    const change = vi.fn(() => initial);
    await expect(writeProjects(storage, undefined, initial, change)).rejects.toThrow('排他制御');
    const denied = { request: async () => { throw new Error('Lock unavailable'); } };
    await expect(writeProjects(storage, denied, initial, change)).rejects.toThrow('Lock unavailable');
    expect(change).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('rejects a stale same-ID edit inside the lock without overwriting the first save', async () => {
    const { storage, locks, release } = setupTabs();
    const newer = { ...firstWorkshopReceipt, elapsedSeconds: 160 };
    const older = { ...firstWorkshopReceipt, elapsedSeconds: 170 };
    const first = writeProjects(storage, locks, initial, (latest) => setWorkshopReceipt(latest, 'lab', newer, firstWorkshopReceipt));
    const second = writeProjects(storage, locks, initial, (latest) => setWorkshopReceipt(latest, 'lab', older, firstWorkshopReceipt));
    const rejected = expect(second).rejects.toThrow('同じ実行ID');
    release();
    await first;
    await rejected;
    expect(readStoredProjects(storage, initial)[0].workshopReceipts).toEqual([newer]);
  });
});
