const ID = /^[a-z][a-z0-9-]{0,31}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const BRANCH = /^(?!\/)(?!.*(?:\.\.|\s|@\{|\\|\/\/|\.$|\.lock$))[-A-Za-z0-9_./]+$/;

function safeScope(path) {
  return typeof path === 'string' &&
    path.endsWith('/') &&
    !path.startsWith('/') &&
    !path.includes('\\') &&
    path.split('/').slice(0, -1).every(part => part && part !== '.' && part !== '..' && part !== '.git');
}

const overlaps = (a, b) => a.startsWith(b) || b.startsWith(a);

export function assessPlan(plan) {
  const errors = [];
  const warnings = [];
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    return { ok: false, errors: ['Plan must be a JSON object.'], warnings, handoffs: [] };
  }
  if (plan.version !== 1) errors.push('version must be 1.');
  if (typeof plan.repo !== 'string' || !REPO.test(plan.repo)) errors.push('repo must be owner/name.');
  if (typeof plan.base_branch !== 'string' || !BRANCH.test(plan.base_branch)) errors.push('base_branch is invalid.');
  if (!Array.isArray(plan.lanes) || plan.lanes.length < 2 || plan.lanes.length > 3) {
    errors.push('M0.1 requires 2 or 3 lanes.');
  }

  const seenIds = new Set();
  const seenBranches = new Set();
  const scopes = [];
  const lanes = Array.isArray(plan.lanes) ? plan.lanes : [];
  for (const [index, lane] of lanes.entries()) {
    const label = `lanes[${index}]`;
    if (!lane || typeof lane !== 'object' || Array.isArray(lane)) {
      errors.push(`${label} must be an object.`);
      continue;
    }
    if (typeof lane.id !== 'string' || !ID.test(lane.id)) errors.push(`${label}.id must be a short slug.`);
    if (seenIds.has(lane.id)) errors.push(`${label}.id is duplicated.`);
    seenIds.add(lane.id);
    if (typeof lane.role !== 'string' || !lane.role.trim()) errors.push(`${label}.role is required.`);
    if (typeof lane.task !== 'string' || !lane.task.trim()) errors.push(`${label}.task is required.`);
    if (typeof lane.branch !== 'string' || !BRANCH.test(lane.branch) || lane.branch === plan.base_branch) {
      errors.push(`${label}.branch must be a valid branch distinct from base_branch.`);
    }
    if (seenBranches.has(lane.branch)) errors.push(`${label}.branch is duplicated.`);
    seenBranches.add(lane.branch);
    if (!Array.isArray(lane.owns) || lane.owns.length === 0) {
      errors.push(`${label}.owns must be nonempty directory prefixes ending in '/'.`);
    } else {
      for (const scope of lane.owns) {
        if (!safeScope(scope)) {
          errors.push(`${label}.owns has invalid directory prefix: ${JSON.stringify(scope)}.`);
        } else {
          for (const prior of scopes) {
            if (overlaps(scope, prior.scope)) {
              errors.push(`Ownership overlaps: ${prior.lane} (${prior.scope}) and ${lane.id} (${scope}).`);
            }
          }
          scopes.push({ lane: lane.id, scope });
        }
      }
    }
  }

  const gate = plan.merge_gate;
  if (!gate || typeof gate !== 'object' || Array.isArray(gate) ||
      gate.policy !== 'manual' || gate.human_review !== true) {
    errors.push('merge_gate must use policy: manual and human_review: true.');
  }
  if (!gate || !Array.isArray(gate.required_checks) || gate.required_checks.length === 0 ||
      !gate.required_checks.every(v => typeof v === 'string' && v.trim())) {
    errors.push('merge_gate.required_checks must list at least one check.');
  }
  if (!plan.baseline || typeof plan.baseline !== 'object' ||
      !Number.isFinite(plan.baseline.elapsed_minutes) || plan.baseline.elapsed_minutes <= 0) {
    warnings.push('Missing positive baseline.elapsed_minutes. Speedup cannot be measured yet.');
  }

  const ok = errors.length === 0;
  return {
    ok,
    errors,
    warnings,
    handoffs: ok ? lanes.map(lane => ({
      id: lane.id,
      text: [
        'ROLE: Codex',
        'MODE: codex_patch',
        `TASK: ${lane.task.trim()}`,
        `GOAL: Deliver a verified, independently reviewable change for ${lane.role.trim()}.`,
        `STATE: Proposed lane for ${plan.repo} at ${plan.base_branch}; no worktree, tests, or PR created by this tool.`,
        `TARGET: ${lane.owns.join(', ')}`,
        'DO: Make a minimal change only within TARGET; report changes and reproducible evidence.',
        'KEEP: Local-first, separate branch/worktree, human-reviewed handoff, existing project conventions.',
        'NO: No edits outside TARGET, no credentials, no automatic merge/deploy, no expansion of the cockpit read-only MCP bridge.',
        `OUT: Diff summary, changed files, TRACE, REPLAY, unresolved risks, proposed PR branch ${lane.branch}.`,
        `CHECK: ${gate.required_checks.join(', ')}; verify actual results outside the read-only bridge.`,
        'RISK: File ownership drift, integration conflicts, stale context, unverified gameplay quality.',
        'NEXT: Human reviews evidence and decides whether to open or merge a PR.'
      ].join('\n')
    })) : []
  };
}

export function compareRuns(baseline, parallel) {
  for (const [name, run] of Object.entries({ baseline, parallel })) {
    if (!run || !Number.isFinite(run.elapsed_minutes) || run.elapsed_minutes <= 0 ||
        !Number.isInteger(run.ci_failures) || run.ci_failures < 0 ||
        !Number.isInteger(run.conflicts) || run.conflicts < 0) {
      throw new Error(`${name} must have positive elapsed_minutes and nonnegative integer ci_failures/conflicts.`);
    }
  }
  return {
    time_saved_percent: Math.round((1 - parallel.elapsed_minutes / baseline.elapsed_minutes) * 1000) / 10,
    ci_failure_delta: parallel.ci_failures - baseline.ci_failures,
    conflict_delta: parallel.conflicts - baseline.conflicts
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    let input = '';
    for await (const chunk of process.stdin) input += chunk.toString();
    const result = assessPlan(JSON.parse(input));
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Invalid plan input: ${error.message}\n`);
    process.exitCode = 1;
  }
}
