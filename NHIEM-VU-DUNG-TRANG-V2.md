# NHIỆM VỤ — Dựng trang "Thời tiết Kinh tế 2" (Next.js + chế độ điện thoại)

**Ngày:** 23/11/2026 21:42
**Người giao:** Muse_anh (tổng điều phối) — theo lệnh trực tiếp của Leo: "đưa bot HP làm, thêm chế độ điện thoại".
**Thư mục làm việc (repo root):** `D:\WORK\projects\ai-sandbox\rongleo-weather-economy_2`
**KHÔNG commit, KHÔNG push, KHÔNG deploy lên Vercel.** Chỉ build + kiểm local, viết báo cáo.

## 1. Dựng app Next.js như project gốc

- Project gốc để tham khảo (chỉ học mẫu, KHÔNG copy pipeline dữ liệu của nó):
  `D:\WORK\projects\ai-sandbox\rongleo-weather-economy`
  Đọc `README.md`, `package.json`, `src/` của project gốc để lấy đúng stack
  (Next.js 16 App Router, TypeScript, Tailwind CSS v4) và cách nó tổ chức trang + gọi Supabase.
- Dựng app mới trong thư mục làm việc trên: `npx create-next-app` hoặc copy khung
  tối thiểu từ project gốc rồi sửa. App phải `npm run build` PASS và `npm run lint` PASS.

## 2. Dữ liệu — đọc Supabase CHUNG với project gốc, trực tiếp, live

- Dùng CHUNG Supabase project với `rongleo-weather-economy`, KHÔNG tạo project mới.
- Bảng (Leo đã chạy schema xong):
  - `dulieu_snapshots` — 1 dòng = 1 endpoint x 1 ngày; cột `data` là JSON gốc từ dulieu.dev.
  - `dulieu_crawl_runs` — log mỗi lượt crawler chạy.
- App đọc từ `dulieu_snapshots` qua Supabase client với anon key (chỉ đọc).
- `.env.local` trong thư mục làm việc: tạo bằng cách COPY các dòng Supabase
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`) từ file `.env.local` của project gốc.
  Kiểm tra `.gitignore` đã chặn `.env.local` rồi mới ghi file.
  **TUYỆT ĐỐI KHÔNG in bất kỳ key nào ra log/terminal, KHÔNG ghi key vào
  bất kỳ file nào khác, KHÔNG commit `.env.local`.**

## 3. Trang hiển thị — các mục dữ liệu

Trang dashboard "Thời tiết Kinh tế 2" của Leo, hiển thị dữ liệu ngày mới nhất
trong `dulieu_snapshots`. Mỗi mục lấy từ 1 endpoint (tên file trong `data/2026-11-23/`
chính là tên endpoint, mở vài file ra xem cấu trúc JSON trước khi code):

- Tỷ giá (`exchange`), Lãi suất (`interest`), Vàng (`gold`), Bạc (`silver`),
  Xăng dầu (`fuel`), Cà phê (`coffee`), Gạo (`rice`), Hồ tiêu (`pepper`),
  Dầu thô (`oil`), Hàng hóa (`commodities`), Chỉ số kinh tế (`indicators`),
- BĐS: giá trung vị (`re_summary`), chuẩn theo quận (`re_benchmarks`),
  xu hướng 30 ngày (`re_trends`), bảng giá đất 2026 (`re_landprices`),
- Thực phẩm (`groceries_summary`), Mẹ & bé (`mombaby_summary`),
  Chỉ số giá thực phẩm (`food_index`),
- Thuốc (`drugs_summary`), Điện tử (`electronics_summary`),
  Bánh kem (`bakery_summary`), Nội thất (`furniture_summary`),
  Xe & phụ tùng (`vehicles_summary`), Nước hoa (`cosmetics_summary`).
- Ghi rõ nguồn dữ liệu: dulieu.dev, cập nhật ngày nào (lấy `date` trong bảng).
- Bảng nào chưa có dữ liệu thì hiện rõ "chưa có dữ liệu ngày này" — KHÔNG bịa số.

## 4. CHẾ ĐỘ ĐIỆN THOẠI (Leo yêu cầu riêng — ưu tiên cao)

- Layout mobile-first: màn hình nhỏ (390px) phải dùng được hoàn toàn.
- 1 cột trên điện thoại; bảng dài chuyển thành thẻ (card) xếp dọc hoặc cuộn ngang
  có thanh cuộn rõ ràng; sidebar thành menu hamburger hoặc thanh điều hướng dưới.
- Chữ đủ lớn để đọc, nút/link đủ lớn để bấm bằng ngón tay, biểu đồ co theo màn hình.
- Kiểm chứng bằng cách chạy `npm run dev`, mở trang ở khung 390x844, chụp lại
  hoặc ghi nhận từng mục có đọc được không. Sửa cho tới khi điện thoại đọc ngon.

## 5. Seed dữ liệu 23/11 để trang có cái mà hiện

- Bảng Supabase hiện TRỐNG (Leo mới chạy schema, crawler chưa ghi vào).
- Viết 1 script seed (vd `scripts/seed-2026-11-23.mjs`) đọc các file JSON trong
  `data/2026-11-23/` và upsert vào `dulieu_snapshots` (khóa endpoint + date).
  Script chỉ chạy tay 1 lần, dùng service key từ `.env.local` (đọc qua biến
  môi trường, KHÔNG hard-code key vào script, KHÔNG in key ra log).
- Chạy seed xong thì kiểm trong Supabase (đếm dòng) rồi mới tin là có dữ liệu.

## 6. Kiểm chứng trước khi báo xong

1. `npm ci` (nếu chưa có node_modules), `npm run build` PASS, `npm run lint` PASS.
2. `npm run dev`, mở trang: đủ các mục ở §3, số liệu đúng với file JSON ngày 23/11.
3. Mở ở khung 390x844: layout điện thoại đọc được, không vỡ, không tràn ngang.
4. Viết báo cáo vào `BAO-CAO-DUNG-TRANG-V2.md` trong thư mục làm việc:
   đã làm gì, build PASS/FAIL, link local (localhost:3000), còn thiếu gì,
   cần Leo làm gì tiếp (vd: nhập key vào Vercel, tạo repo GitHub).

## 7. KHÔNG làm

- KHÔNG commit, KHÔNG push, KHÔNG deploy Vercel, KHÔNG tạo repo GitHub.
- KHÔNG sửa gì trong project gốc `rongleo-weather-economy` (chỉ đọc tham khảo).
- KHÔNG sửa `crawl_dulieu.py`, `supabase_schema.sql`, `data/`.
- KHÔNG ghi key/secret vào bất kỳ file nào ngoài `.env.local` (đã có trong .gitignore).
