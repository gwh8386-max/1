"""Nhạc nền tổng hợp bằng code cho bản dựng nháp.

Chạy:  .venv/bin/python tools/audio/make_music.py
Kết quả: video/public/music/{tension,drums,reflective}.wav (loop liền mạch)

Nhạc tổng hợp chỉ để chốt nhịp và không khí. Bản đăng chính thức nên thay bằng
nhạc có bản quyền (YouTube Audio Library miễn phí), giữ nguyên tên file.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from dsp import SR, env_ad, highpass, lowpass, make_loop, norm_rms, pink, place, reverb, rng, t_axis, white, write_wav  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'video' / 'public' / 'music'


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def saw_stack(freq: float, dur: float, voices: int = 3, detune: float = 0.12, seed: int = 0) -> np.ndarray:
    t = t_axis(dur)
    r = rng(seed)
    out = np.zeros(len(t))
    for v in range(voices):
        f = freq * 2 ** ((v - (voices - 1) / 2) * detune / 12)
        ph = (f * t + r.random()) % 1.0
        out += 2 * ph - 1
    return out / voices


def chord_pad(notes: list[int], dur: float, cutoff: float, seed: int) -> np.ndarray:
    x = sum(saw_stack(midi(n), dur, seed=seed + i) for i, n in enumerate(notes)) / len(notes)
    x = lowpass(x, cutoff, 2)
    a = min(1.5, dur / 3)
    e = np.minimum(np.clip(t_axis(dur) / a, 0, 1), np.clip((dur - t_axis(dur)) / a, 0, 1))
    return x * e


def tension(dur: float = 96.0) -> np.ndarray:
    total = dur + 2
    t = t_axis(total)
    out = np.zeros(len(t))
    # Drone Rê, lọc mở/đóng chậm.
    drone = saw_stack(midi(38), total, 4, 0.18, 1) + 0.7 * saw_stack(midi(45), total, 3, 0.15, 2)
    cut = 350 + 250 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 23))
    blocks = [lowpass(drone[i:i + SR], float(cut[i]), 2) for i in range(0, len(drone), SR)]
    out += np.concatenate(blocks)[: len(t)] * 0.6
    # Hợp âm đổi mỗi 8 giây: Rê thứ, Si giáng, Sol thứ, La.
    prog = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]
    for k in range(int(total // 8)):
        place(out, chord_pad(prog[k % 4], 8.6, 900, 10 + k), k * 8, 0.35)
    # Nhịp trầm như tim đập, mỗi 1,6 giây.
    tt = t_axis(0.6)
    thump = np.sin(2 * np.pi * (48 - 14 * tt / 0.6) * tt) * env_ad(len(tt), 0.01, 0.35, 4)
    for k in range(int(total / 1.6)):
        place(out, thump, k * 1.6, 0.55)
    # Lớp "không khí" cao rất nhẹ.
    air = highpass(pink(total, 5), 4000) * 0.03 * (0.6 + 0.4 * np.sin(2 * np.pi * t / 9))
    out += air
    st = np.stack([out, np.roll(out, 240)], axis=1)
    st[:, 0] = reverb(st[:, 0], 2.5, 0.25, seed=1)[: len(t)]
    st[:, 1] = reverb(st[:, 1], 2.5, 0.25, seed=2)[: len(t)]
    return make_loop(st, 2.0)


def tom(freq: float) -> np.ndarray:
    tt = t_axis(0.7)
    body = np.sin(2 * np.pi * np.cumsum(freq * (1 + 0.6 * np.exp(-tt * 30))) / SR) * env_ad(len(tt), 0.002, 0.45, 4)
    skin = lowpass(white(0.7, int(freq)), 1500) * env_ad(len(tt), 0.001, 0.05, 5) * 0.4
    return body + skin


def drums(dur: float = 64.0, bpm: float = 92) -> np.ndarray:
    """Trống trận trầm + hi-hat lọc, chồng lên drone (dùng cho cảnh leo thang)."""
    total = dur + 2
    beat = 60 / bpm
    base = tension(total + 2)[: int(total * SR), 0] * 0.6
    out = base.copy()
    lo, mid = tom(58), tom(82)
    hat_t = t_axis(0.05)
    hat = highpass(white(0.05, 9), 7000) * env_ad(len(hat_t), 0.0005, 0.02, 5)
    pattern = [(0, lo, 1.0), (1.5, lo, 0.7), (2, mid, 0.8), (3, lo, 0.9), (3.5, mid, 0.6)]
    r = rng(4)
    for bar in range(int(total / (4 * beat))):
        b0 = bar * 4 * beat
        for pos, s, g in pattern:
            place(out, s, b0 + pos * beat, g)
        for k in range(16):
            place(out, hat, b0 + k * beat / 4, 0.12 + 0.1 * (k % 4 == 0) + 0.05 * r.random())
    st = np.stack([out, np.roll(out, 300)], axis=1)
    st[:, 0] = reverb(st[:, 0], 1.8, 0.2, seed=3)[: len(out)]
    st[:, 1] = reverb(st[:, 1], 1.8, 0.2, seed=4)[: len(out)]
    return make_loop(st, 1.0)


def felt_note(freq: float, dur: float = 4.0) -> np.ndarray:
    t = t_axis(dur)
    x = sum((0.9 ** k) * np.sin(2 * np.pi * freq * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.2 + 0.9 * k))
            for k in range(1, 7))
    hammer = lowpass(white(dur, int(freq)), 2500) * env_ad(len(t), 0.0005, 0.01, 5) * 0.15
    return lowpass(x + hammer, 3000) * env_ad(len(t), 0.004, dur, 2.5)


def reflective(dur: float = 80.0) -> np.ndarray:
    total = dur + 3
    out = np.zeros(int(total * SR))
    prog = [[50, 57, 64, 65], [46, 53, 62, 65], [41, 53, 57, 60], [48, 55, 60, 64]]
    beat = 60 / 66
    for k in range(int(total // (4 * beat)) + 1):
        ch = prog[k % 4]
        place(out, chord_pad([n - 12 for n in ch[:2]] + ch[2:3], 4 * beat + 1, 700, 30 + k), k * 4 * beat, 0.25)
        for j, n in enumerate([ch[1], ch[2], ch[3], ch[2]]):
            place(out, felt_note(midi(n + 12)), k * 4 * beat + j * beat, 0.35 if j else 0.45)
    st = np.stack([out, np.roll(out, 400)], axis=1)
    st[:, 0] = reverb(st[:, 0], 3.5, 0.4, seed=5)[: len(out)]
    st[:, 1] = reverb(st[:, 1], 3.5, 0.4, seed=6)[: len(out)]
    return make_loop(st, 3.0)


def main() -> None:
    for name, fn in (('tension', tension), ('drums', drums), ('reflective', reflective)):
        x = norm_rms(fn(), -20.0)
        write_wav(OUT / f'{name}.wav', x)
        print(f'  {name:12s} {len(x) / SR:6.1f}s')
    print(f'Đã tạo nhạc nền -> {OUT}')


if __name__ == '__main__':
    main()
