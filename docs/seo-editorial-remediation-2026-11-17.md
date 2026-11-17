# Editorial remediation after first expanded crawl

The first production crawl of all 15 new pages identified repeated substantive paragraphs, not merely shared navigation. The service pages, guides and fictional examples have therefore been rewritten around distinct reader tasks.

- Services explain role selection, scope, qualifications and engagement boundaries.
- Guides provide actionable planning and review questions.
- Fictional scenarios work through different decisions and handoffs, without implying real customer results.
- All 15 have distinct substantive paragraphs; `check_editorial_distinctness.py` now guards exact repetition. Shared fiction notices are intentionally exempt.
- Scenario links name the destination rather than reusing a generic label.
- Prices, availability caveats, fictional status, URL set, canonicals and form consent remain intact.

Local checks: SEO consistency, content-cluster/NDA checks, growth/budget checks, authorship, build, real local Pages router (24 URLs and redirects), consent (16 checks). Browser QA covers responsive layout and consent with external traffic mocked. Production score must be measured after release; no 100-percent or ranking promise follows from local tests.

Sticky contact shortcuts added to every HTML page, including404, using existing telephone and email. No tracking/network code. Hidden while consent, forms or input focus require space. Dedicated browser checks cover all pages at320/390/768/1440px, keyboard, consent and form visibility.
