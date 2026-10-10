"""Đọc file lời thoại (định dạng trong prompts/A-viet-loi-thoai.md)."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

LINE_RE = re.compile(r'^(L\d+):\s*(.*)$')
SCENE_RE = re.compile(r'^##\s*CẢNH\s*(\d+)\s*[:.]?\s*(.*)$', re.IGNORECASE)
META_RE = re.compile(r'^>\s*([^:]+):\s*(.*)$')
DIR_RE = re.compile(r'^\(([^)]*)\)\s*')
PAUSE_RE = re.compile(r'\s*\[(ngừng(?: dài)?)\]\s*$', re.IGNORECASE)
PHON_RE = re.compile(r'\s*\{([^}]*)\}')
WORD_RE = re.compile(r'[\wÀ-ỹ]+', re.UNICODE)

# Từ mượn đọc nhiều âm tiết hơn số chữ viết.
LOANWORDS = {'radar': 2, 'sonar': 2, 'washington': 3, 'geneva': 3, 'paris': 2}

# Tốc độ đọc tương đối theo chỉ dẫn giọng.
DIR_RATE = {'chậm lại': 0.82, 'hạ giọng': 0.92, 'nhanh dần': 1.12, 'mỉa nhẹ': 0.95}


@dataclass
class Line:
    id: str
    scene: str
    text: str            # chữ hiển thị (phụ đề), đã bỏ chỉ dẫn và phiên âm
    spoken: str          # chữ để đọc (tên riêng thay bằng phiên âm)
    direction: str = ''
    pause: str = ''      # '', 'ngừng', 'ngừng dài'
    words: list[tuple[str, float]] = field(default_factory=list)  # (chữ hiển thị, số âm tiết)

    @property
    def syllables(self) -> float:
        return sum(s for _, s in self.words)

    @property
    def rate(self) -> float:
        return DIR_RATE.get(self.direction.lower(), 1.0)


@dataclass
class Scene:
    id: str
    title: str
    meta: dict[str, str] = field(default_factory=dict)
    lines: list[str] = field(default_factory=list)


@dataclass
class Script:
    title: str
    scenes: list[Scene]
    lines: list[Line]


def number_syllables(tok: str) -> float:
    """Ước lượng số âm tiết khi đọc một con số tiếng Việt."""
    digits = re.sub(r'\D', '', tok)
    if not digits:
        return 1
    n = len(digits)
    if n == 1:
        return 1
    if n == 2:
        return 2 if digits[1] == '0' or digits[0] == '1' else 3
    if n == 3:
        return 5
    if n == 4:
        return 8
    return n * 1.6


def tokenize(text: str) -> list[tuple[str, float]]:
    """Tách chữ hiển thị thành từng tiếng, mỗi tiếng kèm số âm tiết khi đọc."""
    out: list[tuple[str, float]] = []
    for tok in text.split():
        if not WORD_RE.search(tok):
            continue
        core = WORD_RE.findall(tok)
        if any(c.isdigit() for c in tok):
            syl = number_syllables(tok)
        else:
            syl = sum(LOANWORDS.get(c.lower(), 1) for c in core) or 1
        out.append((tok, float(syl)))
    return out


def apply_phonetics(raw: str) -> tuple[str, list[tuple[str, float]]]:
    """Bỏ {phiên âm} khỏi chữ hiển thị, nhưng dùng nó để đếm âm tiết của tên riêng."""
    words: list[tuple[str, float]] = []
    pos = 0
    display_parts = []
    for m in PHON_RE.finditer(raw):
        before = raw[pos:m.start()]
        display_parts.append(before)
        toks = tokenize(before)
        groups = m.group(1).split()
        k = min(len(groups), len(toks))
        words.extend(toks[: len(toks) - k])
        for (w, _), g in zip(toks[len(toks) - k:], groups[-k:] if k else []):
            words.append((w, float(len([p for p in re.split(r'[-\s]', g) if p]))))
        pos = m.end()
    tail = raw[pos:]
    display_parts.append(tail)
    words.extend(tokenize(tail))
    return ''.join(display_parts).strip(), words


def parse(path: Path) -> Script:
    title = ''
    scenes: list[Scene] = []
    lines: list[Line] = []
    for raw in path.read_text(encoding='utf-8').splitlines():
        s = raw.strip()
        if s == '---':
            break
        if s.startswith('# ') and not title:
            title = s[2:].strip()
            continue
        if m := SCENE_RE.match(s):
            scenes.append(Scene(id=f'C{int(m.group(1)):02d}', title=m.group(2).strip()))
            continue
        if (m := META_RE.match(s)) and scenes:
            scenes[-1].meta[m.group(1).strip().lower()] = m.group(2).strip()
            continue
        if m := LINE_RE.match(s):
            if not scenes:
                scenes.append(Scene(id='C01', title=''))
            body = m.group(2)
            direction = ''
            if d := DIR_RE.match(body):
                direction = d.group(1).strip()
                body = body[d.end():]
            pause = ''
            if p := PAUSE_RE.search(body):
                pause = p.group(1).lower()
                body = body[:p.start()]
            spoken = PHON_RE.sub(lambda mm: f' ({mm.group(1)})', body).strip()
            display, words = apply_phonetics(body)
            line = Line(id=m.group(1), scene=scenes[-1].id, text=display, spoken=spoken,
                        direction=direction, pause=pause, words=words)
            lines.append(line)
            scenes[-1].lines.append(line.id)
    ids = [l.id for l in lines]
    if len(ids) != len(set(ids)):
        dup = sorted({i for i in ids if ids.count(i) > 1})
        raise ValueError(f'Mã dòng bị lặp: {dup}')
    return Script(title=title, scenes=[sc for sc in scenes if sc.lines], lines=lines)
