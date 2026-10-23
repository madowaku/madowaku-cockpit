import { useMemo, useState } from 'react';
import { rankStyles, buildArtDirection } from './artStyleCompass';
export default function ArtStyleCompass() {
  const [brief,setBrief]=useState('少し不気味だけどかわいい、探索型の2Dゲームを作りたい');
  const [engine,setEngine]=useState<'Godot'|'LittleJS'>('Godot');
  const ranked=useMemo(()=>rankStyles(brief,engine),[brief,engine]);
  const markdown=useMemo(()=>buildArtDirection(brief,engine,ranked),[brief,engine,ranked]);
  return <main style={{maxWidth:980,margin:'0 auto',padding:'32px 20px',fontFamily:'system-ui,sans-serif',color:'var(--text-primary, inherit)'}}>
    <nav><a href="/" style={{color:'inherit'}}>← Cockpit</a></nav>
    <h1>🎨 Art Style Compass</h1>
    <p>ことばで画風を探し、実装コストと配色を比べる。候補は手動キュレーションした仮説で、AI生成の画像や他サイトの画像は収集しません。</p>
    <label htmlFor="style-brief">ゲームの雰囲気・視点・技法</label>
    <textarea id="style-brief" rows={3} value={brief} onChange={e=>setBrief(e.target.value)} style={{display:'block',width:'100%',boxSizing:'border-box',margin:'8px 0 16px',padding:12,font:'inherit'}} />
    <label htmlFor="style-engine">制作エンジン　</label>
    <select id="style-engine" value={engine} onChange={e=>setEngine(e.target.value as 'Godot'|'LittleJS')}><option>Godot</option><option>LittleJS</option></select>
    <section aria-label="画風候補" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginTop:24}}>
      {ranked.map(({profile,matched},i)=><article key={profile.id} style={{border:'1px solid #9996',borderRadius:14,padding:18}}>
        <h2 style={{fontSize:20}}>{i+1}. {profile.name}</h2><p>{profile.summary}</p>
        <div aria-label="パレット" style={{display:'flex',height:48,borderRadius:8,overflow:'hidden'}}>{profile.palette.map(color=><div key={color} title={color} aria-label={color} style={{flex:1,background:color}} />)}</div>
        <p>制作負荷: {profile.effort}/3 · 一致タグ: {matched.join(', ')||'一般候補'}</p>
        <p><a href={profile.referenceUrl} target="_blank" rel="noreferrer">参考サイト ↗</a></p>
      </article>)}
    </section>
    <h2>アートディレクション提案書</h2>
    <button type="button" onClick={()=>void navigator.clipboard.writeText(markdown)}>Markdownをコピー</button>
    <details style={{marginTop:16}}><summary>提案書を表示</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{markdown}</pre></details>
    <p style={{fontSize:13,opacity:.75}}>注意: 候補の画像は引用・複製せず、原作品のライセンスは個別確認。視覚評価と実機確認は未実施です。</p>
  </main>;
}
