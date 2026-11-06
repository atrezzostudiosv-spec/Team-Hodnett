#!/usr/bin/env python3
"""Safely enhance under-resolution photographs in place using Pillow.

Faithfulness first: no generative replacement, cropping, saturation or architecture changes.
Limited Lanczos upsampling and restrained deconvolution-style sharpening cannot
recreate details lost in the original source image. Git history keeps originals.
"""
from __future__ import annotations
import json, os, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, ImageFilter, ImageOps

ROOT=Path(__file__).resolve().parents[1]
AUDIT=ROOT/"docs/image-quality-audit.json"
REPORT=ROOT/"docs/image-enhancement-report.json"

def target_width(item):
    path=item["asset"]
    role=item.get("role")
    if role=="logo_or_misc" or "/logo-" in path or "/brand-" in path:
        return 0
    if path.endswith("sharon-scene-mobile.webp"):
        return 1200
    if role=="hero":
        return 2400
    if role=="editorial":
        return 1440
    if role=="detail":
        return 1800
    if role=="card":
        return 900
    return 0

def enhance(row):
    target=target_width(row)
    source=ROOT/"public"/row["asset"]
    if not source.exists() or source.suffix.lower()!=".webp" or not target:
        return None
    with Image.open(source) as original:
        original.load()
        width,height=original.size
        if width>=target or min(width,height)<250:
            return None
        # Never enlarge beyond 2x. 2x is sufficient for a high-density display
        # without creating excessively large uninformative image files.
        ratio=min(2.0,target/width)
        new_size=(round(width*ratio),round(height*ratio))
        if new_size==original.size or new_size[0]*new_size[1]>12_000_000:
            return None
        work=ImageOps.exif_transpose(original)
        work=work.convert("RGBA" if "A" in work.getbands() else "RGB")
        clean=work.copy()
        enlarged=work.resize(new_size, Image.Resampling.LANCZOS)
        # Conservative luminance sharpening, not AI-generated texture.
        if enlarged.mode=="RGB":
            ycbcr=enlarged.convert("YCbCr")
            y,cb,cr=ycbcr.split()
            y=y.filter(ImageFilter.UnsharpMask(radius=1.2,percent=64,threshold=3))
            enlarged=Image.merge("YCbCr",(y,cb,cr)).convert("RGB")
        else:
            r,g,b,a=enlarged.split()
            rgb=Image.merge("RGB",(r,g,b)).filter(ImageFilter.UnsharpMask(radius=1.0,percent=52,threshold=3))
            enlarged=Image.merge("RGBA",(*rgb.split(),a))
        test=enlarged.resize(clean.size,Image.Resampling.LANCZOS).convert("RGB")
        before=clean.convert("RGB")
        difference=ImageStat.Stat(ImageChops.difference(test,before)).mean
        drift=sum(difference)/3
        # Reject changes that do not faithfully resemble the supplied image.
        if drift>8.0:
            return {"asset":row["asset"],"skipped":"excessive_pixel_drift","mean_pixel_drift":round(drift,2)}
        save_options={"format":"WEBP","quality":92 if row["role"]=="hero" else 89 if row["role"]=="editorial" else 87,"method":6}
        if "icc_profile" in original.info:
            save_options["icc_profile"]=original.info["icc_profile"]
        temp=source.with_suffix(".quality-temp.webp")
        enlarged.save(temp,**save_options)
        with Image.open(temp) as verify:
            verify.load()
            if verify.size!=new_size:
                temp.unlink(missing_ok=True)
                return {"asset":row["asset"],"skipped":"dimensions_failed"}
        old_bytes=source.stat().st_size
        new_bytes=temp.stat().st_size
        # Sanity limit for GitHub delivery. Target full-bleed WEBPs can be larger.
        if new_bytes>4_000_000:
            temp.unlink(missing_ok=True)
            return {"asset":row["asset"],"skipped":"file_size_limit","bytes":new_bytes}
        os.replace(temp,source)
        return {
            "asset":row["asset"],"role":row["role"],
            "before":[width,height],"after":list(new_size),
            "old_bytes":old_bytes,"new_bytes":new_bytes,
            "mean_pixel_drift":round(drift,2),
            "method":"Lanczos high-quality resize + restrained luminance unsharp + WebP"
        }

def main():
    data=json.loads(AUDIT.read_text())
    records=data["records"]
    changes,skips=[],[]
    for row in records:
        value=enhance(row)
        if value:
            if "after" in value: changes.append(value)
            else: skips.append(value)
    summary={
        "approach":"Conservative non-generative photographic enhancement. No scene content changed.",
        "limitations":"Increased resolution does not recover detail not present in the source. Replace with verified higher-resolution original where available.",
        "scanned":len(records),"enhanced":len(changes),"skipped":len(skips),
        "enhanced_by_role":{role:sum(x["role"]==role for x in changes) for role in ["hero","editorial","detail","card"]},
        "changes":changes,"skips":skips
    }
    REPORT.write_text(json.dumps(summary,indent=2)+"\n")
    print(json.dumps({k:v for k,v in summary.items() if k not in ("changes","skips")},indent=2))
    for x in changes[:20]:
        print("Enhanced:",x["asset"],x["before"],"=>",x["after"],"delta",x["mean_pixel_drift"])
    if skips:
        print("Skips:",json.dumps(skips[:15]))
    if not changes:
        print("No files require non-generative resampling.")
    return 0

if __name__=="__main__":
    sys.exit(main())
