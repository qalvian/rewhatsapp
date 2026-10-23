# Security Policy & Threat Model

`rewhatsapp` is designed from first principles around a single inviolable guarantee: **your personal conversations never leave your device.**

---

## 1. Threat Model & Design Guarantees

### What rewhatsapp Protects Against

1. **Accidental Network Exfiltration**:
   - Enforced by a strict Content Security Policy (CSP):
     ```http
     default-src 'none';
     script-src 'self';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: blob:;
     font-src 'self';
     connect-src 'self';
     manifest-src 'self';
     worker-src 'self';
     base-uri 'none';
     form-action 'none'
     ```
   - Outbound requests are blocked at the browser engine level. Zero telemetry beacons, analytics endpoints, or external server calls.
2. **Third-Party Telemetry & Tracking**:
   - Zero external scripts, analytics SDKs, CDNs, or external font stylesheets.
   - All fonts utilize standard system UI font stacks (`ui-serif`, `-apple-system`, `system-ui`).
   - All audio effects (send pops, receive chimes, ticks) are procedurally synthesized on-the-fly via the Web Audio API. Zero audio assets are fetched.
3. **Cross-Site Scripting (XSS) via Malicious Chat Content**:
   - **Zero `innerHTML` or `insertAdjacentHTML` with user data**: All message text, participant names, and dates are rendered strictly via `document.createElement()`, `element.textContent`, and DOM text nodes.
   - Hyperlinks are passed through a strict validator (`/^https?:\/\//i`) and rendered with `target="_blank"` and `rel="noopener noreferrer"`.
4. **Prototype Pollution via Malicious Sender Names**:
   - WhatsApp participants can theoretically be named `__proto__`, `constructor`, or `toString`.
   - All participant dictionaries in `rewhatsapp` use native `Map` objects rather than raw JavaScript object literals (`{}`), preventing prototype tampering.

---

## 2. Verifying Security in Your Browser

You can independently audit that nothing leaves your device in less than 30 seconds:

1. Open `rewhatsapp` in any modern web browser.
2. Open Browser DevTools (`F12` or `Cmd + Option + I`).
3. Switch to the **Network** tab and check **Preserve log**.
4. Drag in your WhatsApp export or click **Watch a sample memory**.
5. Observe the network traffic: **Zero external HTTP requests are dispatched.**

---

## 3. Reporting a Vulnerability

If you discover a potential security flaw, Content Security Policy bypass, or data sanitization issue, please report it privately:

- **Contact:** Open a private security advisory on GitHub at `https://github.com/qalvian/rewhatsapp/security/advisories` or email `qalvian <qalvian@atomicmail.io>`.
- **Maintainer:** `qalvian`
- We will acknowledge receipt within 24 to 72 hours and coordinate a public release with full disclosure.
