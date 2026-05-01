# Cottage Floral Design Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the live cottagefloraldesign.com site from raw HTML on GitHub Pages to the Eleventy + Decap CMS template (Plan 1), preserving all content, SEO equity, and visual parity. Output: a deployable Netlify site with CMS access for the client.

**Architecture:** Hoist `/template/` contents to repo root, delete legacy root HTML pages (replaced by the Eleventy build), preserve seasonal pages (Mother's Day, Dance Flowers) as raw HTML pass-through, and populate `_data/*.yml` + `content/portfolio/*.md` with Cottage Floral's actual content extracted from the legacy HTML. Theme colors and fonts (sage/rose/cream palette + Cormorant Garamond/Questrial) get wired into both the universal site.yml AND a static `:root` block in CSS so legacy seasonal pages render correctly.

**Tech Stack:** Eleventy 3, Nunjucks, Decap CMS, Netlify (deploy target). No new dependencies.

**Branch:** `cottage-floral-migration` (already checked out, off merged main)

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-04-30-eleventy-decap-conversion-design.md`
- Plan 1 (template conversion): `docs/superpowers/plans/2026-04-30-eleventy-decap-template-conversion.md`

---

## Pre-flight

- Working directory: `/mnt/c/Users/Snic9/CottageFloral/` (repo root)
- Branch: `cottage-floral-migration`
- Node 20+, npm 10+ already installed
- 39/39 template tests pass on main
- Legacy CF site files still present at repo root (to be replaced/migrated)
- New universal template at `template/` (to be hoisted to root)

**Source files for content extraction (read-only; do not modify before extraction):**
- `index.html`, `about.html`, `portfolio.html`, `inquiry.html`, `dance-flowers.html`, `mothers-day.html`
- `portfolio/austin-anna.html`, `portfolio/dani-rock.html`, `portfolio/katelyn-brad.html`, `portfolio/maile-aidan.html`
- `css/style.css` (the source of CF's actual theme values)
- `assets/`, `assets/portfolio/`, `assets/mothers-day/`

**The Cottage Floral theme values (extracted from current `css/style.css`):**

```yaml
primary: "#4A5D4E"          # sage
primary_light: "#6B7F6E"    # sage-light
primary_pale: "#D4DDD6"     # sage-pale
accent: "#C9A5A0"           # rose
accent_light: "#E8D5D2"     # rose-light
bg: "#FAF7F2"               # cream
bg_dark: "#F2EDE5"          # cream-dark
text: "#3A3A3A"             # charcoal
text_light: "#6B6B6B"       # charcoal-light
highlight: "#C4A96A"        # gold
ff_display: "'Cormorant Garamond', 'Georgia', serif"
ff_body: "'Questrial', 'Helvetica Neue', sans-serif"
google_fonts_url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Questrial&display=swap"
```

---

## Task 1: Hoist template to repo root

**Files:**
- Move: all of `template/*` (and `template/.*`) → repo root
- Delete: `index.html`, `about.html`, `portfolio.html`, `inquiry.html` (replaced by Eleventy build)
- Delete: `template/` directory itself (now empty)
- Modify: `package.json` scripts (will reference root paths after hoist)
- Modify: `tests/render.mjs` (path to `_site/` is now repo root + `_site/`)

Note: `mothers-day.html`, `dance-flowers.html`, `portfolio/*.html` stay at root for now (handled in Tasks 8, 9).

- [ ] **Step 1: Inspect both directories so you understand the conflicts**

Run:
```bash
cd /mnt/c/Users/Snic9/CottageFloral
ls -1
ls -1 template/
```

Expected at root: `CNAME`, legacy HTML files, `assets/`, `css/`, `js/`, `portfolio/`, `template/`, plus the existing `docs/`.
Expected in template: `.eleventy.js`, `package.json`, `_data/`, `_includes/`, `pages/`, `content/`, `admin/`, `assets/.gitkeep`, `css/style.css`, `js/main.js`, `tests/`, `HANDOFF.md`, `README.md`, `netlify.toml`, `robots.njk`, `sitemap.njk`, `.gitignore`.

Conflicts (same path in both):
- `css/style.css` — root has CF actual values; template has cleaned :root. Template version wins (we'll restore CF defaults in Task 3).
- `js/main.js` — identical per project memory; template version wins (no functional change).
- `assets/` — root has actual CF JPGs; template has just `.gitkeep`. Root version wins.

**Step 2: Move template files to root**

Use `git mv` to preserve history. Run from repo root:

```bash
# Subdirectories (move whole tree)
git mv template/_data .
git mv template/_includes .
git mv template/pages .
git mv template/content .
git mv template/admin .
git mv template/tests .

# Top-level files
git mv template/.eleventy.js .
git mv template/package.json .
git mv template/package-lock.json .
git mv template/netlify.toml .
git mv template/robots.njk .
git mv template/sitemap.njk .
git mv template/HANDOFF.md .
git mv template/README.md .

# .gitignore — handle merge: root may not have one. If it doesn't, plain mv works:
test -f .gitignore || git mv template/.gitignore .
# If root already has one, merge by hand:
# (Skip if test above moved it — only run the next two lines if root .gitignore exists)
# cat template/.gitignore >> .gitignore
# rm template/.gitignore
```

For the conflicting paths (`css/style.css`, `js/main.js`), overwrite root with template versions:

```bash
# Overwrite legacy root css with template's cleaned-up version
mv -f template/css/style.css css/style.css
# js/main.js — same content per memory; replace anyway for cleanliness
mv -f template/js/main.js js/main.js

# template/css and template/js dirs should now be empty; remove
rmdir template/css template/js
```

For `template/assets/.gitkeep`, the template's empty assets dir is unnecessary at root since root has actual `/assets/`:

```bash
rm template/assets/.gitkeep
rmdir template/assets
```

Now remove the empty template directory:

```bash
rmdir template
```

Verify it's gone:
```bash
ls template 2>&1
# Expected: ls: cannot access 'template': No such file or directory
```

**Step 3: Delete legacy page HTML at root (will be replaced by Eleventy build)**

```bash
git rm index.html about.html portfolio.html inquiry.html
```

**Step 4: Update test helper for new path**

Edit `tests/render.mjs`. Change:

```js
const TEMPLATE_DIR = join(__dirname, "..");
const SITE_DIR = join(TEMPLATE_DIR, "_site");
```

The constant name `TEMPLATE_DIR` is misleading now that there's no template directory — rename to `REPO_ROOT`. Final file:

```js
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const SITE_DIR = join(REPO_ROOT, "_site");

export function readOutput(relativePath) {
  const full = join(SITE_DIR, relativePath);
  if (!existsSync(full)) throw new Error(`Output file missing: ${relativePath}`);
  return readFileSync(full, "utf-8");
}

export function outputExists(relativePath) {
  return existsSync(join(SITE_DIR, relativePath));
}
```

Also update `tests/data.test.mjs`, `tests/cms.test.mjs`, `tests/netlify.test.mjs` — they each have `const TEMPLATE_DIR = ...` lines. Rename to `REPO_ROOT` and update path comments. The actual `join(__dirname, "..")` value is unchanged so functionally these continue to work — this is just a rename for clarity.

```bash
# Find the TEMPLATE_DIR usages in tests
grep -rn "TEMPLATE_DIR" tests/
# Manually rename to REPO_ROOT in each file
```

**Step 5: Recommended dev mode for WSL — bake polling into the dev script**

Edit `package.json`. Update the `dev` script to enable polling (resolves the WSL2 inotify quirk encountered during local CMS testing in Plan 1):

Find:
```json
"dev": "eleventy --serve",
```

Replace with:
```json
"dev": "CHOKIDAR_USEPOLLING=true eleventy --serve",
```

**Step 6: Run tests to verify the hoist didn't break anything**

```bash
npm install      # may not be needed if node_modules came along, but safe to re-run
rm -rf _site
npm test
```

Expected: 39/39 tests pass. If any fail because of path issues, check the test output for "ENOENT" errors and verify the file is at the new root location.

**Step 7: Spot-check the build output**

```bash
ls _site/
```

Expected directories: `admin/`, `about/`, `assets/`, `content/` (empty or absent — collections don't passthrough), `css/`, `js/`, `inquiry/`, `portfolio/`, plus `index.html`, `robots.txt`, `sitemap.xml`. No `template/` directory anywhere.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: hoist Eleventy template to repo root for Cottage Floral migration

Replaces legacy CF root HTML files (index.html, about.html, portfolio.html,
inquiry.html) with the Eleventy build output. Existing /assets/ retained;
legacy /css/style.css overwritten with template's cleaned-up version (theme
will be restored in next task). Mother's Day, Dance Flowers, and individual
portfolio entry HTML files preserved at root for migration in subsequent tasks."
```

---

## Task 2: Configure Cottage Floral business info and theme in site.yml

**Files:**
- Modify: `_data/site.yml`

- [ ] **Step 1: Read the current site.yml**

```bash
cat _data/site.yml
```

It currently has all `{{PLACEHOLDER}}` tokens.

- [ ] **Step 2: Replace with Cottage Floral's actual values**

Write `_data/site.yml`:

```yaml
business_name: "Cottage Floral Design"
tagline: "Bespoke Wedding & Event Florals"
url: "https://cottagefloraldesign.com"
announcement: "Now Booking 2026 & 2027 Weddings & Events"

location:
  city: "Salt Lake City"
  region: "UT"
  service_areas:
    - "Salt Lake City"
    - "Park City"
    - "Wasatch Front"

contact:
  email: "hello@cottagefloraldesign.com"
  phone: ""

social:
  instagram: ""
  pinterest: ""

nav:
  - { label: "Home", url: "/" }
  - { label: "Portfolio", url: "/portfolio/" }
  - { label: "About", url: "/about/" }
  - { label: "Mother's Day", url: "/mothers-day.html" }
  - { label: "Dance Flowers", url: "/dance-flowers.html" }
  - { label: "Inquire", url: "/inquiry/" }

theme:
  primary: "#4A5D4E"
  primary_light: "#6B7F6E"
  primary_pale: "#D4DDD6"
  accent: "#C9A5A0"
  accent_light: "#E8D5D2"
  bg: "#FAF7F2"
  bg_dark: "#F2EDE5"
  text: "#3A3A3A"
  text_light: "#6B6B6B"
  highlight: "#C4A96A"
  ff_display: "'Cormorant Garamond', 'Georgia', serif"
  ff_body: "'Questrial', 'Helvetica Neue', sans-serif"
  google_fonts_url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Questrial&display=swap"
```

**Notes on values:**
- `phone`, `social.instagram`, `social.pinterest` left empty — fill in with real values when available (or via CMS post-deploy).
- `announcement` matches the live site's "Now Booking 2026 & 2027 Weddings & Events" — note this is currently dynamic (booking-years span). After migration it's a static string in the YAML; client edits it via CMS yearly.
- `nav` has 6 entries to match current Cottage Floral nav including Mother's Day and Dance Flowers. The `.html` extension on seasonal pages reflects the static-passthrough handling in Task 9.
- `location.city/region` set to "Salt Lake City, UT" — VERIFY THIS WITH THE OWNER. Original site doesn't explicitly state location but the client domain and target market suggest Utah. Adjust if the actual business is elsewhere. (Acceptable to leave a TODO comment in YAML if uncertain — Decap CMS will let the owner fix it post-deploy.)

- [ ] **Step 3: Build and verify theme injection works**

```bash
rm -rf _site
npx @11ty/eleventy
grep -A2 "<style>" _site/index.html | head -5
```

Expected output should show the theme variables with actual hex values (e.g., `--primary: #4A5D4E;`).

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: still 39/39 pass.

- [ ] **Step 5: Commit**

```bash
git add _data/site.yml
git commit -m "feat: populate site.yml with Cottage Floral business info and theme"
```

---

## Task 3: Restore CF theme defaults in css/style.css for legacy pages

**Files:**
- Modify: `css/style.css`

**Why:** Mother's Day and Dance Flowers (Task 9) stay as raw HTML pass-through — they don't extend `base.njk`, so they don't get the inline `<style>` block that injects `--primary`, `--accent`, etc. Without static `:root` defaults in the CSS file, those pages will have undefined CSS variables and render with broken theme.

For converted pages (home, about, portfolio, inquiry, portfolio entries), the inline `<style>` in `base.njk` overrides the static `:root` because it comes later in document order. So adding defaults to `style.css` doesn't hurt converted pages — it just provides a fallback.

- [ ] **Step 1: Read the current `:root` in style.css**

```bash
sed -n '1,30p' css/style.css
```

The first ~30 lines should currently look like:

```css
/* ============================================
   Florist Website Template
   ============================================ */

/* Theme tokens (--primary, --accent, fonts, etc.) are injected per-site
   via inline <style> in base.njk from _data/site.yml.
   Google Fonts are loaded via <link> in base.njk when site.theme.google_fonts_url is set. */
:root {
  --white: #FFFFFF;

  /* TYPOGRAPHY SIZES (kept here, not theme-overridable) */
  --fs-hero: clamp(3rem, 8vw, 6.5rem);
  ...
```

- [ ] **Step 2: Add CF theme defaults to `:root`**

Edit `css/style.css`. Replace the `:root { ... }` block (the first one — there's only one) with:

```css
:root {
  --white: #FFFFFF;

  /* THEME DEFAULTS for static pages (mothers-day.html, dance-flowers.html).
     Converted pages override these via inline <style> in base.njk. */
  --primary: #4A5D4E;
  --primary-light: #6B7F6E;
  --primary-pale: #D4DDD6;
  --accent: #C9A5A0;
  --accent-light: #E8D5D2;
  --bg: #FAF7F2;
  --bg-dark: #F2EDE5;
  --text: #3A3A3A;
  --text-light: #6B6B6B;
  --highlight: #C4A96A;
  --ff-display: 'Cormorant Garamond', 'Georgia', serif;
  --ff-body: 'Questrial', 'Helvetica Neue', sans-serif;

  /* TYPOGRAPHY SIZES (kept here, not theme-overridable) */
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

(Also update the comment block at the very top to reflect that this is now Cottage Floral's instance, not the universal template — feel free to rewrite the header comment to "Cottage Floral Design — Eleventy + Decap" or similar.)

- [ ] **Step 3: Run tests**

```bash
rm -rf _site
npm test
```

Expected: 39/39 pass.

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat: add CF theme defaults to css :root for legacy seasonal pages"
```

---

## Task 4: Extract home page content to _data/home.yml

**Files:**
- Modify: `_data/home.yml`
- Read-only source: `index.html` (already deleted from working tree, but available via `git show HEAD~3:index.html` since it was deleted in Task 1's commit)

Wait — `index.html` was deleted in Task 1's commit. To read its content, use:

```bash
git show HEAD~2:index.html > /tmp/legacy-index.html
# Or more reliably, find the deleting commit:
git log --diff-filter=D -- index.html --format=%H | head -1
# Use that SHA: git show <sha>~1:index.html > /tmp/legacy-index.html
```

Or simpler — the content is also accessible via `git log -p -- index.html` in the merged history.

- [ ] **Step 1: Recover legacy index.html content**

```bash
# Find the commit that deleted index.html
DEL_SHA=$(git log --diff-filter=D --pretty=%H -- index.html | head -1)
echo "Deleted in: $DEL_SHA"
# Show its previous version
git show $DEL_SHA^:index.html > /tmp/legacy-index.html
ls -lh /tmp/legacy-index.html
```

Expected: file recovered (~263 lines).

- [ ] **Step 2: Read the legacy file and extract content**

The legacy `index.html` has these sections matching the home.yml schema:

- `<title>` → `seo.title`
- `<meta name="description">` → `seo.description`
- Hero: `.hero__subtitle`, `.hero__title`, `<p>` description, button label, `.hero__bg` background image URL → `hero.subtitle`, `hero.title`, `hero.description`, `hero.cta`, `hero.image`
- Marquee testimonials → `testimonial_marquee` list (extract each `<span class="marquee__item">` text)
- "Why" section: `.feature__label`, `<h2>`, three `.card` titles + bodies → `why.label`, `why.heading`, `why.cards[]`
- "Approach" feature: same shape as why → `approach.*`
- Process steps: three numbered steps → `process.heading`, `process.steps[]`
- Services marquee → `services_marquee` list
- Portfolio preview feature → `portfolio_preview.*`
- CTA: heading, body, button → `cta.*`

Open `/tmp/legacy-index.html` and extract content. Replace the placeholder values in `_data/home.yml` with the actual content. The hero image will be one of the existing `/assets/*.jpg` files (likely `Headliner.jpg`).

For SEO:
- `seo.title`: "Salt Lake City Wedding Florist | Cottage Floral Design" (or similar — incorporate location for SEO)
- `seo.description`: 50-160 char location-aware description, e.g., "Bespoke wedding and event florals serving Salt Lake City, Park City, and the Wasatch Front. Story-led design by Cottage Floral Design."
- `seo.og_image`: same as hero image, usually `/assets/Headliner.jpg`

For each `image` field (hero, approach, portfolio_preview), use the actual path from the legacy HTML (typically `assets/<filename>.jpg`). Verify each referenced image exists:

```bash
for img in $(grep -oE 'assets/[A-Za-z0-9._-]+' /tmp/legacy-index.html | sort -u); do
  test -f "$img" && echo "OK: $img" || echo "MISSING: $img"
done
```

For each `image_alt` field, write a descriptive alt that includes location keywords ("...Salt Lake City wedding florist") for SEO.

- [ ] **Step 3: Write the populated `_data/home.yml`**

(The implementer fills in this YAML file by hand based on what they extracted. The structure is the existing one — just replace `{{PLACEHOLDER}}` tokens with real content. Below is a representative skeleton; actual values depend on legacy HTML reading.)

Example structure (fill in real content):

```yaml
seo:
  title: "Salt Lake City Wedding Florist | Cottage Floral Design"
  description: "Bespoke wedding and event florals serving Salt Lake City, Park City, and the Wasatch Front. Story-led design by Cottage Floral Design."
  og_image: "/assets/Headliner.jpg"

hero:
  subtitle: "Bespoke Wedding & Event Florals"
  title: "Cottage Floral<br>Design"   # preserve <br> as in original; safe filter renders it
  description: "[actual description from legacy HTML]"
  cta: "Start Your Inquiry"
  image: "/assets/Headliner.jpg"
  image_alt: "Bridal bouquet with garden roses, Salt Lake City wedding florist"

testimonial_marquee:
  - "[actual marquee item 1]"
  - "[actual marquee item 2]"
  ...

why:
  label: "[label]"
  heading: "[heading]"
  cards:
    - title: "[card 1 title]"
      body: "[card 1 body]"
    ...

# ... and so on for approach, process, services_marquee, portfolio_preview, cta
```

**Important:** the `hero.title` may contain `<br>` from the original (e.g., "Cottage Floral<br>Design"). The current `pages/index.njk` renders `hero.title` without `| safe` filter, so HTML in the value would be escaped. Two options:

a) Strip the `<br>` and use a plain title ("Cottage Floral Design")
b) Update `pages/index.njk` to render `{{ home.hero.title | safe }}` (allows HTML)

Pick (a) for simplicity unless the `<br>` is visually critical. If you need (b), include the template change in this task.

Same consideration for any heading that has `<br>` or `<em class="italic">` markup in the legacy HTML.

- [ ] **Step 4: Build and visually verify**

```bash
rm -rf _site
npx @11ty/eleventy --serve
# Open http://localhost:8080/ and compare to https://cottagefloraldesign.com/
# Stop with Ctrl+C
```

Expected: home page should look very similar to the live site. Differences to expect:
- Layout structure same; content same
- Theme colors same (sage/rose/cream)
- Typography same (Cormorant Garamond / Questrial)

If something looks broken (missing image, wrong color, etc.), debug before moving on.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: 39/39 pass. Tests previously checking for `{{HOME_SEO_TITLE}}` placeholder will FAIL because content is now real. Update those tests:

In `tests/home.test.mjs`, find:

```js
test("home page seo title comes from home.yml seo block", () => {
  const html = readOutput("index.html");
  assert.match(html, /<title>\{\{HOME_SEO_TITLE\}\}<\/title>/);
});
```

Replace with:

```js
test("home page seo title is from home.yml", () => {
  const html = readOutput("index.html");
  assert.match(html, /<title>[^<]*Cottage Floral Design[^<]*<\/title>/);
});
```

Also update test 2:

```js
test("home page renders hero from data file", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="hero"/);
  assert.match(html, /\{\{HERO_TITLE\}\}/);  // OLD - delete this assertion
});
```

To:

```js
test("home page renders hero from data file", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="hero"/);
  assert.match(html, /Cottage Floral/);   // matches actual hero title
});
```

Re-run `npm test`. All 39 should pass.

- [ ] **Step 6: Commit**

```bash
git add _data/home.yml tests/home.test.mjs
git commit -m "feat: populate home page with Cottage Floral content"
```

---

## Task 5: Extract about page content to _data/about.yml

**Files:**
- Modify: `_data/about.yml`
- Modify: `tests/about.test.mjs` (update placeholder assertions)
- Read-only source: legacy `about.html` (recover via `git show <del-sha>^:about.html`)

- [ ] **Step 1: Recover legacy about.html**

```bash
DEL_SHA=$(git log --diff-filter=D --pretty=%H -- about.html | head -1)
git show $DEL_SHA^:about.html > /tmp/legacy-about.html
```

- [ ] **Step 2: Map legacy content to about.yml schema**

Sections to extract:
- `<title>`, `<meta name="description">` → `seo.title`, `seo.description`
- Page hero background image → `hero.image`
- Designer section: photo, name, "Meet the Designer" heading, designer title, bio paragraphs → `designer.*`
- Philosophy section: heading + 3 values → `philosophy.heading`, `philosophy.values[]`
- Local feature: label, heading, body, image, alt → `local.*`
- Testimonial marquee → `testimonial_marquee`
- CTA → `cta.heading`, `cta.text`
- Flower icon (SVG/HTML in divider) → `flower_icon`

For `designer.bio_html`, this field is rendered with `| safe` so HTML is preserved. Copy the bio paragraphs as-is including `<p>` tags.

- [ ] **Step 3: Write `_data/about.yml`**

Replace placeholders with real content extracted from legacy.

- [ ] **Step 4: Update test placeholder assertions in `tests/about.test.mjs`**

The current tests check for structural classes (`class="about-intro"`, "Our Philosophy") which still pass. No test changes needed unless something breaks — check by running `npm test`.

- [ ] **Step 5: Build and verify**

```bash
rm -rf _site && npx @11ty/eleventy --serve
# Open localhost:8080/about/ and compare to live site
```

- [ ] **Step 6: Run tests + commit**

```bash
npm test
git add _data/about.yml tests/about.test.mjs
git commit -m "feat: populate about page with Cottage Floral content"
```

---

## Task 6: Extract portfolio listing content to _data/portfolio_page.yml

**Files:**
- Modify: `_data/portfolio_page.yml`
- Read-only source: legacy `portfolio.html` (recover via git)

- [ ] **Step 1: Recover legacy portfolio.html**

```bash
DEL_SHA=$(git log --diff-filter=D --pretty=%H -- portfolio.html | head -1)
git show $DEL_SHA^:portfolio.html > /tmp/legacy-portfolio.html
```

- [ ] **Step 2: Map content**

Schema fields:
- `seo.title`, `seo.description`, `seo.og_image`
- `hero.image` (page hero background) and `hero.image_alt`
- `intro.heading`, `intro.text`
- `flowers_marquee` (list of flower names from the marquee strip)
- `cta.heading`, `cta.text`

The actual gallery items (individual weddings) come from the `collections.portfolio` Eleventy collection, NOT from `portfolio_page.yml`. The YAML only has the surrounding page chrome.

- [ ] **Step 3: Write the populated YAML**

Replace placeholders with real content.

- [ ] **Step 4: Build and verify the listing renders**

```bash
rm -rf _site && npx @11ty/eleventy
ls _site/portfolio/
# Should include: index.html (the listing), and subfolders for each portfolio entry
# (entries created in Task 8 — for now only sample-wedding-1/ and sample-wedding-2/)
cat _site/portfolio/index.html | grep -E "Sample Wedding|Cottage Floral"
```

The listing currently shows the two sample weddings. After Task 8 they'll be replaced with the 4 real CF weddings.

- [ ] **Step 5: Run tests + commit**

```bash
npm test
git add _data/portfolio_page.yml
git commit -m "feat: populate portfolio listing page with Cottage Floral content"
```

---

## Task 7: Extract inquiry page content to _data/inquiry.yml

**Files:**
- Modify: `_data/inquiry.yml`
- Read-only source: legacy `inquiry.html` (recover via git)

- [ ] **Step 1: Recover legacy inquiry.html**

```bash
DEL_SHA=$(git log --diff-filter=D --pretty=%H -- inquiry.html | head -1)
git show $DEL_SHA^:inquiry.html > /tmp/legacy-inquiry.html
```

- [ ] **Step 2: Map content**

Schema fields:
- `seo.title`, `seo.description`, `seo.og_image`
- `hero.image`, `hero.image_alt`
- `form_embed_html` — paste the entire `<iframe>` or `<script>` block from the legacy inquiry form embed (probably a Petala or similar form provider). This field is rendered with `| safe`.
- `testimonial_marquee` — list of testimonials

- [ ] **Step 3: Write the YAML**

The `form_embed_html` field needs the complete embed code preserved verbatim including all attributes. Use a YAML literal block scalar:

```yaml
form_embed_html: |
  <iframe src="https://petala.io/embed/..." width="100%" height="800" ...></iframe>
```

(Or whatever the actual embed code is.)

- [ ] **Step 4: Build and visually verify**

```bash
rm -rf _site && npx @11ty/eleventy --serve
# Open localhost:8080/inquiry/ — verify form loads
```

- [ ] **Step 5: Run tests + commit**

```bash
npm test
git add _data/inquiry.yml
git commit -m "feat: populate inquiry page with Cottage Floral content"
```

---

## Task 8: Convert portfolio entries to markdown

**Files:**
- Delete: `content/portfolio/sample-wedding-1.md`, `content/portfolio/sample-wedding-2.md`
- Create: `content/portfolio/austin-anna.md`, `content/portfolio/dani-rock.md`, `content/portfolio/katelyn-brad.md`, `content/portfolio/maile-aidan.md`
- Read-only sources: legacy `portfolio/austin-anna.html`, `portfolio/dani-rock.html`, etc.

Note on slug-folder mismatch: the existing asset folders use plus-and-camelcase format (`assets/portfolio/Anna+AustinProposal/`, `Dani+Rock/`, `Katelyn+Brad/`, `Maile+Aidan/`) but URL slugs are hyphen-lowercase (`austin-anna`, etc.). Two options:

a) **Rename asset folders to match slugs** (`Anna+AustinProposal/` → `austin-anna/`) — cleaner long-term, matches CMS convention (`media_folder: /assets/portfolio/{{slug}}` works correctly).
b) **Reference the existing folder names from frontmatter** — preserves git history of those images.

Pick **(a)** — the frontmatter `hero_image` and gallery paths are explicit URLs anyway, and renaming the folders aligns with the CMS's `media_folder: /assets/portfolio/{{slug}}` setting.

- [ ] **Step 1: Rename asset folders to match slugs**

```bash
cd /mnt/c/Users/Snic9/CottageFloral
git mv assets/portfolio/Anna+AustinProposal assets/portfolio/austin-anna
git mv assets/portfolio/Dani+Rock assets/portfolio/dani-rock
git mv assets/portfolio/Katelyn+Brad assets/portfolio/katelyn-brad
git mv assets/portfolio/Maile+Aidan assets/portfolio/maile-aidan
```

- [ ] **Step 2: Recover legacy portfolio entry HTML files**

The `portfolio/austin-anna.html` etc. files are still on disk (not yet deleted). Read them directly:

```bash
ls portfolio/
# Expected: austin-anna.html, dani-rock.html, katelyn-brad.html, maile-aidan.html
```

For each entry, extract:
- Title (couple names) — from `<h1>` or `<title>`
- Date — from any "wedding date" mention; if absent, use the photo file mtime as approximation
- Location, Venue — from page copy
- Season — infer from date or mentioned season
- Color palette — list 2-4 dominant colors from photos or copy
- Hero image — typically `header.jpg` in the entry's asset folder
- Hero image alt text
- Gallery — list of all photos in the corresponding asset folder, each with caption + alt text
- SEO title, description
- Story body — the writeup paragraphs from the legacy HTML

- [ ] **Step 3: Create one markdown file per entry**

Example for `content/portfolio/austin-anna.md`:

```markdown
---
title: "Anna & Austin"
date: 2024-08-15
location: "Salt Lake City, UT"
venue: "[venue from legacy HTML]"
season: "Summer"
palette:
  - "[color 1]"
  - "[color 2]"
  - "[color 3]"
hero_image: "/assets/portfolio/austin-anna/header.jpg"
hero_image_alt: "Anna and Austin's proposal florals, Salt Lake City"
gallery:
  - image: "/assets/portfolio/austin-anna/IMG_3756.jpg"
    caption: "[caption]"
    alt: "[alt text]"
  - image: "/assets/portfolio/austin-anna/IMG_3767.jpg"
    caption: "[caption]"
    alt: "[alt text]"
  # ... one entry per file in assets/portfolio/austin-anna/ except header.jpg
seo:
  title: "Anna & Austin Proposal Florals at [Venue] | Cottage Floral Design"
  description: "Proposal florals for Anna and Austin showcasing [palette] design at [venue], Salt Lake City."
---

[2-4 paragraphs of story-led copy from the legacy HTML]
```

Repeat for `dani-rock.md`, `katelyn-brad.md`, `maile-aidan.md`. List the gallery images by reading the directory:

```bash
for slug in austin-anna dani-rock katelyn-brad maile-aidan; do
  echo "=== $slug ==="
  ls assets/portfolio/$slug/
done
```

- [ ] **Step 4: Delete sample portfolio entries**

```bash
git rm content/portfolio/sample-wedding-1.md content/portfolio/sample-wedding-2.md
rm -rf assets/portfolio/sample-wedding-1 assets/portfolio/sample-wedding-2 2>/dev/null
```

- [ ] **Step 5: Update tests that reference samples**

Edit `tests/portfolio-collection.test.mjs`. Replace references to "sample-wedding-1" and "sample-wedding-2" with one real CF wedding (e.g., "austin-anna"):

```js
test("austin-anna wedding builds to its own directory", () => {
  assert.ok(outputExists("portfolio/austin-anna/index.html"));
});

test("portfolio entry renders title, location, venue, and gallery", () => {
  const html = readOutput("portfolio/austin-anna/index.html");
  assert.match(html, /Anna.*Austin/);
  assert.match(html, /class="gallery"/);
  assert.match(html, /<img[^>]*alt="[^"]+"/);
});

// drop or replace the second sample test
```

Edit `tests/portfolio-listing.test.mjs` to reference the four real slugs instead of samples.

- [ ] **Step 6: Build and verify**

```bash
rm -rf _site && npx @11ty/eleventy
ls _site/portfolio/
# Expected directories: austin-anna, dani-rock, katelyn-brad, maile-aidan
cat _site/portfolio/index.html | grep -E "Anna|Dani|Katelyn|Maile" | head -10
```

- [ ] **Step 7: Run tests + commit**

```bash
npm test
git add content/portfolio/ assets/portfolio/ tests/portfolio-collection.test.mjs tests/portfolio-listing.test.mjs
git commit -m "feat: convert 4 Cottage Floral portfolio entries to markdown collection"
```

---

## Task 9: Update seasonal pages for new URL structure

**Files:**
- Modify: `mothers-day.html`
- Modify: `dance-flowers.html`

**Why:** Legacy seasonal pages have hardcoded relative links like `href="index.html"`, `href="portfolio.html"`. After the migration, the new URLs are `/`, `/portfolio/`, `/about/`, `/inquiry/`. The seasonal pages need their internal links updated.

These pages stay as raw HTML (per scope decision — option b in design discussion). They reference `/css/style.css` and `/js/main.js` which still work.

- [ ] **Step 1: Inventory all internal links in seasonal pages**

```bash
grep -E 'href="[^"]*\.html?"|src="[^"]*"' mothers-day.html | head -20
grep -E 'href="[^"]*\.html?"|src="[^"]*"' dance-flowers.html | head -20
```

Common patterns to look for and fix:
- `href="index.html"` → `href="/"`
- `href="portfolio.html"` → `href="/portfolio/"`
- `href="about.html"` → `href="/about/"`
- `href="inquiry.html"` → `href="/inquiry/"`
- `href="mothers-day.html"` → no change (still at /mothers-day.html)
- `href="dance-flowers.html"` → no change

For asset references (`src="assets/...")`, they should already be relative-to-root which works.

- [ ] **Step 2: Apply replacements**

Use sed or manual Edit per file. Example for mothers-day.html:

```bash
sed -i 's|href="index.html"|href="/"|g; s|href="portfolio.html"|href="/portfolio/"|g; s|href="about.html"|href="/about/"|g; s|href="inquiry.html"|href="/inquiry/"|g' mothers-day.html dance-flowers.html
```

Verify the changes look right:

```bash
grep -E 'href="[^"]*"' mothers-day.html | head -10
```

- [ ] **Step 3: Verify seasonal pages aren't double-processed by Eleventy**

Eleventy with `templateFormats: ["njk", "md", "html"]` will process raw HTML files through Nunjucks. If the seasonal pages contain literal `{{ }}` braces, they'd be evaluated as templates. Check:

```bash
grep -E '\{\{|\{%' mothers-day.html dance-flowers.html
```

If any `{{ }}` or `{% %}` appear that look like literal text (not template syntax), wrap them with `{% raw %}...{% endraw %}` blocks. If empty (no template syntax), good — Eleventy will pass them through as-is.

If you want to opt these pages out of Nunjucks processing entirely, add frontmatter at the top:

```html
---
templateEngineOverride: ""
---
<!DOCTYPE html>
...
```

The `templateEngineOverride: ""` (empty string) tells Eleventy to do no template processing. The HTML still gets copied to `_site/`.

Apply this frontmatter to both files for safety.

- [ ] **Step 4: Build and verify**

```bash
rm -rf _site && npx @11ty/eleventy
ls _site/ | grep -E "mothers|dance"
# Expected: mothers-day.html, dance-flowers.html in _site/

# Open in browser
npx @11ty/eleventy --serve
# Visit http://localhost:8080/mothers-day.html and /dance-flowers.html
# Verify nav links work and theme colors look right
```

- [ ] **Step 5: Commit**

```bash
git add mothers-day.html dance-flowers.html
git commit -m "feat: update seasonal pages for new URL structure"
```

---

## Task 10: Update CMS config to remove sample portfolio entries

**Files:**
- Modify: `admin/config.yml` (no schema changes, just sample-related labels)

The CMS config doesn't have hardcoded portfolio entry references — it generates them dynamically from `content/portfolio/*.md`. So no config change is required.

- [ ] **Step 1: Verify CMS still works after sample removal**

```bash
rm -rf _site && npx @11ty/eleventy
cat _site/admin/config.yml | head -10
# No errors, file unchanged
```

If the spec for CMS preview_path or any explicit sample reference exists, fix it. Otherwise, move on.

- [ ] **Step 2: Verify the portfolio collection in Decap UI**

Start dev server with local backend (similar to Plan 1's local CMS testing — see DEPLOYMENT.md once it's written). Or skip — the static config is structurally unchanged.

- [ ] **Step 3: No code changes; commit if anything was edited**

```bash
git status
# If clean, no commit needed for this task — just move on
```

If you made minor changes (e.g., copy-edits to field hints), commit those:

```bash
git add admin/config.yml
git commit -m "chore: clean up CMS config for Cottage Floral instance"
```

Otherwise mark this task complete with no commit.

---

## Task 11: Curate /assets/ directory

**Files:**
- Modify: `assets/` (delete unused images)

**Why:** Legacy CF site had ~20 images at `/assets/`. Some are still referenced by the new build (home page hero, about page imagery, etc.). Some are no longer used. Per scope decision (option b), curate by deleting unused.

- [ ] **Step 1: Inventory currently-referenced images**

Read every YAML data file and markdown content file for image references:

```bash
grep -rhE '/assets/[A-Za-z0-9._/+-]+(\.(jpg|jpeg|png|webp|gif|svg))?' \
  _data/ content/ admin/ \
  | grep -oE '/assets/[A-Za-z0-9._/+-]+(\.(jpg|jpeg|png|webp|gif|svg))' \
  | sort -u > /tmp/used-images.txt
cat /tmp/used-images.txt
```

Also check seasonal HTML pages:

```bash
grep -hE 'src="assets/[^"]+"' mothers-day.html dance-flowers.html \
  | grep -oE 'assets/[A-Za-z0-9._/+-]+(\.(jpg|jpeg|png|webp|gif|svg))' \
  | sort -u >> /tmp/used-images.txt
sort -u /tmp/used-images.txt -o /tmp/used-images.txt
```

- [ ] **Step 2: List actual files in /assets/**

```bash
find assets -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" -o -name "*.gif" \) | sort > /tmp/all-images.txt
cat /tmp/all-images.txt
```

- [ ] **Step 3: Identify unused candidates**

```bash
# Strip leading / from used to match the find output
sed 's|^/||' /tmp/used-images.txt > /tmp/used-norm.txt
comm -23 /tmp/all-images.txt /tmp/used-norm.txt > /tmp/unused.txt
echo "=== Candidate files for deletion ==="
cat /tmp/unused.txt
```

- [ ] **Step 4: Review and delete**

Review the unused list. Some files may be referenced from places the grep missed (e.g., logo.png referenced from CMS config or schema partials). Cross-check before deleting:

```bash
# For each candidate, double-check
for f in $(cat /tmp/unused.txt); do
  echo "=== $f ==="
  grep -rl "$(basename $f)" _data/ content/ admin/ pages/ _includes/ *.html 2>/dev/null
done
```

If a file shows zero references, it's safe to delete. Be conservative — when in doubt, keep.

```bash
# Delete confirmed unused files
while read f; do
  # Verify still unreferenced
  if ! grep -q "$(basename $f)" -r _data/ content/ admin/ pages/ _includes/ *.html *.toml 2>/dev/null; then
    git rm "$f"
  fi
done < /tmp/unused.txt
```

- [ ] **Step 5: Build and verify nothing broken**

```bash
rm -rf _site && npx @11ty/eleventy
# No build errors
# Spot-check pages
npx @11ty/eleventy --serve
# Visit /, /about/, /portfolio/, /inquiry/, /mothers-day.html, /dance-flowers.html, and at least one /portfolio/<slug>/
# All images should load (no broken-image icons in browser)
```

- [ ] **Step 6: Commit**

```bash
git status -s assets/
git commit -m "chore: remove unused images from assets/"
```

---

## Task 12: Add legacy URL redirects in netlify.toml

**Files:**
- Modify: `netlify.toml`

**Why:** Cottage Floral has SEO equity from existing URLs like `/portfolio/austin-anna.html`. After migration, the new URLs are `/portfolio/austin-anna/`. To preserve backlinks and rankings, add 301 redirects.

- [ ] **Step 1: List all URL changes needing redirects**

| Old URL | New URL |
|---------|---------|
| `/portfolio/austin-anna.html` | `/portfolio/austin-anna/` |
| `/portfolio/dani-rock.html` | `/portfolio/dani-rock/` |
| `/portfolio/katelyn-brad.html` | `/portfolio/katelyn-brad/` |
| `/portfolio/maile-aidan.html` | `/portfolio/maile-aidan/` |
| `/index.html` | `/` |
| `/about.html` | `/about/` |
| `/portfolio.html` | `/portfolio/` |
| `/inquiry.html` | `/inquiry/` |

- [ ] **Step 2: Add to netlify.toml**

The current `netlify.toml` has just the `/admin` redirect. Append the legacy redirects:

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

# Legacy URL redirects (preserve SEO equity from old GitHub Pages URLs)
[[redirects]]
  from = "/portfolio/austin-anna.html"
  to = "/portfolio/austin-anna/"
  status = 301

[[redirects]]
  from = "/portfolio/dani-rock.html"
  to = "/portfolio/dani-rock/"
  status = 301

[[redirects]]
  from = "/portfolio/katelyn-brad.html"
  to = "/portfolio/katelyn-brad/"
  status = 301

[[redirects]]
  from = "/portfolio/maile-aidan.html"
  to = "/portfolio/maile-aidan/"
  status = 301

[[redirects]]
  from = "/index.html"
  to = "/"
  status = 301

[[redirects]]
  from = "/about.html"
  to = "/about/"
  status = 301

[[redirects]]
  from = "/portfolio.html"
  to = "/portfolio/"
  status = 301

[[redirects]]
  from = "/inquiry.html"
  to = "/inquiry/"
  status = 301
```

- [ ] **Step 3: Update the netlify test**

In `tests/netlify.test.mjs`, the existing test only checks for build command/publish/Node version. Add a redirect-presence assertion:

```js
test("netlify.toml has legacy portfolio URL redirects", () => {
  const txt = readFileSync(join(REPO_ROOT, "netlify.toml"), "utf-8");
  assert.match(txt, /from\s*=\s*"\/portfolio\/austin-anna\.html"/);
  assert.match(txt, /status\s*=\s*301/);
});
```

- [ ] **Step 4: Run tests + commit**

```bash
npm test
git add netlify.toml tests/netlify.test.mjs
git commit -m "feat: add legacy URL redirects for SEO continuity"
```

---

## Task 13: CF-specific test additions + final verification

**Files:**
- Create: `tests/cottage-floral.test.mjs`

**Why:** Add a small set of CF-specific assertions to catch regressions during the migration (e.g., make sure all 4 weddings render, business name appears in schema, hero image exists on disk).

- [ ] **Step 1: Write CF-specific tests**

Create `tests/cottage-floral.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readOutput, outputExists } from "./render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

test("home page identifies Cottage Floral Design as the business", () => {
  const html = readOutput("index.html");
  assert.match(html, /Cottage Floral Design/);
});

test("LocalBusiness schema names Cottage Floral Design", () => {
  const html = readOutput("index.html");
  assert.match(html, /"name":\s*"Cottage Floral Design"/);
});

test("home page references the actual location in metadata", () => {
  const html = readOutput("index.html");
  assert.match(html, /Salt Lake City|Park City|Utah/);
});

test("all four portfolio entries build", () => {
  for (const slug of ["austin-anna", "dani-rock", "katelyn-brad", "maile-aidan"]) {
    assert.ok(outputExists(`portfolio/${slug}/index.html`), `missing ${slug}`);
  }
});

test("portfolio listing links to all four weddings", () => {
  const html = readOutput("portfolio/index.html");
  for (const slug of ["austin-anna", "dani-rock", "katelyn-brad", "maile-aidan"]) {
    assert.match(html, new RegExp(`href="/portfolio/${slug}/"`));
  }
});

test("seasonal pages are present in build output", () => {
  assert.ok(outputExists("mothers-day.html"));
  assert.ok(outputExists("dance-flowers.html"));
});

test("seasonal page nav links use new URL structure", () => {
  const html = readOutput("mothers-day.html");
  assert.match(html, /href="\/portfolio\/"/);
  assert.match(html, /href="\/about\/"/);
  assert.match(html, /href="\/inquiry\/"/);
});

test("hero images referenced by data files exist on disk", () => {
  // Pull the hero image path from the rendered home page and verify the file is shipped
  const html = readOutput("index.html");
  const match = html.match(/url\('(\/assets\/[^']+)'\)/);
  assert.ok(match, "hero background-image URL not found in rendered HTML");
  const path = join(REPO_ROOT, "_site", match[1]);
  assert.ok(existsSync(path), `hero image missing from build output: ${match[1]}`);
});

test("CNAME file is at repo root for custom domain", () => {
  const cname = readFileSync(join(REPO_ROOT, "CNAME"), "utf-8").trim();
  assert.equal(cname, "cottagefloraldesign.com");
});
```

- [ ] **Step 2: Run all tests**

```bash
rm -rf _site && npm test
```

Expected: all tests pass, including the new ones (~9 new tests). Total should be 39 (from Plan 1) + 9 = 48, minus a few that were updated/removed = roughly 46-48 depending on what changed in earlier tasks.

If any new test fails, debug. Common failures:
- "hero image missing" — check the `_data/home.yml` hero.image path matches an actual file
- "schema names Cottage Floral" — make sure `_data/site.yml` business_name is set correctly

- [ ] **Step 3: Final visual smoke test**

```bash
npx @11ty/eleventy --serve
```

Open every page and verify:
- `/` — home page looks like live cottagefloraldesign.com
- `/about/` — about page matches
- `/portfolio/` — listing shows 4 weddings (no samples)
- `/portfolio/austin-anna/`, `/portfolio/dani-rock/`, `/portfolio/katelyn-brad/`, `/portfolio/maile-aidan/` — entry pages render
- `/inquiry/` — form embed loads
- `/mothers-day.html` — seasonal page renders with theme colors
- `/dance-flowers.html` — same
- `/admin/` — Decap CMS UI loads (won't log in without Identity, but UI should render)

Compare each side-by-side with https://cottagefloraldesign.com/. Note any visual regressions.

- [ ] **Step 4: Commit**

```bash
git add tests/cottage-floral.test.mjs
git commit -m "test: add Cottage Floral-specific regression tests"
```

---

## Task 14: Write DEPLOYMENT.md

**Files:**
- Create: `DEPLOYMENT.md`

**Why:** The Netlify setup, DNS cutover, and Identity invitation steps are manual user actions — not subagent-implementable. Document them here so the user has a reference and so the client has a record of how the site was deployed.

- [ ] **Step 1: Write DEPLOYMENT.md**

Create `DEPLOYMENT.md`:

```markdown
# Deployment guide

This document captures the one-time deployment steps to take Cottage Floral Design from this repo to production at cottagefloraldesign.com on Netlify with Decap CMS access.

These are manual steps performed via Netlify's web UI, GitHub, and Namecheap. Verify each before moving on.

## Prerequisites

- A Netlify account (free tier sufficient — sign up at https://app.netlify.com if you don't have one)
- Access to the GitHub repo (push permission)
- Access to the Namecheap account managing cottagefloraldesign.com DNS

## Phase 1: Connect repo to Netlify

1. Push the `cottage-floral-migration` branch and merge to `main` (or use the migration branch directly for the first deploy).
2. Log into https://app.netlify.com.
3. Click **Add new site → Import an existing project**.
4. Choose **GitHub**, authorize Netlify, select the `CottageFloral` repo.
5. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `_site`
   - Node version: 20
6. Click **Deploy site**.
7. Wait ~1-2 minutes for the first build. Verify the `*.netlify.app` URL Netlify gives you renders the site correctly.

## Phase 2: Add custom domain

1. In Netlify → site dashboard → **Domain settings** → **Add a domain**.
2. Enter `cottagefloraldesign.com`. Netlify will say it doesn't yet point to Netlify — that's expected.
3. Netlify shows two DNS options:
   - **Netlify DNS** (transfer DNS hosting to Netlify — easier but requires changing nameservers at Namecheap)
   - **External DNS** (keep DNS at Namecheap — set A/CNAME records pointing to Netlify)

For an existing domain, External DNS is less invasive. Steps:

a. In Netlify, copy the **DNS records** instructions (typically: A record pointing to `75.2.60.5`, AAAA record, and CNAME for `www` to `<sitename>.netlify.app`).

b. At Namecheap → Advanced DNS for cottagefloraldesign.com:
   - Delete existing GitHub Pages A records (if any: 185.199.108.153, 109, 110, 111).
   - Add A record: `@` → `75.2.60.5` (Netlify load balancer; verify exact IP from Netlify dashboard)
   - Add CNAME: `www` → `<sitename>.netlify.app`
   - Optional: add a CAA record for Let's Encrypt if Namecheap requires.

c. Wait 30-60 minutes for DNS propagation. Check status with:
   ```bash
   dig cottagefloraldesign.com
   dig www.cottagefloraldesign.com
   ```
   Both should resolve to Netlify IPs.

4. Back in Netlify → Domain settings: click **Verify DNS** for the domain. Once verified, click **Provision SSL certificate** (Let's Encrypt, automatic).

5. Wait ~5 minutes for SSL. Test https://cottagefloraldesign.com/ — should serve your new site over HTTPS.

## Phase 3: Disable GitHub Pages

Once Netlify is serving traffic on the custom domain:

1. GitHub repo → Settings → Pages → set source to **None** (disable).
2. Verify https://cottagefloraldesign.com/ still loads (now exclusively from Netlify).

## Phase 4: Enable Netlify Identity for CMS

1. Netlify dashboard → site → **Integrations** (or **Identity** in older UI) → **Enable Identity**.
2. Settings:
   - **Registration**: Invite only
   - **External providers**: optional (Google login if desired)
3. Click **Services** → **Git Gateway** → **Enable Git Gateway**. This authorizes Netlify to commit to your repo on behalf of CMS users.

## Phase 5: Invite yourself

1. Identity tab → **Invite users** → enter your email.
2. You'll receive an email with a confirmation link. Click it, set a password.
3. Visit https://cottagefloraldesign.com/admin/. Log in with the email/password.
4. Verify all collections appear in the sidebar:
   - Pages (Home, About, Portfolio Page, Inquiry)
   - Portfolio (Weddings)
   - Site Settings (Business info, SEO Defaults)
5. Make a tiny test edit (e.g., change a draft of the home hero subtitle), save as Draft, then publish. Wait 30-60 seconds — the change should appear on the live site after Netlify rebuilds.

## Phase 6: Hand-off (when ready to transfer to client)

When delivering the site to the client:

1. **Walk them through `HANDOFF.md`** — covers login, editing, publishing.
2. **Transfer GitHub repo ownership** to client's GitHub account: GitHub repo → Settings → Transfer.
3. **Disconnect from your Netlify account**. Client creates their own Netlify account, connects the (now-theirs) repo, re-enables Identity + Git Gateway.
4. **Client invites themselves** to Identity (their account, their email).
5. **You're out.**

## Troubleshooting

- **DNS not propagating**: Use https://dnschecker.org to see propagation status across regions. Some ISPs cache aggressively (24h+).
- **SSL provisioning stuck**: Verify A/CNAME records first, then click "Renew certificate" in Netlify domain settings.
- **CMS login fails after Identity enable**: confirm Git Gateway is enabled. Check browser console for errors.
- **Published change doesn't appear**: check Netlify Deploys tab for build errors. Most common cause: bad markdown or missing required field.
- **Local CMS testing on WSL**: see Plan 1 notes on `local_backend: true` and `npx decap-server` (don't enable in production config).
```

- [ ] **Step 2: Commit**

```bash
git add DEPLOYMENT.md
git commit -m "docs: add deployment runbook for Netlify, DNS, and Identity setup"
```

---

## Self-review checklist (run before declaring complete)

- [ ] All 14 tasks committed
- [ ] `npm test` passes from a clean checkout (`rm -rf _site && npm test`)
- [ ] No legacy HTML at repo root except `mothers-day.html`, `dance-flowers.html` (the seasonal pages)
- [ ] No `template/` directory anywhere
- [ ] Decap admin loads at `/admin/` (UI only — login not testable without Netlify Identity)
- [ ] Visual check on every route shows pixel-near-parity with the live site
- [ ] All 4 portfolio entries render with hero, gallery, and story
- [ ] CNAME file present at repo root with correct domain
- [ ] `DEPLOYMENT.md` exists and covers all 6 phases
- [ ] No `{{PLACEHOLDER}}` strings remain in `_data/*.yml` or `content/portfolio/*.md` (real content everywhere)

## What's NOT done by this plan (manual user steps)

These are documented in `DEPLOYMENT.md` but require human action:

1. Push branch to GitHub remote
2. Create Netlify account (if needed)
3. Connect repo to Netlify (one-click via Netlify UI)
4. DNS cutover at Namecheap (~30-60 min wait)
5. Enable Netlify Identity + Git Gateway in Netlify dashboard
6. Invite developer email to Identity
7. (Eventually) hand-off to client

## Risks during this plan

| Risk | Mitigation |
|---|---|
| Visual regression on home/about/portfolio vs current live site | Phase 13 visual smoke test catches it before deploy |
| Image path mismatch (slug-vs-CamelCase folder names) | Task 8 renames asset folders to match slugs |
| Inquiry form embed breaks when copied | Task 7 uses YAML literal block scalar to preserve whitespace; Phase 13 verifies form loads |
| Seasonal pages render with broken theme colors | Task 3 adds CF theme defaults to static `:root` |
| Old portfolio URL backlinks 404 after cutover | Task 12 adds 301 redirects |
| Tests break when placeholder strings replaced with real content | Tasks 4, 5, 8 update test assertions inline |
