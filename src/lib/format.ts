import { asNumber, type JsonValue } from "./types";

const number0 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const number1 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const number2 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function fmtNumber(value: JsonValue | number | null | undefined, digits: 0 | 1 | 2 = 0): string {
  const numeric = typeof value === "number" ? value : asNumber(value as JsonValue | undefined);
  if (numeric === null) return "—";
  if (digits === 2) return number2.format(numeric);
  if (digits === 1) return number1.format(numeric);
  return number0.format(numeric);
}

export function fmtVnd(value: JsonValue | number | null | undefined): string {
  const numeric = typeof value === "number" ? value : asNumber(value as JsonValue | undefined);
  if (numeric === null) return "—";
  return `${number0.format(numeric)} đ`;
}

export function fmtVndCompact(value: JsonValue | number | null | undefined): string {
  const numeric = typeof value === "number" ? value : asNumber(value as JsonValue | undefined);
  if (numeric === null) return "—";
  if (Math.abs(numeric) >= 1_000_000_000) {
    return `${number2.format(numeric / 1_000_000_000)} tỷ`;
  }
  if (Math.abs(numeric) >= 1_000_000) {
    return `${number2.format(numeric / 1_000_000)} triệu`;
  }
  return `${number0.format(numeric)} đ`;
}

export function fmtPrice(value: JsonValue | number | null | undefined, unit?: string | null): string {
  const numeric = typeof value === "number" ? value : asNumber(value as JsonValue | undefined);
  if (numeric === null) return "—";
  if (!unit) return number0.format(numeric);

  const normalized = unit.trim();
  if (normalized === "VND/kg") return `${number0.format(numeric)} đ/kg`;
  if (normalized === "VND/lượng") return `${number0.format(numeric)} đ/lượng`;
  if (normalized === "USD/barrel") return `$${number2.format(numeric)}`;
  if (normalized === "USD/tấn") return `${number2.format(numeric)} USD/tấn`;
  if (normalized === "USc/lb") return `${number2.format(numeric)} USc/lb`;
  return `${number0.format(numeric)} ${normalized}`;
}

export function fmtPercent(value: JsonValue | number | null | undefined): string {
  const numeric = typeof value === "number" ? value : asNumber(value as JsonValue | undefined);
  if (numeric === null) return "—";
  return `${number2.format(numeric)}%`;
}

export function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

export function fmtShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return shortDateFormatter.format(parsed);
}

export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${dateFormatter.format(parsed)} ${new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(parsed)}`;
}

export function fmtRange(low: JsonValue | null | undefined, high: JsonValue | null | undefined, unit?: string | null): string {
  const lo = asNumber(low ?? undefined);
  const hi = asNumber(high ?? undefined);
  if (lo === null && hi === null) return "—";
  const suffix = unit ? ` ${unit}` : "";
  if (lo === null) return `${number2.format(hi as number)}${suffix}`;
  if (hi === null) return `${number2.format(lo)}${suffix}`;
  return `${number2.format(lo)} – ${number2.format(hi)}${suffix}`;
}
