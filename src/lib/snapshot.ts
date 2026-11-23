import { promises as fs } from "node:fs";
import path from "node:path";
import { supabaseReadClient } from "./supabase";
import type { CrawlRunMeta, JsonValue, SnapshotBundle } from "./types";

export const ENDPOINTS = [
  "exchange",
  "interest",
  "gold",
  "silver",
  "fuel",
  "coffee",
  "rice",
  "pepper",
  "oil",
  "commodities",
  "indicators",
  "re_summary",
  "re_benchmarks",
  "re_trends",
  "re_landprices",
  "groceries_summary",
  "mombaby_summary",
  "food_index",
  "drugs_summary",
  "electronics_summary",
  "bakery_summary",
  "furniture_summary",
  "vehicles_summary",
  "cosmetics_summary",
] as const;

export type Endpoint = (typeof ENDPOINTS)[number];

interface SnapshotRow {
  endpoint: string;
  date: string;
  data: JsonValue;
}

interface CrawlRunRow {
  run_date: string;
  endpoints_ok: number | null;
  endpoints_failed: number | null;
  finished_at: string | null;
}

function normalizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Could not find the table") || message.includes("PGRST205")) {
    return "Supabase chưa có bảng dulieu_snapshots (cần chạy supabase_schema.sql trong SQL Editor)";
  }
  return message;
}

async function loadFromSupabase(): Promise<SnapshotBundle> {
  const client = supabaseReadClient();

  const latest = await client
    .from("dulieu_snapshots")
    .select("date")
    .order("date", { ascending: false })
    .limit(1);

  if (latest.error) throw new Error(latest.error.message);

  const latestRows = (latest.data ?? []) as unknown as { date: string }[];
  const date = latestRows[0]?.date;
  if (!date) throw new Error("Supabase chưa có dòng nào trong dulieu_snapshots");

  const result = await client
    .from("dulieu_snapshots")
    .select("endpoint,date,data")
    .eq("date", date);

  if (result.error) throw new Error(result.error.message);

  const rows: Record<string, JsonValue> = {};
  for (const row of (result.data ?? []) as unknown as SnapshotRow[]) {
    rows[row.endpoint] = row.data;
  }

  let crawlRun: CrawlRunMeta | null = null;
  const runResult = await client
    .from("dulieu_crawl_runs")
    .select("run_date,endpoints_ok,endpoints_failed,finished_at")
    .order("started_at", { ascending: false })
    .limit(1);

  if (!runResult.error) {
    const runRows = (runResult.data ?? []) as unknown as CrawlRunRow[];
    const run = runRows[0];
    if (run) {
      crawlRun = {
        runDate: run.run_date,
        endpointsOk: run.endpoints_ok,
        endpointsFailed: run.endpoints_failed,
        finishedAt: run.finished_at,
      };
    }
  }

  return { date, rows, source: "supabase", warning: null, crawlRun };
}

async function loadFromLocal(): Promise<SnapshotBundle> {
  const dataRoot = path.join(process.cwd(), "data");
  let entries: string[] = [];

  try {
    entries = await fs.readdir(dataRoot);
  } catch {
    return {
      date: "",
      rows: {},
      source: "local",
      warning: "Không đọc được Supabase và cũng không có thư mục data/ để dự phòng.",
      crawlRun: null,
    };
  }

  const dates = entries
    .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort((a, b) => (a < b ? 1 : -1));

  const date = dates[0];
  if (!date) {
    return {
      date: "",
      rows: {},
      source: "local",
      warning: "Supabase chưa có dữ liệu và thư mục data/ chưa có snapshot ngày nào.",
      crawlRun: null,
    };
  }

  const rows: Record<string, JsonValue> = {};
  for (const endpoint of ENDPOINTS) {
    try {
      const raw = await fs.readFile(path.join(dataRoot, date, `${endpoint}.json`), "utf8");
      rows[endpoint] = JSON.parse(raw) as JsonValue;
    } catch {
      // Endpoint không có file trong ngày này — section sẽ tự báo "chưa có dữ liệu".
    }
  }

  return {
    date,
    rows,
    source: "local",
    warning: null,
    crawlRun: null,
  };
}

export async function loadLatestSnapshot(): Promise<SnapshotBundle> {
  try {
    return await loadFromSupabase();
  } catch (error) {
    const local = await loadFromLocal();
    const reason = normalizeError(error);
    return {
      ...local,
      warning: local.date
        ? `${reason}. Trang đang hiển thị snapshot local ngày ${local.date} (dữ liệu thật từ dulieu.dev).`
        : `${reason}. Chưa có snapshot local để hiển thị.`,
    };
  }
}
