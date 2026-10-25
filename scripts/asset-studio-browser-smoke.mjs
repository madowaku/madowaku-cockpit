// Chrome DevTools Protocol smoke test. Node >=22, no browser-testing dependency.
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const url = process.env.CDP_ENDPOINT ?? 'http://127.0.0.1:9222';
const targetUrl = process.env.STUDIO_URL ?? 'http://127.0.0.1:4173/?view=asset-studio';
const waitJson = async (uri, ms = 16000) => {
  const since = Date.now();
  while (Date.now() - since < ms) {
    try { const res = await fetch(uri); if (res.ok) return await res.json(); } catch { /* retry */ }
    await delay(250);
  }
  throw new Error('CDP endpoint unavailable: ' + uri);
};
await waitJson(url + '/json/version');
const tabResponse = await fetch(url + '/json/new?' + encodeURIComponent(targetUrl), { method: 'PUT' });
if (!tabResponse.ok) throw new Error('Cannot open CDP tab: ' + tabResponse.status);
const page = await tabResponse.json();
assert.ok(page.webSocketDebuggerUrl, 'Chrome tab is not debuggable');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let nextId = 0;
const pending = new Map();
socket.onmessage = ({ data }) => {
  const result = JSON.parse(String(data));
  if (!result.id || !pending.has(result.id)) return;
  const { resolve, reject } = pending.get(result.id);
  pending.delete(result.id);
  if (result.error) reject(new Error(JSON.stringify(result.error)));
  else resolve(result.result);
};
const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error('Page JS failed: ' + JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const check = async (name, expr, expected) => {
  const actual = await evaluate(expr);
  assert.deepEqual(actual, expected, name + ': unexpected browser result');
  console.log('PASS: ' + name);
};
try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await delay(1500);
  await check('Japanese heading', `document.querySelector('#asset-hero-title')?.textContent.includes('アイデアに')`, true);
  await check('12 curated assets', `document.querySelectorAll('.asset-card').length`, 12);
  await check('8 official sources', `document.querySelectorAll('.asset-provider').length`, 8);
  await check('two CC BY icon previews', `document.querySelectorAll('img.asset-real-preview').length`, 2);
  await check('13 original Kenney PNG samples', `document.querySelectorAll('img.asset-sprite-sample').length`, 13);
  await check('original Kenney PNGs loaded', `[...document.querySelectorAll('img.asset-sprite-sample')].every(i => i.complete && i.naturalWidth > 0)`, true);
  await check('source-hosted previews load', `[...document.querySelectorAll('img.asset-real-preview')].every(i => i.complete && i.naturalWidth > 0)`, true);
  await check('no horizontal overflow at desktop', `document.documentElement.scrollWidth <= innerWidth`, true);

  // CDP Input.insertText emits actual browser input events; dispatchEvent is not a React user event.
  await evaluate(`document.querySelector('input[type=search]').focus()`);
  await cdp('Input.insertText', { text: 'RPG' });
  await delay(160);
  const count = await evaluate(`document.querySelectorAll('.asset-card').length`);
  assert.ok(count > 0 && count < 12, 'search filter count: ' + count);
  console.log('PASS: live search narrows results to ' + count);

  await cdp('Page.reload', { ignoreCache: true });
  await delay(900);
  await evaluate(`document.querySelector('.asset-style-options button:nth-child(3)').click()`);
  await delay(120);
  await check('style choice responds', `document.querySelector('.asset-style-options button:nth-child(3)').getAttribute('aria-pressed')`, 'true');
  await check('reset list after reload', `document.querySelectorAll('.asset-card').length`, 12);

  // User can inspect actual sprite pixels before bringing a pack to Godot.
  await evaluate(`([...document.querySelectorAll('.asset-card')].find(card=>card.querySelector('h3')?.textContent==='UI Pack - Adventure')).querySelector('.asset-outline-button').click()`);
  await delay(100);
  await check('visual inspector shows selected Kenney sample count', `document.querySelector('.asset-analyze-button')?.textContent.includes('2枚')`, true);
  await evaluate(`document.querySelector('.asset-analyze-button').click()`);
  await delay(350);
  await check('real canvas pixel evidence calculated', `document.querySelector('.asset-analysis-result')?.textContent.includes('MAFパレットとのRGB色差')`, true);
  await check('real preview palettes rendered', `document.querySelectorAll('.asset-analysis-swatches span').length > 0`, true);

  await evaluate(`document.querySelector('.asset-card .asset-save-button').click()`);
  await delay(100);
  await check('shortlist updates', `document.querySelector('.asset-tray-number').textContent`, '01');
  await check('shortlist persists', `JSON.parse(localStorage.getItem('madowaku-mgsf-asset-studio-shortlist-v1')).length`, 1);
  await evaluate(`document.querySelector('.asset-tray-list button').click()`);
  await delay(100);
  await check('shortlist removes candidate', `document.querySelector('.asset-tray-number').textContent`, '00');

  await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: true });
  await delay(180);
  await check('no horizontal overflow at 320px', `document.documentElement.scrollWidth <= innerWidth`, true);
  await check('header back button remains on one line', `document.querySelector('.asset-back').getBoundingClientRect().height < 48`, true);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await delay(100);
  await check('no horizontal overflow at 390px', `document.documentElement.scrollWidth <= innerWidth`, true);
  console.log('PASS: all CDP interaction checks');
} finally {
  socket.close();
}
