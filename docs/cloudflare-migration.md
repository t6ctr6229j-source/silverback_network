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
- Avoid two concurrent production publishing systems. The legacy united-domains GitHub workflow retains automated tests but its SFTP upload only runs on `workflow_dispatch`. Keep existing hosted files unchanged until the DNS cutover has been verified.

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
- GitHub PR #3 contains server and deployment hardening. Automatic SFTP uploads from `main` are disabled; the manual United Domains rollback upload still requires a verified `UD_SFTP_KNOWN_HOSTS` secret. Do not bypass host-key verification.

## Cloudflare Pages staging instance
- Pages project `silverback-network` connected to `t6ctr6229j-source/silverback_network`.
- Staging Pages production branch: `security/hardening-2026-10-21` until the PR is reviewed and merged.
- Cloudflare Pages build: `sh scripts/build-cloudflare-pages.sh`, output: `cf-dist`.
- Staging address: `https://silverback-network.pages.dev/`; public custom domain is **not** attached.
- `dist/_headers` scopes `X-Robots-Tag: noindex, nofollow` to `silverback-network.pages.dev` and versioned Pages staging subdomains only. The future custom production domain must not inherit noindex; verify this after adding the custom domain.
- Staging build configuration should be changed to production branch `main` only after merging and fully verifying this PR; otherwise the `main` branch lacks the build script.

## DNS comparison verified against United Domains (2026-10-21)
- Compared against the provided United Domains DNS overview for all subdomains: eight shown DNS records match the eight imported Cloudflare records.
- Four web A/AAAA records: apex and www point to the United Domains origin. In the **pending** Cloudflare zone these are now **DNS-only** to avoid premature proxying during nameserver delegation.
- MX remains with United Domains, priorities 10/20, DNS-only. SPF remains an `_smtp.udag.de` include. Google verification TXT preserved. **Do not replace these with Microsoft 365 defaults**.
- Screenshot shows no CNAME, SRV, CAA or TLSA records, and suggests DNSSEC is not enabled at United Domains. Cloudflare's own DNSSEC status is disabled; parent-zone DS lookups were subsequently performed and both public resolvers reported no DS record on 2026-10-21. Recheck immediately before cutover.
- Original DNS TTLs are 600 seconds for web addresses and TXT and 3600 seconds for MX. Cloudflare's matching record contents are correct with automatic TTL; no functional DNS record data discrepancies were observed.
- DNSSEC check is automated in `.github/workflows/cloudflare-dnssec-preflight.yml`, querying two independent public recursive resolver endpoints. Any DS entry is a manual block before cutover.
- Do not modify the registrar nameservers until the website preview and Tally forms are manually reviewed, Cloudflare custom domain cutover is planned, and the host-scoped noindex rule is verified not to apply to the custom production domain.

## Owner's approval and email clarification
- Visual/mobile Cloudflare test site and the two opt-in Tally embeds were explicitly approved on 2026-10-21.
- The owner confirms **no operational mailbox uses `@silverback-network.com`**. Staff use `@wescaleit.com` mailboxes.
- Nonetheless, existing United Domains MX and SPF records are preserved for consistency and future rollback. Neither Cloudflare Pages nor this migration changes the DNS zone or delivery of `wescaleit.com`.
- A Cloudflare **zone redirect** redirects `silverback-network.com` to `www.silverback-network.com` preserving paths and queries when both hostnames are ultimately proxied. Pending-zone DNS-only entries mean this redirect is not yet live.
- Cloudflare zone remains `pending`; registrar nameserver switch is required before attaching production custom domains. The imported web A/AAAA entries are DNS-only and still point to United Domains, which prevents accidental premature traffic migration when the nameserver delegation first changes.
- After zone activation, register `www.silverback-network.com` (and apex if desired) as Cloudflare Pages custom domain(s), switch the corresponding A/AAAA entries to Pages-compatible proxied CNAME(s), and verify certificates, hostname redirect, noindex, analytics and form behavior.
- Hosting privacy notice currently names United Domains. Update the website's **Hosting** notice to include Cloudflare Pages with accurate processing details as part of Pages cutover. Do not assert that a DPA exists unless verified with the customer.
