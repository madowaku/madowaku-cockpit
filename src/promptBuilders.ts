export type TaskStatus = 'idea' | 'planned' | 'in-progress' | 'reviewed' | 'done';

export type TaskMood = '今日やる' | '詰まり中' | '寝かせる' | 'Codex待ち';

export type Project = {
  name: string;
  description: string;
};

export type CockpitTask = {
  title: string;
  roughGoal: string;
  status: TaskStatus;
  mood?: TaskMood;
  contextPack?: string;
  golden?: string;
  spec: string;
  plan: string;
  review: string;
  logs: string;
  nextAction: string;
};

export type HandoffTarget =
  | 'github_issue'
  | 'github_pr'
  | 'obsidian_markdown'
  | 'local_llm_prompt'
  | 'codex_task'
  | 'madowaku_scout'
  | 'codex_plugin_blueprint'
  | 'freebuff_markdown';

export type HandoffPacket = {
  schema: 'madowaku.handoff_packet.v1';
  target: HandoffTarget;
  project: string;
  task: string;
  status: TaskStatus;
  mood: string;
  goal: string;
  state: string;
  context: string;
  do: string[];
  keep: string[];
  no: string[];
  check: string[];
  risk: string[];
  out: string[];
  next: string;
};

export type WorkbenchLaneId =
  | 'handoff_packet'
  | 'madowaku_scout'
  | 'codex'
  | 'local_llm'
  | 'github'
  | 'obsidian'
  | 'codex_plugin'
  | 'freebuff';

export type WorkbenchLane = {
  id: WorkbenchLaneId;
  label: string;
  state: string;
  check: string;
  next: string;
  handoff: string;
};




export type PacketHistoryEntry = {
  schema: 'madowaku.packet_history.v1';
  id: string;
  capturedAt: string;
  summary: string;
  next: string;
  copyText: string;
};
export type MemoryVaultReuseIndexItem = {
  id: string;
  capturedAt: string;
  summary: string;
  next: string;
  state: 'fresh' | 'stale';
};
export type FocusModeId =
  | 'overview'
  | 'codex_handoff'
  | 'scout_adopt'
  | 'local_review'
  | 'memory_save'
  | 'plugin_ready'
  | 'all_panels';

export type FocusMode = {
  id: FocusModeId;
  label: string;
  purpose: string;
  sections: string[];
  panels: string[];
  safetyNote: string;
  showAllPanels?: boolean;
};
export type LatestUsefulPacketRecall = {
  label: string;
  purpose: string;
  sourcePanels: string[];
  packetSummary: string;
  latestTrace: string;
  golden: string;
  next: string;
  copyText: string;
};
export type TodayWorklineSummary = {
  label: 'Today Workline Summary';
  reflectedPackets: MemoryVaultReuseIndexItem[];
  staleWarnings: MemoryVaultReuseIndexItem[];
  text: string;
};
export type HandoffRunbookPreset = {
  id:
    | 'codex_implementation'
    | 'scout_idea'
    | 'local_llm_review'
    | 'memory_vault'
    | 'github_handoff'
    | 'codex_plugin_ready'
    | 'obsidian_capture';
  label: string;
  purpose: string;
  panels: string[];
  order: string[];
  safetyNote: string;
};
export type WorkflowTemplateId = 'goal' | 'plan' | 'review' | 'creole';

export type CodexPluginReadyPack = {
  label: 'Codex Plugin Ready';
  readiness: Array<{
    label: string;
    state: string;
    next: string;
  }>;
  pluginSketch: string;
  siteBrief: string;
  annotationMap: string;
  copyText: string;
};

export const workflowTemplates: Array<{ id: WorkflowTemplateId; label: string; description: string }> = [
  {
    id: 'goal',
    label: 'Goal Maker',
    description: 'Scout/Judge/Workerで小さく切る'
  },
  {
    id: 'plan',
    label: 'Plan',
    description: '実装前の手順を整える'
  },
  {
    id: 'review',
    label: 'Review',
    description: 'レビュー観点と完了条件を揃える'
  },
  {
    id: 'creole',
    label: 'AI-CREOLE',
    description: '短い作業語でCodexに渡す'
  }
];

const fallback = (value: string | undefined, label: string) => value?.trim() || `(No ${label} yet.)`;

const section = (title: string, body: string | undefined, label = title.toLowerCase()) =>
  `## ${title}\n${fallback(body, label)}`;

const markdownSection = (title: string, body: string | undefined, label = title.toLowerCase()) =>
  [`## ${title}`, '', fallback(body, label)].join('\n');

const yamlValue = (value: string | undefined, label: string) =>
  `"${fallback(value, label).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const goldenBody = (task: CockpitTask) => task.golden?.trim() || task.review?.trim();

const appendTemplate = (current: string | undefined, addition: string) =>
  current?.trim() ? `${current.trim()}\n\n${addition}` : addition;

export function buildGoalMakerPrompt(project: Project, task: CockpitTask) {
  return [
    '/goal-maker',
    '',
    `Create a small, reviewable goal for this local-first project task.`,
    '',
    `Project: ${fallback(project.name, 'project name')}`,
    `Project Notes: ${fallback(project.description, 'project notes')}`,
    `Task: ${fallback(task.title, 'task title')}`,
    `Status: ${task.status}`,
    `Mood: ${task.mood ?? '未設定'}`,
    '',
    section('Context Pack', task.contextPack, 'context pack'),
    '',
    section('Rough Goal', task.roughGoal, 'rough goal'),
    '',
    section('Spec', task.spec),
    '',
    section('Plan', task.plan),
    '',
    section('Review', task.review),
    '',
    section('GOLDEN', task.golden, 'golden cases'),
    '',
    section('Logs', task.logs),
    '',
    section('Next Action', task.nextAction, 'next action'),
    '',
    'Constraints:',
    '- Keep the tranche small enough for one focused session.',
    '- Prefer Scout, then Judge, then one bounded Worker task.',
    '- Keep v0.1 local-first and reviewable.'
  ].join('\n');
}

export function buildPlanPrompt(project: Project, task: CockpitTask) {
  return [
    '/plan',
    '',
    'Plan the next safe implementation slice for this local-first cockpit task.',
    '',
    `Project: ${fallback(project.name, 'project name')}`,
    `Project Notes: ${fallback(project.description, 'project notes')}`,
    `Task: ${fallback(task.title, 'task title')}`,
    `Status: ${task.status}`,
    `Mood: ${task.mood ?? '未設定'}`,
    '',
    section('Context Pack', task.contextPack, 'context pack'),
    '',
    section('Rough Goal', task.roughGoal, 'rough goal'),
    '',
    section('Spec', task.spec),
    '',
    section('Existing Plan', task.plan, 'plan'),
    '',
    section('Review Notes', task.review, 'review notes'),
    '',
    section('GOLDEN', task.golden, 'golden cases'),
    '',
    section('Logs', task.logs),
    '',
    section('Next Action', task.nextAction, 'next action'),
    '',
    'Guardrails:',
    '- Do not add model calls, filesystem access, shell execution from the app, auth, sync, or Codex App Server integration.',
    '- Prefer Vite + React + TypeScript.',
    '- Use localStorage for v0.1 persistence.',
    '- Keep the UI playful but practical.'
  ].join('\n');
}

export function buildTraceReflection(project: Project, task: CockpitTask) {
  return [
    'TRACE:',
    `- Project: ${fallback(project.name, 'project name')}`,
    `- Task: ${fallback(task.title, 'task title')}`,
    `- Observation: ${fallback(task.logs, 'logs')}`,
    '',
    'CHECK:',
    `- Verification / evidence: ${fallback(task.logs, 'verification notes')}`,
    '',
    'GOLDEN:',
    `- Preserve: ${fallback(goldenBody(task), 'golden cases')}`,
    '',
    `NEXT: ${fallback(task.nextAction, 'next action')}`,
    '',
    'COMPRESS:',
    '- Keep only decisions, changed files, failures, checks, and the next action for the next run.'
  ].join('\n');
}

export function applyTraceToContextPack(project: Project, task: CockpitTask): CockpitTask {
  const trace = buildTraceReflection(project, task);
  const currentContext = task.contextPack ?? '';

  if (currentContext.replace(/\r\n/g, '\n').includes(trace.replace(/\r\n/g, '\n'))) {
    return task;
  }

  return { ...task, contextPack: appendTemplate(task.contextPack, trace) };
}
export function countTraceBlocks(contextPack: string | undefined) {
  return contextPack?.match(/^TRACE:/gm)?.length ?? 0;
}

function latestTraceBlock(contextPack: string | undefined) {
  const normalizedContext = contextPack?.replace(/\r\n/g, '\n').trim();
  if (!normalizedContext) return '(No TRACE yet.)';

  const traceStart = normalizedContext.startsWith('TRACE:') ? 0 : normalizedContext.lastIndexOf('\nTRACE:') + 1;
  return traceStart > 0 || normalizedContext.startsWith('TRACE:')
    ? normalizedContext.slice(traceStart).trim()
    : '(No TRACE yet.)';
}

function extractFileMentions(contextPack: string | undefined) {
  const seen = new Set<string>();
  const blockedRoots = ['node_modules', 'dist', 'screenshots'];

  return (contextPack ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*\d.)\s]+/, '').replace(/^@/, ''))
    .filter((line) => /^[\w./-]+\.[\w-]+$/.test(line))
    .filter((line) => !blockedRoots.some((root) => line === root || line.startsWith(`${root}/`)))
    .filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .slice(0, 8)
    .map((line) => `@${line}`);
}

export function buildContextPackCompressCandidate(task: CockpitTask) {
  const traceCount = countTraceBlocks(task.contextPack);
  const latestTrace = latestTraceBlock(task.contextPack);

  if (traceCount < 3) {
    return [
      'COMPRESS CANDIDATE:',
      `- TRACE count: ${traceCount}`,
      '- No compression needed yet. Keep collecting small, useful traces.',
      '',
      'NEXT:',
      fallback(task.nextAction, 'next action')
    ].join('\n');
  }

  return [
    'COMPRESS CANDIDATE:',
    `- TRACE count: ${traceCount}`,
    '- Replace older TRACE blocks with one compact TRACE SUMMARY in 文脈パック.',
    '- Keep decisions, changed files, failed checks, passing checks, GOLDEN cases, and the current NEXT.',
    '',
    'LATEST_TRACE:',
    latestTrace,
    '',
    'OUT:',
    '- TRACE SUMMARY',
    '- CHECK',
    '- GOLDEN',
    '- NEXT'
  ].join('\n');
}
export function buildCreoleHandoffPrompt(project: Project, task: CockpitTask) {
  return [
    'ROLE: Codex',
    'MODE: codex_patch',
    '',
    `GOAL: ${fallback(task.roughGoal, 'rough goal')}`,
    `STATE: Project=${fallback(project.name, 'project name')}; Task=${fallback(task.title, 'task title')}; Status=${task.status}; Mood=${task.mood ?? '未設定'}`,
    `CONTEXT: ${fallback(project.description, 'project notes')}`,
    '',
    'CONTEXT_PACK:',
    fallback(task.contextPack, 'context pack'),
    '',
    'LATEST_TRACE:',
    latestTraceBlock(task.contextPack),
    '',
    'LOOP: Prelude -> STATE/CHECK/NEXT -> Coda',
    'TRACE: Use pasted logs and observations as learning evidence.',
    'REPLAY: Name any reproducible input, command, screenshot, seed, or manual path if relevant.',
    `GOLDEN: ${fallback(task.golden, 'golden representative cases')}`,
    'COMPRESS: Keep the next patch small; summarize noisy output before expanding context.',
    '',
    `DO: ${fallback(task.plan, 'plan')}`,
    `KEEP: ${fallback(task.review, 'review notes')}`,
    'NO: cloud sync, auth, billing, app filesystem writes, shell execution from the app, Codex App Server integration unless explicitly approved.',
    `CHECK: ${fallback(task.logs, 'logs or verification notes')}`,
    `NEXT: ${fallback(task.nextAction, 'next action')}`,
    '',
    'OUT: changed files, verification, TRACE, risk, and one NEXT.'
  ].join('\n');
}

export function buildHandoffPacket(
  project: Project,
  task: CockpitTask,
  target: HandoffTarget = 'codex_task'
): HandoffPacket {
  return {
    schema: 'madowaku.handoff_packet.v1',
    target,
    project: fallback(project.name, 'project name'),
    task: fallback(task.title, 'task title'),
    status: task.status,
    mood: task.mood ?? '未設定',
    goal: fallback(task.roughGoal, 'rough goal'),
    state: `Project=${fallback(project.name, 'project name')}; Task=${fallback(task.title, 'task title')}; Status=${task.status}; Mood=${task.mood ?? '未設定'}`,
    context: [
      fallback(project.description, 'project notes'),
      '',
      'CONTEXT_PACK:',
      fallback(task.contextPack, 'context pack'),
      '',
      'LATEST_TRACE:',
      latestTraceBlock(task.contextPack)
    ].join('\n'),
    do: [fallback(task.plan, 'plan')],
    keep: [fallback(task.review, 'review notes'), fallback(task.golden, 'golden cases')],
    no: ['no secrets', 'no auth', 'no sync', 'no automatic tool execution', 'no hidden filesystem writes'],
    check: ['npm test', 'npm run build', fallback(task.logs, 'verification notes')],
    risk: ['scope creep', 'stale context', 'unverified external-tool claims'],
    out: ['Scout Report', 'Adopt Proposal', 'AI_CREOLE patch idea', 'Codex task idea', 'Plugin Ready Pack'],
    next: fallback(task.nextAction, 'next action')
  };
}

export function buildHandoffPacketJson(
  project: Project,
  task: CockpitTask,
  target: HandoffTarget = 'codex_task'
) {
  return JSON.stringify(buildHandoffPacket(project, task, target), null, 2);
}

export function buildWorkbenchDashboard(project: Project, task: CockpitTask): WorkbenchLane[] {
  const packet = buildHandoffPacket(project, task);
  const latestTrace = latestTraceBlock(task.contextPack);

  return [
    {
      id: 'handoff_packet',
      label: 'HandoffPacket',
      state: `${packet.schema} ready for ${packet.target}`,
      check: 'Stable JSON; connectionless; no secrets.',
      next: 'Use this as the typed boundary before adding real connectors.',
      handoff: 'Typed JSON'
    },
    {
      id: 'madowaku_scout',
      label: 'Madowaku Scout',
      state: 'DISCOVER / SCOUT / MAP / PROPOSE / ADOPT prompt ready.',
      check: 'Human adoption gate required before changing tools or dependencies.',
      next: 'Paste new tools or ideas into Scout/Adopt before implementation.',
      handoff: 'Scout/Adopt Prompt'
    },
    {
      id: 'codex',
      label: 'Codex',
      state: `Goal=${fallback(task.roughGoal, 'rough goal')}; Latest TRACE=${latestTrace}`,
      check: `npm test; npm run build; ${fallback(task.logs, 'verification notes')}`,
      next: fallback(task.nextAction, 'next action'),
      handoff: 'AI-CREOLE / Goal / Plan'
    },
    {
      id: 'local_llm',
      label: 'Local LLM',
      state: 'Local LLM prep prompt ready for summarization and risk extraction.',
      check: 'Text only; no tool calls; no file modification.',
      next: 'Use for cheap summary before asking Codex for a patch.',
      handoff: 'Gemma / Qwen / Ollama Prep'
    },
    {
      id: 'github',
      label: 'GitHub',
      state: 'Issue / PR body can be generated from current cockpit fields.',
      check: 'Manual copy only; no GitHub API or token handling.',
      next: 'Use GitHub handoff when the task needs reviewable repo history.',
      handoff: 'Issue / PR Markdown'
    },
    {
      id: 'obsidian',
      label: 'Obsidian',
      state: 'Markdown export can preserve the current work memory.',
      check: 'Manual download only; no direct vault writes.',
      next: 'Export Markdown after useful TRACE / GOLDEN / NEXT content accumulates.',
      handoff: 'Markdown Export'
    },
    {
      id: 'codex_plugin',
      label: 'Codex Plugin Ready',
      state: 'AI_CREOLE, HandoffPacket, runbooks, and status-site brief can be copied as one plugin blueprint.',
      check: 'Blueprint only; no marketplace install, connector auth, hosting deploy, or file generation from the app.',
      next: 'Use after the current task has clear GOAL / GOLDEN / NEXT and a reviewed adoption gate.',
      handoff: 'Plugin / Site / Annotation Pack'
    },
    {
      id: 'freebuff',
      label: 'Freebuff',
      state: 'Freebuff-style markdown can use @file mentions and knowledge.md context.',
      check: 'Copy-only manual paste; no CLI install; manual paste only; no command execution from cockpit.',
      next: 'Use after context pack names the files that should be mentioned.',
      handoff: 'Markdown + @files'
    }
  ];
}




export const PACKET_HISTORY_LIMIT = 5;
export const PACKET_STALE_DAYS = 7;

export function createPacketHistoryEntry(project: Project, task: CockpitTask, capturedAt = new Date().toISOString()): PacketHistoryEntry {
  const recall = buildLatestUsefulPacketRecall(project, task);
  const uniquePart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return {
    schema: 'madowaku.packet_history.v1',
    id: `${capturedAt}-${fallback(project.name, 'project').slice(0, 24)}-${fallback(task.title, 'task').slice(0, 24)}-${uniquePart}`,
    capturedAt,
    summary: recall.packetSummary,
    next: recall.next,
    copyText: recall.copyText
  };
}

export function buildMemoryVaultReuseIndex(entries: PacketHistoryEntry[], nowIso = new Date().toISOString()) {
  const items: MemoryVaultReuseIndexItem[] = trimPacketHistory(entries).map((entry) => ({
    id: entry.id,
    capturedAt: entry.capturedAt,
    summary: entry.summary,
    next: entry.next,
    state: isPacketHistoryEntryStale(entry, nowIso) ? 'stale' : 'fresh'
  }));
  const itemLines = items.length
    ? items.flatMap((item, index) => [
        `${index + 1}. ${item.summary}`,
        `   - state: ${item.state}`,
        `   - captured: ${item.capturedAt}`,
        `   - next: ${item.next}`
      ])
    : ['- No saved packets yet.'];

  return {
    items,
    markdown: ['## Reuse Packet Index', '', ...itemLines].join('\n')
  };
}

export function applyPacketToContextPack(task: CockpitTask, entry: PacketHistoryEntry): CockpitTask {
  const currentContext = task.contextPack ?? '';
  const marker = `ID: ${entry.id}`;
  if (currentContext.replace(/\r\n/g, '\n').includes(marker)) return task;

  const block = [
    'REUSE_PACKET:',
    marker,
    `CAPTURED: ${entry.capturedAt}`,
    `SUMMARY: ${entry.summary}`,
    `NEXT: ${entry.next}`
  ].join('\n');

  return { ...task, contextPack: appendTemplate(task.contextPack, block) };
}

export function trimPacketHistory(entries: PacketHistoryEntry[], limit = PACKET_HISTORY_LIMIT) {
  return [...entries]
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
    .slice(0, limit);
}

export function isPacketHistoryEntryStale(entry: PacketHistoryEntry, nowIso = new Date().toISOString()) {
  const captured = Date.parse(entry.capturedAt);
  const now = Date.parse(nowIso);
  if (Number.isNaN(captured) || Number.isNaN(now)) return true;
  return now - captured > PACKET_STALE_DAYS * 24 * 60 * 60 * 1000;
}
export function buildFocusModes(runbooks: HandoffRunbookPreset[]): FocusMode[] {
  const panelsFor = (id: HandoffRunbookPreset['id']) => runbooks.find((preset) => preset.id === id)?.panels ?? [];
  const copyOnly = 'copy-only; all generated outputs stay available and no automatic execution is implied.';

  return [
    {
      id: 'overview',
      label: 'Overview',
      purpose: 'Start here: check state, choose a flow, then recall the smallest useful packet.',
      sections: ['AI Workbench', 'Runbook Presets', 'Latest Useful Packet'],
      panels: [],
      safetyNote: copyOnly
    },
    {
      id: 'codex_handoff',
      label: 'Codex handoff',
      purpose: 'Prepare a small implementation handoff with typed state and reviewable repo context.',
      sections: ['Latest Useful Packet', 'Generated Prompts'],
      panels: ['HandoffPacket JSON', 'AI-CREOLE handoff', 'Codex OSS handoff', 'GitHub handoff'],
      safetyNote: copyOnly
    },
    {
      id: 'scout_adopt',
      label: 'Scout/adopt',
      purpose: 'Evaluate a new tool or idea before turning it into implementation work.',
      sections: ['Runbook Presets', 'Generated Prompts'],
      panels: ['Madowaku Scout/Adopt', 'HandoffPacket JSON', ...panelsFor('scout_idea').filter((panel) => panel !== 'Madowaku Scout/Adopt' && panel !== 'HandoffPacket JSON')],
      safetyNote: copyOnly
    },
    {
      id: 'local_review',
      label: 'Local review',
      purpose: 'Use cheaper text review to compress context, find risk, and prepare the next Codex action.',
      sections: ['Latest Useful Packet', 'Generated Prompts'],
      panels: panelsFor('local_llm_review'),
      safetyNote: copyOnly
    },
    {
      id: 'memory_save',
      label: 'Memory save',
      purpose: 'Save the useful work memory and leave TRACE / COMPRESS breadcrumbs for the next task.',
      sections: ['Latest Useful Packet', 'Generated Prompts'],
      panels: ['Memory Vault', 'TRACE reflection', '圧縮プロンプト', 'COMPRESS候補', 'Latest Useful Packet'],
      safetyNote: copyOnly
    },
    {
      id: 'plugin_ready',
      label: 'Plugin ready',
      purpose: 'Prepare the workflow for Codex Plugins, Sites, and future selected-range edits without enabling integrations yet.',
      sections: ['Codex Plugin Ready', 'Runbook Presets', 'Generated Prompts'],
      panels: ['Codex Plugin Ready', 'HandoffPacket JSON', ...panelsFor('codex_plugin_ready').filter((panel) => panel !== 'Codex Plugin Ready' && panel !== 'HandoffPacket JSON')],
      safetyNote: copyOnly
    },
    {
      id: 'all_panels',
      label: 'All panels',
      purpose: 'Show every generated output with no prioritization.',
      sections: ['AI Workbench', 'Runbook Presets', 'Latest Useful Packet', 'Codex Plugin Ready', 'Generated Prompts'],
      panels: [],
      safetyNote: copyOnly,
      showAllPanels: true
    }
  ];
}
function reflectedPacketIds(contextPack: string | undefined) {
  const ids = new Set<string>();
  for (const match of (contextPack ?? '').matchAll(/^ID: (.+)$/gm)) {
    ids.add(match[1].trim());
  }
  return ids;
}

export function buildTodayWorklineSummary(
  project: Project,
  task: CockpitTask,
  packetHistory: PacketHistoryEntry[] = [],
  options: { focusLabel?: string; nowIso?: string } = {}
): TodayWorklineSummary {
  const latestPacket = buildLatestUsefulPacketRecall(project, task);
  const ids = reflectedPacketIds(task.contextPack);
  const reflectedPackets = buildMemoryVaultReuseIndex(
    packetHistory.filter((entry) => ids.has(entry.id)),
    options.nowIso
  ).items;
  const staleWarnings = reflectedPackets.filter((entry) => entry.state === 'stale');
  const reflectedLines = reflectedPackets.length
    ? reflectedPackets.flatMap((entry) => [
        `- ${entry.summary}`,
        `  - id: ${entry.id}`,
        `  - state: ${entry.state}`,
        `  - next: ${entry.next}`
      ])
    : ['- No reflected packets yet.'];
  const staleLines = staleWarnings.length
    ? staleWarnings.map((entry) => `- ${entry.id}: ${entry.summary}`)
    : ['- none'];

  const text = [
    'TODAY_WORKLINE_SUMMARY:',
    `Project: ${fallback(project.name, 'project name')}`,
    `Task: ${fallback(task.title, 'task title')}`,
    `Status: ${task.status}`,
    `Flow: ${options.focusLabel ?? 'not selected'}`,
    `Latest useful packet: ${latestPacket.packetSummary}`,
    '',
    'REFLECTED_PACKETS:',
    ...reflectedLines,
    '',
    'STALE WARNING:',
    ...staleLines,
    '',
    'TRACE:',
    latestTraceBlock(task.contextPack),
    '',
    `GOLDEN: ${fallback(task.golden, 'golden cases')}`,
    `NEXT: ${fallback(task.nextAction, 'next action')}`
  ].join('\n');

  return {
    label: 'Today Workline Summary',
    reflectedPackets,
    staleWarnings,
    text
  };
}

export function buildLatestUsefulPacketRecall(project: Project, task: CockpitTask): LatestUsefulPacketRecall {
  const packet = buildHandoffPacket(project, task);
  const latestTrace = latestTraceBlock(task.contextPack);
  const golden = fallback(task.golden, 'golden cases');
  const next = fallback(task.nextAction, 'next action');
  const packetSummary = `${packet.project} / ${packet.task} / ${packet.status} / ${packet.target}`;
  const copyText = [
    'LATEST_USEFUL_PACKET:',
    `- Project: ${packet.project}`,
    `- Task: ${packet.task}`,
    `- Status: ${packet.status}`,
    `- Mood: ${packet.mood}`,
    `- Target: ${packet.target}`,
    '',
    'WHY_THIS_PACKET:',
    '- Reuse this when the next action needs the current goal, latest TRACE, GOLDEN guardrail, and typed HandoffPacket together.',
    '',
    'LATEST_TRACE:',
    latestTrace,
    '',
    'GOLDEN:',
    golden,
    '',
    `NEXT: ${next}`,
    '',
    'HandoffPacket JSON:',
    buildHandoffPacketJson(project, task)
  ].join('\n');

  return {
    label: 'Latest useful packet',
    purpose: 'Recall the smallest reusable packet for the next handoff without searching through every panel.',
    sourcePanels: ['HandoffPacket JSON', 'Latest TRACE', 'GOLDEN', 'Next Action'],
    packetSummary,
    latestTrace,
    golden,
    next,
    copyText
  };
}

export function buildCodexPluginReadyPack(project: Project, task: CockpitTask): CodexPluginReadyPack {
  const packet = buildHandoffPacket(project, task, 'codex_plugin_blueprint');
  const trace = latestTraceBlock(task.contextPack);
  const golden = fallback(task.golden, 'golden cases');
  const next = fallback(task.nextAction, 'next action');
  const readiness = [
    {
      label: 'Plugin bundle',
      state: 'AI_CREOLE.md, HandoffPacket, runbooks, and Memory Vault export are already shaped as reusable instructions.',
      next: 'Extract one madowaku-cockpit skill before adding MCP, apps, hooks, or a marketplace.'
    },
    {
      label: 'Status site',
      state: 'Today Workline, Latest Useful Packet, Workbench lanes, and Packet History are site-shaped status data.',
      next: 'Prototype a local command-center view first; keep Sites deployment and access control as a later reviewed step.'
    },
    {
      label: 'Annotations',
      state: 'The cockpit already has small task fields, cards, generated panels, and copy targets.',
      next: 'Keep each editable idea in its own field or card so future selected-range edits can stay local.'
    },
    {
      label: 'Adoption gate',
      state: 'Scout / Adopt separates discovery from implementation and keeps direct integrations out of v0.1.',
      next: 'Only turn this pack into files after GOAL, GOLDEN, CHECK, and NEXT are current.'
    }
  ];
  const pluginSketch = [
    'madowaku-cockpit plugin',
    '+- skills/madowaku-cockpit/SKILL.md reads AI_CREOLE.md and repo handoff docs',
    '+- skills/madowaku-status-site/SKILL.md builds or updates a local status board',
    '+- skills/madowaku-handoff/SKILL.md emits HandoffPacket / GitHub / Obsidian / Local LLM outputs',
    '+- .codex-plugin/plugin.json declares bundled skills only at first',
    '+- marketplace entry stays repo-scoped until the workflow is stable'
  ].join('\n');
  const siteBrief = [
    'MADOWAKU_STATUS_SITE_BRIEF:',
    `- Project: ${packet.project}`,
    `- Task: ${packet.task}`,
    `- Status: ${packet.status}`,
    '- Show: current GOAL, active task, NEXT, RISK, CHECK, recent TRACE, AI-CREOLE diffs, handoff targets.',
    '- Source: local cockpit state and generated packets, not secrets or hidden services.',
    '- Persist: localStorage for prototype; no hosted storage until explicitly approved.',
    '- Share: local preview first; Sites deployment only after build review and audience confirmation.'
  ].join('\n');
  const annotationMap = [
    'ANNOTATION_FRIENDLY_MAP:',
    '- Task fields: edit GOAL / SPEC / PLAN / REVIEW / GOLDEN / LOGS / NEXT independently.',
    '- Workbench cards: each lane has STATE / CHECK / NEXT so a selected card can be repaired without rewriting the board.',
    '- Generated panels: each handoff has a stable label and copy boundary.',
    '- Packets: use schema strings and compact blocks so partial edits preserve machine-readable structure.'
  ].join('\n');
  const copyText = [
    '# Codex Plugin Ready Pack',
    '',
    'ROLE: Codex',
    'MODE: plugin_ready_scout',
    '',
    'GOAL:',
    fallback(task.roughGoal, 'rough goal'),
    '',
    'STATE:',
    buildHandoffPacketJson(project, task, 'codex_plugin_blueprint'),
    '',
    'READ:',
    '- AI_CREOLE.md',
    '- src/promptBuilders.ts',
    '- src/App.tsx',
    '- docs/goals/madowaku-codex-cockpit-v0-1/state.yaml if a historical state check is needed',
    '',
    'PLUGIN_SKETCH:',
    pluginSketch,
    '',
    siteBrief,
    '',
    annotationMap,
    '',
    'TRACE:',
    trace,
    '',
    'GOLDEN:',
    golden,
    '',
    'NO:',
    '- no auth, sync, marketplace install, hosting deploy, app connector, MCP server, or file generation unless explicitly approved',
    '- no secrets, tokens, direct vault writes, or hidden automation',
    '',
    'CHECK:',
    '- npm test',
    '- npm run build',
    '- plugin blueprint stays copy-only and reversible',
    '',
    `NEXT: ${next}`,
    '',
    'OUT:',
    '- Plugin Readiness Notes',
    '- Local status-site slice proposal',
    '- Annotation-friendly UI patch idea',
    '- one safe NEXT'
  ].join('\n');

  return {
    label: 'Codex Plugin Ready',
    readiness,
    pluginSketch,
    siteBrief,
    annotationMap,
    copyText
  };
}
export function buildHandoffRunbookPresets(project: Project, task: CockpitTask): HandoffRunbookPreset[] {
  const packet = buildHandoffPacket(project, task);
  const taskName = fallback(packet.task, 'task title');
  const copyOnly = 'copy-only; no external API calls, account handling, CLI execution, sync, or hidden automation.';

  return [
    {
      id: 'codex_implementation',
      label: 'Codex implementation handoff',
      purpose: `Prepare one small patch request for ${taskName} with the current HandoffPacket boundary.`,
      panels: ['HandoffPacket JSON', 'AI-CREOLE handoff', 'Codex OSS handoff', 'TRACE reflection'],
      order: ['Copy HandoffPacket JSON', 'Copy AI-CREOLE or Codex OSS handoff', 'Paste Codex result into Logs', 'Reflect TRACE into 文脈パック'],
      safetyNote: `Use as ${copyOnly}`
    },
    {
      id: 'scout_idea',
      label: 'Scout new tool / idea',
      purpose: 'Turn a new repo, article, model, or workflow idea into a madowaku-safe adoption proposal.',
      panels: ['Madowaku Scout/Adopt', 'HandoffPacket JSON', '圧縮プロンプト'],
      order: ['Paste the idea into 文脈パック or Logs', 'Copy Madowaku Scout/Adopt', 'Keep only Adopt Proposal and NEXT'],
      safetyNote: `Discovery stays ${copyOnly}`
    },
    {
      id: 'local_llm_review',
      label: 'Local LLM review',
      purpose: 'Compress noisy context and ask for risk or missing-context review before spending Codex attention.',
      panels: ['Local LLM prep', 'Ollama review', 'COMPRESS候補'],
      order: ['Copy Local LLM prep or Ollama review', 'Paste summary into Logs', 'Use COMPRESS候補 if TRACE is growing'],
      safetyNote: `Review is text-only and ${copyOnly}`
    },
    {
      id: 'memory_vault',
      label: 'Memory Vault save',
      purpose: 'Preserve a reusable work memory after useful TRACE, GOLDEN, logs, and NEXT are present.',
      panels: ['Memory Vault', 'Obsidian Markdown', 'HandoffPacket JSON'],
      order: ['Confirm GOLDEN and NEXT are current', 'Copy or export Memory Vault', 'Store the note manually where madowaku wants it'],
      safetyNote: `Export is user-triggered and ${copyOnly}`
    },
    {
      id: 'github_handoff',
      label: 'GitHub issue / PR handoff',
      purpose: 'Create a reviewable issue or PR body without giving the cockpit tokens or repo write access.',
      panels: ['HandoffPacket JSON', 'GitHub handoff', 'Codex OSS handoff'],
      order: ['Copy HandoffPacket JSON for state', 'Copy GitHub handoff into issue or PR body', 'Keep verification evidence in Logs'],
      safetyNote: `GitHub remains manual and ${copyOnly}`
    },
    {
      id: 'codex_plugin_ready',
      label: 'Codex plugin-ready scout',
      purpose: 'Translate the current cockpit workflow into a plugin, Sites, and annotation-friendly blueprint.',
      panels: ['Codex Plugin Ready', 'HandoffPacket JSON', 'AI-CREOLE handoff', 'Memory Vault'],
      order: ['Confirm GOAL / GOLDEN / CHECK / NEXT are current', 'Copy Codex Plugin Ready', 'Review the blueprint before creating plugin files', 'Keep Sites deploy and connector auth deferred'],
      safetyNote: `Plugin readiness stays ${copyOnly}`
    },
    {
      id: 'obsidian_capture',
      label: 'Obsidian note capture',
      purpose: 'Capture the human-readable project memory while leaving direct vault writes out of v0.1.',
      panels: ['Obsidian Markdown', 'Memory Vault', 'TRACE reflection'],
      order: ['Copy or download Obsidian Markdown', 'Save it manually in the vault', 'Reflect latest TRACE before the next task'],
      safetyNote: `Vault capture stays manual and ${copyOnly}`
    }
  ];
}
export function buildMadowakuScoutAdoptPrompt(project: Project, task: CockpitTask) {
  return [
    'ROLE: Madowaku Scout Agent',
    'MODE: discover_scout_adopt',
    '',
    'GOAL:',
    'Turn new tools, models, articles, repos, or ideas into madowaku-safe adoption proposals.',
    '',
    'DISCOVER:',
    '- Capture the tool, URL, claim, pattern, or design idea.',
    '- Extract why it matters for madowaku cockpit.',
    '',
    'SCOUT:',
    '- Score FIT / RISK / COST / LOCAL_FIRST / CODEX_FIT / CREOLE_FIT.',
    '- Separate useful design ideas from risky direct integration.',
    '',
    'MAP:',
    '- Map the idea to AI_CREOLE terms, cockpit fields, prompt builders, skills, or docs.',
    '',
    'PROPOSE:',
    '- Suggest the smallest reversible adoption step.',
    '- Name what should be deferred.',
    '',
    'ADOPT:',
    '- Convert the proposal into a small Codex task only after review.',
    '',
    'NO: no secrets, no auth, no sync, no automatic tool execution',
    '',
    'HandoffPacket JSON:',
    buildHandoffPacketJson(project, task, 'madowaku_scout'),
    '',
    'OUT:',
    '- Scout Report',
    '- Adopt Proposal',
    '- AI_CREOLE patch idea',
    '- Codex task idea',
    '- NEXT'
  ].join('\n');
}
export function buildHermesHandoffMarkdown(project: Project, task: CockpitTask) {
  return [
    '# Hermes Agent Handoff',
    '',
    'ROLE: Hermes Agent',
    'MODE: orchestrator_review',
    '',
    'GOAL:',
    'Route this madowaku task to the safest next agent path without executing tools automatically.',
    '',
    'HandoffPacket:',
    buildHandoffPacketJson(project, task, 'madowaku_scout'),
    '',
    'ROUTES:',
    '- Codex: patch verified repo work.',
    '- Ollama / Local LLM: summarize logs, risks, missing context.',
    '- GitHub: preserve reviewable issue or PR context.',
    '- Obsidian: preserve human-readable memory.',
    '',
    'NO: do not execute tools automatically',
    'NO: do not use secrets, auth, sync, git push, deploy, or hidden services.',
    '',
    'CHECK:',
    '- Human reviews the route before any runtime is invoked.',
    '- Handoff stays within one small task.',
    '',
    'OUT: route recommendation, delegated prompts, risks, NEXT'
  ].join('\n');
}

export function buildOllamaReviewHandoffMarkdown(project: Project, task: CockpitTask) {
  return [
    '# Ollama Review Handoff',
    '',
    'ROLE: Local LLM',
    'MODE: local_review',
    '',
    'GOAL:',
    'Review the current madowaku cockpit task for summary, risks, and missing context.',
    '',
    'INPUT:',
    buildLocalLlmPrepPrompt(project, task),
    '',
    'NO: do not modify files',
    'NO: do not call tools, run commands, invent verification, or expand scope.',
    '',
    'CHECK:',
    '- Preserve GOLDEN cases.',
    '- Keep output small enough to paste back into Logs or Context Pack.',
    '',
    'OUT: summary, risks, missing context, NEXT'
  ].join('\n');
}

export function buildCodexOssHandoffMarkdown(project: Project, task: CockpitTask) {
  return [
    '# Codex OSS Handoff',
    '',
    'ROLE: Codex',
    'MODE: codex_patch',
    '',
    'GOAL:',
    fallback(task.roughGoal, 'rough goal'),
    '',
    'STATE:',
    buildHandoffPacketJson(project, task, 'codex_task'),
    '',
    'DO:',
    fallback(task.plan, 'plan'),
    '',
    'KEEP:',
    fallback(task.review, 'review notes'),
    '',
    'NO: no git push, no deploy, no hidden external services',
    'NO: no auth, sync, model calls, or direct vault writes unless explicitly approved.',
    '',
    'CHECK: npm test; npm run build',
    '',
    `NEXT: ${fallback(task.nextAction, 'next action')}`,
    '',
    'OUT: changed files, verification, risks, TRACE, NEXT'
  ].join('\n');
}

export function buildFreebuffMarkdownHandoff(project: Project, task: CockpitTask) {
  const fileMentions = extractFileMentions(task.contextPack);
  const mentionBlock = fileMentions.length
    ? fileMentions.join('\n')
    : '- Add @file mentions from the READ section before pasting if needed.';

  return [
    '# Freebuff Handoff',
    '',
    '> Copy this into Freebuff manually. The cockpit does not install, launch, or configure the CLI.',
    '',
    'ROLE: Freebuff',
    'MODE: terminal_coding_agent_handoff',
    '',
    'FILE MENTIONS:',
    mentionBlock,
    '',
    'KNOWLEDGE:',
    '- If the project has knowledge.md, read it as the stable project memory before patching.',
    '- Treat this cockpit handoff as the current task memory.',
    '',
    'GOAL:',
    fallback(task.roughGoal, 'rough goal'),
    '',
    'STATE:',
    buildHandoffPacketJson(project, task, 'freebuff_markdown'),
    '',
    'DO:',
    fallback(task.plan, 'plan'),
    '',
    'KEEP:',
    fallback(task.golden || task.review, 'golden cases or review notes'),
    '',
    'NO: do not run /bash or !commands automatically',
    'NO: do not sign in, sync, deploy, push, install packages, or send secrets unless madowaku explicitly approves.',
    '',
    'CHECK:',
    '- Propose verification commands first; do not claim they passed unless they were actually run.',
    '- Keep the patch small enough to paste results back into cockpit Logs.',
    '',
    `NEXT: ${fallback(task.nextAction, 'next action')}`,
    '',
    'OUT: changed files proposal, risks, verification plan, NEXT'
  ].join('\n');
}
export function buildGithubHandoffMarkdown(project: Project, task: CockpitTask) {
  return [
    `# GitHub Handoff: ${fallback(task.title, 'task title')}`,
    '',
    '> Copy this into a GitHub Issue or PR body. No GitHub API call is required by the cockpit.',
    '',
    '## Status',
    '',
    `- Project: ${fallback(project.name, 'project name')}`,
    `- Task: ${fallback(task.title, 'task title')}`,
    `- Status: ${task.status}`,
    `- Mood: ${task.mood ?? '未設定'}`,
    '',
    markdownSection('Goal', task.roughGoal, 'rough goal'),
    '',
    markdownSection('Spec', task.spec),
    '',
    markdownSection('Plan', task.plan),
    '',
    markdownSection('Review Notes', task.review, 'review notes'),
    '',
    markdownSection('GOLDEN', task.golden, 'golden cases'),
    '',
    markdownSection('Latest TRACE', latestTraceBlock(task.contextPack), 'latest trace'),
    '',
    markdownSection('Logs', task.logs),
    '',
    markdownSection('Next Action', task.nextAction, 'next action'),
    '',
    '## Guardrails',
    '',
    '- Keep the patch small and reviewable.',
    '- Preserve GOLDEN cases.',
    '- Do not add secrets, auth, sync, app shell execution, model calls, or hidden filesystem writes unless explicitly approved.',
    '',
    '## Done When',
    '',
    '- The next action is implemented or clearly blocked.',
    '- Verification evidence is pasted back into cockpit Logs.',
    '- TRACE / CHECK / NEXT can be reflected into the context pack.'
  ].join('\n');
}

export function buildMemoryVaultMarkdownExport(project: Project, task: CockpitTask, packetHistory: PacketHistoryEntry[] = [], nowIso = new Date().toISOString()) {
  const traceCount = countTraceBlocks(task.contextPack);
  const reuseIndex = buildMemoryVaultReuseIndex(packetHistory, nowIso).markdown;

  return [
    '---',
    'schema: "madowaku.memory_vault.v1"',
    'memory_type: "workbench_handoff"',
    `project: ${yamlValue(project.name, 'project name')}`,
    `task: ${yamlValue(task.title, 'task title')}`,
    `status: ${yamlValue(task.status, 'status')}`,
    `trace_count: ${traceCount}`,
    'tags:',
    '  - madowaku-memory-vault',
    '  - madowaku-cockpit',
    '  - handoff-packet',
    '  - ai-creole',
    '---',
    '',
    `# Memory Vault: ${fallback(task.title, 'task title')}`,
    '',
    '## Reuse Index',
    '',
    '- Codex: use AI-CREOLE handoff or Codex OSS handoff for patch work.',
    '- Local LLM: use Ollama Review or Local LLM prep for compression and risk scan.',
    '- GitHub: use GitHub handoff for issue or PR history.',
    '- Obsidian: keep this note as the human-readable memory layer.',
    '- Scout: use Madowaku Scout/Adopt before adopting new tools or ideas.',
    '- Latest Useful Packet: use the recall surface when you need the current TRACE / GOLDEN / NEXT / HandoffPacket together.',
    '',
    reuseIndex,
    '',
    '## Compression Notes',
    '',
    '- Preserve decisions, verification evidence, GOLDEN cases, and NEXT.',
    '- Remove stale alternatives after they are no longer actionable.',
    '- Prefer one current HandoffPacket over scattered prompt fragments.',
    '',
    markdownSection('Project Notes', project.description, 'project notes'),
    '',
    markdownSection('Goal', task.roughGoal, 'rough goal'),
    '',
    markdownSection('Context Pack', task.contextPack, 'context pack'),
    '',
    markdownSection('GOLDEN', task.golden, 'golden cases'),
    '',
    markdownSection('Latest TRACE', latestTraceBlock(task.contextPack), 'latest trace'),
    '',
    markdownSection('Logs', task.logs),
    '',
    markdownSection('Next Action', task.nextAction, 'next action'),
    '',
    '## HandoffPacket',
    '',
    '```json',
    buildHandoffPacketJson(project, task),
    '```'
  ].join('\n');
}
export function buildObsidianMarkdownExport(project: Project, task: CockpitTask) {
  return [
    '---',
    `project: ${yamlValue(project.name, 'project name')}`,
    `task: ${yamlValue(task.title, 'task title')}`,
    `status: ${yamlValue(task.status, 'status')}`,
    `mood: ${yamlValue(task.mood, 'mood')}`,
    'tags:',
    '  - madowaku-cockpit',
    '  - codex-handoff',
    '  - ai-creole',
    '---',
    '',
    `# ${fallback(task.title, 'task title')}`,
    '',
    `Project: ${fallback(project.name, 'project name')}`,
    '',
    markdownSection('Project Notes', project.description, 'project notes'),
    '',
    markdownSection('Rough Goal', task.roughGoal, 'rough goal'),
    '',
    markdownSection('Context Pack', task.contextPack, 'context pack'),
    '',
    markdownSection('Spec', task.spec),
    '',
    markdownSection('Plan', task.plan),
    '',
    markdownSection('Review', task.review),
    '',
    markdownSection('GOLDEN', task.golden, 'golden cases'),
    '',
    markdownSection('Logs', task.logs),
    '',
    markdownSection('Latest TRACE', latestTraceBlock(task.contextPack), 'latest trace'),
    '',
    markdownSection('Next Action', task.nextAction, 'next action')
  ].join('\n');
}

export function buildLocalLlmPrepPrompt(project: Project, task: CockpitTask) {
  return [
    'ROLE: Local LLM',
    'MODE: summarization_prep',
    '',
    'GOAL:',
    'Prepare the smallest useful context for the next madowaku Codex action.',
    '',
    `PROJECT: ${fallback(project.name, 'project name')}`,
    `TASK: ${fallback(task.title, 'task title')}`,
    `STATUS: ${task.status}`,
    `MOOD: ${task.mood ?? '未設定'}`,
    '',
    'INPUT:',
    section('Rough Goal', task.roughGoal, 'rough goal'),
    '',
    section('Context Pack', task.contextPack, 'context pack'),
    '',
    section('Spec', task.spec),
    '',
    section('Plan', task.plan),
    '',
    section('Review', task.review),
    '',
    section('GOLDEN', task.golden, 'golden cases'),
    '',
    section('Logs', task.logs),
    '',
    section('Latest TRACE', latestTraceBlock(task.contextPack), 'latest trace'),
    '',
    'DO:',
    '- Summarize noisy logs into durable decisions and evidence.',
    '- Extract risks, missing checks, and unclear assumptions.',
    '- Keep only context needed for one next Codex action.',
    '',
    'NO:',
    '- Do not call tools or modify files.',
    '- Do not invent verification results.',
    '- Do not expand scope beyond the current task.',
    '',
    'OUT: STATE, RISKS, QUESTIONS, NEXT',
    '',
    `NEXT_HINT: ${fallback(task.nextAction, 'next action')}`
  ].join('\n');
}
export function buildCompressionPrompt(project: Project, task: CockpitTask) {
  return [
    'Compress this working context into one next action for madowaku.',
    '',
    `Project: ${fallback(project.name, 'project name')}`,
    `Task: ${fallback(task.title, 'task title')}`,
    `Status: ${task.status}`,
    `Mood: ${task.mood ?? '未設定'}`,
    '',
    section('Context Pack', task.contextPack, 'context pack'),
    '',
    section('Rough Goal', task.roughGoal, 'rough goal'),
    '',
    section('Review Notes', task.review, 'review notes'),
    '',
    section('GOLDEN', task.golden, 'golden cases'),
    '',
    section('Logs', task.logs),
    '',
    section('Current Next Action', task.nextAction, 'next action'),
    '',
    'Return only:',
    '- One concrete next action.',
    '- One verification command or check if relevant.',
    '- One risk or boundary to keep in mind.'
  ].join('\n');
}

export function applyTemplate(task: CockpitTask, templateId: WorkflowTemplateId): CockpitTask {
  if (templateId === 'goal') {
    return {
      ...task,
      spec: appendTemplate(task.spec, 'Goal shape: product intent, non-negotiable constraints, enough-for-this-tranche.'),
      plan: appendTemplate(task.plan, 'Board shape: Scout evidence, Judge decision, one bounded Worker, final audit.'),
      review: appendTemplate(task.review, 'Check: small tranche, local-first boundary, clear verification, no hidden integrations.')
    };
  }

  if (templateId === 'plan') {
    return {
      ...task,
      spec: appendTemplate(task.spec, 'Inputs: goal, current files, constraints, expected behavior.'),
      plan: appendTemplate(task.plan, 'Steps: inspect, test first, implement smallest slice, verify, write receipt.'),
      review: appendTemplate(task.review, 'Watch: unclear scope, missing verification, accidental broad refactor.')
    };
  }

  if (templateId === 'creole') {
    return {
      ...task,
      contextPack: appendTemplate(
        task.contextPack,
        'AI-CREOLE: ROLE / MODE / GOAL / STATE / DO / CHECK / NEXT. Read this context pack first; expand only when needed.'
      ),
      plan: appendTemplate(task.plan, 'Loop Protocol: Prelude -> STATE/CHECK/NEXT -> Coda.'),
      review: appendTemplate(task.review, 'Heuristic Learning: record TRACE / REPLAY / GOLDEN / COMPRESS before widening scope.')
    };
  }

  return {
    ...task,
    spec: appendTemplate(task.spec, 'Acceptance: what must be true for this to count as done.'),
    plan: appendTemplate(task.plan, 'Review the smallest reviewed slice before expanding scope.'),
    review: appendTemplate(task.review, 'Scope boundary: no model calls, no app filesystem access, no shell execution, no sync.')
  };
}





















