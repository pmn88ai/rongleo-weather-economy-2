export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export function asObject(value: JsonValue | undefined): JsonObject | null {
  if (value === null || value === undefined || Array.isArray(value) || typeof value !== "object") {
    return null;
  }
  return value;
}

export function asArray(value: JsonValue | undefined): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: JsonValue | undefined): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

export function asNumber(value: JsonValue | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export interface CrawlRunMeta {
  runDate: string;
  endpointsOk: number | null;
  endpointsFailed: number | null;
  finishedAt: string | null;
}

export interface SnapshotBundle {
  date: string;
  rows: Record<string, JsonValue>;
  source: "supabase" | "local";
  warning: string | null;
  crawlRun: CrawlRunMeta | null;
}
