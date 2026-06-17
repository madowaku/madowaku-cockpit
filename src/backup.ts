import type { CockpitTask, PacketHistoryEntry, TaskMood, TaskStatus } from './promptBuilders';

export type BackupProject = {
  id: string;
  name: string;
  description: string;
  task: CockpitTask;
  packetHistory?: PacketHistoryEntry[];
};

type BackupPayload = {
  version: 1;
  exportedAt: string;
  projects: BackupProject[];
};

const statuses: TaskStatus[] = ['idea', 'planned', 'in-progress', 'reviewed', 'done'];
const moods: TaskMood[] = ['今日やる', '詰まり中', '寝かせる', 'Codex待ち'];

export function createBackupText(projects: BackupProject[]) {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects
  };

  return JSON.stringify(payload, null, 2);
}

export function restoreBackupText(backupText: string) {
  try {
    const parsed = JSON.parse(backupText) as BackupPayload;

    if (!isBackupPayload(parsed)) {
      throw new Error('Invalid cockpit backup');
    }

    return parsed.projects;
  } catch {
    throw new Error('Invalid cockpit backup');
  }
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!isRecord(value)) return false;
  return value.version === 1 && Array.isArray(value.projects) && value.projects.every(isBackupProject);
}

function isBackupProject(value: unknown): value is BackupProject {
  if (!isRecord(value) || !isRecord(value.task)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    (value.packetHistory === undefined || (Array.isArray(value.packetHistory) && value.packetHistory.length <= 5 && value.packetHistory.every(isPacketHistoryEntry))) &&
    typeof value.task.title === 'string' &&
    typeof value.task.roughGoal === 'string' &&
    statuses.includes(value.task.status as TaskStatus) &&
    (value.task.mood === undefined || moods.includes(value.task.mood as TaskMood)) &&
    typeof value.task.spec === 'string' &&
    typeof value.task.plan === 'string' &&
    (value.task.contextPack === undefined || typeof value.task.contextPack === 'string') &&
    (value.task.golden === undefined || typeof value.task.golden === 'string') &&
    typeof value.task.review === 'string' &&
    typeof value.task.logs === 'string' &&
    typeof value.task.nextAction === 'string'
  );
}


function isPacketHistoryEntry(value: unknown): value is PacketHistoryEntry {
  if (!isRecord(value)) return false;
  return (
    value.schema === 'madowaku.packet_history.v1' &&
    typeof value.id === 'string' &&
    typeof value.capturedAt === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.next === 'string' &&
    typeof value.copyText === 'string'
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}




