import { describe, it, expect } from 'vitest';
import { analyzeRgba, compareMafPalettes, MAF_PALETTE_SNAPSHOT, analyzeLocalPreviews } from './mafImageEvidence';

describe('MGSF-MAF image feature evidence', () => {
  it('counts only visible pixels and quantized representative colors', () => {
    const rgba = new Uint8ClampedArray([
      240,0,0,255,   240,0,0,255,
      0,0,0,0,       0,0,240,255
    ]);
    const result=analyzeRgba(rgba);
    expect(result.sampledPixels).toBe(4);
    expect(result.visiblePixels).toBe(3);
    expect(result.transparentRatio).toBe(0.25);
    expect(result.colorBuckets).toBe(2);
    expect(result.colors).toHaveLength(2);
    expect(result.meanSaturation).toBeCloseTo(1);
    expect(result.meanLuminance).toBeGreaterThan(0);
  });

  it('handles fully transparent images without fabricated palette matches', () => {
    const result=analyzeRgba(new Uint8ClampedArray(8));
    expect(result.colors).toEqual([]);
    expect(result.transparentRatio).toBe(1);
    expect(compareMafPalettes(result)).toEqual([]);
    expect(()=>analyzeRgba(new Uint8ClampedArray(3))).toThrow('RGBA');
  });

  it('compares MAF palette snapshot using explicit RGB distance, not model probabilities', () => {
    const palette=MAF_PALETTE_SNAPSHOT.pixel;
    expect(palette.label).toBe('Moonlit Pixel');
    const result=analyzeRgba(new Uint8ClampedArray([224,200,162,255]));
    const ranked=compareMafPalettes(result);
    expect(ranked).toHaveLength(4);
    expect(ranked[0].id).toBe('pixel');
    expect(ranked[0].meanDistance).toBeLessThanOrEqual(20);
    expect(ranked.every(item=>item.meanDistance>=0 && item.meanDistance<=442)).toBe(true);
  });

  it('rejects invalid/untrusted image paths before doing browser IO', async () => {
    await expect(analyzeLocalPreviews([])).rejects.toThrow('Expected');
    await expect(analyzeLocalPreviews(['https://example.com/unsafe.png'])).rejects.toThrow('Only curated');
    await expect(analyzeLocalPreviews(['//evil.test/kenney.png'])).rejects.toThrow('Only curated');
  });
});
