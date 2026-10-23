// @ts-check

import { el, svgEl } from '../../util/dom.js';

/**
 * @typedef {Object} PaletteAction
 * @property {string} id
 * @property {string} title
 * @property {string} [shortcut]
 * @property {() => void} run
 */

/**
 * Creates the Command Palette (Ctrl/Cmd+K) modal.
 *
 * @param {Object} params
 * @param {PaletteAction[]} params.actions
 * @param {() => void} params.onClose
 * @returns {HTMLElement}
 */
export function createCommandPalette({ actions, onClose }) {
  const overlay = el('div', {
    className: 'wa-palette-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'palette-search-label',
    },
  });

  const dialog = el('div', { className: 'wa-palette-dialog' });

  // Search input header
  const header = el(
    'div',
    { className: 'wa-palette-header' },
    svgEl(
      'svg',
      {
        className: 'wa-palette-search-icon',
        viewBox: '0 0 24 24',
        width: '18',
        height: '18',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      svgEl('circle', { cx: '11', cy: '11', r: '8' }),
      svgEl('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
    ),
  );

  const searchInput = /** @type {HTMLInputElement} */ (
    el('input', {
      id: 'palette-search-label',
      className: 'wa-palette-input',
      type: 'text',
      placeholder: 'Type a command or shortcut…',
      autocomplete: 'off',
      autocorrect: 'off',
      spellcheck: 'false',
    })
  );

  const kbdBadge = el('kbd', { className: 'wa-palette-kbd', text: 'ESC' });

  header.append(searchInput, kbdBadge);

  // Results list
  const resultsList = el('div', {
    className: 'wa-palette-results',
    role: 'menu',
    aria: { label: 'Command palette suggestions' },
  });

  let selectedIndex = 0;
  /** @type {PaletteAction[]} */
  let filteredActions = [...actions];

  function renderActions() {
    resultsList.textContent = '';

    if (filteredActions.length === 0) {
      resultsList.appendChild(
        el('div', { className: 'wa-palette-empty', text: 'No matching commands found' }),
      );
      return;
    }

    filteredActions.forEach((action, idx) => {
      const isSelected = idx === selectedIndex;
      const item = el(
        'button',
        {
          className: `wa-palette-item ${isSelected ? 'selected' : ''}`,
          type: 'button',
          role: 'menuitem',
          tabindex: '-1',
        },
        el('span', { className: 'wa-palette-item-title', text: action.title }),
        action.shortcut ? el('kbd', { className: 'wa-palette-item-shortcut', text: action.shortcut }) : null,
      );

      item.addEventListener('click', () => {
        onClose();
        action.run();
      });

      resultsList.appendChild(item);
    });
  }

  // Filter actions on input
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      filteredActions = [...actions];
    } else {
      filteredActions = actions.filter((a) => a.title.toLowerCase().includes(q));
    }
    selectedIndex = 0;
    renderActions();
  });

  // Keyboard navigation inside palette
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredActions.length > 0) {
        selectedIndex = (selectedIndex + 1) % filteredActions.length;
        renderActions();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredActions.length > 0) {
        selectedIndex = (selectedIndex - 1 + filteredActions.length) % filteredActions.length;
        renderActions();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) {
        onClose();
        action.run();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  dialog.append(header, resultsList);
  overlay.appendChild(dialog);

  // Render initial list and focus input
  renderActions();
  setTimeout(() => searchInput.focus(), 20);

  return overlay;
}
