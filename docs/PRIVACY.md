# Privacy Architecture & Verification Guide

Your WhatsApp conversations contain your most intimate, vulnerable, and cherished moments. When you drag an export into **rewhatsapp**, **none of it ever leaves your browser**.

This document explains our security architecture and how you can independently verify it in your own browser's developer tools.

---

## 1. Core Privacy Guarantees

1. **100% Client-Side Processing**:
   - Files are parsed directly in your browser memory or inside a dedicated local Web Worker.
   - Text is never uploaded, transferred, or stored on any server.
2. **Zero Third-Party Assets & CDNs**:
   - No external fonts (Google Fonts, Adobe Fonts, etc.). Standard system UI fonts are used.
   - No analytics trackers (Google Analytics, Mixpanel, Sentry, etc.).
   - No external CDNs (Cloudflare, cdnjs, unpkg, etc.).
3. **Procedural Web Audio**:
   - Audio effects (send pops, receive chimes, ticks) are generated dynamically using the Web Audio API oscillator nodes. Zero audio files are downloaded.
4. **Minimal Local Persistence**:
   - Only user preferences (`theme`, `playback_speed`, `audio_muted`) are stored in browser `localStorage`.
   - Your chat messages and participant details are never persisted to disk or indexedDB. Closing or refreshing the tab clears all conversation data from memory immediately.

---

## 2. Content Security Policy (CSP)

`rewhatsapp` serves an uncompromising Content Security Policy via `<meta http-equiv="Content-Security-Policy">`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none';
           script-src 'self';
           style-src 'self';
           img-src 'self' data: blob:;
           font-src 'self';
           connect-src 'none';
           worker-src 'self';
           base-uri 'none';
           form-action 'none'"
/>
```

### What this means:

- `connect-src 'none'`: The browser will outright reject any attempt to make network calls via `fetch()`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or `navigator.sendBeacon`.
- `default-src 'none'`: Blocks all other resource types unless explicitly permitted.
- `script-src 'self'`: Disallows inline scripts (`<script>...</script>`) and external script URLs.

---

## 3. How to Verify in DevTools (30-Second Audit)

You do not have to take our word for it. You can verify it yourself in any browser:

1. Open `rewhatsapp` in Chrome, Safari, Firefox, Edge, or Brave.
2. Open **Developer Tools**:
   - **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
   - **macOS**: Press `Cmd + Option + I`
3. Click on the **Network** tab.
4. Ensure the **All** filter is selected and check **Preserve log**.
5. Drag and drop your WhatsApp export `.txt` or `.zip` file into the portal (or click **Try a sample memory**).
6. Configure the replay and click **Travel back ✨**.
7. Watch the conversation replay in real-time.
8. Look at the Network tab:
   - Notice that **no network requests are dispatched**.
   - No background pings, no analytics beacons, no telemetry.
   - You can even disconnect your Wi-Fi / Ethernet completely after loading the page, and the entire app will function without interruption.
