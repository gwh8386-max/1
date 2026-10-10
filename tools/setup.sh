#!/usr/bin/env bash
# Cài môi trường và tạo lại thư viện âm thanh (chạy một lần cho mỗi máy hoặc phiên mới).
set -euo pipefail
cd "$(dirname "$0")/.."

python3 -m venv .venv
.venv/bin/pip install -q numpy scipy matplotlib pillow

(cd video && npm install --no-audit --no-fund)

.venv/bin/python tools/audio/make_sfx.py
.venv/bin/python tools/audio/make_music.py
.venv/bin/python tools/visual/make_textures.py
echo "Xong. Xem README.md để biết các bước tiếp theo."
