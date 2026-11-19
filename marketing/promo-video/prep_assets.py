"""Copies logos and screenshots from the sibling projects into assets/.

Client names must not appear in the video, so the museum name is erased from the
screenshot headers (the logo next to it stays).
    python prep_assets.py
"""
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).parent
OUT = HERE / 'assets'
OUT.mkdir(exist_ok=True)
SITE = HERE.parent.parent                       # F:/website-clickkgroup
MUSEUM = Path('F:/amnasuraka')
BARBER = Path('F:/zhewar')


def white_to_alpha(im):
    """Turns the white background of a flat logo into transparency (keeps anti-aliased edges)."""
    a = np.asarray(im.convert('RGB')).astype(float) / 255
    alpha = np.clip((1 - a).max(axis=2), 0, 1)
    safe = np.where(alpha > 0, alpha, 1)[..., None]
    rgb = np.clip((a - (1 - alpha[..., None])) / safe, 0, 1)
    return Image.fromarray((np.dstack([rgb, alpha]) * 255).astype(np.uint8), 'RGBA')


def trim(im, pad=0):
    box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(box)
    if pad:
        c = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        c.paste(im, (pad, pad))
        im = c
    return im


def erase_text(im, box, thresh=38, grow=5):
    """Fills the text inside `box` with the surrounding background colour."""
    a = np.asarray(im).astype(int)
    x0, y0, x1, y1 = box
    region = a[y0:y1, x0:x1]
    border = np.concatenate([region[0], region[-1], region[:, 0], region[:, -1]])
    bg = np.median(border, axis=0)
    diff = np.abs(region - bg).max(axis=2) > thresh
    ys, xs = np.nonzero(diff)
    if len(xs) == 0:
        raise SystemExit(f'no text found in {box}')
    bx0, bx1 = max(x0, x0 + xs.min() - grow), min(x1, x0 + xs.max() + grow + 1)
    by0, by1 = max(y0, y0 + ys.min() - grow), min(y1, y0 + ys.max() + grow + 1)
    a[by0:by1, bx0:bx1] = bg
    print(f'  erased {bx0},{by0}-{bx1},{by1} with {bg.astype(int).tolist()}')
    return Image.fromarray(a.astype(np.uint8))


# ── Click Group logo: full badge + separate mark and wordmark for the reveal ──
logo = Image.open(SITE / 'app/public/favicon/logo.png').convert('RGBA')
logo.resize((540, 540), Image.LANCZOS).save(OUT / 'cg-logo.png')
flat = Image.new('RGB', logo.size, 'white')
flat.paste(logo, mask=logo.getchannel('A'))
yy, xx = np.mgrid[:flat.height, :flat.width]
inside = np.hypot(xx - flat.width / 2, yy - flat.height / 2) < 455     # drop the yellow ring
flat = Image.fromarray(np.where(inside[..., None], np.asarray(flat), 255).astype(np.uint8))
trim(white_to_alpha(flat.crop((240, 140, 830, 705))), 4).save(OUT / 'cg-mark.png')
trim(white_to_alpha(flat.crop((180, 700, 940, 930))), 4).save(OUT / 'cg-word.png')

# ── client logos (logos only, never names) ──
m = Image.open(MUSEUM / 'public/images/logo/android-chrome-512x512.png').convert('RGB')
ink = np.asarray(m).min(axis=2) < 235
ys, xs = np.nonzero(ink)
m.crop((xs.min() - 8, ys.min() - 8, xs.max() + 9, ys.max() + 9)).save(OUT / 'museum-logo.png')   # opaque, shown on white
Image.open(BARBER / 'marketing/video-src/logo.png').convert('RGBA').resize((360, 360), Image.LANCZOS).save(OUT / 'barber-logo.png')

# ── museum website screenshots with the name removed from the header ──
SCR = MUSEUM / 'marketing/website-slides/screens'
for src, dst, box, size in [
    ('desktop-activities.png', 'museum-desktop.jpg', (1040, 40, 1294, 96), None),
    ('activities.png', 'museum-m1.jpg', (220, 92, 636, 176), (390, 844)),
    ('booking.png', 'museum-m2.jpg', (220, 92, 636, 176), (390, 844)),
]:
    print(src)
    im = erase_text(Image.open(SCR / src).convert('RGB'), box)
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(OUT / dst, quality=92)

print('assets ready:', ', '.join(sorted(p.name for p in OUT.iterdir())))
