# rewhatsapp

<div align="center">

[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-blue.svg)](LICENSE)
[![Zero Runtime Dependencies](https://img.shields.io/badge/Runtime%20Dependencies-0-success.svg)](package.json)
[![Pure Vanilla JS & CSS](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-orange.svg)](#technical-deep-dive)
[![Test Suite: 94 Passing](https://img.shields.io/badge/Tests-94%2F94%20Passing-brightgreen.svg)](#quick-start)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-blueviolet.svg)](#privacy--security)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald.svg)](#privacy--security)

**A private, client-side time machine for your WhatsApp conversations.**  
*Replay past chats with the authentic pacing, pauses, and typing suspense of the moments they happened — 100% inside your browser. Nothing ever leaves your device.*

[Quick Start](#quick-start) • [Features](#key-features) • [Export Guide](#how-to-export-a-whatsapp-chat) • [Privacy Guarantee](#privacy--security) • [Technical Deep-Dive](#technical-deep-dive) • [License](#license)

</div>

---

## What is rewhatsapp?

WhatsApp export files (`.txt` or `.zip`) are cold, lifeless walls of text. They flatten months or years of conversations into static lines, erasing the emotional cadence of the moment: the 45-minute pause before an honest answer, the suspense of watching someone type, or the flurry of three quick messages in five seconds.

**rewhatsapp** brings those memories back to life. It reconstructs your chat into an authentic, theatrical playback engine directly inside your browser. You can watch conversations unfold at their original tempo or at customized speeds (-4× to +4×), explore activity heatmaps, and generate vintage keepsake cards.

---

## Key Features

- **Authentic Living Playback**: Messages type themselves out letter-by-letter in the composer bar before sending, matching real-world typing speeds (`Base delay + 30ms/char`).
- **Pixel-Perfect Replay Theater**: Faithful recreation of WhatsApp Web with directional chat bubble tails, system chips, double ticks, and procedural wallpaper.
- **Universal Export Ingestion**: Seamlessly reads `.txt` and `.zip` exports from iOS and Android across 10+ languages, automatically solving ambiguous date formats (`DD/MM` vs `MM/DD`).
- **Zero-Asset Procedural Audio**: Generates realistic bubble pops, incoming chimes, and seeded voice note waveforms in real-time via the Web Audio API without downloading audio files.
- **Memory Insights & Epilogue**: Generates a 7×24 activity heatmap, response latency percentiles, sentiment sparklines, and a shareable vintage epilogue keepsake card.
- **Interactive Scrubber & Command Palette**: Seek through hundreds of thousands of messages instantaneously ($O(\log N)$ binary search) or navigate via Spotlight-style shortcuts (`Ctrl+K` / `Cmd+K`).
- **100% Offline & PWA**: Installable as a progressive web app on desktop or mobile. Operates fully in Airplane Mode with zero network traffic.

---

## Quick Start

### 1. Try It Live
You can explore the experience instantly by opening the app and clicking **"Watch sample memory"** to load a bundled demo chat.

### 2. Run Locally

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed:

```bash
# Clone the repository
git clone https://github.com/qalvian/rewhatsapp.git
cd rewhatsapp

# Install development dependencies (for linting and test suite only)
npm install

# Start the zero-dependency local static server
npm run dev
```

Open your browser and navigate to:
```
http://127.0.0.1:5173
```

To run the automated test suite (94 unit tests):
```bash
npm test
```

---

## How to Export a WhatsApp Chat

1. **On iPhone (iOS)**:
   - Open the conversation in WhatsApp.
   - Tap the contact or group name at the top.
   - Scroll to the bottom and tap **Export Chat**.
   - Select **Without Media** (for lightweight `.txt`) or **Attach Media** (for a `.zip` containing photos, voice notes, and videos).
2. **On Android**:
   - Open the conversation in WhatsApp.
   - Tap the three dots menu (`⋮`) in the top-right corner → **More** → **Export chat**.
   - Select **Without media** or **Include media**.
3. **Drop into rewhatsapp**:
   - Drag and drop your `.txt` or `.zip` file directly into the portal.
   - Choose who you were in the chat (so your messages appear on the right).
   - Press **Travel Back** and watch your conversation replay.

---

## Privacy & Security

Your conversations contain your most intimate and vulnerable communications. `rewhatsapp` is engineered around a zero-knowledge architecture:

- **Zero Server Processing**: 100% client-side parsing. The file bytes are read directly into browser memory (RAM) via the native HTML5 File API. No message text, attachment, or metadata is ever transmitted over the network.
- **Strict Content Security Policy (CSP)**: `default-src 'none'; script-src 'self'; connect-src 'self';`. The browser engine outright blocks any external network request.
- **Zero Runtime Dependencies**: Built with pure Vanilla JavaScript, CSS3, and HTML5. No external analytics, no tracking pixels, and no third-party CDNs.
- **Ephemeral Session Lifecycle**: All chat records dissolve from memory the moment you refresh or close the browser tab.

### The 30-Second Airplane Mode Test
You can independently audit this guarantee anytime:
1. Open `rewhatsapp` in your browser.
2. Open Developer Tools (`F12` or `Ctrl + Shift + I` / `Cmd + Option + I`) and switch to the **Network** tab.
3. Turn on **Airplane Mode** or disconnect your internet completely.
4. Drop in your chat export and start playback. The app functions completely offline with zero outbound network calls.

---

## Technical Deep-Dive

For complete architectural specifications, internal heuristics, and system documentation, please refer to the dedicated guides in `docs/`:

- [Architecture & Layer Separation](docs/ARCHITECTURE.md): Comprehensive review of the pure logic core, typed array storage (`Float64Array`), rAF virtual clock, procedural audio synthesis, and sticky card-deck choreography.
- [Parser Pipeline & Heuristics](docs/PARSING.md): Detailed breakdown of BOM sniffing, Unicode Bidi sanitization, candidate grammar scoring, constraint-solved date order detection, and sub-minute timestamp spreading.
- [Privacy Policy & Legal Framework](docs/PRIVACY.md): Legal position under the *Digital Personal Data Protection Act, 2023 (DPDPA)* and the EU *GDPR*.
- [Security Threat Model](SECURITY.md): Threat model, sandbox boundaries, and vulnerability reporting.

---

## Contributing

Contributions that respect the zero-runtime-dependency and privacy-first philosophy are welcome!

1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Ensure all quality checks pass:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```
5. Push to the branch (`git push origin feature/amazing-feature`) and open a Pull Request.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## Author

- **qalvian** ([github.com/qalvian](https://github.com/qalvian))

---

## License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

### What this means:
- **Permitted**: You are free to use, share, study, experiment with, and modify the software for any personal, educational, research, or noncommercial purpose.
- **Restricted**: Commercial use, selling, or redistributing the software for commercial advantage or monetary compensation is strictly prohibited without prior written permission from the licensor.

See the [LICENSE](LICENSE) file for the full legal text.

---

## Disclaimer

**rewhatsapp** is an independent, unofficial open-source project and is **not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with WhatsApp LLC or Meta Platforms, Inc.** WhatsApp is a registered trademark of WhatsApp LLC.
