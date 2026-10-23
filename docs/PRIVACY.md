# Privacy Policy & Architecture (India)

**Version:** 1.0  
**Effective Date:** 23 October 2026  
**Last Updated:** 23 October 2026  
**Service Operator:** qalvian  
**Contact:** qalvian@atomicmail.io

---

## 1. Summary & Scope

This Privacy Policy outlines the technical architecture, data handling practices, and legal framework governing **rewhatsapp**, an independent, client-side personal memory replayer maintained by **qalvian**.

rewhatsapp is engineered from the ground up to guarantee that **no conversation data, message texts, timestamps, or contact identifiers ever leave your device**. All processing is executed strictly within the volatile memory (RAM) of the user's web browser environment. Once the web application is loaded, network access can be terminated (or Airplane Mode enabled) without impacting functionality.

---

## 2. Legal Position: Zero-Server Processing and Data Fiduciary Status

We do not collect, transmit, inspect, store, or retain user communications, exported conversation archives, or contact identifiers.

Under the _Digital Personal Data Protection Act, 2023 (DPDPA 2023)_ and related Indian data protection frameworks: because we do not determine the purpose or means of processing personal data on remote servers, and because users process their own exported conversations on their physical hardware for purely personal and non-commercial viewing, the Maintainer does not act as a "Data Fiduciary" or "Data Processor" with respect to conversation contents. This represents our architectural design and legal understanding of local client-side computing.

---

## 3. Data Not Collected

To provide complete transparency, rewhatsapp does not collect, record, log, or transmit:

- **Conversation Text & Timestamps:** Parsing occurs entirely in volatile browser memory.
- **Participant Identifiers:** Phone numbers, names, and avatars remain strictly local to the active tab.
- **Export Format Scope:** The Application currently supports text-based exports (`.txt` created via "Without Media"). Compressed archives (`.zip`) and attached media files (photos, videos, voice recordings) are not supported.
- **Connection Telemetry & IP Logs:** The client application generates zero network access logs.
- **Cookies & Third-Party Trackers:** Zero advertising scripts, tracking beacons, or tracking cookies are utilized.

---

## 4. Local Storage Disclosure

rewhatsapp uses browser `localStorage` solely to persist non-sensitive user interface preferences across sessions:

- `rewhatsapp_speed`: Saved playback speed multiplier (e.g., 1×, 2×, 4×).
- `rewhatsapp_muted`: Binary audio mute preference (true / false).
- `rewhatsapp_volume`: Web Audio output gain level (0.0 to 1.0).
- `rewhatsapp_legal_consent_v1`: Binary record of user acknowledgement of legal terms (true).

No conversation contents are ever written to persistent browser storage or disk. Users can clear stored preferences at any time via the "Clear stored preferences" control on the homepage or through browser settings.

---

## 5. Static Hosting Disclosure

The static HTML, CSS, and JavaScript assets comprising the Application are hosted on **GitHub Pages** (GitHub, Inc.). When a browser fetches these static files, the hosting network may automatically log standard HTTP request metadata (such as IP address, HTTP referer, request timestamp, and user-agent string). This transmission logging is governed entirely by GitHub's enterprise privacy policy and is outside the Maintainer's direct operational control.

---

## 6. Third-Party Information in Conversation Exports

Exported WhatsApp conversations contain personal communications and identifying data of third parties. The user bears sole legal responsibility for ensuring lawful authorization to process exported conversations. Users must restrict usage to lawful, personal, and private viewing.

---

## 7. Age & Eligibility

The Application is designed for individuals aged 18 years or older. Minors may use the Application only under the direct supervision of a parent or lawful guardian. The Application does not knowingly solicit or store information from minors.

---

## 8. Technical Security Safeguards

- **Strict Content Security Policy (CSP):** Declares `default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self';`, blocking unauthorized external outbound network requests.
- **Client-Side Parsing:** Local parsing runs in origin-restricted browser contexts without networking capabilities.
- **Public Open-Source Verification:** The complete source repository is publicly auditable on GitHub.

---

## 9. Rights Under the DPDPA 2023

Because rewhatsapp maintains no centralized databases, retains zero communication logs, and operates no user account infrastructure, the Maintainer possesses no records against which access, rectification, or erasure requests can be executed. Closing the browser tab immediately and irreversibly purges all conversation data from memory.

---

## 10. Grievance Officer & Redressal

In compliance with the _Information Technology Act, 2000_ and applicable statutory rules:

- **Designated Grievance Officer:** qalvian
- **Email:** qalvian@atomicmail.io
- **Jurisdiction:** India
- **Response Timelines:** Written communications will be acknowledged within 48 hours and substantively addressed within thirty (30) days.

---

## 11. Applicable Law

Formulated in accordance with the laws of the Republic of India:

- _Information Technology Act, 2000_
- _Digital Personal Data Protection Act, 2023 (DPDPA 2023)_
- _Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021_
- _Consumer Protection Act, 2019 / E-Commerce Rules, 2020_
