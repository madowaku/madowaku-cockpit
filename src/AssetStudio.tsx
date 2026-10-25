import { useEffect, useMemo, useState } from 'react';
import {
  ASSET_SOURCES,
  CURATED_ASSETS,
  KIND_LABELS,
  createGodotHandoff,
  createAssetResearchPrompt,
  filterAssets,
  licenseVerdict,
  type AssetKind
} from './assetCatalog';
import './asset-studio.css';

type Props = { onBack: () => void };
const shortlistKey = 'madowaku-mgsf-asset-studio-shortlist-v1';
const categories: (AssetKind | 'all')[] = ['all', 'ui', '2d', '3d', 'icons'];

function loadShortlist(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(shortlistKey) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set(CURATED_ASSETS.map((item) => item.id));
    return [...new Set(parsed.filter((id): id is string => typeof id === 'string' && allowed.has(id)))];
  } catch {
    return [];
  }
}

function saveMarkdown(note: string) {
  const url = URL.createObjectURL(new Blob([note], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mgsf-asset-studio-godot-handoff.md';
  link.click();
  URL.revokeObjectURL(url);
}

export default function AssetStudio({ onBack }: Props) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<AssetKind | 'all'>('all');
  const [readyOnly, setReadyOnly] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>(loadShortlist);
  const [selectedId, setSelectedId] = useState(CURATED_ASSETS[0].id);
  const [feedback, setFeedback] = useState('');

  const matches = useMemo(() => filterAssets(CURATED_ASSETS, query, kind, readyOnly), [query, kind, readyOnly]);
  const selected = CURATED_ASSETS.find((item) => item.id === selectedId) ?? CURATED_ASSETS[0];
  const chosen = CURATED_ASSETS.filter((item) => shortlist.includes(item.id));
  const handoff = useMemo(() => createGodotHandoff(chosen), [shortlist]);
  const openIssues = chosen.filter((item) => licenseVerdict(item.rights).type !== 'ready').length;

  useEffect(() => {
    try {
      localStorage.setItem(shortlistKey, JSON.stringify(shortlist));
    } catch {
      setFeedback('ブラウザ保存が使えません。導入メモをファイルに書き出してください。');
    }
  }, [shortlist]);

  function toggleSave(id: string) {
    const wasSaved = shortlist.includes(id);
    setShortlist((current) => wasSaved ? current.filter((currentId) => currentId !== id) : [...current, id]);
    setFeedback(wasSaved ? '候補から外しました。' : '選定トレイに追加しました。');
  }

  async function copyHandoff() {
    try {
      await navigator.clipboard.writeText(handoff);
      setFeedback('Godot導入メモをコピーしました。');
    } catch {
      setFeedback('クリップボードが使えません。Markdownを書き出してください。');
    }
  }

  async function copyResearchPrompt() {
    try {
      await navigator.clipboard.writeText(createAssetResearchPrompt(query, kind, readyOnly));
      setFeedback('8サイト向けのAI調査指示をコピーしました。CodexやClaude Codeに貼り付けて使えます。');
    } catch {
      setFeedback('コピーできませんでした。ブラウザのクリップボード権限を確認してください。');
    }
  }

  function resetSearch() {
    setQuery('');
    setKind('all');
    setReadyOnly(false);
  }

  return (
    <div className="asset-studio">
      <a className="asset-skip" href="#asset-results">素材一覧へスキップ</a>
      <header className="asset-topbar">
        <button className="asset-back" onClick={onBack} type="button" aria-label="Cockpitに戻る">
          <span aria-hidden="true">←</span> Cockpit に戻る
        </button>
        <div className="asset-wordmark" aria-label="madowaku Asset Studio">
          <span className="asset-mark" aria-hidden="true">✳</span>
          <div><strong>madowaku<span className="asset-wordmark-accent">.</span></strong><small>ASSET STUDIO / MGSF</small></div>
        </div>
        <div className="asset-topmeta"><span className="asset-live-dot" /> LOCAL-FIRST <span className="asset-topmeta-divider">/</span> M1.5 PILOT</div>
      </header>

      <main className="asset-page">
        <section className="asset-hero" aria-labelledby="asset-hero-title">
          <div className="asset-hero-copy">
            <p className="asset-eyebrow"><span className="asset-index">01</span> THE CREATIVE RESOURCE DESK</p>
            <h1 id="asset-hero-title">アイデアに、<br /><span>ちょうどいい素材を。</span></h1>
            <p className="asset-hero-description">探す時間を、つくる時間へ。素材の発見から権利の確認、Godotへの引き継ぎまで、ひとつの場所で。</p>
            <div className="asset-hero-actions">
              <a className="asset-primary-link" href="#asset-results">素材を見つける <span aria-hidden="true">↘</span></a>
              <a className="asset-secondary-link" href="#asset-sources">ソースを探索 <span aria-hidden="true">↗</span></a>
            </div>
            <p className="asset-hero-footnote"><span aria-hidden="true">●</span> 無料の厳選カタログ ・ 外部API不要 ・ 検証可能な出典</p>
          </div>
          <div className="asset-hero-art" aria-hidden="true">
            <div className="asset-art-grid" />
            <div className="asset-art-shape asset-art-shape-one">✽</div>
            <div className="asset-art-shape asset-art-shape-two">▰</div>
            <div className="asset-art-shape asset-art-shape-three">✦</div>
            <div className="asset-art-center"><span>AS</span><small>FIND<br />CURATE<br />CREATE</small></div>
            <div className="asset-art-label asset-art-label-one">100% CURATED</div>
            <div className="asset-art-label asset-art-label-two">NO GUESSWORK</div>
          </div>
        </section>

        <div className="asset-flow-strip" aria-label="素材利用の手順">
          <div><span>01 / DISCOVER</span><strong>素材を探す</strong></div>
          <span className="asset-flow-arrow" aria-hidden="true">→</span>
          <div><span>02 / VERIFY</span><strong>利用条件を確認</strong></div>
          <span className="asset-flow-arrow" aria-hidden="true">→</span>
          <div><span>03 / HANDOFF</span><strong>Godotへ引き継ぐ</strong></div>
          <span className="asset-flow-stamp">HUMAN IN CONTROL</span>
        </div>

        <section className="asset-library" id="asset-results" aria-labelledby="asset-results-heading">
          <div className="asset-section-head">
            <div>
              <p className="asset-section-kicker">THE COLLECTION <span> / 厳選素材</span></p>
              <h2 id="asset-results-heading">素材を選ぶ<span className="asset-heading-period">.</span></h2>
              <p>実在する素材パック・アイコンの個別ページを登録。検索はこの厳選カタログ内で行います。</p>
            </div>
            <div className="asset-section-count"><strong>{matches.length.toString().padStart(2, '0')}</strong><span>PACKS FOUND</span></div>
          </div>

          <div className="asset-search-bar">
            <label className="asset-search-field">
              <span className="asset-search-label">KEYWORD SEARCH</span>
              <span className="asset-search-input-wrap"><span aria-hidden="true">⌕</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                  placeholder="例：pixel, RPG, UI, 3D..." aria-label="素材キーワード検索" />
              </span>
            </label>
            <label className="asset-license-toggle">
              <input type="checkbox" checked={readyOnly} onChange={(event) => setReadyOnly(event.target.checked)} />
              <span className="asset-toggle-track" aria-hidden="true"><span /></span>
              <span className="asset-toggle-copy"><strong>CC0のみ</strong><small>根拠URLがあるもの</small></span>
            </label>
          </div>
          <div className="asset-filters" role="group" aria-label="素材カテゴリ">
            {categories.map((category) => (
              <button key={category} type="button" aria-pressed={kind === category}
                className={kind === category ? 'asset-filter active' : 'asset-filter'}
                onClick={() => setKind(category)}>
                {KIND_LABELS[category]} <span>{category === 'all' ? CURATED_ASSETS.length : CURATED_ASSETS.filter((asset) => asset.kind === category).length}</span>
              </button>
            ))}
            <span className="asset-filter-hint">サンプル画像ではなく装飾イラストを表示しています</span>
          </div>

          <div className="asset-research-guide">
            <div><span>BEYOND THE CATALOG</span><strong>ここにない素材も、AIと探せる。</strong>
              <p>検索条件をもとに、8サイトの調査・ライセンス確認・Godot互換性評価を指示するプロンプトを作ります。実際の検索はCodexやClaude Codeに渡して実行します。</p>
            </div>
            <button type="button" onClick={() => void copyResearchPrompt()}>AI調査指示をコピー <span aria-hidden="true">↗</span></button>
          </div>

          <div className="asset-main-grid">
            <div className="asset-results-grid">
              {matches.length === 0 ? (
                <div className="asset-empty">
                  <span aria-hidden="true">◎</span>
                  <h3>まだ見つかりませんでした</h3>
                  <p>別の単語を試すか、下の8つの素材サイトから探してみましょう。</p>
                  <button type="button" onClick={resetSearch}>フィルタをリセット →</button>
                </div>
              ) : matches.map((asset, index) => {
                const saved = shortlist.includes(asset.id);
                const verdict = licenseVerdict(asset.rights);
                return (
                  <article className={selectedId === asset.id ? 'asset-card asset-card-selected' : 'asset-card'} key={asset.id}>
                    <div className={'asset-card-visual asset-tone-' + asset.tone} aria-label="装飾イラスト。実際の素材画像ではありません">
                      <span className="asset-card-visual-count">A/{String(index + 1).padStart(2, '0')}</span>
                      <span className="asset-card-symbol" aria-hidden="true">{asset.symbol}</span>
                      <span className="asset-card-watermark" aria-hidden="true">{asset.kind.toUpperCase()}</span>
                    </div>
                    <div className="asset-card-body">
                      <div className="asset-card-meta"><span>{asset.source} / {asset.style}</span><span className={verdict.type === 'ready' ? 'asset-license-mark' : 'asset-license-mark asset-license-caution'}>{verdict.label}</span></div>
                      <h3>{asset.title}</h3>
                      <p>{asset.description}</p>
                      <div className="asset-tags">{asset.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                      <div className="asset-card-actions">
                        <button type="button" className="asset-outline-button" onClick={() => setSelectedId(asset.id)}
                          aria-label={asset.title + 'の詳細を表示'} aria-current={selectedId === asset.id ? 'true' : undefined}>詳細を見る <span aria-hidden="true">↗</span></button>
                        <button type="button" className={saved ? 'asset-save-button saved' : 'asset-save-button'}
                          aria-label={asset.title + (saved ? 'を候補から外す' : 'を候補に追加')} aria-pressed={saved}
                          onClick={() => toggleSave(asset.id)}>{saved ? '✓ 追加済み' : '+ 候補に追加'}</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="asset-side" aria-label="素材詳細と選定トレイ">
              <section className="asset-inspector">
                <div className="asset-panel-top"><span>DETAIL / SELECTED</span><span className="asset-panel-asterisk">✳</span></div>
                <h3>{selected.title}</h3>
                <span className={licenseVerdict(selected.rights).type === 'ready' ? 'asset-verdict-ready' : 'asset-verdict-caution'}>{licenseVerdict(selected.rights).label}</span>
                <p className="asset-inspector-note">{licenseVerdict(selected.rights).note}</p>
                <dl>
                  <div><dt>出典</dt><dd>{selected.source}</dd></div>
                  <div><dt>ジャンル</dt><dd>{KIND_LABELS[selected.kind]}</dd></div>
                  <div><dt>表示ライセンス</dt><dd>{selected.license}</dd></div>
                </dl>
                {selected.creditText && <div className="asset-credit-note"><strong>必要なクレジット（候補）</strong><p>{selected.creditText}</p></div>}
                <p className="asset-inspector-heading">GODOT IMPORT NOTE</p>
                <p className="asset-godot-note">{selected.godotHint}</p>
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="asset-source-cta">素材ページを開く <span aria-hidden="true">↗</span></a>
                <a href={selected.evidenceUrl} target="_blank" rel="noopener noreferrer" className="asset-evidence-link">ライセンス根拠を確認する ↗</a>
              </section>

              <section className="asset-tray" aria-labelledby="asset-tray-heading">
                <div className="asset-tray-head"><span>MY SHORTLIST</span><span className="asset-tray-number">{chosen.length.toString().padStart(2, '0')}</span></div>
                <h3 id="asset-tray-heading">選定トレイ</h3>
                <p>候補をためて、Godot向けの確認メモに変換。</p>
                {chosen.length ? (
                  <ul className="asset-tray-list">
                    {chosen.map((asset) => <li key={asset.id}><span><strong>{asset.title}</strong><small>{asset.source} / {asset.license}</small></span>
                      <button type="button" onClick={() => toggleSave(asset.id)} aria-label={asset.title + 'を削除'}>×</button></li>)}
                  </ul>
                ) : <p className="asset-tray-empty">気になる素材の「+ 候補に追加」を押すと、ここに並びます。</p>}
                {openIssues > 0 && <p className="asset-rights-warning" role="alert">要確認の素材が{openIssues}件あります。権利条件が揃うまで自動導入しません。</p>}
                <div className="asset-tray-buttons">
                  <button type="button" className="asset-tray-primary" disabled={!chosen.length} onClick={() => void copyHandoff()}>導入メモをコピー <span aria-hidden="true">↗</span></button>
                  <button type="button" className="asset-tray-secondary" disabled={!chosen.length} onClick={() => { saveMarkdown(handoff); setFeedback('Markdownを書き出しました。'); }}>Markdownに保存 ↓</button>
                </div>
                <small className="asset-tray-footnote">候補はこのブラウザに保存。素材ファイルのDLやGodotへの書き込みは行いません。</small>
              </section>
            </aside>
          </div>
        </section>

        <section className="asset-providers" id="asset-sources" aria-labelledby="asset-providers-heading">
          <div className="asset-section-head">
            <div><p className="asset-section-kicker">THE SOURCE MAP <span>/ 外部リソース</span></p>
              <h2 id="asset-providers-heading">探索先は、8つ<span className="asset-heading-period">.</span></h2>
              <p>用途に応じて公式サイトへ。サイトの共通方針と個別素材の利用許可は別物です。</p>
            </div>
            <span className="asset-source-chip">DIRECTORY / NOT LIVE SEARCH</span>
          </div>
          <div className="asset-providers-grid">
            {ASSET_SOURCES.map((source, index) => (
              <article className="asset-provider" key={source.id}>
                <div className="asset-provider-head"><span className="asset-provider-index">{String(index + 1).padStart(2, '0')}</span><span className="asset-provider-glyph" aria-hidden="true">{source.symbol}</span></div>
                <h3>{source.name}</h3><p className="asset-provider-category">{source.specialty}</p>
                <p className="asset-provider-license">{source.licenseNote}</p>
                <div className="asset-provider-bottom"><span className={source.status === 'source-verified' ? 'asset-source-status verified' : 'asset-source-status'}>{source.status === 'source-verified' ? '公式CC0方針' : '個別確認'}</span>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={source.name + 'の公式サイトを開く'}>訪問 <span aria-hidden="true">↗</span></a></div>
              </article>
            ))}
          </div>
        </section>

        <footer className="asset-footer"><span>✳ madowaku / ASSET STUDIO</span><p>DISCOVER WELL. CREDIT RIGHT. MAKE MORE.</p><span>© MGSF M1.5 • LOCAL PILOT</span></footer>
      </main>
      <p className="asset-announcer" role="status" aria-live="polite">{feedback}</p>
    </div>
  );
}
