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
