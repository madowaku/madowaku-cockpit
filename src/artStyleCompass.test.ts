import { describe, it, expect } from 'vitest';
import { rankStyles, buildArtDirection, styleProfiles } from './artStyleCompass';
describe('Art Style Compass', () => {
  it('ranks matching Japanese concepts first', () => { expect(rankStyles('かわいい不気味なドット絵')[0].profile.id).toBe('pixel'); });
  it('filters out engine-incompatible candidates', () => { expect(rankStyles('立体の箱庭', 'LittleJS').every(x => x.profile.engines.includes('LittleJS'))).toBe(true); });
  it('is deterministic and capped at three', () => { expect(rankStyles('')).toEqual(rankStyles('')); expect(rankStyles('').length).toBeLessThanOrEqual(3); });
  it('uses stable unique IDs and safe reference URLs', () => { expect(new Set(styleProfiles.map(x=>x.id)).size).toBe(styleProfiles.length); expect(styleProfiles.every(x=>x.referenceUrl.startsWith('https://'))).toBe(true); });
  it('includes provenance and review gates', () => { const md=buildArtDirection('かわいいホラー','Godot'); expect(md).toContain('Reference:'); expect(md).toContain('Human visual review'); expect(md).toContain('かわいいホラー'); });
});
