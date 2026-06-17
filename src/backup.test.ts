import { describe, expect, it } from 'vitest';
import { createBackupText, restoreBackupText } from './backup';
import type { CockpitTask } from './promptBuilders';

const task: CockpitTask = {
  title: 'Ship tiny cockpit',
  roughGoal: 'Keep the workflow safe and local.',
  status: 'reviewed',
  spec: 'One project and one task are enough.',
  plan: 'Export, refresh, import.',
  review: 'No sync.',
  logs: 'Build passed.',
  nextAction: 'Restore from backup.'
};

describe('backup helpers', () => {
  it('creates a versioned JSON backup for cockpit projects', () => {
    const backupText = createBackupText([
      {
        id: 'local-lab',
        name: 'Local Lab',
        description: 'Daily Codex cockpit',
        task
      }
    ]);

    const backup = JSON.parse(backupText);

    expect(backup.version).toBe(1);
    expect(backup.projects[0].name).toBe('Local Lab');
    expect(backup.projects[0].task.nextAction).toBe('Restore from backup.');
  });

  it('restores valid backup text and rejects invalid shapes', () => {
    const backupText = createBackupText([
      {
        id: 'local-lab',
        name: 'Local Lab',
        description: 'Daily Codex cockpit',
        task
      }
    ]);

    expect(restoreBackupText(backupText)[0].task.status).toBe('reviewed');
    expect(() => restoreBackupText('{"projects":"nope"}')).toThrow('Invalid cockpit backup');
    expect(() => restoreBackupText('not json')).toThrow('Invalid cockpit backup');
  });

  it('restores valid mood values and rejects invalid mood values', () => {
    const backupText = createBackupText([
      {
        id: 'local-lab',
        name: 'Local Lab',
        description: 'Daily Codex cockpit',
        task: { ...task, mood: '今日やる' }
      }
    ]);
    const invalidMood = backupText.replace('今日やる', '全部やる');

    expect(restoreBackupText(backupText)[0].task.mood).toBe('今日やる');
    expect(() => restoreBackupText(invalidMood)).toThrow('Invalid cockpit backup');
  });

  it('keeps optional context pack text in backups', () => {
    const backupText = createBackupText([
      {
        id: 'local-lab',
        name: 'Local Lab',
        description: 'Daily Codex cockpit',
        task: { ...task, contextPack: 'Read AI_CREOLE.md before expanding context.' }
      }
    ]);

    expect(restoreBackupText(backupText)[0].task.contextPack).toBe('Read AI_CREOLE.md before expanding context.');
  });

  it('keeps optional GOLDEN text in backups and rejects invalid GOLDEN values', () => {
    const backupText = createBackupText([
      {
        id: 'local-lab',
        name: 'Local Lab',
        description: 'Daily Codex cockpit',
        task: { ...task, golden: 'Backup export/import keeps cockpit notes.' }
      }
    ]);
    const invalidGolden = backupText.replace('"Backup export/import keeps cockpit notes."', '42');

    expect(restoreBackupText(backupText)[0].task.golden).toBe('Backup export/import keeps cockpit notes.');
    expect(() => restoreBackupText(invalidGolden)).toThrow('Invalid cockpit backup');
  });

  it('keeps bounded packet history in backups and rejects invalid entries', () => {
    const backupText = createBackupText([
      {
        id: 'local-lab',
        name: 'Local Lab',
        description: 'Daily Codex cockpit',
        task,
        packetHistory: [
          {
            schema: 'madowaku.packet_history.v1',
            id: 'packet-1',
            capturedAt: '2026-05-16T00:00:00.000Z',
            summary: 'Local Lab / Ship tiny cockpit / reviewed / codex_task',
            next: 'Restore from backup.',
            copyText: 'LATEST_USEFUL_PACKET:\n- Task: Ship tiny cockpit'
          }
        ]
      }
    ]);
    const invalid = backupText.replace('"madowaku.packet_history.v1"', '"bad.schema"');

    expect(restoreBackupText(backupText)[0].packetHistory?.[0].summary).toContain('Ship tiny cockpit');
    expect(() => restoreBackupText(invalid)).toThrow('Invalid cockpit backup');
  });
});
