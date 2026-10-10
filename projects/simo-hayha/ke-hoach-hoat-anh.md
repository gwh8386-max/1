# Kế hoạch hoạt ảnh: The White Death

Phong cách lai Vox + hoạt hình (mẫu `tonkin-hook`). Giọng: ElevenLabs v4 (Adam), dài 7:17.
Cả video chia làm **6 bảng điều tra**, mỗi bảng là một chương. Trong một bảng, máy quay `WorldView` lia theo dây đỏ giữa các trạm. Đổi bảng thì lia gắt kèm loé trắng (tuyết).
Bảng màu riêng: trắng tuyết, xám xanh, nâu ô liu cho phe Liên Xô, đỏ gạch cho mũi tên và nét bút. Cảnh hoạt hình là mảnh giấy ghim trên bảng. Tư liệu (bản đồ, báo cáo, biểu đồ) chứng minh.

## Thành phần mới
- `src/art/Winter.tsx`: rừng tuyết nhiều lớp, tuyết rơi, xạ thủ nằm (áo choàng trắng, súng Mosin không ống ngắm), xe trượt tuyết, thân súng có/không ống ngắm, nhiệt kế, đồng hồ ánh ngày.
- `src/art/FinlandMap.tsx`: bản đồ Phần Lan 1939 theo kinh/vĩ độ (vịnh Bothnia, vịnh Phần Lan, hồ Ladoga), mũi tên xâm lược, vùng đất bị cắt (gạch chéo đỏ hiện dần), điểm đánh dấu.
- `Character`: thêm trang phục `snow` (áo choàng trắng), `greatcoat` (áo khoác Hồng quân), mũ `hood`, `ushanka`, `kepi`, `cap`.
- SFX mới: `rifle_shot`, `air_raid`, `bomber_drone`, `snow_step`, `ski_swish`.

## BẢNG 1: Buổi sáng cuối cùng (L01–L10)
| Mốc | Hình | Âm thanh |
|---|---|---|
| L01 | Đèn bàn bật. Bản đồ Phần Lan xé mép; *Finland* → khoanh đỏ quanh Phần Lan, ghim đỏ nhấp nháy ở Kollaa. Con dấu MARCH 6, 1940 | lamp_click, wind_loop, stamp |
| L02 | Dây đỏ kéo sang khung hoạt hình lớn: rừng tuyết, xạ thủ áo trắng nằm áp má vào súng, tuyết rơi | snow_step |
| L03 | *first* → trong khung, xa xa sau thân cây loé đầu nòng; zoom giật vào khung | heartbeat |
| L04 | *jaw*: loé trắng toàn màn hình, tiếng súng; khung hoạt hình đóng băng, bạc màu, nghiêng | rifle_shot, tape_stop |
| L05 | Khung mới đập xuống: hai đồng đội kéo xe trượt tuyết. *gone* → khoanh đỏ quanh hàm trên phác thảo chân dung | paper, marker_draw |
| L06 | Nhãn đánh máy "≈ 98 DAYS ON THE FRONT" | typewriter |
| L07 | Bảng đếm vạch: vạch kiểm đếm mọc nhanh, *more than five hundred* → số 500+ đập ra | tick ×n, hit |
| L08 | Sơ đồ súng trường: khoảng trống trên nòng được khoanh đỏ "NO SCOPE"; *patience* → giấy nhớ "patience" | marker_draw |
| L09 | Polaroid Simo Häyhä rơi xuống, chú thích tên | shutter |
| L10 | Viết tay "Highest count of any war?"; *real* → dấu hỏi đỏ khổng lồ, kéo ra lộ cả bảng 1 | riser, hit |

## BẢNG 2: Người nông dân và cuộc xâm lược (L11–L21)
| Mốc | Hình | Âm thanh |
|---|---|---|
| L11 | Khung hoạt hình: nông trại, Simo đội mũ lưỡi trai. *border* → bản đồ nhỏ, mũi tên chỉ Rautjärvi sát biên giới | birds (room tone), marker |
| L12 | Thước đo chiều cao bên cạnh: 5'3" / 1.52 m. *much* → bong bóng thoại trống "…" | pop |
| L13 | Bia giấy có lỗ đạn tụm giữa tâm; *shooting* → khoanh đỏ cụm lỗ, huy hiệu Civil Guard | rifle_shot nhỏ ×3 |
| L14 | *1939* → con dấu WINTER 1939 | stamp |
| L15–L16 | Bản đồ Phần Lan to: mũi tên đỏ đâm qua biên giới; con dấu NOV 30, 1939; *Helsinki* → máy bay ném bom lướt qua, chấm nổ ở Helsinki | air_raid, bomber_drone, explosion_far |
| L17 | Biểu đồ dân số: cột đầu người FINLAND 3.7M vs USSR 170M; *one hundred seventy* → cột Liên Xô vọt lên tràn khung | tick, hit |
| L18 | Giấy nhớ "DON'T INVADE SWEDEN BY MISTAKE (?)"; *Sweden* → mũi tên vẽ tay chỉ sang Thụy Điển | scribble |
| L19 | Máy quay trôi lên phía bắc hồ Ladoga; *Ladoga* → khoanh hồ; nhãn JR 34 · 6TH COMPANY | marker_draw |
| L20 | *road* → con đường bút chì tô đỏ, cờ Phần Lan ghim cạnh | marker_draw |
| L21 | *holds* → con dấu lớn "KOLLAA HOLDS" | stamp, hit |

## BẢNG 3: Rừng và đường (L22–L29)
| Mốc | Hình | Âm thanh |
|---|---|---|
| L22 | Bản đồ nhìn từ trên: đoàn xe tăng, xe tải Liên Xô; *roads* → con đường độc nhất khoanh đỏ | boat_engine (động cơ) |
| L23 | Đoàn xe bò chậm; *waist* → thước tuyết ngang thắt lưng một người lính | snow_step |
| L24 | Chấm trắng lính trượt tuyết lao ra từ rừng, cắt đoàn xe thành từng khúc; *freeze* → các khúc phủ sương | ski_swish ×3 |
| L25 | *motti* → mỗi khúc khoanh như đống củi, giấy nhớ "motti = firewood stack" | scribble |
| L26 | Lia gắt sang khung lớn: rừng tuyết nhìn từ phía Liên Xô. *other* → nhãn "THE OTHER SIDE" | whoosh |
| L27 | Lính Hồng quân đội mũ ushanka, run cầm cập; *below* → nhiệt kế tụt về −40 | wind_loop to dần |
| L28 | Đồng hồ ánh ngày thu lại còn khoảng 6 giờ; *drops* → một người lính bên cạnh ngã xuống | rifle_shot xa |
| L29 | *from* → người lính quay đầu tìm, các thân cây trắng xoá, không ai | silence, heartbeat |

## BẢNG 4: Không ống ngắm, mẹo, đại uý, bị săn (L30–L47)
| Mốc | Hình | Âm thanh |
|---|---|---|
| L30 | Sơ đồ ống ngắm; *him* → mắt vẽ tay đỏ nhìn vào ống ngắm | pop |
| L31 | *flash* → mặt kính loé sáng mặt trời; sau đó phủ sương giá | flash, frost |
| L32 | Hai đầu người cạnh nhau, một có ống ngắm cao hơn vài inch; *lot* → mũi tên đỏ đo khoảng chênh "3–4 IN" | marker_draw |
| L33 | Khung hoạt hình nhỏ: ống ngắm bên kia khoảng rừng loé; *other* → khoanh đỏ | flash |
| L34 | Súng Mosin-Nagant M/28-30 dài cắt dán; *Red Army* → con dấu "MADE IN RUSSIA · RETURNED" | stamp |
| L35–L36 | Mặt cắt hầm tuyết: tay nén tuyết, nước tưới thành băng; *hard* → nhãn ICED | water, crack |
| L37 | Hơi thở bị gạch chéo đỏ; *steam* | scribble |
| L38 | Mặt trời rồi mặt trăng quay qua đầu xạ thủ; *still* → đồng hồ chạy nhanh | clock_loop |
| L39 | Giấy nhớ: điện thoại, bộ phim 2 giờ; *phones* → điện thoại gạch chéo | pop |
| L40–L42 | Polaroid đại uý Juutilainen, mũ kepi Lê dương rơi lên đầu; *Morocco* → con dấu "TERROR OF MOROCCO". *men* → mảnh giấy giao việc trượt sang Simo. *worked* → dấu tick đỏ | stamp, paper |
| L43–L44 | Bản đồ rừng: bóng đỏ của lính bắn tỉa đối phương bò vào; *him* → khoanh; *back* → từng bóng biến mất, gạch chéo | snow_step, rifle_shot xa |
| L45 | *might* → sao nổ pháo phủ cả cánh rừng, rung máy | cannon, explosion_far |
| L46 | *coat* → áo khoác cắt dán rách lưng | paper rip |
| L47 | *work* → con dấu "BACK TO WORK" nhỏ, deadpan | stamp |

## BẢNG 5: Ai đếm? (L48–L58)
| Mốc | Hình | Âm thanh |
|---|---|---|
| L48 | *counting* → chữ viết tay "WHO WAS COUNTING?" giữa ba tờ giấy | marker |
| L49 | Báo cáo quân đội đánh máy 17/2/1940; *rifle* → bút dạ quang tô "219 CONFIRMED RIFLE KILLS" | typewriter, highlighter |
| L50 | Sổ ghi đơn vị và trang nhật ký viết tay; *five hundred* → khoanh "~500" | page_flip, marker |
| L51 | Con dấu "PUBLISHED 2017"; *death* → chữ thập nhỏ "† 2002" | stamp |
| L52 | Giấy nhớ "+200 SMG?" ; *verify* → dấu hỏi | scribble |
| L53 | Khung hoạt hình: lính Phần Lan nhìn qua ống nhòm, dấu tick "SAW HIM FALL"; *check* → vạch ngăn khoảng trống | pop |
| L54 | *exact* → ba con số nối dây đỏ, dấu "UNKNOWN" | stamp |
| L55–L56 | Biểu đồ so sánh: Häyhä 219 trong 11 tuần vs Pavlichenko 309 trong khoảng 1 năm; *weeks*, *year* → thanh thời gian bật ra | tick, hit |
| L57–L58 | Mẩu báo "WHITE DEATH"; *Soviets* → truyền đơn Liên Xô; *newspapers* → báo Phần Lan, dấu hỏi giữa hai bên | newspaper (paper) |

## BẢNG 6: 13 tháng 3, sau chiến tranh, khoảng rừng (L59–L73)
| Mốc | Hình | Âm thanh |
|---|---|---|
| L59–L60 | Quay lại phác thảo khung hoạt hình đóng băng; *explosive* → nhãn EXPLOSIVE ROUND? | tape_stop |
| L61 | Lịch xé MAR 6 → 13 lật liên tục; giường bệnh, máy đo tim | page_flip ×7, heartbeat |
| L62 | *ends* → con dấu PEACE · MARCH 13, 1940 | stamp, hit |
| L63 | Bản đồ: vùng Karelia gạch chéo đỏ hiện dần; *Karelia* | marker_draw |
| L64 | *fell* → cờ Phần Lan ở Kollaa vẫn đứng; giấy nhớ "KOLLAA NEVER FELL" | stamp |
| L65 | Biểu đồ đầu người tổn thất: 25k vs 126k+ (mỗi đầu = 1.000); *one hundred twenty-six thousand* → cột Liên Xô | tick |
| L66 | Phác thảo X-quang hàm có chỉ khâu; *jaw* | marker |
| L67 | Quân hàm lật từ hạ sĩ sang thiếu uý; *lieutenant* | stamp |
| L68 | Khung hoạt hình: Simo già với chó săn, bóng nai sừng trong rừng; *President* → polaroid nhỏ "w/ President Kekkonen" | dogs (pop), birds |
| L69 | *Practice* → chữ đập PRACTICE. | hit |
| L70 | *could* → câu trích đánh máy | typewriter |
| L71 | Polaroid 1905–2002, *Hamina* | shutter |
| L72 | *about* → con số 219 / 500 / 700 bị gạch nhạt | scribble |
| L73 | Kéo ra toàn bảng, rồi zoom vào khung rừng trống: chỉ còn bờ tuyết đóng băng; *up* → tiếng súng xa, con dấu tiêu đề THE WHITE DEATH | rifle_shot, stamp |

## 3 khoảnh khắc đắt nhất
1. **L04 "*jaw*"**: loé trắng, tiếng súng; khung xạ thủ đóng băng, bạc màu và nghiêng đi trên bảng.
2. **L28–L29 (góc nhìn phía Liên Xô)**: nhiệt kế tụt −40, người lính cạnh bên ngã, người còn lại quay đầu nhìn rừng trắng trống không, chỉ còn tiếng tim đập.
3. **L73 "*up*"**: kéo ra toàn bảng rồi lao vào khoảng rừng trống, tiếng súng xa, đóng dấu tiêu đề.
