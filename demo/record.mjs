// Records a tour of the MPP.sol public surface as an mp4.
// Usage: node record.mjs
// Output: ./demo.mp4

import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const VIEWPORT = { width: 1280, height: 800 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function smoothScrollTo(page, targetY, duration) {
  await page.evaluate(
    (targetY, duration) =>
      new Promise((resolve) => {
        const startY = window.scrollY;
        const distance = targetY - startY;
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / duration);
          // Cubic ease-in-out
          const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          window.scrollTo(0, startY + distance * eased);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    targetY,
    duration,
  );
}

(async () => {
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
    videoBitrate: 2000,
    autopad: { color: '#0a0a0c' },
  });
  await recorder.start('./demo.mp4');

  // ------------------------------------------------------------
  // Scene 1: Landing page hero (~6s)
  // ------------------------------------------------------------
  console.log('Scene 1: hero');
  await page.goto('https://mppsol.org', { waitUntil: 'networkidle0' });
  await sleep(3000);

  // ------------------------------------------------------------
  // Scene 2: Slow scroll through full landing page (~14s)
  // ------------------------------------------------------------
  console.log('Scene 2: slow scroll through landing');
  const fullHeight = await page.evaluate(() => document.body.scrollHeight);
  const visibleHeight = VIEWPORT.height;
  await smoothScrollTo(page, fullHeight - visibleHeight, 14000);
  await sleep(1500);

  // Reset to top.
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);

  // ------------------------------------------------------------
  // Scene 3: GitHub org (~4s)
  // ------------------------------------------------------------
  console.log('Scene 3: github org');
  await page.goto('https://github.com/mppsol', { waitUntil: 'networkidle0' });
  await sleep(4000);

  // ------------------------------------------------------------
  // Scene 4: npm package page (~4s)
  // ------------------------------------------------------------
  console.log('Scene 4: npm');
  await page.goto('https://www.npmjs.com/package/@mppsol/server', {
    waitUntil: 'networkidle0',
  });
  await sleep(4000);

  // ------------------------------------------------------------
  // Scene 5: On-chain devnet program (~5s)
  // ------------------------------------------------------------
  console.log('Scene 5: solana explorer');
  await page.goto(
    'https://explorer.solana.com/address/B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi?cluster=devnet',
    { waitUntil: 'networkidle0' },
  );
  await sleep(5000);

  // ------------------------------------------------------------
  // Scene 6: Spec doc (the Wire format) (~5s)
  // ------------------------------------------------------------
  console.log('Scene 6: spec/wire.md');
  await page.goto('https://mppsol.org/spec/wire.md', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await smoothScrollTo(page, 800, 3000);

  // ------------------------------------------------------------
  // Scene 7: Back to landing page status section (~3s)
  // ------------------------------------------------------------
  console.log('Scene 7: status section');
  await page.goto('https://mppsol.org#status', { waitUntil: 'networkidle0' });
  await sleep(1500);
  // Fine-scroll a little more onto the table
  await page.evaluate(() => window.scrollBy(0, 100));
  await sleep(2500);

  await recorder.stop();
  await browser.close();
  console.log('Wrote ./demo.mp4');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
