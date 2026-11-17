# Silverback: SEO-Navigation, 17. November 2026

## Scope and release

Draft stacked on PR28 (`content/five-topic-clusters-20261117`, eb39a70). No production deployment or merge. Review both PRs together; these links require the 15 topic pages in PR28.

## Changes

- Homepage navigation points directly to a new service directory after the hero. Two prominent service cards and seven focus links surface existing offers and the five draft clusters without changing the brand story or promising availability.
- Every editorial/service page links back to the directory and both principal services. Existing cluster links, fictional-scenario disclosures and shared consent-gated form remain intact.
- SAP lead paragraph names the actual service naturally; budget formula emphasizes its label rather than an entire long sentence.
- Existing decorative gorilla has an intentionally empty alt attribute. All images have alt attributes. No redundant description was added just to satisfy an ambiguous tool warning.
- No arbitrary extra links added to the privacy declaration. No response-time claim or server/security change based on a single 0.5-second crawl sample.

## Verification

Passed: static build, JavaScript syntax, SEO/canonical/schema/sitemap/internal links and anchors for 24 URLs, authorship, 15-page cluster/NDA checks, role/budget checks, 16 isolated consent/lead tests, actual local Cloudflare routing with legacy redirects/query preservation and real 404, Chromium browser regression at 320–1440 pixels including topic navigation and Back/Forward, Chromium motion/accessibility/no-JS regression. Mobile homepage screenshot inspected.

Motion regression now waits for the actual marquee's intersection state before asserting its paused animation, rather than the unrelated hero state that could already be false. Behavior itself is unchanged.

Local WebKit lacks system libraries; GitHub CI runs both Chromium and WebKit. No new live Seobility score or ranking gain is claimed before release and recrawl.
