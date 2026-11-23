# BÁO CÁO — Dựng trang “Thời tiết Kinh tế 2”

**Ngày:** 23/11/2026
**Người làm:** bot HP (opencode)
**Thư mục:** `D:\WORK\projects\ai-sandbox\rongleo-weather-economy_2`
**Trạng thái:** đã dựng xong app Next.js, build + lint PASS, đã kiểm mobile 390×844.
**KHÔNG commit, KHÔNG push, KHÔNG deploy.**

---

## 1. Đã làm gì

### 1.1. App Next.js

Dựng app mới trong thư mục làm việc, bám stack của project gốc:

- Next.js **16.2.9** (App Router, Turbopack)
- React **19.2.4** + TypeScript
- Tailwind CSS **v4** (`@tailwindcss/postcss`)
- `@supabase/supabase-js`
- ESLint 9 + `eslint-config-next`

File chính:

```
package.json, package-lock.json, tsconfig.json, next.config.ts,
postcss.config.mjs, eslint.config.mjs, next-env.d.ts
src/app/layout.tsx          — metadata + viewport mobile + theme màu
src/app/page.tsx            — server component, đọc snapshot
src/app/globals.css         — theme sáng/tối, scrollbar, scroll-margin
src/components/layout/      — AppShell (sidebar + hamburger + bottom nav), nav-items
src/components/ui/          — Section, ResponsiveTable, TrendChart
src/components/dashboard/   — Dashboard: toàn bộ 24 mục dữ liệu
src/lib/                    — supabase, snapshot, selectors, format, types
scripts/seed-2026-11-23.mjs — seed dữ liệu 23/11
```

### 1.2. Đọc dữ liệu Supabase (live) + dự phòng local

- `src/lib/supabase.ts`: Supabase client **anon key, chỉ đọc**, `cache: "no-store"`.
- `src/lib/snapshot.ts`:
  - Lấy **ngày mới nhất** trong `dulieu_snapshots`.
  - Lấy toàn bộ dòng của ngày đó (`endpoint`, `data`, `date`).
  - Đọc thêm `dulieu_crawl_runs` (lượt crawl gần nhất) để hiện số endpoint OK/lỗi.
  - Nếu Supabase lỗi/chưa có bảng: **dự phòng đọc snapshot local** trong `data/<ngày>/`,
    hiện banner cảnh báo rõ. Không bịa số.
- `.env.local`: đã copy đúng 3 dòng `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` từ project gốc.
  - **Không in key ra terminal/log.**
  - **Không ghi key vào file nào khác.**
  - `.env.local` đã nằm trong `.gitignore` (kiểm bằng `git check-ignore`).

### 1.3. Các mục dữ liệu trên trang

Đủ 24 endpoint theo thư nhiệm vụ, chia 5 nhóm:

| Nhóm | Mục |
|---|---|
| Thị trường | Tỷ giá (`exchange`), Lãi suất (`interest`) |
| Kim loại quý | Vàng (`gold`), Bạc (`silver`) |
| Năng lượng | Xăng dầu (`fuel`) |
| Nông sản | Cà phê (`coffee`), Gạo (`rice`), Hồ tiêu (`pepper`) |
| Hàng hóa / vĩ mô | Dầu thô (`oil`), Hàng hóa (`commodities`), Chỉ số kinh tế (`indicators`) |
| Bất động sản | Trung vị (`re_summary`), Quận/huyện (`re_benchmarks`), Xu hướng 30 ngày (`re_trends`), Bảng giá đất (`re_landprices`) |
| Thực phẩm | Thực phẩm (`groceries_summary`), Mẹ & bé (`mombaby_summary`), Chỉ số giá (`food_index`) |
| Y tế / công nghệ | Thuốc (`drugs_summary`), Điện tử (`electronics_summary`), Bánh kem (`bakery_summary`), Nội thất (`furniture_summary`), Xe & phụ tùng (`vehicles_summary`), Nước hoa (`cosmetics_summary`) |

Mỗi mục đều ghi rõ:

- endpoint nguồn,
- **nguồn `dulieu.dev`**,
- **ngày cập nhật** lấy từ `date` của bảng snapshot,
- số dòng nguồn.

Mục nào thiếu dữ liệu sẽ hiện khung **“Chưa có dữ liệu ngày này”** (không hiển thị số ước lượng).

### 1.4. Chế độ điện thoại (ưu tiên cao)

- Mobile-first, 1 cột; desktop mới có sidebar.
- **Mobile:** thanh trên + nút ☰ mở drawer toàn màn hình; **thanh điều hướng dưới** 5 mục ngắn
  (Tổng quan · Tỷ giá · Vàng · BĐS · Thực phẩm).
- **Bảng dài → thẻ card xếp dọc** trên điện thoại (`sm:hidden`), desktop mới hiện bảng.
- Bảng desktop có thanh cuộn ngang rõ ràng (`.table-scroll`), không đè lên mobile.
- Biểu đồ xu hướng BĐS là SVG `viewBox` + `w-full`, co theo màn hình.
- Nút/link ≥ 44px; chữ card 13–15px; có `env(safe-area-inset-*)` cho tai thỏ/home indicator.
- Tự đổi theme sáng/tối theo `prefers-color-scheme`.

### 1.5. Seed dữ liệu

- Script `scripts/seed-2026-11-23.mjs`:
  - Đọc toàn bộ `*.json` trong `data/2026-11-23/` (trừ `manifest.json`).
  - Upsert vào `dulieu_snapshots` theo khóa `(endpoint, date)`.
  - Dùng `SUPABASE_SERVICE_ROLE_KEY` từ `.env.local` qua `process.env`, **không hard-code**.
  - Không in key; chỉ in tên endpoint.
  - Kiểm lại số dòng sau khi upsert.

**Kết quả chạy seed:** **THẤT BẠI** — Supabase trả:
`Could not find the table 'public.dulieu_snapshots' in the schema cache` (PGRST205).
Tức là **bảng chưa tồn tại** trên project Supabase chung, dù thư nhiệm vụ ghi Leo đã chạy schema.
Script dừng sớm, exit code 1, báo rõ cần chạy `supabase_schema.sql`; **0 dòng được ghi**.

Vì vậy trang hiện đọc **snapshot local 23/11/2026** và hiện banner:

> Supabase chưa có bảng `dulieu_snapshots` (cần chạy `supabase_schema.sql` trong SQL Editor).
> Trang đang hiển thị snapshot local ngày 2026-11-23 (dữ liệu thật từ dulieu.dev).

---

## 2. Kiểm chứng

| Việc | Kết quả |
|---|---|
| `npm install` | OK (369 packages) |
| `npm run lint` | **PASS** (exit 0) |
| `npm run build` | **PASS** — Next 16.2.9, route `/` dynamic |
| `npm run dev` → `http://localhost:3000` | **200**, đủ 24 mục |
| `npm run start` (production, port 3002) | **200**, dữ liệu local vẫn hiển thị đúng |
| Mobile 390×844 (Chrome DevTools emulation) | `innerWidth=390`, `scrollWidth=390`, **0 phần tử tràn ngang** |
| Menu ☰ mobile | Mở/đóng OK, drawer rộng 366px trong viewport 390px |
| Dark mode | Hiển thị đúng, tương phản tốt |

Đã chụp màn hình trong lúc kiểm (file tạm, không đưa vào repo):

- `%TEMP%\opencode\rw2-01-top.png` — mobile 390×844, đầu trang
- `%TEMP%\opencode\rw2-02-vang-bac.png` — vàng/bạc dạng card
- `%TEMP%\opencode\rw2-04-bat-dong-san.png` — BĐS dạng card
- `%TEMP%\opencode\rw2-05-thuc-pham.png` — thực phẩm
- `%TEMP%\opencode\rw2-06-tieu-dung.png` — y tế/công nghệ
- `%TEMP%\opencode\rw2-07-menu.png` — drawer ☰
- `%TEMP%\opencode\rw2-desktop.png` — desktop 1280×900

Đối chiếu số liệu với JSON ngày 23/11 (đều khớp):

- USD Vietcombank: mua **25.610** / chuyển khoản **25.640** / bán **26.020**.
- EUR bán **29.101**; GBP bán **34.392**.
- Vàng AVPL (DOJI): mua **12.980** / bán **13.480** nghìn VND/chỉ.
- Xăng E10 RON 95-III: **19.100 đ**.
- CPI: **5,09**, kỳ **2026-10**.
- BĐS TP.HCM (nhà ở): trung vị **5,8 tỷ**, **108,1 triệu/m²**.
- Xu hướng BĐS 30 ngày: điểm cuối **12,83 triệu/m²** (12.830.000 đ/m²).
- Thực phẩm — Gạo & Mì: giá TB **75.328 đ**.

---

## 3. Còn thiếu / cần Leo làm tiếp

1. **Chạy `supabase_schema.sql`** trong SQL Editor của project Supabase chung.
   Kiểm tra kỳ vọng: `dulieu_snapshots` = 0 dòng, `dulieu_crawl_runs` = 0 dòng,
   2 bảng `dulieu%`.
2. **Seed dữ liệu 23/11:**
   ```bash
   npm run seed
   ```
   Kỳ vọng: 29 endpoint OK, Supabase có 29 dòng cho `2026-11-23`.
   Sau đó tải lại trang: banner cảnh báo sẽ mất, chip chuyển thành **“Supabase · live”**.
3. **Vercel (khi Leo muốn deploy):**
   - Import repo GitHub (Leo tạo/push — bot không làm).
   - Nhập `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong dashboard Vercel.
   - **Không** đưa `SUPABASE_SERVICE_ROLE_KEY` lên Vercel nếu chỉ để đọc; key này chỉ dùng cho seed/crawler.
4. **GitHub:** bot không commit/push. Code đang ở working tree, sẵn sàng để Leo review rồi commit.
5. Tùy chọn sau này:
   - Thêm nút “làm mới” hoặc route API nếu muốn refresh không tải lại trang.
   - Trang hiện khá nặng (~1,3 MB HTML) vì hiển thị nhiều bảng cùng lúc; nếu cần nhẹ hơn có thể
     thu gọn số dòng mặc định hoặc gập bớt nhóm trên mobile.

---

## 4. Những gì KHÔNG làm

- Không commit, không push, không deploy Vercel, không tạo repo GitHub.
- Không sửa project gốc `rongleo-weather-economy` (chỉ đọc tham khảo).
- Không sửa `crawl_dulieu.py`, `supabase_schema.sql`, `data/`.
- Không tạo project Supabase mới; chỉ dùng project chung qua `.env.local`.
- Không ghi key/secret vào file nào ngoài `.env.local`.

---

## 5. Lưu ý bảo mật

- `.env.local` đã được `.gitignore` chặn (`git check-ignore` xác nhận).
- Trong thư mục có log cũ của lần chạy trước (`opencode-*.log`) do tiến trình log đang mở;
  các log này đã bị `.gitignore` chặn và **không được commit**. Nếu chia sẻ log ra ngoài,
  nên xóa/che các chuỗi giống key trước khi gửi.
