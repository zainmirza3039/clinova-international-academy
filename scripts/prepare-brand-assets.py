"""Prepare web assets from the owner's two original PNG logo uploads.

Usage: python3 scripts/prepare-brand-assets.py PRIMARY_PNG PACKAGE_PNG
Requires Pillow and NumPy. Original uploads are never overwritten.
No logo geometry or lettering is recreated; variants are cropped from supplied art.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageOps

OUTPUT = Path(__file__).resolve().parents[1] / 'public' / 'brand'
OUTPUT.mkdir(parents=True, exist_ok=True)
primary = Image.open(sys.argv[1]).convert('RGB')
package = Image.open(sys.argv[2]).convert('RGB')


def remove_white(image):
    """Unmatte white while preserving the source appearance on white."""
    rgb = np.array(image, dtype=np.float32)
    alpha = 255 - rgb.min(axis=2)
    # Ignore near-white compression noise, not the actual logo artwork.
    alpha[alpha < 12] = 0
    safe_alpha = np.maximum(alpha, 1)
    color = np.clip((rgb - 255 + alpha[..., None]) * 255 / safe_alpha[..., None], 0, 255)
    return Image.fromarray(np.dstack((color, alpha)).astype('uint8'), 'RGBA')


# Crops include a small clear-space inset; coordinates refer to original uploads.
logo = remove_white(primary.crop((77, 57, 1324, 392)))
logo.save(OUTPUT / 'clinova-logo.png', optimize=True)
mark = remove_white(package.crop((1457, 184, 1717, 448)))
mark.save(OUTPUT / 'clinova-mark.png', optimize=True)

# The package's supplied reversed logo is white on a navy background.
# Extract its luminance coverage into transparency instead of retaining the panel.
white_crop = np.array(package.crop((45, 677, 407, 782)), dtype=np.float32)
alpha = np.clip((white_crop.min(axis=2) - 8) * 255 / 247, 0, 255)
white = np.full((*alpha.shape, 4), 255, dtype='uint8')
white[:, :, 3] = alpha.astype('uint8')
Image.fromarray(white, 'RGBA').save(OUTPUT / 'clinova-logo-white.png', optimize=True)

for size in (32, 180, 192, 512):
    icon = ImageOps.contain(mark, (round(size * .9), round(size * .9)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size), 'white')
    canvas.alpha_composite(icon, ((size - icon.width) // 2, (size - icon.height) // 2))
    canvas.save(OUTPUT / f'clinova-icon-{size}.png', optimize=True)

# Social preview uses the supplied primary lockup on a white clear-space canvas.
social = Image.new('RGB', (1200, 630), 'white')
lockup = ImageOps.contain(logo, (1080, 430), Image.Resampling.LANCZOS)
social.paste(lockup, ((1200 - lockup.width) // 2, (630 - lockup.height) // 2), lockup)
social.save(OUTPUT / 'clinova-social.png', optimize=True)
print(f'Prepared 8 brand assets in {OUTPUT}')
