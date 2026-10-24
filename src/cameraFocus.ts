/** MAF Camera & Focus Intelligence: deterministic, offline, opt-in prompt planning. */
export type FocusIntent = 'emotion' | 'mystery' | 'story-object' | 'relationship' | 'worldbuilding' | 'game-asset';
export type FocusPreset = 'eyes' | 'foreground-frame' | 'object-focus' | 'distance-focus' | 'deep-focus' | 'asset-sharp';
export type ImageBackend = 'gpt-image' | 'comfyui' | 'generic';
export type FocusPlan = {
  schema: 'maf.camera_focus.v1';
  intent: FocusIntent;
  preset: FocusPreset;
  focalTarget: string;
  layers: { foreground: string; midground: string; background: string };
  prompt: string;
  avoid: string[];
  checks: string[];
  backend: ImageBackend;
};

const presets: Record<FocusIntent, { preset: FocusPreset; focus: string; layers: FocusPlan['layers']; detail: string; avoid: string[] }> = {
  emotion: { preset: 'eyes', focus: 'character eyes', layers: { foreground: 'subtle blurred framing near the outer edges', midground: 'eyes and face sharply focused', background: 'gently defocused scene' }, detail: 'sharp focus on both eyes, unobstructed face', avoid: ['blurred eyes', 'objects covering the face'] },
  mystery: { preset: 'foreground-frame', focus: 'character behind foreground elements', layers: { foreground: 'soft blurred foliage framing edges, never covering the face', midground: 'character sharply focused', background: 'distant natural lights, varied circular bokeh' }, detail: 'foreground bokeh framing the character, irregular light-source bokeh', avoid: ['random glowing circles without light sources', 'identical bokeh circles', 'obstructed face'] },
  'story-object': { preset: 'object-focus', focus: 'story-relevant object', layers: { foreground: 'focused key object held near the camera', midground: 'hands and face softly receding', background: 'quiet, defocused environment' }, detail: 'selective focus on the important object, readable object silhouette', avoid: ['object out of focus', 'distorted hands'] },
  relationship: { preset: 'distance-focus', focus: 'distant character', layers: { foreground: 'nearby character softly out of focus', midground: 'clear leading lines', background: 'distant character in sharp focus' }, detail: 'focus on the distant person, emotional distance, coherent perspective', avoid: ['both characters blurry', 'ambiguous focal target'] },
  worldbuilding: { preset: 'deep-focus', focus: 'environment and architecture', layers: { foreground: 'readable architectural forms', midground: 'characters and environment clearly visible', background: 'sharp distant architecture' }, detail: 'deep depth of field, detailed scenery from near to far', avoid: ['excessive background blur', 'flat perspective'] },
  'game-asset': { preset: 'asset-sharp', focus: 'whole asset silhouette', layers: { foreground: 'sharp asset boundary', midground: 'fully legible asset', background: 'simple neutral or transparent-looking backdrop' }, detail: 'clean crisp edges, no depth of field blur, high readability', avoid: ['blurred contour', 'unnecessary bokeh', 'cluttered backdrop'] }
};

export const focusIntents: FocusIntent[] = ['emotion', 'mystery', 'story-object', 'relationship', 'worldbuilding', 'game-asset'];

export function buildFocusPlan(intent: FocusIntent, scene: string, backend: ImageBackend = 'generic'): FocusPlan {
  if (!Object.prototype.hasOwnProperty.call(presets, intent)) throw new Error('Unsupported focus intent');
  if (!['gpt-image', 'comfyui', 'generic'].includes(backend)) throw new Error('Unsupported image backend');
  const cleanScene = scene.trim();
  if (!cleanScene || cleanScene.length > 2000) throw new Error('Scene must be 1–2000 characters');
  const p = presets[intent];
  const guidance = backend === 'gpt-image'
    ? 'Describe visible focus relationships, not just lens numbers.'
    : backend === 'comfyui'
      ? 'Use as a positive prompt; apply avoid terms as a separate negative prompt only if the workflow supports it.'
      : 'Adapt the textual focus hints to model-specific syntax.';
  return {
    schema: 'maf.camera_focus.v1', intent, preset: p.preset, focalTarget: p.focus,
    layers: { ...p.layers }, backend,
    prompt: [cleanScene, p.detail, 'Foreground: ' + p.layers.foreground, 'Midground: ' + p.layers.midground, 'Background: ' + p.layers.background, 'Maintain clear depth separation.', guidance].join('. '),
    avoid: [...p.avoid],
    checks: ['Intended focal target is sharp', 'Foreground does not obscure essential content', 'Depth layers are visually coherent', 'Bokeh corresponds to plausible light sources if used']
  };
}

/** A human-review checklist only. Does not imply image generation or automated visual QA. */
export function buildFocusEvidenceChecklist(plan: FocusPlan): string[] {
  return [`Focal target: ${plan.focalTarget}`, `Foreground: ${plan.layers.foreground}`, `Midground: ${plan.layers.midground}`, `Background: ${plan.layers.background}`, ...plan.checks];
}
