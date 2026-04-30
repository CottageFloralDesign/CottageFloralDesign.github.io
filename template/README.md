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
