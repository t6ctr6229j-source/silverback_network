#!/usr/bin/env python3
"""Regenerate responsive WebP derivatives from the preserved PNG portraits.

Requires Pillow with WebP support. Run only when the originals change; deployment
serves the checked-in assets and has no image-processor dependency. Resize without
cropping or enlargement and retain alpha. The original PNGs remain unchanged.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
for name in ('anja', 'eva', 'alex', 'udo-zegar'):
    source = ROOT / f'{name}.png'
    with Image.open(source) as image:
        for width in (480, 800, image.width):
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            target = ROOT / f'{name}-{width}.webp'
            resized.save(target, format='WEBP', quality=85, method=6, exact=True)
            with Image.open(target) as check:
                assert check.size == (width, height)
                assert check.getchannel('A').tobytes() == resized.getchannel('A').tobytes()
            print(f'{target.name}: {target.stat().st_size:,} bytes ({width}×{height})')
