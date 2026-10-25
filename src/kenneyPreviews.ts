/**
 * Original CC0 PNG samples, NOT whole-pack screenshots.
 * Binary files are pinned from shorepine/kenney's Kenney CC0 collection;
 * individual original Git blob SHA is the same SHA recorded below.
 * All original URLs and source paths are reviewable in the manifest.
 */
export type PreviewSample = { src: string; sourcePath: string; blobSha: string; label: string };
export type PreviewGallery = { source: 'Kenney CC0'; collection: string; samples: readonly PreviewSample[] };

const source = (name: string, sourcePath: string, blobSha: string, label: string): PreviewSample => ({
  src: '/asset-previews/kenney/' + name + '.png', sourcePath, blobSha, label
});

export const KENNEY_PREVIEWS: Readonly<Record<string, PreviewGallery>> = {
  'kenney-adventure-ui': { source: 'Kenney CC0', collection: 'UI Pack - Adventure', samples: [
    source('kenney-adventure-button', 'ui/UI Pack - Adventure/button_red.png', 'd5c80f09cba80eea8befccabacbad925f7e61ac0', '赤いボタン'),
    source('kenney-adventure-banner', 'ui/UI Pack - Adventure/banner_hanging.png', '42a3b17240265c91ca98c206004aa57871d3a58f', '吊り下げバナー')
  ]},
  'kenney-new-platformer': { source: 'Kenney CC0', collection: 'New Platformer Pack', samples: [
    source('kenney-platformer-character','2d/New Platformer Pack/Sprites/Characters/character_pink_idle.png','ae3e8b7a249208f2d267b5a69dcadae38338be13','ピンクのキャラクター'),
    source('kenney-platformer-coin','2d/New Platformer Pack/Sprites/Tiles/coin_gold.png','344397ebd604eaa04170d4c63a23a3ae16106778','金貨'),
    source('kenney-platformer-block','2d/New Platformer Pack/Sprites/Tiles/block_exclamation.png','fae233af2f1bdfc1dbd8d1a7a278daba99b96fcd','びっくりブロック')
  ]},
  'kenney-game-icons': { source: 'Kenney CC0', collection: 'Game Icons', samples: [
    source('kenney-gamepad','icons/Game Icons/Black/2x/gamepad.png','5af52e5c3bd7b167fcf7fa3f039610f269b7dc98','ゲームパッド'),
    source('kenney-controller-a','icons/Game Icons/Black/2x/buttonA.png','5719085cd6a498fba01e778a02efbb5c3658cb0f','Aボタン'),
    source('kenney-gear','icons/Game Icons/Black/2x/gear.png','21082aa4fe0fe5840b08ee72089692821baee68c','歯車')
  ]},
  'kenney-development-essentials': { source: 'Kenney CC0', collection: 'Development Essentials', samples: [
    source('kenney-checker','2d/Development Essentials/Checkerboard/checkerboard.png','bf2f97e6c3910429bb173c56b2e098bc04b5aeba','チェッカーボード')
  ]},
  'kenney-pixel-adventure-ui': { source: 'Kenney CC0', collection: 'UI Pack - Pixel Adventure', samples: [
    source('kenney-pixel-ui-0','ui/UI Pack - Pixel Adventure/Tiles/Large tiles/Thick outline/tile_0000.png','a807529c7bb5dcb9384834adc09d4273c1513a87','装飾タイル1'),
    source('kenney-pixel-ui-5','ui/UI Pack - Pixel Adventure/Tiles/Large tiles/Thick outline/tile_0005.png','da6d16df71615337f02271a036d516a407064d90','装飾タイル2'),
    source('kenney-pixel-ui-31','ui/UI Pack - Pixel Adventure/Tiles/Large tiles/Thick outline/tile_0031.png','78440e89a93d1d9a41d14d64391334a318b93bf1','装飾タイル3')
  ]},
  'kenney-ui-pack': { source: 'Kenney CC0', collection: 'UI Pack', samples: [
    source('kenney-ui-blue-button','ui/UI Pack/Blue/button_rectangle_depth_flat.png','d9492b4e48b28823c81b3bc08a1b31156f68c79c','青いボタン')
  ]}
};

export const kenneyPreviewCount = Object.values(KENNEY_PREVIEWS).reduce((count, entry) => count + entry.samples.length, 0);
export const getPreviewGallery = (assetId: string): PreviewGallery | undefined => KENNEY_PREVIEWS[assetId];
