// @ts-check
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BEFORE_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'before-v6');
const AFTER_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'after-v6');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

const isAfterRun = process.argv.includes('--after');
const OUT_DIR = isAfterRun ? AFTER_DIR : BEFORE_DIR;
fs.mkdirSync(OUT_DIR, { recursive: true });

async function auditViewport(browser, vp) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });

  // Wait 1s for text reveals to finish holding / initial animations
  await new Promise((r) => setTimeout(r, 1000));

  // Take screenshot
  const screenshotPath = path.join(OUT_DIR, `home_${vp.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Audit dimensions and metrics in page context
  const metrics = await page.evaluate((vpHeight, vpWidth) => {
    const docEl = document.documentElement;
    const body = document.body;
    const totalHeight = Math.max(
      docEl.scrollHeight,
      body.scrollHeight,
      docEl.offsetHeight,
      body.offsetHeight,
      docEl.clientHeight,
    );
    const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
    const horizontalOverflow = scrollWidth > vpWidth + 1;

    // Sections
    const sectionSelectors = [
      { name: 'Header', sel: '.wa-home-header, header' },
      { name: 'Hero', sel: '.wa-home-hero' },
      { name: 'Why', sel: '#why, .wa-why-section' },
      { name: 'How It Works', sel: '#how-it-works, .wa-how-section' },
      { name: 'How To Use', sel: '#how-to-use, .wa-use-section, .wa-export-section' },
      { name: 'Features', sel: '#features, .wa-features-section' },
      { name: 'Privacy', sel: '#privacy, .wa-privacy-section' },
      { name: 'FAQ', sel: '#faq, .wa-faq-section' },
      { name: 'CTA Band', sel: '.wa-final-cta-band, .wa-cta-band, #cta-band' },
      { name: 'Footer', sel: '.wa-home-footer, footer' },
    ];

    const sections = sectionSelectors.map((s) => {
      const el = document.querySelector(s.sel);
      if (!el) return { name: s.name, height: 0, found: false };
      const rect = el.getBoundingClientRect();
      return {
        name: s.name,
        height: Math.round(rect.height),
        top: Math.round(rect.top + window.scrollY),
        found: true,
      };
    });

    // Buttons
    const buttons = Array.from(
      document.querySelectorAll('button, .wa-btn-primary, .wa-btn-secondary, a.wa-btn-primary, a.wa-btn-secondary'),
    )
      .filter((b) => {
        const style = window.getComputedStyle(b);
        return style.display !== 'none' && style.visibility !== 'hidden' && b.getBoundingClientRect().height > 0;
      })
      .map((b) => {
        const rect = b.getBoundingClientRect();
        const text = (b.textContent || '').trim().slice(0, 25);
        return {
          text,
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          tag: b.tagName.toLowerCase(),
          className: b.className,
        };
      });

    // Cards
    const cards = Array.from(
      document.querySelectorAll(
        '.wa-card, .wa-bento-card, .wa-feature-card, .wa-why-card, .wa-step-card, .wa-faq-item, .wa-export-card, [class*="-card"]',
      ),
    )
      .filter((c) => {
        const style = window.getComputedStyle(c);
        return style.display !== 'none' && style.visibility !== 'hidden' && c.getBoundingClientRect().height > 0;
      })
      .map((c) => {
        const rect = c.getBoundingClientRect();
        return {
          className: c.className.split(' ')[0],
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          hasNestedCard: c.querySelector('.wa-card, [class*="-card"]') !== null,
        };
      });

    // Nested card check across entire document
    const nestedCardsCount = document.querySelectorAll(
      '.wa-card .wa-card, [class*="-card"] [class*="-card"]',
    ).length;

    // Sticky Bottom Bar
    const stickyBar = document.querySelector('.wa-mobile-sticky-bar, .wa-sticky-bar');
    const stickyBarInfo = stickyBar
      ? {
          found: true,
          height: Math.round(stickyBar.getBoundingClientRect().height),
          visible: window.getComputedStyle(stickyBar).display !== 'none',
        }
      : { found: false, height: 0, visible: false };

    // Smallest font size
    let minFontSize = Infinity;
    let minFontEl = '';
    const allTextEls = Array.from(document.querySelectorAll('body *'));
    for (const el of allTextEls) {
      if (el.children.length === 0 && (el.textContent || '').trim().length > 0) {
        const fsVal = parseFloat(window.getComputedStyle(el).fontSize);
        if (fsVal > 0 && fsVal < minFontSize) {
          minFontSize = fsVal;
          minFontEl = `<${el.tagName.toLowerCase()} class="${el.className}">: "${el.textContent.trim().slice(0, 20)}"`;
        }
      }
    }

    // Hero element overlapping bounding boxes
    const heroEl = document.querySelector('.wa-home-hero');
    const heroOverlaps = [];
    if (heroEl) {
      const heroKeyElements = [
        { name: 'Eyebrow', sel: '.wa-hero-eyebrow, .wa-hero-eyebrow-box' },
        { name: 'Headline', sel: '.wa-hero-headline' },
        { name: 'Subtitle', sel: '.wa-hero-subtitle' },
        { name: 'CTAs', sel: '.wa-hero-cta-group' },
        { name: 'Microcopy', sel: '.wa-hero-microcopy' },
        { name: 'Phone Stage', sel: '.wa-phone-mockup-stage, .wa-hero-phone' },
      ];

      const resolved = heroKeyElements
        .map((k) => {
          const el = heroEl.querySelector(k.sel);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { name: k.name, rect };
        })
        .filter(Boolean);

      for (let i = 0; i < resolved.length; i++) {
        for (let j = i + 1; j < resolved.length; j++) {
          const a = resolved[i];
          const b = resolved[j];
          const overlap = !(
            a.rect.right <= b.rect.left ||
            a.rect.left >= b.rect.right ||
            a.rect.bottom <= b.rect.top ||
            a.rect.top >= b.rect.bottom
          );
          if (overlap) {
            heroOverlaps.push(`${a.name} overlaps with ${b.name}`);
          }
        }
      }
    }

    // First screen visibility check (headline, body, CTAs, phone top visible)
    let firstScreenCheck = false;
    const headline = document.querySelector('.wa-hero-headline');
    const bodyCopy = document.querySelector('.wa-hero-subcopy, .wa-hero-subtitle');
    const ctas = document.querySelector('.wa-hero-cta-group');
    const phone = document.querySelector('.wa-phone-frame, .wa-hero-stage, .wa-phone-mockup-stage');

    if (headline && bodyCopy && ctas && phone) {
      const hRect = headline.getBoundingClientRect();
      const bRect = bodyCopy.getBoundingClientRect();
      const cRect = ctas.getBoundingClientRect();
      const pRect = phone.getBoundingClientRect();

      const hVis = hRect.top >= 0 && hRect.bottom <= vpHeight;
      const bVis = bRect.top >= 0 && bRect.bottom <= vpHeight;
      const cVis = cRect.top >= 0 && cRect.bottom <= vpHeight;
      const pTopVis = pRect.top < vpHeight; // phone top enters first screen

      firstScreenCheck = hVis && bVis && cVis && pTopVis;
    }

    return {
      totalHeight,
      ratio: (totalHeight / vpHeight).toFixed(2),
      horizontalOverflow,
      scrollWidth,
      sections,
      buttons,
      cards,
      nestedCardsCount,
      stickyBarInfo,
      minFontSize,
      minFontEl,
      heroOverlaps,
      firstScreenCheck,
    };
  }, vp.height, vp.width);

  await page.close();
  return { viewport: vp, ...metrics };
}

async function run() {
  console.info(`[audit-layout] Launching Chrome via ${CHROME_PATH}... Mode: ${isAfterRun ? 'AFTER' : 'BASELINE (BEFORE)'}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const results = [];
  for (const vp of VIEWPORTS) {
    console.info(`Auditing viewport ${vp.name} (${vp.width}x${vp.height})...`);
    const r = await auditViewport(browser, vp);
    results.push(r);
  }

  await browser.close();

  const outJson = path.join(ROOT_DIR, 'docs', isAfterRun ? 'audit-after.json' : 'audit-baseline.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2));

  console.info(`\n=== AUDIT RESULTS (${isAfterRun ? 'AFTER' : 'BASELINE'}) ===`);
  for (const r of results) {
    console.info(`\n--- Viewport: ${r.viewport.name} (${r.viewport.width}x${r.viewport.height}) ---`);
    console.info(`Total Page Height: ${r.totalHeight}px (${r.ratio}x viewport height)`);
    console.info(`Horizontal Overflow: ${r.horizontalOverflow ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.info(`Nested Cards Count: ${r.nestedCardsCount}`);
    console.info(`Min Font Size: ${r.minFontSize}px (${r.minFontEl})`);
    console.info(`Hero Overlaps: ${r.heroOverlaps.length === 0 ? 'None (Clean)' : r.heroOverlaps.join(', ')}`);
    console.info(`First Screen Fits: ${r.firstScreenCheck ? 'YES (PASS)' : 'NO (NEEDS TIGHTENING)'}`);
    console.info(`Sections:`);
    for (const s of r.sections) {
      console.info(`  - ${s.name.padEnd(14)}: ${s.height}px`);
    }
    const tallCards = r.cards.filter((c) => c.height > 220);
    console.info(`Cards count: ${r.cards.length}, taller than 220px on mobile: ${tallCards.length}`);
  }
}

run().catch((err) => {
  console.error('[audit-layout] Failed:', err);
  process.exit(1);
});
