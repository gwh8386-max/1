"""Thư viện âm thanh hiệu ứng tổng hợp bằng code (không cần tải về).

Chạy:  .venv/bin/python tools/audio/make_sfx.py
Kết quả: video/public/sfx/*.wav và video/src/lib/sfx-manifest.json

Đây là bộ SFX khởi đầu để dựng nháp. Khi làm bản chính thức, có thể thay bất kỳ
file nào bằng âm thanh có bản quyền (YouTube Audio Library, Epidemic Sound...)
miễn là giữ nguyên tên file.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from dsp import (SR, bandpass, brown, env_ad, fade, highpass, lowpass, make_loop, norm_peak,  # noqa: E402
                 norm_rms, pan, pink, place, reverb, rng, softclip, stereo, sweep_bandpass, t_axis,
                 white, write_wav)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'video' / 'public' / 'sfx'
MANIFEST = ROOT / 'video' / 'src' / 'lib' / 'sfx-manifest.json'

REGISTRY: dict[str, tuple[callable, bool]] = {}


def sfx(name: str, loop: bool = False):
    def deco(fn):
        REGISTRY[name] = (fn, loop)
        return fn
    return deco


# ---------- Radar / sonar / điện tử ----------

@sfx('radar_beep')
def radar_beep():
    t = t_axis(0.5)
    x = np.sin(2 * np.pi * 1320 * t) * env_ad(len(t), 0.004, 0.09, 5)
    return stereo(reverb(x, 0.6, 0.25))


@sfx('sonar_ping')
def sonar_ping():
    t = t_axis(2.6)
    f = 1050 - 60 * t
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.01, 1.4, 5)
    return stereo(reverb(x, 2.2, 0.45), 0.6)


@sfx('alarm')
def alarm():
    t = t_axis(2.4)
    f = np.where((t * 2.5).astype(int) % 2 == 0, 440, 554)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5
    x = lowpass(x, 2200) * env_ad(len(t), 0.02, 2.2, 1.2)
    return stereo(reverb(x, 0.9, 0.3))


@sfx('radio_static')
def radio_static():
    n = white(3.0, 11)
    crackle = (rng(12).random(len(n)) > 0.9985) * rng(13).standard_normal(len(n)) * 6
    x = bandpass(n * 0.4 + crackle, 400, 3500)
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t_axis(3.0)) ** 2
    return stereo(fade(x, 0.05, 0.3))


@sfx('heartbeat')
def heartbeat():
    out = np.zeros(int(4.2 * SR))
    t = t_axis(0.35)
    thump = np.sin(2 * np.pi * (55 - 25 * t / 0.35) * t) * env_ad(len(t), 0.008, 0.16, 4)
    for k in range(4):
        place(out, thump, 0.1 + k * 1.0, 1.0)
        place(out, thump, 0.1 + k * 1.0 + 0.22, 0.7)
    return stereo(lowpass(out, 400))


# ---------- Chuyển cảnh / giao diện ----------

@sfx('whoosh')
def whoosh():
    d = 0.7
    t = t_axis(d)
    centers = 300 + 2800 * np.sin(np.pi * t / d) ** 2
    x = sweep_bandpass(white(d, 21), centers, q=1.6)
    x *= np.sin(np.pi * t / d) ** 2
    return pan(fade(x), np.linspace(-0.8, 0.8, len(x)))


@sfx('whoosh_short')
def whoosh_short():
    d = 0.35
    t = t_axis(d)
    x = sweep_bandpass(white(d, 22), 500 + 3500 * np.sin(np.pi * t / d) ** 2, q=1.4)
    x *= np.sin(np.pi * t / d) ** 2
    return pan(fade(x), np.linspace(0.6, -0.6, len(x)))


@sfx('riser')
def riser():
    d = 2.5
    t = t_axis(d)
    f = 150 * (2 ** (3.2 * t / d))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    noise = sweep_bandpass(white(d, 23), 400 + 5000 * (t / d) ** 2, q=1.2)
    x = (tone + noise) * (t / d) ** 2.2
    return stereo(fade(x, 0.01, 0.03), 0.8)


@sfx('hit')
def hit():
    t = t_axis(0.6)
    body = np.sin(2 * np.pi * (90 - 50 * np.clip(t / 0.15, 0, 1)) * t) * env_ad(len(t), 0.002, 0.25, 4)
    click = highpass(white(0.6, 24), 2500) * env_ad(len(t), 0.0005, 0.015, 5) * 0.5
    return stereo(softclip(body + click, 1.5))


@sfx('pop')
def pop():
    t = t_axis(0.15)
    x = np.sin(2 * np.pi * (900 - 500 * t / 0.15) * t) * env_ad(len(t), 0.002, 0.07, 5)
    return stereo(x)


@sfx('tick')
def tick():
    t = t_axis(0.06)
    x = highpass(white(0.06, 25), 1500) * env_ad(len(t), 0.0005, 0.012, 6)
    x += np.sin(2 * np.pi * 2400 * t) * env_ad(len(t), 0.0005, 0.02, 6) * 0.5
    return stereo(x)


@sfx('flash')
def flash():
    d = 0.9
    t = t_axis(d)
    x = sweep_bandpass(white(d, 26), 1200 + 6000 * (1 - t / d), q=1.0) * env_ad(len(t), 0.03, 0.8, 3)
    shimmer = np.sin(2 * np.pi * 3520 * t) * env_ad(len(t), 0.01, 0.6, 4) * 0.15
    return stereo(reverb(x + shimmer, 1.2, 0.35), 0.8)


@sfx('tape_stop')
def tape_stop():
    d = 0.9
    t = t_axis(d)
    f = 220 * (1 - t / d) ** 2 + 20
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * (1 - t / d)
    x = lowpass(x + 0.15 * brown(d, 27) * (1 - t / d), 1800)
    return stereo(fade(x, 0.005, 0.05))


@sfx('rewind')
def rewind():
    d = 1.2
    t = t_axis(d)
    out = np.zeros(len(t))
    for k in range(14):
        tt = t_axis(0.07)
        ch = np.sin(2 * np.pi * (2000 + 1500 * tt / 0.07) * tt) * env_ad(len(tt), 0.003, 0.05, 4)
        place(out, ch, k * 0.08, 0.35)
    out += bandpass(white(d, 28), 800, 5000) * 0.25 * np.sin(np.pi * t / d)
    return stereo(fade(out), 0.5)


# ---------- Thời tiết / không khí (loop) ----------

@sfx('rain_loop', loop=True)
def rain_loop():
    d = 21.0
    base = highpass(pink(d, 31), 500) * 0.5
    drops = np.zeros(int(d * SR))
    r = rng(32)
    for at in np.sort(r.random(2600) * d):
        tt = t_axis(0.012)
        place(drops, highpass(r.standard_normal(len(tt)), 3000) * env_ad(len(tt), 0.0003, 0.006, 5), at, r.random() * 0.8)
    L = lowpass(base + drops, 9000)
    R = lowpass(highpass(pink(d, 33), 500) * 0.5 + np.roll(drops, 3171), 9000)
    return make_loop(np.stack([L, R], axis=1), 1.0)


@sfx('sea_loop', loop=True)
def sea_loop():
    d = 31.0
    t = t_axis(d)
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 7.5) * np.sin(2 * np.pi * t / 11.3 + 1)
    L = lowpass(brown(d, 41) * 0.6 + pink(d, 42) * 0.2, 700) * swell
    R = lowpass(brown(d, 43) * 0.6 + pink(d, 44) * 0.2, 700) * np.roll(swell, int(1.3 * SR))
    return make_loop(np.stack([L, R], axis=1), 1.0)


@sfx('wind_loop', loop=True)
def wind_loop():
    d = 21.0
    t = t_axis(d)
    centers = 500 + 350 * np.sin(2 * np.pi * t / 6.1) + 200 * np.sin(2 * np.pi * t / 2.3)
    L = sweep_bandpass(pink(d, 51), centers, q=2.5)
    R = sweep_bandpass(pink(d, 52), centers * 1.07, q=2.5)
    g = 0.6 + 0.4 * np.sin(2 * np.pi * t / 4.7) ** 2
    return make_loop(np.stack([L * g, R * g], axis=1), 1.0)


@sfx('room_hum_loop', loop=True)
def room_hum_loop():
    d = 15.0
    t = t_axis(d)
    hum = sum(np.sin(2 * np.pi * 60 * k * t) / k for k in (1, 2, 3, 5)) * 0.3
    fans = lowpass(pink(d, 61), 900) * 0.4
    x = hum + fans
    return make_loop(stereo(x, 0.7), 1.0)


@sfx('ceiling_fan_loop', loop=True)
def ceiling_fan_loop():
    d = 15.0
    t = t_axis(d)
    whirr = bandpass(pink(d, 62), 150, 900) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.6 * t))
    return make_loop(stereo(whirr, 0.6), 1.0)


@sfx('clock_loop', loop=True)
def clock_loop():
    d = 8.0
    out = np.zeros(int(d * SR))
    tt = t_axis(0.05)
    for k in range(8):
        f = 3000 if k % 2 == 0 else 2500
        click = np.sin(2 * np.pi * f * tt) * env_ad(len(tt), 0.0005, 0.01, 6)
        place(out, click, k * 1.0)
    return stereo(reverb(out, 0.5, 0.2)[: len(out)])


# ---------- Vũ khí / chiến trận ----------

@sfx('thunder')
def thunder():
    d = 5.0
    t = t_axis(d)
    crack = highpass(white(d, 71), 800) * env_ad(len(t), 0.003, 0.25, 5) * 0.8
    lfo = lowpass(np.abs(rng(72).standard_normal(len(t))), 3) * 6
    rumble = lowpass(brown(d, 73), 180) * env_ad(len(t), 0.25, 4.0, 3) * (0.5 + lfo)
    return stereo(reverb(softclip(crack + rumble, 1.2), 2.5, 0.4), 0.8)


@sfx('cannon')
def cannon():
    d = 3.0
    t = t_axis(d)
    blast = lowpass(white(d, 81), 2500) * env_ad(len(t), 0.001, 0.12, 5)
    thump = np.sin(2 * np.pi * (70 - 35 * np.clip(t / 0.3, 0, 1)) * t) * env_ad(len(t), 0.001, 0.5, 4)
    tail = lowpass(brown(d, 82), 300) * env_ad(len(t), 0.05, 2.6, 3) * 0.6
    return stereo(reverb(softclip(blast + thump + tail, 2.0), 2.8, 0.45), 0.6)


@sfx('explosion_far')
def explosion_far():
    d = 3.5
    t = t_axis(d)
    x = lowpass(brown(d, 83) + white(d, 84) * env_ad(len(t), 0.002, 0.1, 5), 500)
    x *= env_ad(len(t), 0.01, 3.0, 3)
    return stereo(reverb(softclip(x, 1.5), 3.0, 0.55), 0.8)


@sfx('machinegun_far')
def machinegun_far():
    d = 2.2
    out = np.zeros(int(d * SR))
    tt = t_axis(0.08)
    shot = lowpass(white(0.08, 85), 1800) * env_ad(len(tt), 0.0008, 0.03, 5)
    r = rng(86)
    for k in range(18):
        place(out, shot, 0.05 + k * 0.085 + r.random() * 0.01, 0.6 + 0.4 * r.random())
    return stereo(reverb(out, 1.8, 0.5), 0.6)


@sfx('flak')
def flak():
    d = 3.5
    out = np.zeros(int(d * SR))
    tt = t_axis(0.25)
    pop_ = lowpass(white(0.25, 87), 1500) * env_ad(len(tt), 0.001, 0.08, 5)
    boom = np.sin(2 * np.pi * 60 * tt) * env_ad(len(tt), 0.001, 0.15, 4)
    r = rng(88)
    for k in range(7):
        place(out, pop_ + 0.6 * boom, 0.1 + k * 0.42 + r.random() * 0.08, 0.5 + 0.5 * r.random())
    return stereo(reverb(out, 2.0, 0.5), 0.8)


@sfx('jet_flyby')
def jet_flyby():
    d = 4.5
    t = t_axis(d)
    prox = 1 / (1 + ((t - 2.0) / 0.6) ** 2)
    noise = sweep_bandpass(pink(d, 91), 300 + 2500 * prox, q=0.9) * (0.15 + prox)
    f = 900 * (1 + 0.12 * np.tanh(-(t - 2.0) / 0.4))
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12 * prox
    return pan(fade(noise + whine, 0.3, 0.6), np.tanh((t - 2.0) / 0.8) * 0.9)


@sfx('plane_down')
def plane_down():
    d = 4.0
    t = t_axis(d)
    f = 1200 * (1 - 0.6 * t / d)
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * np.clip(1 - t / 3.0, 0, 1)
    out = np.zeros(len(t))
    place(out, explosion_far().mean(axis=1), 2.9, 0.9)
    return stereo(fade(whine + out, 0.2, 0.3), 0.6)


@sfx('boat_engine')
def boat_engine():
    d = 4.0
    t = t_axis(d)
    f = 42 + 3 * np.sin(2 * np.pi * 0.4 * t)
    saw = signal_saw(np.cumsum(f) / SR)
    x = lowpass(saw * (0.8 + 0.2 * np.sin(2 * np.pi * 9 * t)), 500)
    return stereo(fade(x, 0.4, 0.6), 0.5)


def signal_saw(phase_cycles: np.ndarray) -> np.ndarray:
    return 2 * (phase_cycles % 1.0) - 1


# ---------- Văn phòng / đồ vật ----------

def _key(seed: int) -> np.ndarray:
    tt = t_axis(0.06)
    clack = highpass(rng(seed).standard_normal(len(tt)), 1200) * env_ad(len(tt), 0.0004, 0.01, 6)
    body = np.sin(2 * np.pi * 380 * tt) * env_ad(len(tt), 0.0005, 0.025, 5) * 0.6
    return clack + body


@sfx('typewriter')
def typewriter():
    d = 2.6
    out = np.zeros(int(d * SR))
    r = rng(101)
    at = 0.05
    k = 0
    while at < 2.3:
        place(out, _key(200 + k), at, 0.6 + 0.4 * r.random())
        at += 0.07 + r.random() * 0.12
        k += 1
    return stereo(reverb(out, 0.4, 0.15)[: len(out)])


@sfx('typewriter_bell')
def typewriter_bell():
    t = t_axis(1.5)
    x = (np.sin(2 * np.pi * 2093 * t) + 0.4 * np.sin(2 * np.pi * 5230 * t)) * env_ad(len(t), 0.001, 1.2, 4)
    return stereo(x * 0.6)


@sfx('pen_scratch')
def pen_scratch():
    d = 3.0
    t = t_axis(d)
    strokes = (np.sin(2 * np.pi * 2.3 * t) > -0.2).astype(float)
    strokes = lowpass(strokes, 30)
    x = bandpass(white(d, 111), 2500, 7000) * strokes * (0.5 + 0.5 * rng(112).random(len(t)))
    return stereo(fade(x * 0.5, 0.05, 0.2))


@sfx('gavel')
def gavel():
    out = np.zeros(int(1.2 * SR))
    tt = t_axis(0.3)
    knock = bandpass(white(0.3, 121), 300, 1800) * env_ad(len(tt), 0.0005, 0.06, 5)
    knock += np.sin(2 * np.pi * 220 * tt) * env_ad(len(tt), 0.0005, 0.08, 5) * 0.8
    place(out, knock, 0.05)
    place(out, knock, 0.38, 0.8)
    return stereo(reverb(out, 1.4, 0.35)[: int(1.6 * SR)])


@sfx('teacup')
def teacup():
    t = t_axis(1.0)
    x = sum(a * np.sin(2 * np.pi * f * t) * env_ad(len(t), 0.0005, dcy, 5)
            for f, a, dcy in ((3150, 1.0, 0.35), (5420, 0.6, 0.25), (7930, 0.3, 0.15)))
    return stereo(reverb(x * 0.5, 0.6, 0.2)[: len(t)])


@sfx('paper')
def paper():
    d = 0.5
    t = t_axis(d)
    x = sweep_bandpass(white(d, 131), 1500 + 3000 * np.sin(np.pi * t / d), q=1.5) * np.sin(np.pi * t / d) ** 1.5
    return stereo(fade(x))


@sfx('scribble')
def scribble():
    """Nét bút gạch mạnh hai lần (gạch xoá chữ)."""
    out = np.zeros(int(0.6 * SR))
    for k, at in enumerate((0.0, 0.14)):
        d = 0.16
        t = t_axis(d)
        x = sweep_bandpass(white(d, 151 + k), 1500 + 2500 * np.sin(np.pi * t / d), q=1.8) * np.sin(np.pi * t / d) ** 0.7
        place(out, x, at, 1.0 - 0.15 * k)
    return stereo(fade(out, 0.002, 0.05))


@sfx('marker_draw')
def marker_draw():
    """Bút dạ kéo trên giấy (vẽ đường trên bản đồ)."""
    d = 1.6
    t = t_axis(d)
    grain = lowpass((rng(153).random(len(t)) > 0.5).astype(float), 30)
    x = bandpass(white(d, 152), 1200, 6000) * (0.45 + 0.55 * grain)
    x *= np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.2) * (0.8 + 0.2 * np.sin(2 * np.pi * 1.3 * t))
    return stereo(x * 0.7)


@sfx('stamp')
def stamp():
    """Con dấu cao su đập xuống bàn: tiếng thịch gỗ + giấy."""
    t = t_axis(0.5)
    thud = np.sin(2 * np.pi * (140 - 70 * np.clip(t / 0.08, 0, 1)) * t) * env_ad(len(t), 0.001, 0.12, 5)
    knock = bandpass(white(0.5, 161), 200, 1600) * env_ad(len(t), 0.0005, 0.05, 6) * 0.9
    slap = highpass(white(0.5, 162), 2500) * env_ad(len(t), 0.0005, 0.02, 6) * 0.4
    return stereo(reverb(softclip(thud + knock + slap, 1.4), 0.5, 0.15)[: int(0.7 * SR)])


@sfx('highlighter')
def highlighter():
    """Bút dạ quang kéo một đường: tiếng rít nhẹ của đầu bút."""
    d = 0.55
    t = t_axis(d)
    squeak = np.sin(2 * np.pi * np.cumsum(2600 + 300 * np.sin(2 * np.pi * 9 * t)) / SR) * 0.08
    rub = bandpass(white(d, 163), 2000, 7000) * 0.5
    x = (squeak + rub) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5
    return stereo(fade(x, 0.01, 0.06))


@sfx('page_flip')
def page_flip():
    d = 0.35
    t = t_axis(d)
    x = sweep_bandpass(white(d, 164), 900 + 4000 * np.sin(np.pi * t / d), q=1.2) * env_ad(len(t), 0.02, 0.3, 3)
    snap = highpass(white(d, 165), 3000) * env_ad(len(t), 0.0005, 0.01, 6) * 0.6
    return stereo(fade(x + np.roll(snap, int(0.22 * SR)), 0.003, 0.03))


@sfx('shutter')
def shutter():
    """Màn trập máy ảnh polaroid: hai tiếng tách + tiếng đẩy phim."""
    out = np.zeros(int(0.9 * SR))
    tt = t_axis(0.03)
    click = highpass(white(0.03, 166), 1500) * env_ad(len(tt), 0.0003, 0.008, 6)
    place(out, click, 0.0, 1.0)
    place(out, click, 0.06, 0.7)
    whirr = bandpass(white(0.5, 167), 600, 2400) * 0.25 * env_ad(int(0.5 * SR), 0.05, 0.45, 2)
    place(out, whirr, 0.2)
    return stereo(out)


@sfx('lamp_click')
def lamp_click():
    t = t_axis(0.25)
    x = highpass(white(0.25, 168), 1200) * env_ad(len(t), 0.0003, 0.01, 6)
    x += np.sin(2 * np.pi * 1800 * t) * env_ad(len(t), 0.0005, 0.02, 6) * 0.4
    hum = np.sin(2 * np.pi * 120 * t) * env_ad(len(t), 0.03, 0.2, 2) * 0.08
    return stereo(x + hum)


@sfx('crowd_murmur_loop', loop=True)
def crowd_murmur_loop():
    d = 16.0
    t = t_axis(d)
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    r = rng(141)
    for v in range(28):
        f0 = r.uniform(250, 900)
        syl = lowpass((np.sin(2 * np.pi * r.uniform(3, 5.5) * t + r.random() * 6) > 0.1).astype(float), 12)
        voice = bandpass(r.standard_normal(len(t)), f0, f0 * 2.2, 2) * syl
        g = r.random()
        L += voice * g
        R += voice * (1 - g)
    return make_loop(np.stack([L, R], axis=1), 1.0)


def main() -> None:
    manifest = {}
    for name, (fn, loop) in REGISTRY.items():
        x = fn()
        x = norm_rms(x, -24.0) if loop else norm_peak(x, -1.0)
        write_wav(OUT / f'{name}.wav', x)
        manifest[name] = {'file': f'sfx/{name}.wav', 'duration': round(len(x) / SR, 3), 'loop': loop}
        print(f'  {name:20s} {len(x) / SR:5.2f}s {"(loop)" if loop else ""}')
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f'Đã tạo {len(manifest)} SFX -> {OUT}')


if __name__ == '__main__':
    main()
