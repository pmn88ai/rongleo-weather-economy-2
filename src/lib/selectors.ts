import {
  asArray,
  asNumber,
  asObject,
  asString,
  type JsonObject,
  type JsonValue,
  type SnapshotBundle,
} from "./types";

export function endpointObject(bundle: SnapshotBundle, endpoint: string): JsonObject | null {
  return asObject(bundle.rows[endpoint]);
}

export function endpointItems(bundle: SnapshotBundle, endpoint: string): JsonObject[] {
  const wrapper = endpointObject(bundle, endpoint);
  if (!wrapper) return [];
  const items = asArray(wrapper.data);
  return items
    .map((item) => asObject(item))
    .filter((item): item is JsonObject => item !== null);
}

export function fieldString(row: JsonObject, key: string): string {
  return asString(row[key]) ?? "";
}

export function fieldNumber(row: JsonObject, key: string): number | null {
  return asNumber(row[key]);
}

function priorityIndex(value: string, order: string[]): number {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
}

function dedupeBy(rows: JsonObject[], keyOf: (row: JsonObject) => string): JsonObject[] {
  const seen = new Set<string>();
  const result: JsonObject[] = [];
  for (const row of rows) {
    const key = keyOf(row);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result;
}

const CURRENCY_ORDER = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "CNY",
  "KRW",
  "THB",
  "HKD",
  "CHF",
  "NZD",
  "MYR",
];

export function exchangeRows(bundle: SnapshotBundle): JsonObject[] {
  const all = endpointItems(bundle, "exchange");
  const vcb = all.filter((row) => fieldString(row, "source") === "vietcombank.com.vn");
  const pool = vcb.length > 0 ? vcb : all;
  const sorted = [...pool].sort(
    (a, b) =>
      priorityIndex(fieldString(a, "currency"), CURRENCY_ORDER) -
      priorityIndex(fieldString(b, "currency"), CURRENCY_ORDER),
  );
  return dedupeBy(sorted, (row) => fieldString(row, "currency")).slice(0, 14);
}

export const MAJOR_BANKS = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "MB",
  "ACB",
  "VPBank",
  "Sacombank",
  "TPBank",
  "VIB",
  "SHB",
  "HDBank",
  "MSB",
  "ABBANK",
];

const INTEREST_TERMS = [1, 3, 6, 12, 24];

export function interestRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "interest");
  const byBank = new Map<string, Map<number, number>>();

  for (const row of items) {
    const bank = fieldString(row, "bank");
    const term = fieldNumber(row, "term_months");
    const rate = fieldNumber(row, "deposit_rate");
    if (!bank || term === null || rate === null) continue;
    if (!byBank.has(bank)) byBank.set(bank, new Map());
    const terms = byBank.get(bank);
    if (terms && !terms.has(term)) terms.set(term, rate);
  }

  const banks = [...byBank.keys()].sort((a, b) => {
    const diff = priorityIndex(a, MAJOR_BANKS) - priorityIndex(b, MAJOR_BANKS);
    return diff !== 0 ? diff : a.localeCompare(b, "vi");
  });

  return banks.slice(0, 16).map((bank) => {
    const terms = byBank.get(bank) ?? new Map<number, number>();
    const row: JsonObject = { bank };
    for (const term of INTEREST_TERMS) {
      row[`m${term}`] = terms.get(term) ?? null;
    }
    return row;
  });
}

export function interestTerms(): number[] {
  return INTEREST_TERMS;
}

const GOLD_SOURCE_ORDER = ["giavang.doji.vn", "sjc.com.vn", "webgia.com", "cafef.vn"];

export function metalRows(bundle: SnapshotBundle, endpoint: "gold" | "silver"): JsonObject[] {
  const items = endpointItems(bundle, endpoint);
  const sorted = [...items].sort(
    (a, b) =>
      priorityIndex(fieldString(a, "source"), GOLD_SOURCE_ORDER) -
      priorityIndex(fieldString(b, "source"), GOLD_SOURCE_ORDER),
  );
  return dedupeBy(sorted, (row) => `${fieldString(row, "type")}|${fieldString(row, "source")}`).slice(0, 16);
}

export function fuelRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "fuel");
  const sorted = [...items].sort((a, b) => fieldString(a, "fuel_type").localeCompare(fieldString(b, "fuel_type"), "vi"));
  return dedupeBy(sorted, (row) => `${fieldString(row, "fuel_type")}|${fieldString(row, "zone")}`).slice(0, 16);
}

export function coffeeRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "coffee");
  const domestic = items
    .filter((row) => fieldString(row, "type") === "domestic")
    .sort((a, b) => fieldString(a, "region").localeCompare(fieldString(b, "region"), "vi"));
  const world = items
    .filter((row) => fieldString(row, "type") !== "domestic")
    .sort((a, b) => fieldString(a, "type").localeCompare(fieldString(b, "type"), "vi"));

  const merged = [
    ...dedupeBy(domestic, (row) => fieldString(row, "region")),
    ...dedupeBy(world, (row) => `${fieldString(row, "type")}|${fieldString(row, "region")}`),
  ];

  return merged.slice(0, 16);
}

export function riceRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "rice");
  return dedupeBy(
    [...items].sort((a, b) => {
      const market = fieldString(a, "market").localeCompare(fieldString(b, "market"));
      return market !== 0 ? market : fieldString(a, "product").localeCompare(fieldString(b, "product"), "vi");
    }),
    (row) => `${fieldString(row, "market")}|${fieldString(row, "product")}|${fieldString(row, "country")}`,
  ).slice(0, 18);
}

export function pepperRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "pepper");
  const domestic = items
    .filter((row) => fieldString(row, "type") === "domestic")
    .sort((a, b) => fieldString(a, "region").localeCompare(fieldString(b, "region"), "vi"));
  const world = items.filter((row) => fieldString(row, "type") !== "domestic");
  return [
    ...dedupeBy(domestic, (row) => fieldString(row, "region")),
    ...dedupeBy(world, (row) => `${fieldString(row, "type")}|${fieldString(row, "region")}`),
  ].slice(0, 16);
}

export function oilRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "oil");
  return dedupeBy(items, (row) => fieldString(row, "symbol") || fieldString(row, "name")).slice(0, 12);
}

export function commodityRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "commodities");
  return dedupeBy(items, (row) => fieldString(row, "name") || fieldString(row, "symbol")).slice(0, 18);
}

export function indicatorRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "indicators");
  const latest = new Map<string, JsonObject>();

  for (const row of items) {
    const indicator = fieldString(row, "indicator");
    if (!indicator) continue;
    const period = fieldString(row, "period");
    const existing = latest.get(indicator);
    if (!existing || period > fieldString(existing, "period")) {
      latest.set(indicator, row);
    }
  }

  return [...latest.values()].sort((a, b) =>
    fieldString(a, "indicator").localeCompare(fieldString(b, "indicator"), "vi"),
  );
}

const PROVINCE_NAMES: Record<string, string> = {
  "ho-chi-minh": "TP. Hồ Chí Minh",
  "ha-noi": "Hà Nội",
  "ba-ria-vung-tau": "Bà Rịa - Vũng Tàu",
  "thua-thien-hue": "Thừa Thiên Huế",
  "da-nang": "Đà Nẵng",
  "hai-phong": "Hải Phòng",
  "can-tho": "Cần Thơ",
  "dak-lak": "Đắk Lắk",
  "dac-lak": "Đắk Lắk",
  "gia-lai": "Gia Lai",
  "lam-dong": "Lâm Đồng",
  "khanh-hoa": "Khánh Hòa",
  "quang-ninh": "Quảng Ninh",
  "binh-duong": "Bình Dương",
  "dong-nai": "Đồng Nai",
  "long-an": "Long An",
  "tay-ninh": "Tây Ninh",
  "ben-tre": "Bến Tre",
  "an-giang": "An Giang",
  "kien-giang": "Kiên Giang",
  "ca-mau": "Cà Mau",
  "soc-trang": "Sóc Trăng",
  "tra-vinh": "Trà Vinh",
  "vinh-long": "Vĩnh Long",
  "dong-thap": "Đồng Tháp",
  "hau-giang": "Hậu Giang",
  "bac-lieu": "Bạc Liêu",
  "quang-nam": "Quảng Nam",
  "quang-ngai": "Quảng Ngãi",
  "binh-dinh": "Bình Định",
  "phu-yen": "Phú Yên",
  "ninh-thuan": "Ninh Thuận",
  "binh-thuan": "Bình Thuận",
  "nghe-an": "Nghệ An",
  "thanh-hoa": "Thanh Hóa",
  "quang-binh": "Quảng Bình",
  "quang-tri": "Quảng Trị",
  "ha-tinh": "Hà Tĩnh",
  "nam-dinh": "Nam Định",
  "thai-binh": "Thái Bình",
  "hai-duong": "Hải Dương",
  "bac-ninh": "Bắc Ninh",
  "hung-yen": "Hưng Yên",
  "vinh-phuc": "Vĩnh Phúc",
  "thai-nguyen": "Thái Nguyên",
  "phu-tho": "Phú Thọ",
  "lao-cai": "Lào Cai",
  "yen-bai": "Yên Bái",
  "son-la": "Sơn La",
  "hoa-binh": "Hòa Bình",
  "lang-son": "Lạng Sơn",
  "cao-bang": "Cao Bằng",
  "quang-nga": "Quảng Ngãi",
  "ha-giang": "Hà Giang",
  "tuyen-quang": "Tuyên Quang",
  "bac-kan": "Bắc Kạn",
  "lai-chau": "Lai Châu",
  "dien-bien": "Điện Biên",
  "kon-tum": "Kon Tum",
  "dak-nong": "Đắk Nông",
  "dac-nong": "Đắk Nông",
  "ba-rịa-vung-tau": "Bà Rịa - Vũng Tàu",
};

export function titleFromSlug(slug: string): string {
  if (!slug) return "—";
  const known = PROVINCE_NAMES[slug];
  if (known) return known;
  return slug
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

const SEGMENT_NAMES: Record<string, string> = {
  "nha-rieng": "Nhà riêng",
  "chung-cu": "Chung cư",
  "dat": "Đất",
  "nha-mat-pho": "Nhà mặt phố",
  "biet-thu": "Biệt thự",
  "nha-pho": "Nhà phố",
};

export function segmentName(value: string): string {
  return SEGMENT_NAMES[value] ?? titleFromSlug(value);
}

export function realEstateSummaryRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "re_summary");
  const filtered = items
    .filter((row) => fieldString(row, "transaction") === "ban")
    .sort((a, b) => (fieldNumber(b, "listings") ?? 0) - (fieldNumber(a, "listings") ?? 0));
  return dedupeBy(filtered, (row) => `${fieldString(row, "province")}|${fieldString(row, "property_type")}`).slice(0, 18);
}

export function realEstateBenchmarkRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "re_benchmarks");
  return [...items]
    .sort((a, b) => (fieldNumber(b, "listings") ?? 0) - (fieldNumber(a, "listings") ?? 0))
    .slice(0, 18);
}

export interface TrendPoint {
  date: string;
  medianPricePerM2: number | null;
  listings: number | null;
}

export function realEstateTrendRows(bundle: SnapshotBundle): JsonObject[] {
  return [...endpointItems(bundle, "re_trends")].sort((a, b) =>
    fieldString(a, "date").localeCompare(fieldString(b, "date")),
  );
}

export function realEstateTrendPoints(bundle: SnapshotBundle): TrendPoint[] {
  return realEstateTrendRows(bundle).map((row) => ({
    date: fieldString(row, "date"),
    medianPricePerM2: fieldNumber(row, "median_price_per_m2"),
    listings: fieldNumber(row, "listings"),
  }));
}

export function realEstateLandPriceRows(bundle: SnapshotBundle): JsonObject[] {
  const items = endpointItems(bundle, "re_landprices").filter((row) => fieldNumber(row, "price_vt1") !== null);
  return [...items]
    .sort((a, b) => {
      const province = fieldString(a, "province_name").localeCompare(fieldString(b, "province_name"), "vi");
      return province !== 0 ? province : fieldString(a, "ward").localeCompare(fieldString(b, "ward"), "vi");
    })
    .slice(0, 18);
}

export function foodIndex(bundle: SnapshotBundle): JsonObject | null {
  return endpointObject(bundle, "food_index");
}

export function jsonValueToText(value: JsonValue | undefined): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
