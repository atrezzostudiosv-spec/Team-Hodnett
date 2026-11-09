#!/usr/bin/env python3
"""Make real-photo JPEG share previews, not synthetic housing imagery.

Called during the site build with a JSON list of original archive images.
Each 1200x630 image is a faithful crop, plus a small consistent brand treatment.
The same SHA-1 path identifier is used by scripts/seo.mjs.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

WIDTH, HEIGHT = 1200, 630

def font(size, bold=False):
    choices = (
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold else
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    )
    choices += [
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for name in choices:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()

def text_overlay(image):
    # A restrained darkening at the bottom keeps true property photography visible.
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    for row in range(420, HEIGHT):
        strength = (row - 420) / (HEIGHT - 420)
        alpha = int((strength ** 1.5) * 150)
        draw.line((0, row, WIDTH, row), fill=(8, 12, 14, alpha))
    image = Image.alpha_composite(image.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(image)
    draw.text((58, 540), "SHARON HODNETT", font=font(28), fill=(255, 255, 255, 245))
    draw.text((61, 585), "THE HODNETT TEAM  /  NORTH TEXAS", font=font(13), fill=(239, 220, 184, 234))
    return image.convert("RGB")

def build_image(source, destination):
    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original)
        if original.mode in ("RGBA", "LA"):
            base = Image.new("RGB", original.size, (249, 248, 245))
            base.paste(original, mask=original.getchannel("A"))
        else:
            base = original.convert("RGB")
        crop = ImageOps.fit(base, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    preview = text_overlay(crop)
    preview.save(destination, "JPEG", quality=84, optimize=True, progressive=True, subsampling=0)

def apple_touch_icon(destination):
    icon = Image.new("RGB", (180, 180), (17, 20, 23))
    draw = ImageDraw.Draw(icon)
    draw.rounded_rectangle((15, 15, 164, 164), radius=17, outline=(184, 157, 109), width=2)
    draw.text((90, 83), "H", anchor="mm", font=font(88), fill=(238, 223, 197))
    draw.text((90, 145), "THE HODNETT TEAM", anchor="mm", font=font(9), fill=(205, 181, 140))
    icon.save(destination, "PNG", optimize=True)

def main():
    if len(sys.argv) != 4:
        raise SystemExit("Usage: create_social_previews.py manifest.json public-dir dist-dir")
    manifest = Path(sys.argv[1])
    source_root = Path(sys.argv[2]).resolve()
    dist_root = Path(sys.argv[3]).resolve()
    social = dist_root / "assets" / "social"
    social.mkdir(parents=True, exist_ok=True)
    files = json.loads(manifest.read_text("utf-8"))
    rendered = 0
    for value in sorted(set(files)):
        if not isinstance(value, str) or not value.startswith("assets/") or ".." in value:
            raise ValueError("Invalid share image path: " + repr(value))
        original = (source_root / value).resolve()
        if not original.is_relative_to(source_root) or not original.is_file():
            raise FileNotFoundError(f"Missing social-photo source: {value}")
        identifier = hashlib.sha1(value.encode("utf-8")).hexdigest()[:16]
        target = social / f"{identifier}.jpg"
        build_image(original, target)
        rendered += 1
    apple_touch_icon(dist_root / "apple-touch-icon.png")
    print(f"Generated {rendered} actual-photo social share previews (1200 x 630 JPEG) and one iPhone home-screen icon.")

if __name__ == "__main__":
    main()
