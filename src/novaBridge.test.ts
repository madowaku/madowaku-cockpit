import { describe, expect, it } from 'vitest';
import {
  buildNovaDesignHandoff,
  getContrastRatio,
  getNovaContrastChecks,
  NOVA_LAB_PALETTES,
  NOVA_TOKEN_CROSSWALK
} from './novaBridge';

describe('Nova design bridge (independent reference implementation)', () => {
  it('uses isolated light and dark palettes with readable demo text', () => {
    for (const theme of ['light', 'dark'] as const) {
      const checks = getNovaContrastChecks(theme);
      expect(checks).toHaveLength(3);
      expect(checks.every((check) => check.passesAA)).toBe(true);
      expect(NOVA_LAB_PALETTES[theme].background).not.toBe(NOVA_LAB_PALETTES[theme].surface);
    }
  });

  it('computes WCAG contrast and rejects ambiguous color formats', () => {
    expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(() => getContrastRatio('red', '#ffffff')).toThrow(/hex/);
  });

  it('references only public semantic token examples', () => {
    expect(NOVA_TOKEN_CROSSWALK.some((token) => token.novaExample === '--color-sds-text-primary')).toBe(true);
    expect(NOVA_TOKEN_CROSSWALK.every((token) => !token.novaExample.includes('--ref'))).toBe(true);
  });

  it('generates a bounded and secure handoff with the selected preview theme', () => {
    const handoff = buildNovaDesignHandoff('Mado Project', 'Review settings panel', 'dark');
    expect(handoff).toContain('PROJECT: Mado Project');
    expect(handoff).toContain('PREVIEW_THEME: dark');
    expect(handoff).toContain('review_first');
    expect(handoff).toContain('No private @sun-asterisk-internal package');
    expect(handoff).toContain('npm run mcp:smoke');
  });
});
