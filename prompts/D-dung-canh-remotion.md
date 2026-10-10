# PROMPT D: Dựng hoạt ảnh bằng Claude Code + Remotion

Dùng trong Claude Code, mở tại repo này. Copy phần giữa hai vạch `=====`, điền tên video, dán kế hoạch hoạt ảnh (từ Prompt C) vào cuối. Có thể dùng để dựng cả video, hoặc chỉ sửa vài cảnh.

=====

Dựng (hoặc sửa) video `{tên-video}` bằng Remotion trong repo này, theo kế hoạch hoạt ảnh bên dưới.

## Đọc trước khi làm
- `README.md`: quy trình và cấu trúc thư mục
- `prompts/thu-vien-hieu-ung.md`: tên và cách gọi từng hiệu ứng
- `video/src/projects/vinh-bac-bo/`: video mẫu đã chạy (cảnh, chuyển cảnh, nhạc), làm theo đúng cách tổ chức này

## Chuẩn bị
1. Lời thoại ở `projects/{tên-video}/loi-thoai.md`.
2. Đã có giọng: chạy `.venv/bin/python tools/audio/voice.py align projects/{tên-video} <file giọng>`.
   Chưa có giọng: chạy `voice.py estimate projects/{tên-video}`.
3. Tạo `video/src/projects/{tên-video}/` gồm các file cảnh và `Video.tsx`, rồi đăng ký composition trong `video/src/Root.tsx`.

## Quy tắc bắt buộc
- **Mọi mốc thời gian đi qua `useClock()`:**
  - `@L05` → `c.at('L05')`
  - `@L05:ngư` → `c.at('L05', 'ngư')`
  - `@L06:2` → `c.at('L06', 2)`
  - `@L05+0.3s` → `c.at('L05', undefined, 0.3)`
  - `@end:L17` → `c.end('L17')`
  - Lệch theo frame thì cộng/trừ số frame.
  - Không viết cứng giây hay frame tuyệt đối. Nhờ vậy, khi đổi giọng đọc, mọi thứ tự khớp lại.
- **Chuyển cảnh** khai báo ở `enter` trong bảng `SCENES` của `Video.tsx`, không tự viết trong cảnh. Riêng chuyển giữa hai khung hình bên trong cùng một cảnh thì dùng kiểu `WhipBetween`.
- **Nhạc nền** khai báo trong mảng `MUSIC`. SFX dùng `<Sfx name=... at=... />` với tên có trong `video/src/lib/sfx-manifest.json`. Cần tiếng mới thì thêm hàm vào `tools/audio/make_sfx.py` rồi chạy lại.
- **Mọi thứ phải xác định**: cùng frame thì ra cùng hình. Dùng `random('khoá')` của Remotion, không dùng `Math.random()`.
- **Dùng lại trước, dựng mới sau.** Thành phần mới đặt đúng chỗ:
  - Nhân vật/hiệu ứng dùng chung: `video/src/components/`
  - Bối cảnh: `video/src/art/`
  - Riêng một video: trong thư mục video đó
  - Thêm cách gọi vào `prompts/thu-vien-hieu-ung.md`.
- **Thứ tự lớp:**
  1. nền
  2. vật phía sau
  3. nhân vật
  4. vật phía trước
  5. hạt (mưa, khói)
  6. tối góc, hạt giấy
  7. chữ
  8. phụ đề
- **Vùng an toàn:**
  - Chữ cách mép 70 px.
  - Không đặt gì quan trọng ở 140 px dưới đáy (phụ đề).
  - Chữ không che mặt nhân vật.
- **Hiệu năng:** không phủ bộ lọc mờ hay méo lên toàn khung trong suốt cảnh, chỉ dùng khi chuyển cảnh. Mỗi khung tối đa khoảng 200 hạt.

## Kiểm tra trước khi báo xong
1. `cd video && npx tsc --noEmit` không lỗi.
2. Chụp khung hình tại mọi mốc quan trọng: `node scripts/stills.mjs <CompositionId> <giây1,giây2,...>`. Ghép thành ảnh lưới (ffmpeg tile), rồi tự xem và sửa:
   - nhân vật bị che
   - chữ tràn mép
   - vật đè lên mặt
   - cảnh trống
3. Chụp thêm khung ở giữa mỗi lần chuyển cảnh để chắc hiệu ứng chạy đúng.
4. Render: `npx remotion render src/index.ts <CompositionId> out/{tên-video}.mp4 --codec=h264 --crf=20`.
5. Có giọng thì chuẩn hoá âm lượng: `.venv/bin/python tools/audio/finalize.py out/{tên-video}.mp4 out/{tên-video}-final.mp4`. Nếu cần gửi qua chat (giới hạn 30 MB), nén thêm một bản 720p.

## Báo cáo
- Đã đổi gì, theo từng cảnh
- Thành phần mới đã dựng
- Danh sách mốc thời gian (phút:giây) nên xem lại bằng mắt và tai
- Chỗ nào chưa làm được, và vì sao

KẾ HOẠCH HOẠT ẢNH:
{dán kết quả Prompt C, hoặc liệt kê các chỗ cần sửa kèm mốc thời gian}

=====
