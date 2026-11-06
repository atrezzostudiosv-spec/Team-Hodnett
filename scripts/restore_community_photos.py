#!/usr/bin/env python3
"""Replace demonstrably weak community images using verified source photography.

No invented real estate, no generative texture. Sources checked and documented
in docs/community-photo-sources.md. Existing images retained if the candidate
is not a genuine higher-resolution match (Westlake case).
"""
import json
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps, ImageChops, ImageStat, ImageEnhance
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/editorial"
REPORT = ROOT / "docs/community-photo-update.json"
BROWSER_AGENT = "ATREZZO-Hodnett-Image-Quality/1.0 (photographic source verification)"

def download(url):
    req = Request(url, headers={
        "User-Agent": BROWSER_AGENT,
        "Accept": "image/avif,image/webp,image/jpeg,image/png,image/*"
    })
    with urlopen(req, timeout=55) as response:
        data = response.read(18_000_000)
        if not response.headers.get("Content-Type","").lower().startswith("image/"):
            raise ValueError("Non-image response")
        if len(data)<100_000:
            raise ValueError("Unexpectedly small source image")
    image=Image.open(BytesIO(data))
    image.load()
    return ImageOps.exif_transpose(image).convert("RGB"),len(data)

def save(image, destination, *, target=3000):
    width,height=image.size
    if width>target:
        image=image.resize((target,round(height*target/width)),Image.Resampling.LANCZOS)
    image.save(destination,"WEBP",quality=89,method=6)
    with Image.open(destination) as check:
        check.load()
        if check.width<2400 or check.height<1000:
            raise ValueError("Replacement lacks adequate dimensions: "+repr(check.size))
    return list(image.size)

def westlake():
    """Use city original only if visually the SAME photo and higher resolution."""
    out=OUT/"westlake.webp"
    existing=Image.open(out).convert("RGB")
    candidates=[
        "https://www.westlake-tx.org/ImageRepository/Document?documentID=3450",
        "https://westlake-tx.org/ImageRepository/Document?documentID=3450",
    ]
    errors=[]
    for url in candidates:
        try:
            candidate,source_bytes=download(url)
            if candidate.width < 2500 or candidate.height<1400:
                errors.append(f"{url}: original only {candidate.size}, not a meaningful improvement")
                continue
            # Compare the same photo after resampling. Most resizes/encoder passes
            # differ by only a few RGB units; geometrically different photos fail.
            small=candidate.resize((360,200),Image.Resampling.LANCZOS)
            ref=existing.resize((360,200),Image.Resampling.LANCZOS)
            # The archive image might be cropped slightly. Compare simple normalized
            # low-frequency color/shape, never blindly swap buildings.
            delta=ImageStat.Stat(ImageChops.difference(
                small.filter(ImageFilter.GaussianBlur(4)),
                ref.filter(ImageFilter.GaussianBlur(4))
            )).mean
            mean_delta=sum(delta)/3
            if mean_delta>22:
                errors.append(f"{url}: photograph mismatch (mean pixel difference {mean_delta:.1f})")
                continue
            new=save(candidate,out)
            return {"status":"replaced_by_higher_resolution_same_photo",
                    "source":url,"dimensions":new,"before":list(existing.size),
                    "source_bytes":source_bytes,"pixel_delta":round(mean_delta,1),
                    "rights":"Existing photograph; verify licensing prior to commercial production"}
        except Exception as exc:
            errors.append(f"{url}: {type(exc).__name__}: {str(exc)[:180]}")
    return {"status":"retained_no_verified_high_resolution_original","details":errors}

def flower_mound():
    # Real place, photographic provenance and CC BY 2.0 explicitly verified.
    url=("https://upload.wikimedia.org/wikipedia/commons/d/d8/"
         "Sunrise_on_a_foggy_cold_day_in_Flower_Mound_%2852692865160%29.jpg")
    errors=[]
    candidates=[
        url,
        "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/d/d8/Sunrise_on_a_foggy_cold_day_in_Flower_Mound_%2852692865160%29.jpg&w=3000&output=jpg",
        "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/d/d8/Sunrise_on_a_foggy_cold_day_in_Flower_Mound_%2852692865160%29.jpg&w=3000&output=jpg",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Sunrise_on_a_foggy_cold_day_in_Flower_Mound_(52692865160).jpg?width=3000"
    ]
    # Flickr is an alternative host for this exact CC-BY 2.0 photograph.
    try:
        import re
        import html as html_entities
        req=Request("https://www.flickr.com/photos/shivashenoy/52692865160/",
                    headers={"User-Agent":"Mozilla/5.0 (compatible; AtrezzoPhotoReview/1.0)"})
        with urlopen(req,timeout=24) as response:
            markup=response.read(6_000_000).decode("utf-8","ignore")
        decoded=html_entities.unescape(markup).replace("\\/", "/")
        images=re.findall(r'https?://live\.staticflickr\.com/\d+/52692865160_[a-zA-Z0-9]+_[a-z0-9]+\.jpg',decoded)
        for src in dict.fromkeys(images):
            stem=re.sub(r'_(?:[a-z0-9]+)\.jpg$', '', src)
            for size in ("3k","k","h"):
                candidates.append(stem+"_"+size+".jpg")
        if not images:
            errors.append("Flickr page: no static image URL embedded")
    except Exception as exc:
        errors.append("Flickr metadata: "+type(exc).__name__+": "+str(exc)[:100])
    for target in candidates:
        try:
            image,source_bytes=download(target)
            if image.width < 2300 or image.height < 1600:
                raise ValueError(f"Commons source unexpectedly small: {image.size}")
            break
        except Exception as exc:
            errors.append(f"{target[:82]}: {type(exc).__name__}: {str(exc)[:120]}")
    else:
        raise RuntimeError("All verified Commons access paths failed: "+"; ".join(errors))
    old=Image.open(OUT/"flower-mound.webp").size
    new=save(image,OUT/"flower-mound.webp",target=3000)
    return {"status":"replaced_original_location_photograph",
            "source":"https://commons.wikimedia.org/wiki/File:Sunrise_on_a_foggy_cold_day_in_Flower_Mound_(52692865160).jpg",
            "author":"Shiva Shenoy","license":"CC BY 2.0",
            "license_url":"https://creativecommons.org/licenses/by/2.0/",
            "location":"Grapevine Lake, Murrell Park, Flower Mound, Texas",
            "original_dimensions":list(image.size),"old_dimensions":list(old),
            "new_dimensions":new, "source_bytes":source_bytes,
            "transform":"Resized to 3000px width; converted to WebP; no scene edits"}

def main():
    results={"flower_mound":None,"westlake":None}
    try: results["flower_mound"]=flower_mound()
    except Exception as exc:
        results["flower_mound"]={"status":"not_replaced","error":str(exc)}
    try: results["westlake"]=westlake()
    except Exception as exc:
        results["westlake"]={"status":"not_replaced","error":str(exc)}
    REPORT.write_text(json.dumps(results,indent=2)+"\n")
    print(json.dumps(results,indent=2))
    # Do not label success if Flower Mound was not actually replaced.
    return 0 if results["flower_mound"]["status"]=="replaced_original_location_photograph" else 1

if __name__=="__main__":
    from PIL import ImageFilter
    raise SystemExit(main())
