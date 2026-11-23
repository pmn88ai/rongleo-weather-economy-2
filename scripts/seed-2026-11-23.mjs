#!/usr/bin/env node
/**
 * Seed snapshot 23/11/2026 vào bảng public.dulieu_snapshots.
 *
 * Chạy tay 1 lần:
 *   npm run seed
 *   node scripts/seed-2026-11-23.mjs 2026-11-23
 *
 * Key đọc từ .env.local qua process.env — KHÔNG hard-code, KHÔNG in ra log.
 * Script chỉ đọc file trong data/<date>/ và upsert (endpoint, date).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });

const argDate = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
const snapshotDate = argDate || process.env.SEED_DATE || "2026-11-23";
const dataDir = path.join(process.cwd(), "data", snapshotDate);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

class SeedFailure extends Error {}

function fail(message) {
  console.error(`\nSEED THẤT BẠI: ${message}`);
  console.error("Kiểm tra: đã chạy supabase_schema.sql trong SQL Editor của project Supabase chung chưa?");
  throw new SeedFailure(message);
}

async function readManifest() {
  try {
    const raw = await fs.readFile(path.join(dataDir, "manifest.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Seed snapshot: ${snapshotDate}`);
  console.log(`Thư mục: data/${snapshotDate}/`);

  let files;
  try {
    files = await fs.readdir(dataDir);
  } catch {
    fail(`không đọc được thư mục data/${snapshotDate}/`);
  }

  const endpointFiles = files
    .filter((name) => name.endsWith(".json") && name !== "manifest.json")
    .sort();

  if (endpointFiles.length === 0) {
    fail(`không có file JSON endpoint nào trong data/${snapshotDate}/`);
  }

  const manifest = await readManifest();
  const targetDate = manifest?.date || snapshotDate;
  const fetchedAt = manifest?.finished_at || new Date().toISOString();

  const probe = await supabase
    .from("dulieu_snapshots")
    .select("endpoint")
    .limit(1);

  if (probe.error) {
    fail(probe.error.message);
  }

  let ok = 0;
  let failed = 0;

  for (const filename of endpointFiles) {
    const endpoint = filename.replace(/\.json$/i, "");
    const filePath = path.join(dataDir, filename);

    try {
      const raw = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(raw);

      const result = await supabase.from("dulieu_snapshots").upsert(
        {
          endpoint,
          date: targetDate,
          data,
          fetched_at: fetchedAt,
        },
        { onConflict: "endpoint,date" },
      );

      if (result.error) {
        failed += 1;
        console.error(`  ✗ ${endpoint}: ${result.error.message}`);
      } else {
        ok += 1;
        console.log(`  ✓ ${endpoint}`);
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ ${endpoint}: ${message}`);
    }
  }

  const verify = await supabase
    .from("dulieu_snapshots")
    .select("endpoint")
    .eq("date", targetDate);

  if (verify.error) {
    fail(`upsert xong nhưng không đếm được dòng: ${verify.error.message}`);
  }

  const rowCount = (verify.data ?? []).length;

  console.log(`\nKết quả: ${ok} OK, ${failed} lỗi.`);
  console.log(`Supabase hiện có ${rowCount} dòng cho ngày ${targetDate}.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  if (error instanceof SeedFailure) {
    process.exitCode = 1;
    return;
  }
  console.error(`\nSEED THẤT BẠI: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
