import { useState } from 'react';
import { parseHygieneReport, type HygieneReport, type HygieneClassification } from './developmentHygiene';

const labels: Record<HygieneClassification, string> = {
  MUST_KEEP: '必須保管',
  UNKNOWN_KEEP: '未確認: 保持',
  REVIEW_REQUIRED: '要追加確認'
};

const auditHandoff = [
  'MCC-M4 Development Hygiene Guard: 開発後のGit worktreeを読み取り専用で点検してください。',
  '対象は現在の信頼済みGitリポジトリ1件だけ。',
  'node tools/development-hygiene/audit.mjs --repo "<対象リポジトリ>"',
  '削除、ブランチ変更、ファイル書込、git clean、worktree removeは禁止。',
  'JSONのREVIEW_REQUIREDは削除許可ではありません。プロセス、他チャット、Codex所有状態、外部参照、固有成果は未確認として保持してください。'
].join('\n');

export default function DevelopmentHygieneLab() {
  const [input, setInput] = useState('');
  const [report, setReport] = useState<HygieneReport | null>(null);
  const [message, setMessage] = useState('スキャンはこの画面から実行しません。');
  function inspect() {
    try {
      setReport(parseHygieneReport(input));
      setMessage('ローカル表示のみ。端末やGitファイルには触れていません。');
    } catch (error) {
      setReport(null);
      setMessage(error instanceof Error ? error.message : '読み取れませんでした。');
    }
  }
  async function copyHandoff() {
    try {
      await navigator.clipboard.writeText(auditHandoff);
      setMessage('監査依頼文をコピーしました。実行はしていません。');
    } catch {
      setMessage('コピーできませんでした。ブラウザのクリップボード許可を確認してください。');
    }
  }
  return (
    <details className="hygiene-lab">
      <summary><strong>MCC-M4 · Development Hygiene Guard</strong> <span>READ ONLY / 開発環境の健康診断</span></summary>
      <div className="hygiene-body">
        <p>監査JSONを貼り付けると、Git worktreeの保管・未確認・追加確認候補を整理します。ブラウザからコマンド実行も削除もしません。</p>
        <div className="hygiene-actions">
          <button type="button" onClick={copyHandoff}>Codex / Claude 点検依頼をコピー</button>
          <a href="https://github.com/madowaku/madowaku-cockpit/blob/main/docs/development-hygiene-guard.md" target="_blank" rel="noreferrer">安全仕様</a>
        </div>
        <label htmlFor="hygiene-report-input">読み取り専用の診断JSON（貼り付け内容は保存しません）</label>
        <textarea
          id="hygiene-report-input"
          placeholder='{"schema":"mcc-development-hygiene/v1","mode":"READ_ONLY", ...}'
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          spellCheck={false}
          maxLength={128000}
        />
        <div className="hygiene-actions">
          <button type="button" onClick={inspect} disabled={!input.trim()}>診断結果を表示</button>
          <button type="button" onClick={() => { setInput(''); setReport(null); setMessage('表示をクリアしました。'); }}>画面からクリア</button>
        </div>
        <p className="hygiene-notice" role="status">{message}</p>
        {report && (
          <section aria-label="Worktree audit findings">
            <p className="hygiene-counts">
              <strong>必須保管 {report.summary.mustKeep}</strong>
              <strong>未確認 {report.summary.unknownKeep}</strong>
              <strong>追加確認 {report.summary.reviewRequired}</strong>
            </p>
            <p className="hygiene-notice">要追加確認は削除許可ではありません。稼働中プロセス・他セッション・固有成果の調査が必要です。</p>
            <ul className="hygiene-findings">
              {report.worktrees.map((item, index) => (
                <li key={index}>
                  <div className="hygiene-item-header">
                    <strong>{labels[item.classification]}</strong>
                    <code>{item.branch ?? 'detached HEAD'}</code>
                  </div>
                  <p className="hygiene-path">{item.path}</p>
                  <small>変更: {item.dirty === null ? '不明' : item.dirty ? 'あり' : 'なし'} / ignored: {item.ignored === null ? '不明' : item.ignored ? 'あり' : 'なし'} / 未統合疑い: {item.unmerged === null ? '不明' : item.unmerged ? 'あり' : 'なし'}</small>
                  <p className="hygiene-reasons">{item.reasons.join(' · ') || '理由未記入'}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </details>
  );
}
