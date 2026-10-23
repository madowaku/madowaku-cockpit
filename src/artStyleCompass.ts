export type StyleAxis = 'pixel' | 'lowpoly' | 'handdrawn' | 'cel' | 'limited' | 'moody' | 'cute' | 'isometric' | 'sideview' | 'topdown';
export type StyleProfile = {
  id: string; name: string; summary: string; tags: StyleAxis[];
  palette: string[]; effort: 1 | 2 | 3; engines: ('Godot' | 'LittleJS')[];
  referenceUrl: string; licenseNote: string;
};
export const styleProfiles: StyleProfile[] = [
  { id: 'storybook', name: 'Twilight Storybook', summary: '手描きの輪郭と抑えた色数で、かわいさと不穏さを両立。', tags: ['handdrawn','limited','moody','cute','sideview'], palette: ['#21283e','#6f7997','#c78a87','#e8cfaa'], effort: 3, engines: ['Godot'], referenceUrl: 'https://gameartstyles.com/', licenseNote: '参考URLのみ。画像・素材は転載不可。' },
  { id: 'pixel', name: 'Moonlit Pixel', summary: '少ない色と小さなスプライトで、探索と演出に集中。', tags: ['pixel','limited','moody','cute','topdown'], palette: ['#171c33','#495474','#8a8eb0','#e0c8a2'], effort: 1, engines: ['Godot','LittleJS'], referenceUrl: 'https://gameartstyles.com/', licenseNote: '参考URLのみ。画像・素材は転載不可。' },
  { id: 'lowpoly', name: 'Cozy Miniature', summary: '簡素な形状と柔らかな光による箱庭表現。', tags: ['lowpoly','cute','isometric'], palette: ['#34516b','#73a9ad','#e6c99c','#ed8d76'], effort: 2, engines: ['Godot'], referenceUrl: 'https://gameartstyle.loopyhop.com/', licenseNote: '参考URLのみ。画像・素材は転載不可。' },
  { id: 'comic', name: 'Ink & Shade', summary: 'くっきりした輪郭と段階的な陰影で可読性を確保。', tags: ['cel','handdrawn','sideview'], palette: ['#282b38','#697b86','#de846e','#eecfaf'], effort: 2, engines: ['Godot','LittleJS'], referenceUrl: 'https://gameartstyles.com/', licenseNote: '参考URLのみ。画像・素材は転載不可。' }
];
export const axisTerms: Record<StyleAxis, string[]> = {
  pixel: ['ドット','ピクセル','pixel'], lowpoly: ['ローポリ','low poly','lowpoly','3d','立体'],
  handdrawn: ['手描き','絵本','イラスト','水彩'], cel: ['アニメ','セル','輪郭'],
  limited: ['少ない色','限られた色','シンプル','限定','少色'], moody: ['不気味','暗い','ホラー','不穏','夜','ミステリー'],
  cute: ['かわいい','可愛い','ほのぼの','癒し','cozy'], isometric: ['アイソメ','見下ろし斜め','箱庭'],
  sideview: ['横スク','横視点','横スクロール'], topdown: ['見下ろし','トップダウン','俯瞰']
};
export type RankedStyle = { profile: StyleProfile; score: number; matched: StyleAxis[] };
export function rankStyles(prompt: string, engine?: 'Godot' | 'LittleJS'): RankedStyle[] {
  const normalized = prompt.normalize('NFKC').toLowerCase();
  const requested = (Object.keys(axisTerms) as StyleAxis[]).filter(axis => axisTerms[axis].some(term => normalized.includes(term)));
  return styleProfiles.filter(p => !engine || p.engines.includes(engine))
    .map(profile => { const matched = requested.filter(tag => profile.tags.includes(tag)); return {profile, matched, score: matched.length * 4 + (requested.length ? 0 : 1) - profile.effort * 0.1}; })
    .sort((a,b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id)).slice(0,3);
}
export function buildArtDirection(prompt: string, engine: 'Godot'|'LittleJS', results = rankStyles(prompt,engine)): string {
  return ['# Art Style Direction', '## Brief', prompt.trim() || '（未入力）', '## Engine', engine,
    ...results.map((r,i) => ['## Candidate '+(i+1)+': '+r.profile.name, r.profile.summary,
      'Tags: '+r.profile.tags.join(', '), 'Matched: '+(r.matched.join(', ') || 'none'),
      'Palette: '+r.profile.palette.join(', '), 'Effort: '+r.profile.effort+'/3',
      'Reference: '+r.profile.referenceUrl, r.profile.licenseNote].join('\n')),
    '## Quality gates', '- Original assets only; do not scrape or reproduce reference screenshots.',
    '- Record author/license/source for imported assets before distribution.',
    '- Verify legibility, 16:9 and mobile aspect, color contrast and performance in the real engine.',
    '- Human visual review required before adoption.'].join('\n\n');
}
