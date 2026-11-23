-- Schema Supabase cho trang Thoi tiet Kinh te 2 cua Leo.
-- Chay trong SQL Editor cua project Supabase CHUNG voi rongleo-weather-economy
-- (Leo dung chung Supabase thoi tiet kinh te, khong tao project moi).
-- Leo tu chay file nay, key khong qua chat, khong qua Muse.
--
-- KIEM TRA TRUNG BANG (23/11/2026, doc 10 migration cua rongleo-weather-economy):
--   Bang cu: ai_outputs, articles, asset_map_snapshots, daily_briefs, events,
--   indicator_manual_entries, ingestion_logs, market_analyses, market_data,
--   market_prices, market_snapshots, pipeline_runs (12 bang).
--   Bang moi: dulieu_snapshots, dulieu_crawl_runs — KHONG trung ten nao.
--   market_prices (row-per-metric) va market_snapshots (MasterSnapshot dong cung)
--   la cua pipeline cu, KHONG dung — dulieu_snapshots luu JSON goc tu dulieu.dev.
--
-- Quy uoc theo project cu: RLS DISABLE (app ca nhan, service_role key),
-- giong market_snapshots (migration 010).

-- 1. Bang snapshot: 1 dong = 1 endpoint x 1 ngay, data = JSON goc tu dulieu.dev
create table if not exists public.dulieu_snapshots (
  endpoint text not null,
  date date not null,
  data jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (endpoint, date)
);

-- 2. Bang log moi luot chay crawler
create table if not exists public.dulieu_crawl_runs (
  id bigint generated always as identity primary key,
  run_date date not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  endpoints_ok int,
  endpoints_failed int,
  api_calls_used int,
  errors jsonb
);

-- App ca nhan, service_role key — nhat quan cac bang khac (market_snapshots).
alter table public.dulieu_snapshots disable row level security;
alter table public.dulieu_crawl_runs disable row level security;

-- VERIFY (chay sau khi tao bang, bao lai 4 so cho Muse):
--   select count(*) from public.dulieu_snapshots;  -- ky vong 0
--   select count(*) from public.dulieu_crawl_runs; -- ky vong 0
--   select tablename from pg_tables
--     where schemaname='public' and tablename like 'dulieu%'; -- ky vong 2 dong
