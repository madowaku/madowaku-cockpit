import { test, expect } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CASE = process.env.LITTLEJS_LAB_CASE || 'baseline';
if (!/^(baseline|codex|claude)$/.test(CASE)) throw new Error('Invalid lab case');
const EVIDENCE = resolve(ROOT, 'evidence', CASE);
const ENTRY = CASE === 'baseline' ? 'fixtures/index.html' : 'runs/' + CASE + '/index.html';

test('LittleJS canary: renders, moves, collects, and leaves visual evidence', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(pathToFileURL(resolve(ROOT, ENTRY)).href);
  await page.waitForFunction(() => window.__littlejsLab?.snapshot().ticks > 10);
  const before = await page.evaluate(() => window.__littlejsLab.snapshot());
  await expect(page.locator('canvas').first()).toBeVisible();

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(1100);
  await page.keyboard.up('ArrowRight');
  const after = await page.evaluate(() => window.__littlejsLab.snapshot());
  expect(after.x).toBeGreaterThan(before.x + 1);
  expect(after.score).toBeGreaterThanOrEqual(1);
  expect(errors).toEqual([]);

  await mkdir(EVIDENCE, { recursive: true });
  const screenshot = resolve(EVIDENCE, 'playtest.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  const evidence = {
    schema: 'mgsf.littlejs.evidence.v1',
    engine_revision: '5b712052848b58e4fce127cec2531c024cb3d9b5',
    variant: CASE,
    scenario: 'collect-one',
    before,
    after,
    console_errors: errors,
    screenshot: 'playtest.png',
    passed: true
  };
  await writeFile(resolve(EVIDENCE, 'playtest.json'), JSON.stringify(evidence, null, 2) + '\n');
  await info.attach('visual-evidence', { path: screenshot, contentType: 'image/png' });
});
