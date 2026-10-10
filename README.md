# Kênh hoạt hình lịch sử: quy trình Claude Code + Remotion

```
prompts/                     A: viết lời thoại · B: gọt "mùi AI" · C: đạo diễn hoạt ảnh
                             D: dựng bằng Claude Code + Remotion · thu-vien-hieu-ung.md
projects/<tên-video>/        Lời thoại + hướng dẫn thu âm của từng video
tools/audio/                 Công cụ âm thanh (Python)
  make_sfx.py                35 hiệu ứng âm thanh tổng hợp bằng code
  make_music.py              3 nhạc nền: tension, drums, reflective
  voice.py                   ước lượng nhịp / khớp giọng đọc vào từng dòng
  test_align.py              kiểm tra voice.py bằng giọng giả lập
video/                       Dự án Remotion
  src/components/            Nhân vật có khớp, chữ động, máy quay, chuyển cảnh, SFX
  src/art/                   Bối cảnh vẽ bằng SVG (radar, biển, nội thất, địa điểm)
  src/projects/<tên-video>/  Các cảnh của từng video + lines.json (thời gian từng dòng)
```

## Quy trình 5 bước

1. **Lời thoại.** Viết bằng `prompts/A-viet-loi-thoai.md`, soát lại bằng `prompts/B-soat-va-got.md`. Lưu vào `projects/<tên-video>/loi-thoai.md` (mỗi dòng `Lxx:` là một hơi đọc).
2. **Thu âm.** Làm theo `projects/<tên-video>/HUONG-DAN-THU-AM.md`: nghỉ khoảng 1 giây giữa các dòng; đọc sai thì vỗ tay một cái rồi đọc lại dòng đó.
3. **Khớp giọng** (Claude chạy):
   ```bash
   .venv/bin/python tools/audio/voice.py align projects/vinh-bac-bo duong-dan/giong.m4a
   ```
   Lệnh này lọc ồn, tách câu theo khoảng lặng, bỏ đoạn đọc hỏng, gắn từng đoạn vào L01, L02..., nối lại theo nhịp thiết kế, rồi chuẩn hoá âm lượng (-16 LUFS). Kết quả:
   - `video/public/projects/<tên>/voice.wav`
   - `video/src/projects/<tên>/lines.json`
   - ảnh soát `video/out/<tên>-align.png`

   Chưa có giọng thì dùng `voice.py estimate projects/<tên>` để dựng bản nháp theo thời lượng ước tính.
4. **Dựng video.** Lên kế hoạch hoạt ảnh bằng `prompts/C-dao-dien-hoat-anh.md`, rồi đưa cho Claude Code dựng bằng `prompts/D-dung-canh-remotion.md`. Tên và cách gọi từng hiệu ứng có trong `prompts/thu-vien-hieu-ung.md`. Hình, chữ và hiệu ứng âm thanh của mỗi cảnh neo vào thời điểm của từng dòng hoặc từng chữ (`c.at('L05', 'ngư')`). Đổi giọng đọc thì mọi thứ tự khớp lại.
   ```bash
   cd video
   npx remotion studio                       # xem và chỉnh trực tiếp (trên máy có màn hình)
   npx remotion render src/index.ts VinhBacBo out/vinh-bac-bo.mp4 --codec=h264 --crf=20
   node scripts/stills.mjs VinhBacBo 5,20,40 # chụp nhanh vài khung hình để soát
   ```
5. **Sửa và chốt.** Góp ý theo mốc thời gian, ví dụ "0:42 chữ hiện muộn", "cảnh 8 đổi sang lia nhanh". Claude sửa cảnh tương ứng rồi render lại.

## Cài lại môi trường (phiên mới)
```bash
bash tools/setup.sh
```

## Ghi chú
- Âm thanh hiệu ứng và nhạc nền đều tổng hợp bằng code, dùng để chốt nhịp. Khi đăng chính thức, có thể thay bằng file có bản quyền (ví dụ YouTube Audio Library), giữ nguyên tên file trong `video/public/sfx/` và `video/public/music/`.
- Remotion miễn phí cho cá nhân và công ty nhỏ (tối đa 3 người). Xem giấy phép tại remotion.dev/license.
