// @ts-check

import { svgEl, el } from '../../util/dom.js';

/**
 * Creates an authentic, near-invisible doodle SVG wallpaper tile (360x360).
 * Calm, 1px strokes, <= 28px motifs, ~35 evenly distributed elements.
 * Chat messages dominate without visual competition.
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
          width: '360',
          height: '360',
          patternUnits: 'userSpaceOnUse',
        },
        // Row 1 (y: 20-45)
        // 1. Clock (cx: 30, cy: 30, r: 9) - 18px
        svgEl('circle', {
          cx: '30',
          cy: '30',
          r: '9',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 30 24 L 30 30 L 34 32',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
          'stroke-linecap': 'round',
        }),

        // 2. Paper airplane (x: 95, y: 25) - 20px
        svgEl('path', {
          d: 'M 90 22 L 110 30 L 90 38 L 95 30 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
          'stroke-linejoin': 'round',
        }),

        // 3. Coffee cup (x: 160, y: 26) - 18px
        svgEl('path', {
          d: 'M 154 26 L 170 26 L 168 38 C 168 41 156 41 156 38 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 170 28 C 174 28 174 34 170 34',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 4. Little star (x: 225, y: 28) - 14px
        svgEl('path', {
          d: 'M 225 22 L 227 27 L 232 28 L 228 32 L 229 37 L 225 34 L 221 37 L 222 32 L 218 28 L 223 27 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 5. Musical note (x: 285, y: 24) - 18px
        svgEl('circle', {
          cx: '282',
          cy: '36',
          r: '3',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 285 36 L 285 24 L 295 21 L 295 33',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('circle', {
          cx: '292',
          cy: '33',
          r: '3',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 6. Dot accent (x: 340, y: 30)
        svgEl('circle', { cx: '340', cy: '30', r: '1.5', fill: 'currentColor' }),

        // Row 2 (y: 80-105)
        // 7. Small heart (x: 40, y: 90) - 16px
        svgEl('path', {
          d: 'M 40 86 C 36 82 30 85 30 90 C 30 96 40 102 40 102 C 40 102 50 96 50 90 C 50 85 44 82 40 86 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 8. Speech bubble (x: 105, y: 90) - 18px
        svgEl('path', {
          d: 'M 100 84 C 95 84 92 88 92 92 C 92 96 95 99 98 100 L 97 104 L 102 101 C 108 101 108 97 108 92 C 108 88 105 84 100 84 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 9. Camera icon (x: 165, y: 90) - 18px
        svgEl('rect', {
          x: '158',
          y: '86',
          width: '18',
          height: '14',
          rx: '2',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('circle', {
          cx: '167',
          cy: '93',
          r: '3.5',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 10. Crescent moon (x: 230, y: 90) - 16px
        svgEl('path', {
          d: 'M 234 84 C 228 86 226 92 229 97 C 232 101 237 101 240 99 C 233 103 224 97 225 90 C 226 85 230 83 234 84 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 11. Headphones (x: 295, y: 90) - 20px
        svgEl('path', {
          d: 'M 288 94 C 288 88 293 84 298 84 C 303 84 308 88 308 94',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('rect', {
          x: '286',
          y: '93',
          width: '3',
          height: '6',
          rx: '1.5',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('rect', {
          x: '307',
          y: '93',
          width: '3',
          height: '6',
          rx: '1.5',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 12. Dot accent (x: 350, y: 88)
        svgEl('circle', { cx: '350', cy: '88', r: '1.5', fill: 'currentColor' }),

        // Row 3 (y: 140-165)
        // 13. Dot accent (x: 15, y: 150)
        svgEl('circle', { cx: '15', cy: '150', r: '1.5', fill: 'currentColor' }),

        // 14. Sunburst (x: 65, y: 150) - 18px
        svgEl('circle', {
          cx: '65',
          cy: '150',
          r: '4',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 65 142 L 65 144 M 65 156 L 65 158 M 57 150 L 59 150 M 71 150 L 73 150 M 59 144 L 61 146 M 69 154 L 71 156 M 59 156 L 61 154 M 69 146 L 71 144',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 15. Minimal plant leaf (x: 130, y: 150) - 18px
        svgEl('path', {
          d: 'M 125 158 C 125 148 135 144 135 144 C 135 144 137 154 127 158 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 125 158 L 132 150',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 16. Hourglass (x: 195, y: 150) - 16px
        svgEl('path', {
          d: 'M 190 144 L 202 144 L 196 151 L 202 158 L 190 158 L 196 151 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 17. Message envelope (x: 260, y: 150) - 18px
        svgEl('rect', {
          x: '252',
          y: '144',
          width: '18',
          height: '12',
          rx: '1',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 252 145 L 261 151 L 270 145',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 18. Sparkle (x: 320, y: 150) - 14px
        svgEl('path', {
          d: 'M 320 144 Q 320 150 326 150 Q 320 150 320 156 Q 320 150 314 150 Q 320 150 320 144',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // Row 4 (y: 200-225)
        // 19. Open book / notebook (x: 35, y: 210) - 18px
        svgEl('path', {
          d: 'M 26 206 C 30 208 35 208 35 214 L 35 215 C 35 209 40 209 44 207 M 26 215 C 30 217 35 217 35 223 C 35 218 40 218 44 216 M 26 206 L 26 215 M 35 214 L 35 223 M 44 207 L 44 216',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 20. Compass / dial (x: 100, y: 210) - 18px
        svgEl('circle', {
          cx: '100',
          cy: '210',
          r: '9',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('polygon', {
          points: '100,203 103,210 100,217 97,210',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 21. Dot accent (x: 155, y: 212)
        svgEl('circle', { cx: '155', cy: '212', r: '1.5', fill: 'currentColor' }),

        // 22. Umbrella (x: 215, y: 210) - 18px
        svgEl('path', {
          d: 'M 207 212 C 207 205 223 205 223 212 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 215 212 L 215 218 C 215 220 213 220 213 218',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 23. Chat bubble with exclamation (x: 275, y: 210) - 18px
        svgEl('path', {
          d: 'M 270 204 C 265 204 262 208 262 212 C 262 216 265 219 268 220 L 267 224 L 272 221 C 278 221 278 217 278 212 C 278 208 275 204 270 204 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 24. Dot accent (x: 335, y: 210)
        svgEl('circle', { cx: '335', cy: '210', r: '1.5', fill: 'currentColor' }),

        // Row 5 (y: 260-285)
        // 25. Cup of tea / coffee (x: 45, y: 270) - 18px
        svgEl('path', {
          d: 'M 38 268 L 52 268 L 50 279 C 50 282 40 282 40 279 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 52 270 C 55 270 55 275 52 275',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 26. Star cluster (x: 110, y: 270) - 14px
        svgEl('path', {
          d: 'M 110 264 Q 110 269 115 269 Q 110 269 110 274 Q 110 269 105 269 Q 110 269 110 264',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 27. Paper airplane 2 (x: 175, y: 270) - 18px
        svgEl('path', {
          d: 'M 170 278 L 186 266 L 176 282 L 174 276 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
          'stroke-linejoin': 'round',
        }),

        // 28. Small clock (x: 240, y: 270) - 16px
        svgEl('circle', {
          cx: '240',
          cy: '270',
          r: '8',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 240 265 L 240 270 L 244 272',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 29. Musical note 2 (x: 300, y: 270) - 16px
        svgEl('circle', {
          cx: '298',
          cy: '276',
          r: '3',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 301 276 L 301 266 C 304 266 307 268 307 271',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // Row 6 (y: 320-345)
        // 30. Dot accent (x: 20, y: 330)
        svgEl('circle', { cx: '20', cy: '330', r: '1.5', fill: 'currentColor' }),

        // 31. Crescent moon 2 (x: 75, y: 330) - 16px
        svgEl('path', {
          d: 'M 78 322 C 73 324 71 330 74 334 C 77 338 81 337 84 336 C 77 340 70 334 71 328 C 72 323 75 321 78 322 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 32. Minimal camera 2 (x: 140, y: 330) - 18px
        svgEl('rect', {
          x: '132',
          y: '325',
          width: '18',
          height: '13',
          rx: '2',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('circle', {
          cx: '141',
          cy: '331',
          r: '3',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 33. Small heart 2 (x: 205, y: 330) - 16px
        svgEl('path', {
          d: 'M 205 326 C 201 322 196 325 196 329 C 196 335 205 340 205 340 C 205 340 214 335 214 329 C 214 325 209 322 205 326 Z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 34. Plant sprout (x: 270, y: 330) - 18px
        svgEl('path', {
          d: 'M 270 338 L 270 326 C 270 326 264 324 264 330 C 264 334 270 334 270 334 M 270 330 C 270 330 276 328 276 333 C 276 336 270 336 270 336',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),

        // 35. Compass / dial 2 (x: 330, y: 330) - 18px
        svgEl('circle', {
          cx: '330',
          cy: '330',
          r: '8',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
        svgEl('path', {
          d: 'M 326 334 L 334 326',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1',
        }),
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
