# Contributing to rewhatsapp

Thank you for your interest in improving **rewhatsapp**! We welcome contributions ranging from bug fixes and test cases to multilingual locale support.

---

## Architecture Principles

1. **Zero Runtime Dependencies**: No npm packages, external bundles, or CDNs. Every runtime line must be vanilla HTML, CSS, or modern ES Modules.
2. **Pure Core with Zero DOM**: All parsing, timeline mathematics, sentiment analysis, and gap calculations in `src/core/` must run under Node.js without any browser globals.
3. **Strict Data Safety**: Never introduce `innerHTML` or `insertAdjacentHTML` with user-controlled data. Use DOM construction APIs (`textContent`, `createElement`).
4. **JSDoc Types & Linting**: All JavaScript files must begin with `// @ts-check` and pass `npm run lint` and `npm run typecheck` cleanly.

---

## Adding a New Language Locale

WhatsApp exports system events and media placeholders in the user's localized phone language (e.g. `Messages and calls are end-to-end encrypted`, `Nachrichten und Anrufe sind Ende-zu-Ende verschlüsselt`).

To add or expand support for a language:

1. Open [`src/core/parser/locales.js`](file:///src/core/parser/locales.js).
2. Locate the appropriate categories:
   - `SYSTEM_EVENT_PATTERNS`: regex patterns identifying security changes, participant additions, missed calls, etc.
   - `MEDIA_PLACEHOLDER_PATTERNS`: regex patterns matching omitted images, videos, audio, documents, and stickers.
   - `DELETED_MESSAGE_PATTERNS`: strings indicating deleted messages.
3. Add your language patterns with clear inline comments.
4. Add a synthetic test fixture in `test/fixtures/` and a corresponding test case in `test/parser.test.js`.
5. Run the test suite:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```
6. Submit a pull request!

---

## Local Development Workflow

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/rewhatsapp.git
   cd rewhatsapp
   ```

2. **Run tests and typecheck**:

   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

3. **Start local static server**:
   ```bash
   npm run serve
   ```
   Open `http://127.0.0.1:5173` in your browser.

---

## Code of Conduct

Please treat every contributor and user with kindness, empathy, and respect.
