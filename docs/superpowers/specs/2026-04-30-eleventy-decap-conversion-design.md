# Eleventy + Decap CMS conversion — design spec

**Date:** 2026-04-30
**Status:** Approved (pending user review of written spec)

## Goal

Convert the florist site template (and the live Cottage Floral Design site built from it) from hand-edited static HTML hosted on GitHub Pages to an Eleventy-built static site hosted on Netlify, with Decap CMS providing non-technical content editing for clients.

The conversion is template-first: rebuild `/template/` as an Eleventy + Decap starter, then regenerate Cottage Floral Design from the new template as the first instance. Every future florist site spun up from the template inherits CMS support automatically.

## Constraints driving the design

- **Hand-off business model.** User builds sites and transfers ownership to clients. Architecture must avoid ongoing dependencies on the user's accounts (no Cloudinary on the user's account, no shared CDN, etc.).
- **Non-technical end users.** Florists, not developers. CMS UX must be friction-light: email/password login, required alt text, validated meta descriptions, collapsed advanced fields.
- **SEO is a first-class priority.** Per-page titles/descriptions, image alt text everywhere, location mentions woven through copy and metadata, LocalBusiness schema, sitemap, OG tags.
- **Template reusability.** The `/template/` system already uses `{{PLACEHOLDER}}` tokens for fast site generation. The new template must preserve that spin-up flow.

## Scope decisions

| Decision | Choice | Rationale |
|---|---|---|
| Static site generator | Eleventy + Nunjucks | Closest to existing HTML; simplest debugging post-handoff; canonical Decap pairing. |
| Editable scope | Page content + portfolio collection (add/remove) | Clients can edit existing pages and manage portfolio entries. They cannot add new top-level pages or seasonal pages from the CMS. |
| Image hosting | Committed to repo (`assets/portfolio/<slug>/`) | Keeps the hand-off self-contained — no external service ties clients to user's account. Repo bloat is a "future client" problem. |
| Authentication | Netlify Identity (email/password) + Git Gateway | Lowest friction for non-technical users; free tier covers needs. |
| Hand-off mechanics | User builds under their accounts → transfers GitHub repo → client creates Netlify account and connects | Cleanest separation. Client owns everything post-handoff. |
| Architecture style | Hybrid (data files for fixed pages, markdown collection for portfolio) | Right amount of abstraction; matches actual editing patterns. |
| Image optimization plugin | Deferred to v2 | Adds complexity; client uploads pre-sized images per CMS hint. |

## Repo & file structure

```
template/
├── .eleventy.js              # build config
├── package.json              # eleventy + plugins
├── netlify.toml              # build command, redirects, env
├── _data/
│   ├── site.yml              # global: business name, location, phone, social, nav
│   ├── seo.yml               # global SEO defaults (default OG image, sitewide keywords)
│   ├── home.yml              # home page content
│   ├── about.yml             # about page content
│   ├── inquiry.yml           # inquiry page content
│   ├── mothers-day.yml       # seasonal page content
│   └── dance-flowers.yml     # seasonal page content
├── _includes/
│   ├── layouts/
│   │   ├── base.njk          # <html>, <head> with SEO partial, header, footer
│   │   └── portfolio-entry.njk
│   └── partials/
│       ├── nav.njk
│       ├── footer.njk
│       ├── seo-head.njk      # title, meta, og, twitter card, schema.org LocalBusiness
│       └── gallery.njk       # reusable photo grid
├── content/
│   └── portfolio/            # markdown collection — one .md per wedding
│       ├── sample-wedding-1.md
│       └── sample-wedding-2.md
├── pages/                    # one template per route, pulls from _data/
│   ├── index.njk
│   ├── about.njk
│   ├── portfolio.njk         # lists all portfolio entries
│   ├── inquiry.njk
│   ├── mothers-day.njk
│   └── dance-flowers.njk
├── admin/
│   ├── index.html            # loads Decap CMS script
│   └── config.yml            # CMS collections + fields
├── assets/                   # images committed to repo
│   ├── logo.png
│   ├── (site-wide imagery)
│   └── portfolio/<slug>/*    # per-wedding photo folders
├── css/style.css
├── js/main.js
└── HANDOFF.md                # client walkthrough doc
```

**Key structural choices:**

- `_data/` files drive the fixed pages. Each YAML file maps to one CMS form.
- `content/portfolio/` is the only true *collection* — clients add/remove these freely via Decap.
- `assets/portfolio/<slug>/` keeps each wedding's photos grouped, so deleting a wedding cleans up its assets.
- `pages/` templates are thin — they pull from `_data/` and render. Structural changes still require a developer.
- `seo-head.njk` is the central SEO partial — every layout includes it; every page passes its data through.

## Content model

### Global: `_data/site.yml`

```yaml
business_name: "Cottage Floral Design"
tagline: "Story-led floral design"
url: "https://cottagefloraldesign.com"
location:
  city: "Salt Lake City"
  region: "UT"
  service_areas: ["Salt Lake City", "Park City", "Utah County"]
contact:
  email: "hello@cottagefloraldesign.com"
  phone: "+1-801-555-0100"
social:
  instagram: "https://instagram.com/..."
  pinterest: ""
nav:
  - { label: "Home", url: "/" }
  - { label: "Portfolio", url: "/portfolio/" }
  - { label: "About", url: "/about/" }
  - { label: "Inquire", url: "/inquiry/" }
```

### Page data: `_data/home.yml` (representative)

```yaml
seo:
  title: "Salt Lake City Wedding Florist | Cottage Floral Design"
  description: "Story-led wedding florals serving Salt Lake City, Park City, and the surrounding region."
  og_image: "/assets/og-home.jpg"
hero:
  heading: "Where it matters most"
  subheading: "..."
  image: "/assets/Headliner.jpg"
  image_alt: "Bridal bouquet with garden roses, Salt Lake City wedding"
about_blurb:
  heading: "Rooted in meaning"
  body: "..."
  image: "/assets/RootedinMeaning.jpg"
  image_alt: "..."
featured_portfolio: ["austin-anna", "katelyn-brad"]   # references portfolio slugs
testimonials:
  - quote: "..."
    name: "Sarah & Tom"
    location: "Park City wedding"
cta:
  heading: "Ready to plan yours?"
  body: "..."
  button_label: "Start your inquiry"
```

Other page data files (`about.yml`, `inquiry.yml`, `mothers-day.yml`, `dance-flowers.yml`) follow the same shape — each has a `seo` block and page-specific fields.

### Portfolio entry: `content/portfolio/<slug>.md`

```yaml
---
title: "Austin & Anna"
date: 2025-08-12
location: "Snowbird, UT"
venue: "Cliff Lodge"
season: "Late summer"
palette: ["dusty rose", "sage", "cream"]
hero_image: "/assets/portfolio/austin-anna/hero.jpg"
hero_image_alt: "Austin and Anna's wedding ceremony arch, Snowbird Utah"
gallery:
  - image: "/assets/portfolio/austin-anna/01.jpg"
    caption: "Bridal bouquet with garden roses and ranunculus"
    alt: "Bridal bouquet with garden roses, Snowbird wedding florist"
  - image: "/assets/portfolio/austin-anna/02.jpg"
    caption: "Reception centerpiece with taper candles"
    alt: "Reception centerpiece, Cliff Lodge Snowbird"
seo:
  title: "Austin & Anna's Snowbird Wedding | Cottage Floral Design"
  description: "Late summer wedding florals at Cliff Lodge in Snowbird, Utah..."
---
A few paragraphs of story-led copy about the wedding...
```

**Content model rules:**

- Every page and every portfolio entry has a `seo` block with `title` and `description`.
- Every image has an `alt` field (and a `caption` where displayed). Required at the CMS level.
- Location strings (`location`, `venue`, `service_areas`) feed into both visible page copy and schema.org markup.

## SEO architecture

All of the below is centralized so every page gets it without per-page work.

### `<head>` essentials (per-page, in `seo-head.njk`)

- `<title>` — from `seo.title`, falling back to `<page name> | <business name>`
- `<meta name="description">` — from `seo.description`
- `<link rel="canonical">` — full URL of the page
- OpenGraph tags: `og:title`, `og:description`, `og:image`, `og:type`, `og:url`
- Twitter Card: `summary_large_image`

### Schema.org LocalBusiness JSON-LD

Rendered once in `base.njk`, populated entirely from `site.yml`:

```json
{
  "@context": "https://schema.org",
  "@type": "Florist",
  "name": "Cottage Floral Design",
  "telephone": "+1-801-555-0100",
  "email": "hello@cottagefloraldesign.com",
  "areaServed": ["Salt Lake City", "Park City", "Utah County"],
  "address": { "@type": "PostalAddress", "addressRegion": "UT", "addressLocality": "Salt Lake City" },
  "url": "https://cottagefloraldesign.com",
  "image": "https://cottagefloraldesign.com/assets/og-home.jpg",
  "sameAs": ["https://instagram.com/...", "..."]
}
```

### Per-portfolio-entry schema

Structured data on each wedding page (`Article` or `ImageGallery` — implementation chooses based on current Google guidance for past project showcases) including location, date, and venue. Adds rich snippets to Google results for individual wedding pages.

### Auto-generated files

- `sitemap.xml` via `@quasibit/eleventy-plugin-sitemap` — includes all pages and portfolio entries with `lastmod`.
- `robots.txt` — allows all, points to sitemap.

### Image SEO discipline

- `alt` fields are `required: true` in Decap config. Form won't submit without them.
- Captions render visibly on the page *and* feed structured data.
- Filenames stay descriptive (Decap configured to slugify uploads).

### Location-weaving conventions

- Hero headings reference `site.location.city` where natural.
- Footer always shows location + service areas.
- Portfolio entry pages auto-append "[Venue], [City]" to titles.

### Performance basics (Core Web Vitals)

- `loading="lazy"` on images below the fold.
- `width`/`height` attributes on every `<img>` to prevent CLS.
- Hero image preloaded.
- Minified CSS/JS via Eleventy build.

## CMS configuration

`admin/config.yml` defines the Decap interface. Three top-level groupings shown in the sidebar.

### Backend & global config

```yaml
backend:
  name: git-gateway
  branch: main
publish_mode: editorial_workflow
media_folder: "assets/portfolio"
public_folder: "/assets/portfolio"
site_url: https://cottagefloraldesign.com
display_url: https://cottagefloraldesign.com
logo_url: /assets/logo.png
```

Editorial workflow is **on** — every CMS save creates a draft → preview → publish flow.

### Pages collection (fixed forms)

One file entry per page (home, about, inquiry, mothers-day, dance-flowers). Each form contains:

- An `seo` object (title + description) — collapsed by default.
- Page-specific fields matching that page's data shape.
- Where applicable, a `relation` widget pointing into the portfolio collection (e.g., home page's `featured_portfolio`).

### Portfolio collection (add/remove freely)

```yaml
- name: "portfolio"
  label: "Portfolio (Weddings)"
  label_singular: "Wedding"
  folder: "content/portfolio"
  create: true
  delete: true
  slug: "{{slug}}"
  preview_path: "portfolio/{{slug}}"
  media_folder: "/assets/portfolio/{{slug}}"
  public_folder: "/assets/portfolio/{{slug}}"
  fields:
    - { label: "Title (couple names)", name: "title", widget: "string" }
    - { label: "Date", name: "date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
    - { label: "Location", name: "location", widget: "string", hint: "e.g. Snowbird, UT" }
    - { label: "Venue", name: "venue", widget: "string" }
    - { label: "Season", name: "season", widget: "select", options: ["Spring","Summer","Fall","Winter","Late summer"] }
    - { label: "Color palette", name: "palette", widget: "list" }
    - { label: "Hero image", name: "hero_image", widget: "image", required: true }
    - { label: "Hero image alt text (for SEO + accessibility)", name: "hero_image_alt",
        widget: "string", required: true,
        hint: "Describe the image. Include venue/city when natural — helps Google find your work." }
    - label: "Gallery"
      name: "gallery"
      widget: "list"
      fields:
        - { label: "Image", name: "image", widget: "image", required: true }
        - { label: "Caption (shown on page)", name: "caption", widget: "string" }
        - { label: "Alt text (SEO + accessibility)", name: "alt", widget: "string", required: true }
    - label: "SEO"
      name: "seo"
      widget: "object"
      collapsed: true
      fields:
        - { label: "Page title", name: "title", widget: "string", hint: "Appears in browser tab and Google results. ~60 chars." }
        - { label: "Meta description", name: "description", widget: "text", pattern: ['.{50,160}', "Aim for 50-160 characters"] }
    - { label: "Story (the writeup)", name: "body", widget: "markdown" }
```

### Settings collection (rarely touched)

`_data/site.yml` and `_data/seo.yml` — business info, default OG image, sitewide keywords.

### CMS UX guardrails

- **Required alt text** — form blocks submission without it.
- **Pattern validation on meta descriptions** — warns if outside 50-160 chars.
- **Collapsed SEO sections by default** — clients aren't intimidated; defaults auto-fill.

## Build & deploy pipeline

### `package.json`

```json
{
  "scripts": {
    "build": "eleventy",
    "dev": "eleventy --serve",
    "clean": "rm -rf _site"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-plugin-rss": "^2.0.0",
    "@quasibit/eleventy-plugin-sitemap": "^2.2.0"
  }
}
```

### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "_site"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/admin"
  to = "/admin/index.html"
  status = 200
```

Per-site portfolio URL redirects (`/portfolio/<slug>.html` → `/portfolio/<slug>/`) are added during the Cottage Floral migration to preserve backlinks and SEO equity.

### Deploy workflow

- `main` → production deploy (live site).
- Decap commits drafts via Editorial Workflow; "Publish" merges to `main`.
- Netlify auto-builds on every push to `main`.
- Deploy Previews on PRs (developer-side workflow).

### Build performance budget

- Cold build target: under 10 seconds for a 50-wedding portfolio.

### Local dev workflow (developer)

```bash
git clone <client-repo>
cd <client-repo>
npm install
npm run dev    # localhost:8080 with hot reload
```

For local CMS testing: set `local_backend: true` in `admin/config.yml`, run `npx decap-server` alongside `npm run dev`. Disable before committing.

### What happens when a client publishes

1. Decap commits the YAML/markdown change to GitHub via Git Gateway.
2. GitHub webhook fires → Netlify pulls.
3. Netlify runs `npm run build` → outputs `_site/`.
4. Netlify deploys to CDN.
5. Change is live in 30-60 seconds.

## Migration plan

### Phase 1: Convert `/template/`

1. Add `package.json`, `.eleventy.js`, `netlify.toml`.
2. Create the new directory structure (`_data/`, `_includes/`, `pages/`, `content/portfolio/`, `admin/`).
3. Build layouts and partials. Convert each existing HTML file into a Nunjucks template that pulls from `_data/<page>.yml`.
4. Write `admin/config.yml` with all collections.
5. Replace `{{PLACEHOLDER}}` tokens with Nunjucks variables backed by `_data/site.yml` so the existing placeholder-substitution generation flow keeps working.
6. Add 1-2 sample portfolio entries as `.md` files so the collection works out of the box.
7. Write `HANDOFF.md` (client walkthrough).
8. Test: `npm run dev`, verify CMS works locally, verify build output is correct.

### Phase 2: Regenerate Cottage Floral Design from the new template

**Approach: fresh repo (2a).** Create a new repo from the template, populate with Cottage Floral's data (extract content from current HTML into `_data/*.yml` and `content/portfolio/*.md` files), copy assets from old repo, point `cottagefloraldesign.com` at it. Existing repo gets archived (not deleted) for reference.

### Phase 3: DNS cutover for Cottage Floral

1. Build new site on Netlify under a `*.netlify.app` URL — verify visual parity with the live site.
2. Add `cottagefloraldesign.com` as custom domain in Netlify; SSL provisions automatically.
3. At Namecheap: change DNS records from GitHub Pages IPs to Netlify's `apex-loadbalancer.netlify.com` (or values shown in Netlify dashboard).
4. Wait for propagation (30 min – 24 h).
5. In GitHub repo settings, disable Pages.
6. Spot-check: SSL valid, all routes work, CMS login works at `/admin`.

### Phase 4: Set up Netlify Identity + invite self

1. Netlify dashboard → Identity → enable.
2. Enable Git Gateway.
3. Set registration to "Invite only" — no public signups.
4. Invite developer email → verify CMS login at `/admin` and edit a draft.

### Phase 5: Hand-off

1. Walk client through `HANDOFF.md`.
2. Transfer GitHub repo to client's account (Settings → Transfer ownership).
3. Client creates Netlify account, connects the (now-theirs) repo.
4. Client re-enables Identity + Git Gateway under their account.
5. Client invites themselves as Identity user.
6. Developer is out.

## Migration risks & mitigations

| Risk | Mitigation |
|---|---|
| Visual regression vs current Cottage Floral site | Side-by-side screenshot comparison and HTML structure diff before DNS cutover. |
| Portfolio URL changes break backlinks / lose SEO equity | Add `[[redirects]]` rules in `netlify.toml` mapping `/portfolio/<slug>.html` → `/portfolio/<slug>/`. |
| CMS-friendliness of existing copy | Field shapes in CMS config match actual content shapes; complex blocks rendered as markdown body. |
| Netlify Identity in maintenance mode | Documented fallback: external OAuth (Auth0/Clerk) or migration to Sveltia CMS. Not blocking for v1. |
| Client confusion at handoff | `HANDOFF.md` walkthrough, plus a one-time live walkthrough during transfer. |

## Implementation note

This spec covers two distinct deliverables (template conversion, then Cottage Floral migration). The implementation plan may split these into two sequential plans — the template must be solid before regenerating Cottage Floral from it.

## Out of scope

- Image optimization plugin (deferred to v2).
- Adding new seasonal pages from the CMS (developer-only).
- Multi-language support.
- Analytics integration.
- Auto-generated alt text from EXIF or AI-rewritten meta descriptions (positioned as a future "SEO package" upsell).
