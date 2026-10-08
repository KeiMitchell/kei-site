# Design System: hanjo.ai

## Product Context
- **What this is:** Marketing site for hanjo, Kei Nakayama's bilingual (JA/EN) growth agency in Los Angeles. Four lines: hanjo CRM, Web, Ads, Recovery.
- **Who it's for:** Japanese-owned small businesses in LA (salons, head spas, estheticians, clinics) arriving from cold outreach, mostly on phones inside LINE/IG browsers; JP DTC founders on Shopify.
- **Space/peers:** Boutique growth and retention agencies. Category default is the SaaS template (dark gradient, metric bars, badges, glowing pill CTA, e.g. flowium.com). We deliberately look like a studio instead (takram.com, pentagram.com): real work, large, little else.
- **Project type:** Marketing site, single-file HTML pages with inline CSS/JS and a `data-i18n` EN/JA dictionary.
- **The one thing to remember:** A real operator is behind it. Every decision below serves that.

## Aesthetic Direction
- **Direction:** Quiet editorial. "The operator's working file": type and real client work carry the page, almost nothing else.
- **Decoration level:** Minimal. No icons in the service list, no decorative gradients, no floating shapes, no eyebrow labels.
- **Mood:** Calm, specific, established. Relief ("someone has done this before"), not "wow".
- **Proof rule:** Every page shows real work before it makes claims. Work sits on the Board tint at true mobile email width, flat (no device frames, no 3D tilt), with a 13px sentence-case caption naming the category ("Pet food subscription, seasonal campaign"). Only use work already cleared for public use (currently `/email-showcase/*.jpg`).

## Typography
Fonts are fixed (Kei's decision 2026-07-20; do not re-propose alternatives).
- **Display:** Playfair Display 700. Page H1, section H2, the big-number moment, service names in the ledger. Nothing else.
- **Italic:** Hero H1 second line only (sage). Section headings and the CTA band are upright, one line.
- **Body/UI/labels:** Inter. Body 17px/1.6 (lead 18px, weight 300, muted). Labels and captions 13px, sentence case. Never uppercase tracked micro-labels, never text under 12px.
- **Figures:** `font-variant-numeric: tabular-nums` for data rows (30 → 300, 15% → 9%). Playfair's oldstyle figures are allowed only for the single big number.
- **JA:** Shippori Mincho B1 for headings (letter-spacing +0.01 to +0.02em, line-height 1.25 to 1.5, `line-break: strict`, `word-break: auto-phrase`), Noto Sans JP for body. No letterspaced JA kickers.
- **Loading:** one canonical Google Fonts URL on every page (Inter + Playfair Display + Noto Sans JP + Shippori Mincho B1), `display=swap`.
- **Scale (desktop / mobile):**
  - H1 68 / 40, line-height 1.02, tracking -0.02em, `text-wrap: balance`
  - Big number clamp(120px, 20vw, 300px), line-height 0.8, tracking -0.04em, sage
  - H2 42 / 28, line-height 1.1, tracking -0.02em, `text-wrap: balance`
  - Ledger name 26 / 22
  - Lead 18, body 17, small 15, caption 13

## Color
- **Approach:** Restrained. Sage is rare and means "act here".
- **Sage** `#3A5C45`: primary CTA, links, ledger hover. Hover `#2E4A38`, active `#263D2F`.
- **Cream** `#F5F4F0`: hero and alternating sections.
- **White** `#FFFFFF`: body sections.
- **Board** `#E8EBE4` (new): only behind real work, like a mounting board. Never as a generic section background.
- **Ink** `#111110` (never #000). **Muted** `#6B6B68`. **Faint** `#8C8B86` (numbers, metadata only). **Hairline** `#E4E2DC`.
- **Semantic** (forms only): error `#B3261E`, success uses Sage.
- **Dark mode:** none; the site is light only.

## Spacing
- **Base unit:** 8px. Scale: 8, 16, 24, 32, 48, 64, 96.
- **Density:** Comfortable. Section padding 96px desktop / 64px mobile. Page gutter 32px desktop / 16px mobile.

## Layout
- **Approach:** Editorial grid, composition first. The first viewport is a poster: brand, one headline, one sentence, one CTA, real work.
- **Home hero (approved 2026-10-07, Variant B "Strip"):** cream band; H1 spans ~7/12 at left with lead + CTA in the right ~4/12, bottom-aligned; below it a full-bleed Board strip of 5 real emails in a row, cropped at the fold, captions underneath. Mobile: text stacked, strip becomes a horizontal swipe row (62vw per email, native scroll, no autoplay).
- **Max width:** 1200px content, 1440px for the work strip.
- **Section order (home):** Hero + work strip, Services ledger, Big number result, Who it's for, FAQ, CTA band.
- **Services:** a ruled ledger (number, Playfair name, one-line description, sage arrow). No cards, no icons.
- **FAQ and lists:** hairline-separated rows, no bordered cards. Cards only when the card is the interaction.
- **Radius:** 4px work boards and swatches, 6px email images, 99px buttons only. Nothing else rounded.
- **Chrome:** identical header and footer on every page, `view-transition-name` pinned (site-header/site-footer). First view must fit 720px desktop / 812px mobile.

## Motion
- **Approach:** Intentional, home page first (Kei 2026-10-07: "make the top page more fun"). Every motion shows something real; nothing loops forever, nothing decorates.
- **Home:** headline lines rise in on load (700ms, 120ms apart), lead + CTA follow; work tiles rise in staggered (80ms); on desktop the tiles drift at slightly different rates while the hero scrolls (±~20px); hovering a tile scrolls the image inside its frame to show the whole piece; the big 300 rises into place once on first view (900ms; a count-up was tried and dropped: proportional Playfair digits jitter and shove the caption); ledger rows get a Board-tint sweep and arrow nudge on hover.
- **Service pages:** still minimal (hover only) until they get their own pass.
- **Rules:** transform/opacity only, ease-out curves (cubic-bezier(.2,.8,.2,1)), no shimmer, no pulsing, no infinite loops, no cursor effects. Everything is off under `prefers-reduced-motion: reduce`.

## Anti-references (Kei's explicit rejections; never reintroduce)
Pill badges, wavy underlines, em dashes in visible copy, emoji, letterspaced JA kickers, forced awkward line breaks, decorative label dashes, 3D/glassmorphism CTAs, Times New Roman, generic SaaS hero-metric templates, identical icon-card grids.

## Pending migration
- `/recovery/` migrated 2026-10-07: hero shows the real HEAD SPA EN booking form + site on the Board, funnel is a ruled number table (no dot grid or person icons), SMS mock is light, no emoji, no shimmer or cursor glow, quiz chips are 4px rectangles. Quiz and 2-step form hooks unchanged.
- `/web/` migrated 2026-10-07: HEAD SPA EN desktop + phone capture on the Board below the hero, captioned with the real scope (site, booking flow, photo/video shoot).
- `/crm/` and `/ads/` still to migrate.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-16 | Cream/sage tokens, Playfair + Inter, four branded lines | Matches growth.hanjo.ai; Kei-approved restructure |
| 2026-07-20 | Times New Roman experiment reverted | Kei prefers Playfair/Inter |
| 2026-10-07 | Home motion added at Kei's request (entrance, tile drift, hover read, 300 reveal, ledger sweep) | Kei wanted the top page more fun; kept to motions that show real work or real numbers |
| 2026-10-07 | Updated by /design-consultation: quiet editorial, real work as hero (Strip), Board tint #E8EBE4, ledger services, single big-number result, no scroll motion, no uppercase labels | Audit found the site read as AI-templated; research showed studios win on visible work. Memorable thing: a real operator is behind it |
