# kei-site — Claude Code Context

## What this is
Kei Nakayama's freelance portfolio site targeting US Shopify subscription brands as a Klaviyo specialist.

**Live URL:** https://kei.gethanjo.com
**Also accessible at:** https://gethanjo.com (redirects to above)
**GitHub repo:** https://github.com/KeiMitchell/kei-site
**Vercel project:** kei-site (auto-deploys on push to `main`)

## File structure
```
kei-site/
└── index.html     ← the entire site (HTML + CSS + JS, all inline)
```

There is **no build step, no framework, no package.json**. Everything lives in `index.html`. To preview locally, just open the file in a browser.

## How to deploy changes
```bash
git add index.html
git commit -m "your message"
git push origin main
# Vercel auto-deploys in ~30 seconds
```

## Design system (CSS variables)
```css
--bg:     #f5f2ec          /* warm off-white background */
--ink:    #2c3e37          /* dark forest green, main text */
--muted:  rgba(44,62,55,0.76)   /* secondary text */
--faint:  rgba(44,62,55,0.52)   /* labels, metadata */
--border: rgba(44,62,55,0.14)   /* divider lines */
--max:    680px            /* content column width */
```

**Fonts:** Inter (weights 300/400/500/600/900, including italic) + Nunito 400 (logo only), both from Google Fonts.

**Tone:** Minimal, editorial, lots of whitespace. No colors beyond the green/cream palette. No images.

## Page sections (in order)
1. **Nav** — hanjo logo (SVG, inline) + "Get in touch" link → `mailto:kei.nakayama@hanjo.ai`
2. **Hero** — headline, byline (Kei Nakayama · Los Angeles, CA), description, CTA button
3. **Gaps** (What I see constantly) — 3 numbered pain points + callout
4. **What I do** — 5-item grid (Flow audit, Subscriber lifecycle, Cancellation saves, Winback, Segmentation)
5. **How it works** — 3-step process (Quick call → Klaviyo review → We decide)
6. **About** (Why I do this) — personal story about failed subscription brand
7. **CTA section** — bottom call to action
8. **Footer** — name, email, location

Sections are separated by `<hr class="full-rule js-rule" />` lines.

## Scroll animations
Elements with `data-reveal` fade up on scroll via IntersectionObserver.
Elements with `data-reveal-stagger` stagger their children with 0.08s delays.
HR lines with class `js-rule` animate via CSS `scaleX` on scroll.
The JS observer is at the bottom of `<body>` — no external dependencies.

## Contact / CTAs
All CTAs link to: `mailto:kei.nakayama@hanjo.ai`
There is no contact form, booking widget, or JavaScript framework.

## Things to be careful about
- **The hanjo logo** is an inline SVG with two clipPath IDs (`pillClipNav` in the nav, `pillClipFoot` in the footer). If duplicating the logo, use unique IDs.
- **All CSS is in a single `<style>` block** in `<head>`. Keep it there.
- **No external JS** — only the IntersectionObserver script at the bottom.
- **Mobile breakpoint** at 640px — check responsiveness after layout changes.
- The `[data-reveal]` base state sets `opacity: 0` — don't remove this or elements will be invisible until scrolled.

## Common edit tasks
- **Change headline:** Edit the `<h1>` inside `.hero`
- **Change description:** Edit the `<p class="hero-desc">` in the hero
- **Add/remove a "What I do" row:** Add/remove a `<li class="work-item">` in the `.work-list`
- **Change CTA email:** Find/replace `kei.nakayama@hanjo.ai` (appears ~4 times)
- **Change colors:** Update CSS variables in `:root`
- **Add a new section:** Copy an existing `<div class="section">` block, add `data-reveal` attributes, place between two `<hr class="full-rule js-rule" />` lines
