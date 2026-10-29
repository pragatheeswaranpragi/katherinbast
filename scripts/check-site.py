"""Validate the static portfolio's crawl files, identity markup and assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import sys
import json
import re
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ORIGIN = "https://katherin-bast-portfolio.vercel.app"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.ids = set()
        self.references = []
        self.assets = []
        self.links = []
        self.canonical = None
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, "Duplicate HTML ID"
            self.ids.add(attrs["id"])
        for attribute in ("aria-controls", "aria-labelledby"):
            self.references.extend(attrs.get(attribute, "").split())
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property"))] = attrs.get("content")
        if tag == "h1":
            self.h1_count += 1
        if tag == "link":
            if attrs.get("rel") == "canonical":
                self.canonical = attrs["href"]
            elif attrs.get("rel") in ("stylesheet", "icon", "apple-touch-icon", "preload"):
                self.assets.append(attrs["href"])
        if tag == "script" and "src" in attrs:
            self.assets.append(attrs["src"])
        if tag == "img" and "src" in attrs:
            self.assets.append(attrs["src"])
        if tag == "a":
            href = attrs.get("href", "")
            self.links.append(href)
            if href.startswith("#") and len(href) > 1:
                self.references.append(href[1:])
            if attrs.get("target") == "_blank":
                assert "noopener" in attrs.get("rel", ""), "Unsafe external link"


html = (DIST / "index.html").read_text(encoding="utf-8")
page = Page()
page.feed(html)
assert page.h1_count == 1
h1 = re.search(r"<h1\b[^>]*>(.*?)</h1>", html, re.S).group(1)
assert "Katherin Bast" in re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h1))
assert page.canonical == ORIGIN + "/"
assert "noindex" in page.meta["robots"] if "--private-review" in sys.argv else "noindex" not in page.meta["robots"]
assert 100 <= len(page.meta["description"]) <= 180
assert page.meta["og:url"] == page.canonical
assert all(reference in page.ids for reference in page.references)
assert "selected-work" in page.ids and "focus" in page.ids, "Missing main portfolio section"

schema = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S).group(1))
graph = {node["@id"]: node for node in schema["@graph"]}
profile = graph[ORIGIN + "/#profile"]
person = graph[profile["mainEntity"]["@id"]]
assert profile["@type"] == "ProfilePage" and person["@type"] == "Person"
assert person["name"] == "Katherin Bast"
assert person["sameAs"] == ["https://www.linkedin.com/in/katherin-bast/"]
assert person["address"]["addressLocality"] == "Chennai"
assert not any(key in person for key in ("aggregateRating", "worksFor", "award"))

robots = (DIST / "robots.txt").read_text(encoding="utf-8")
if "--private-review" in sys.argv:
    assert "Disallow: /" in robots
else:
    assert "Allow: /" in robots and "Disallow: /" not in robots
    assert "Sitemap: " + ORIGIN + "/sitemap.xml" in robots
tree = ET.parse(DIST / "sitemap.xml")
namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
assert [node.text for node in tree.findall(".//s:loc", namespace)] == [page.canonical]

stylesheets = re.findall(r'<link rel="stylesheet" href="([^"]+)"', html)
assert stylesheets, "Missing stylesheets"
css = "\n".join((DIST / path).read_text(encoding="utf-8") for path in stylesheets)
assert "@import" not in css and "fonts.googleapis.com" not in css
assert "font-display:swap" in css and "prefers-reduced-motion" in css
page.assets.extend(re.findall(r"url\(['\"]?([^)'\"]+)", css))
page.assets.append(page.meta["og:image"])
page.assets.append(page.meta["twitter:image"])
for asset in page.assets:
    parsed = urlsplit(asset)
    assert not parsed.netloc or parsed.netloc == urlsplit(ORIGIN).netloc
    assert (DIST / parsed.path.lstrip("/")).is_file(), "Missing asset: " + asset
cover = DIST / urlsplit(page.meta["og:image"]).path.lstrip("/")
with Image.open(cover) as image:
    assert image.size == (1200, 630)
assert profile["primaryImageOfPage"]["url"] == page.meta["og:image"]
assert "noindex" in (DIST / "404.html").read_text(encoding="utf-8")
config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
assert config["outputDirectory"] == "dist"
assert len(config["redirects"]) == 2
print("PASS: identity schema, metadata, canonical, sitemap, robots, headings, links, local fonts, social image and deployment configuration.")
