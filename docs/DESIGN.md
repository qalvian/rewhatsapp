# Visual Hierarchy & Design System (Brief v6)

`rewhatsapp` follows a strict warm editorial design philosophy inspired by Linear, Apple, Arc, and Things 3.

---

## 1. Density & Spacing System (Brief v6)

1. **Spacing Scale:**
   - 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 88 px.
   - Defined systematically in `tokens.css` (`--space-1` through `--space-20`).

2. **Section Padding:**
   - Mobile: `48px`
   - Tablet: `64px`
   - Desktop: `88px`
   - Heading block to content gap: `20px–24px`
   - Gap between sibling cards: `12px` mobile, `16px` desktop

3. **Max Content Width & Gutters:**
   - Desktop max content width: `1120px` (with 12-column grid or 2-column balanced layouts).
   - Mobile layout: edge-to-edge with `16px` gutters (`padding: 0 16px`). Body background equals page background (`#FAF6F0`).

---

## 2. Interactive & Component Scale

1. **Buttons:**
   - **Primary:** `44px` high on mobile, `48px` max on desktop. Accent filled (`#E2724F`), radius `12px`, `15px` / `600` weight label, `16px` icons. Never wider than `320px` on desktop.
   - **Secondary:** `44px` high on mobile, `40px`–`48px` on desktop. Border `1px solid var(--color-border)`, radius `12px`.
   - **Touch Minimum:** Strict `44px` touch target across all interactive elements on mobile.
   - **Focus & Economy:** At most one filled button per viewport. No oversized pill buttons.

2. **Cards:**
   - Radius: `16px` (never oversized 28px).
   - Padding: `16px` mobile / `20px–24px` desktop.
   - Border: `1px solid var(--color-border)`, no or very light shadow.
   - **Strict Rule:** No card inside a card. Use hairline dividers (`1px solid var(--color-border)`) for grouping.
   - Icon tiles: `36px–40px`, radius `10px`.
   - Card title: `16px` / `600`, body: `14px–15px`, max 3 lines.

---

## 3. Typography & Hierarchy

1. **Type Hierarchy:**
   - **Display Headline (H1):** Serif display font, fluid `34px–56px`, weight `600`, line-height `1.1`, letter-spacing `-0.025em`.
   - **Section Dominant Heading (H2):** Serif display font, `28px` / `1.15` on mobile, `40px–44px` on desktop, sentence case, dark text (`#1F1A17`), positioned `8px` below the eyebrow.
   - **Eyebrow:** `12px` uppercase accent (`#E2724F`), weight `600`, letter-spacing `0.08em`. Never the same size or weight as the H2.
   - **Section Intro:** Max 2 lines, `15px–16px`, max `56ch`.
   - **Body Copy:** System sans-serif, `15px–16px`, line-height `1.55–1.6`, max `54ch`.
   - **Minimum Font Size:** `12px` anywhere (no 8px, 10px, or 11px notes).

2. **Section Alignment:**
   - Left-aligned section headers for all editorial sections (Why, How it works, Guide, Features, Privacy, FAQ).
   - Center alignment reserved only for the final CTA band.

---

## 4. Mobile First-Screen & Sticky Choreography

1. **Hero First-Screen Fit:**
   - At `360×740` and `390×844`, the first screen fits:
     - Header (`56px`)
     - Hero top padding (`24px`)
     - Eyebrow + Headline + Body copy
     - CTAs flex row (`44px`) + Trust microcopy (`12px`)
     - Top ~40% of the staged phone preview (`160px+`)
   - Rotating emotional line moved to the phone-stage caption below the phone.

2. **Phone Stage:**
   - Max `~440px` tall on mobile with soft bottom crop fade (`mask-image: linear-gradient(...)`).
   - Poster frame rendered on first paint (4 messages, date chip, double blue ticks) — never empty.
   - Date ticker pinned inside device top (no floating detachment or accidental collisions).
   - Max 2 annotation chips visible on mobile.

3. **Mobile Sticky Bottom Bar:**
   - Hidden at top while hero CTAs are visible.
   - Appears when hero CTAs scroll out of view.
   - Contains 1 primary button (`44px`) inside a `60px` bar (with safe area inset).
   - Hides automatically when the final CTA band or footer is visible.
   - Page container includes equal bottom padding (`64px`) so content is never covered.

---

## 5. Palette

- **Site Chrome (Permanently Light):**
  - Background: `#FAF6F0`
  - Surface: `#FFFFFF`
  - Secondary Surface: `#F3EDE4`
  - Border: `#E6DED2`
  - Primary Text: `#1F1A17`
  - Muted Text: `#6B625A`
  - Accent Coral-Amber: `#E2724F`
  - Secondary Accent Green: `#008069` (used for verified offline state)
- **WhatsApp Replay Engine:**
  - WhatsApp Light (`#EFEAE2`) or WhatsApp Dark (`#0B141A`) selected in Setup and rendered strictly inside the replay viewport.
