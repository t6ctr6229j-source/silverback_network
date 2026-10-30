"""Check canonical URLs against the real local Cloudflare Pages asset router.

Run after build-cloudflare-pages.sh and npm ci. No deployed site or account is used.
Cloudflare documents .html redirects at:
https://developers.cloudflare.com/pages/configuration/serving-pages/
"""
import os
import signal
import socket
import subprocess
import tempfile
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://www.silverback-network.com"
BUILD = ROOT / "cf-dist"


class Metadata(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.canonicals = []
        self.og_urls = []
        self.noindex = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "meta" and attrs.get("property") == "og:url":
            self.og_urls.append(attrs.get("content"))
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.noindex |= "noindex" in attrs.get("content", "").lower()


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def fetch(url):
    # The test server is local; do not route its requests through an HTTP proxy.
    opener = build_opener(ProxyHandler({}), NoRedirect())
    try:
        response = opener.open(Request(url), timeout=3)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read().decode("utf-8")


def check(base):
    sitemap = ET.parse(BUILD / "sitemap.xml").getroot()
    urls = [entry.text for entry in sitemap.findall(".//{*}loc")]
    for canonical in urls:
        assert canonical.startswith(ORIGIN + "/"), canonical
        path = urlsplit(canonical).path
        status, headers, html = fetch(base + path)
        assert status == 200, (
            f"Sitemap URL {canonical} must resolve directly: HTTP {status}, "
            f"Location={headers.get('Location')}"
        )
        page = Metadata(html)
        assert page.canonicals == [canonical], (canonical, page.canonicals)
        assert page.og_urls == [canonical], (canonical, page.og_urls)
        assert not page.noindex and "noindex" not in headers.get("X-Robots-Tag", "").lower(), canonical

        legacy = "/index.html" if path == "/" else path + ".html"
        status, headers, _ = fetch(base + legacy + "?from=legacy-check")
        assert status in (301, 308), (legacy, status)
        target = urlsplit(urljoin(base, headers.get("Location", "")))
        assert target.path == path and target.query == "from=legacy-check", (legacy, target)
        print(f"PASS Pages: {path} is canonical; {legacy} keeps its permanent redirect and query")

    status, _, _ = fetch(base + "/missing-silverback-seo-check")
    assert status == 404, f"Unknown routes must not become soft 404s: {status}"
    print(f"PASS Cloudflare Pages runtime: {len(urls)} direct canonical pages and a real 404")


def main():
    assert (BUILD / "sitemap.xml").is_file(), "Run sh scripts/build-cloudflare-pages.sh first"
    wrangler = ROOT / "node_modules" / ".bin" / "wrangler"
    assert wrangler.is_file(), "Install the pinned development dependencies with npm ci"
    with socket.socket() as reservation:
        reservation.bind(("127.0.0.1", 0))
        port = reservation.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    with tempfile.TemporaryDirectory(prefix="silverback-pages-qa-") as temporary:
        log_path = Path(temporary) / "runtime.log"
        environment = dict(os.environ, CI="1", WRANGLER_SEND_METRICS="false",
                           WRANGLER_LOG_PATH=str(Path(temporary) / "wrangler.log"))
        with log_path.open("w+") as log:
            process = subprocess.Popen(
                [str(wrangler), "pages", "dev", str(BUILD), "--ip", "127.0.0.1",
                 "--port", str(port), "--inspector-port", "0", "--compatibility-date", "2026-10-30",
                 "--persist-to", str(Path(temporary) / "state"), "--show-interactive-dev-session=false"],
                cwd=ROOT, env=environment, stdout=log, stderr=subprocess.STDOUT,
                start_new_session=True,
            )
            try:
                deadline = time.monotonic() + 40
                while time.monotonic() < deadline:
                    if process.poll() is not None:
                        break
                    try:
                        if fetch(base + "/")[0] == 200:
                            check(base)
                            return
                    except (URLError, TimeoutError, ConnectionError):
                        pass
                    time.sleep(0.2)
                log.seek(0)
                raise RuntimeError("Local Pages runtime did not start:\n" + log.read()[-5000:])
            finally:
                if process.poll() is None:
                    os.killpg(process.pid, signal.SIGTERM)
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        os.killpg(process.pid, signal.SIGKILL)
                        process.wait()


if __name__ == "__main__":
    main()
