# AMH Session Handoff — March 2026
### Artists Musicians HUB Build State

---

## Project Summary

**Artists Musicians HUB** — San Antonio music marketing platform. Next.js 16 on Fly.io.
- **Phone:** (210) 891-4991 | **Email:** artists.musicians.hub@gmail.com
- **Cloudinary:** `dbpremci4` (API key: `814612637594166`)
- **Google Analytics:** `G-WPWD1K1CH7`
- **Logo:** `https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent`
- **Fly.io app:** `artists-musicians-hub`
- **GitHub:** `inthevisualmarketing/ArtistsMusiciansHUB`, branch `maindev` force-pushed to `main`

---

## Design System

**Aesthetic:** PlayStation XMB × Cyberpunk HUD
- Primary: `#bc13fe` (purple), `#00f0ff` (cyan), `#ff2a6d` (pink), `#f5f500` (yellow)
- Background: `#0a0a0f` | Font: Share Tech Mono
- Elements: ElectricGrid canvas, scanlines, corner brackets, clip-path parallelogram buttons, hex-clipped avatars

---

## Architecture

```
app/
  layout.tsx              ← Root layout (GA, SEO metadata, SiteNav)
  page.tsx                ← Boot sequence → Homepage (root-page.tsx)
  about/
    layout.tsx            ← Page-specific metadata
    page.jsx              ← About Us
  amplify/
    layout.tsx
    page.jsx              ← AMPLIFY tiers + Stripe payment links
  services/
    layout.tsx
    page.jsx              ← Services + intake form
  news/
    layout.tsx
    page.jsx              ← Tone Zone (61 artists with images + links)
  blog/
    layout.tsx
    page.tsx              ← Server Component → BlogListClient.jsx
    BlogListClient.jsx    ← Client Component (listing UI)
    [slug]/
      page.tsx            ← Server Component → BlogPostClient.jsx
      BlogPostClient.jsx  ← Client Component (post UI + reading helpers)
    rss.xml/
      route.ts            ← RSS 2.0 feed
  contact/
    layout.tsx
    page.jsx              ← Contact form → Mailgun
  ambassadors/
    layout.tsx
    page.jsx              ← Brand Ambassador application
  shop/
    layout.tsx
    page.jsx              ← HUB Shop coming soon + beanie teaser
  privacy/layout.tsx + page.jsx
  terms/layout.tsx + page.jsx
  refunds/layout.tsx + page.jsx
  sitemap.xml/route.ts    ← Dynamic sitemap
  robots.txt/route.ts     ← Robots.txt
  api/
    contact/route.ts      ← Mailgun (notification + auto-reply)
    subscribe/route.ts    ← Mailgun (email capture)

components/
  BootSequence.jsx        ← PS1-style boot (press → terminal → logo → done)
  AMHHomePage.jsx         ← Full homepage with all sections
  SiteNav.jsx             ← Magnetic physics XMB nav + radial command wheel
                            (Bezier constellation lines, ring pulse, procedural audio)

lib/
  blog.js                 ← NEW: Markdown file reader (gray-matter)

content/
  blog/
    *.md                  ← 28 blog posts as individual markdown files
```

---

## Blog System (NEW — Markdown Migration)

**Previous:** All 28 posts in one massive `lib/blog-data.js` (~1600 lines)
**New:** Individual `.md` files in `content/blog/` with frontmatter

**Frontmatter schema:**
```yaml
---
title: "Post Title"
slug: post-slug
category: spotlight | growth | industry | amh
date: YYYY-MM-DD
readTime: N
excerpt: "Short description"
image: https://cloudinary-or-cdn-url (optional)
video: https://youtube-or-cloudinary-url (optional)
download: true | URL (optional, for gated downloads)
---
```

**Categories:** spotlight (12), growth (8), industry (5), amh (3) = 28 total

**New dependency:** `gray-matter` (npm install gray-matter)

**How it works:**
- `lib/blog.js` reads `/content/blog/*.md` files using `fs` + `gray-matter`
- Blog listing (`app/blog/page.tsx`) is a Server Component that reads all posts, passes to `BlogListClient.jsx`
- Individual posts (`app/blog/[slug]/page.tsx`) is a Server Component that reads one post, passes to `BlogPostClient.jsx`
- RSS + Sitemap routes call `getAllPosts()` server-side
- Adding a new post = create a `.md` file, no code changes needed

---

## Stripe Products (Live — Test Mode)

- **AMPLIFY Basic:** `prod_U6hexEk2x7cTnA` / `price_1T8UFSCTd6haJlad27txlTGC` / `https://buy.stripe.com/9B6aEWbFE3Ue6ILc6Xffy01`
- **AMPLIFY Pro:** `prod_U6hfHwqgPEWTiX` / `price_1T8UFrCTd6haJladOFXG8hiu` / `https://buy.stripe.com/6oU5kC9xwaiCc357QHffy02`
- **AMPLIFY Elite:** `prod_U6hf4a3MNN0XEz` / `price_1T8UG4CTd6haJladszrcQYU6` / `https://buy.stripe.com/14AdR8gZY3Ue8QT0offfy03`

---

## SiteNav Features

- **Desktop:** XMB bar with magnetic cursor physics (useMotionValue + useSpring), targeting bracket hover, animated scanning line, active page indicator with layoutId
- **Mobile:** Radial command wheel with spring-burst deployment, Bezier curved constellation lines, triple energy pulses (outbound large, outbound small, white return), radar sweep, ring pulse on open, procedural Web Audio API sounds (hover/click/open)
- **Accessibility:** prefers-reduced-motion respected, sound only after first user click

---

## Tone Zone Artists

61 artists with Duda CDN images and real links. Data lives in `app/news/page.jsx` TONE_ZONE_ARTISTS array. Images from two CDN paths:
- `https://irp.cdn-website.com/4b2bab8b/dms3rep/multi/`
- `https://irp-cdn.multiscreensite.com/4b2bab8b/dms3rep/multi/`

Plan: Migrate images to Cloudinary later for permanence.

---

## Footer Nav (Standardized Across All Pages)

```
NAVIGATE          PROGRAMS          COMMUNITY
Home              AMPLIFY           Ambassadors
About Us          Tone Zone         Shop
Services          Blog              Contact
```

---

## Security Roadmap (Saved as AMH-Security-Roadmap.md)

**Phase 1 (Next):** CSP headers + security headers in `next.config.js`
**Phase 2:** API rate limiting on `/api/contact` and `/api/subscribe`
**Phase 3:** Input sanitization on form endpoints
**Phase 4:** Honeypot fields on all forms
**Phase 5:** Env variable audit
**Phase 6 (When user accounts launch):** CSRF tokens, SameSite cookies, session management

---

## Deployment Commands

```powershell
npm run build
git add -A
git commit -m "message"
git push origin maindev:main --force
flyctl deploy --config fly.production.toml
```

---

## Pending / Coming Up

1. ✅ Blog markdown migration (this session)
2. 6 more blog posts to paste (SEO, Writer's Block, Music Licensing, Giving Credit, OH.Tae, Brand Development)
3. Submit Music form on Tone Zone page (Mailgun-powered)
4. Unique background for Tone Zone page
5. Security hardening (CSP + rate limiting)
6. CSRF when user accounts launch
7. Cloudinary image migration (replace Duda CDN URLs)
8. Web3 features (Monad, Solana Blinks, IPFS, Soulbound NFTs — deferred)

---

## Key Learnings

- **React 19 breaking change:** `useRef<T>(null)` returns `RefObject<T | null>` — prop types must match
- **TypeScript closures:** Null guards don't carry into nested functions — cast immediately after check
- **Next.js 16:** Uses `proxy.ts` not `middleware.ts` for proxy config
- **`--force` push:** Required because `maindev` diverged from `main`; working on `main` directly post-launch eliminates this
- **gray-matter:** Parses YAML frontmatter from .md files, returns `{ data, content }`

---

*AMH Session Handoff — March 2026*
*Markell H., CEO · Artists Musicians HUB · San Antonio TX*
