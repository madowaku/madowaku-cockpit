import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PocketWindow } from './PocketWindow';
import {
  buildStudioPacket, isTechnology, pocketBrief, pocketTechnology, studioKinds, suggestStudioMethods,
  technologyFields, technologyStates, type StudioRecord, type Technology
} from './studio';
import { workshopCiStates, workshopRunStates, type WorkshopReceipt } from './workshopReceipts';

export type CatalogEntry = { ownerId: string; technology: Technology };

type StudioHomeProps = {
  currentId: string;
  projects: { id: string; name: string }[];
  studio: StudioRecord;
  catalog: CatalogEntry[];
  receipts: WorkshopReceipt[];
  storageStatus: string;
  onProject: (id: string) => void;
  onBrief: (brief: string) => void;
  onTechnology: (technology: Technology, ownerId: string, previous?: Technology) => Promise<void>;
  onCopy: (text: string) => Promise<void>;
  onPacket: (text: string) => void;
  onScout: (technology: Technology) => string;
  onToolbox: (focusReceipts?: boolean) => void;
};

const short = (value: string) => value || '未確認';

export function StudioHome({
  currentId, projects, studio, catalog, receipts, storageStatus, onProject, onBrief,
  onTechnology, onCopy, onPacket, onScout, onToolbox
}: StudioHomeProps) {
  const [stage, setStage] = useState<'idea' | 'methods' | 'packet'>('idea');
  const [packet, setPacket] = useState('');
  const [message, setMessage] = useState('');
  const [libraryMessage, setLibraryMessage] = useState('');
  const library = useRef<HTMLDetailsElement>(null);
  const libraryEditor = useRef<HTMLDetailsElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [editing, setEditing] = useState<CatalogEntry>();
  const [saving, setSaving] = useState(false);
  const idea = studio.brief;
  const result = suggestStudioMethods(idea, catalog.map(({ technology }) => technology));
  const delivered = receipts.filter(({ prUrl }) => Boolean(prUrl));
  const running = receipts.filter(({ state }) => state === 'running' || state === 'blocked');

  useEffect(() => {
    if (stage !== 'idea') heading.current?.focus();
  }, [stage]);

  function openLibrary() {
    if (!library.current) return;
    library.current.open = true;
    library.current.querySelector('summary')?.focus();
  }

  async function copyPacket(text: string, report: (message: string) => void, success: string) {
    try {
      await onCopy(text);
      report(success);
    } catch {
      report('自動コピーできませんでした。表示された本文を選択してコピーしてください。');
    }
  }

  async function storeTechnology(technology: Technology, ownerId: string, previous?: Technology) {
    setSaving(true);
    try {
      await onTechnology(technology, ownerId, previous);
      setLibraryMessage('技術図鑑に保存しました。');
      return true;
    } catch (error) {
      setLibraryMessage(error instanceof Error ? error.message : '保存できませんでした。');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveTechnology(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = Object.fromEntries(Array.from(data, ([key, value]) => [key, String(value).trim()]));
    const entry = { ...fields, id: editing?.technology.id ?? crypto.randomUUID() };
    if (!isTechnology(entry)) {
      setLibraryMessage('技術名と安全なHTTPSの出典を入力してください。調査済み以降には確認日・バージョンと根拠が必要です。');
      return;
    }
    if (await storeTechnology(entry, editing?.ownerId ?? currentId, editing?.technology)) {
      form.reset();
      setEditing(undefined);
    }
  }

  function editTechnology(entry: CatalogEntry) {
    setEditing(entry);
    if (libraryEditor.current) {
      libraryEditor.current.open = true;
      libraryEditor.current.querySelector('summary')?.focus();
    }
  }

  function chooseMethod(index: number) {
    const project = projects.find(({ id }) => id === currentId)?.name ?? currentId;
    const text = buildStudioPacket(project, idea, result.options[index], result.reusable);
    setPacket(text);
    onPacket(text);
    setMessage('');
    setStage('packet');
  }

  return (
    <main className="studio-home">
      <header className="studio-top">
        <a href="#studio-start" className="studio-brand"><i aria-hidden="true" /><span>madowaku <b>Creative Studio</b></span></a>
        <nav aria-label="工房の移動">
          <button type="button" onClick={openLibrary}>技術図鑑</button>
          <button type="button" onClick={() => onToolbox()}>道具箱</button>
        </nav>
      </header>

      <section className="studio-hero" aria-labelledby="studio-title">
        <div className="studio-hero-copy">
          <h1 id="studio-title">ひらめきを、<br />作品へ。</h1>
          <p>チャゲピーと育てたアイデアを、ここから工房へ。まずは、触れるものをひとつ。</p>
          <a className="studio-hero-link" href="#studio-start">制作をはじめる <span aria-hidden="true">↓</span></a>
        </div>
        <PocketWindow />
      </section>

      <div className="studio-context" id="studio-start">
        <label>プロジェクト<select value={currentId} onChange={(event) => onProject(event.target.value)}>
          {projects.map(({ id, name }) => <option value={id} key={id}>{name}</option>)}
        </select></label>
        <span role="status">{storageStatus}</span>
      </div>

      <div className="studio-work">
        <section className="studio-paper studio-intake" aria-labelledby="studio-idea-heading">
          {stage === 'idea' && <>
            <h2 id="studio-idea-heading">つくりたいこと</h2>
            <p>会話のメモや下書きを、そのまま貼って始められます。</p>
            <textarea aria-labelledby="studio-idea-heading" rows={5} maxLength={6000} value={idea}
              onChange={(event) => { onPacket(''); onBrief(event.target.value); }}
              placeholder="例えば、小さな窓から時間の変化を眺められる作品。" />
            <div className="studio-actions">
              <button type="button" className="studio-primary" disabled={!idea.trim()} onClick={() => setStage('methods')}>作り方を見る <span aria-hidden="true">→</span></button>
              <button type="button" onClick={() => { onPacket(''); onBrief(pocketBrief); }} disabled={Boolean(idea)}>窓の試作で試す</button>
            </div>
          </>}
          {stage === 'methods' && <>
            <h2 ref={heading} tabIndex={-1} id="studio-idea-heading">作り方を選ぶ</h2>
            <p>「{studioKinds[result.kind]}」に合う候補です。入力と図鑑から絞り込んでいます。AIによる自動調査は未接続です。</p>
            <div className="studio-methods">
              {result.options.map((method, index) => (
                <article className="studio-method" key={method.name}>
                  <span>{index ? '代替案' : 'おすすめ'}</span>
                  <h3>{method.name}</h3><p>{method.why}</p>
                  <p><strong>費用</strong> {method.cost}</p>
                  <p><strong>Skills候補</strong> {method.skills}</p>
                  <p><strong>要確認</strong> {method.check}</p>
                  {index === 0 && result.reusable && <p><strong>図鑑の関連記録</strong> {result.reusable.name}（{technologyStates[result.reusable.status]}）</p>}
                  <button type="button" className={index === 0 ? 'studio-primary' : undefined}
                    onClick={() => chooseMethod(index)} aria-label={`${method.name} でパケットを作る`}>この方法でパケットを作る</button>
                </article>
              ))}
            </div>
            <button type="button" onClick={() => setStage('idea')}>アイデアに戻る</button>
          </>}
          {stage === 'packet' && <>
            <h2 ref={heading} tabIndex={-1} id="studio-idea-heading">工房に渡す</h2>
            <p>AI Creoleを確認して、T3 Code / Codexの対象プロジェクトに手動で貼り付けます。</p>
            <textarea className="studio-packet" aria-label="制作パケット" rows={9} readOnly value={packet} />
            <div className="studio-actions">
              <button type="button" className="studio-primary"
                onClick={() => void copyPacket(packet, setMessage, '制作パケットをコピーしました。')}>制作パケットをコピー</button>
              <button type="button" onClick={() => setStage('methods')}>作り方に戻る</button>
            </div>
            <p className="studio-status" role="status">{message}</p>
          </>}
        </section>

        <aside className="studio-shelf" aria-label="制作の記録">
          <section className="studio-paper">
            <h2><span className="studio-window-icon" aria-hidden="true" />制作中</h2>
            {running.length ? <ul>{running.map((receipt) => (
              <li key={receipt.runId}>{receipt.task} <small>{workshopRunStates[receipt.state]}</small></li>
            ))}</ul> : <p>{stage === 'packet' ? '制作パケットは作成済み。実行記録はまだありません。' : '進行中の実行記録はありません。'}</p>}
            <button type="button" onClick={() => onToolbox(true)}>実行結果を取り込む</button>
          </section>
          <section className="studio-paper">
            <h2><span className="studio-window-icon" aria-hidden="true" />届いたもの</h2>
            <a className="studio-delivery" href="#pocket-window">Pocket Window <small>触れる試作 ↑</small></a>
            {delivered.map((receipt) => <div className="studio-delivery" key={receipt.runId}>
              <a href={receipt.prUrl}>{receipt.task}</a>
              <small>{receipt.ciUrl ? <a href={receipt.ciUrl}>CI {workshopCiStates[receipt.ci]}</a> : `CI ${workshopCiStates[receipt.ci]}`}</small>
            </div>)}
          </section>
        </aside>
      </div>

      <details className="studio-paper studio-library" id="studio-library" ref={library}>
        <summary>技術図鑑 <span>{catalog.length}件</span></summary>
        <p>調べたこと、試したこと、採用を決めたものを記録します。出典は開いて確認できます。</p>
        {!catalog.some(({ technology }) => technology.id === pocketTechnology.id) && <>
          <p>Pocket Window に使った Canvas 2D。追加パッケージはありません。 <a href={pocketTechnology.url}>出典を確認</a></p>
          <button className="studio-primary" type="button" disabled={saving}
            onClick={() => void storeTechnology(pocketTechnology, currentId)}>Pocket Window の技術を登録</button>
        </>}
        <div className="studio-library-list">
          {catalog.map((entry) => {
            const item = entry.technology;
            return <article key={`${entry.ownerId}:${item.id}`} className="studio-method">
              <span>{technologyStates[item.status]} · {studioKinds[item.kind]}</span>
              <h3>{item.name}</h3>
              <a href={item.url}>公式・登録出典</a>
              <dl>{(Object.entries(technologyFields) as [keyof typeof technologyFields, string][])
                .filter(([key]) => key !== 'url' && key !== 'name')
                .map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{short(item[key])}</dd></div>)}</dl>
              <div className="studio-actions">
                <button type="button" disabled={saving} onClick={() => editTechnology(entry)}>編集</button>
                <button type="button" onClick={() => void copyPacket(onScout(item), setLibraryMessage, 'Scout / Adopt の調査依頼をコピーしました。')}>Scout / Adopt をコピー</button>
              </div>
            </article>;
          })}
        </div>
        <details ref={libraryEditor} className="studio-library-editor">
          <summary>{editing ? '登録内容を編集' : '技術を登録'}</summary>
          <form className="studio-library-form" key={editing?.technology.id ?? 'new'} onSubmit={saveTechnology}>
            {Object.entries(technologyFields).map(([key, label]) => (
              <label key={key}>{label}<input name={key} type={key === 'url' ? 'url' : 'text'} maxLength={700}
                required={key === 'name' || key === 'url'} defaultValue={editing?.technology[key as keyof typeof technologyFields]} /></label>
            ))}
            <label>分野<select name="kind" defaultValue={editing?.technology.kind ?? 'web'}>
              {Object.entries(studioKinds).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
            <label>検証状況<select name="status" defaultValue={editing?.technology.status ?? 'candidate'}>
              {Object.entries(technologyStates).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
            <div className="studio-actions">
              <button type="submit" className="studio-primary" disabled={saving}>図鑑に保存</button>
              {editing && <button type="button" disabled={saving} onClick={() => setEditing(undefined)}>編集をキャンセル</button>}
            </div>
          </form>
        </details>
        <p className="studio-status" role="status">{libraryMessage}</p>
      </details>
    </main>
  );
}
