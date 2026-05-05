// Records a 60-90s demo video showing real MPP.sol payment captured
// against Solana devnet. Pre-requisites:
//   1. Run `node run-flow.mjs` to capture the actual payment to flow.json.
//   2. Then run this script to render flow.json with player.html and
//      record the result alongside the on-chain Solana Explorer page.
//
// Output: ./demo.mp4

import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VIEWPORT = { width: 1280, height: 800 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const flow = JSON.parse(readFileSync('./flow.json', 'utf8'));
const playerUrl = `file://${resolve('./player.html')}`;
const explorerUrl = `https://explorer.solana.com/tx/${flow.tx}?cluster=devnet`;

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
await recorder.start('./demo.mp4');

// ---------------------------------------------------------------
// Scene 1: Brief landing-page glance (~3s)
// ---------------------------------------------------------------
console.log('Scene 1: landing intro');
await page.goto('https://mppsol.org', { waitUntil: 'networkidle0' });
await sleep(3000);

// ---------------------------------------------------------------
// Scene 2: The actual demo player (~50s — typewriter animation)
// ---------------------------------------------------------------
console.log('Scene 2: live demo player');
await page.goto(playerUrl, { waitUntil: 'load' });
await page.evaluate((flow) => { window.__FLOW = flow; }, flow);
// Kick off the animation but DON'T await it inside the browser — record
// while it plays. Wait for our own timer that matches the animation's
// actual duration (measured ~26s).
await page.evaluate(() => { window.startDemo(); });
await sleep(28000);
// Let the final state breathe.
await sleep(1500);

// ---------------------------------------------------------------
// Scene 3: The actual on-chain tx in Solana Explorer (~6s)
// ---------------------------------------------------------------
console.log('Scene 3: solana explorer (real tx)');
await page.goto(explorerUrl, { waitUntil: 'networkidle0' });
await sleep(6000);

await recorder.stop();
await browser.close();
console.log(`Wrote ./demo.mp4 (real tx: ${flow.tx})`);
