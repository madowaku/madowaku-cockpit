/**
 * MCC-UI-M1.0 Nova-inspired, LOCAL tokens only.
 * These values are not Sun* Nova token definitions or redistributed components.
 */
export type NovaLabTheme = 'light' | 'dark';

export type NovaLabPalette = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  border: string;
  focus: string;
};

export const NOVA_LAB_PALETTES: Record<NovaLabTheme, NovaLabPalette> = {
  light: {
    background: '#f3f6f2',
    surface: '#f9faf7',
    text: '#152922',
    muted: '#40574e',
    primary: '#196b57',
    onPrimary: '#ffffff',
    border: '#a0baae',
    focus: '#196b57'
  },
  dark: {
    background: '#10221c',
    surface: '#1a2a24',
    text: '#f9f8ee',
    muted: '#ced9d4',
    primary: '#90dfc5',
    onPrimary: '#10332a',
    border: '#718f84',
    focus: '#90dfc5'
  }
};

/** A semantic crosswalk, not an assertion of complete API or theme compatibility. */
export const NOVA_TOKEN_CROSSWALK = [
  { local: 'surface', novaExample: '--color-sds-surface-base', category: 'color' },
  { local: 'text', novaExample: '--color-sds-text-primary', category: 'color' },
  { local: 'primary', novaExample: '--color-sds-surface-primary', category: 'color' },
  { local: 'spacing', novaExample: '--spacing-sds-200', category: 'space' },
  { local: 'radius', novaExample: '--radius-sds-400', category: 'shape' }
] as const;

function luminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error('Expected a six-digit hex color');
  }
  const values = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = values.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function getContrastRatio(foreground: string, background: string): number {
  const bright = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (bright + 0.05) / (dark + 0.05);
}

/** Preliminary color-pair checks only. Not a full accessibility audit. */
export function getNovaContrastChecks(theme: NovaLabTheme) {
  const p = NOVA_LAB_PALETTES[theme];
  const pairs = [
    { label: '本文 / サーフェス', foreground: p.text, background: p.surface },
    { label: '補助文 / サーフェス', foreground: p.muted, background: p.surface },
    { label: 'ボタン文字 / ボタン', foreground: p.onPrimary, background: p.primary }
  ];
  return pairs.map((pair) => {
    const ratio = getContrastRatio(pair.foreground, pair.background);
    return { ...pair, ratio, passesAA: ratio >= 4.5 };
  });
}

/**
 * Generates a review-first copy-only handoff.
 * Never installs Nova private packages or asks for credentials.
 */
export function buildNovaDesignHandoff(projectName: string, taskTitle: string, theme: NovaLabTheme) {
  return [
    'ROLE: Codex / UI Librarian',
    'MODE: review_first',
    'TASK: MCC-UI-M1 Nova Design System Intelligence Bridge',
    'PROJECT: ' + (projectName.trim() || '(unnamed)'),
    'WORK: ' + (taskTitle.trim() || '(unspecified)'),
    'PREVIEW_THEME: ' + theme,
    'GOAL: Review one existing cockpit UI flow using semantic design tokens and reusable components.',
    'SOURCE: https://nova.sun-asterisk.com/guide/09-theming/',
    'DO:',
    '- Inventory local tokens and components before adding new ones.',
    '- Use the Nova semantic token and scoped-theme patterns as a reference, not a cloned implementation.',
    '- Propose the smallest reversible change with before/after visual evidence.',
    '- Check keyboard, focus-visible, 320px/desktop, contrast, and reduced motion.',
    '- Preserve cockpit visual identity and local-first storage behavior.',
    'KEEP:',
    '- Existing React 19/Vite workflow and UI Librarian specialist routing.',
    '- Read-only MCP tool names and review-first AI Creole handoff boundary.',
    'NO:',
    '- No private @sun-asterisk-internal package, PAT, auth token, or SSO configuration.',
    '- No global theme override, wholesale component replacement, or new runtime dependency.',
    '- No unverified claims of Nova component compatibility or full WCAG compliance.',
    'CHECK: npm test && npm run build && npm run mcp:smoke; then manual browser visual evidence.',
    'OUT: token map, changed files, test evidence, a11y notes, risks, and NEXT.',
    'NEXT: Obtain public package access or explicit approval before testing vendor package integration.'
  ].join('\n');
}
