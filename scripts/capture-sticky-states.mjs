// @ts-check
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'sticky-states');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  console.info('Capturing 3 sticky bar states at 390x844...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

  // State 1: Top of page (Hero visible)
  const state1Visible = await page.evaluate(() => {
    const bar = document.querySelector('.wa-mobile-sticky-bar');
    if (!bar) return false;
    const style = window.getComputedStyle(bar);
    return style.opacity === '1' && style.pointerEvents === 'auto';
  });
  console.info(`State 1 (Top / Hero): Sticky bar visible = ${state1Visible} (Expected: false)`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '1_sticky_bar_hidden_top.png') });

  // State 2: Mid-page (Scroll to #how-it-works / #features)
  await page.evaluate(() => {
    const el = document.querySelector('#how-it-works') || document.querySelector('#features');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 500));

  const state2Visible = await page.evaluate(() => {
    const bar = document.querySelector('.wa-mobile-sticky-bar');
    if (!bar) return false;
    const style = window.getComputedStyle(bar);
    return style.opacity === '1' && style.pointerEvents === 'auto';
  });
  console.info(`State 2 (Mid-page): Sticky bar visible = ${state2Visible} (Expected: true)`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2_sticky_bar_visible_mid.png') });

  // State 3: Bottom of page (Scroll to .wa-final-cta-band / footer)
  await page.evaluate(() => {
    const el = document.querySelector('.wa-final-cta-band') || document.querySelector('footer');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 500));

  const state3Visible = await page.evaluate(() => {
    const bar = document.querySelector('.wa-mobile-sticky-bar');
    if (!bar) return false;
    const style = window.getComputedStyle(bar);
    return style.opacity === '1' && style.pointerEvents === 'auto';
  });
  console.info(`State 3 (Bottom / Final CTA & Footer): Sticky bar visible = ${state3Visible} (Expected: false)`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3_sticky_bar_hidden_bottom.png') });

  await browser.close();
  console.info('Sticky bar states captured successfully.');
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
