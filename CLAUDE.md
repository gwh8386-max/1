# Kênh hoạt hình lịch sử (phong cách lai Vox + hoạt hình)

Repo này dựng video hoạt hình lịch sử bằng Remotion theo quy trình trong `README.md`. Mọi trao đổi với người dùng bằng tiếng Việt.

## Mặc định của kênh
- **Ngôn ngữ video: tiếng Anh**, cho người xem quốc tế, trừ khi người dùng nói khác.
- **Phong cách: lai Vox + hoạt hình**, dựng trên một bảng điều tra liền mạch. Mẫu: `video/src/projects/tonkin-hook/`. Không để khoảng trống, mỗi chữ nhấn có điểm nhấn hình.
- **Lời thoại gửi người dùng luôn có ký hiệu biểu cảm giọng:** (chỉ dẫn) ở đầu mọi dòng, *chữ nhấn*, [beat]/[pause], theo mục "Ký hiệu biểu cảm giọng" của Prompt A. Kèm bản cho ElevenLabs v3 trong `HUONG-DAN-THU-AM.md`.

## Khi người dùng nhờ làm video mới
Làm theo skill `lam-video` (`.claude/skills/lam-video/SKILL.md`), kể cả khi họ không gõ `/lam-video` mà chỉ nói "làm video về...".

## Khi người dùng gửi file giọng đọc (mp3, m4a, wav)
1. Lấy file: từ tệp đính kèm, từ Google Drive (tên file họ đưa), hoặc từ `video/public/projects/<tên-video>/` trên GitHub.
2. Chạy `.venv/bin/python tools/audio/voice.py align projects/<tên-video> <file>`, rồi xem ảnh `video/out/<tên-video>-align.png`. Dòng nào bị báo "CẦN NGHE LẠI" thì nói rõ với người dùng.
3. Render, chuẩn hoá âm lượng bằng `tools/audio/finalize.py`, nén bản 720p dưới 30 MB, rồi gửi.

## Khi người dùng góp ý theo mốc thời gian
Sửa theo `prompts/D-dung-canh-remotion.md`. Dùng tên hiệu ứng trong `prompts/thu-vien-hieu-ung.md`. Chụp khung hình để soát trước khi render lại.

## Quy tắc chung
- Phiên mới mà chưa có `.venv` hoặc `video/node_modules`: chạy `bash tools/setup.sh` trước. Âm thanh tổng hợp và thư viện không nằm trong git.
- Mốc thời gian trong cảnh luôn đi qua `useClock()` (`c.at('L05','ngư')`), không viết cứng giây.
- File gửi qua chat tối đa 30 MB. Video dài thì nén 720p.
- Xong mỗi mốc (lời thoại, bản nháp, bản có giọng): commit và push lên nhánh `main`.
