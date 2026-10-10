"""Tạo vân nền cho bộ Vox: mặt bảng điều tra, vân giấy, vân mực con dấu.

  .venv/bin/python tools/visual/make_textures.py
Kết quả: video/public/vox/*.jpg|png (tạo lại được, không cần commit).
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'video' / 'public' / 'vox'


def noise(h: int, w: int, scale: int, seed: int) -> np.ndarray:
    """Nhiễu mượt: lưới ngẫu nhiên nhỏ phóng to bằng nội suy."""
    rng = np.random.default_rng(seed)
    small = rng.random((h // scale + 2, w // scale + 2))
    img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def board(w: int = 4200, h: int = 2700) -> None:
    base = np.array([38, 34, 30], dtype=np.float32)
    n = 0.55 * noise(h, w, 180, 1) + 0.3 * noise(h, w, 40, 2) + 0.15 * noise(h, w, 6, 3)
    fine = np.random.default_rng(4).random((h, w)).astype(np.float32)
    # thớ xơ (vân dọc mảnh như bìa ép)
    fibers = noise(h, w // 8, 3, 5)
    fibers = np.asarray(Image.fromarray((fibers * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR), dtype=np.float32) / 255
    lum = 0.75 + 0.5 * (n - 0.5) + 0.08 * (fine - 0.5) + 0.06 * (fibers - 0.5)
    yy, xx = np.mgrid[0:h, 0:w]
    vign = 1 - 0.35 * (((xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2) * 2.2)
    img = np.clip(base[None, None, :] * (lum * vign)[:, :, None], 0, 255).astype(np.uint8)
    Image.fromarray(img).save(OUT / 'board.jpg', quality=88)


def paper(size: int = 512, tint=(246, 241, 228), name: str = 'paper.png', seed: int = 10) -> None:
    n = 0.6 * noise(size, size, 64, seed) + 0.4 * noise(size, size, 8, seed + 1)
    fine = np.random.default_rng(seed + 2).random((size, size)).astype(np.float32)
    lum = 1 + 0.05 * (n - 0.5) + 0.04 * (fine - 0.5)
    # tileable: trộn với bản dịch nửa chu kỳ ở mép
    rolled = np.roll(np.roll(lum, size // 2, 0), size // 2, 1)
    yy, xx = np.mgrid[0:size, 0:size] / size
    wgt = np.minimum(np.minimum(xx, 1 - xx), np.minimum(yy, 1 - yy)) * 2
    lum = lum * wgt + rolled * (1 - wgt)
    img = np.clip(np.array(tint, dtype=np.float32)[None, None, :] * lum[:, :, None], 0, 255).astype(np.uint8)
    Image.fromarray(img).save(OUT / name)


def stamp_mask(size: int = 512) -> None:
    rng = np.random.default_rng(20)
    n = noise(size, size, 10, 21)
    speck = rng.random((size, size)).astype(np.float32)
    alpha = np.clip((n * 1.2 + 0.35) * (speck > 0.04), 0, 1)
    alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)))
    rgba = np.zeros((size, size, 4), dtype=np.uint8)
    rgba[..., 3] = alpha
    Image.fromarray(rgba).save(OUT / 'stamp-mask.png')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    board()
    paper()
    paper(tint=(250, 236, 160), name='sticky.png', seed=30)
    paper(tint=(214, 190, 150), name='kraft.png', seed=40)
    paper(tint=(222, 236, 226), name='check.png', seed=50)
    stamp_mask()
    print('Đã tạo vân nền ->', OUT)
