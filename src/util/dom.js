// @ts-check

/**
 * Safe DOM creation utilities.
 * Strictly avoids innerHTML or insertAdjacentHTML with user data.
 * All nodes are constructed via createElement, setAttribute, and textContent.
 */

/**
 * Creates an HTMLElement with attributes, styles, events, and children.
 *
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, any>} [attrs]
 * @param {...(Node | string | null | undefined | false)} children
 * @returns {HTMLElementTagNameMap[K]}
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, val] of Object.entries(attrs)) {
    if (val === null || val === undefined || val === false) continue;

    if (key.startsWith('on') && typeof val === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, val);
    } else if (key === 'className' || key === 'class') {
      element.className = String(val);
    } else if (key === 'style') {
      if (typeof val === 'object' && val !== null) {
        Object.assign(element.style, val);
      } else {
        element.style.cssText = String(val);
      }
    } else if (key === 'text') {
      element.textContent = String(val);
    } else if (key === 'dataset' && typeof val === 'object') {
      Object.assign(element.dataset, val);
    } else if (key === 'aria' && typeof val === 'object') {
      for (const [ariaKey, ariaVal] of Object.entries(val)) {
        element.setAttribute(`aria-${ariaKey}`, String(ariaVal));
      }
    } else {
      element.setAttribute(key, String(val));
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Creates an SVGElement with attributes and children.
 *
 * @template {keyof SVGElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, any>} [attrs]
 * @param {...(SVGElement | Node | null | undefined)} children
 * @returns {SVGElementTagNameMap[K]}
 */
export function svgEl(tag, attrs = {}, ...children) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);

  for (const [key, val] of Object.entries(attrs)) {
    if (val === null || val === undefined || val === false) continue;
    const attrName = key === 'className' ? 'class' : key;
    element.setAttribute(attrName, String(val));
  }

  for (const child of children) {
    if (child instanceof Node) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Safely sets textContent of an element.
 * @param {HTMLElement} element
 * @param {string} text
 */
export function setText(element, text) {
  element.textContent = text;
}

/**
 * Empties an element of all children.
 * @param {HTMLElement} element
 */
export function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
