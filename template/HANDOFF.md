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

The CMS uses an "Editorial Workflow" with three states plus a publish action:

- **Draft** — your work in progress, not yet visible
- **In Review** — ready to look over before publishing
- **Ready** — approved, ready to go live
- Then click **Publish** when ready

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
