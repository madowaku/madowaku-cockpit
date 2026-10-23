import { defineConfig } from '@playwright/test';

const variant = process.env.LITTLEJS_LAB_CASE || 'baseline';
if (!/^(baseline|codex|claude)$/.test(variant)) {
  throw new Error('Invalid LITTLEJS_LAB_CASE');
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  outputDir: './test-results/' + variant,
  reporter: [
    ['line'],
    ['json', { outputFile: './evidence/' + variant + '/playwright-results.json' }]
  ]
});
