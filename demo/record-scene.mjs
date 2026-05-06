// Records one scene HTML to MP4. Usage:
//   node record-scene.mjs <scene-html> <output-mp4> [max-seconds]
import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { resolve } from 'node:path';

const [sceneHtml, outputMp4, maxSecsRaw] = process.argv.slice(2);
if (!sceneHtml || !outputMp4) {
  console.error('Usage: node record-scene.mjs <scene-html> <output-mp4> [max-seconds]');
  process.exit(2);
}
const MAX_SECS = parseInt(maxSecsRaw || '60', 10);

const VIEWPORT = { width: 1280, height: 800 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: true,
  args: [
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
  ],
  defaultViewport: VIEWPORT,
});

const page = await browser.newPage();
await page.setViewport(VIEWPORT);

const recorder = new PuppeteerScreenRecorder(page, {
  fps: 30,
  videoFrame: VIEWPORT,
  videoCrf: 22,
  videoCodec: 'libx264',
  videoPreset: 'medium',
  videoBitrate: 2400,
  autopad: { color: '#0a0a0c' },
});

const url = `file://${resolve(sceneHtml)}`;
await page.goto(url, { waitUntil: 'load' });

console.log(`recording ${sceneHtml} → ${outputMp4}`);
await recorder.start(outputMp4);

// Hold the empty terminal for 0.5s, then start the scene
await sleep(500);
await page.evaluate(() => { window.startScene(); });

// Poll for window.__sceneDone, capped at MAX_SECS
const start = Date.now();
while (Date.now() - start < MAX_SECS * 1000) {
  const done = await page.evaluate(() => window.__sceneDone === true);
  if (done) break;
  await sleep(250);
}
// Brief tail after done flag
await sleep(800);

await recorder.stop();
await browser.close();
console.log(`done in ${Math.round((Date.now() - start) / 1000)}s`);
