import { useEffect, useMemo, useRef, useState } from 'react';
import { createBackupText, restoreBackupText } from './backup';
import {
  buildGoalMakerPrompt,
  buildPlanPrompt,
  buildCreoleHandoffPrompt,
  applyPacketToContextPack,
  applyTraceToContextPack,
  buildTodayWorklineSummary,
  buildTraceReflection,
  applyTemplate,
  buildCompressionPrompt,
  buildFocusModes,
  buildContextPackCompressCandidate,
  buildCodexOssHandoffMarkdown,
  buildFreebuffMarkdownHandoff,
  buildGithubHandoffMarkdown,
  buildHermesHandoffMarkdown,
  buildObsidianMarkdownExport,
  buildOllamaReviewHandoffMarkdown,
  buildLocalLlmPrepPrompt,
  buildHandoffPacketJson,
  buildHandoffRunbookPresets,
  buildLatestUsefulPacketRecall,
  createPacketHistoryEntry,
  isPacketHistoryEntryStale,
  trimPacketHistory,
  buildMadowakuScoutAdoptPrompt,
  buildMemoryVaultMarkdownExport,
  buildCodexPluginReadyPack,
  buildWorkbenchDashboard,
  workflowTemplates,
  type CockpitTask,
  type Project,
  type TaskMood,
  type WorkbenchLane,
  type HandoffRunbookPreset,
  type FocusModeId,
  type LatestUsefulPacketRecall,
  type PacketHistoryEntry,
  type CodexPluginReadyPack,
  type TodayWorklineSummary,
  type TaskStatus
} from './promptBuilders';

type CockpitProject = Project & {
  id: string;
  task: CockpitTask;
  packetHistory?: PacketHistoryEntry[];
};

const storageKey = 'madowaku-codex-cockpit-v0-1';

const emptyTask: CockpitTask = {
  title: 'First tiny tranche',
  roughGoal: '',
  status: 'idea',
  spec: '',
  plan: '',
  review: '',
  logs: '',
  nextAction: ''
};

const starterProjects: CockpitProject[] = [
  {
    id: 'madowaku-local',
    name: 'Madowaku Local Lab',
    description: 'Creative coding projects, Codex planning, and verification prep.',
    task: emptyTask
  }
];

const statuses: TaskStatus[] = ['idea', 'planned', 'in-progress', 'reviewed', 'done'];
const moods: TaskMood[] = ['今日やる', '詰まり中', '寝かせる', 'Codex待ち'];

function safeFilePart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'madowaku'
  );
}

function loadProjects() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return starterProjects;
    const parsed = JSON.parse(saved) as CockpitProject[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : starterProjects;
  } catch {
    return starterProjects;
  }
}

export default function App() {
  const [projects, setProjects] = useState<CockpitProject[]>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id ?? starterProjects[0].id);
  const [copied, setCopied] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState('手動バックアップでlocalStorageを守れます。');
  const [focusModeId, setFocusModeId] = useState<FocusModeId>('overview');
  const importInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(projects));
  }, [projects]);

  const prompts = useMemo(
    () => ({
      goalMaker: buildGoalMakerPrompt(activeProject, activeProject.task),
      plan: buildPlanPrompt(activeProject, activeProject.task),
      creole: buildCreoleHandoffPrompt(activeProject, activeProject.task),
      trace: buildTraceReflection(activeProject, activeProject.task),
      compression: buildCompressionPrompt(activeProject, activeProject.task),
      compressCandidate: buildContextPackCompressCandidate(activeProject.task),
      githubHandoff: buildGithubHandoffMarkdown(activeProject, activeProject.task),
      obsidianMarkdown: buildObsidianMarkdownExport(activeProject, activeProject.task),
      localLlmPrep: buildLocalLlmPrepPrompt(activeProject, activeProject.task),
      handoffPacket: buildHandoffPacketJson(activeProject, activeProject.task),
      scoutAdopt: buildMadowakuScoutAdoptPrompt(activeProject, activeProject.task),
      workbench: buildWorkbenchDashboard(activeProject, activeProject.task),
      runbooks: buildHandoffRunbookPresets(activeProject, activeProject.task),
      focusModes: buildFocusModes(buildHandoffRunbookPresets(activeProject, activeProject.task)),
      latestUsefulPacket: buildLatestUsefulPacketRecall(activeProject, activeProject.task),
      hermesHandoff: buildHermesHandoffMarkdown(activeProject, activeProject.task),
      ollamaHandoff: buildOllamaReviewHandoffMarkdown(activeProject, activeProject.task),
      codexOssHandoff: buildCodexOssHandoffMarkdown(activeProject, activeProject.task),
      memoryVault: buildMemoryVaultMarkdownExport(activeProject, activeProject.task, activeProject.packetHistory ?? []),
      freebuffHandoff: buildFreebuffMarkdownHandoff(activeProject, activeProject.task),
      pluginReady: buildCodexPluginReadyPack(activeProject, activeProject.task)
    }),
    [activeProject]
  );


  const activeFocus = prompts.focusModes.find((mode) => mode.id === focusModeId) ?? prompts.focusModes[0];
  const activePacketHistory = activeProject.packetHistory ?? [];
  const todayWorkline = buildTodayWorklineSummary(activeProject, activeProject.task, activePacketHistory, {
    focusLabel: activeFocus.label
  });
  const generatedPanels = [
    { label: '/goal-maker prompt', value: prompts.goalMaker },
    { label: '/plan prompt', value: prompts.plan },
    { label: 'AI-CREOLE handoff', value: prompts.creole },
    { label: 'GitHub handoff', value: prompts.githubHandoff },
    { label: 'Obsidian Markdown', value: prompts.obsidianMarkdown },
    { label: 'Local LLM prep', value: prompts.localLlmPrep },
    { label: 'HandoffPacket JSON', value: prompts.handoffPacket },
    { label: 'Madowaku Scout/Adopt', value: prompts.scoutAdopt },
    { label: 'Hermes handoff', value: prompts.hermesHandoff },
    { label: 'Ollama review', value: prompts.ollamaHandoff },
    { label: 'Codex OSS handoff', value: prompts.codexOssHandoff },
    { label: 'Freebuff handoff', value: prompts.freebuffHandoff },
    { label: 'Codex Plugin Ready', value: prompts.pluginReady.copyText },
    { label: 'Memory Vault', value: prompts.memoryVault },
    { label: 'TRACE reflection', value: prompts.trace },
    { label: '圧縮プロンプト', value: prompts.compression },
    { label: 'COMPRESS候補', value: prompts.compressCandidate }
  ];

  function focusClass(label: string, baseClass: string) {
    if (activeFocus.showAllPanels) return baseClass;
    const isSectionPriority = activeFocus.sections.includes(label);
    const isPanelPriority = activeFocus.panels.includes(label);
    if (isSectionPriority || isPanelPriority) return `${baseClass} focus-priority`;
    return `${baseClass} focus-muted`;
  }
  function updateProject(patch: Partial<Project>) {
    setProjects((current) =>
      current.map((project) => (project.id === activeProject.id ? { ...project, ...patch } : project))
    );
  }

  function updateTask(patch: Partial<CockpitTask>) {
    setProjects((current) =>
      current.map((project) =>
        project.id === activeProject.id ? { ...project, task: { ...project.task, ...patch } } : project
      )
    );
  }

  function addProject() {
    const nextProject: CockpitProject = {
      id: crypto.randomUUID(),
      name: `Project ${projects.length + 1}`,
      description: '',
      task: { ...emptyTask, title: 'New working thread' }
    };
    setProjects((current) => [...current, nextProject]);
    setActiveProjectId(nextProject.id);
  }

  function applyWorkflowTemplate(templateId: (typeof workflowTemplates)[number]['id']) {
    updateTask(applyTemplate(activeProject.task, templateId));
  }

  function reflectTraceToContextPack() {
    updateTask(applyTraceToContextPack(activeProject, activeProject.task));
    setCopied('TRACE reflected');
    window.setTimeout(() => setCopied(null), 1400);
  }


  function saveCurrentPacket() {
    const entry = createPacketHistoryEntry(activeProject, activeProject.task);
    setProjects((current) =>
      current.map((project) =>
        project.id === activeProject.id
          ? { ...project, packetHistory: trimPacketHistory([entry, ...(project.packetHistory ?? [])]) }
          : project
      )
    );
    setCopied('Latest useful packet saved');
    window.setTimeout(() => setCopied(null), 1400);
  }

  function reflectPacketToContextPack(entry: PacketHistoryEntry) {
    updateTask(applyPacketToContextPack(activeProject.task, entry));
    setCopied('Packet reflected');
    window.setTimeout(() => setCopied(null), 1400);
  }
  function clearPacketHistory() {
    setProjects((current) =>
      current.map((project) => (project.id === activeProject.id ? { ...project, packetHistory: [] } : project))
    );
    setCopied('Packet history cleared');
    window.setTimeout(() => setCopied(null), 1400);
  }
  async function copyPrompt(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function exportBackup() {
    const backupText = createBackupText(projects);
    const backupUrl = URL.createObjectURL(new Blob([backupText], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = backupUrl;
    link.download = `madowaku-cockpit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(backupUrl);
    setBackupStatus('バックアップJSONを書き出しました。');
  }
  function exportMarkdownNote() {
    const markdownUrl = URL.createObjectURL(new Blob([prompts.obsidianMarkdown], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = markdownUrl;
    link.download = `${safeFilePart(activeProject.name)}-${safeFilePart(activeProject.task.title)}.md`;
    link.click();
    URL.revokeObjectURL(markdownUrl);
    setBackupStatus('Obsidian向けMarkdownを書き出しました。');
  }
  function exportMemoryVaultNote() {
    const markdownUrl = URL.createObjectURL(new Blob([prompts.memoryVault], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = markdownUrl;
    link.download = `${safeFilePart(activeProject.name)}-${safeFilePart(activeProject.task.title)}-memory.md`;
    link.click();
    URL.revokeObjectURL(markdownUrl);
    setBackupStatus('Memory Vault Markdownを書き出しました。');
  }

  async function importBackup(file: File | undefined) {
    if (!file) return;

    try {
      const restoredProjects = restoreBackupText(await file.text());
      setProjects(restoredProjects);
      setActiveProjectId(restoredProjects[0]?.id ?? starterProjects[0].id);
      setBackupStatus('バックアップから復元しました。');
    } catch {
      setBackupStatus('復元できませんでした。cockpit backup JSONを選んでください。');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  }

  return (
    <main className="cockpit-shell">
      <aside className="project-rail" aria-label="Projects">
        <div>
          <p className="eyebrow">Madowaku</p>
          <h1>Codex Cockpit</h1>
          <p className="rail-copy">Local notes, prompts, and next actions for small creative coding tranches.</p>
        </div>

        <div className="project-list">
          {projects.map((project) => (
            <button
              className={project.id === activeProject.id ? 'project-chip active' : 'project-chip'}
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              type="button"
            >
              <span>{project.name}</span>
              <small>{project.task.status}</small>
            </button>
          ))}
        </div>

        <button className="add-project" onClick={addProject} type="button">
          + Project
        </button>
      </aside>

      <section className="workspace" aria-label="Cockpit workspace">
        <header className="top-strip">
          <label>
            <span>Project</span>
            <input
              value={activeProject.name}
              onChange={(event) => updateProject({ name: event.target.value })}
              placeholder="Project name"
            />
          </label>
          <label>
            <span>今の作業</span>
            <input
              value={activeProject.task.title}
              onChange={(event) => updateTask({ title: event.target.value })}
              placeholder="いま進めたい作業"
            />
          </label>
          <div className="saved-pill">Saved locally</div>
        </header>

        <section className="goal-band">
          <label className="project-notes">
            <span>Project Notes</span>
            <textarea
              value={activeProject.description}
              onChange={(event) => updateProject({ description: event.target.value })}
              placeholder="What kind of project is this?"
            />
          </label>

          <label className="goal-box">
            <span>ざっくりゴール</span>
            <textarea
              value={activeProject.task.roughGoal}
              onChange={(event) => updateTask({ roughGoal: event.target.value })}
              placeholder="Write the messy intent here. The cockpit keeps it warm until Codex gets it."
            />
          </label>

          <fieldset className="status-set">
            <legend>Status</legend>
            {statuses.map((status) => (
              <label key={status}>
                <input
                  checked={activeProject.task.status === status}
                  name="status"
                  onChange={() => updateTask({ status })}
                  type="radio"
                />
                <span>{status}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="status-set mood-set">
            <legend>温度感</legend>
            {moods.map((mood) => (
              <label key={mood}>
                <input
                  checked={activeProject.task.mood === mood}
                  name="mood"
                  onChange={() => updateTask({ mood })}
                  type="radio"
                />
                <span>{mood}</span>
              </label>
            ))}
          </fieldset>
        </section>

        <section className="focus-mode" aria-label="Focus Mode">
          <div>
            <span>Focus Mode</span>
            <p>{activeFocus.purpose}</p>
          </div>
          <div className="focus-tabs" role="tablist" aria-label="Today view modes">
            {prompts.focusModes.map((mode) => (
              <button
                aria-selected={mode.id === activeFocus.id}
                className={mode.id === activeFocus.id ? 'active' : ''}
                key={mode.id}
                onClick={() => setFocusModeId(mode.id)}
                role="tab"
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>
          <small>{activeFocus.safetyNote}</small>
        </section>
        <section className={focusClass('AI Workbench', 'workbench')} aria-label="AI Workbench Dashboard">
          <div className="workbench-heading">
            <div>
              <span>AI Workbench</span>
              <p>HandoffPacket / Scout / Codex / Local LLM / GitHub / Obsidian / Freebuff の現在地。</p>
            </div>
            <small>connectionless</small>
          </div>
          <div className="workbench-grid">
            {prompts.workbench.map((lane) => (
              <WorkbenchCard key={lane.id} lane={lane} />
            ))}
          </div>
        </section>
        <section className={focusClass('Runbook Presets', 'runbook')} aria-label="Handoff Runbook Presets">
          <div className="runbook-heading">
            <div>
              <span>Runbook Presets</span>
              <p>やりたい作業から、使う handoff と順番を選ぶ小さな流れ。</p>
            </div>
            <small>copy-only</small>
          </div>
          <div className="runbook-grid">
            {prompts.runbooks.map((preset) => (
              <RunbookCard key={preset.id} preset={preset} />
            ))}
          </div>
        </section>
        <section className={focusClass('Latest Useful Packet', 'packet-recall')} aria-label="Latest Useful Packet Recall">
          <div className="packet-recall-heading">
            <div>
              <span>Latest Useful Packet</span>
              <p>次の handoff に使う最小パケットだけを、今の文脈から呼び出します。</p>
            </div>
            <button onClick={() => copyPrompt('Latest useful packet', prompts.latestUsefulPacket.copyText)} type="button">
              コピー
            </button>
          </div>
          <LatestPacketCard packet={prompts.latestUsefulPacket} />
        </section>
        <section className={focusClass('Latest Useful Packet', 'packet-history')} aria-label="Packet history">
          <div className="packet-history-heading">
            <div>
              <span>Packet History / Memory Reuse Index</span>
              <p>今日の作業ラインから持ち出したい packet を最大5件だけ残し、Memory Vault と文脈パックへ再利用します。</p>
            </div>
            <div className="packet-history-actions">
              <button onClick={saveCurrentPacket} type="button">
                今のpacketを保存
              </button>
              <button disabled={activePacketHistory.length === 0} onClick={clearPacketHistory} type="button">
                履歴をクリア
              </button>
            </div>
          </div>
          <PacketHistoryList
            entries={activePacketHistory}
            onCopy={(entry) => void copyPrompt('Packet history', entry.copyText)}
            onReflect={reflectPacketToContextPack}
          />
        </section>
        <section className={focusClass('Latest Useful Packet', 'today-workline')} aria-label="Today Workline Summary">
          <div className="today-workline-heading">
            <div>
              <span>Today Workline Summary</span>
              <p>今日の作業ラインを、次の相談や handoff に持ち出せる短い形へ畳みます。</p>
            </div>
            <button onClick={() => copyPrompt(todayWorkline.label, todayWorkline.text)} type="button">
              コピー
            </button>
          </div>
          <TodayWorklineCard summary={todayWorkline} />
        </section>
        <section className={focusClass('Codex Plugin Ready', 'plugin-ready')} aria-label="Codex Plugin Ready">
          <div className="plugin-ready-heading">
            <div>
              <span>Codex Plugin Ready</span>
              <p>Plugins / Sites / annotation-friendly UI に持ち上げる前の、copy-only 作戦パック。</p>
            </div>
            <button onClick={() => copyPrompt(prompts.pluginReady.label, prompts.pluginReady.copyText)} type="button">
              コピー
            </button>
          </div>
          <CodexPluginReadyCard pack={prompts.pluginReady} />
        </section>
        <section className="backup-strip" aria-label="Manual backup">
          <div>
            <span>手動バックアップ</span>
            <p>{backupStatus}</p>
          </div>
          <div className="backup-actions">
            <button onClick={exportBackup} type="button">
              書き出す
            </button>
            <button onClick={() => importInputRef.current?.click()} type="button">
              復元する
            </button>
            <button onClick={exportMarkdownNote} type="button">
              Markdown書き出し
            </button>
            <button onClick={exportMemoryVaultNote} type="button">
              Memory書き出し
            </button>
            <input
              accept="application/json"
              ref={importInputRef}
              onChange={(event) => void importBackup(event.target.files?.[0])}
              type="file"
            />
          </div>
        </section>

        <section className="notes-grid">
          <section className="template-shelf" aria-label="Workflow templates">
            <div>
              <span>テンプレ棚</span>
              <p>よく使う型を、今の作業メモに足します。</p>
            </div>
            <div className="template-actions">
              {workflowTemplates.map((template) => (
                <button key={template.id} onClick={() => applyWorkflowTemplate(template.id)} type="button">
                  <strong>{template.label}</strong>
                  <small>{template.description}</small>
                </button>
              ))}
            </div>
          </section>
          <NoteField
            label="文脈パック"
            value={activeProject.task.contextPack ?? ''}
            onChange={(contextPack) => updateTask({ contextPack })}
            tall
          />
          <NoteField label="Spec" value={activeProject.task.spec} onChange={(spec) => updateTask({ spec })} />
          <NoteField label="Plan" value={activeProject.task.plan} onChange={(plan) => updateTask({ plan })} />
          <NoteField label="Review" value={activeProject.task.review} onChange={(review) => updateTask({ review })} />
          <NoteField
            label="GOLDEN"
            value={activeProject.task.golden ?? ''}
            onChange={(golden) => updateTask({ golden })}
          />
          <NoteField label="Logs" value={activeProject.task.logs} onChange={(logs) => updateTask({ logs })} tall />
          <section className="trace-actions" aria-label="TRACE reflection">
            <div>
              <span>TRACE化</span>
              <p>Logs / Review / 次の一手を、次回用の文脈パックへ畳みます。</p>
            </div>
            <button onClick={reflectTraceToContextPack} type="button">
              TRACEを反映
            </button>
          </section>
          <NoteField
            label="次の一手"
            value={activeProject.task.nextAction}
            onChange={(nextAction) => updateTask({ nextAction })}
            tall
          />
        </section>

        <section className="prompt-dock" aria-label="Generated prompts">
          {generatedPanels.map((panel) => (
            <PromptPanel
              focusClassName={focusClass(panel.label, 'prompt-panel')}
              key={panel.label}
              label={panel.label}
              value={panel.value}
              onCopy={() => copyPrompt(panel.label, panel.value)}
            />
          ))}
        </section>
        <p className="copy-status" aria-live="polite">
          {copied ? `${copied} copied` : 'Prompts are generated locally from the fields above.'}
        </p>
      </section>
    </main>
  );
}

function NoteField({
  label,
  onChange,
  tall,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  tall?: boolean;
  value: string;
}) {
  return (
    <label className={tall ? 'note-field tall' : 'note-field'}>
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={`${label} notes`} />
    </label>
  );
}

function TodayWorklineCard({ summary }: { summary: TodayWorklineSummary }) {
  return (
    <article className="today-workline-card">
      <div>
        <span>Reflected packets</span>
        <p>{summary.reflectedPackets.length ? `${summary.reflectedPackets.length} packet(s)` : 'No reflected packets yet.'}</p>
      </div>
      <div>
        <span>Stale warnings</span>
        <p>{summary.staleWarnings.length ? `${summary.staleWarnings.length} stale packet(s)` : 'none'}</p>
      </div>
      <textarea readOnly value={summary.text} aria-label="Today Workline Summary text" />
    </article>
  );
}

function CodexPluginReadyCard({ pack }: { pack: CodexPluginReadyPack }) {
  return (
    <article className="plugin-ready-card">
      <div className="plugin-readiness-grid">
        {pack.readiness.map((item) => (
          <section key={item.label}>
            <span>{item.label}</span>
            <p>{item.state}</p>
            <small>{item.next}</small>
          </section>
        ))}
      </div>
      <div className="plugin-ready-text">
        <label>
          <span>Plugin Sketch</span>
          <textarea readOnly value={pack.pluginSketch} />
        </label>
        <label>
          <span>Status Site Brief</span>
          <textarea readOnly value={pack.siteBrief} />
        </label>
        <label>
          <span>Annotation Map</span>
          <textarea readOnly value={pack.annotationMap} />
        </label>
      </div>
    </article>
  );
}
function PacketHistoryList({
  entries,
  onCopy,
  onReflect
}: {
  entries: PacketHistoryEntry[];
  onCopy: (entry: PacketHistoryEntry) => void;
  onReflect: (entry: PacketHistoryEntry) => void;
}) {
  if (entries.length === 0) {
    return <p className="empty-history">保存した packet はまだありません。作業が一区切りしたら保存して、次回の入口にします。</p>;
  }

  return (
    <div className="packet-history-list">
      {entries.map((entry) => {
        const captured = new Date(entry.capturedAt);
        const capturedLabel = Number.isNaN(captured.getTime()) ? entry.capturedAt : captured.toLocaleString();
        const stale = isPacketHistoryEntryStale(entry);

        return (
          <article className="packet-history-entry" key={entry.id}>
            <header>
              <div>
                <span>{capturedLabel}</span>
                <p>{entry.summary}</p>
              </div>
              {stale ? <strong className="stale-pill">stale</strong> : <strong className="fresh-pill">fresh</strong>}
            </header>
            <p>{entry.next}</p>
            <div className="packet-entry-actions">
              <button onClick={() => onCopy(entry)} type="button">
                コピー
              </button>
              <button onClick={() => onReflect(entry)} type="button">
                文脈へ反映
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function LatestPacketCard({ packet }: { packet: LatestUsefulPacketRecall }) {
  return (
    <article className="packet-card">
      <div>
        <span>Summary</span>
        <p>{packet.packetSummary}</p>
      </div>
      <div>
        <span>Sources</span>
        <ul>
          {packet.sourcePanels.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </div>
      <div>
        <span>Latest TRACE</span>
        <p>{packet.latestTrace}</p>
      </div>
      <div>
        <span>GOLDEN</span>
        <p>{packet.golden}</p>
      </div>
      <div>
        <span>NEXT</span>
        <p>{packet.next}</p>
      </div>
    </article>
  );
}
function RunbookCard({ preset }: { preset: HandoffRunbookPreset }) {
  return (
    <article className="runbook-card">
      <header>
        <h2>{preset.label}</h2>
        <p>{preset.purpose}</p>
      </header>
      <div className="runbook-block">
        <span>Panels</span>
        <ul>
          {preset.panels.map((panel) => (
            <li key={panel}>{panel}</li>
          ))}
        </ul>
      </div>
      <div className="runbook-block">
        <span>Order</span>
        <ol>
          {preset.order.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <p className="runbook-safety">{preset.safetyNote}</p>
    </article>
  );
}
function WorkbenchCard({ lane }: { lane: WorkbenchLane }) {
  return (
    <article className="workbench-card">
      <header>
        <h2>{lane.label}</h2>
        <span>{lane.handoff}</span>
      </header>
      <dl>
        <div>
          <dt>STATE</dt>
          <dd>{lane.state}</dd>
        </div>
        <div>
          <dt>CHECK</dt>
          <dd>{lane.check}</dd>
        </div>
        <div>
          <dt>NEXT</dt>
          <dd>{lane.next}</dd>
        </div>
      </dl>
    </article>
  );
}
function PromptPanel({ focusClassName, label, onCopy, value }: { focusClassName?: string; label: string; onCopy: () => void; value: string }) {
  return (
    <article className={focusClassName ?? 'prompt-panel'}>
      <div className="prompt-heading">
        <h2>{label}</h2>
        <button onClick={onCopy} type="button">
          コピー
        </button>
      </div>
      <textarea readOnly value={value} />
    </article>
  );
}
























