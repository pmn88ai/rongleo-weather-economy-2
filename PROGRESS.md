# PROGRESS — Thời tiết Kinh tế 2

## 23/11/2026

### 20:49 — Trang Bảng giá RongLeo dựng xong (artifact `bang-gia-rongleo`)
- Trang tĩnh, dữ liệu thật ngày 23/11/2026 kéo qua API Free của dulieu.dev
  (tỷ giá, vàng, bạc, lãi suất, xăng dầu, cà phê, gạo, chỉ số, BĐS HCM + Bình Dương).
- Đã dùng 22/100 lượt API Free trong ngày (còn 78). Key Free của Leo chỉ dùng
  để kéo dữ liệu, KHÔNG lưu vào file/memory nào.

### 20:52 — Đính chính: API khóa ≠ web khóa
- API chi tiết `/api/groceries` + `/api/mombaby` trả 403 cho gói Free,
  NHƯNG bảng tổng hợp theo nhóm hàng hiện CÔNG KHAI trên trang chủ dulieu.dev
  (neo #sec-groceries, #sec-mombaby), không cần đăng nhập. Leo chứng minh bằng ảnh.
- Đã trích hết lúc 20:55: Giá thực phẩm 26 dòng, Giá mẹ & bé 12 dòng,
  Chỉ số giá thực phẩm (trang /chi-so-gia, 09/2026 = 100,98, cảnh báo chưa có
  số mới trong 45 ngày), + Giá thuốc/điện tử/bánh kem/nội thất/xe/nước hoa.
- Đã đưa hết vào trang Bảng giá RongLeo (đợt 3, xong 20:59).

### 20:58 — Nguồn gốc từng nhóm hàng (biết được)
- Mỗi dòng dữ liệu trong API đều có trường `source` ghi rõ nguồn.
- Tỷ giá → vietcombank.com.vn; Vàng → giavang.doji.vn; Bạc → cafef.vn;
  Xăng dầu → webgia.com; Cà phê trong nước → giacaphe.com;
  Gạo → vietfood.org.vn; Hồ tiêu → giatieu.com;
  Dầu thô → finance.yahoo.com / stooq.com; Lãi suất → cafef.vn;
  Chỉ số kinh tế → nso.gov.vn (Tổng cục Thống kê);
  BĐS → batdongsan.com.vn / guland.vn / alonhadat.com.vn.
- Thực phẩm: 6 siêu thị (Lottemart, Cooponline, MM Vietnam, King Food Mart,
  Bách Hóa Xanh, Siêu thị Go). Mẹ & bé: bibomart, concung, kidsplaza, avakids.
  Thuốc: Pharmacity, Long Châu. Điện tử: TGDD, CellphoneS, FPT Shop,
  Hoàng Hà, Di Động Việt, TopZone.
- Phát hiện: 4 endpoint tổng hợp (`/groceries/summary`, `/groceries/stores`,
  `/mombaby/summary`, `/mombaby/stores`) FREE, không cần key.

### 21:06 — Kiểm tra nguồn gốc có crawl được không
- Mở được: Vietcombank, DOJI, CafeF, Webgia, giacaphe, giatieu, vietfood,
  nso.gov.vn, Lottemart, Cooponline, ConCung, Pharmacity.
- Chặn: batdongsan 403, guland + nhatot không nối được, Bách Hóa Xanh,
  Thế Giới Di Động chặn, Stooq không nối được.
- Leo chốt: **crawl từ dulieu.dev** (dễ nhất), API làm dự phòng, cào hằng ngày,
  lưu Supabase, làm trang Thời tiết Kinh tế 2.

### 21:09 — Crawler chạy thử: 29/29 OK
- Phát hiện: trang web dulieu.dev tự gọi các endpoint `/api/*` KHÔNG CẦN KEY.
  Crawler gọi đúng các endpoint đó — 28 endpoint + scrape trang `/chi-so-gia`.
- `crawl_dulieu.py` chạy thử 21:09: **29/29 OK, 0 lỗi**, không tốn lượt Free.
  Snapshot ngày 23/11 lưu đủ 30 file vào `data/2026-11-23/`.

### 21:10 — Lịch cào hằng ngày đã đặt
- Cron `crawl-dulieu-daily`: mỗi ngày 09:34 ICT, chạy crawler trên máy Muse.
  Ok thì im, lỗi mới báo Leo.

### 21:17 — Chuyển file sang HP + dùng chung Supabase
- Leo tạo thư mục `D:\WORK\projects\ai-sandbox\rongleo-weather-economy_2`,
  lệnh đưa hết file vào đây, viết README + PROGRESS.
- Đọc project gốc `rongleo-weather-economy`: 10 migration, 12 bảng.
  Bảng mới `dulieu_snapshots` + `dulieu_crawl_runs` KHÔNG trùng tên nào.
- Quyết định: **dùng chung Supabase với rongleo-weather-economy**,
  KHÔNG tạo project mới. Quy ước RLS DISABLE theo project gốc.
- Schema đã sửa theo quy ước này (`supabase_schema.sql`).

## Việc tiếp theo (chờ Leo)
1. Chạy `supabase_schema.sql` trong SQL Editor (project chung), báo 4 số kiểm tra.
2. Nhập service key qua Secure Vault để crawler upsert được.
3. Muse nối crawler vào Supabase + dựng trang Thời tiết Kinh tế 2 đọc từ Supabase.

### 21:42 — Leo chốt dựng Next.js + giao bot HP làm, thêm chế độ điện thoại
- Leo chọn Next.js (đọc Supabase trực tiếp, dữ liệu live), KHÔNG làm trang tĩnh.
- Đã giao bot HP (opencode) qua thư `NHIEM-VU-DUNG-TRANG-V2.md`:
  dựng app Next.js theo mẫu project gốc, đọc 2 bảng `dulieu_snapshots` +
  `dulieu_crawl_runs`, đủ các mục dữ liệu (§3 trong thư), **chế độ điện thoại
  mobile-first (390px) là yêu cầu riêng của Leo**, seed dữ liệu 23/11 vào
  Supabase để trang có cái hiện, build + lint PASS, kiểm ở 390x844.
- Khởi động 21:43 qua WMI (PID 14360), log `opencode-dung-trang-v2.log`,
  bot đã đọc thư nhiệm vụ và bắt đầu làm. KHÔNG commit/push/deploy.
- Còn chờ: báo cáo `BAO-CAO-DUNG-TRANG-V2.md` của bot + Leo tạo repo GitHub
  rồi mới đẩy code + nối Vercel (URL + anon key nhập trong dashboard Vercel).
