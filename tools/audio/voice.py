"""Khớp giọng đọc với kịch bản và dựng lại track giọng theo nhịp.

Hai chế độ:

  # Chưa có giọng: ước lượng thời gian từng dòng để dựng animatic.
  .venv/bin/python tools/audio/voice.py estimate projects/vinh-bac-bo

  # Đã có file giọng: làm sạch, tách câu theo khoảng lặng, bỏ đoạn đọc hỏng
  # (đánh dấu bằng tiếng vỗ tay), gắn từng đoạn vào L01, L02..., nối lại với
  # khoảng nghỉ đã thiết kế, chuẩn hoá âm lượng.
  .venv/bin/python tools/audio/voice.py align projects/vinh-bac-bo path/to/giong.m4a

Kết quả:
  video/src/projects/<slug>/lines.json        thời gian từng dòng, từng chữ
  video/public/projects/<slug>/voice.wav      track giọng đã dựng (chế độ align)
  video/out/<slug>-align.png                  sóng âm + ranh giới các dòng (để soát)
"""

from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from dsp import SR, highpass, read_audio, write_wav  # noqa: E402
from scriptfmt import Line, Script, parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]

# Nhịp thiết kế (giây).
RATE = {'vi': 4.4, 'en': 4.0}   # âm tiết/giây khi ước lượng
LEAD_IN = 0.6          # im lặng đầu video trước câu đầu tiên
TAIL = 3.0             # đuôi video sau câu cuối
GAP_LINE = (0.25, 0.55)  # khoảng nghỉ giữa hai dòng cùng cảnh: kẹp giọng tự nhiên vào khoảng này
GAP_SCENE_EXTRA = 0.18   # cộng thêm khi sang cảnh mới
GAP_BEAT = 0.45        # [beat]
GAP_PAUSE = 0.85       # [pause] / [ngừng]
GAP_PAUSE_LONG = 1.6   # [long pause] / [ngừng dài]
INLINE_PAUSE = {'beat': 0.35, 'pause': 0.7, 'long': 1.3}  # ngắt giữa câu khi ước lượng
PAD_PRE, PAD_POST = 0.05, 0.10   # giữ lại trước/sau mỗi câu khi cắt
COMMA_PAUSE = 0.16     # trọng số khoảng ngắt ở dấu phẩy khi chia thời gian từng chữ


@dataclass
class Seg:
    start: float
    end: float
    clap: bool = False

    @property
    def dur(self) -> float:
        return self.end - self.start


# ---------------------------------------------------------------- tiện ích

def project_paths(project: Path) -> tuple[str, Path, Path, Path]:
    slug = project.name
    script = project / 'loi-thoai.md'
    lines_json = ROOT / 'video' / 'src' / 'projects' / slug / 'lines.json'
    voice_wav = ROOT / 'video' / 'public' / 'projects' / slug / 'voice.wav'
    return slug, script, lines_json, voice_wav


def designed_gap(cur: Line, nxt: Line | None, natural: float | None, tail: float = TAIL) -> float:
    if nxt is None:
        return tail
    if cur.pause == 'long':
        g = max(GAP_PAUSE_LONG, natural or 0)
    elif cur.pause == 'pause':
        g = max(GAP_PAUSE, min(natural or 0, GAP_PAUSE_LONG))
    elif cur.pause == 'beat':
        g = max(GAP_BEAT, min(natural or 0, GAP_PAUSE))
    else:
        lo, hi = GAP_LINE
        g = float(np.clip(natural if natural is not None else 0.35, lo, hi))
    if nxt.scene != cur.scene:
        g += GAP_SCENE_EXTRA
    return g


def word_times(line: Line, start: float, end: float, rate: float) -> tuple[list[dict], list[dict]]:
    """Chia thời gian câu cho từng chữ theo số âm tiết, có tính chỗ ngắt dấu phẩy và [beat]/[pause] giữa câu."""
    gaps_before = {}
    for cue in line.cues:
        if cue['kind'] in INLINE_PAUSE:
            gaps_before[cue['at']] = gaps_before.get(cue['at'], 0) + INLINE_PAUSE[cue['kind']]
    weights: list[tuple[str, float, int]] = []  # ('w'|'gap', trọng số, chỉ số chữ)
    for i, (w, syl) in enumerate(line.words):
        if i in gaps_before:
            weights.append(('gap', gaps_before[i] * rate, i))
        weights.append(('w', syl, i))
        if w[-1:] in ',:;':
            weights.append(('gap', COMMA_PAUSE * rate, i))
    total = sum(x for _, x, _ in weights) or 1
    span = max(0.05, end - start)
    out, t = [], start
    word_start: dict[int, float] = {}
    for kind, x, i in weights:
        d = span * x / total
        if kind == 'w':
            w = line.words[i][0]
            item = {'w': w, 's': round(t, 3), 'e': round(t + d, 3)}
            if line.emph and line.emph[i]:
                item['emph'] = True
            out.append(item)
            word_start[i] = t
        t += d
    cues = []
    for cue in line.cues:
        at = cue['at']
        s = word_start.get(at, end)
        cues.append({'kind': cue['kind'], 'text': cue['text'], 'word': at, 's': round(s, 3)})
    return out, cues


def scenes_json(script: Script, timed: dict[str, tuple[float, float]], duration: float) -> list[dict]:
    """Cảnh bắt đầu sớm hơn câu đầu tiên một chút (hình đi trước tiếng)."""
    out = []
    for i, sc in enumerate(script.scenes):
        first = timed[sc.lines[0]][0]
        if i == 0:
            start = 0.0
        else:
            prev_end = timed[script.scenes[i - 1].lines[-1]][1]
            start = max(prev_end, first - min(0.35, (first - prev_end) * 0.6))
        out.append({'id': sc.id, 'title': sc.title, 'meta': sc.meta, 'lines': sc.lines, 'start': round(start, 3)})
    for i, sc in enumerate(out):
        sc['end'] = out[i + 1]['start'] if i + 1 < len(out) else round(duration, 3)
    return out


def write_lines_json(path: Path, script: Script, timed: dict[str, tuple[float, float]],
                     duration: float, source: str) -> None:
    lines = []
    rate = script_rate(script)
    for l in script.lines:
        s, e = timed[l.id]
        words, cues = word_times(l, s, e, rate)
        lines.append({'id': l.id, 'scene': l.scene, 'text': l.text, 'dir': l.direction, 'pause': l.pause,
                      'start': round(s, 3), 'end': round(e, 3), 'words': words, 'cues': cues})
    data = {'title': script.title, 'lang': script.lang, 'source': source, 'duration': round(duration, 3),
            'scenes': scenes_json(script, timed, duration), 'lines': lines}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')


def script_rate(script: Script) -> float:
    return float(script.meta.get('rate', RATE.get(script.lang, 4.2)))


def script_tail(script: Script) -> float:
    return float(script.meta.get('tail', TAIL))


def line_weight(l: Line, rate: float) -> float:
    """Thời lượng tương đối của một dòng (tính bằng 'âm tiết'), gồm cả các nhịp ngắt giữa câu."""
    inline = sum(INLINE_PAUSE[c['kind']] for c in l.cues if c['kind'] in INLINE_PAUSE)
    return l.syllables / l.rate + inline * rate


# ---------------------------------------------------------------- ước lượng

def estimate(project: Path) -> None:
    slug, script_path, lines_json, _ = project_paths(project)
    script = parse(script_path)
    rate = script_rate(script)
    t = LEAD_IN
    timed = {}
    for i, l in enumerate(script.lines):
        commas = sum(1 for w, _ in l.words if w[-1:] in ',:;')
        d = line_weight(l, rate) / rate + commas * COMMA_PAUSE
        timed[l.id] = (t, t + d)
        nxt = script.lines[i + 1] if i + 1 < len(script.lines) else None
        t += d + designed_gap(l, nxt, None, script_tail(script))
    write_lines_json(lines_json, script, timed, t, 'estimate')
    print(f'[ước lượng] {len(script.lines)} dòng, {len(script.scenes)} cảnh, tổng {t:.1f}s -> {lines_json}')


# ---------------------------------------------------------------- phân tích giọng

def frame_db(x: np.ndarray, hop: float = 0.01, win: float = 0.025) -> np.ndarray:
    h, w = int(hop * SR), int(win * SR)
    n = max(1, (len(x) - w) // h + 1)
    idx = np.arange(w)[None, :] + h * np.arange(n)[:, None]
    fr = x[np.clip(idx, 0, len(x) - 1)]
    return 10 * np.log10(np.mean(fr ** 2, axis=1) + 1e-12)


def detect_segments(x: np.ndarray, min_gap: float = 0.15, hop: float = 0.01) -> tuple[list[Seg], float, float]:
    db = frame_db(highpass(x, 80), hop)
    floor = float(np.percentile(db, 8))
    loud = float(np.percentile(db, 97))
    thr = max(floor + 9.0, loud - 38.0)
    speech = db > thr
    # Gộp lỗ hổng ngắn hơn min_gap.
    segs: list[Seg] = []
    i, n = 0, len(speech)
    while i < n:
        if not speech[i]:
            i += 1
            continue
        j = i
        while j < n and speech[j]:
            j += 1
        # Khung i phủ [i*hop, i*hop+win]: lấy tâm khung làm mốc thời gian.
        c = 0.0125 - hop / 2
        segs.append(Seg(i * hop + c, (j - 1) * hop + c + hop))
        i = j
    merged: list[Seg] = []
    for s in segs:
        if merged and s.start - merged[-1].end < min_gap:
            merged[-1].end = s.end
        else:
            merged.append(s)
    return merged, floor, thr


def is_clap(x: np.ndarray, seg: Seg) -> bool:
    """Tiếng vỗ tay: ngắn, bật lên rất gắt, năng lượng dồn ở dải cao."""
    if seg.dur > 0.28:
        return False
    a, b = int(seg.start * SR), int(seg.end * SR)
    chunk = x[max(0, a - int(0.01 * SR)): b]
    if len(chunk) < 64:
        return False
    env = np.abs(chunk)
    peak_i = int(np.argmax(env))
    onset = int(np.argmax(env > 0.1 * env[peak_i]))
    rise_ms = 1000 * (peak_i - onset) / SR
    crest = env.max() / (np.sqrt(np.mean(chunk ** 2)) + 1e-12)
    spec = np.abs(np.fft.rfft(chunk * np.hanning(len(chunk))))
    f = np.fft.rfftfreq(len(chunk), 1 / SR)
    centroid = float(np.sum(f * spec) / (np.sum(spec) + 1e-12))
    return rise_ms < 6 and crest > 5.0 and centroid > 1500


def remove_retakes(x: np.ndarray, segs: list[Seg], retake_gap: float = 0.6) -> tuple[list[Seg], list[tuple[float, float]]]:
    """Bỏ tiếng vỗ tay và phần đọc hỏng ngay trước nó (ngược về khoảng nghỉ dài gần nhất)."""
    for s in segs:
        s.clap = is_clap(x, s)
    # Bỏ các tiếng lách cách quá ngắn (không phải vỗ tay) trước khi xét.
    segs = [s for s in segs if s.clap or s.dur >= 0.06]
    keep = [True] * len(segs)
    removed = []
    for c, s in enumerate(segs):
        if not s.clap:
            continue
        keep[c] = False
        first = c
        k = c - 1
        while k >= 0 and keep[k] and not segs[k].clap:
            keep[k] = False
            first = k
            gap_before = segs[k].start - segs[k - 1].end if k > 0 else 99
            if gap_before >= retake_gap:
                break
            k -= 1
        removed.append((segs[first].start, s.end))
    return [s for s, kp in zip(segs, keep) if kp], removed


def split_to_count(x: np.ndarray, segs: list[Seg], n: int) -> list[Seg]:
    """Nếu ít đoạn hơn số dòng: tách đoạn dài nhất tại điểm nhỏ tiếng nhất ở khúc giữa."""
    segs = list(segs)
    while len(segs) < n:
        k = int(np.argmax([s.dur for s in segs]))
        s = segs[k]
        a, b = int(s.start * SR), int(s.end * SR)
        db = frame_db(x[a:b])
        lo, hi = int(len(db) * 0.2), int(len(db) * 0.8)
        cut = s.start + (lo + int(np.argmin(db[lo:hi]))) * 0.01
        segs[k:k + 1] = [Seg(s.start, cut - 0.02), Seg(cut + 0.02, s.end)]
    return segs


def group_segments(segs: list[Seg], lines: list[Line]) -> list[tuple[int, int]]:
    """Quy hoạch động: chia M đoạn liên tiếp thành N nhóm (mỗi nhóm = một dòng).

    Chi phí một nhóm = (ln(thời lượng thực / thời lượng kỳ vọng))^2 + phạt khoảng lặng dài bên trong;
    ranh giới giữa hai nhóm được thưởng khi khoảng lặng ở đó dài.
    """
    m, n = len(segs), len(lines)
    w = np.array([line_weight(l, 4.2) for l in lines])
    k = sum(s.dur for s in segs) / w.sum()
    expected = k * w
    gaps = [segs[i + 1].start - segs[i].end for i in range(m - 1)]

    def cost(j: int, a: int, b: int) -> float:
        dur = segs[b].end - segs[a].start
        inner = sum(max(0.0, g - 0.7) for g in gaps[a:b])
        return math.log(dur / expected[j]) ** 2 + 2.0 * inner

    def bonus(i: int) -> float:  # ranh giới giữa đoạn i và i+1
        return 0.6 * math.log(max(gaps[i], 0.05) / 0.3)

    inf = float('inf')
    dp = np.full((n, m), inf)
    back = np.zeros((n, m), dtype=int)
    for b in range(m - n + 1):
        dp[0, b] = cost(0, 0, b)
    for j in range(1, n):
        for b in range(j, m - (n - 1 - j)):
            best, arg = inf, -1
            for a in range(j, b + 1):
                prev = dp[j - 1, a - 1]
                if prev == inf:
                    continue
                v = prev + cost(j, a, b) - bonus(a - 1)
                if v < best:
                    best, arg = v, a
            dp[j, b], back[j, b] = best, arg
    groups, b = [], m - 1
    for j in range(n - 1, -1, -1):
        a = back[j, b] if j > 0 else 0
        groups.append((a, b))
        b = a - 1
    return groups[::-1]


def run_ffmpeg(args: list[str]) -> str:
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y', *args], check=True,
                          capture_output=True, text=True).stderr


def master(src: Path, dst: Path) -> None:
    """Nén nhẹ, khử xì, chuẩn hoá -16 LUFS (2 lượt loudnorm)."""
    chain = 'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=1.5,deesser=i=0.3'
    log = run_ffmpeg(['-i', str(src), '-af', f'{chain},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'])
    js = json.loads(log[log.rfind('{'): log.rfind('}') + 1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    dst.parent.mkdir(parents=True, exist_ok=True)
    run_ffmpeg(['-i', str(src), '-af', f'{chain},{ln}', '-ar', str(SR), '-ac', '1', str(dst)])


def plot(path: Path, x: np.ndarray, segs: list[Seg], groups, lines: list[Line], removed) -> None:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    dur = len(x) / SR
    rows = max(1, math.ceil(dur / 30))
    fig, axes = plt.subplots(rows, 1, figsize=(18, 2.2 * rows), squeeze=False)
    t = np.arange(len(x)) / SR
    step = max(1, len(x) // 200000)
    for r in range(rows):
        ax = axes[r, 0]
        ax.plot(t[::step], x[::step], lw=0.4, color='#456')
        ax.set_xlim(r * 30, (r + 1) * 30)
        ax.set_ylim(-1, 1)
        ax.set_yticks([])
        for a, b in removed:
            ax.axvspan(a, b, color='#f55', alpha=0.25)
        for (ga, gb), l in zip(groups, lines):
            s, e = segs[ga].start, segs[gb].end
            ax.axvspan(s, e, color='#5a5' if int(l.id[1:]) % 2 else '#59f', alpha=0.18)
            if r * 30 <= s < (r + 1) * 30:
                ax.text(s, 0.82, l.id, fontsize=8)
    fig.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=70)


def align(project: Path, audio: Path, denoise: bool = True) -> None:
    slug, script_path, lines_json, voice_wav = project_paths(project)
    script = parse(script_path)
    lines = script.lines
    raw = read_audio(audio)
    print(f'[giọng] {audio.name}: {len(raw) / SR:.1f}s')

    # 1) Làm sạch trên cả file: lọc ù tần thấp + khử nhiễu theo mức nền đo được.
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / 'src.wav'
        write_wav(src, raw / max(1e-9, np.max(np.abs(raw))) * 0.9)
        _, floor_db, _ = detect_segments(raw)
        nf = float(np.clip(floor_db, -80, -25))
        clean = Path(td) / 'clean.wav'
        af = 'highpass=f=75'
        if denoise:
            af += f',afftdn=nf={nf:.0f}:nr=12:tn=1'
        run_ffmpeg(['-i', str(src), '-af', af, str(clean)])
        x = read_audio(clean)

    # 2) Tách đoạn theo khoảng lặng, bỏ đoạn đọc hỏng.
    segs, floor_db, thr = detect_segments(x)
    segs, removed = remove_retakes(x, segs)
    if removed:
        print(f'  bỏ {len(removed)} đoạn đọc hỏng: ' + ', '.join(f'{a:.1f}-{b:.1f}s' for a, b in removed))
    if len(segs) < len(lines):
        print(f'  chỉ thấy {len(segs)} đoạn cho {len(lines)} dòng -> tách thêm (nên nghỉ ~1s giữa các dòng)')
        segs = split_to_count(x, segs, len(lines))

    # 3) Gắn đoạn vào từng dòng.
    groups = group_segments(segs, lines)

    # 4) Dựng lại track giọng với khoảng nghỉ thiết kế.
    out_parts = [np.zeros(int(LEAD_IN * SR))]
    t = LEAD_IN
    timed: dict[str, tuple[float, float]] = {}
    w = np.array([line_weight(l, 4.2) for l in lines])
    k = sum(segs[b].end - segs[a].start for a, b in groups) / w.sum()
    warn = []
    for i, ((a, b), l) in enumerate(zip(groups, lines)):
        s0, e0 = segs[a].start, segs[b].end
        prev_end = segs[groups[i - 1][1]].end if i else 0.0
        next_start = segs[groups[i + 1][0]].start if i + 1 < len(groups) else len(x) / SR
        cs = max(s0 - PAD_PRE, (prev_end + s0) / 2)
        ce = min(e0 + PAD_POST, (e0 + next_start) / 2)
        chunk = x[int(cs * SR): int(ce * SR)].copy()
        fi, fo = int(0.008 * SR), int(0.025 * SR)
        chunk[:fi] *= np.linspace(0, 1, fi)
        chunk[-fo:] *= np.linspace(1, 0, fo)
        speech_start = t + (s0 - cs)
        speech_end = speech_start + (e0 - s0)
        timed[l.id] = (speech_start, speech_end)
        out_parts.append(chunk)
        t += len(chunk) / SR
        nxt = lines[i + 1] if i + 1 < len(lines) else None
        natural = (next_start - e0) if nxt else None
        g = designed_gap(l, nxt, natural, script_tail(script)) - (PAD_POST if nxt else 0) - (PAD_PRE if nxt else 0)
        g = max(0.08, g)
        out_parts.append(np.zeros(int(g * SR)))
        t += g
        ratio = (e0 - s0) / (k * w[i])
        if not 0.55 < ratio < 1.8:
            warn.append(f'{l.id} (dài {ratio:.2f}x so với kỳ vọng)')
    voice = np.concatenate(out_parts)

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / 'assembled.wav'
        write_wav(tmp, voice / max(1e-9, np.max(np.abs(voice))) * 0.9)
        master(tmp, voice_wav)

    duration = len(voice) / SR
    write_lines_json(lines_json, script, timed, duration, 'voice')
    plot(ROOT / 'video' / 'out' / f'{slug}-align.png', x, segs, groups, lines, removed)

    print(f'  mức nền {floor_db:.0f} dB, ngưỡng {thr:.0f} dB, {len(segs)} đoạn -> {len(lines)} dòng')
    print(f'  track giọng mới: {duration:.1f}s -> {voice_wav}')
    print(f'  thời gian dòng -> {lines_json}')
    if warn:
        print('  CẦN NGHE LẠI: ' + ', '.join(warn))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    e = sub.add_parser('estimate')
    e.add_argument('project', type=Path)
    a = sub.add_parser('align')
    a.add_argument('project', type=Path)
    a.add_argument('audio', type=Path)
    a.add_argument('--no-denoise', action='store_true')
    args = ap.parse_args()
    if args.cmd == 'estimate':
        estimate(args.project)
    else:
        align(args.project, args.audio, denoise=not args.no_denoise)


if __name__ == '__main__':
    main()
