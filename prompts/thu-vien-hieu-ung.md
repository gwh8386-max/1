# Thư viện hoạt ảnh và hiệu ứng

Mỗi mục ghi: tên gọi, dùng khi nào, cách gọi trong code, và mốc thời gian nó xuất hiện trong **bản nháp pilot Vịnh Bắc Bộ** để bạn mở ra xem. Mốc tính theo bản nháp (thời lượng ước tính); có giọng thật thì sẽ xê dịch một chút.

Khi góp ý, chỉ cần nói tên hiệu ứng kèm mốc thời gian. Ví dụ: "1:07 đổi lia nhanh thành zoom xuyên", "0:18 chữ đập to hơn".

---

## 1. Chuyển cảnh (khai báo `enter` trong `SCENES` ở `Video.tsx`)

| Tên | Dùng khi | Gọi | Xem ở |
|---|---|---|---|
| Cắt | Mặc định, 70–80% số lần | `{type: 'cut'}` (bỏ trống) | 0:16.7, 1:10.8, 1:47.3 |
| Kéo ra từ một điểm | Từ chi tiết ra toàn cảnh | `{type: 'zoomOut', x: 45, y: 80}` | 0:09.5 radar → phòng chỉ huy |
| Lia nhanh | Đổi phe, đổi nhịp, dồn dập | `{type: 'whip', dir: 1 \| -1}` | 0:21.8, 1:04.9 |
| Dừng hình | Cú lật, "khoan đã" | cảnh dùng `<Freeze>` + mất màu | 0:26.4 |
| Lóe sáng | Nhảy thời gian, hồi tưởng | `{type: 'flash'}` | 0:33.3 |
| Zoom xuyên | Đi vào bên trong một vật | `{type: 'zoomThrough', x: 72, y: 58}` | 0:41.2 |
| Mờ + bạc màu | Thời gian trôi, chuyển tâm trạng | `{type: 'blur', dur: 30}` | 0:49.0, 1:36.0 |
| Mở tròn | Mở ra không gian mới | `{type: 'iris', x: 50, y: 45}` | 1:23.9, 2:00.2 |
| Hoà tan | Nhẹ nhàng, ít dùng | `{type: 'fade'}` | (chưa dùng) |
| Lia giữa hai khung trong một cảnh | Hai hình nối nhau trong cùng câu | `<WhipBetween at={...} a={...} b={...} />` | 1:07.0 Nhà Trắng → tàu sân bay |

## 2. Máy quay (`<Camera>`)

| Tên | Dùng khi | Gọi | Xem ở |
|---|---|---|---|
| Đẩy chậm | Gần như mọi cảnh, tạo căng thẳng | `zoom={[1, 1.08]} x={50} y={50}` | cả video |
| Zoom giật | Cú chốt, câu trích dẫn | `snaps={[{at: c.at('L27','chúng'), to: 1.25, x: 48, y: 30}]}` | 0:29.2, 1:45.4, 1:56.1 |
| Zoom giật rồi nhả | Liếc nhanh vào chi tiết | thêm `back: <frame>` vào snap | (chưa dùng) |
| Rung theo sự kiện | Nổ, va chạm, đóng dấu | `shakes={[{at, amp: 24, dur: 14}]}` | 0:18.7, 0:21.8–0:26, 2:10.3 |
| Rung tay | Cảnh hỗn loạn hoặc lén lút | `handheld={1}` (0 = đứng yên) | 0:16.7–0:26 |
| Trôi ngang | Cảnh rộng, phong cảnh | `drift={60}` | (chưa dùng) |

## 3. Nhân vật (`<Character>`)

```tsx
<Character x={700} y={1150} scale={2.6}
  outfit="sailor" hat="headset"
  expr={frame < c.at('L05','ngư') ? 'focused' : 'shout'}
  talk tremble={1} sweat look={[0.4, 0.8]}
  armL={{a: 20}} armR={{a: 150, bend: -0.5}} handR={<Pen />} seed={21} />
```

| Tên | Gọi | Xem ở |
|---|---|---|
| Biểu cảm | `expr`: neutral, worried, scared, shout, stern, sad, blank, smirk, focused | 0:18.7 hét · 1:57.7 đơ ra rồi buồn |
| Đổi biểu cảm theo chữ | `expr={frame < c.at(...) ? 'a' : 'b'}` | 0:16.7, 0:49–1:04 |
| Nhép miệng | `talk` (bật trong khoảng frame cần nói) | 0:18.7, 1:51.8 |
| Mồ hôi | `sweat` | 0:09.5 |
| Run | `tremble={0..1}` | 0:18.7 |
| Hướng nhìn | `look={[x, y]}` từ -1 đến 1 | 0:09.5 sĩ quan nhìn radar |
| Nghiêng đầu / người | `headTilt`, `lean` (độ) | 1:51.8 McNamara rướn người khi hỏi |
| Tay | `armL / armR = {a: góc, bend: cong, len: dài}`. Góc 0 = buông xuống, 90 = dang ngang, 180 = giơ lên | 0:49 gõ máy (góc dao động) |
| Cầm đồ vật | `handR={<Pen />}` | 1:36 bút |
| Trang phục | `outfit`: sailor, officer, suit, pilot, shirt · `hat`: sailor, officer, helmet, headset, officerHeadset, pilot · `hair`: old, short · `glasses` | |
| Cận mặt | `scale` 2.5–3 và đặt `y` thấp để thân ra ngoài khung | 0:16.7 |
| Bóng ngược sáng | `<Silhouette>` (nhân vật nhạy cảm) | 1:47.3 |
| Tự động | chớp mắt, thở, đầu nhấp nhô nhẹ (mỗi `seed` một nhịp riêng) | cả video |

## 4. Chữ trên màn hình

| Tên | Dùng khi | Gọi | Xem ở |
|---|---|---|---|
| Chữ đập | Cú chốt, tiếng hét, kết luận | `<PunchText text at out x y size color rotate />` | 0:18.7, 0:26.8, 1:57.7, 2:14.8 |
| Thẻ tên | Nhân vật lần đầu xuất hiện | `<NameTag name sub at out />` | 0:49 Herrick, 1:18.8 Alvarez, 1:36 McNamara |
| Nhãn ngày/địa điểm | Mốc thời gian, nơi chốn | `<DateStamp text at corner="tl\|tr\|bl" />` | 0:00, 0:33.3, 1:07 |
| Ruy băng | Tên sự kiện, địa danh lớn | `<Banner text at out y size />` | 1:04.9, 1:10.8, 1:23.9 |
| Chữ đánh máy | Điện tín, văn bản, nhật ký | `<Typewriter text from to />` trên tờ giấy | 0:49–1:04 |
| Bộ đếm | Con số cần "cảm" được | `<Counter from to start end suffix />` | 0:19.6 (1-2-3), 1:21 (8 NĂM), 1:30 (416–0) |
| Phụ đề tô chữ đang đọc | Bản nháp, hoặc bật khi cần | tự động khi chưa có giọng | cả bản nháp |

## 5. Không khí, ánh sáng, màu

| Tên | Gọi | Xem ở |
|---|---|---|
| Mưa xiên | `<Rain count angle opacity />` | 0:21.8 |
| Sét / chớp | `lightning` của `CICRoom`, hoặc `<FlashAt at={[...]} />` | 0:10.5 |
| Loé đầu nòng + khói + vệt đạn | `<Destroyer flashes={[...]} />`, `<Tracer />`, `<Puff />` | 0:21.8–0:26 |
| Đèn báo động đỏ | `redAlert` của `CICRoom` + lớp đỏ nhấp nháy | 0:18.7 |
| Mất màu khi dừng hình | `filter: grayscale()` | 0:26.4 |
| Tông nâu hồi tưởng | `filter: sepia(0.35)` + hạt giấy dày | 0:33.3–0:41 |
| Tối góc | `<Vignette strength color />`, đổi màu theo cảm xúc (đỏ khi sợ) | 0:41–0:49 |
| Hạt giấy | `<Grain />` phủ toàn video | cả video |
| Song sắt hạ xuống | lớp SVG trong cảnh 10 | 1:21.2 |
| Con dấu đóng | `stampAt` của `DrawerDoc` + rung | 2:10.3 |
| Đốm radar hoá tàu địch | `morphAt` của `Radar` | 0:47.4 |
| Đốm radar tắt dần | `fadeAt` của `Radar` | 2:00–2:05 |

## 6. Âm thanh

- Một tiếng: `<Sfx name="hit" at={c.at('L05','ngư')} volume={0.9} />`
- Lặp: `<Sfx name="rain_loop" at={0} dur={c.total} volume={0.4} fadeIn={20} />`
- Đổi cao độ cho đỡ lặp: `rate={0.9..1.1}` (xem các phát pháo ở 0:21.8)
- Nhạc nền theo cảnh: mảng `MUSIC` trong `Video.tsx` (tension, drums, reflective), tự hạ âm lượng khi có lời
- Cắt nhạc ở cú lật: kết thúc cue ngay đầu cảnh dừng hình (0:26.4)
- Tên SFX có sẵn:
  - Một tiếng: radar_beep, sonar_ping, alarm, radio_static, heartbeat, whoosh, whoosh_short, riser, hit, pop, tick, flash, tape_stop, rewind, thunder, cannon, explosion_far, machinegun_far, flak, jet_flyby, plane_down, boat_engine, typewriter, typewriter_bell, pen_scratch, gavel, teacup, paper
  - Lặp: rain_loop, sea_loop, wind_loop, room_hum_loop, ceiling_fan_loop, clock_loop, crowd_murmur_loop

---

## 7. Chưa có, có thể dựng thêm
Những thứ dưới đây chưa có trong bản nháp. Ghi tên vào mục "Thành phần mới cần dựng" của Prompt C là Claude Code sẽ dựng.

| Tên | Mô tả | Vì sao đáng làm |
|---|---|---|
| Ô tròn chèn cảnh | Vòng tròn nhỏ hiện cạnh nhân vật, minh hoạ điều đang được nói, có thể nở ra thành cảnh mới | Dấu hiệu nhận diện mạnh của kênh tham chiếu |
| Gạch xoá kỳ vọng | Một chữ bị gạch đỏ (nét vẽ tay chạy ra), chữ đúng hiện bên cạnh | Thể hiện "tưởng vậy nhưng hoá ra..." bằng hình |
| Bản đồ động | Bản đồ vẽ sẵn, mũi tên tự vẽ ra, điểm nhấp nháy, zoom từ vùng rộng vào một điểm | Video "toàn tập" cần bản đồ |
| Nhép miệng theo giọng thật | Miệng mở theo độ lớn của giọng đọc, thay cho nhép ngẫu nhiên | Làm được ngay khi có file giọng |
| Đi bộ / chạy | Chu kỳ chân tay khi nhân vật di chuyển ngang khung | Cảnh hành quân, chạy trốn |
| Nét vẽ rung | Viền nhân vật rung nhẹ mỗi 3–4 frame như vẽ tay | Tăng chất "hoạt hình làm tay" |
| Chiều sâu từ ảnh nền AI | Tách ảnh nền thành 3–4 lớp, các lớp trôi với tốc độ khác nhau khi máy quay chạy | Nền chi tiết như kênh tham chiếu mà vẫn chuyển động |
| Bóng thoại | Bóng chữ của nhân vật, kiểu truyện tranh | Câu nói ngắn, hài nói giảm |
| Nhân vật dẫn chuyện | Linh vật riêng của kênh, xuất hiện ở mở màn và các đoạn chuyển chương | Nhận diện kênh |
| Hệ hạt khói/lửa/bụi | Khói bốc theo gió, tàn lửa, bụi khi nổ | Cảnh chiến trận |
