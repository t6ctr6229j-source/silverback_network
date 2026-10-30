#!/usr/bin/env python3
"""Validate published URL metadata, real internal targets and shared entities.

check_pages_runtime.py separately tests the URLs with Cloudflare's actual router.
Physical .html files are retained; public Pages URLs have no .html extension.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urljoin, urlsplit
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / "dist"
ORIGIN = "https://www.silverback-network.com"
PUBLISHER = "https://wescaleit.com/#organization"
BRAND = "https://wescaleit.com/#brand-silverback"
AUTHOR = "https://wescaleit.com/florian-zegar#person"
PAGES = ["index.html", "interim-manager-tagessatz.html",
         "vermittlung-bei-silverback.html", "externe-it-experten.html"]
LEGAL = ["impressum.html", "datenschutz.html"]
OWNED_HOSTS = {"wescaleit.com", "www.wescaleit.com", "ciso2hero.com", "www.ciso2hero.com",
               "psoydo.com", "www.psoydo.com", "silverback-network.com", "www.silverback-network.com"}
ROUTES = {"/" if name == "index.html" else "/" + name.removesuffix(".html"): name
          for name in PAGES + LEGAL}


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.h1 = 0
        self.in_title = False
        self.title = ""
        self.meta = {}
        self.canonicals = []
        self.links = []
        self.ids = set()
        self.json_scripts = []
        self._json = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.in_title = True
        if tag == "meta":
            self.meta[attrs.get("name") or attrs.get("property")] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._json = []

    def handle_data(self, text):
        if self.in_title:
            self.title += text
        if self._json is not None:
            self._json.append(text)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self._json is not None:
            self.json_scripts.append(json.loads("".join(self._json)))
            self._json = None


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


pages = {route: Page((ROOT / filename).read_text(encoding="utf-8"))
         for route, filename in ROUTES.items()}
for route, page in pages.items():
    canonical = ORIGIN + route
    assert page.canonicals == [canonical], (route, "canonical", page.canonicals)
    assert page.meta.get("og:url") == canonical, (route, "og:url")
    assert page.h1 == 1 and page.title.strip() and page.meta.get("description"), (route, "page metadata")
    assert "noindex" not in page.meta.get("robots", "").lower(), (route, "noindex")

    for href in page.links:
        target = urlsplit(urljoin(canonical, href))
        if target.hostname in OWNED_HOSTS:
            assert not target.path.endswith(".html"), (route, "legacy public link", href)
        if target.netloc != urlsplit(ORIGIN).netloc or target.scheme not in ("http", "https"):
            continue
        path = unquote(target.path)
        if path in pages:
            if target.fragment:
                assert unquote(target.fragment) in pages[path].ids, (route, "missing anchor", href)
        else:
            assert (ROOT / path.lstrip("/")).is_file(), (route, "missing internal target", href)

    for value in strings(page.json_scripts):
        if value.startswith(ORIGIN + "/"):
            assert not urlsplit(value).path.endswith(".html"), (route, "legacy schema URL", value)
    if ROUTES[route] in LEGAL:
        continue
    nodes = [node for block in page.json_scripts for node in block.get("@graph", [block])]
    by_type = {node.get("@type"): node for node in nodes}
    assert by_type.get("Organization", {}).get("@id") == PUBLISHER, (route, "publisher identity")
    assert by_type.get("Brand", {}).get("@id") == BRAND, (route, "brand identity")
    assert by_type.get("WebSite", {}).get("publisher", {}).get("@id") == PUBLISHER, route
    for node in nodes:
        if node.get("@type") == "Service":
            assert node.get("provider", {}).get("@id") == PUBLISHER, route
            assert node.get("brand", {}).get("@id") == BRAND, route
        if node.get("@type") == "Article":
            assert node.get("url") == node.get("mainEntityOfPage") == canonical, route
            assert node.get("author", {}).get("@id") == AUTHOR, route
    if route == "/externe-it-experten":
        assert by_type.get("Service", {}).get("url") == canonical, route
        assert not any(name and name.startswith("article:") for name in page.meta), "Service page has copied article metadata"

actual_urls = [entry.text for entry in ET.parse(ROOT / "sitemap.xml").getroot().findall(".//{*}loc")]
expected_urls = [ORIGIN + route for route in ROUTES]
assert sorted(actual_urls) == sorted(expected_urls), ("Sitemap does not match public routes", actual_urls)
assert len(actual_urls) == len(set(actual_urls)), "Duplicate sitemap entries"

home = (ROOT / "index.html").read_text(encoding="utf-8")
assert home.count('class="form-card form-card-unified"') == 1, "Exactly one form card is required"
assert home.count('data-form-id="LDDoxJ"') == 1, "Unified Tally form is missing or duplicated"
assert 'href="https://tally.so/r/LDDoxJ"' in home, "Direct form alternative missing"
assert 'data-form-id="pbgYgP"' not in home and 'data-form-id="yPO8Od"' not in home, "Legacy dual forms returned"
assert {"anfrage-formular", "projekt-formular", "experten-formular"} <= pages["/"].ids, "Existing anchors must remain compatible"
for route in list(pages)[1:]:
    assert not any(href in ("/#projekt-formular", "/#experten-formular") for href in pages[route].links), (route, "Use shared enquiry entry")

print("PASS: six extensionless public URLs, matching canonicals/OG/schema/sitemap, links/anchors and shared entities")
print("PASS: one shared published Tally form with both compatible legacy anchors")
