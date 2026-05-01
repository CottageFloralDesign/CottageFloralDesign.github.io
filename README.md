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

## Out of scope for v1

Features intentionally deferred for future template iterations:

- **Featured portfolio block** on the home page — the current template uses a single `portfolio_preview` block; a multi-entry "featured weddings" relation widget linking into the portfolio collection is documented in the design spec but not implemented.
- **Seasonal pages** (e.g., Mother's Day, Dance Flowers) — these exist on the live Cottage Floral site but are not part of the universal template. Add them site-by-site as needed.
- **Image optimization plugin** — clients upload pre-sized images per CMS hint; deferred per design spec.
- **Per-portfolio URL backlink redirects** — needed for sites migrating from existing GitHub Pages deployments; will be added per-site, not in template.
