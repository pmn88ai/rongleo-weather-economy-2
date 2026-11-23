# Thời tiết Kinh tế 2 — kho dữ liệu của Leo

> Trang Bảng giá RongLeo (artifact `bang-gia-rongleo`) hiện đọc dữ liệu tĩnh
> ngày 23/11/2026. Project này là bước để trang thành "của Leo": crawler
> hằng ngày lấy dữ liệu từ dulieu.dev, lưu vào Supabase CHUNG với
> rongleo-weather-economy, trang đọc từ Supabase — không phụ thuộc
> API/key của dulieu.dev nữa.

## Cách lấy dữ liệu (đã kiểm chứng 23/11/2026)

- Trang web dulieu.dev tự gọi các endpoint `/api/*` của nó KHÔNG CẦN KEY.
  Crawler gọi đúng các endpoint đó: 28 endpoint + 1 trang `/chi-so-gia`.
- Key Free của Leo chỉ là DỰ PHÒNG cho endpoint chi tiết
  (`/api/groceries`, `/api/mombaby`, `/api/realestate` — danh sách tin thô).
  Crawler hiện tại KHÔNG dùng key, KHÔNG tốn lượt Free nào.
- Lượt chạy đầu 23/11/2026 21:09: **29/29 OK, 0 lỗi.**

## Cấu trúc

```
rongleo-weather-economy_2/
  crawl_dulieu.py      — crawler (Python stdlib only, không cần cài thêm gì)
  supabase_schema.sql  — Leo tự chạy trong SQL Editor (project Supabase chung)
  README.md            — file này
  PROGRESS.md          — tiến độ + quyết định
  data/YYYY-MM-DD/     — snapshot từng ngày (30 file/ngày: 28 endpoint
                         + food_index + manifest.json)
```

## Chạy tay

```bash
python3 crawl_dulieu.py            # snapshot vào data/<ngày hôm nay>/
python3 crawl_dulieu.py --date 2026-11-24
```

Có env `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` thì upsert thêm vào Supabase.
Không có env thì chỉ lưu file local, không lỗi.

## Lịch chạy

Cron hằng ngày 09:34 ICT (02:34 UTC) trên máy Muse — sau giờ dulieu.dev
crawl xong (~03:30–08:00 ICT). Chạy `crawl_dulieu.py` (bản trên máy Muse),
lưu snapshot local; khi nào Supabase sẵn thì upsert thêm. Chạy ok thì im,
lỗi mới báo Leo. Bản trên máy Muse là bản chạy thật; thư mục HP này là bản
master — sửa script thì đồng bộ cả 2 chỗ.

## Supabase — dùng chung với rongleo-weather-economy

- **Không tạo project mới.** Dùng chung Supabase của project
  `rongleo-weather-economy` (xem `.env.example` bên project gốc).
- **Không trùng bảng.** Đã đọc 10 migration của project gốc (12 bảng:
  ai_outputs, articles, asset_map_snapshots, daily_briefs, events,
  indicator_manual_entries, ingestion_logs, market_analyses, market_data,
  market_prices, market_snapshots, pipeline_runs). Bảng mới
  `dulieu_snapshots` + `dulieu_crawl_runs` không trùng tên nào.
- Quy ước theo project gốc: RLS DISABLE (app cá nhân, service_role key).
- `market_prices` (row-per-metric) và `market_snapshots` (MasterSnapshot
  đông cứng) là của pipeline cũ, KHÔNG đụng — `dulieu_snapshots` lưu JSON
  gốc từ dulieu.dev, trang v2 đọc từ đó.

## Việc còn chờ Leo

1. Chạy `supabase_schema.sql` trong SQL Editor (project chung), báo lại 4 số
   kiểm tra ghi trong file (kỳ vọng: 0 / 0 / 2 dòng).
2. Nhập service key qua Secure Vault để crawler upsert được.
3. Sau đó Muse dựng trang "Thời tiết Kinh tế 2" đọc từ Supabase.

## Nguồn dữ liệu (ghi rõ để sau này tự crawl nguồn gốc)

Mỗi dòng dữ liệu dulieu.dev đều có trường `source`. Xem chi tiết trong
`PROGRESS.md` mục "Nguồn gốc từng nhóm hàng".
