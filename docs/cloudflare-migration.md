# Silverback: Cloudflare Pages staging and cutover checklist

## Scope
- Domain: `silverback-network.com` and `www.silverback-network.com`.
- GitHub source: `t6ctr6229j-source/silverback_network`, tested branch `security/hardening-2026-10-21`.
- Current production remains on united-domains until QA, DNS verification and explicit cutover.
- Cloudflare zone is currently pending. **Do not change registrar nameservers as part of testing.**
- Cloudflare Pages preview is a separate HTTPS site and does not require DNS cutover.

## Pages build
- Connect GitHub repository to Cloudflare Pages and allow relevant GitHub App access.
- Use command: `sh scripts/build-cloudflare-pages.sh`.
- Output directory: `cf-dist`, root directory: repository root.
- Production branch eventually: `main`; do not attach the public custom domain yet.
- The build copies `dist/` while omitting `.htaccess`. Pages reads `dist/_headers` from the output.
- Avoid two concurrent production publishing systems after cutover; disable the legacy united-domains upload only after successful DNS migration.

## Before cutover: non-negotiable checks
1. Compare **every** authoritative DNS record, including apex/www A, AAAA, CNAME, MX, SPF, DKIM selectors, DMARC, TXT verification, SRV, CAA, any other subdomains, and any active DS records at the registrar. An automatic Cloudflare scan is not sufficient evidence that all records were discovered. Preserve non-web records as DNS-only.
2. Verify current and intended Cloudflare SSL/TLS and registrar settings. If DNSSEC is enabled, plan DS migration and TTL timing before the nameserver change.
3. Test Pages preview on desktop/mobile and verify /, legal pages, services/cases, /robots.txt, /sitemap.xml, CSS, JS, images, Tally embeds, consent state, and GA4 consent behaviour. The app intentionally suppresses GA4 outside the production hostname.
4. Verify custom hostnames, canonical URLs, SEO redirects, headers, 404 responses, and that search engines do not index preview/staging paths.
5. Review CSP with automated and manual tests. Do not enable a stricter CSP without testing Tally, GA4, and all assets.
6. Back up existing DNS zone and site files. Keep United Domains origin as fallback for an agreed rollback window.
7. Only after successful tests, bind the custom domains and change registrar nameservers to those shown in the Cloudflare dashboard. Validate mail flow and website from independent networks.

## Existing hosting-specific behaviours
- Apache `.htaccess` only redirects the bare host to `www.silverback-network.com`; Cloudflare Pages does not execute it. Implement host-specific redirect in Cloudflare Redirect Rules **only at cutover**, not as a path-only `_redirects` rule that would redirect `pages.dev` previews to production.
- `dist/_headers` carries the baseline security headers on Pages static asset responses. The United Domains `.htaccess` is maintained separately until decommissioning.
- Existing Tally forms rely on user action and validate inbound postMessage origins; verify iframe support after CSP changes.
- GitHub PR #3 contains server and deployment hardening. It requires `UD_SFTP_KNOWN_HOSTS` before merging; do not disable validation as a workaround.

## Cloudflare Pages staging instance
- Pages project `silverback-network` connected to `t6ctr6229j-source/silverback_network`.
- Staging Pages production branch: `security/hardening-2026-10-21` until the PR is reviewed and merged.
- Cloudflare Pages build: `sh scripts/build-cloudflare-pages.sh`, output: `cf-dist`.
- Staging address: `https://silverback-network.pages.dev/`; public custom domain is **not** attached.
- The `dist/_headers` file currently includes `X-Robots-Tag: noindex, nofollow` for safe staging. **Remove this header in a follow-up reviewed commit before launching the real domain**. Do not index the test site.
- Staging build configuration should be changed to production branch `main` only after merging and fully verifying this PR; otherwise the `main` branch lacks the build script.
