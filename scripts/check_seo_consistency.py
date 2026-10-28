#!/usr/bin/env python3
"""Fail PR QA on broken canonical pages, sitemap drift or contradictory business entities."""
from pathlib import Path
from html.parser import HTMLParser
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / "dist"
ORIGIN = "https://www.silverback-network.com"
PUBLISHER = "https://wescaleit.com/#organization"
BRAND = "https://wescaleit.com/#brand-silverback"
PAGES = ["index.html", "interim-manager-tagessatz.html",
         "vermittlung-bei-silverback.html", "externe-it-experten.html"]
LEGAL = ["impressum.html", "datenschutz.html"]


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.title = False
        self.title_text = ""
        self.description = ""
        self.canonicals = []
        self.json_scripts = []
        self._json = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.title = True
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._json = []

    def handle_data(self, text):
        if self.title:
            self.title_text += text
        if self._json is not None:
            self._json.append(text)

    def handle_endtag(self, tag):
        if tag == "title":
            self.title = False
        if tag == "script" and self._json is not None:
            self.json_scripts.append(json.loads("".join(self._json)))
            self._json = None


expected_urls = []
for filename in PAGES + LEGAL:
    source = ROOT / filename
    if not source.is_file():
        raise SystemExit(f"Missing public page {source}")
    p = Page()
    p.feed(source.read_text(encoding="utf-8"))
    canonical = ORIGIN + ("/" if filename == "index.html" else "/" + filename)
    if p.canonicals != [canonical]:
        raise SystemExit(f"{filename}: unexpected canonical: {p.canonicals!r}")
    if p.h1 != 1 or not p.title_text.strip() or not p.description:
        raise SystemExit(f"{filename}: missing h1, title or description")
    if filename in PAGES:
        nodes = [n for block in p.json_scripts for n in block.get("@graph", [block])]
        by_type = {n.get("@type"): n for n in nodes if isinstance(n, dict)}
        org, brand = by_type.get("Organization", {}), by_type.get("Brand", {})
        website = by_type.get("WebSite", {})
        if org.get("@id") != PUBLISHER or brand.get("@id") != BRAND:
            raise SystemExit(f"{filename}: inconsistent owner/brand entity")
        if website.get("publisher", {}).get("@id") != PUBLISHER:
            raise SystemExit(f"{filename}: incorrect WebSite.publisher")
        for entity in nodes:
            if entity.get("@type") == "Service":
                if entity.get("provider", {}).get("@id") != PUBLISHER:
                    raise SystemExit(f"{filename}: Service.provider not canonical")
                if entity.get("brand", {}).get("@id") != BRAND:
                    raise SystemExit(f"{filename}: Service.brand not canonical")
        if filename == "externe-it-experten.html" and "Service" not in by_type:
            raise SystemExit("New IT experts page is missing Service structured data")
    expected_urls.append(canonical)

sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
actual_urls = [n.text for n in sitemap.findall(".//{*}loc")]
if sorted(actual_urls) != sorted(expected_urls) or len(actual_urls) != len(set(actual_urls)):
    raise SystemExit(f"Sitemap does not match six canonical pages: {actual_urls}")
# One consolidated, published Tally form must serve both audiences.
homepage = (ROOT / "index.html").read_text(encoding="utf-8")
if homepage.count('data-form-id="LDDoxJ"') != 1:
    raise SystemExit("Silverback must expose exactly one shared Tally form")
if 'href="https://tally.so/r/LDDoxJ"' not in homepage:
    raise SystemExit("Shared Tally form must have a direct fallback")
if 'data-form-id="pbgYgP"' in homepage or 'data-form-id="yPO8Od"' in homepage:
    raise SystemExit("Old dual-form layout was accidentally restored")
if homepage.count('class="form-card form-card-unified"') != 1:
    raise SystemExit("Contact form card layout is not unified")
for filename in PAGES[1:]:
    html = (ROOT / filename).read_text(encoding="utf-8")
    if 'index.html#projekt-formular' in html or 'index.html#experten-formular' in html:
        raise SystemExit(f"{filename}: stale contact deep link")

print(f"PASS: {len(PAGES)} content pages, {len(LEGAL)} legal pages, canonical owner and brand, sitemap.")
