# Eleventy + Decap Template Conversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `/template/` from raw HTML with `{{PLACEHOLDER}}` tokens into an Eleventy + Decap CMS starter that future florist sites are spun up from.

**Architecture:** Eleventy 3 with Nunjucks templates. YAML data files in `_data/` drive fixed pages (home, about, portfolio listing, inquiry). Markdown collection in `content/portfolio/` for individual wedding entries. Decap CMS at `/admin/` configured for non-technical clients. Static assets pass through. Static CSS with theme tokens injected via inline `<style>` block in base layout.

**Tech Stack:** Node 20+, Eleventy 3, Nunjucks, Decap CMS, Netlify (deploy target), Node built-in test runner (`node --test`).

**Scope:** This plan covers the template conversion only. A separate Plan 2 will cover migrating Cottage Floral Design from the new template, DNS cutover, and client handoff.

**Reference:** See `docs/superpowers/specs/2026-04-30-eleventy-decap-conversion-design.md` for the design spec.

---

## Prerequisites

- Node 18+ (current system has 12.22.9 — needs upgrade before starting)
- npm 9+
- Git
- Familiarity with template's existing structure: `template/index.html`, `template/about.html`, `template/portfolio.html`, `template/inquiry.html`, `template/css/style.css`, `template/js/main.js`

**Working directory for all tasks:** `/mnt/c/Users/Snic9/CottageFloral/template/` unless otherwise stated.

---

## Task 1: Verify Node version and scaffold project

**Files:**
- Create: `template/package.json`
- Create: `template/.gitignore`
- Create: `template/.eleventy.js`

- [ ] **Step 1: Verify Node version**

Run: `node --version`
Expected: `v18.x.x` or higher. If lower, stop and upgrade Node before continuing.

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "florist-site-template",
  "version": "1.0.0",
  "description": "Eleventy + Decap CMS starter for florist websites",
  "private": true,
  "scripts": {
    "build": "eleventy",
    "dev": "eleventy --serve",
    "clean": "rm -rf _site",
    "test": "node --test tests/"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
_site/
node_modules/
.cache/
.DS_Store
```

- [ ] **Step 4: Create minimal `.eleventy.js`**

```js
module.exports = function(eleventyConfig) {
  // Pass-through static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: succeeds, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 6: Run a smoke build**

Run: `npx eleventy`
Expected: build completes (may report 0 templates processed since none exist yet — that's fine). `_site/` directory created with passthrough assets copied.

- [ ] **Step 7: Commit**

```bash
git add template/package.json template/.gitignore template/.eleventy.js template/package-lock.json
git commit -m "chore(template): scaffold Eleventy project"
```

---

## Task 2: Site-wide data file

**Files:**
- Create: `template/_data/site.yml`
- Create: `template/_data/seo.yml`
- Create: `template/tests/data.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/data.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import yaml from "../node_modules/js-yaml/dist/js-yaml.js";

test("site.yml has required top-level keys", () => {
  const raw = readFileSync(new URL("../_data/site.yml", import.meta.url), "utf-8");
  const site = yaml.load(raw);
  assert.ok(site.business_name, "business_name required");
  assert.ok(site.tagline, "tagline required");
  assert.ok(site.url, "url required");
  assert.ok(site.location?.city, "location.city required");
  assert.ok(site.location?.region, "location.region required");
  assert.ok(Array.isArray(site.location?.service_areas), "service_areas must be a list");
  assert.ok(site.contact?.email, "contact.email required");
  assert.ok(Array.isArray(site.nav), "nav must be a list");
});

test("seo_defaults.yml has required defaults", () => {
  const raw = readFileSync(new URL("../_data/seo_defaults.yml", import.meta.url), "utf-8");
  const seo = yaml.load(raw);
  assert.ok(seo.default_og_image, "default_og_image required");
  assert.ok(seo.default_keywords, "default_keywords required");
});
```

- [ ] **Step 2: Add `js-yaml` as a dev dependency for tests**

Run: `npm install --save-dev js-yaml`

- [ ] **Step 3: Run the test to confirm it fails**

Run: `npm test`
Expected: fails — files don't exist yet.

- [ ] **Step 4: Create `_data/site.yml`**

Use placeholder tokens so the template can be cloned and customized per client. Existing `{{PLACEHOLDER}}` substitution flow continues to work — the substitution script just writes into YAML now instead of HTML.

```yaml
business_name: "{{BUSINESS_NAME}}"
tagline: "{{TAGLINE}}"
url: "{{SITE_URL}}"
announcement: "{{ANNOUNCEMENT}}"

location:
  city: "{{CITY}}"
  region: "{{REGION}}"
  service_areas:
    - "{{SERVICE_AREA_1}}"
    - "{{SERVICE_AREA_2}}"
    - "{{SERVICE_AREA_3}}"

contact:
  email: "{{CONTACT_EMAIL}}"
  phone: "{{CONTACT_PHONE}}"

social:
  instagram: "{{INSTAGRAM_URL}}"
  pinterest: "{{PINTEREST_URL}}"

nav:
  - { label: "Home", url: "/" }
  - { label: "Portfolio", url: "/portfolio/" }
  - { label: "About", url: "/about/" }
  - { label: "Inquire", url: "/inquiry/" }

theme:
  primary: "{{PRIMARY}}"
  primary_light: "{{PRIMARY_LIGHT}}"
  primary_pale: "{{PRIMARY_PALE}}"
  accent: "{{ACCENT}}"
  accent_light: "{{ACCENT_LIGHT}}"
  bg: "{{BG}}"
  bg_dark: "{{BG_DARK}}"
  text: "{{TEXT}}"
  text_light: "{{TEXT_LIGHT}}"
  highlight: "{{HIGHLIGHT}}"
  ff_display: "{{FF_DISPLAY}}"
  ff_body: "{{FF_BODY}}"
  google_fonts_url: "{{GOOGLE_FONTS_URL}}"
```

- [ ] **Step 5: Create `_data/seo_defaults.yml`**

The file is named `seo_defaults.yml` (not `seo.yml`) to avoid colliding with per-page `seo` frontmatter. Eleventy auto-exposes data files by their filename, so this becomes available in templates as `seo_defaults`.

```yaml
default_og_image: "/assets/og-default.jpg"
default_keywords: "{{DEFAULT_KEYWORDS}}"
```

- [ ] **Step 6: Run the test to confirm it passes**

Run: `npm test`
Expected: both tests pass.

- [ ] **Step 7: Commit**

```bash
git add template/_data/ template/tests/ template/package.json template/package-lock.json
git commit -m "feat(template): add site and seo data files"
```

---

## Task 3: Base layout and SEO head partial

**Files:**
- Create: `template/_includes/partials/seo-head.njk`
- Create: `template/_includes/layouts/base.njk`
- Create: `template/tests/render.mjs` (helper)
- Create: `template/tests/seo.test.mjs`

- [ ] **Step 1: Create test helper that builds the site once and exposes output reads**

Create `template/tests/render.mjs`:

```js
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "..");
const SITE_DIR = join(TEMPLATE_DIR, "_site");

let built = false;

export function buildOnce() {
  if (built) return;
  execSync("npx eleventy", { cwd: TEMPLATE_DIR, stdio: "pipe" });
  built = true;
}

export function readOutput(relativePath) {
  buildOnce();
  const full = join(SITE_DIR, relativePath);
  if (!existsSync(full)) throw new Error(`Output file missing: ${relativePath}`);
  return readFileSync(full, "utf-8");
}

export function outputExists(relativePath) {
  buildOnce();
  return existsSync(join(SITE_DIR, relativePath));
}
```

- [ ] **Step 2: Write the failing test for base layout + SEO head**

Create `template/tests/seo.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "./render.mjs";

test("base layout renders <html lang>, <title>, meta description", () => {
  const html = readOutput("test-page/index.html");
  assert.match(html, /<html[^>]*lang="en"/);
  assert.match(html, /<title>Test Page Title<\/title>/);
  assert.match(html, /<meta name="description" content="A test page description\."/);
});

test("base layout renders OpenGraph and canonical tags", () => {
  const html = readOutput("test-page/index.html");
  assert.match(html, /<link rel="canonical" href="[^"]*test-page\/"/);
  assert.match(html, /<meta property="og:title" content="Test Page Title"/);
  assert.match(html, /<meta property="og:description" content="A test page description\."/);
  assert.match(html, /<meta property="og:type" content="website"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
});

test("base layout renders inline CSS theme variables from site.theme", () => {
  const html = readOutput("test-page/index.html");
  assert.match(html, /<style>[\s\S]*--primary:/);
});
```

- [ ] **Step 3: Run the test to confirm it fails**

Run: `npm test -- tests/seo.test.mjs`
Expected: fails (no output yet, layout doesn't exist).

- [ ] **Step 4: Create the SEO head partial**

`template/_includes/partials/seo-head.njk`:

```njk
{% set pageTitle = seo.title or (title + " | " + site.business_name) %}
{% set pageDesc = seo.description or site.tagline %}
{% set pageOgImage = seo.og_image or seo_defaults.default_og_image %}
{% set fullUrl = site.url + page.url %}

<title>{{ pageTitle }}</title>
<meta name="description" content="{{ pageDesc }}">
<link rel="canonical" href="{{ fullUrl }}">

<meta property="og:title" content="{{ pageTitle }}">
<meta property="og:description" content="{{ pageDesc }}">
<meta property="og:image" content="{{ site.url }}{{ pageOgImage }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ fullUrl }}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ pageTitle }}">
<meta name="twitter:description" content="{{ pageDesc }}">
<meta name="twitter:image" content="{{ site.url }}{{ pageOgImage }}">
```

The variable `seo_defaults` is auto-exposed by Eleventy from `_data/seo_defaults.yml` (created in Task 2 with that name specifically to avoid colliding with per-page `seo` frontmatter). No `.eleventy.js` changes needed.

- [ ] **Step 5: Create the base layout**

`template/_includes/layouts/base.njk`:

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {% include "partials/seo-head.njk" %}
  <link rel="stylesheet" href="/css/style.css">
  <style>
    :root {
      --primary: {{ site.theme.primary }};
      --primary-light: {{ site.theme.primary_light }};
      --primary-pale: {{ site.theme.primary_pale }};
      --accent: {{ site.theme.accent }};
      --accent-light: {{ site.theme.accent_light }};
      --bg: {{ site.theme.bg }};
      --bg-dark: {{ site.theme.bg_dark }};
      --text: {{ site.theme.text }};
      --text-light: {{ site.theme.text_light }};
      --highlight: {{ site.theme.highlight }};
      --ff-display: {{ site.theme.ff_display }};
      --ff-body: {{ site.theme.ff_body }};
    }
  </style>
  {% if site.theme.google_fonts_url %}
  <link href="{{ site.theme.google_fonts_url }}" rel="stylesheet">
  {% endif %}
</head>
<body>
  {{ content | safe }}
  <script src="/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 6: Create a temporary test page that exercises the layout**

Create `template/test-page.njk`:

```njk
---
layout: layouts/base.njk
title: "Test Page"
seo:
  title: "Test Page Title"
  description: "A test page description."
permalink: /test-page/
---
<h1>{{ title }}</h1>
```

- [ ] **Step 7: Build and run the SEO test**

Run: `npx eleventy && npm test -- tests/seo.test.mjs`
Expected: all SEO tests pass.

- [ ] **Step 8: Commit**

```bash
git add template/_includes/ template/test-page.njk template/tests/
git commit -m "feat(template): add base layout and SEO head partial"
```

---

## Task 4: Nav and footer partials

**Files:**
- Create: `template/_includes/partials/nav.njk`
- Create: `template/_includes/partials/footer.njk`
- Modify: `template/_includes/layouts/base.njk`
- Create: `template/tests/nav-footer.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/nav-footer.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "./render.mjs";

test("nav renders all links from site.nav", () => {
  const html = readOutput("test-page/index.html");
  assert.match(html, /<a[^>]*href="\/"[^>]*>Home<\/a>/);
  assert.match(html, /<a[^>]*href="\/portfolio\/"[^>]*>Portfolio<\/a>/);
  assert.match(html, /<a[^>]*href="\/about\/"[^>]*>About<\/a>/);
  assert.match(html, /<a[^>]*href="\/inquiry\/"[^>]*>Inquire<\/a>/);
});

test("nav marks current page as active", () => {
  const html = readOutput("test-page/index.html");
  // The test-page itself isn't in nav, but the active class machinery should still emit nav__link
  assert.match(html, /class="nav__link/);
});

test("footer shows business name, location, and service areas", () => {
  const html = readOutput("test-page/index.html");
  assert.match(html, /\{\{BUSINESS_NAME\}\}/); // placeholder still present in template
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npm test -- tests/nav-footer.test.mjs`
Expected: fails (nav/footer not yet rendered).

- [ ] **Step 3: Create the nav partial**

`template/_includes/partials/nav.njk` — adapted from existing `template/index.html` lines 13-27:

```njk
<header class="header">
  {% if site.announcement %}<div class="announcement">{{ site.announcement }}</div>{% endif %}
  <nav class="nav">
    <a href="/" class="nav__logo">{{ site.business_name }}</a>
    <ul class="nav__links">
      {% for item in site.nav %}
      <li>
        <a href="{{ item.url }}" class="nav__link{% if page.url == item.url %} active{% endif %}">{{ item.label }}</a>
      </li>
      {% endfor %}
    </ul>
    <div class="nav__toggle" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </div>
  </nav>
</header>
```

- [ ] **Step 4: Create the footer partial**

`template/_includes/partials/footer.njk`:

```njk
<footer class="footer">
  <div class="container">
    <div class="footer__brand">
      <span class="footer__logo">{{ site.business_name }}</span>
      <p class="footer__tagline">{{ site.tagline }}</p>
    </div>
    <div class="footer__location">
      <p>{{ site.location.city }}, {{ site.location.region }}</p>
      <p class="footer__service-areas">Serving: {% for area in site.location.service_areas %}{{ area }}{% if not loop.last %}, {% endif %}{% endfor %}</p>
    </div>
    <div class="footer__contact">
      <a href="mailto:{{ site.contact.email }}">{{ site.contact.email }}</a>
      {% if site.contact.phone %}<a href="tel:{{ site.contact.phone }}">{{ site.contact.phone }}</a>{% endif %}
    </div>
    <div class="footer__social">
      {% if site.social.instagram %}<a href="{{ site.social.instagram }}" rel="noopener" target="_blank">Instagram</a>{% endif %}
      {% if site.social.pinterest %}<a href="{{ site.social.pinterest }}" rel="noopener" target="_blank">Pinterest</a>{% endif %}
    </div>
    <p class="footer__copy">© <span id="year"></span> {{ site.business_name }}. All rights reserved.</p>
  </div>
</footer>
```

- [ ] **Step 5: Wire nav and footer into base layout**

Edit `template/_includes/layouts/base.njk` body section. Replace:

```njk
<body>
  {{ content | safe }}
  <script src="/js/main.js"></script>
</body>
```

With:

```njk
<body>
  {% include "partials/nav.njk" %}
  {{ content | safe }}
  {% include "partials/footer.njk" %}
  <script src="/js/main.js"></script>
</body>
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `npm test`
Expected: all tests pass (data, seo, nav-footer).

- [ ] **Step 7: Commit**

```bash
git add template/_includes/partials/nav.njk template/_includes/partials/footer.njk template/_includes/layouts/base.njk template/tests/nav-footer.test.mjs
git commit -m "feat(template): add nav and footer partials"
```

---

## Task 5: Home page data and template

**Files:**
- Create: `template/_data/home.yml`
- Create: `template/pages/index.njk`
- Create: `template/tests/home.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/home.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("home page builds to /index.html", () => {
  assert.ok(outputExists("index.html"));
});

test("home page renders hero from data file", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="hero"/);
  assert.match(html, /\{\{HERO_TITLE\}\}/); // placeholder until customized per-client
});

test("home page renders nav and footer", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});

test("home page seo title falls back to default", () => {
  const html = readOutput("index.html");
  assert.match(html, /<title>[^<]+<\/title>/);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/home.test.mjs`
Expected: fails (no `index.html` output).

- [ ] **Step 3: Create `_data/home.yml`**

```yaml
seo:
  title: "{{HOME_SEO_TITLE}}"
  description: "{{HOME_META_DESCRIPTION}}"
  og_image: "{{HOME_OG_IMAGE}}"

hero:
  subtitle: "{{TAGLINE}}"
  title: "{{HERO_TITLE}}"
  description: "{{HERO_DESCRIPTION}}"
  cta: "{{HERO_CTA}}"
  image: "{{HERO_IMAGE}}"
  image_alt: "{{HERO_IMAGE_ALT}}"

testimonial_marquee:
  - "{{TESTIMONIAL_1}}"
  - "{{TESTIMONIAL_2}}"
  - "{{TESTIMONIAL_3}}"
  - "{{TESTIMONIAL_4}}"

why:
  label: "{{WHY_LABEL}}"
  heading: "{{WHY_HEADING}}"
  cards:
    - title: "{{WHY_CARD_1_TITLE}}"
      body: "{{WHY_CARD_1_BODY}}"
    - title: "{{WHY_CARD_2_TITLE}}"
      body: "{{WHY_CARD_2_BODY}}"
    - title: "{{WHY_CARD_3_TITLE}}"
      body: "{{WHY_CARD_3_BODY}}"

approach:
  label: "{{APPROACH_LABEL}}"
  heading: "{{APPROACH_HEADING}}"
  text: "{{APPROACH_TEXT}}"
  cta: "{{APPROACH_CTA}}"
  image: "{{APPROACH_IMAGE}}"
  image_alt: "{{APPROACH_IMAGE_ALT}}"

process:
  heading: "{{PROCESS_HEADING}}"
  steps:
    - number: "01"
      title: "{{PROCESS_1_TITLE}}"
      body: "{{PROCESS_1_BODY}}"
    - number: "02"
      title: "{{PROCESS_2_TITLE}}"
      body: "{{PROCESS_2_BODY}}"
    - number: "03"
      title: "{{PROCESS_3_TITLE}}"
      body: "{{PROCESS_3_BODY}}"

services_marquee:
  - "{{SERVICE_1}}"
  - "{{SERVICE_2}}"
  - "{{SERVICE_3}}"
  - "{{SERVICE_4}}"

portfolio_preview:
  heading: "{{PORTFOLIO_HEADING}}"
  text: "{{PORTFOLIO_TEXT}}"
  image: "{{PORTFOLIO_PREVIEW_IMAGE}}"
  image_alt: "{{PORTFOLIO_PREVIEW_ALT}}"

cta:
  heading: "{{CTA_HEADING}}"
  text: "{{CTA_TEXT}}"
  button: "{{CTA_BUTTON}}"
```

- [ ] **Step 4: Create `pages/index.njk` template**

This converts `template/index.html` lines 29-113 into a Nunjucks template that pulls from `_data/home.yml`.

The `seo` value comes from `_data/home.yml` via a sidecar data file (`pages/index.11tydata.js`, created in the next step) using Eleventy's `eleventyComputed`. This makes `seo` available as a top-level variable that `seo-head.njk` reads. Setting it via `{% set %}` in the template body would not propagate to the layout's includes.

```njk
---
layout: layouts/base.njk
permalink: /index.html
title: Home
---
<section class="hero">
  <div class="hero__bg" style="background-image: url('{{ home.hero.image }}');"></div>
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <div class="hero__subtitle">{{ home.hero.subtitle }}</div>
    <div class="hero__divider"></div>
    <h1 class="hero__title">{{ home.hero.title }}</h1>
    <p style="margin-bottom: 2.5rem; opacity: 0.85; max-width: 480px; margin-left: auto; margin-right: auto;">{{ home.hero.description }}</p>
    <a href="/inquiry/" class="btn btn--light">{{ home.hero.cta }}</a>
  </div>
</section>

<div class="marquee">
  <div class="marquee__track">
    {% for item in home.testimonial_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
    {# Duplicate for seamless scroll #}
    {% for item in home.testimonial_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
  </div>
</div>

<section class="section section--white">
  <div class="container">
    <div style="text-align: center; margin-bottom: 4rem;" class="reveal">
      <p class="feature__label" style="margin-bottom: 0.5rem;">{{ home.why.label }}</p>
      <h2>{{ home.why.heading }}</h2>
    </div>
    <div class="grid-3">
      {% for card in home.why.cards %}
      <div class="card reveal">
        <h3>{{ card.title }}</h3>
        <p>{{ card.body }}</p>
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<div class="feature reveal">
  <div class="feature__image">
    <img src="{{ home.approach.image }}" alt="{{ home.approach.image_alt }}" loading="lazy">
  </div>
  <div class="feature__text" style="background: var(--bg-dark);">
    <span class="feature__label">{{ home.approach.label }}</span>
    <h2>{{ home.approach.heading }}</h2>
    <p>{{ home.approach.text }}</p>
    <a href="/about/" class="btn btn--primary">{{ home.approach.cta }}</a>
  </div>
</div>

<section class="section section--white">
  <div class="container">
    <div style="text-align: center; margin-bottom: 4rem;" class="reveal">
      <p class="feature__label" style="margin-bottom: 0.5rem;">How It Works</p>
      <h2>{{ home.process.heading }}</h2>
    </div>
    <div class="process">
      {% for step in home.process.steps %}
      <div class="process__step reveal">
        <div class="process__number">{{ step.number }}</div>
        <h3>{{ step.title }}</h3>
        <p>{{ step.body }}</p>
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<div class="marquee marquee--primary">
  <div class="marquee__track">
    {% for item in home.services_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
    {% for item in home.services_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
  </div>
</div>

<div class="feature feature--reverse reveal">
  <div class="feature__image">
    <img src="{{ home.portfolio_preview.image }}" alt="{{ home.portfolio_preview.image_alt }}" loading="lazy">
  </div>
  <div class="feature__text" style="background: var(--white);">
    <span class="feature__label">Our Work</span>
    <h2>{{ home.portfolio_preview.heading }}</h2>
    <p>{{ home.portfolio_preview.text }}</p>
    <a href="/portfolio/" class="btn btn--primary">View Portfolio</a>
  </div>
</div>

<section class="cta section--bg reveal">
  <h2>{{ home.cta.heading }}</h2>
  <p>{{ home.cta.text }}</p>
  <a href="/inquiry/" class="btn btn--filled" style="position: relative;">{{ home.cta.button }}</a>
</section>
```

- [ ] **Step 4b: Create `pages/index.11tydata.js`**

```js
module.exports = {
  eleventyComputed: {
    seo: (data) => data.home.seo
  }
};
```

- [ ] **Step 5: Run tests to confirm they pass**

Run: `npm test`
Expected: home tests pass, all earlier tests still pass.

- [ ] **Step 6: Visual smoke test in dev server**

Run: `npx eleventy --serve`
Open: `http://localhost:8080/`
Expected: home page renders. CSS placeholders show as literal `{{PLACEHOLDER}}` text — that's correct (template state, not customized state). Layout structure looks like the original `index.html`.

Stop the dev server: `Ctrl+C`.

- [ ] **Step 7: Commit**

```bash
git add template/_data/home.yml template/pages/index.njk template/pages/index.11tydata.js template/tests/home.test.mjs
git commit -m "feat(template): convert home page to Eleventy template"
```

---

## Task 6: About page data and template

**Files:**
- Create: `template/_data/about.yml`
- Create: `template/pages/about.njk`
- Create: `template/pages/about.11tydata.js`
- Create: `template/tests/about.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/about.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("about page builds to /about/index.html", () => {
  assert.ok(outputExists("about/index.html"));
});

test("about page renders designer section and philosophy", () => {
  const html = readOutput("about/index.html");
  assert.match(html, /class="about-intro"/);
  assert.match(html, /Our Philosophy/);
});

test("about page includes nav and footer", () => {
  const html = readOutput("about/index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/about.test.mjs`
Expected: fails.

- [ ] **Step 3: Create `_data/about.yml`**

Drawn from `template/about.html` placeholders:

```yaml
seo:
  title: "{{ABOUT_SEO_TITLE}}"
  description: "{{ABOUT_META_DESCRIPTION}}"
  og_image: "{{ABOUT_OG_IMAGE}}"

hero:
  image: "{{ABOUT_HERO_IMAGE}}"

designer:
  photo: "{{DESIGNER_PHOTO}}"
  name: "{{DESIGNER_NAME}}"
  heading: "{{DESIGNER_HEADING}}"
  title: "{{DESIGNER_TITLE}}"
  bio_html: "{{DESIGNER_BIO}}"

philosophy:
  heading: "{{PHILOSOPHY_HEADING}}"
  values:
    - title: "{{VALUE_1_TITLE}}"
      body: "{{VALUE_1_BODY}}"
    - title: "{{VALUE_2_TITLE}}"
      body: "{{VALUE_2_BODY}}"
    - title: "{{VALUE_3_TITLE}}"
      body: "{{VALUE_3_BODY}}"

local:
  label: "{{LOCAL_LABEL}}"
  heading: "{{LOCAL_HEADING}}"
  text: "{{LOCAL_TEXT}}"
  image: "{{LOCAL_IMAGE}}"
  image_alt: "{{LOCAL_IMAGE_ALT}}"

testimonial_marquee:
  - "{{ABOUT_TESTIMONIAL_1}}"
  - "{{ABOUT_TESTIMONIAL_2}}"
  - "{{ABOUT_TESTIMONIAL_3}}"

cta:
  heading: "{{ABOUT_CTA_HEADING}}"
  text: "{{ABOUT_CTA_TEXT}}"

flower_icon: "{{FLOWER_ICON}}"
```

- [ ] **Step 4: Create `pages/about.njk`**

```njk
---
layout: layouts/base.njk
permalink: /about/index.html
title: About
---
<section class="page-hero">
  <div class="hero__bg" style="background-image: url('{{ about.hero.image }}');"></div>
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <div class="hero__subtitle">Our Story</div>
    <div class="hero__divider"></div>
    <h1 class="hero__title">About Us</h1>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    <div class="about-intro">
      <div class="about-intro__image reveal">
        <img src="{{ about.designer.photo }}" alt="{{ about.designer.name }}" loading="lazy">
      </div>
      <div class="about-intro__text reveal reveal-delay-1">
        <p class="feature__label">Meet the Designer</p>
        <h2>{{ about.designer.heading }}</h2>
        <p class="subtitle">{{ about.designer.title }}</p>
        {{ about.designer.bio_html | safe }}
      </div>
    </div>
  </div>
</section>

<div class="divider divider--line" style="color: var(--primary-pale);">{{ about.flower_icon | safe }}</div>

<section class="section section--bg">
  <div class="container">
    <div style="text-align: center; margin-bottom: 4rem;" class="reveal">
      <p class="feature__label" style="margin-bottom: 0.5rem;">Our Philosophy</p>
      <h2>{{ about.philosophy.heading }}</h2>
    </div>
    <div class="values">
      {% for value in about.philosophy.values %}
      <div class="value reveal">
        <h3>{{ value.title }}</h3>
        <p>{{ value.body }}</p>
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<div class="feature reveal">
  <div class="feature__image">
    <img src="{{ about.local.image }}" alt="{{ about.local.image_alt }}" loading="lazy">
  </div>
  <div class="feature__text" style="background: var(--bg-dark);">
    <span class="feature__label">{{ about.local.label }}</span>
    <h2>{{ about.local.heading }}</h2>
    <p>{{ about.local.text }}</p>
  </div>
</div>

<div class="marquee">
  <div class="marquee__track">
    {% for item in about.testimonial_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
    {% for item in about.testimonial_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
  </div>
</div>

<section class="cta section--white reveal">
  <h2>{{ about.cta.heading }}</h2>
  <p>{{ about.cta.text }}</p>
  <a href="/inquiry/" class="btn btn--filled">Get in Touch</a>
</section>
```

- [ ] **Step 5: Create `pages/about.11tydata.js`**

```js
module.exports = {
  eleventyComputed: {
    seo: (data) => data.about.seo
  }
};
```

- [ ] **Step 6: Run tests to confirm pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add template/_data/about.yml template/pages/about.njk template/pages/about.11tydata.js template/tests/about.test.mjs
git commit -m "feat(template): convert about page to Eleventy template"
```

---

## Task 7: Inquiry page

**Files:**
- Create: `template/_data/inquiry.yml`
- Create: `template/pages/inquiry.njk`
- Create: `template/pages/inquiry.11tydata.js`
- Create: `template/tests/inquiry.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/inquiry.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("inquiry page builds to /inquiry/index.html", () => {
  assert.ok(outputExists("inquiry/index.html"));
});

test("inquiry page renders form embed slot", () => {
  const html = readOutput("inquiry/index.html");
  assert.match(html, /\{\{INQUIRY_FORM_EMBED\}\}/);
});

test("inquiry page renders nav and footer", () => {
  const html = readOutput("inquiry/index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/inquiry.test.mjs`
Expected: fails.

- [ ] **Step 3: Create `_data/inquiry.yml`**

```yaml
seo:
  title: "{{INQUIRY_SEO_TITLE}}"
  description: "{{INQUIRY_META_DESCRIPTION}}"
  og_image: "{{INQUIRY_OG_IMAGE}}"

hero:
  image: "{{INQUIRY_HERO_IMAGE}}"

form_embed_html: "{{INQUIRY_FORM_EMBED}}"

testimonial_marquee:
  - "{{INQUIRY_TESTIMONIAL_1}}"
  - "{{INQUIRY_TESTIMONIAL_2}}"
  - "{{INQUIRY_TESTIMONIAL_3}}"
```

- [ ] **Step 4: Create `pages/inquiry.njk`**

```njk
---
layout: layouts/base.njk
permalink: /inquiry/index.html
title: Inquire
---
<section class="page-hero">
  <div class="hero__bg" style="background-image: url('{{ inquiry.hero.image }}');"></div>
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <div class="hero__subtitle">Let's Work Together</div>
    <div class="hero__divider"></div>
    <h1 class="hero__title">Inquire</h1>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    <div class="reveal">
      {{ inquiry.form_embed_html | safe }}
    </div>
  </div>
</section>

<div class="marquee">
  <div class="marquee__track">
    {% for item in inquiry.testimonial_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
    {% for item in inquiry.testimonial_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
  </div>
</div>
```

- [ ] **Step 5: Create `pages/inquiry.11tydata.js`**

```js
module.exports = {
  eleventyComputed: {
    seo: (data) => data.inquiry.seo
  }
};
```

- [ ] **Step 6: Run tests to confirm pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add template/_data/inquiry.yml template/pages/inquiry.njk template/pages/inquiry.11tydata.js template/tests/inquiry.test.mjs
git commit -m "feat(template): convert inquiry page to Eleventy template"
```

---

## Task 8: Portfolio collection — config and sample entries

**Files:**
- Create: `template/content/portfolio/portfolio.json` (collection-level config)
- Create: `template/content/portfolio/sample-wedding-1.md`
- Create: `template/content/portfolio/sample-wedding-2.md`
- Create: `template/_includes/layouts/portfolio-entry.njk`
- Create: `template/_includes/partials/gallery.njk`
- Create: `template/tests/portfolio-collection.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/portfolio-collection.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("sample wedding 1 builds to its own directory", () => {
  assert.ok(outputExists("portfolio/sample-wedding-1/index.html"));
});

test("sample wedding 2 builds to its own directory", () => {
  assert.ok(outputExists("portfolio/sample-wedding-2/index.html"));
});

test("portfolio entry renders title, location, venue, and gallery", () => {
  const html = readOutput("portfolio/sample-wedding-1/index.html");
  assert.match(html, /Sample Wedding 1/);
  assert.match(html, /class="gallery"/);
  assert.match(html, /<img[^>]*alt="[^"]+"/); // alt text on at least one image
});

test("portfolio entry renders SEO from frontmatter", () => {
  const html = readOutput("portfolio/sample-wedding-1/index.html");
  assert.match(html, /<title>Sample Wedding 1[^<]*<\/title>/);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/portfolio-collection.test.mjs`
Expected: fails.

- [ ] **Step 3: Create collection config**

`template/content/portfolio/portfolio.json` (applies frontmatter defaults to all `.md` files in this directory):

```json
{
  "layout": "layouts/portfolio-entry.njk",
  "permalink": "/portfolio/{{ page.fileSlug }}/index.html",
  "tags": ["portfolio"],
  "eleventyComputed": {}
}
```

- [ ] **Step 4: Create the gallery partial**

`template/_includes/partials/gallery.njk`:

```njk
<div class="gallery">
  {% for item in items %}
  <figure class="gallery__item reveal">
    <img src="{{ item.image }}" alt="{{ item.alt }}" loading="lazy">
    {% if item.caption %}<figcaption class="gallery__caption">{{ item.caption }}</figcaption>{% endif %}
  </figure>
  {% endfor %}
</div>
```

- [ ] **Step 5: Create the portfolio-entry layout**

`template/_includes/layouts/portfolio-entry.njk`:

```njk
---
layout: layouts/base.njk
eleventyComputed:
  seo:
    title: "{{ seo.title or (title + ' Wedding | ' + site.business_name) }}"
    description: "{{ seo.description }}"
    og_image: "{{ hero_image }}"
---
<section class="page-hero">
  <div class="hero__bg" style="background-image: url('{{ hero_image }}');"></div>
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <div class="hero__subtitle">{{ season }} Wedding</div>
    <div class="hero__divider"></div>
    <h1 class="hero__title">{{ title }}</h1>
    {% if venue or location %}
    <p class="page-hero__meta">{% if venue %}{{ venue }}{% endif %}{% if venue and location %} · {% endif %}{% if location %}{{ location }}{% endif %}</p>
    {% endif %}
  </div>
</section>

<section class="section section--white">
  <div class="container portfolio-entry__story">
    <div class="reveal">
      {{ content | safe }}
    </div>
    {% if palette and palette.length %}
    <div class="portfolio-entry__palette reveal">
      <p class="feature__label">Color Palette</p>
      <ul class="palette-swatches">
        {% for color in palette %}
        <li>{{ color }}</li>
        {% endfor %}
      </ul>
    </div>
    {% endif %}
  </div>
</section>

{% if gallery and gallery.length %}
<section class="section section--white">
  <div class="container">
    {% set items = gallery %}
    {% include "partials/gallery.njk" %}
  </div>
</section>
{% endif %}

<section class="cta section--bg reveal">
  <h2>Ready to plan yours?</h2>
  <p>Let's create something meaningful together.</p>
  <a href="/inquiry/" class="btn btn--filled">Start Your Inquiry</a>
</section>
```

The `{% set items = gallery %}` is required because `gallery.njk` reads from a variable named `items` — Nunjucks `{% include %}` inherits the parent scope, so we set `items` to the page's `gallery` data before including.

- [ ] **Step 6: Create sample entries**

`template/content/portfolio/sample-wedding-1.md`:

```markdown
---
title: "Sample Wedding 1"
date: 2025-06-15
location: "Sample City, ST"
venue: "Sample Venue"
season: "Summer"
palette:
  - "blush"
  - "ivory"
  - "sage"
hero_image: "/assets/portfolio/sample-wedding-1/hero.jpg"
hero_image_alt: "Sample wedding ceremony arch"
gallery:
  - image: "/assets/portfolio/sample-wedding-1/01.jpg"
    caption: "Bridal bouquet"
    alt: "Bridal bouquet for sample wedding"
  - image: "/assets/portfolio/sample-wedding-1/02.jpg"
    caption: "Reception centerpiece"
    alt: "Reception centerpiece, summer wedding"
seo:
  title: "Sample Wedding 1 at Sample Venue"
  description: "A summer wedding at Sample Venue showcasing blush and sage florals."
---

This is a sample portfolio entry. Replace this content when adding real weddings via the CMS at /admin/.

Use 2-4 paragraphs of story-led copy describing the wedding's atmosphere, the couple's vision, and the floral choices.
```

`template/content/portfolio/sample-wedding-2.md`:

```markdown
---
title: "Sample Wedding 2"
date: 2025-09-22
location: "Sample City, ST"
venue: "Mountain Estate"
season: "Fall"
palette:
  - "burgundy"
  - "rust"
  - "cream"
hero_image: "/assets/portfolio/sample-wedding-2/hero.jpg"
hero_image_alt: "Fall wedding ceremony with autumn florals"
gallery:
  - image: "/assets/portfolio/sample-wedding-2/01.jpg"
    caption: "Autumnal bouquet"
    alt: "Autumnal bouquet with burgundy roses"
seo:
  title: "Sample Wedding 2 at Mountain Estate"
  description: "A fall wedding at Mountain Estate with rich burgundy and rust tones."
---

A second sample entry to demonstrate the collection.
```

- [ ] **Step 7: Run tests to confirm pass**

Run: `npm test`
Expected: portfolio-collection tests pass.

- [ ] **Step 8: Commit**

```bash
git add template/content/ template/_includes/layouts/portfolio-entry.njk template/_includes/partials/gallery.njk template/tests/portfolio-collection.test.mjs
git commit -m "feat(template): add portfolio collection with sample entries"
```

---

## Task 9: Portfolio listing page

**Files:**
- Create: `template/_data/portfolio_page.yml`
- Create: `template/pages/portfolio.njk`
- Create: `template/pages/portfolio.11tydata.js`
- Create: `template/tests/portfolio-listing.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/portfolio-listing.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("portfolio listing builds to /portfolio/index.html", () => {
  assert.ok(outputExists("portfolio/index.html"));
});

test("portfolio listing links to all portfolio entries", () => {
  const html = readOutput("portfolio/index.html");
  assert.match(html, /href="\/portfolio\/sample-wedding-1\//);
  assert.match(html, /href="\/portfolio\/sample-wedding-2\//);
});

test("portfolio listing entries show hero image and title", () => {
  const html = readOutput("portfolio/index.html");
  assert.match(html, /Sample Wedding 1/);
  assert.match(html, /<img[^>]*src="\/assets\/portfolio\/sample-wedding-1\/hero\.jpg"/);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/portfolio-listing.test.mjs`
Expected: fails.

- [ ] **Step 3: Create `_data/portfolio_page.yml`**

```yaml
seo:
  title: "{{PORTFOLIO_SEO_TITLE}}"
  description: "{{PORTFOLIO_META_DESCRIPTION}}"
  og_image: "{{PORTFOLIO_OG_IMAGE}}"

hero:
  image: "{{PORTFOLIO_HERO_IMAGE}}"

intro:
  heading: "{{PORTFOLIO_INTRO_HEADING}}"
  text: "{{PORTFOLIO_INTRO_TEXT}}"

flowers_marquee:
  - "{{FLOWER_1}}"
  - "{{FLOWER_2}}"
  - "{{FLOWER_3}}"
  - "{{FLOWER_4}}"

cta:
  heading: "{{PORTFOLIO_CTA_HEADING}}"
  text: "{{PORTFOLIO_CTA_TEXT}}"
```

- [ ] **Step 4: Create `pages/portfolio.njk`**

```njk
---
layout: layouts/base.njk
permalink: /portfolio/index.html
title: Portfolio
---
<section class="page-hero">
  <div class="hero__bg" style="background-image: url('{{ portfolio_page.hero.image }}');"></div>
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <div class="hero__subtitle">Our Work</div>
    <div class="hero__divider"></div>
    <h1 class="hero__title">Portfolio</h1>
  </div>
</section>

<section class="section section--white" style="padding-bottom: 2rem;">
  <div class="container" style="text-align: center; max-width: 700px;">
    <div class="reveal">
      <h2>{{ portfolio_page.intro.heading }}</h2>
      <p style="color: var(--text-light); margin-top: 1.2rem;">{{ portfolio_page.intro.text }}</p>
    </div>
  </div>
</section>

<section class="section section--white" style="padding-top: 2rem;">
  <div class="container">
    <div class="gallery">
      {% set entries = collections.portfolio | reverse %}
      {% for entry in entries %}
      <figure class="gallery__item reveal">
        <a href="{{ entry.url }}">
          <img src="{{ entry.data.hero_image }}" alt="{{ entry.data.hero_image_alt }}" loading="lazy">
        </a>
        <figcaption class="gallery__caption">
          <strong>{{ entry.data.title }}</strong>
          {% if entry.data.location %}<br><span class="gallery__meta">{{ entry.data.location }}</span>{% endif %}
        </figcaption>
      </figure>
      {% endfor %}
    </div>
  </div>
</section>

<div class="marquee marquee--primary">
  <div class="marquee__track">
    {% for item in portfolio_page.flowers_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
    {% for item in portfolio_page.flowers_marquee %}
      <span class="marquee__item">{{ item }}</span>
      <span class="marquee__divider">✦</span>
    {% endfor %}
  </div>
</div>

<section class="cta section--bg reveal">
  <h2>{{ portfolio_page.cta.heading }}</h2>
  <p>{{ portfolio_page.cta.text }}</p>
  <a href="/inquiry/" class="btn btn--filled">Start Your Inquiry</a>
</section>

<div class="lightbox">
  <div class="lightbox__close">&times;</div>
  <img class="lightbox__img" src="" alt="Gallery image">
</div>
```

- [ ] **Step 5: Create `pages/portfolio.11tydata.js`**

```js
module.exports = {
  eleventyComputed: {
    seo: (data) => data.portfolio_page.seo
  }
};
```

- [ ] **Step 6: Run tests to confirm pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add template/_data/portfolio_page.yml template/pages/portfolio.njk template/pages/portfolio.11tydata.js template/tests/portfolio-listing.test.mjs
git commit -m "feat(template): convert portfolio listing page"
```

---

## Task 10: LocalBusiness JSON-LD schema

**Files:**
- Create: `template/_includes/partials/schema-local-business.njk`
- Modify: `template/_includes/layouts/base.njk`
- Create: `template/tests/schema.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/schema.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "./render.mjs";

test("home page includes LocalBusiness JSON-LD", () => {
  const html = readOutput("index.html");
  assert.match(html, /<script type="application\/ld\+json">[\s\S]*"@type":\s*"Florist"/);
});

test("LocalBusiness schema contains business_name and contact", () => {
  const html = readOutput("index.html");
  // Allow placeholder strings since template is uncustomized
  assert.match(html, /"name":\s*"\{\{BUSINESS_NAME\}\}"/);
});

test("portfolio entry includes Article schema", () => {
  const html = readOutput("portfolio/sample-wedding-1/index.html");
  assert.match(html, /<script type="application\/ld\+json">[\s\S]*"@type":\s*"Article"/);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/schema.test.mjs`
Expected: fails.

- [ ] **Step 3: Create the LocalBusiness schema partial**

`template/_includes/partials/schema-local-business.njk`:

```njk
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Florist",
  "name": "{{ site.business_name }}",
  "url": "{{ site.url }}",
  "telephone": "{{ site.contact.phone }}",
  "email": "{{ site.contact.email }}",
  "image": "{{ site.url }}{{ seo_defaults.default_og_image }}",
  "areaServed": [
    {%- for area in site.location.service_areas -%}
    "{{ area }}"{% if not loop.last %},{% endif %}
    {%- endfor -%}
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{{ site.location.city }}",
    "addressRegion": "{{ site.location.region }}"
  },
  "sameAs": [
    {%- if site.social.instagram -%}"{{ site.social.instagram }}"{%- endif -%}
    {%- if site.social.instagram and site.social.pinterest -%},{%- endif -%}
    {%- if site.social.pinterest -%}"{{ site.social.pinterest }}"{%- endif -%}
  ]
}
</script>
```

- [ ] **Step 4: Wire into base layout**

Edit `template/_includes/layouts/base.njk` `<head>` section. After the `<style>` block and before `</head>`, add:

```njk
{% include "partials/schema-local-business.njk" %}
{% if schemaType == "Article" %}
  {% include "partials/schema-article.njk" %}
{% endif %}
```

- [ ] **Step 5: Create Article schema partial for portfolio entries**

`template/_includes/partials/schema-article.njk`:

```njk
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{ title }}",
  "datePublished": "{{ date | toISOString }}",
  "image": "{{ site.url }}{{ hero_image }}",
  "author": {
    "@type": "Organization",
    "name": "{{ site.business_name }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ site.business_name }}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{ site.url }}/assets/logo.png"
    }
  },
  "description": "{{ seo.description }}",
  "contentLocation": {
    "@type": "Place",
    "name": "{{ venue }}",
    "address": "{{ location }}"
  }
}
</script>
```

- [ ] **Step 6: Add `toISOString` filter and `schemaType` mark for portfolio entries**

In `.eleventy.js`, add a filter inside the function body before the `return`:

```js
eleventyConfig.addFilter("toISOString", (date) => {
  if (!date) return "";
  return new Date(date).toISOString();
});
```

Edit `template/_includes/layouts/portfolio-entry.njk` frontmatter to set `schemaType`:

```yaml
---
layout: layouts/base.njk
eleventyComputed:
  schemaType: "Article"
  seo:
    title: "{{ seo.title or (title + ' Wedding | ' + site.business_name) }}"
    description: "{{ seo.description }}"
    og_image: "{{ hero_image }}"
---
```

- [ ] **Step 7: Run tests to confirm pass**

Run: `npm test`
Expected: schema tests pass; all earlier tests still pass.

- [ ] **Step 8: Commit**

```bash
git add template/_includes/partials/schema-*.njk template/_includes/layouts/base.njk template/_includes/layouts/portfolio-entry.njk template/.eleventy.js template/tests/schema.test.mjs
git commit -m "feat(template): add LocalBusiness and Article schema.org markup"
```

---

## Task 11: Sitemap and robots.txt

**Files:**
- Modify: `template/.eleventy.js`
- Create: `template/sitemap.njk`
- Create: `template/robots.txt`
- Create: `template/tests/sitemap-robots.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/sitemap-robots.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("sitemap.xml is generated", () => {
  assert.ok(outputExists("sitemap.xml"));
});

test("sitemap includes home and portfolio pages", () => {
  const xml = readOutput("sitemap.xml");
  assert.match(xml, /<loc>[^<]*\/<\/loc>/);
  assert.match(xml, /<loc>[^<]*\/portfolio\/<\/loc>/);
  assert.match(xml, /<loc>[^<]*\/portfolio\/sample-wedding-1\/<\/loc>/);
});

test("robots.txt is generated", () => {
  assert.ok(outputExists("robots.txt"));
  const txt = readOutput("robots.txt");
  assert.match(txt, /User-agent: \*/);
  assert.match(txt, /Sitemap: /);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/sitemap-robots.test.mjs`
Expected: fails.

- [ ] **Step 3: Create sitemap.njk (manual generation, no plugin needed)**

`template/sitemap.njk`:

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% set staticUrls = ["/", "/portfolio/", "/about/", "/inquiry/"] %}
  {% for url in staticUrls %}
  <url>
    <loc>{{ site.url }}{{ url }}</loc>
    <changefreq>monthly</changefreq>
  </url>
  {% endfor %}
  {% for entry in collections.portfolio %}
  <url>
    <loc>{{ site.url }}{{ entry.url }}</loc>
    {% if entry.data.date %}<lastmod>{{ entry.data.date | toISOString }}</lastmod>{% endif %}
    <changefreq>yearly</changefreq>
  </url>
  {% endfor %}
</urlset>
```

Manual generation is simpler than the `@quasibit/eleventy-plugin-sitemap` plugin and gives us full control over output structure. No new dependencies needed.

- [ ] **Step 4: Create robots.njk template**

`template/robots.njk` — using a Nunjucks template (not static `robots.txt`) so we can substitute `site.url`:

```njk
---
permalink: /robots.txt
eleventyExcludeFromCollections: true
---
User-agent: *
Allow: /

Sitemap: {{ site.url }}/sitemap.xml
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add template/sitemap.njk template/robots.njk template/tests/sitemap-robots.test.mjs
git commit -m "feat(template): add sitemap.xml and robots.txt"
```

---

## Task 12: Decap CMS — admin page and config

**Files:**
- Create: `template/admin/index.html`
- Create: `template/admin/config.yml`
- Create: `template/tests/cms.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/cms.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import yaml from "js-yaml";
import { outputExists } from "./render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "..");

test("admin/index.html is in build output", () => {
  assert.ok(outputExists("admin/index.html"));
});

test("admin/config.yml is in build output", () => {
  assert.ok(outputExists("admin/config.yml"));
});

test("admin config has git-gateway backend", () => {
  const raw = readFileSync(join(TEMPLATE_DIR, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  assert.equal(cfg.backend.name, "git-gateway");
});

test("admin config has portfolio collection with required alt fields", () => {
  const raw = readFileSync(join(TEMPLATE_DIR, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  const portfolio = cfg.collections.find(c => c.name === "portfolio");
  assert.ok(portfolio, "portfolio collection must exist");
  const heroAlt = portfolio.fields.find(f => f.name === "hero_image_alt");
  assert.equal(heroAlt.required, true, "hero_image_alt must be required");
});

test("admin config has Pages collection with home, about, portfolio_page, inquiry", () => {
  const raw = readFileSync(join(TEMPLATE_DIR, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  const pages = cfg.collections.find(c => c.name === "pages");
  assert.ok(pages);
  const fileNames = pages.files.map(f => f.name);
  assert.ok(fileNames.includes("home"));
  assert.ok(fileNames.includes("about"));
  assert.ok(fileNames.includes("portfolio_page"));
  assert.ok(fileNames.includes("inquiry"));
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/cms.test.mjs`
Expected: fails.

- [ ] **Step 3: Create `admin/index.html`**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  <script>
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", user => {
        if (!user) {
          window.netlifyIdentity.on("login", () => {
            document.location.href = "/admin/";
          });
        }
      });
    }
  </script>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create `admin/config.yml`**

```yaml
backend:
  name: git-gateway
  branch: main

publish_mode: editorial_workflow

media_folder: "assets/portfolio"
public_folder: "/assets/portfolio"

site_url: "{{SITE_URL}}"
display_url: "{{SITE_URL}}"
logo_url: /assets/logo.png

collections:
  - name: "pages"
    label: "Pages"
    files:
      - file: "_data/home.yml"
        name: "home"
        label: "Home Page"
        fields:
          - label: "SEO"
            name: "seo"
            widget: "object"
            collapsed: true
            fields:
              - { label: "Page title", name: "title", widget: "string", hint: "60 chars max — appears in browser tab and Google results" }
              - { label: "Meta description", name: "description", widget: "text", pattern: ['.{50,160}', "Aim for 50-160 characters"] }
              - { label: "OG image (social sharing)", name: "og_image", widget: "image", required: false }
          - label: "Hero"
            name: "hero"
            widget: "object"
            fields:
              - { label: "Subtitle (small text above title)", name: "subtitle", widget: "string" }
              - { label: "Title", name: "title", widget: "string" }
              - { label: "Description", name: "description", widget: "text" }
              - { label: "Button label (CTA)", name: "cta", widget: "string" }
              - { label: "Background image", name: "image", widget: "image", required: true }
              - { label: "Image alt text", name: "image_alt", widget: "string", required: true, hint: "Describe the image for SEO/accessibility" }
          - { label: "Testimonial marquee", name: "testimonial_marquee", widget: "list", field: { label: "Item", name: "item", widget: "string" } }
          - label: "Why us section"
            name: "why"
            widget: "object"
            fields:
              - { label: "Section label", name: "label", widget: "string" }
              - { label: "Heading", name: "heading", widget: "string" }
              - label: "Cards"
                name: "cards"
                widget: "list"
                fields:
                  - { label: "Title", name: "title", widget: "string" }
                  - { label: "Body", name: "body", widget: "text" }
          - label: "Approach section"
            name: "approach"
            widget: "object"
            fields:
              - { label: "Label", name: "label", widget: "string" }
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body text", name: "text", widget: "text" }
              - { label: "Button label", name: "cta", widget: "string" }
              - { label: "Image", name: "image", widget: "image" }
              - { label: "Image alt text", name: "image_alt", widget: "string", required: true }
          - label: "Process section"
            name: "process"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - label: "Steps"
                name: "steps"
                widget: "list"
                fields:
                  - { label: "Step number", name: "number", widget: "string" }
                  - { label: "Title", name: "title", widget: "string" }
                  - { label: "Body", name: "body", widget: "text" }
          - { label: "Services marquee", name: "services_marquee", widget: "list", field: { label: "Item", name: "item", widget: "string" } }
          - label: "Portfolio preview"
            name: "portfolio_preview"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body", name: "text", widget: "text" }
              - { label: "Image", name: "image", widget: "image" }
              - { label: "Image alt text", name: "image_alt", widget: "string", required: true }
          - label: "Bottom CTA"
            name: "cta"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body", name: "text", widget: "text" }
              - { label: "Button label", name: "button", widget: "string" }

      - file: "_data/about.yml"
        name: "about"
        label: "About Page"
        fields:
          - label: "SEO"
            name: "seo"
            widget: "object"
            collapsed: true
            fields:
              - { label: "Page title", name: "title", widget: "string" }
              - { label: "Meta description", name: "description", widget: "text", pattern: ['.{50,160}', "Aim for 50-160 characters"] }
              - { label: "OG image", name: "og_image", widget: "image", required: false }
          - label: "Hero"
            name: "hero"
            widget: "object"
            fields:
              - { label: "Background image", name: "image", widget: "image" }
          - label: "Designer"
            name: "designer"
            widget: "object"
            fields:
              - { label: "Photo", name: "photo", widget: "image" }
              - { label: "Name", name: "name", widget: "string" }
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Title (e.g., 'Owner & Lead Designer')", name: "title", widget: "string" }
              - { label: "Bio (HTML allowed)", name: "bio_html", widget: "markdown" }
          - label: "Philosophy section"
            name: "philosophy"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - label: "Values"
                name: "values"
                widget: "list"
                fields:
                  - { label: "Title", name: "title", widget: "string" }
                  - { label: "Body", name: "body", widget: "text" }
          - label: "Local sourcing section"
            name: "local"
            widget: "object"
            fields:
              - { label: "Label", name: "label", widget: "string" }
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body", name: "text", widget: "text" }
              - { label: "Image", name: "image", widget: "image" }
              - { label: "Image alt text", name: "image_alt", widget: "string", required: true }
          - { label: "Testimonial marquee", name: "testimonial_marquee", widget: "list", field: { label: "Item", name: "item", widget: "string" } }
          - label: "CTA"
            name: "cta"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body", name: "text", widget: "text" }
          - { label: "Flower icon (HTML/SVG)", name: "flower_icon", widget: "string" }

      - file: "_data/portfolio_page.yml"
        name: "portfolio_page"
        label: "Portfolio Page (listing)"
        fields:
          - label: "SEO"
            name: "seo"
            widget: "object"
            collapsed: true
            fields:
              - { label: "Page title", name: "title", widget: "string" }
              - { label: "Meta description", name: "description", widget: "text", pattern: ['.{50,160}', "Aim for 50-160 characters"] }
              - { label: "OG image", name: "og_image", widget: "image", required: false }
          - label: "Hero"
            name: "hero"
            widget: "object"
            fields:
              - { label: "Background image", name: "image", widget: "image" }
          - label: "Intro"
            name: "intro"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body", name: "text", widget: "text" }
          - { label: "Flowers marquee", name: "flowers_marquee", widget: "list", field: { label: "Item", name: "item", widget: "string" } }
          - label: "CTA"
            name: "cta"
            widget: "object"
            fields:
              - { label: "Heading", name: "heading", widget: "string" }
              - { label: "Body", name: "text", widget: "text" }

      - file: "_data/inquiry.yml"
        name: "inquiry"
        label: "Inquiry Page"
        fields:
          - label: "SEO"
            name: "seo"
            widget: "object"
            collapsed: true
            fields:
              - { label: "Page title", name: "title", widget: "string" }
              - { label: "Meta description", name: "description", widget: "text", pattern: ['.{50,160}', "Aim for 50-160 characters"] }
              - { label: "OG image", name: "og_image", widget: "image", required: false }
          - label: "Hero"
            name: "hero"
            widget: "object"
            fields:
              - { label: "Background image", name: "image", widget: "image" }
          - { label: "Inquiry form HTML embed", name: "form_embed_html", widget: "text", hint: "Paste the embed code from your form provider" }
          - { label: "Testimonial marquee", name: "testimonial_marquee", widget: "list", field: { label: "Item", name: "item", widget: "string" } }

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
      - { label: "Location (e.g., Snowbird, UT)", name: "location", widget: "string" }
      - { label: "Venue", name: "venue", widget: "string" }
      - { label: "Season", name: "season", widget: "select", options: ["Spring", "Summer", "Fall", "Winter", "Late summer", "Early spring"] }
      - { label: "Color palette", name: "palette", widget: "list", field: { label: "Color", name: "color", widget: "string" } }
      - { label: "Hero image", name: "hero_image", widget: "image", required: true }
      - { label: "Hero image alt text", name: "hero_image_alt", widget: "string", required: true, hint: "Describe the image. Include venue/city when natural — helps Google find your work." }
      - label: "Gallery"
        name: "gallery"
        widget: "list"
        fields:
          - { label: "Image", name: "image", widget: "image", required: true }
          - { label: "Caption (visible on page)", name: "caption", widget: "string" }
          - { label: "Alt text (SEO + accessibility)", name: "alt", widget: "string", required: true }
      - label: "SEO"
        name: "seo"
        widget: "object"
        collapsed: true
        fields:
          - { label: "Page title", name: "title", widget: "string", hint: "60 chars max" }
          - { label: "Meta description", name: "description", widget: "text", pattern: ['.{50,160}', "Aim for 50-160 characters"] }
      - { label: "Story (the writeup)", name: "body", widget: "markdown" }

  - name: "settings"
    label: "Site Settings"
    files:
      - file: "_data/site.yml"
        name: "site"
        label: "Business info, location, theme"
        fields:
          - { label: "Business name", name: "business_name", widget: "string" }
          - { label: "Tagline", name: "tagline", widget: "string" }
          - { label: "Site URL", name: "url", widget: "string" }
          - { label: "Announcement bar (set blank to hide)", name: "announcement", widget: "string", required: false }
          - label: "Location"
            name: "location"
            widget: "object"
            fields:
              - { label: "City", name: "city", widget: "string" }
              - { label: "State/Region (e.g., UT)", name: "region", widget: "string" }
              - { label: "Service areas", name: "service_areas", widget: "list", field: { label: "Area", name: "area", widget: "string" } }
          - label: "Contact"
            name: "contact"
            widget: "object"
            fields:
              - { label: "Email", name: "email", widget: "string" }
              - { label: "Phone", name: "phone", widget: "string", required: false }
          - label: "Social links"
            name: "social"
            widget: "object"
            fields:
              - { label: "Instagram URL", name: "instagram", widget: "string", required: false }
              - { label: "Pinterest URL", name: "pinterest", widget: "string", required: false }
          - label: "Navigation"
            name: "nav"
            widget: "list"
            fields:
              - { label: "Label", name: "label", widget: "string" }
              - { label: "URL path (e.g., /about/)", name: "url", widget: "string" }
          - label: "Theme (colors and fonts)"
            name: "theme"
            widget: "object"
            collapsed: true
            fields:
              - { label: "Primary color", name: "primary", widget: "string" }
              - { label: "Primary light", name: "primary_light", widget: "string" }
              - { label: "Primary pale", name: "primary_pale", widget: "string" }
              - { label: "Accent", name: "accent", widget: "string" }
              - { label: "Accent light", name: "accent_light", widget: "string" }
              - { label: "Background", name: "bg", widget: "string" }
              - { label: "Background dark", name: "bg_dark", widget: "string" }
              - { label: "Text color", name: "text", widget: "string" }
              - { label: "Text light", name: "text_light", widget: "string" }
              - { label: "Highlight", name: "highlight", widget: "string" }
              - { label: "Display font CSS value", name: "ff_display", widget: "string" }
              - { label: "Body font CSS value", name: "ff_body", widget: "string" }
              - { label: "Google Fonts URL", name: "google_fonts_url", widget: "string", required: false }

      - file: "_data/seo_defaults.yml"
        name: "seo_defaults"
        label: "SEO Defaults"
        fields:
          - { label: "Default OG image (used when a page doesn't set one)", name: "default_og_image", widget: "image" }
          - { label: "Default keywords", name: "default_keywords", widget: "string" }
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `npm test`
Expected: cms tests pass.

- [ ] **Step 6: Commit**

```bash
git add template/admin/ template/tests/cms.test.mjs
git commit -m "feat(template): add Decap CMS admin page and config"
```

---

## Task 13: Local CMS testing — verify admin loads

**Files:** No new files — this is a manual verification task.

- [ ] **Step 1: Build and serve**

Run: `npx eleventy --serve`
Expected: dev server starts at localhost:8080.

- [ ] **Step 2: Open `http://localhost:8080/admin/` in a browser**

Expected: Decap CMS UI loads with a login screen. (You won't be able to log in without Netlify Identity wired up, but the UI should render.)

- [ ] **Step 3: Verify all collections appear in sidebar**

Expected to see (after a successful login on a deployed site):
- Pages > Home Page, About Page, Portfolio Page (listing), Inquiry Page
- Portfolio (Weddings)
- Site Settings > Business info, SEO Defaults

If the UI errors or shows "Config Errors", read browser console for details. Common issues:
- YAML indentation errors → fix and reload
- Field references to non-existent files → ensure all `_data/*.yml` files referenced exist

- [ ] **Step 4: Stop dev server**

Press `Ctrl+C`.

- [ ] **Step 5: Document any UI quirks discovered**

Add a note to `template/HANDOFF.md` (created in Task 14) for any quirks worth flagging to clients.

---

## Task 14: Netlify config and HANDOFF.md

**Files:**
- Create: `template/netlify.toml`
- Create: `template/HANDOFF.md`
- Create: `template/tests/netlify.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `template/tests/netlify.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "..");

test("netlify.toml exists with build command", () => {
  const txt = readFileSync(join(TEMPLATE_DIR, "netlify.toml"), "utf-8");
  assert.match(txt, /command\s*=\s*"npm run build"/);
  assert.match(txt, /publish\s*=\s*"_site"/);
  assert.match(txt, /NODE_VERSION\s*=\s*"20"/);
});

test("HANDOFF.md exists and covers key topics", () => {
  const md = readFileSync(join(TEMPLATE_DIR, "HANDOFF.md"), "utf-8");
  assert.match(md, /Logging in/i);
  assert.match(md, /Adding a wedding/i);
  assert.match(md, /Editing pages/i);
  assert.match(md, /Publishing/i);
});
```

- [ ] **Step 2: Run test to confirm fails**

Run: `npm test -- tests/netlify.test.mjs`
Expected: fails.

- [ ] **Step 3: Create `netlify.toml`**

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

- [ ] **Step 4: Create `HANDOFF.md`**

```markdown
# Site management guide

This document is for the site owner. It covers how to log in, edit content, publish changes, and what to do if something breaks.

## What this site is

A static website built with Eleventy and hosted on Netlify. Content (your home page, about page, portfolio entries) lives in your GitHub repository as YAML and Markdown files. You edit content through a CMS at `https://yoursite.com/admin/`. When you publish a change, the site rebuilds automatically and goes live in 30-60 seconds.

## Logging in to the CMS

1. Go to `https://yoursite.com/admin/`.
2. Log in with the email and password you set up.
3. If you forget your password, use the "Forgot password" link.

You'll see three sections in the sidebar:

- **Pages** — your home, about, portfolio (listing), and inquiry pages
- **Portfolio (Weddings)** — your individual wedding entries
- **Site Settings** — business info, location, social links, theme colors

## Editing pages

1. Click "Pages" in the sidebar.
2. Click the page you want to edit (e.g., "Home Page").
3. Change any field — the form is organized in sections.
4. Click "Save" to save a draft.
5. When ready, change the status from "Draft" to "Ready" to "Publish".

## Adding a wedding to your portfolio

1. Click "Portfolio (Weddings)" in the sidebar.
2. Click "New Wedding" in the top right.
3. Fill in:
   - Title (couple names)
   - Date, location, venue, season, palette
   - Hero image (the main photo) and its alt text
   - Gallery photos — for each, upload the image, write a caption, and write alt text (required for SEO)
   - SEO — page title and meta description
   - Story — the writeup, formatted in markdown
4. Save → Ready → Publish.

The wedding will show up on your portfolio listing page automatically.

## A note on alt text

Every image needs alt text. The CMS won't let you publish without it. Alt text serves two purposes:

1. **Accessibility** — people using screen readers hear the alt text to understand what the image is.
2. **SEO** — Google uses alt text to understand your images. Including the venue or city ("Bridal bouquet at Cliff Lodge, Snowbird") helps your site rank for local searches.

Aim for a short, descriptive sentence. Don't stuff keywords.

## Publishing changes

The CMS uses an "Editorial Workflow" with three states:

- **Draft** — your work in progress, not yet visible
- **In Review** — ready to look over before publishing
- **Ready** — approved, ready to go live
- Click **Publish** when ready

Once you publish, the site rebuilds automatically. Wait 30-60 seconds and refresh your live site to see the change.

## What if I make a mistake?

Every change is recorded as a commit in your GitHub repository. To undo a published change:

1. Log into GitHub.
2. Go to your repository.
3. Click "Commits" → find the commit for your change → click "Revert".

Or contact a developer for help.

## Inviting other users

You can invite collaborators (a partner, employee, etc.) through Netlify:

1. Log in to Netlify (https://app.netlify.com).
2. Go to your site → Identity tab.
3. Click "Invite users".
4. Enter their email — they'll receive an invitation.

## Troubleshooting

- **CMS won't load** — check that you're at `/admin/` (with the trailing slash). Try a different browser.
- **Login fails** — make sure your email is registered (check Netlify Identity tab).
- **Published change isn't showing up** — wait 60 seconds and hard-refresh (Cmd/Ctrl+Shift+R). Check the "Deploys" tab in Netlify for build errors.
- **Build failed** — read the build log in Netlify. Most common cause: bad markdown formatting or missing required field.

## Need help?

Contact the developer who built this site. Their info is in your project handoff documents.
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add template/netlify.toml template/HANDOFF.md template/tests/netlify.test.mjs
git commit -m "feat(template): add Netlify config and client handoff guide"
```

---

## Task 15: Remove old HTML files and finalize

**Files:**
- Delete: `template/index.html`, `template/about.html`, `template/portfolio.html`, `template/inquiry.html`
- Delete: `template/test-page.njk`
- Modify: `template/css/style.css` (remove `{{PLACEHOLDER}}` tokens since theme now lives in `_data/site.yml`)

- [ ] **Step 1: Delete old HTML files**

```bash
rm template/index.html template/about.html template/portfolio.html template/inquiry.html
rm template/test-page.njk
```

- [ ] **Step 2: Update `template/css/style.css`**

Remove the `:root { ... }` block at the top (lines 7-37 of original). Theme tokens are now injected via `<style>` block in `base.njk`.

Read the current `:root` block to confirm exact line range, then delete just those declarations. Keep the comment marker:

Replace lines 7-37 (everything inside `:root { ... }`) with just:

```css
/* Theme tokens are injected per-page via base.njk from _data/site.yml */
:root {
  --white: #FFFFFF;

  --fs-hero: clamp(3rem, 8vw, 6.5rem);
  --fs-h1: clamp(2.2rem, 5vw, 4rem);
  --fs-h2: clamp(1.6rem, 3.5vw, 2.8rem);
  --fs-h3: clamp(1.2rem, 2vw, 1.6rem);
  --fs-body: clamp(0.95rem, 1.1vw, 1.1rem);
  --fs-small: 0.85rem;
  --fs-nav: 0.8rem;

  --transition: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-slow: 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

Also remove line 5: `@import url('{{GOOGLE_FONTS_URL}}');` — Google Fonts is now loaded via `<link>` in `base.njk`.

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 4: Run a clean build**

```bash
npm run clean
npm run build
```

Expected: build succeeds with no errors. Output in `_site/` includes:
- `index.html`
- `about/index.html`
- `portfolio/index.html`
- `inquiry/index.html`
- `portfolio/sample-wedding-1/index.html`
- `portfolio/sample-wedding-2/index.html`
- `sitemap.xml`
- `robots.txt`
- `admin/index.html`, `admin/config.yml`
- `css/style.css`, `js/main.js`, `assets/...` (passthrough)

- [ ] **Step 5: Visual smoke test**

Run: `npm run dev`
Open: `http://localhost:8080/`
Expected: home page renders with structure intact (placeholders show as literal `{{...}}` text — this is the uncustomized template state).

Visit `/about/`, `/portfolio/`, `/inquiry/`, `/portfolio/sample-wedding-1/`. Each should render without errors.

Open the browser dev tools console — should be no JS errors.

Stop the dev server: `Ctrl+C`.

- [ ] **Step 6: Commit**

```bash
git add -A template/
git commit -m "chore(template): remove legacy HTML files, finalize CSS theme injection"
```

---

## Task 16: README for template

**Files:**
- Create: `template/README.md`

- [ ] **Step 1: Create `template/README.md`**

```markdown
# Florist Site Template

Eleventy + Decap CMS starter for florist websites.

## Quick start

```bash
npm install
npm run dev      # local dev server at localhost:8080
npm run build    # production build to _site/
npm test         # run test suite
```

## Spinning up a new client site

1. Copy this directory to a new location: `cp -r template/ ../<client-name>/`
2. Replace `{{PLACEHOLDER}}` tokens in `_data/*.yml` and `admin/config.yml` with client-specific values.
3. Add real assets to `assets/`.
4. Replace `content/portfolio/sample-*.md` with real entries (or leave samples for the client to delete via CMS).
5. Set up GitHub repo, push, connect to Netlify.
6. Enable Netlify Identity + Git Gateway.
7. Invite the client's email.
8. Hand off (see `HANDOFF.md`).

## Architecture

See `docs/superpowers/specs/2026-04-30-eleventy-decap-conversion-design.md` (in the parent project) for the full design rationale.

## Directory structure

- `_data/` — YAML files driving fixed pages (home, about, portfolio listing, inquiry)
- `_includes/layouts/` — `base.njk` (HTML skeleton), `portfolio-entry.njk`
- `_includes/partials/` — `nav.njk`, `footer.njk`, `seo-head.njk`, `gallery.njk`, schema.org partials
- `pages/` — one `.njk` template per route
- `content/portfolio/` — markdown collection, one file per wedding
- `admin/` — Decap CMS config and entry point
- `assets/`, `css/`, `js/` — static assets, passed through to build
```

- [ ] **Step 2: Commit**

```bash
git add template/README.md
git commit -m "docs(template): add README with quick-start and structure overview"
```

---

## Self-review (run before declaring complete)

- [ ] All 16 tasks committed
- [ ] `npm test` passes from a clean checkout
- [ ] `npm run build` produces complete output with no errors
- [ ] Visual smoke test: every page loads in dev server
- [ ] Decap admin UI loads at `/admin/` (login won't work locally without Identity, but UI must render)
- [ ] No leftover `template/index.html` etc. — only `pages/index.njk`
- [ ] `style.css` no longer has `{{PLACEHOLDER}}` tokens (theme tokens live in `_data/site.yml`)
- [ ] Spec coverage check: every section of the design spec has a corresponding task in this plan

## Out of scope (Plan 2 territory)

- Migrating Cottage Floral Design from this new template
- DNS cutover from GitHub Pages to Netlify
- Setting up Netlify Identity invitations
- Adding seasonal pages (`mothers-day.yml`, `dance-flowers.yml`) — they're Cottage-Floral-specific
- Image optimization plugin
- Visual regression test against the live Cottage Floral site
