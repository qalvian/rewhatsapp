// @ts-check

import { svgEl, el } from '../../util/dom.js';

/**
 * Creates an original, procedural doodle SVG pattern overlay.
 * Evokes the nostalgic conversation wallpaper feel with clocks, coffee, paper planes,
 * sparkles, speech bubbles, and musical notes — 100% original, zero external assets.
 *
 * @returns {HTMLElement}
 */
export function createWallpaperElement() {
  const container = el('div', {
    className: 'wa-wallpaper-layer',
    aria: { hidden: 'true' },
  });

  const svg = svgEl(
    'svg',
    {
      width: '100%',
      height: '100%',
      xmlns: 'http://www.w3.org/2000/svg',
      className: 'wa-wallpaper-svg',
    },
    svgEl(
      'defs',
      {},
      svgEl(
        'pattern',
        {
          id: 'wa-doodle-pattern',
          width: '320',
          height: '320',
          patternUnits: 'userSpaceOnUse',
        },
        // 1. Clock (top-left)
        svgEl('circle', {
          cx: '40',
          cy: '40',
          r: '18',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('path', {
          d: 'M 40 28 L 40 40 L 48 44',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
        }),

        // 2. Paper airplane (top-center)
        svgEl('path', {
          d: 'M 160 30 L 190 45 L 160 52 L 168 43 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linejoin': 'round',
        }),
        svgEl('path', {
          d: 'M 168 43 L 190 45',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.5',
        }),

        // 3. Coffee Mug (top-right)
        svgEl('path', {
          d: 'M 260 35 L 285 35 L 282 55 C 282 60 263 60 263 55 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('path', {
          d: 'M 285 38 C 292 38 292 48 284 48',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('path', {
          d: 'M 268 28 C 268 25 272 25 272 22',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round',
        }),

        // 4. Speech bubble with dots (middle-left)
        svgEl('path', {
          d: 'M 35 120 C 35 110 55 110 55 120 C 55 128 48 130 42 135 L 40 142 L 36 135 C 32 132 35 125 35 120 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('circle', { cx: '42', cy: '122', r: '1.5', fill: 'currentColor' }),
        svgEl('circle', { cx: '48', cy: '122', r: '1.5', fill: 'currentColor' }),

        // 5. Crescent Moon & Stars (center)
        svgEl('path', {
          d: 'M 160 120 A 14 14 0 1 1 146 134 A 11 11 0 1 0 160 120 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('path', {
          d: 'M 180 115 L 182 120 L 187 121 L 183 124 L 184 129 L 180 126 L 176 129 L 177 124 L 173 121 L 178 120 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.5',
        }),

        // 6. Hourglass (middle-right)
        svgEl('path', {
          d: 'M 265 120 L 285 120 L 275 135 L 285 150 L 265 150 L 275 135 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linejoin': 'round',
        }),
        svgEl('circle', { cx: '275', cy: '135', r: '2', fill: 'currentColor' }),

        // 7. Headphones (bottom-left)
        svgEl('path', {
          d: 'M 35 220 A 18 18 0 0 1 71 220',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('rect', {
          x: '30',
          y: '218',
          width: '8',
          height: '14',
          rx: '4',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('rect', {
          x: '68',
          y: '218',
          width: '8',
          height: '14',
          rx: '4',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),

        // 8. Heart (bottom-center)
        svgEl('path', {
          d: 'M 160 215 C 150 205 138 215 148 226 L 160 236 L 172 226 C 182 215 170 205 160 215 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),

        // 9. Camera (bottom-right)
        svgEl('rect', {
          x: '255',
          y: '215',
          width: '28',
          height: '20',
          rx: '4',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('circle', {
          cx: '269',
          cy: '225',
          r: '6',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('rect', {
          x: '260',
          y: '210',
          width: '8',
          height: '5',
          rx: '1',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.5',
        }),

        // 10. Sparkles & Accents distributed
        svgEl('circle', { cx: '100', cy: '75', r: '2', fill: 'currentColor' }),
        svgEl('circle', { cx: '220', cy: '85', r: '2', fill: 'currentColor' }),
        svgEl('circle', { cx: '110', cy: '180', r: '2.5', fill: 'currentColor' }),
        svgEl('circle', { cx: '225', cy: '180', r: '2', fill: 'currentColor' }),
        svgEl('circle', { cx: '110', cy: '280', r: '2', fill: 'currentColor' }),
        svgEl('circle', { cx: '210', cy: '275', r: '2.5', fill: 'currentColor' }),

        // 11. Musical note
        svgEl('path', {
          d: 'M 100 240 L 100 220 L 115 215 L 115 235',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        }),
        svgEl('circle', { cx: '95', cy: '242', r: '4', fill: 'currentColor' }),
        svgEl('circle', { cx: '110', cy: '237', r: '4', fill: 'currentColor' }),
      ),
    ),
    svgEl('rect', {
      width: '100%',
      height: '100%',
      fill: 'url(#wa-doodle-pattern)',
    }),
  );

  container.appendChild(svg);
  return container;
}
