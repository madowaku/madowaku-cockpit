import { describe, expect, it } from 'vitest';
import {
  applyPacketToContextPack,
  applyTemplate,
  applyTraceToContextPack,
  buildTodayWorklineSummary,
  buildTraceReflection,
  buildWorkbenchDashboard,
  buildCreoleHandoffPrompt,
  buildCompressionPrompt,
  buildFocusModes,
  buildContextPackCompressCandidate,
  buildCodexPluginReadyPack,
  buildHandoffPacket,
  buildHandoffPacketJson,
  buildHandoffRunbookPresets,
  buildLatestUsefulPacketRecall,
  buildCodexOssHandoffMarkdown,
  buildFreebuffMarkdownHandoff,
  buildGithubHandoffMarkdown,
  buildHermesHandoffMarkdown,
  buildGoalMakerPrompt,
  buildLocalLlmPrepPrompt,
  buildMadowakuScoutAdoptPrompt,
  buildMemoryVaultMarkdownExport,
  buildMemoryVaultReuseIndex,
  buildObsidianMarkdownExport,
  buildOllamaReviewHandoffMarkdown,
  buildPlanPrompt,
  createPacketHistoryEntry,
  isPacketHistoryEntryStale,
  trimPacketHistory,
  type CockpitTask,
  type Project
} from './promptBuilders';

const project: Project = {
  name: 'Neon Locale',
  description: 'Tiny game localization experiments'
};

const task: CockpitTask = {
  title: 'Clean launch flow',
  roughGoal: 'Make the first play session easier to review.',
  status: 'planned',
  spec: 'Keep the route local and readable.',
  plan: 'Inspect launch screen, then patch the smallest path.',
  review: 'Watch for scope creep.',
  logs: 'npm run build passed after copy cleanup.',
  nextAction: 'Ask Codex for one safe Worker tranche.'
};

describe('prompt builders', () => {
  it('builds a /goal-maker prompt with project, task, notes, logs, and next action', () => {
    const prompt = buildGoalMakerPrompt(project, task);

    expect(prompt).toContain('/goal-maker');
    expect(prompt).toContain('Project: Neon Locale');
    expect(prompt).toContain('Task: Clean launch flow');
    expect(prompt).toContain('Status: planned');
    expect(prompt).toContain('Mood: 未設定');
    expect(prompt).toContain('Spec');
    expect(prompt).toContain('npm run build passed');
    expect(prompt).toContain('Ask Codex for one safe Worker tranche.');
  });

  it('builds a /plan prompt with local-first guardrails and all working notes', () => {
    const prompt = buildPlanPrompt(project, task);

    expect(prompt).toContain('/plan');
    expect(prompt).toContain('Do not add model calls');
    expect(prompt).toContain('Tiny game localization experiments');
    expect(prompt).toContain('Make the first play session easier to review.');
    expect(prompt).toContain('Watch for scope creep.');
    expect(prompt).toContain('Next Action');
  });
  it('builds a GitHub handoff markdown body for issue or PR drafting', () => {
    const handoff = buildGithubHandoffMarkdown(project, { ...task, golden: 'Backup restore keeps notes.' });

    expect(handoff).toContain('# GitHub Handoff: Clean launch flow');
    expect(handoff).toContain('## Goal');
    expect(handoff).toContain('Make the first play session easier to review.');
    expect(handoff).toContain('## GOLDEN');
    expect(handoff).toContain('Backup restore keeps notes.');
    expect(handoff).toContain('No GitHub API call is required');
  });

  it('builds an Obsidian-compatible markdown export', () => {
    const markdown = buildObsidianMarkdownExport(project, { ...task, mood: '今日やる' });

    expect(markdown).toContain('---');
    expect(markdown).toContain('project: "Neon Locale"');
    expect(markdown).toContain('status: "planned"');
    expect(markdown).toContain('madowaku-cockpit');
    expect(markdown).toContain('## Context Pack');
    expect(markdown).toContain('## Next Action');
  });

  it('builds a local LLM prep prompt without invoking a model', () => {
    const prompt = buildLocalLlmPrepPrompt(project, task);

    expect(prompt).toContain('ROLE: Local LLM');
    expect(prompt).toContain('MODE: summarization_prep');
    expect(prompt).toContain('DO:');
    expect(prompt).toContain('Summarize noisy logs');
    expect(prompt).toContain('NO:');
    expect(prompt).toContain('Do not call tools or modify files');
    expect(prompt).toContain('OUT: STATE, RISKS, QUESTIONS, NEXT');
  });
  it('builds a typed handoff packet for future connectors', () => {
    const packet = buildHandoffPacket(project, { ...task, golden: 'Do not break backup restore.' }, 'madowaku_scout');

    expect(packet.target).toBe('madowaku_scout');
    expect(packet.project).toBe('Neon Locale');
    expect(packet.task).toBe('Clean launch flow');
    expect(packet.goal).toBe('Make the first play session easier to review.');
    expect(packet.keep).toContain('Do not break backup restore.');
    expect(packet.no).toContain('no secrets');
    expect(packet.out).toContain('Scout Report');
  });

  it('serializes the handoff packet as stable JSON', () => {
    const json = buildHandoffPacketJson(project, task, 'codex_task');
    const parsed = JSON.parse(json);

    expect(parsed.schema).toBe('madowaku.handoff_packet.v1');
    expect(parsed.target).toBe('codex_task');
    expect(parsed.check).toContain('npm test');
  });

  it('builds a Madowaku Scout/Adopt prompt from the handoff packet', () => {
    const prompt = buildMadowakuScoutAdoptPrompt(project, task);

    expect(prompt).toContain('ROLE: Madowaku Scout Agent');
    expect(prompt).toContain('DISCOVER:');
    expect(prompt).toContain('SCOUT:');
    expect(prompt).toContain('ADOPT:');
    expect(prompt).toContain('HandoffPacket JSON:');
    expect(prompt).toContain('NO: no secrets, no auth, no sync, no automatic tool execution');
  });




  it('creates bounded packet history entries and marks stale packets', () => {
    const fresh = createPacketHistoryEntry(project, task, '2026-05-16T00:00:00.000Z');
    const stale = createPacketHistoryEntry(project, task, '2026-05-01T00:00:00.000Z');
    const trimmed = trimPacketHistory([
      fresh,
      stale,
      createPacketHistoryEntry(project, { ...task, title: '3' }, '2026-05-03T00:00:00.000Z'),
      createPacketHistoryEntry(project, { ...task, title: '4' }, '2026-05-04T00:00:00.000Z'),
      createPacketHistoryEntry(project, { ...task, title: '5' }, '2026-05-05T00:00:00.000Z'),
      createPacketHistoryEntry(project, { ...task, title: '6' }, '2026-05-06T00:00:00.000Z')
    ]);

    expect(fresh.schema).toBe('madowaku.packet_history.v1');
    expect(fresh.summary).toContain('Neon Locale / Clean launch flow / planned');
    expect(fresh.copyText).toContain('LATEST_USEFUL_PACKET:');
    expect(trimmed).toHaveLength(5);
    expect(trimmed[0].capturedAt).toBe('2026-05-16T00:00:00.000Z');
    expect(isPacketHistoryEntryStale(fresh, '2026-05-20T00:00:00.000Z')).toBe(false);
    expect(isPacketHistoryEntryStale(stale, '2026-05-16T00:00:00.000Z')).toBe(true);
  });
  it('builds focus modes that highlight the right existing panels without removing all panels', () => {
    const modes = buildFocusModes(buildHandoffRunbookPresets(project, task));

    expect(modes.map((mode) => mode.label)).toEqual([
      'Overview',
      'Codex handoff',
      'Scout/adopt',
      'Local review',
      'Memory save',
      'Plugin ready',
      'All panels'
    ]);
    expect(modes.find((mode) => mode.id === 'overview')?.sections).toEqual([
      'AI Workbench',
      'Runbook Presets',
      'Latest Useful Packet'
    ]);
    expect(modes.find((mode) => mode.id === 'codex_handoff')?.panels).toEqual([
      'HandoffPacket JSON',
      'AI-CREOLE handoff',
      'Codex OSS handoff',
      'GitHub handoff'
    ]);
    expect(modes.find((mode) => mode.id === 'scout_adopt')?.panels).toContain('Madowaku Scout/Adopt');
    expect(modes.find((mode) => mode.id === 'memory_save')?.panels).toEqual([
      'Memory Vault',
      'TRACE reflection',
      '圧縮プロンプト',
      'COMPRESS候補',
      'Latest Useful Packet'
    ]);
    expect(modes.find((mode) => mode.id === 'plugin_ready')?.panels).toContain('Codex Plugin Ready');
    expect(modes.find((mode) => mode.id === 'all_panels')?.showAllPanels).toBe(true);
    expect(modes.every((mode) => mode.safetyNote.includes('copy-only'))).toBe(true);
  });
  it('builds a latest useful packet recall from HandoffPacket, TRACE, GOLDEN, and NEXT', () => {
    const recall = buildLatestUsefulPacketRecall(project, {
      ...task,
      contextPack: 'TRACE:\n- Observation: Runbook presets are visible.\nCHECK:\n- npm test passed.',
      golden: 'Generated handoffs stay copy-only.'
    });

    expect(recall.label).toBe('Latest useful packet');
    expect(recall.sourcePanels).toEqual(['HandoffPacket JSON', 'Latest TRACE', 'GOLDEN', 'Next Action']);
    expect(recall.packetSummary).toContain('Clean launch flow');
    expect(recall.packetSummary).toContain('planned');
    expect(recall.next).toContain('Ask Codex for one safe Worker tranche.');
    expect(recall.copyText).toContain('LATEST_USEFUL_PACKET:');
    expect(recall.copyText).toContain('Runbook presets are visible.');
    expect(recall.copyText).toContain('Generated handoffs stay copy-only.');
    expect(recall.copyText).toContain('madowaku.handoff_packet.v1');
  });
  it('builds copy-only handoff runbook presets for daily flows', () => {
    const presets = buildHandoffRunbookPresets(project, task);

    expect(presets.map((preset) => preset.label)).toEqual([
      'Codex implementation handoff',
      'Scout new tool / idea',
      'Local LLM review',
      'Memory Vault save',
      'GitHub issue / PR handoff',
      'Codex plugin-ready scout',
      'Obsidian note capture'
    ]);
    expect(presets.every((preset) => preset.purpose && preset.panels.length > 0 && preset.order.length > 0)).toBe(true);
    expect(presets.every((preset) => preset.safetyNote.includes('copy-only'))).toBe(true);
    expect(presets.find((preset) => preset.id === 'codex_implementation')?.panels).toContain('Codex OSS handoff');
    expect(presets.find((preset) => preset.id === 'scout_idea')?.panels).toContain('Madowaku Scout/Adopt');
    expect(presets.find((preset) => preset.id === 'memory_vault')?.panels).toContain('Memory Vault');
    expect(presets.find((preset) => preset.id === 'github_handoff')?.order[0]).toContain('HandoffPacket JSON');
    expect(presets.find((preset) => preset.id === 'codex_plugin_ready')?.panels).toContain('Codex Plugin Ready');
  });
  it('builds an AI Workbench dashboard with connectionless lanes', () => {
    const lanes = buildWorkbenchDashboard(project, { ...task, contextPack: 'TRACE:\n- Observation: latest workbench check' });

    expect(lanes.map((lane) => lane.label)).toEqual([
      'HandoffPacket',
      'Madowaku Scout',
      'Codex',
      'Local LLM',
      'GitHub',
      'Obsidian',
      'Codex Plugin Ready',
      'Freebuff'
    ]);
    expect(lanes.every((lane) => lane.state && lane.check && lane.next)).toBe(true);
    expect(lanes.find((lane) => lane.id === 'codex')?.check).toContain('npm test');
    expect(lanes.find((lane) => lane.id === 'local_llm')?.state).toContain('prep prompt');
    expect(lanes.find((lane) => lane.id === 'github')?.handoff).toBe('Issue / PR Markdown');
    expect(lanes.find((lane) => lane.id === 'obsidian')?.next).toContain('Markdown');
    expect(lanes.find((lane) => lane.id === 'codex_plugin')?.check).toContain('Blueprint only');
    expect(lanes.find((lane) => lane.id === 'freebuff')?.check).toContain('manual paste');
  });
  it('builds a Codex Plugin Ready pack for plugin, Sites, and annotation scouting', () => {
    const pack = buildCodexPluginReadyPack(project, {
      ...task,
      contextPack: 'TRACE:\n- Observation: plugin-ready board is readable.',
      golden: 'No direct connector or hosting activation.'
    });

    expect(pack.label).toBe('Codex Plugin Ready');
    expect(pack.readiness.map((item) => item.label)).toEqual([
      'Plugin bundle',
      'Status site',
      'Annotations',
      'Adoption gate'
    ]);
    expect(pack.pluginSketch).toContain('.codex-plugin/plugin.json');
    expect(pack.siteBrief).toContain('MADOWAKU_STATUS_SITE_BRIEF');
    expect(pack.annotationMap).toContain('ANNOTATION_FRIENDLY_MAP');
    expect(pack.copyText).toContain('ROLE: Codex');
    expect(pack.copyText).toContain('MODE: plugin_ready_scout');
    expect(pack.copyText).toContain('codex_plugin_blueprint');
    expect(pack.copyText).toContain('No direct connector or hosting activation.');
    expect(pack.copyText).toContain('no auth, sync, marketplace install, hosting deploy');
  });
  it('builds a Hermes Agent markdown handoff without executing tools', () => {
    const markdown = buildHermesHandoffMarkdown(project, task);

    expect(markdown).toContain('# Hermes Agent Handoff');
    expect(markdown).toContain('ROLE: Hermes Agent');
    expect(markdown).toContain('HandoffPacket');
    expect(markdown).toContain('NO: do not execute tools automatically');
    expect(markdown).toContain('OUT: route recommendation, delegated prompts, risks, NEXT');
  });

  it('builds an Ollama review markdown handoff without calling a model', () => {
    const markdown = buildOllamaReviewHandoffMarkdown(project, task);

    expect(markdown).toContain('# Ollama Review Handoff');
    expect(markdown).toContain('ROLE: Local LLM');
    expect(markdown).toContain('MODE: local_review');
    expect(markdown).toContain('NO: do not modify files');
    expect(markdown).toContain('OUT: summary, risks, missing context, NEXT');
  });

  it('builds a Codex OSS markdown handoff without invoking Codex', () => {
    const markdown = buildCodexOssHandoffMarkdown(project, task);

    expect(markdown).toContain('# Codex OSS Handoff');
    expect(markdown).toContain('ROLE: Codex');
    expect(markdown).toContain('MODE: codex_patch');
    expect(markdown).toContain('NO: no git push, no deploy, no hidden external services');
    expect(markdown).toContain('CHECK: npm test; npm run build');
  });
  it('builds a Freebuff markdown handoff using file mentions without invoking the CLI', () => {
    const markdown = buildFreebuffMarkdownHandoff(project, {
      ...task,
      contextPack: 'READ:\n1. src/promptBuilders.ts\n2. src/App.tsx\nDO NOT READ:\n- node_modules',
      golden: 'Generated prompts stay copy-only.'
    });

    expect(markdown).toContain('# Freebuff Handoff');
    expect(markdown).toContain('@src/promptBuilders.ts');
    expect(markdown).toContain('@src/App.tsx');
    expect(markdown).toContain('knowledge.md');
    expect(markdown).toContain('NO: do not run /bash or !commands automatically');
    expect(markdown).toContain('OUT: changed files proposal, risks, verification plan, NEXT');
  });
  it('builds a memory-vault markdown export for storage, compression, and reuse', () => {
    const markdown = buildMemoryVaultMarkdownExport(project, {
      ...task,
      contextPack: 'TRACE:\n- Observation: dashboard and handoffs are visible.',
      golden: 'Dashboard lanes remain readable.'
    });

    expect(markdown).toContain('schema: "madowaku.memory_vault.v1"');
    expect(markdown).toContain('memory_type: "workbench_handoff"');
    expect(markdown).toContain('## Reuse Index');
    expect(markdown).toContain('## Compression Notes');
    expect(markdown).toContain('## HandoffPacket');
    expect(markdown).toContain('Dashboard lanes remain readable.');
    expect(markdown).toContain('TRACE:\n- Observation: dashboard and handoffs are visible.');
  });

  it('includes task mood when one is selected', () => {
    const prompt = buildPlanPrompt(project, { ...task, mood: 'Codex待ち' });

    expect(prompt).toContain('Mood: Codex待ち');
  });

  it('builds an AI-CREOLE handoff prompt with loop and heuristic-learning tags', () => {
    const prompt = buildCreoleHandoffPrompt(project, { ...task, contextPack: 'Read only src/promptBuilders.ts and tests first.' });

    expect(prompt).toContain('ROLE: Codex');
    expect(prompt).toContain('MODE: codex_patch');
    expect(prompt).toContain('LOOP: Prelude -> STATE/CHECK/NEXT -> Coda');
    expect(prompt).toContain('TRACE:');
    expect(prompt).toContain('GOLDEN:');
    expect(prompt).toContain('Read only src/promptBuilders.ts and tests first.');
  });
  it('inserts the latest TRACE summary into the AI-CREOLE handoff prompt', () => {
    const first = applyTraceToContextPack(project, { ...task, logs: 'First trace from older work.' });
    const second = applyTraceToContextPack(project, {
      ...first,
      logs: 'Latest trace after GOLDEN field work.',
      nextAction: 'Ask Codex for a final audit.'
    });
    const prompt = buildCreoleHandoffPrompt(project, second);

    expect(prompt).toContain('LATEST_TRACE:');
    expect(prompt).toContain('Latest trace after GOLDEN field work.');
    expect(prompt).toContain('NEXT: Ask Codex for a final audit.');
  });

  it('builds a TRACE reflection from logs, checks, and next action', () => {
    const trace = buildTraceReflection(project, task);

    expect(trace).toContain('TRACE:');
    expect(trace).toContain('npm run build passed after copy cleanup.');
    expect(trace).toContain('CHECK:');
    expect(trace).toContain('GOLDEN:');
    expect(trace).toContain('NEXT: Ask Codex for one safe Worker tranche.');
    expect(trace).toContain('COMPRESS:');
  });
  it('uses the independent GOLDEN field for representative cases', () => {
    const goldenTask = { ...task, golden: 'Golden path: backup export -> refresh -> restore keeps notes.' };
    const trace = buildTraceReflection(project, goldenTask);
    const handoff = buildCreoleHandoffPrompt(project, goldenTask);

    expect(trace).toContain('- Preserve: Golden path: backup export -> refresh -> restore keeps notes.');
    expect(handoff).toContain('GOLDEN: Golden path: backup export -> refresh -> restore keeps notes.');
  });

  it('applies TRACE reflection to the context pack without clearing logs', () => {
    const reflected = applyTraceToContextPack(project, { ...task, contextPack: 'READ:\n1. AI_CREOLE.md' });

    expect(reflected.contextPack).toContain('READ:\n1. AI_CREOLE.md');
    expect(reflected.contextPack).toContain('TRACE:');
    expect(reflected.contextPack).toContain('NEXT: Ask Codex for one safe Worker tranche.');
    expect(reflected.logs).toBe(task.logs);
  });

  it('does not duplicate the same TRACE reflection in the context pack', () => {
    const once = applyTraceToContextPack(project, { ...task, contextPack: 'READ:\n1. AI_CREOLE.md' });
    const twice = applyTraceToContextPack(project, once);
    const traceCount = twice.contextPack?.match(/^TRACE:/gm)?.length ?? 0;

    expect(traceCount).toBe(1);
    expect(twice.contextPack).toBe(once.contextPack);
  });
  it('builds a COMPRESS candidate when the context pack has many TRACE blocks', () => {
    const traceOne = buildTraceReflection(project, task);
    const traceTwo = buildTraceReflection(project, { ...task, logs: 'Second pass found no scope drift.' });
    const traceThree = buildTraceReflection(project, { ...task, logs: 'Third pass confirmed localStorage restore.' });
    const candidate = buildContextPackCompressCandidate({
      ...task,
      contextPack: [traceOne, traceTwo, traceThree].join('\n\n')
    });

    expect(candidate).toContain('COMPRESS CANDIDATE:');
    expect(candidate).toContain('TRACE count: 3');
    expect(candidate).toContain('Third pass confirmed localStorage restore.');
    expect(candidate).toContain('Replace older TRACE blocks');
  });
  it('builds a Memory Vault reuse index from bounded packet history', () => {
    const fresh = createPacketHistoryEntry(project, task, '2026-05-16T00:00:00.000Z');
    const stale = createPacketHistoryEntry(project, { ...task, title: 'Older pass', nextAction: 'Re-check stale context.' }, '2026-05-01T00:00:00.000Z');
    const index = buildMemoryVaultReuseIndex([fresh, stale], '2026-05-16T00:00:00.000Z');

    expect(index.items).toHaveLength(2);
    expect(index.items[0].summary).toContain('Neon Locale / Clean launch flow / planned');
    expect(index.items[0].state).toBe('fresh');
    expect(index.items[1].state).toBe('stale');
    expect(index.markdown).toContain('## Reuse Packet Index');
    expect(index.markdown).toContain('Re-check stale context.');
  });

  it('adds saved packet history to Memory Vault export', () => {
    const packet = createPacketHistoryEntry(project, task, '2026-05-16T00:00:00.000Z');
    const markdown = buildMemoryVaultMarkdownExport(project, task, [packet], '2026-05-16T00:00:00.000Z');

    expect(markdown).toContain('## Reuse Packet Index');
    expect(markdown).toContain('Neon Locale / Clean launch flow / planned');
    expect(markdown).toContain('Ask Codex for one safe Worker tranche.');
  });

  it('reflects a saved packet into the context pack without duplicating it', () => {
    const packet = createPacketHistoryEntry(project, task, '2026-05-16T00:00:00.000Z');
    const once = applyPacketToContextPack({ ...task, contextPack: 'READ:\n1. src/App.tsx' }, packet);
    const twice = applyPacketToContextPack(once, packet);

    expect(once.contextPack).toContain('READ:\n1. src/App.tsx');
    expect(once.contextPack).toContain('REUSE_PACKET:');
    expect(once.contextPack).toContain(packet.id);
    expect(once.contextPack).toContain('NEXT: Ask Codex for one safe Worker tranche.');
    expect(twice.contextPack).toBe(once.contextPack);
  });
  it('builds a compact Today Workline Summary with reflected packets and stale warnings', () => {
    const fresh = createPacketHistoryEntry(project, task, '2026-05-16T00:00:00.000Z');
    const stale = createPacketHistoryEntry(project, { ...task, title: 'Older pass', nextAction: 'Re-check stale context.' }, '2026-05-01T00:00:00.000Z');
    const withFresh = applyPacketToContextPack(task, fresh);
    const withBoth = applyPacketToContextPack(withFresh, stale);
    const summary = buildTodayWorklineSummary(project, withBoth, [fresh, stale], {
      focusLabel: 'Memory save',
      nowIso: '2026-05-16T00:00:00.000Z'
    });

    expect(summary.label).toBe('Today Workline Summary');
    expect(summary.text).toContain('TODAY_WORKLINE_SUMMARY:');
    expect(summary.text).toContain('Project: Neon Locale');
    expect(summary.text).toContain('Task: Clean launch flow');
    expect(summary.text).toContain('Status: planned');
    expect(summary.text).toContain('Flow: Memory save');
    expect(summary.text).toContain('Latest useful packet: Neon Locale / Clean launch flow / planned / codex_task');
    expect(summary.text).toContain(fresh.id);
    expect(summary.text).toContain(stale.id);
    expect(summary.text).toContain('STALE WARNING:');
    expect(summary.text).toContain('TRACE:');
    expect(summary.text).toContain('GOLDEN: (No golden cases yet.)');
    expect(summary.text).toContain('NEXT: Ask Codex for one safe Worker tranche.');
    expect(summary.staleWarnings).toHaveLength(1);
    expect(summary.reflectedPackets).toHaveLength(2);
  });
  it('builds a compression prompt from logs, review notes, and current goal', () => {
    const prompt = buildCompressionPrompt(project, task);

    expect(prompt).toContain('Compress this working context into one next action');
    expect(prompt).toContain('Project: Neon Locale');
    expect(prompt).toContain('Make the first play session easier to review.');
    expect(prompt).toContain('Watch for scope creep.');
    expect(prompt).toContain('npm run build passed after copy cleanup.');
    expect(prompt).toContain('Return only');
  });

  it('applies an AI-CREOLE template into the context pack without erasing notes', () => {
    const templated = applyTemplate({ ...task, contextPack: 'Existing project dialect.' }, 'creole');

    expect(templated.contextPack).toContain('Existing project dialect.');
    expect(templated.contextPack).toContain('ROLE / MODE / GOAL / STATE / DO / CHECK / NEXT');
    expect(templated.review).toContain('TRACE / REPLAY / GOLDEN / COMPRESS');
    expect(templated.logs).toBe(task.logs);
  });

  it('applies a project workflow template without erasing existing notes', () => {
    const templated = applyTemplate(task, 'review');

    expect(templated.spec).toContain('Acceptance');
    expect(templated.plan).toContain('smallest reviewed slice');
    expect(templated.review).toContain('Scope boundary');
    expect(templated.logs).toBe(task.logs);
    expect(templated.nextAction).toBe(task.nextAction);
  });
});


















