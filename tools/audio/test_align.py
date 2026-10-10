"""Kiểm tra voice.py bằng giọng giả lập: mỗi âm tiết là một tiếng có cao độ,
có ngắt ở dấu phẩy, nghỉ giữa các dòng, một đoạn đọc hỏng + tiếng vỗ tay.

  .venv/bin/python tools/audio/test_align.py
"""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import voice  # noqa: E402
from dsp import SR, bandpass, env_ad, pink, t_axis, white, write_wav  # noqa: E402
from scriptfmt import parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SRC_PROJECT = ROOT / 'projects' / 'vinh-bac-bo'


def syllable(seed: int, dur: float) -> np.ndarray:
    r = np.random.default_rng(seed)
    t = t_axis(dur)
    f0 = r.uniform(110, 190) * (1 + 0.05 * np.sin(2 * np.pi * 3 * t))
    ph = 2 * np.pi * np.cumsum(f0) / SR
    x = sum(np.sin(k * ph) / k for k in range(1, 12))
    x = bandpass(x, 250, 3200) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.6
    return x * r.uniform(0.5, 1.0)


def speak(line, seed: int, rate: float, cut_at: float | None = None) -> np.ndarray:
    parts = []
    words = line.words if cut_at is None else line.words[: max(1, int(len(line.words) * cut_at))]
    for i, (w, syl) in enumerate(words):
        for s in range(int(syl)):
            d = np.random.default_rng(seed + i * 7 + s).uniform(0.7, 1.3) / rate
            parts.append(syllable(seed + i * 13 + s, d))
            parts.append(np.zeros(int(0.025 * SR)))
        if w[-1:] in ',:;':
            parts.append(np.zeros(int(0.22 * SR)))
    return np.concatenate(parts)


def clap() -> np.ndarray:
    t = t_axis(0.12)
    return bandpass(white(0.12, 5), 1500, 9000) * env_ad(len(t), 0.0008, 0.03, 6) * 6


def main() -> None:
    script = parse(SRC_PROJECT / 'loi-thoai.md')
    r = np.random.default_rng(1)
    audio = [np.zeros(int(3.0 * SR))]
    truth = {}
    t = 3.0
    for i, line in enumerate(script.lines):
        rate = 4.4 * r.uniform(0.85, 1.15) * line.rate
        if line.id == 'L05':  # đọc hỏng, vỗ tay, nghỉ, đọc lại
            for chunk in (speak(line, 900, rate, cut_at=0.5), np.zeros(int(0.35 * SR)), clap(), np.zeros(int(1.0 * SR))):
                audio.append(chunk)
                t += len(chunk) / SR
        x = speak(line, 100 + i * 31, rate)
        truth[line.id] = (t, t + len(x) / SR)
        audio.append(x)
        t += len(x) / SR
        gap = r.uniform(0.8, 1.4)
        audio.append(np.zeros(int(gap * SR)))
        t += gap
    y = np.concatenate(audio)
    y = y / np.max(np.abs(y)) * 0.7 + pink(len(y) / SR, 9)[: len(y)] * 10 ** (-52 / 20)

    tmp = Path(tempfile.mkdtemp())
    proj = tmp / 'test-align'
    proj.mkdir()
    shutil.copy(SRC_PROJECT / 'loi-thoai.md', proj / 'loi-thoai.md')
    wav = tmp / 'giong-gia.wav'
    write_wav(wav, y)
    voice.align(proj, wav)

    _, _, lines_json, voice_wav = voice.project_paths(proj)
    data = json.loads(lines_json.read_text(encoding='utf-8'))
    # So thời lượng từng dòng sau dựng với thời lượng thật.
    errs = []
    for l in data['lines']:
        real = truth[l['id']][1] - truth[l['id']][0]
        errs.append(abs((l['end'] - l['start']) - real))
    print(f'Sai lệch thời lượng dòng: trung bình {np.mean(errs) * 1000:.0f} ms, lớn nhất {np.max(errs) * 1000:.0f} ms')
    ok = np.max(errs) < 0.25
    shutil.rmtree(lines_json.parent)
    shutil.rmtree(voice_wav.parent)
    print('ĐẠT' if ok else 'KHÔNG ĐẠT')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
