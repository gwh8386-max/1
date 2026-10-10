"""Các hàm xử lý tín hiệu dùng chung cho SFX, nhạc nền và giọng đọc."""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000


def t_axis(dur: float, sr: int = SR) -> np.ndarray:
    return np.arange(int(dur * sr)) / sr


def rng(seed: int) -> np.random.Generator:
    return np.random.default_rng(seed)


def white(dur: float, seed: int = 0) -> np.ndarray:
    return rng(seed).standard_normal(int(dur * SR))


def pink(dur: float, seed: int = 0) -> np.ndarray:
    n = int(dur * SR)
    spec = np.fft.rfft(rng(seed).standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    spec /= np.sqrt(f)
    x = np.fft.irfft(spec, n)
    return x / (np.std(x) + 1e-12)


def brown(dur: float, seed: int = 0) -> np.ndarray:
    x = np.cumsum(rng(seed).standard_normal(int(dur * SR)))
    x = signal.sosfilt(signal.butter(1, 15, 'highpass', fs=SR, output='sos'), x)
    return x / (np.std(x) + 1e-12)


def lowpass(x: np.ndarray, hz: float, order: int = 4) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, hz, 'lowpass', fs=SR, output='sos'), x, axis=0)


def highpass(x: np.ndarray, hz: float, order: int = 4) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, hz, 'highpass', fs=SR, output='sos'), x, axis=0)


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 4) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x, axis=0)


def sweep_bandpass(x: np.ndarray, centers: np.ndarray, q: float = 2.0, block: int = 256) -> np.ndarray:
    """Bandpass có tâm tần số thay đổi theo thời gian (xử lý theo khối, giữ trạng thái lọc)."""
    out = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        c = float(np.clip(centers[min(i, len(centers) - 1)], 40, SR / 2.3))
        bw = c / q
        sos = signal.butter(2, [max(20, c - bw / 2), min(SR / 2.1, c + bw / 2)], 'bandpass', fs=SR, output='sos')
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = signal.sosfilt_zi(sos) * 0
        out[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return out


def env_ad(n: int, attack: float, decay: float, curve: float = 4.0) -> np.ndarray:
    """Đường bao attack tuyến tính, decay hàm mũ."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-curve * np.clip(t - attack, 0, None) / max(decay, 1e-4))
    return a * d


def fade(x: np.ndarray, fin: float = 0.005, fout: float = 0.02) -> np.ndarray:
    x = x.copy()
    ni, no = int(fin * SR), int(fout * SR)
    if ni:
        x[:ni] *= np.linspace(0, 1, ni)[:, None] if x.ndim == 2 else np.linspace(0, 1, ni)
    if no:
        x[-no:] *= np.linspace(1, 0, no)[:, None] if x.ndim == 2 else np.linspace(1, 0, no)
    return x


def reverb(x: np.ndarray, decay: float = 1.5, mix: float = 0.3, seed: int = 7, predelay: float = 0.012) -> np.ndarray:
    """Reverb chập (convolution) với đáp ứng xung là nhiễu tắt dần."""
    n = int(decay * SR)
    ir = rng(seed).standard_normal(n) * np.exp(-6.9 * np.arange(n) / n)
    ir = lowpass(ir, 6000)
    ir = np.concatenate([np.zeros(int(predelay * SR)), ir])
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-12
    mono = x if x.ndim == 1 else x.mean(axis=1)
    wet = signal.fftconvolve(mono, ir)[: len(mono) + n]
    dry = np.concatenate([mono, np.zeros(len(wet) - len(mono))])
    return (1 - mix) * dry + mix * wet


def stereo(x: np.ndarray, width: float = 0.0, seed: int = 3) -> np.ndarray:
    """Mono -> stereo; width > 0 làm lệch nhẹ hai kênh bằng trễ ngắn."""
    if x.ndim == 2:
        return x
    if width <= 0:
        return np.stack([x, x], axis=1)
    d = int(0.0007 * width * SR) + 1
    r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([x, (1 - 0.3 * width) * x + 0.3 * width * r], axis=1)


def pan(x: np.ndarray, p: np.ndarray | float) -> np.ndarray:
    """p trong [-1, 1]; -1 = trái."""
    mono = x if x.ndim == 1 else x.mean(axis=1)
    p = np.broadcast_to(p, mono.shape)
    ang = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(ang), mono * np.sin(ang)], axis=1)


def softclip(x: np.ndarray, drive: float = 2.0) -> np.ndarray:
    return np.tanh(drive * x) / np.tanh(drive)


def place(dst: np.ndarray, src: np.ndarray, at: float, gain: float = 1.0) -> None:
    i = int(at * SR)
    if i >= len(dst):
        return
    j = min(len(dst), i + len(src))
    dst[i:j] += gain * src[: j - i]


def make_loop(x: np.ndarray, xfade: float = 1.0) -> np.ndarray:
    """Cắt và đan đuôi vào đầu để vòng lặp không có điểm nối."""
    c = int(xfade * SR)
    body, tail = x[:-c].copy(), x[-c:]
    w = np.linspace(0, 1, c)
    if x.ndim == 2:
        w = w[:, None]
    body[:c] = body[:c] * w + tail * (1 - w)
    return body


def norm_peak(x: np.ndarray, db: float = -1.0) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-12) * 10 ** (db / 20)


def norm_rms(x: np.ndarray, db: float = -22.0) -> np.ndarray:
    y = x / (np.sqrt(np.mean(x ** 2)) + 1e-12) * 10 ** (db / 20)
    peak = np.max(np.abs(y))
    return y / peak * 0.95 if peak > 0.95 else y


def write_wav(path: Path, x: np.ndarray, sr: int = SR) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(path, sr, (np.clip(x, -1, 1) * 32767).astype(np.int16))


def read_audio(path: Path, sr: int = SR) -> np.ndarray:
    """Giải mã mọi định dạng ffmpeg đọc được thành mono float32."""
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
