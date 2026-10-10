"""Đọc file lời thoại (định dạng trong prompts/A-viet-loi-thoai.md), tiếng Việt hoặc tiếng Anh.

Ký hiệu trong một dòng Lxx:
  (chỉ dẫn)        cách đọc; ở đầu dòng là cho cả dòng, giữa dòng là đổi giọng từ chỗ đó
  [beat]           ngắt rất ngắn (~0,4 s)
  [pause] [ngừng]  ngừng (~0,8 s)
  [long pause] [ngừng dài]   ngừng dài (~1,5 s)
  *chữ*            nhấn mạnh (video dùng để đặt điểm nhấn hình)
  {phiên âm}       cách đọc tên riêng (chỉ để người đọc biết, không hiện trên hình)
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

LINE_RE = re.compile(r'^(L\d+):\s*(.*)$')
SCENE_RE = re.compile(r'^##\s*(?:CẢNH|SCENE)\s*(\d+)\s*[:.]?\s*(.*)$', re.IGNORECASE)
META_RE = re.compile(r'^>\s*([^:]+):\s*(.*)$')
TOKEN_RE = re.compile(r'\(([^)]*)\)|\[([^\]]*)\]|\{([^}]*)\}|(\*)|([^\s()\[\]{}*]+)')
WORD_RE = re.compile(r'[\wÀ-ỹ]+', re.UNICODE)
VI_CHARS = re.compile(r'[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]', re.IGNORECASE)

PAUSES = {'beat': 'beat', 'pause': 'pause', 'ngừng': 'pause', 'long pause': 'long', 'ngừng dài': 'long'}
PAUSE_SEC = {'beat': 0.4, 'pause': 0.8, 'long': 1.5}

# Từ mượn đọc nhiều âm tiết hơn số chữ viết (tiếng Việt).
LOANWORDS = {'radar': 2, 'sonar': 2, 'washington': 3, 'geneva': 3, 'paris': 2}

# Tốc độ đọc tương đối theo chỉ dẫn giọng (tìm theo từ khoá, cái đầu tiên khớp được dùng).
DIR_RATE = [
    (('chậm', 'slow', 'unhurried', 'let it land'), 0.85),
    (('nhanh', 'fast', 'picking up', 'urgent'), 1.12),
    (('punchy', 'hit every'), 0.9),
    (('hạ giọng', 'quiet', 'whisper', 'low'), 0.93),
    (('deadpan', 'dry', 'mỉa'), 0.95),
    (('building',), 1.05),
]


@dataclass
class Line:
    id: str
    scene: str
    text: str            # chữ hiển thị (phụ đề), đã bỏ mọi ký hiệu
    spoken: str          # chữ để đọc (kèm phiên âm)
    direction: str = ''
    pause: str = ''      # ngừng sau dòng: '', 'beat', 'pause', 'long'
    words: list[tuple[str, float]] = field(default_factory=list)  # (chữ hiển thị, số âm tiết)
    emph: list[bool] = field(default_factory=list)                # chữ nào được nhấn
    cues: list[dict] = field(default_factory=list)                # {'at': chỉ số chữ, 'kind': 'beat'|'pause'|'long'|'dir', 'text'}

    @property
    def syllables(self) -> float:
        return sum(s for _, s in self.words)

    @property
    def rate(self) -> float:
        d = self.direction.lower()
        for keys, r in DIR_RATE:
            if any(k in d for k in keys):
                return r
        return 1.0

    @property
    def inline_pause(self) -> float:
        return sum(PAUSE_SEC[c['kind']] for c in self.cues if c['kind'] in PAUSE_SEC)


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
    meta: dict[str, str] = field(default_factory=dict)
    lang: str = 'vi'


def vi_number_syllables(digits: str) -> float:
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


def en_number_syllables(digits: str) -> float:
    n = len(digits)
    return {1: 1, 2: 2.5, 3: 6, 4: 5}.get(n, n * 1.8)


def en_syllables(word: str) -> float:
    w = re.sub(r'[^a-z]', '', word.lower())
    if not w:
        return 1
    if len(w) <= 3:
        return 1
    if w.endswith('e') and not w.endswith('le'):
        w = w[:-1]
    if w.endswith(('es', 'ed')) and len(w) > 4:
        w = w[:-2]
    groups = re.findall(r'[aeiouy]+', w)
    return max(1, len(groups))


def token_syllables(tok: str, lang: str) -> float:
    core = WORD_RE.findall(tok)
    digits = re.sub(r'\D', '', tok)
    if digits:
        return vi_number_syllables(digits) if lang == 'vi' else en_number_syllables(digits)
    if lang == 'en':
        if re.fullmatch(r'(?:[A-Za-z]\.){2,}', tok.rstrip(',;:!?')):
            return sum(3 if c.lower() == 'w' else 1 for c in tok if c.isalpha())
        return sum(en_syllables(c) for c in core) or 1
    return sum(LOANWORDS.get(c.lower(), 1) for c in core) or 1


def parse_body(body: str, lang: str):
    """Tách một dòng thành chữ hiển thị, chữ để đọc, danh sách chữ + âm tiết, nhấn, chỉ dẫn."""
    direction = ''
    words: list[tuple[str, float]] = []
    emph: list[bool] = []
    cues: list[dict] = []
    display: list[str] = []
    spoken: list[str] = []
    in_emph = False
    tokens = list(TOKEN_RE.finditer(body))
    for i, m in enumerate(tokens):
        d, b, ph, star, word = m.groups()
        if d is not None:
            if not words and not direction:
                direction = d.strip()
            else:
                cues.append({'at': len(words), 'kind': 'dir', 'text': d.strip()})
        elif b is not None:
            kind = PAUSES.get(b.strip().lower())
            if kind:
                cues.append({'at': len(words), 'kind': kind, 'text': b.strip()})
        elif ph is not None:
            # Phiên âm thay cho các chữ ngay trước nó (số nhóm cách nhau bởi dấu cách).
            groups = ph.split()
            k = min(len(groups), len(words))
            for j, g in enumerate(groups[-k:] if k else []):
                idx = len(words) - k + j
                words[idx] = (words[idx][0], float(len([p for p in re.split(r'[-\s]', g) if p])))
            spoken.append(f'({ph})')
        elif star is not None:
            in_emph = not in_emph
        elif word is not None:
            if WORD_RE.search(word):
                display.append(word)
                spoken.append(word)
                words.append((word, float(token_syllables(word, lang))))
                emph.append(in_emph)
            elif display:
                # dấu câu đứng riêng (vd. sau *chữ nhấn*): dính vào chữ trước
                display[-1] += word
                spoken[-1] += word
                words[-1] = (words[-1][0] + word, words[-1][1])
    # Ký hiệu ngừng ở cuối dòng là khoảng nghỉ sau dòng, không phải cue giữa câu.
    pause = ''
    while cues and cues[-1]['at'] >= len(words) and cues[-1]['kind'] in PAUSE_SEC:
        pause = cues.pop()['kind']
    text = ' '.join(display)
    text = re.sub(r'\s+([,.;:!?])', r'\1', text)
    return text, ' '.join(spoken), direction, pause, words, emph, cues


def parse(path: Path) -> Script:
    raw_lines = path.read_text(encoding='utf-8').splitlines()
    body_text = '\n'.join(l for l in raw_lines if LINE_RE.match(l.strip()))
    title = ''
    meta: dict[str, str] = {}
    scenes: list[Scene] = []
    lines: list[Line] = []
    for raw in raw_lines:
        s = raw.strip()
        if s == '---':
            break
        if s.startswith('# ') and not title:
            title = s[2:].strip()
            continue
        if m := SCENE_RE.match(s):
            scenes.append(Scene(id=f'C{int(m.group(1)):02d}', title=m.group(2).strip()))
            continue
        if m := META_RE.match(s):
            target = scenes[-1].meta if scenes else meta
            target[m.group(1).strip().lower()] = m.group(2).strip()
            continue
    lang = meta.get('lang') or ('vi' if VI_CHARS.search(body_text) else 'en')
    scene_id = None
    for raw in raw_lines:
        s = raw.strip()
        if s == '---':
            break
        if m := SCENE_RE.match(s):
            scene_id = f'C{int(m.group(1)):02d}'
            continue
        if m := LINE_RE.match(s):
            if scene_id is None:
                scenes.insert(0, Scene(id='C01', title=''))
                scene_id = 'C01'
            text, spoken, direction, pause, words, emph, cues = parse_body(m.group(2), lang)
            line = Line(id=m.group(1), scene=scene_id, text=text, spoken=spoken, direction=direction,
                        pause=pause, words=words, emph=emph, cues=cues)
            lines.append(line)
            next(sc for sc in scenes if sc.id == scene_id).lines.append(line.id)
    ids = [l.id for l in lines]
    if len(ids) != len(set(ids)):
        dup = sorted({i for i in ids if ids.count(i) > 1})
        raise ValueError(f'Mã dòng bị lặp: {dup}')
    return Script(title=title, scenes=[sc for sc in scenes if sc.lines], lines=lines, meta=meta, lang=lang)
