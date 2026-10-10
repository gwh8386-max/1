"""Chuẩn hoá âm lượng video thành phẩm cho YouTube (-14 LUFS, đỉnh -1 dBTP), giữ nguyên hình.

  .venv/bin/python tools/audio/finalize.py video/out/vinh-bac-bo.mp4 video/out/vinh-bac-bo-final.mp4
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def ffmpeg(args: list[str]) -> str:
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y', *args], check=True, capture_output=True, text=True).stderr


def main(src: Path, dst: Path) -> None:
    target = 'I=-14:TP=-1:LRA=11'
    log = ffmpeg(['-i', str(src), '-af', f'loudnorm={target}:print_format=json', '-f', 'null', '-'])
    m = json.loads(log[log.rfind('{'): log.rfind('}') + 1])
    ln = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
          f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    ffmpeg(['-i', str(src), '-c:v', 'copy', '-af', ln, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', str(dst)])
    print(f'{src.name}: {m["input_i"]} LUFS -> -14 LUFS  =>  {dst}')


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
