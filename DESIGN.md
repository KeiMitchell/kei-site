# DESIGN.md — hanjo.ai

## Tokens (identical on all 9 pages)
- --bg cream: #F5F4F0 (hero/light sections), white body sections
- --sage: #3A5C45 (accent + primary CTAs; hover #2e4a38, active #263d2f)
- --ink/--black: #111110 (never #000)
- --muted/--gray: #6B6B68; faint text rgba-based, contrast-checked (AA)
- --border: #E4E2DC (1px hairlines everywhere; unified token)
- radius: 12-14px cards; 99px pills (CTAs only)

## Typography
- EN headlines: Playfair Display (700, italic for the accent line), letter-spacing about -0.015em to -0.02em
- JA headlines: Shippori Mincho B1, letter-spacing +0.01 to +0.02em, line-height 1.25-1.5, line-break: strict, word-break: auto-phrase
- Body: Inter (EN) / Noto Sans JP (JA)
- ONE canonical Google Fonts URL on every page (Inter + Playfair + Noto Sans JP + Shippori Mincho B1)

## Components
- CTA system: flat sage, 52px main tier / 39px nav pill, SVG arrow with 3px hover nudge, 5s periodic shine sweep (ctaShine), prefers-reduced-motion guarded
- Labels: 11px, 500, 0.18em tracking, uppercase, --faint color, no decorative dash
- Chrome: identical header/announce/footer across pages, view-transition-name pinned (site-header/site-announce/site-footer), no visible reload between pages
- Full-page heroes: min-height calc(100svh - var(--chrome-h)), chrome-h 110px desktop / 128px mobile; first view must fit 720px desktop, 812px mobile

## Motion
- Reveal-on-scroll fade-ups (data-reveal), 0.7-0.8s ease-out quart curves
- No bounce/elastic; никогда animate layout properties; everything guarded by prefers-reduced-motion

## Recovery page specifics (/recovery/)
- Ported growth.hanjo.ai design verbatim: risk-banner above nav, .btn-primary/.btn-ghost pair, zero-grid badges, funnel infographic, simulator (#fit), pricing compare table, case-study card (.cs-card on cream), trust pills
- Its CSS vars: --white, --cream #F5F4F0, --sage, --black, --gray, --border
