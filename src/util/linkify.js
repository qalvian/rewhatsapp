// @ts-check

import { el } from './dom.js';

// Matches standard http and https URLs
const URL_REGEX = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?"'\]])/g;

/**
 * Parses message text and returns an array of DOM Nodes (text nodes and safe <a> elements).
 * Strictly creates nodes with DOM APIs and textContent.
 *
 * @param {string} text
 * @returns {Node[]}
 */
export function linkifyText(text) {
  if (!text) return [];

  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const url = match[1];
    const matchIndex = match.index;

    // Text leading up to URL
    if (matchIndex > lastIndex) {
      nodes.push(document.createTextNode(text.slice(lastIndex, matchIndex)));
    }

    // Safe anchor element (http/https only)
    const anchor = el('a', {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'wa-link',
      text: url,
    });
    nodes.push(anchor);

    lastIndex = matchIndex + url.length;
  }

  // Trailing text
  if (lastIndex < text.length) {
    nodes.push(document.createTextNode(text.slice(lastIndex)));
  }

  return nodes;
}
