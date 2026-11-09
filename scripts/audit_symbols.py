#!/usr/bin/env python3
"""Fail CI if emoji or iPhone emoji-capable arrows enter site-facing source/output.

Legal copyright, registered-mark and trademark text are deliberately preserved:
they are not emoticons and are semantically necessary.
"""
from __future__ import annotations
from pathlib import Path
import sys
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_SUFFIXES = {".js", ".mjs", ".json", ".html", ".css", ".svg", ".xml"}
IGNORED = {"social-sources.json"}
SOURCE_DIRS = (ROOT / "content", ROOT / "public" / "src", ROOT / "scripts")

def emoji_character(cp):
    return any((
        0x1F000 <= cp <= 0x1FAFF,  # illustrated/symbol emoji blocks
        0x2600 <= cp <= 0x27BF,   # dingbats, star/heart, weather signs
        0x2B00 <= cp <= 0x2BFF,   # arrow and symbol blocks
        cp in {0xFE0F, 0x20E3, 0x200D, 0x2196, 0x2197, 0x2198, 0x2199,
               0x21A9, 0x21AA, 0x231A, 0x231B, 0x23E9, 0x23EA,
               0x23EB, 0x23EC, 0x23F0, 0x23F3, 0x24C2, 0x303D, 0x3297, 0x3299}
    ))

def relevant_files():
    for base in SOURCE_DIRS:
        if not base.exists():
            continue
        for f in base.rglob("*"):
            if f.is_file() and f.suffix.lower() in ALLOWED_SUFFIXES and f.name not in IGNORED:
                # This linter has literal code-point range descriptions, not emoticons.
                if f.name == "audit_symbols.py":
                    continue
                yield f
    if "--dist" in sys.argv:
        base = ROOT / "dist"
        for f in base.rglob("*"):
            if f.is_file() and f.suffix.lower() in ALLOWED_SUFFIXES and f.name not in IGNORED:
                yield f

issues=[]
inspected=Counter()
for f in relevant_files():
    s=f.read_text("utf-8",errors="replace")
    inspected[f.suffix]+=1
    for i,ch in enumerate(s):
        if emoji_character(ord(ch)):
            line=s.count("\n",0,i)+1
            issues.append((str(f.relative_to(ROOT)),line,f"U+{ord(ch):04X}"))
            if len(issues)>90:
                break
print(f"Audited {sum(inspected.values())} site-facing source/built text files; emoji-capable symbols: {len(issues)}")
for path,line,code in issues[:90]:
    print(f"  {path}:{line}: {code}")
if issues:
    raise SystemExit(1)
