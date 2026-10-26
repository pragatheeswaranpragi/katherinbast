"""Create deterministic branded social and touch images, then update metadata."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib
import re
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "dist/assets"
ASSETS.mkdir(parents=True, exist_ok=True)
font_path = Path(tempfile.gettempdir()) / "katherin-manrope-700.ttf"
if not font_path.exists():
    source = "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4aE-_F.ttf"
    font_path.write_bytes(urllib.request.urlopen(source, timeout=20).read())


def sans(size):
    return ImageFont.truetype(str(font_path), size)


def regular(size):
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)


def serif(size):
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", size)


def italic(size):
    return ImageFont.truetype("/usr/share/fonts/opentype/urw-base35/NimbusRoman-Italic.otf", size)


def save_hashed(image, prefix):
    temporary = Path(tempfile.gettempdir()) / (prefix + "-working.png")
    image.save(temporary, optimize=True)
    data = temporary.read_bytes()
    name = prefix + "." + hashlib.sha256(data).hexdigest()[:10] + ".png"
    (ASSETS / name).write_bytes(data)
    return name


image = Image.new("RGB", (1200, 630), "#f8f7f2")
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((835, 54, 1146, 576), radius=22, fill="#432b46")
draw.ellipse((880, 103, 1210, 433), outline="#74577b", width=1)
draw.ellipse((935, 145, 1155, 490), outline="#74577b", width=1)
draw.text((875, 196), "KB", font=serif(134), fill="#f8f7f2")
draw.rounded_rectangle((899, 417, 1109, 515), radius=6, fill="#e4edb3")
draw.text((918, 435), "Clarity.", font=italic(25), fill="#432b46")
draw.text((918, 469), "Connection.", font=italic(25), fill="#432b46")
draw.text((59, 57), "KATHERIN BAST / CHENNAI", font=sans(16), fill="#725b76")
draw.line((59, 100, 767, 100), fill="#dedbd4", width=1)
draw.text((56, 139), "Katherin Bast", font=sans(62), fill="#352736")
draw.text((60, 244), "Brand thinking.", font=sans(40), fill="#352736")
draw.text((60, 302), "Human connection.", font=italic(49), fill="#77577c")
draw.text((60, 404), "Brand Management  |  Lead Generation", font=regular(20), fill="#352736")
draw.text((60, 447), "Marketing  |  Influencer Marketing", font=regular(19), fill="#716873")
draw.line((59, 513, 767, 513), fill="#dedbd4", width=1)
draw.text((60, 540), "Naturals | Zenderma  ·  Red Bull", font=regular(18), fill="#716873")
social_name = save_hashed(image, "katherin-bast-social")

icon = Image.new("RGB", (180, 180), "#432b46")
icon_draw = ImageDraw.Draw(icon)
icon_draw.text((24, 32), "kb", font=sans(99), fill="#f8f7f2")
icon_draw.ellipse((145, 122, 158, 135), fill="#e4edb3")
icon_name = save_hashed(icon, "apple-touch-icon")

page = ROOT / "dist/index.html"
html = page.read_text()
html = re.sub(r"assets/katherin-bast-social(?:\.[a-f0-9]{10})?\.png", "assets/" + social_name, html)
html = re.sub(r"assets/apple-touch-icon(?:\.[a-f0-9]{10})?\.png", "assets/" + icon_name, html)
page.write_text(html)
print(social_name, icon_name)
