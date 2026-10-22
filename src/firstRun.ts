import catalog from './firstRunCatalog.json';
export const workflows = catalog;
export function recommend(goal: string) {
  const text = goal.normalize('NFKC').toLowerCase().slice(0, 2000);
  return workflows.filter(w => w.terms.some(term => text.includes(term)));
}
export type Diagnosis = {
  schema: 'mcc.first-run.v1'; observedAt: string; nodeMajor: number;
  checks: { id: string; status: 'detected' | 'incomplete'; files: { name: string; status: 'found' | 'unavailable'; sha256?: string }[] }[];
};
export function parseDiagnosis(text: string, now = Date.now()): Diagnosis {
  if (text.length > 32_000) throw new Error('診断ファイルが大きすぎます。');
  const data = JSON.parse(text);
  const fail = () => { throw new Error('診断形式が一致しません。診断コマンドで作り直してください。'); };
  if (!data || data.schema !== 'mcc.first-run.v1' || !Number.isInteger(data.nodeMajor) || data.nodeMajor < 1 || !Array.isArray(data.checks) || data.checks.length !== workflows.length) return fail();
  const time = Date.parse(data.observedAt);
  if (typeof data.observedAt !== 'string' || !Number.isFinite(time) || time > now + 60_000 || now - time > 24 * 60 * 60_000) throw new Error('診断が古いか日時が不正です。もう一度診断してください。');
  for (const workflow of workflows) {
    const matching = data.checks.filter((c: { id?: string } | null) => c?.id === workflow.id);
    if (matching.length !== 1) return fail();
    const check = matching[0];
    if (!Array.isArray(check.files) || check.files.length !== workflow.files.length) return fail();
    for (const name of workflow.files) {
      const files = check.files.filter((f: { name?: string } | null) => f?.name === name);
      if (files.length !== 1 || !['found', 'unavailable'].includes(files[0].status)) return fail();
      if (files[0].status === 'found' && !/^[a-f0-9]{64}$/.test(files[0].sha256)) return fail();
    }
    if (check.status !== (check.files.every((f: { status: string }) => f.status === 'found') ? 'detected' : 'incomplete')) return fail();
  }
  // Reconstruct only known fields: imported commands/URLs never become actions.
  return { schema: data.schema, observedAt: data.observedAt, nodeMajor: data.nodeMajor, checks: workflows.map(w => {
    const c = data.checks.find((c: { id: string }) => c.id === w.id);
    return { id: w.id, status: c.status, files: c.files.map((f: { name: string; status: 'found' | 'unavailable'; sha256?: string }) => ({ name: f.name, status: f.status, sha256: f.sha256 })) };
  }) };
}
