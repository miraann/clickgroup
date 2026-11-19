"""python sheet.py <dir> <out.png> [w] — contact sheet of rendered stills (dev helper)"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 360
fs = sorted(glob.glob(os.path.join(d, '*.png')), key=lambda f: float(os.path.basename(f)[:-4]))
ims = [Image.open(f).convert('RGB') for f in fs]
h = int(ims[0].height * w / ims[0].width)
cols = min(len(ims), 4)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 6), rows * (h + 26)), '#222')
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 26)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + 22))
    dr.text((x + 4, y + 4), os.path.basename(f), fill='white')
sheet.save(out)
