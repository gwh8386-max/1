---
name: lam-video
description: Làm một video hoạt hình lịch sử mới từ đầu theo các prompt trong thư mục prompts/ (A viết lời thoại, B gọt mùi AI, C kế hoạch hoạt ảnh, D dựng Remotion). Dùng khi người dùng gõ /lam-video kèm chủ đề, hoặc nói "làm video về...".
---

# Làm video mới

Yêu cầu của người dùng: $ARGUMENTS

## 0. Chuẩn bị
- Chưa có `.venv` hoặc `video/node_modules`: chạy `bash tools/setup.sh`.
- Lấy thông tin video từ yêu cầu: chủ đề, dạng video, độ dài, góc nhìn.
- Chỉ hỏi lại khi thiếu **chủ đề**. Các thứ khác dùng mặc định:
  - ngôn ngữ: tiếng Anh
  - dạng video: chọn dạng hợp nhất với chủ đề trong 5 dạng ở Prompt A
  - độ dài: 8 phút
  - phong cách hình: lai Vox + hoạt hình (mẫu `tonkin-hook`)
- Đặt tên thư mục `<tên-video>`: không dấu, nối bằng gạch ngang, ví dụ `bach-dang-938`.

## 1. Lời thoại (Prompt A rồi Prompt B)
1. Đọc `prompts/A-viet-loi-thoai.md`. Làm đúng như phần nằm giữa hai vạch `=====`, với thông tin video ở bước 0.
2. Tự soát bản vừa viết theo `prompts/B-soat-va-got.md`: chẩn đoán, viết lại, và sửa hết những chỗ còn dấu hiệu văn AI.
3. Lưu:
   - `projects/<tên-video>/loi-thoai.md`
   - `projects/<tên-video>/HUONG-DAN-THU-AM.md`, chép từ `projects/tonkin-hook/HUONG-DAN-THU-AM.md` (tiếng Anh) hoặc `projects/vinh-bac-bo/HUONG-DAN-THU-AM.md` (tiếng Việt). Sửa phần riêng của video này: bảng ký hiệu, cách đọc từng dòng, và bản dán cho ElevenLabs v3.
   - Kiểm tra mọi dòng đều có (chỉ dẫn giọng) ở đầu dòng, và các câu chốt có *chữ nhấn* và [beat].
4. Gửi người dùng hai file đó, kèm danh sách các chỗ [KIỂM CHỨNG].
5. **Dừng lại, chờ người dùng duyệt hoặc sửa lời thoại.** Chưa duyệt thì không làm tiếp.

## 2. Kế hoạch hoạt ảnh (Prompt C)
1. Chạy `.venv/bin/python tools/audio/voice.py estimate projects/<tên-video>`.
2. Đọc `prompts/C-dao-dien-hoat-anh.md` và làm đúng phần giữa `=====`, với lời thoại đã duyệt.
3. Lưu thành `projects/<tên-video>/ke-hoach-hoat-anh.md`. Không cần chờ duyệt; nhắn người dùng 3 khoảnh khắc đắt nhất trong kế hoạch.

## 3. Dựng bản nháp (Prompt D)
1. Đọc `prompts/D-dung-canh-remotion.md` và làm theo, với kế hoạch ở bước 2.
2. Video mẫu để làm theo:
   - phong cách lai, bảng điều tra liền mạch: `video/src/projects/tonkin-hook/`
   - chia cảnh kiểu hoạt hình: `video/src/projects/vinh-bac-bo/`
   Tên và cách gọi hiệu ứng: `prompts/thu-vien-hieu-ung.md`.
3. Render bản nháp (chưa có giọng, có phụ đề), nén 720p dưới 30 MB, gửi người dùng kèm danh sách mốc thời gian nên xem.
4. Commit và push lên `main`.
5. Nhắc người dùng thu âm theo `HUONG-DAN-THU-AM.md` và gửi file giọng. Việc tiếp theo (khớp giọng, góp ý) làm theo `CLAUDE.md`.
