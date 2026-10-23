// @ts-check

import { svgEl } from '../util/dom.js';

/**
 * Custom SVG icon set for rewhatsapp UI chrome.
 * Standardized on 24x24 grid, 1.75px stroke, rounded caps and joins.
 * Strictly replaces emojis in UI chrome.
 */

/**
 * @param {string} name
 * @param {Record<string, any>} [attrs]
 * @returns {SVGElement}
 */
export function createIcon(name, attrs = {}) {
  const baseAttrs = {
    viewBox: '0 0 24 24',
    width: '20',
    height: '20',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.75',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    ...attrs,
  };

  switch (name) {
    case 'upload':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        svgEl('polyline', { points: '17 8 12 3 7 8' }),
        svgEl('line', { x1: '12', y1: '3', x2: '12', y2: '15' }),
      );

    case 'play':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('polygon', { points: '6 4 20 12 6 20 6 4', fill: 'currentColor', stroke: 'none' }),
      );

    case 'pause':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('rect', {
          x: '6',
          y: '4',
          width: '4',
          height: '16',
          fill: 'currentColor',
          stroke: 'none',
        }),
        svgEl('rect', {
          x: '14',
          y: '4',
          width: '4',
          height: '16',
          fill: 'currentColor',
          stroke: 'none',
        }),
      );

    case 'shield':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
      );

    case 'check':
      return svgEl('svg', baseAttrs, svgEl('polyline', { points: '20 6 9 17 4 12' }));

    case 'chevron-down':
      return svgEl('svg', baseAttrs, svgEl('polyline', { points: '6 9 12 15 18 9' }));

    case 'chevron-up':
      return svgEl('svg', baseAttrs, svgEl('polyline', { points: '18 15 12 9 6 15' }));

    case 'clock':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('circle', { cx: '12', cy: '12', r: '9' }),
        svgEl('polyline', { points: '12 7 12 12 15 14' }),
      );

    case 'users':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        svgEl('circle', { cx: '9', cy: '7', r: '4' }),
        svgEl('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
        svgEl('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
      );

    case 'message':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }),
      );

    case 'zap':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
      );

    case 'arrow-left':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('line', { x1: '19', y1: '12', x2: '5', y2: '12' }),
        svgEl('polyline', { points: '12 19 5 12 12 5' }),
      );

    case 'arrow-right':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
        svgEl('polyline', { points: '12 5 19 12 12 19' }),
      );

    case 'close':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
        svgEl('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
      );

    case 'fullscreen':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', {
          d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
        }),
      );

    case 'volume':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }),
        svgEl('path', { d: 'M15.54 8.46a5 5 0 0 1 0 7.07' }),
        svgEl('path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14' }),
      );

    case 'volume-off':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('line', { x1: '1', y1: '1', x2: '23', y2: '23' }),
        svgEl('path', { d: 'M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6' }),
        svgEl('path', { d: 'M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23' }),
      );

    case 'insights':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('line', { x1: '18', y1: '20', x2: '18', y2: '10' }),
        svgEl('line', { x1: '12', y1: '20', x2: '12', y2: '4' }),
        svgEl('line', { x1: '6', y1: '20', x2: '6', y2: '14' }),
      );

    case 'rewind':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('polygon', { points: '11 19 2 12 11 5 11 19', fill: 'currentColor', stroke: 'none' }),
        svgEl('polygon', {
          points: '22 19 13 12 22 5 22 19',
          fill: 'currentColor',
          stroke: 'none',
        }),
      );

    case 'lock':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
        svgEl('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }),
      );

    case 'sparkles':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', {
          d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z',
        }),
        svgEl('path', { d: 'M5 3v4' }),
        svgEl('path', { d: 'M19 17v4' }),
        svgEl('path', { d: 'M3 5h4' }),
        svgEl('path', { d: 'M17 19h4' }),
      );

    case 'photo':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
        svgEl('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
        svgEl('polyline', { points: '21 15 16 10 5 21' }),
      );

    case 'video':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('polygon', { points: '23 7 16 12 23 17 23 7' }),
        svgEl('rect', { x: '1', y: '5', width: '15', height: '14', rx: '2', ry: '2' }),
      );

    case 'sticker':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', {
          d: 'M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5L15.5 3z',
        }),
        svgEl('path', { d: 'M15 3v6h6' }),
      );

    case 'mic':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', { d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' }),
        svgEl('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
        svgEl('line', { x1: '12', y1: '19', x2: '12', y2: '23' }),
        svgEl('line', { x1: '8', y1: '23', x2: '16', y2: '23' }),
      );

    case 'search':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('circle', { cx: '11', cy: '11', r: '8' }),
        svgEl('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
      );

    case 'phone':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', {
          d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
        }),
      );

    case 'more-vertical':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('circle', { cx: '12', cy: '12', r: '1.25', fill: 'currentColor' }),
        svgEl('circle', { cx: '12', cy: '5', r: '1.25', fill: 'currentColor' }),
        svgEl('circle', { cx: '12', cy: '19', r: '1.25', fill: 'currentColor' }),
      );

    case 'log-out':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
        svgEl('polyline', { points: '16 17 21 12 16 7' }),
        svgEl('line', { x1: '21', y1: '12', x2: '9', y2: '12' }),
      );

    case 'minimize-2':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('polyline', { points: '4 14 10 14 10 20' }),
        svgEl('polyline', { points: '20 10 14 10 14 4' }),
        svgEl('line', { x1: '14', y1: '10', x2: '21', y2: '3' }),
        svgEl('line', { x1: '3', y1: '21', x2: '10', y2: '14' }),
      );

    case 'sliders':
      return svgEl(
        'svg',
        baseAttrs,
        svgEl('line', { x1: '4', y1: '21', x2: '4', y2: '14' }),
        svgEl('line', { x1: '4', y1: '10', x2: '4', y2: '3' }),
        svgEl('line', { x1: '12', y1: '21', x2: '12', y2: '12' }),
        svgEl('line', { x1: '12', y1: '8', x2: '12', y2: '3' }),
        svgEl('line', { x1: '20', y1: '21', x2: '20', y2: '16' }),
        svgEl('line', { x1: '20', y1: '12', x2: '20', y2: '3' }),
        svgEl('line', { x1: '1', y1: '14', x2: '7', y2: '14' }),
        svgEl('line', { x1: '9', y1: '8', x2: '15', y2: '8' }),
        svgEl('line', { x1: '17', y1: '16', x2: '23', y2: '16' }),
      );

    default:
      return svgEl('svg', baseAttrs);
  }
}
