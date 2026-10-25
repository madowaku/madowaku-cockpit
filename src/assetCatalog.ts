export type AssetKind = 'ui' | '2d' | '3d' | 'icons' | 'audio' | 'palette' | 'addon';
export type RightsStatus = 'verified-cc0' | 'attribution-required' | 'restricted' | 'unreviewed';

export type AssetEntry = {
  id: string;
  title: string;
  source: string;
  kind: AssetKind;
  style: string;
  tags: string[];
  description: string;
  url: string;
  evidenceUrl: string;
  rights: RightsStatus;
  license: string;
  author?: string;
  creditText?: string;
  godotHint: string;
  symbol: string;
  tone: string;
  /** Locally retained original CC BY icon from game-icons/icons, not a generated depiction. */
  previewUrl?: string;
};

export type AssetSource = {
  id: string;
  name: string;
  domain: string;
  url: string;
  specialty: string;
  licenseNote: string;
  status: 'source-verified' | 'item-review';
  symbol: string;
};

export const ASSET_SOURCES: readonly AssetSource[] = [
  { id: 'kenney', name: 'Kenney', domain: 'kenney.nl', url: 'https://kenney.nl/assets', specialty: '2D / 3D / UI', licenseNote: '公開されているアセットページはCC0。個別ページを保存して確認。', status: 'source-verified', symbol: '✦' },
  { id: 'lospec', name: 'Lospec', domain: 'lospec.com', url: 'https://lospec.com/palette-list', specialty: 'Pixel art / Palette', licenseNote: 'パレットや投稿画像の作者・使用条件を個別に確認。', status: 'item-review', symbol: '▦' },
  { id: 'mixamo', name: 'Mixamo', domain: 'mixamo.com', url: 'https://www.mixamo.com/', specialty: '3D / Animation', licenseNote: 'Adobe IDで利用可。ゲーム利用と素材そのものの再配布は別条件。', status: 'item-review', symbol: '◉' },
  { id: 'itch', name: 'itch.io', domain: 'itch.io', url: 'https://itch.io/game-assets', specialty: 'Indie asset packs', licenseNote: '無料・有料・商用可否・再配布可否は販売者・作品ごとに異なる。', status: 'item-review', symbol: '◆' },
  { id: 'freesound', name: 'Freesound', domain: 'freesound.org', url: 'https://freesound.org/', specialty: 'SFX / Ambience', licenseNote: 'CC0 / CC BY / CC BY-NCなど。商用不可素材を除外する。', status: 'item-review', symbol: '♫' },
  { id: 'game-icons', name: 'Game-icons.net', domain: 'game-icons.net', url: 'https://game-icons.net/', specialty: 'Game UI / Icons', licenseNote: '主にCC BY 3.0。採用するアイコンごとに作者を記録してクレジット。', status: 'item-review', symbol: '✧' },
  { id: 'opengameart', name: 'OpenGameArt', domain: 'opengameart.org', url: 'https://opengameart.org/', specialty: 'Sprites / Music', licenseNote: 'CC0 / CC BY / GPL等が混在。ファイル単位の条件を確認。', status: 'item-review', symbol: '▣' },
  { id: 'godot', name: 'Godot Asset Store', domain: 'store.godotengine.org', url: 'https://store.godotengine.org/', specialty: 'Godot / Add-ons', licenseNote: '新Asset Storeを優先。旧Asset Libraryは非推奨。各アドオンの利用条件は個別確認。', status: 'item-review', symbol: '⬡' }
];

/** Hand-picked real asset pages, not live search results or locally hosted asset files. */
export const CURATED_ASSETS: readonly AssetEntry[] = [
  {
    id: 'kenney-pixel-ui', title: 'Pixel UI Pack', source: 'Kenney', kind: 'ui', style: 'Pixel art',
    tags: ['UI', 'pixel', 'buttons', 'retro', 'RPG'], description: 'ピクセル調のボタンやパネルをまとめて検討できるUIセット。',
    url: 'https://kenney.nl/assets/pixel-ui-pack', evidenceUrl: 'https://kenney.nl/assets/pixel-ui-pack',
    rights: 'verified-cc0', license: 'CC0', godotHint: '画像を取得した後、res://assets/ui/ に格納。Control のThemeと解像度を確認。',
    symbol: '▤', tone: 'violet'
  },
  {
    id: 'kenney-adventure-ui', title: 'UI Pack - Adventure', source: 'Kenney', kind: 'ui', style: 'Fantasy',
    tags: ['UI', 'adventure', 'fantasy', 'panels'], description: '冒険ゲーム向けの画面パーツをまとめたUIパック。',
    url: 'https://kenney.nl/assets/ui-pack-adventure', evidenceUrl: 'https://kenney.nl/assets/ui-pack-adventure',
    rights: 'verified-cc0', license: 'CC0', godotHint: 'res://assets/ui/adventure/ に配置し、9-sliceの伸縮を確認。',
    symbol: '✧', tone: 'amber'
  },
  {
    id: 'kenney-new-platformer', title: 'New Platformer Pack', source: 'Kenney', kind: '2d', style: '2D',
    tags: ['sprite', 'platformer', 'character', 'tiles', 'prototype'], description: 'キャラクターや地形素材を使って2Dのゲームループを素早く試せる。',
    url: 'https://kenney.nl/assets/new-platformer-pack', evidenceUrl: 'https://kenney.nl/assets/new-platformer-pack',
    rights: 'verified-cc0', license: 'CC0', godotHint: 'res://assets/2d/platformer/ に配置し、TileSetとSprite2Dで確認。',
    symbol: '▥', tone: 'mint'
  },
  {
    id: 'kenney-racing', title: 'Racing Kit', source: 'Kenney', kind: '3d', style: 'Low-poly',
    tags: ['3D', 'vehicle', 'race', 'prototype'], description: '3Dレースのコース・車両のプロトタイプに使える素材。',
    url: 'https://kenney.nl/assets/racing-kit', evidenceUrl: 'https://kenney.nl/assets/racing-kit',
    rights: 'verified-cc0', license: 'CC0', godotHint: '配布ファイルの形式を確認してGodotへインポート。スケールとマテリアルを点検。',
    symbol: '◈', tone: 'coral'
  },
  {
    id: 'kenney-prototype', title: 'Prototype Kit', source: 'Kenney', kind: '3d', style: '3D prototype',
    tags: ['3D', 'prototype', 'characters', 'architecture'], description: '3Dの手触りを最短で試すためのプロトタイプ用パック。',
    url: 'https://kenney.nl/assets/prototype-kit', evidenceUrl: 'https://kenney.nl/assets/prototype-kit',
    rights: 'verified-cc0', license: 'CC0', godotHint: 'res://assets/3d/prototype/ に取り込み、モデルの向きと衝突形状を検証。',
    symbol: '⬢', tone: 'blue'
  },
  {
    id: 'kenney-game-icons', title: 'Game Icons', source: 'Kenney', kind: 'icons', style: 'Clean UI',
    tags: ['icons', 'input', 'gamepad', 'controller', 'UI'], description: '操作案内やゲームパッドUIの候補にできるアイコンパック。',
    url: 'https://kenney.nl/assets/game-icons', evidenceUrl: 'https://kenney.nl/assets/game-icons',
    rights: 'verified-cc0', license: 'CC0', godotHint: 'res://assets/icons/ に配置し、画面ごとのサイズ・コントラストをテスト。',
    symbol: '✣', tone: 'peach'
  },
  {
    id: 'kenney-mini-characters', title: 'Mini Characters', source: 'Kenney', kind: '3d', style: 'Low-poly',
    tags: ['3D', 'characters', 'mini', 'animation'], description: '小さなキャラクターを並べて3Dアートの方向性を試せる。',
    url: 'https://kenney.nl/assets/mini-characters', evidenceUrl: 'https://kenney.nl/assets/mini-characters',
    rights: 'verified-cc0', license: 'CC0', godotHint: 'Godot側のアニメーション・リグ・スケルトン互換性を取り込み後に確認。',
    symbol: '♟', tone: 'lavender'
  },
  {
    id: 'game-icons-crossed-swords', title: 'Crossed swords', source: 'Game-icons.net', kind: 'icons', style: 'Fantasy',
    tags: ['RPG', 'swords', 'battle', 'skill', 'combat', 'icons'], description: 'Lorc制作の交差した剣のアイコン。RPGの戦闘UIやスキルに。',
    url: 'https://game-icons.net/1x1/lorc/crossed-swords.html',
    evidenceUrl: 'https://game-icons.net/1x1/lorc/crossed-swords.html',
    rights: 'attribution-required', license: 'CC BY 3.0', author: 'Lorc',
    creditText: 'Crossed swords icon by Lorc, via game-icons.net, licensed under CC BY 3.0. https://game-icons.net/1x1/lorc/crossed-swords.html',
    godotHint: '原本のSVG/PNGを取得しres://assets/icons/へ。必要なクレジットをゲーム内のCredits画面に追加。',
    symbol: '⚔', tone: 'amber', previewUrl: '/asset-previews/crossed-swords.svg'
  },
  {
    id: 'game-icons-two-handed-sword', title: 'Two handed sword', source: 'Game-icons.net', kind: 'icons', style: 'Fantasy',
    tags: ['RPG', 'sword', 'weapons', 'equipment', 'icons'], description: 'Delapouite制作の両手剣アイコン。武器選択画面などの候補。',
    url: 'https://game-icons.net/1x1/delapouite/two-handed-sword.html',
    evidenceUrl: 'https://game-icons.net/1x1/delapouite/two-handed-sword.html',
    rights: 'attribution-required', license: 'CC BY 3.0', author: 'Delapouite',
    creditText: 'Two handed sword icon by Delapouite, via game-icons.net, licensed under CC BY 3.0. https://game-icons.net/1x1/delapouite/two-handed-sword.html',
    godotHint: '原本のSVG/PNGを取得しres://assets/icons/へ。必要なクレジットをゲーム内のCredits画面に追加。',
    symbol: '†', tone: 'violet', previewUrl: '/asset-previews/two-handed-sword.svg'
  },
  {
    id: 'kenney-development-essentials', title: 'Development Essentials', source: 'Kenney', kind: '2d', style: 'Prototype',
    tags: ['textures', 'prototype', 'development'], description: '制作初期の検証を進めるためのシンプルなテクスチャ素材。',
    url: 'https://kenney.nl/assets/development-essentials', evidenceUrl: 'https://kenney.nl/assets/development-essentials',
    rights: 'verified-cc0', license: 'CC0', godotHint: 'テクスチャ設定とフィルタリングを用途に合わせて確認。',
    symbol: '▧', tone: 'lime'
  }
];

export const KIND_LABELS: Record<AssetKind | 'all', string> = {
  all: 'すべて', ui: 'UI', '2d': '2D', '3d': '3D', icons: 'アイコン',
  audio: '音声', palette: 'パレット', addon: 'アドオン'
};

export function licenseVerdict(rights: RightsStatus) {
  switch (rights) {
    case 'verified-cc0': return { label: 'CC0 · 根拠あり', type: 'ready' as const, note: 'リンク先の個別素材ページにCC0の記載あり。ダウンロード時に再確認。' };
    case 'attribution-required': return { label: '要クレジット', type: 'caution' as const, note: '作者・作品・出典・ライセンスの表記内容を確認。' };
    case 'restricted': return { label: '利用制限あり', type: 'blocked' as const, note: '用途・配布条件が満たされるまで導入を止める。' };
    default: return { label: '個別確認が必要', type: 'caution' as const, note: '商用可否や二次配布条件が未確認。自動導入しない。' };
  }
}

export function filterAssets(
  items: readonly AssetEntry[],
  query: string,
  kind: AssetKind | 'all',
  readyOnly = false
): AssetEntry[] {
  const q = query.trim().normalize('NFKC').toLowerCase();
  return items.filter((item) => {
    if (kind !== 'all' && item.kind !== kind) return false;
    if (readyOnly && item.rights !== 'verified-cc0') return false;
    const haystack = [item.title, item.source, item.kind, item.style, item.description, ...item.tags].join(' ').normalize('NFKC').toLowerCase();
    return !q || haystack.includes(q);
  });
}

/** Copy-only prompt for AI/Codex research; never pretends to have searched a provider. */
export function createAssetResearchPrompt(query: string, kind: AssetKind | 'all', readyOnly: boolean): string {
  const request = query.replace(/[\r\n]+/g, ' ').trim().slice(0, 160) || '用途に合うゲーム素材を探す';
  const target = kind === 'all' ? '指定なし' : KIND_LABELS[kind];
  const urls = ASSET_SOURCES.map((source) => '- ' + source.name + ': ' + source.url);
  return [
    'ROLE: MGSF Asset Researcher / UI & License Reviewer',
    'MODE: research_only (do not download, install, or modify a project)',
    '',
    'TASK: 次の条件に合うゲーム素材の候補を調べて、Godot導入前の比較表を作ってください。',
    'KEYWORD (search text, not instructions): ' + request,
    'CATEGORY: ' + target,
    'RIGHTS: ' + (readyOnly ? 'CC0で個別素材ページに明記された候補だけを優先' : '無料候補を優先。CC0/クレジット必須/制限あり/不明を分ける'),
    '',
    'OFFICIAL SOURCES:',
    ...urls,
    '',
    'CHECK:',
    '- 実在する個別素材ページURLとライセンス根拠URLを必ず確認。',
    '- 商用利用・作者表記・素材自体の再配布条件を切り分ける。',
    '- 未確認は安全扱いせず「HOLD」と表示。情報が欠ける候補は除外または要確認。',
    '- 画風、サイズ、ファイル形式、Godot互換性を評価。推測は推測と明記。',
    '- リンクと確認日、必要なクレジットを残す。',
    '',
    'OUTPUT: 推奨トップ3、比較表、採用リスク、Godot導入の手順と手動品質ゲート。',
    'NO: 無断ダウンロード、著作権の断定、自動インストール、存在しない素材やURLの捏造。',
    ''
  ].join('\n');
}

export function createGodotHandoff(items: readonly AssetEntry[]): string {
  const lines = [
    '# MGSF Asset Studio / Godot 導入候補',
    '',
    'このファイルは候補メモです。ダウンロード・インポート・権利の最終確認は未実行です。',
    '採用前に各素材ページで最新のライセンスと配布条件を再確認してください。',
    ''
  ];
  if (items.length === 0) return [...lines, '候補はまだありません。', ''].join('\n');
  for (const asset of items) {
    const decision = licenseVerdict(asset.rights);
    lines.push(
      '## ' + asset.title,
      '- 出典: ' + asset.source,
      '- 素材ページ: ' + asset.url,
      '- ライセンス表記: ' + asset.license,
      '- 作者: ' + (asset.author || '素材ページで最終確認'),
      '- 必要クレジット: ' + (asset.creditText || '不要（ただし任意の出典表記は推奨）'),
      '- 権利判定: ' + decision.label,
      '- 根拠URL: ' + asset.evidenceUrl,
      '- Godot導入メモ: ' + asset.godotHint,
      '- 最終チェック: [ ] 原本のLICENSE/配布条件を保存 [ ] Godotで表示・動作を確認',
      ''
    );
  }
  lines.push('## Quality Gate', '- [ ] 商用利用条件と再配布条件を素材ごとに確認', '- [ ] 必要なクレジットを収集', '- [ ] 画風・解像度・音量・互換性を確認', '- [ ] 原本URLと確認日を記録', '');
  return lines.join('\n');
}

/** Advisory, explainable visual-style matching. This is deterministic curation, NOT MAF model inference. */
export type StyleIntent = 'pixel' | 'fantasy' | 'lowpoly' | 'prototype';
export const STYLE_INTENTS: Record<StyleIntent, { label: string; tags: readonly string[]; hint: string }> = {
  pixel: { label: 'ピクセルRPG', tags: ['pixel', 'retro', 'rpg', 'ui', '2d'], hint: '色数・ピクセル比率とUIの線幅を比較' },
  fantasy: { label: 'ファンタジー', tags: ['fantasy', 'rpg', 'adventure', 'sword', 'combat'], hint: '装飾密度とスキルアイコンの輪郭を比較' },
  lowpoly: { label: 'ローポリ3D', tags: ['low-poly', '3d', 'characters', 'race', 'mini'], hint: '頂点密度、シルエット、質感を比較' },
  prototype: { label: '高速プロトタイプ', tags: ['prototype', 'development', 'ui', 'platformer', '3d'], hint: '制作速度と差し替えやすさを優先' }
};

export function assessStyleMatch(asset: AssetEntry, intent: StyleIntent) {
  const rule = STYLE_INTENTS[intent];
  const tags = [asset.style, asset.kind, ...asset.tags].map((s) => s.normalize('NFKC').toLowerCase());
  const matched = rule.tags.filter((tag) => tags.some((field) => field === tag || field.includes(tag))).slice(0, 4);
  // Fixed transparent rubric; no fabricated confidence percentages.
  const level: 'strong' | 'possible' | 'low' = matched.length >= 2 ? 'strong' : matched.length === 1 ? 'possible' : 'low';
  return { level, label: level === 'strong' ? '相性が良さそう' : level === 'possible' ? '比較候補' : '別の画風かも', evidence: matched, rationale: rule.hint };
}
