import { describe, expect, it } from 'vitest';
import { buildFocusPlan, buildFocusEvidenceChecklist, focusIntents } from './cameraFocus';

describe('MAF Camera & Focus Intelligence', () => {
  it('provides a deterministic plan for each intent', () => {
    for (const intent of focusIntents) {
      const p = buildFocusPlan(intent, 'A quiet rainy scene', 'gpt-image');
      expect(p.schema).toBe('maf.camera_focus.v1');
      expect(p.prompt).toContain('A quiet rainy scene');
      expect(p.focalTarget.length).toBeGreaterThan(2);
      expect(buildFocusEvidenceChecklist(p).length).toBeGreaterThan(4);
      expect(buildFocusPlan(intent, 'A quiet rainy scene', 'gpt-image')).toEqual(p);
    }
  });
  it('does not apply cinematic blur to game asset silhouettes', () => {
    const p = buildFocusPlan('game-asset', 'Inventory key', 'comfyui');
    expect(p.prompt).toContain('no depth of field blur');
    expect(p.avoid).toContain('blurred contour');
    expect(p.prompt).toContain('negative prompt only if the workflow supports it');
  });
  it('anchors mystery bokeh to real light sources and clear faces', () => {
    const p = buildFocusPlan('mystery', 'Character in lantern garden');
    expect(p.prompt).toContain('never covering the face');
    expect(p.avoid).toContain('random glowing circles without light sources');
  });
  it('rejects empty, overlong or invalid scene inputs', () => {
    expect(() => buildFocusPlan('emotion', '  ')).toThrow();
    expect(() => buildFocusPlan('emotion', 'x'.repeat(2001))).toThrow();
    expect(() => buildFocusPlan('emotion', 'scene', 'invalid' as never)).toThrow();
    expect(() => buildFocusPlan('invalid' as never, 'scene')).toThrow();
  });
});
