// @ts-check
/**
 * Vanilla port of the BlurText reveal effect (React Bits) on the Web Animations API.
 * Zero dependencies. Honors prefers-reduced-motion. Builds nodes with DOM APIs only.
 */

/** @typedef {'blur'|'zoom'|'tilt'|'focus'|'drift'} Effect */
/** @typedef {'top'|'bottom'|'left'|'right'} Direction */
/** @typedef {'start'|'center'|'end'|'random'} StaggerFrom */
/**
 * @typedef {object} RevealOptions
 * @property {Effect} [effect]
 * @property {'words'|'letters'} [animateBy]
 * @property {Direction} [direction]
 * @property {StaggerFrom} [staggerFrom]
 * @property {'view'|'load'|'hover'|'click'} [trigger]
 * @property {number} [delay]       Stagger between pieces, ms.
 * @property {number} [startDelay]  Delay before the first piece, ms.
 * @property {number} [duration]    Per-piece duration, ms.
 * @property {number} [blur]        Starting blur, px.
 * @property {number} [distance]    Travel distance, px.
 * @property {number} [threshold]
 * @property {string} [rootMargin]
 * @property {() => void} [onComplete]
 */
/** @typedef {{ play: () => void, destroy: () => void }} RevealHandle */

/** @type {Required<Omit<RevealOptions, 'onComplete'>>} */
const DEFAULTS = {
  effect: 'blur',
  animateBy: 'words',
  direction: 'top',
  staggerFrom: 'start',
  trigger: 'view',
  delay: 70,
  startDelay: 0,
  duration: 700,
  blur: 10,
  distance: 24,
  threshold: 0.2,
  rootMargin: '0px 0px -10% 0px',
};

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_SOFT = 'cubic-bezier(0.34, 1.3, 0.64, 1)';
const EASE_FOCUS = 'cubic-bezier(0.65, 0, 0.35, 1)';
const MAX_LETTER_CHARS = 60;
const MAX_WORD_PIECES = 80;
const LOW_END_BLUR_PX = 4;
const LOW_END_CORES = 2;

/** @type {Record<Direction, ['X'|'Y', number]>} */
const AXES = { top: ['Y', -1], bottom: ['Y', 1], left: ['X', -1], right: ['X', 1] };
/** @type {RevealHandle} */
const NOOP = Object.freeze({ play() {}, destroy() {} });

const blurOf = (/** @type {number} */ n) => `blur(${Math.max(0, n)}px)`;
const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Every frame keeps the same transform-function list so the browser can interpolate it.
 * @param {Effect} effect @param {Direction} direction @param {number} blur @param {number} dist
 * @returns {Keyframe[]}
 */
export function buildKeyframes(effect, direction, blur, dist) {
  const [axis, sign] = AXES[direction] ?? AXES.top;
  const move = (/** @type {number} */ v) => `translate${axis}(${v}px)`;

  switch (effect) {
    case 'zoom':
      return [
        {
          filter: blurOf(blur * 1.2),
          opacity: 0,
          transform: `${move(sign * dist * 0.35)} scale(1.4)`,
        },
        {
          filter: blurOf(blur * 0.2),
          opacity: 0.9,
          transform: `${move(0)} scale(0.97)`,
          offset: 0.6,
        },
        { filter: blurOf(0), opacity: 1, transform: `${move(0)} scale(1)` },
      ];
    case 'tilt': {
      const rot = axis === 'Y' ? 'rotateX' : 'rotateY';
      const lean = axis === 'Y' ? -sign : sign;
      const t = (/** @type {number} */ r, /** @type {number} */ m) =>
        `perspective(600px) ${rot}(${r}deg) ${move(m)}`;
      return [
        { filter: blurOf(blur), opacity: 0, transform: t(lean * 55, sign * dist * 0.5) },
        {
          filter: blurOf(blur * 0.15),
          opacity: 0.95,
          transform: t(-lean * 8, -sign * dist * 0.04),
          offset: 0.6,
        },
        { filter: blurOf(0), opacity: 1, transform: t(0, 0) },
      ];
    }
    case 'focus':
      return [
        { filter: blurOf(blur * 1.4), opacity: 0.32, transform: 'scale(1.12)' },
        { filter: blurOf(blur * 0.1), opacity: 0.95, transform: 'scale(0.995)', offset: 0.72 },
        { filter: blurOf(0), opacity: 1, transform: 'scale(1)' },
      ];
    case 'drift': {
      const h = direction === 'right' ? 1 : -1;
      const t = (/** @type {number} */ x, /** @type {number} */ k) =>
        `translateX(${x}px) skewX(${k}deg)`;
      return [
        { filter: blurOf(blur), opacity: 0, transform: t(h * dist * 1.6, h * 28) },
        {
          filter: blurOf(blur * 0.15),
          opacity: 0.95,
          transform: t(-h * dist * 0.06, -h * 7),
          offset: 0.62,
        },
        { filter: blurOf(0), opacity: 1, transform: t(0, 0) },
      ];
    }
    default:
      return [
        { filter: blurOf(blur), opacity: 0, transform: move(sign * dist) },
        {
          filter: blurOf(blur / 2),
          opacity: 0.5,
          transform: move((-sign * dist) / 10),
          offset: 0.5,
        },
        { filter: blurOf(0), opacity: 1, transform: move(0) },
      ];
  }
}

/**
 * Deterministic stagger rank per piece (same text, same order, every time).
 * @param {number} count @param {StaggerFrom} from @param {string} seedText
 * @returns {number[]}
 */
export function buildRanks(count, from, seedText) {
  const ranks = Array.from({ length: count }, (_, i) => i);
  if (from === 'end') return ranks.map((i) => count - 1 - i);
  if (from === 'center') {
    const mid = (count - 1) / 2;
    const offset = count % 2 === 0 ? 0.5 : 0;
    return ranks.map((i) => Math.abs(i - mid) - offset);
  }
  if (from === 'random') {
    let seed = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619) >>> 0;
    }
    const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    const order = ranks.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      const temp = order[i];
      order[i] = order[j] ?? 0;
      order[j] = temp ?? 0;
    }
    order.forEach((piece, rank) => {
      ranks[piece] = rank;
    });
  }
  return ranks;
}

/** @param {Record<string, unknown>} obj */
const definedOnly = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/**
 * Animate the text of `el` piece by piece. Marks the element with data-rt ("on" | "static")
 * in every code path so the no-flash CSS can always release it.
 * @param {HTMLElement} el
 * @param {RevealOptions} [options]
 * @returns {RevealHandle}
 */
export function revealText(el, options = {}) {
  const o = { ...DEFAULTS, ...definedOnly(options) };
  const existingSr = el.querySelector('.sr-only');
  const rawText = el.dataset.rtOriginal || existingSr?.textContent || el.textContent || '';
  const text = rawText.replace(/\s+/g, ' ').trim();
  if (!el.dataset.rtOriginal && text) {
    el.dataset.rtOriginal = text;
  }
  const words = text.split(' ');
  const letterMode = o.animateBy === 'letters' && text.length <= MAX_LETTER_CHARS;

  if (!text || prefersReducedMotion() || (!letterMode && words.length > MAX_WORD_PIECES)) {
    el.dataset.rt = 'static';
    return NOOP;
  }

  const lowEnd =
    typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) <= LOW_END_CORES;
  const blur = lowEnd ? Math.min(o.blur, LOW_END_BLUR_PX) : o.blur;

  /** @type {HTMLElement[]} */
  const pieces = [];
  const frag = document.createDocumentFragment();

  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  frag.append(sr);

  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  words.forEach((word, w) => {
    const wrap = document.createElement('span');
    wrap.className = 'rt-word';
    wrap.setAttribute('aria-hidden', 'true');
    if (letterMode) {
      for (const { segment } of segmenter.segment(word)) {
        const piece = document.createElement('span');
        piece.className = 'rt-piece';
        piece.textContent = segment;
        wrap.append(piece);
        pieces.push(piece);
      }
    } else {
      wrap.classList.add('rt-piece');
      wrap.textContent = word;
      pieces.push(wrap);
    }
    frag.append(wrap);
    if (w < words.length - 1) frag.append(document.createTextNode(' '));
  });

  el.replaceChildren(frag);
  el.dataset.rt = 'on';

  const frames = buildKeyframes(o.effect, o.direction, blur, o.distance);
  const ranks = buildRanks(pieces.length, o.staggerFrom, text);
  const easing = o.effect === 'focus' ? EASE_FOCUS : o.effect === 'blur' ? EASE_SOFT : EASE_OUT;

  /** @type {Animation[]} */
  let anims = [];
  let token = 0;
  /** @type {IntersectionObserver | null} */
  let observer = null;

  const setHidden = (/** @type {boolean} */ hidden) =>
    pieces.forEach((p) => p.classList.toggle('rt-hidden', hidden));
  const cancelAll = () => {
    anims.forEach((a) => a.cancel());
    anims = [];
  };

  async function play() {
    const mine = ++token;
    cancelAll();
    setHidden(false); // fill:'backwards' holds the first frame through each piece's delay
    el.classList.add('rt-live');
    anims = pieces.map((p, i) =>
      p.animate(frames, {
        duration: o.duration,
        delay: o.startDelay + (ranks[i] ?? 0) * o.delay,
        easing,
        fill: 'backwards',
      }),
    );
    try {
      await Promise.all(anims.map((a) => a.finished));
    } catch {
      return; // cancelled by a newer run or destroy()
    }
    if (mine !== token) return;
    cancelAll();
    el.classList.remove('rt-live');
    options.onComplete?.();
  }

  if (o.trigger !== 'hover' && o.trigger !== 'click') setHidden(true);

  if (o.trigger === 'view') {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer?.disconnect();
          play();
        }
      },
      { threshold: o.threshold, rootMargin: o.rootMargin },
    );
    observer.observe(el);
  } else if (o.trigger === 'load') {
    requestAnimationFrame(play);
  } else {
    el.addEventListener(o.trigger === 'hover' ? 'pointerenter' : 'click', play);
  }

  return {
    play,
    destroy() {
      token++;
      observer?.disconnect();
      cancelAll();
      el.removeEventListener('pointerenter', play);
      el.removeEventListener('click', play);
      el.textContent = text;
      el.classList.remove('rt-live');
      el.dataset.rt = 'static';
    },
  };
}

/**
 * Swap an element's text and re-run the reveal. Cancels the previous run first so
 * animations never overlap. Use for wizard step titles and the rotating hero line.
 * @param {HTMLElement} el @param {RevealHandle} handle @param {string} next @param {RevealOptions} [options]
 * @returns {RevealHandle}
 */
export function retext(el, handle, next, options) {
  handle.destroy();
  el.textContent = next;
  return revealText(el, options);
}

/**
 * Declarative wiring, e.g. <h1 data-reveal="blur" data-reveal-by="words" data-reveal-delay="90" data-reveal-trigger="load">
 * @param {ParentNode} [root]
 * @returns {RevealHandle[]}
 */
export function initReveals(root = document) {
  const num = (/** @type {string | undefined} */ v) => (v === undefined ? undefined : Number(v));
  return Array.from(root.querySelectorAll('[data-reveal]'))
    .filter((node) => !(/** @type {HTMLElement} */ (node).dataset.rt))
    .map((node) => {
      const el = /** @type {HTMLElement} */ (node);
      const d = el.dataset;
      return revealText(el, {
        effect: /** @type {Effect} */ (d.reveal || 'blur'),
        animateBy: /** @type {any} */ (d.revealBy),
        direction: /** @type {any} */ (d.revealDir),
        staggerFrom: /** @type {any} */ (d.revealFrom),
        trigger: /** @type {any} */ (d.revealTrigger),
        delay: num(d.revealDelay),
        startDelay: num(d.revealStart),
        duration: num(d.revealDuration),
        blur: num(d.revealBlur),
        distance: num(d.revealDistance),
      });
    });
}
