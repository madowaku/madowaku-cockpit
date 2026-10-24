import { describe, expect, it } from 'vitest';
import { ASSET_SOURCES, CURATED_ASSETS, createGodotHandoff, filterAssets, licenseVerdict, type AssetEntry } from './assetCatalog';

describe('MGSF Asset Studio catalog', () => {
  it('covers all eight source portals and never labels source-wide terms as per-item approval', () => {
    expect(ASSET_SOURCES).toHaveLength(8);
    expect(new Set(ASSET_SOURCES.map((source) => source.id)).size).toBe(8);
    expect(ASSET_SOURCES.filter((source) => source.status === 'source-verified').map((source) => source.id)).toEqual(['kenney']);
  });

  it('keeps provenance for every curated pack and avoids invented local files', () => {
    expect(CURATED_ASSETS.length).toBeGreaterThan(5);
    for (const item of CURATED_ASSETS) {
      expect(item.url).toMatch(/^https:\/\/kenney\.nl\/assets\//);
      expect(item.evidenceUrl).toBe(item.url);
      expect(item.rights).toBe('verified-cc0');
      expect(item.license).toBe('CC0');
    }
  });

  it('filters by text and category without rewriting source data', () => {
    const originalCount = CURATED_ASSETS.length;
    expect(filterAssets(CURATED_ASSETS, ' RACING ', '3d').map((asset) => asset.id)).toEqual(['kenney-racing']);
    expect(filterAssets(CURATED_ASSETS, '', 'ui').length).toBe(2);
    expect(filterAssets(CURATED_ASSETS, 'unmatched', 'all')).toEqual([]);
    expect(CURATED_ASSETS).toHaveLength(originalCount);
  });

  it('never silently approves unknown, restricted or attribution-required material', () => {
    expect(licenseVerdict('unreviewed').type).toBe('caution');
    expect(licenseVerdict('restricted').type).toBe('blocked');
    expect(licenseVerdict('attribution-required').type).toBe('caution');
    expect(licenseVerdict('verified-cc0').type).toBe('ready');
    const unreviewed: AssetEntry = { ...CURATED_ASSETS[0], id: 'unknown', rights: 'unreviewed' };
    expect(filterAssets([unreviewed, CURATED_ASSETS[0]], '', 'all', true)).toEqual([CURATED_ASSETS[0]]);
  });

  it('exports URL, rights evidence, human checks and Godot handoff, not a claim of import', () => {
    const note = createGodotHandoff([CURATED_ASSETS[0]]);
    expect(note).toContain(CURATED_ASSETS[0].url);
    expect(note).toContain('根拠URL:');
    expect(note).toContain('未実行');
    expect(note).toContain('原本のLICENSE/配布条件を保存');
    expect(note).not.toContain('導入済み');
    expect(createGodotHandoff([])).toContain('候補はまだありません。');
  });
});
