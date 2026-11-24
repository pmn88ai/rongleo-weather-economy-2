#!/usr/bin/env python3
"""Crawler dulieu.dev cho trang Thoi tiet Kinh te 2 cua Leo.

Nguyen tac: goi dung cac endpoint ma chinh trang web dulieu.dev goi
(khong can API key — da kiem chung 23/11/2026: tat ca deu tra 200
khong key). Key Free cua Leo chi la DU PHONG cho cac endpoint
chi tiet (/api/groceries, /api/mombaby, /api/realestate) khi can.

Chay:  python3 crawl_dulieu.py [--date YYYY-MM-DD]
  - Luu snapshot theo ngay vao data/YYYY-MM-DD/<endpoint>.json
  - Ghi manifest.json (trang thai tung endpoint)
  - Neu co env SUPABASE_URL + SUPABASE_SERVICE_KEY thi upsert
    vao bang dulieu_snapshots (xem supabase_schema.sql).
    Khong co env thi chi luu file local, khong loi.
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

BASE = "https://dulieu.dev"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 Chrome/120.0 Safari/537.36"}

# endpoint -> ten file (tat ca FREE, khong can key — kiem chung 23/11/2026)
ENDPOINTS = {
    "summary": "/api/summary",
    "exchange": "/api/exchange",
    "gold": "/api/gold",
    "silver": "/api/silver",
    "fuel": "/api/fuel/vnexpress",
    "coffee": "/api/coffee",
    "rice": "/api/rice",
    "pepper": "/api/pepper",
    "oil": "/api/oil",
    "commodities": "/api/commodities",
    "interest": "/api/interest",
    "indicators": "/api/indicators",
    "weather": "/api/weather",
    "groceries_summary": "/api/groceries/summary",
    "groceries_stores": "/api/groceries/stores",
    "mombaby_summary": "/api/mombaby/summary",
    "mombaby_stores": "/api/mombaby/stores",
    "drugs_summary": "/api/drugs/summary",
    "electronics_summary": "/api/electronics/summary",
    "bakery_summary": "/api/bakery/summary",
    "furniture_summary": "/api/furniture/summary",
    "vehicles_summary": "/api/vehicles/summary",
    "cosmetics_summary": "/api/cosmetics/summary",
    "re_summary": "/api/realestate/summary",
    "re_benchmarks": "/api/realestate/benchmarks",
    "re_trends": "/api/realestate/trends",
    "re_landprices": "/api/realestate/land-prices",
    "re_stores": "/api/realestate/stores",
}

HERE = os.path.dirname(os.path.abspath(__file__))


def fetch(url, timeout=30, retries=1):
    last_err = None
    for _ in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()
        except Exception as e:  # noqa: BLE001
            last_err = e
            time.sleep(2)
    raise last_err


def parse_food_index(html):
    """Trich chi so gia thuc pham tu trang /chi-so-gia (server-rendered)."""
    out = {"source_page": BASE + "/chi-so-gia"}
    m = re.search(r"Chưa có số liệu mới[^<]*", html)
    if m:
        out["warning"] = m.group(0)
    m = re.search(
        r"Tháng\s+(\d{2}/\d{4})</p><p[^>]*>(\d+,\d+)</p>", html)
    if m:
        out["latest_month"] = m.group(1)
        out["latest_index"] = float(m.group(2).replace(",", "."))
    # bang theo thang: <td>MM/YYYY</td><td>index</td><td>mom</td><td>products</td>
    months = []
    for mm, idx, mom, prod in re.findall(
            r"<td[^>]*>(\d{2}/\d{4})</td><td[^>]*>([\d,]+)</td>"
            r"<td[^>]*>([^<]*)</td><td[^>]*>([\d\.]+|–)</td>", html):
        months.append({
            "month": mm,
            "index": float(idx.replace(",", ".")),
            "mom": mom.strip(),
            "products": None if prod.strip() == "–"
                        else int(prod.replace(".", "")),
        })
    if months:
        out["monthly"] = months
    return out


def supabase_upsert(url, key, endpoint, date, payload):
    """Upsert 1 snapshot vao bang dulieu_snapshots qua REST API."""
    body = json.dumps({
        "endpoint": endpoint,
        "date": date,
        "data": payload,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }).encode("utf-8")
    req = urllib.request.Request(
        url.rstrip("/") + "/rest/v1/dulieu_snapshots",
        data=body, method="POST",
        headers={
            "apikey": key,
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status


def load_dotenv_fallback():
    """Doc them key Supabase tu file .env trong thu muc crawler.

    Thu tu uu tien: bien moi truong > .env.supabase > .env.local.
    .env.local dung ten bien cua app Next.js (NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY) — doc de crawler chay duoc tren HP, noi
    .env.local da co san key, ma khong can copy key di dau.
    Khong in key ra log.
    """
    for fname in (".env.supabase", ".env.local"):
        p = os.path.join(HERE, fname)
        if not os.path.exists(p):
            continue
        try:
            with open(p, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k == "NEXT_PUBLIC_SUPABASE_URL" \
                            and not os.environ.get("SUPABASE_URL"):
                        os.environ["SUPABASE_URL"] = v
                    elif k == "SUPABASE_SERVICE_ROLE_KEY" \
                            and not os.environ.get("SUPABASE_SERVICE_KEY"):
                        os.environ["SUPABASE_SERVICE_KEY"] = v
                    elif k in ("SUPABASE_URL", "SUPABASE_SERVICE_KEY") \
                            and not os.environ.get(k):
                        os.environ[k] = v
        except OSError:
            pass


def main():
    load_dotenv_fallback()
    date = sys.argv[sys.argv.index("--date") + 1] \
        if "--date" in sys.argv else \
        datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")
    # Asia/Ho_Chi_Minh = UTC+7
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d") \
        if "--date" not in sys.argv else date
    outdir = os.path.join(HERE, "data", date)
    os.makedirs(outdir, exist_ok=True)

    sb_url = os.environ.get("SUPABASE_URL", "")
    sb_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    sb_ok = bool(sb_url and sb_key)

    manifest = {"date": date, "started_at": datetime.now(timezone.utc).isoformat(),
                "supabase": sb_ok, "endpoints": {}}
    api_calls = 0
    for name, path in ENDPOINTS.items():
        try:
            status, raw = fetch(BASE + path)
            api_calls += 1
            if status != 200:
                manifest["endpoints"][name] = {
                    "status": "error", "http": status,
                    "error": raw[:200].decode("utf-8", "ignore")}
                print(f"[{name}] HTTP {status}")
                continue
            payload = json.loads(raw.decode("utf-8"))
            with open(os.path.join(outdir, name + ".json"), "w",
                      encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False)
            rows = len(payload.get("data", [])) \
                if isinstance(payload.get("data"), list) else None
            manifest["endpoints"][name] = {
                "status": "ok", "http": 200,
                "bytes": len(raw), "rows": rows}
            print(f"[{name}] OK {len(raw)}B rows={rows}")
            if sb_ok:
                try:
                    supabase_upsert(sb_url, sb_key, name, date, payload)
                except Exception as e:  # noqa: BLE001
                    manifest["endpoints"][name]["supabase_error"] = str(e)
        except Exception as e:  # noqa: BLE001
            manifest["endpoints"][name] = {"status": "error",
                                           "error": str(e)}
            print(f"[{name}] LOI {e}")

    # chi so gia thuc pham: scrape trang /chi-so-gia
    try:
        status, raw = fetch(BASE + "/chi-so-gia")
        html = raw.decode("utf-8", "ignore")
        fi = parse_food_index(html)
        with open(os.path.join(outdir, "food_index.json"), "w",
                  encoding="utf-8") as f:
            json.dump(fi, f, ensure_ascii=False)
        manifest["endpoints"]["food_index"] = {
            "status": "ok", "http": status,
            "latest": fi.get("latest_index"),
            "latest_month": fi.get("latest_month")}
        print(f"[food_index] OK {fi.get('latest_month')} = "
              f"{fi.get('latest_index')}")
        if sb_ok:
            try:
                supabase_upsert(sb_url, sb_key, "food_index", date, fi)
            except Exception as e:  # noqa: BLE001
                manifest["endpoints"]["food_index"]["supabase_error"] = str(e)
    except Exception as e:  # noqa: BLE001
        manifest["endpoints"]["food_index"] = {"status": "error",
                                               "error": str(e)}
        print(f"[food_index] LOI {e}")

    ok = sum(1 for v in manifest["endpoints"].values()
             if v.get("status") == "ok")
    failed = len(manifest["endpoints"]) - ok
    manifest["finished_at"] = datetime.now(timezone.utc).isoformat()
    manifest["ok"] = ok
    manifest["failed"] = failed
    manifest["api_calls_used"] = api_calls
    with open(os.path.join(outdir, "manifest.json"), "w",
              encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"XONG {date}: {ok} ok / {failed} loi, "
          f"api_calls={api_calls}, supabase={'co' if sb_ok else 'khong'}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
