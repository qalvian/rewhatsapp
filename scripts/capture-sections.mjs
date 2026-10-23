// @ts-check
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'sections-v6');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const SECTIONS = [
  { name: 'header', sel: '.wa-home-header' },
  { name: 'hero', sel: '.wa-home-hero' },
  { name: 'why', sel: '#why' },
  { name: 'how_it_works', sel: '#how-it-works' },
  { name: 'how_to_use', sel: '#how-to-use' },
  { name: 'features', sel: '#features' },
  { name: 'privacy', sel: '#privacy' },
  { name: 'faq', sel: '#faq' },
  { name: 'cta_band', sel: '.wa-final-cta-band' },
  { name: 'footer', sel: '.wa-home-footer' },
];

async function captureForViewport(browser, width, height, vpName) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1200));

  for (const s of SECTIONS) {
    const el = await page.$(s.sel);
    if (el) {
      const fileName = `section_${s.name}_${vpName}.png`;
      const p1 = path.join(SCREENSHOT_DIR, fileName);
      await el.screenshot({ path: p1 });
      console.info(`Captured ${fileName}`);
    } else {
      console.warn(`Element not found for selector: ${s.sel}`);
    }
  }

  // Also capture full page screenshot
  const fullPageFile = `fullpage_${vpName}.png`;
  const fp1 = path.join(SCREENSHOT_DIR, fullPageFile);
  await page.screenshot({ path: fp1, fullPage: true });

  await page.close();
}

async function run() {
  console.info('Capturing section-by-section screenshots at 390x844 and 1440x900...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  await captureForViewport(browser, 390, 844, '390x844');
  await captureForViewport(browser, 1440, 900, '1440x900');

  await browser.close();
  console.info('Section screenshots captured successfully.');
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
