import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  firstWorkshopReceipt, isWorkshopReceipt, workshopApplyModes, workshopCiStates, workshopRunStates,
  type WorkshopReceipt
} from './workshopReceipts';

function duration(seconds: number | null) {
  if (seconds === null) return '未計測';
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}分${seconds % 60}秒` : `${seconds}秒`;
}

export function WorkshopReceiptPanel({
  receipts, onSave
}: {
  receipts: WorkshopReceipt[];
  onSave: (receipt: WorkshopReceipt) => void;
}) {
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<WorkshopReceipt | null>(null);
  const editor = useRef<HTMLDetailsElement>(null);
  const runIdInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing || !editor.current) return;
    editor.current.open = true;
    runIdInput.current?.focus();
  }, [editing]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? '').trim();
    const seconds = field('elapsedSeconds');
    const receipt = {
      runId: field('runId'), agent: field('agent'), task: field('task'), state: field('state'),
      applyMode: field('applyMode'), prUrl: field('prUrl'), ci: field('ci'), ciUrl: field('ciUrl'),
      elapsedSeconds: seconds === '' ? null : Number(seconds)
    };
    if (!isWorkshopReceipt(receipt)) {
      setMessage('入力を確認してください。PRとCIには、該当するGitHubのURLを入力してください。');
      return;
    }
    onSave(receipt);
    form.reset();
    setEditing(null);
    setMessage('結果票をこのプロジェクトに保存しました。');
  }

  return (
    <section className="workshop-receipts" aria-labelledby="workshop-receipts-title">
      <header>
        <h2 id="workshop-receipts-title">工房の結果票</h2>
        <p>Logs / Review に添える確認済みの実行記録。状態とCIは手動で記録します。</p>
      </header>
      {receipts.length === 0 && <p>このプロジェクトに実行記録はありません。</p>}
      {receipts.map((receipt) => (
        <article className="workshop-receipt" key={receipt.runId}>
          <header className="workshop-receipt-heading">
            <h3>{receipt.task}</h3>
            <button className="workshop-receipt-button" type="button" aria-label={`${receipt.task} の結果票を編集`}
              onClick={() => setEditing(receipt)}>編集</button>
          </header>
          <dl>
            <div><dt>担当AI</dt><dd>{receipt.agent}</dd></div>
            <div><dt>実行状態</dt><dd>{workshopRunStates[receipt.state]}</dd></div>
            <div><dt>所要時間</dt><dd>{duration(receipt.elapsedSeconds)}</dd></div>
            <div><dt>反映方法</dt><dd>{workshopApplyModes[receipt.applyMode]}</dd></div>
            <div><dt>PR</dt><dd>{receipt.prUrl ? <a href={receipt.prUrl}>{new URL(receipt.prUrl).pathname}</a> : '未記録'}</dd></div>
            <div><dt>CI</dt><dd>{receipt.ciUrl ? <a href={receipt.ciUrl}>{workshopCiStates[receipt.ci]}</a> : workshopCiStates[receipt.ci]}</dd></div>
            <div className="workshop-run-id"><dt>実行ID</dt><dd><code>{receipt.runId}</code></dd></div>
          </dl>
        </article>
      ))}
      {!receipts.some(({ runId }) => runId === firstWorkshopReceipt.runId) && (
        <button className="workshop-receipt-button" type="button" onClick={() => {
          onSave(firstWorkshopReceipt);
          setMessage('M0.1の実行記録を追加しました。');
        }}>M0.1の実行記録を追加</button>
      )}
      <details ref={editor}>
        <summary>{editing ? '結果票を編集' : '結果票を記録'}</summary>
        <p>未確認の欄は空欄または「未確認」のまま保存できます。</p>
        <form key={editing?.runId ?? 'new'} className="workshop-receipt-form" onSubmit={save}>
          <label>実行ID<input name="runId" ref={runIdInput} required maxLength={200} defaultValue={editing?.runId} readOnly={editing !== null} /></label>
          <label>担当AI<input name="agent" required maxLength={160} defaultValue={editing?.agent} /></label>
          <label className="workshop-task-input">タスク<input name="task" required maxLength={240} defaultValue={editing?.task} /></label>
          <label>実行状態<select name="state" defaultValue={editing?.state ?? 'unknown'}>
            {Object.entries(workshopRunStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label>所要時間（秒）<input name="elapsedSeconds" type="number" min={0} step={1} inputMode="numeric" defaultValue={editing?.elapsedSeconds ?? ''} /></label>
          <label>反映方法<select name="applyMode" defaultValue={editing?.applyMode ?? 'unknown'}>
            {Object.entries(workshopApplyModes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label>CI結果<select name="ci" defaultValue={editing?.ci ?? 'unknown'}>
            {Object.entries(workshopCiStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label>PR URL<input name="prUrl" type="url" maxLength={350} defaultValue={editing?.prUrl} /></label>
          <label>CI URL<input name="ciUrl" type="url" maxLength={350} defaultValue={editing?.ciUrl} /></label>
          <button className="workshop-receipt-button" type="submit">結果票を保存</button>
          {editing && <button className="workshop-receipt-button" type="button" onClick={() => setEditing(null)}>編集をキャンセル</button>}
        </form>
      </details>
      <p role="status">{message}</p>
    </section>
  );
}
