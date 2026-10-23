# Privacy Policy & Architecture (India)

**Version:** 1.0  
**Effective Date:** 23 October 2026  
**Last Updated:** 23 October 2026  
**Service Operator:** qalvian  
**Contact:** qalvian@atomicmail.io  

---

## 1. Summary & Scope
This Privacy Policy outlines the technical architecture, data handling, and legal standards governing **rewhatsapp**, an independent personal memory viewer.

rewhatsapp is engineered from the ground up to ensure that **no conversation data, message texts, or media files ever leave your device**. All processing is executed locally in your browser memory.

---

## 2. Legal Position: Zero-Server Processing and Data Fiduciary Status
We do not collect, store, transmit, inspect, or retain your chat exports, message texts, or personal communications.

In plain legal terms under Indian law: because we do not determine the purpose or means of processing personal data on our servers, and the user processes their own chat export on their own device for purely personal use, it is our understanding that we do not act as a "Data Fiduciary" or "Data Processor" under the *Digital Personal Data Protection Act, 2023 (DPDPA 2023)* with respect to conversation contents. This represents our architectural and legal understanding of client-side computing and is provided for transparency, not as a contractual warranty or legal guarantee.

---

## 3. Data We Do Not Collect
- **Chats & Messages:** Zero server uploads, parsing is entirely in local RAM.
- **Contacts & Identifiers:** Phone numbers, names, and avatars stay on device.
- **Media Attachments:** Handled via local Blob URLs; never uploaded.
- **IP Logs & Telemetry:** No connection logging by the client application.
- **Cookies & Trackers:** No advertising tags, tracking pixels, or third-party cookies.

---

## 4. Local Storage Disclosure
rewhatsapp uses browser `localStorage` solely for optional interface preferences:
- `rewhatsapp_speed`: Saved playback speed multiplier (e.g. 2×, 5×).
- `rewhatsapp_muted`: Saved audio mute state (true / false).
- `rewhatsapp_volume`: Saved audio gain level (0.0 to 1.0).
- `rewhatsapp_legal_consent_v1`: Saved legal terms acknowledgement (true).

No chat data is ever written to disk or database. To clear preferences, click "Clear stored preferences" on the home page or clear site data in your browser.

---

## 5. Hosting Disclosure
The static HTML, CSS, and JavaScript files are hosted on **GitHub Pages**. The underlying hosting infrastructure may record standard web server transmission logs (IP address, user agent, request timestamp) as part of ordinary web serving. This occurs outside our direct control under the hosting provider's policies.

---

## 6. Third-Party Data in Chats & User Responsibility
WhatsApp chats contain third-party communications. Users are solely responsible for ensuring lawful use and are strongly encouraged to obtain consent from other participants for anything beyond private personal viewing.

---

## 7. Children & Eligibility
Intended for individuals aged 18 years or older. Minors may use only under parental or legal guardian supervision.

---

## 8. Technical Security Safeguards
- **Strict Content Security Policy (CSP):** `default-src 'none'; script-src 'self'; connect-src 'self';`. The browser engine outright blocks any external network request.
- **Sandboxed Web Workers:** Local parsing runs in isolated background workers without network access.
- **Open Source:** Full source code is public for independent verification.

---

## 9. Rights Under DPDPA 2023
Because rewhatsapp maintains no database, stores zero personal communications, and has no user accounts, access, correction, or erasure requests have no data to act on. Closing the browser tab purges all chat data immediately.

---

## 10. Grievance Officer
In compliance with the *Information Technology Act, 2000* and applicable rules:
- **Grievance Officer:** qalvian
- **Email:** qalvian@atomicmail.io
- **Address:** India
- **Timelines:** Acknowledged within 24–72 hours; resolved or formally addressed within 15–30 days.

---

## 11. Applicable Law
Formulated having regard to:
- *Information Technology Act, 2000*
- *Digital Personal Data Protection Act, 2023 (DPDPA 2023)*
- *Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021*
- *Consumer Protection Act, 2019 / E-Commerce Rules, 2020*
*(Note: Legal references are current as of 23 October 2026; statutory provisions may change).*
