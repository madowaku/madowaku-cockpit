import { useState } from 'react';
import { parseDiagnosis, recommend, workflows, type Diagnosis } from './firstRun';

export function FirstRun() {
  const [goal, setGoal] = useState('');
  const [selected, setSelected] = useState('inspect');
  const [report, setReport] = useState<Diagnosis | null>(null);
  const [message, setMessage] = useState('');
  const [outcome, setOutcome] = useState('未実行');
  const candidates = recommend(goal);
  const workflow = workflows.find(w => w.id === selected)!;
  const check = report?.checks.find(c => c.id === selected);
  const stale = report && Date.now() - Date.parse(report.observedAt) > 24 * 60 * 60_000;
  function choose(id: string) { setSelected(id); setOutcome('未実行'); setMessage(''); }
  async function copy() {
    try { await navigator.clipboard.writeText(workflow.command); setMessage('起動コマンドをコピーしました。まだ実行していません。'); }
    catch { setMessage('コピーできませんでした。下のコマンドを選択してコピーしてください。'); }
  }
  return <section className="first-run" aria-label="はじめの案内">
    <h2>今日は何をしたいですか？</h2>
    <p>目的から操作を選べます。案内は無料・ローカル処理。コマンドは自分で確認して端末で実行します。</p>
    <label>やりたいこと<input maxLength={2000} value={goal} placeholder="例：ゲームの自律テストを準備したい" onChange={e => setGoal(e.target.value)} /></label>
    <p role="status">{!goal.trim() ? '下から目的を選ぶか、言葉で入力してください。' : candidates.length === 0 ? '該当する操作が見つかりません。目的を言い換えるか下から選んでください。' : candidates.length > 1 ? '候補が複数あります。今回の目的に近いものを選んでください。' : 'おすすめの操作を選んで手順を確認してください。'}</p>
    <div className="first-run-options">{workflows.map(w => <button key={w.id} aria-pressed={selected === w.id} onClick={() => choose(w.id)}>{candidates.includes(w) ? '候補：' : ''}{w.title}</button>)}</div>
    <details>
      <summary>システム診断（初回・起動できないとき）</summary>
      <p>MCCフォルダの端末で実行してください。対象は4つのリポジトリを置いた親フォルダです。別の場所ならパスを変更してください。</p>
      <pre>node scripts/first-run-doctor.mjs --projects-root "C:\Dev\Projects" &gt; first-run-report.json</pre>
      <label>診断JSONを読み込む<input type="file" accept=".json,application/json" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        try { if (file.size > 32_000) throw new Error('診断ファイルが大きすぎます。'); const parsed = parseDiagnosis((await file.text()).replace(/^\uFEFF/, '')); setReport(parsed); setMessage('診断を読み込みました。ファイル検出は実行成功の証明ではありません。'); }
        catch (error) { setReport(null); setMessage(error instanceof Error ? error.message : '読み込みに失敗しました。'); }
        e.target.value = '';
      }} /></label>
      {report && <><p>診断日時：{report.observedAt} / Node {report.nodeMajor} {report.nodeMajor < 22 ? '— Node 22以上が必要です' : ''}</p><ul>{report.checks.map(c => <li key={c.id}>{workflows.find(w => w.id === c.id)?.title}：{c.status === 'detected' ? '必要ファイルを検出（依存関係・動作は未確認）' : '不足または読み取れないファイルあり'}</li>)}</ul></>}
      <p>診断はソースの存在とハッシュのみを確認します。Python・Godot・認証・モデル・接続・課金状態は確認しません。ファイルはアップロードされません。</p>
    </details>
    <article>
      <h3>{workflow.title}</h3><p>{workflow.when}</p>
      <p><strong>現在の状態：</strong>{!check || stale ? '未確認。必要なら診断を実行してください。' : check.status === 'detected' ? '必要ファイルあり。起動前に下の依存関係を確認してください。' : 'ファイルが不足しています。対象リポジトリとバージョンを確認してください。'}</p>
      {check?.status === 'incomplete' && <ul>{check.files.filter(f => f.status === 'unavailable').map(f => <li key={f.name}>{f.name}</li>)}</ul>}
      <p><strong>準備：</strong>{workflow.requirements}。依存関係のインストールにはネットワークが必要な場合があります。</p>
      <p><strong>実行する場所：</strong>{workflow.repo} フォルダ</p>
      <pre>{workflow.command}</pre><button onClick={copy}>起動コマンドをコピー</button>
      <p><strong>期待する結果：</strong>{workflow.result}</p><p>{workflow.limit}</p>
      <label>端末で実行した結果（自己申告）<select value={outcome} onChange={e => setOutcome(e.target.value)}><option>未実行</option><option>期待した結果が出た</option><option>エラーになった</option></select></label>
      <p><strong>次の操作：</strong>{outcome === '未実行' ? '準備と実行場所を確認し、端末でコマンドを実行してください。' : outcome === 'エラーになった' ? 'システム診断を更新し、不足ファイルと準備を確認。解決しなければ秘密情報を除いたエラーをCodexに伝えてください。' : workflow.next}</p>
      <p>実行結果は自動取得していません。自己申告だけで検証済み・公開可能にはしません。</p>
      <a href={`https://github.com/madowaku/${workflow.repo}#readme`} target="_blank" rel="noreferrer">詳しい既存手順を読む</a>
    </article>
    <p role="status">{message}</p>
  </section>;
}
