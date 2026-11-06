#!/usr/bin/env python3
"""Audits source website photos against actual display roles. No visual alterations."""
from __future__ import annotations
from pathlib import Path
from collections import Counter
import json
from PIL import Image, ImageStat, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"public"/"assets"
EXT={".jpg",".jpeg",".png",".webp",".avif"}
FOCUS_FULL={
 "editorial/sharon-scene-desktop.webp",
 "editorial/sharon-scene-mobile.webp",
 "editorial/southlake.webp", "editorial/westlake.webp",
 "editorial/colleyville.webp","editorial/grapevine.webp",
 "editorial/flower-mound.webp","editorial/keller.webp",
 "editorial/landscape.webp"
}
FOCUS_PROPERTY={"1204 Andre Court","4106 Shady Valley Drive","2011 Ridgemont Court"}
def referenced():
    import re
    p=json.loads((ROOT/"content"/"properties.json").read_text())
    all_links=set()
    focus=set()
    for prop in p:
        links=[prop.get("cover"),*(prop.get("gallery") or [])]
        for link in links:
            if link:
                all_links.add(str(link))
                if prop.get("title") in FOCUS_PROPERTY: focus.add(str(link))
    cms=json.loads((ROOT/"content"/"communities.json").read_text())
    for comm in cms:
        if comm.get("cover"): all_links.add(comm["cover"])
    return all_links,focus
refs,focus=referenced()
results=[]
for file in sorted(ASSETS.rglob("*")):
    if not file.is_file() or file.suffix.lower() not in EXT: continue
    rel=file.relative_to(ASSETS).as_posix()
    target="assets/"+rel
    if rel in FOCUS_FULL or target in focus:
        role="hero" # full-screen / full-width photograph
    elif rel.startswith("editorial/") and "recognition-" not in rel and "film-" not in rel:
        role="editorial"
    elif rel.startswith("properties/") and ".large." in file.name:
        role="detail"
    elif rel.startswith("properties/"):
        role="card"
    else:
        role="logo_or_misc"
    try:
        with Image.open(file) as im:
            w,h=im.size
            fmt=im.format
            # Lightweight edge score is relative only, not proof of blur.
            sample=im.convert("L")
            sample.thumbnail((256,256),Image.Resampling.BICUBIC)
            edges=sample.filter(ImageFilter.FIND_EDGES)
            edge=round(ImageStat.Stat(edges).stddev[0],1)
    except Exception as ex:
        results.append({"asset":target,"error":str(ex)[:100]})
        continue
    req={"hero":2400,"editorial":1600,"detail":1800,"card":900,"logo_or_misc":0}[role]
    flag=(w<req and role!="logo_or_misc")
    results.append(dict(asset=target,role=role,width=w,height=h,bytes=file.stat().st_size,
                        format=fmt,edge_score=edge,target_width=req,below_target=flag,
                        in_catalog=target in refs,priority=target in focus or rel in FOCUS_FULL))
out=dict(
  note="Resolution-based audit. Upscaling cannot reconstruct lost photographic detail; source originals are preferable.",
  images=len(results),counts_by_role=dict(Counter(x.get("role","invalid") for x in results)),
  below_target=sum(x.get("below_target",False) for x in results),
  below_target_by_role=dict(Counter(x.get("role") for x in results if x.get("below_target"))),
  high_priority=[x for x in results if x.get("priority")],
  candidates=[x for x in results if x.get("below_target")],
  records=results
)
path=ROOT/"docs"/"image-quality-audit.json"
path.write_text(json.dumps(out,indent=2)+"\n")
print(json.dumps({k:v for k,v in out.items() if k not in ("records","candidates","high_priority")},indent=2))
print("Priority assets:")
for x in out["high_priority"][:50]:
    print("  ",x["width"],"x",x["height"],x["bytes"],x["role"],x["asset"])
print("Below targets by role:",out["below_target_by_role"])
