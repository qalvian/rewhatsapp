// @ts-check

/**
 * Accessibility utilities for ARIA live announcements and focus trapping.
 */

let lastAnnouncementTime = 0;
let pendingAnnouncement = '';
/** @type {any} */
let announcementTimeout = null;

/**
 * Announces a message politely to screen readers via the #a11y-announcer element.
 * Throttles high-frequency announcements (e.g. during fast replay) so assistive technology is not flooded.
 *
 * @param {string} text
 * @param {boolean} [force=false]
 */
export function announce(text, force = false) {
  if (typeof document === 'undefined') return;
  const announcer = document.getElementById('a11y-announcer');
  if (!announcer) return;

  const now = performance.now();
  const timeSinceLast = now - lastAnnouncementTime;

  if (force || timeSinceLast >= 500) {
    if (announcementTimeout) {
      clearTimeout(announcementTimeout);
      announcementTimeout = null;
    }
    announcer.textContent = text;
    lastAnnouncementTime = now;
  } else {
    // Queue pending announcement throttled
    pendingAnnouncement = text;
    if (!announcementTimeout) {
      announcementTimeout = setTimeout(() => {
        if (announcer && pendingAnnouncement) {
          announcer.textContent = pendingAnnouncement;
          lastAnnouncementTime = performance.now();
          pendingAnnouncement = '';
        }
        announcementTimeout = null;
      }, 500 - timeSinceLast);
    }
  }
}

/**
 * Traps keyboard focus within a modal dialog or sheet.
 * Returns an unbind cleanup function.
 *
 * @param {HTMLElement} container
 * @returns {() => void}
 */
export function trapFocus(container) {
  const focusableSelector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    const focusables = Array.from(container.querySelectorAll(focusableSelector)).filter(
      (node) => node instanceof HTMLElement && node.offsetParent !== null,
    );

    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        // @ts-ignore
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        // @ts-ignore
        first.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Auto-focus first focusable element inside container
  const firstFocusable = container.querySelector(focusableSelector);
  if (firstFocusable instanceof HTMLElement) {
    firstFocusable.focus();
  }

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
