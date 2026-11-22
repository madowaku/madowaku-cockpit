import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  firstWorkshopReceipt, isWorkshopReceipt, readWorkshopTransfer, shareWorkshopReceipt,
  workshopApplyModes, workshopCiStates, workshopRunStates,
  type WorkshopReceipt
} from './workshopReceipts';

function duration(seconds: number | null) {
  if (seconds === null) return '未計測';
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}分${seconds % 60}秒` : `${seconds}秒`;
}

export function WorkshopReceiptPanel({
  receipts, onSave, handoff
}: {
  receipts: WorkshopReceipt[];
  onSave: (receipt: WorkshopReceipt) => void;
  handoff: string;
}) {
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<WorkshopReceipt | null>(null);
  const [editVersion, setEditVersion] = useState(0);
  const editor = useRef<HTMLDetailsElement>(null);
  const runIdInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing || !editor.current) return;
    editor.current.open = true;
    runIdInput.current?.focus();
  }, [editing]);

  function openReceipt(receipt: WorkshopReceipt) {
    setEditing({ ...receipt });
    setEditVersion((version) => version + 1);
  }

  async function copy(text: string, success: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(success);
    } catch {
      setMessage('コピーできませんでした。ブラウザーのクリップボード権限を確認してください。');
    }
  }

  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const receipt = readWorkshopTransfer(String(new FormData(form).get('transfer') ?? ''), receipts);
    if (!receipt) {
      setMessage('T3 CLI の JSON またはコピーした結果票を確認してください。');
      return;
    }
    openReceipt(receipt);
    form.reset();
    setMessage('入力欄に反映しました。内容を確認してから保存してください。');
  }

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
    setEditing(null);
    setEditVersion((version) => version + 1);
    setMessage('結果票をこのプロジェクトに保存しました。');
  }

  return (
    <section className="workshop-receipts" aria-labelledby="workshop-receipts-title">
      <header>
        <h2 id="workshop-receipts-title">工房の結果票</h2>
        <p>Logs / Review に添える実行記録。保存先はこのブラウザーです。</p>
      </header>
      <div className="workshop-transfer">
        <details>
          <summary>AI Creole を渡す</summary>
          <p>内容を確認し、T3 Code の対象プロジェクトで貼り付けて送信します。</p>
          <textarea aria-label="T3 に渡す AI Creole" readOnly value={handoff} rows={6} />
          <button className="workshop-receipt-button workshop-transfer-primary" type="button"
            onClick={() => void copy(handoff, 'AI Creole をコピーしました。')}>AI Creole をコピー</button>
        </details>
        <details>
          <summary>実行結果を取り込む</summary>
          <p><code>t3 thread show --messages 0 --json &lt;thread-id&gt;</code> の出力か、別端末でコピーした結果票を貼り付けます。</p>
          <form onSubmit={preview}>
            <label>結果の JSON<textarea name="transfer" required maxLength={16384} rows={4} /></label>
            <button className="workshop-receipt-button" type="submit">取り込み内容を確認</button>
          </form>
        </details>
      </div>
      {receipts.length === 0 && <p>このプロジェクトに実行記録はありません。</p>}
      {receipts.map((receipt) => (
        <article className="workshop-receipt" key={receipt.runId}>
          <header className="workshop-receipt-heading">
            <h3>{receipt.task}</h3>
            <div className="workshop-receipt-actions">
              <button className="workshop-receipt-button" type="button" aria-label={`${receipt.task} の結果票を編集`}
                onClick={() => openReceipt(receipt)}>編集</button>
              <button className="workshop-receipt-button" type="button" aria-label={`${receipt.task} の結果票をコピー`}
                onClick={() => void copy(shareWorkshopReceipt(receipt), '結果票1件をコピーしました。')}>コピー</button>
            </div>
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
        <form key={editVersion} className="workshop-receipt-form" onSubmit={save}>
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
          {editing && <button className="workshop-receipt-button" type="button" onClick={() => {
            setEditing(null);
            setEditVersion((version) => version + 1);
          }}>編集をキャンセル</button>}
        </form>
      </details>
      <p role="status">{message}</p>
    </section>
  );
}
