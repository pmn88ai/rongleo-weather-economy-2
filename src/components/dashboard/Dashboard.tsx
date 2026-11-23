import type { ReactNode } from "react";
import {
  Baby,
  BadgeDollarSign,
  Cake,
  Car,
  Coins,
  Fuel,
  Gauge,
  Gem,
  HeartPulse,
  LineChart,
  Map as MapIcon,
  Smartphone,
  Sofa,
  Sparkles,
  ShoppingBasket,
  Utensils,
  Wheat,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ResponsiveTable, type TableColumn } from "@/components/ui/ResponsiveTable";
import { TrendChart } from "@/components/ui/TrendChart";
import {
  commodityRows,
  coffeeRows,
  endpointItems,
  exchangeRows,
  fieldString,
  foodIndex,
  fuelRows,
  indicatorRows,
  interestRows,
  interestTerms,
  metalRows,
  oilRows,
  pepperRows,
  realEstateBenchmarkRows,
  realEstateLandPriceRows,
  realEstateSummaryRows,
  realEstateTrendPoints,
  realEstateTrendRows,
  riceRows,
  segmentName,
  titleFromSlug,
} from "@/lib/selectors";
import { asNumber, asString, type JsonObject, type SnapshotBundle } from "@/lib/types";
import {
  fmtDate,
  fmtDateTime,
  fmtNumber,
  fmtPercent,
  fmtPrice,
  fmtShortDate,
  fmtVnd,
  fmtVndCompact,
} from "@/lib/format";
import { ENDPOINTS } from "@/lib/snapshot";

function text(row: JsonObject, key: string): string {
  const value = asString(row[key]);
  return value && value.trim() !== "" ? value : "—";
}

function vnd(value: JsonObject[string]): string {
  return fmtVnd(asNumber(value));
}

function countOf(snapshot: SnapshotBundle, endpoint: string): number {
  if (endpoint === "food_index") return foodIndex(snapshot) ? 1 : 0;
  return endpointItems(snapshot, endpoint).length;
}

function Group({ id, eyebrow, children }: { id: string; eyebrow: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 space-y-4 md:scroll-mt-6">
      <p className="px-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "var(--app-accent)" }}>
        {eyebrow}
      </p>
      {children}
    </div>
  );
}

function QuickStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div
      className="min-w-0 rounded-xl border p-2.5 sm:p-3"
      style={{ borderColor: "var(--app-border)", background: "var(--app-surface-2)" }}
    >
      <p className="truncate text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--app-muted)" }}>
        {label}
      </p>
      <p className="mt-0.5 break-words text-[16px] font-bold leading-snug tabular-nums sm:text-lg">{value}</p>
      <p className="mt-0.5 truncate text-[10.5px]" style={{ color: "var(--app-muted)" }}>
        {hint}
      </p>
    </div>
  );
}

function Hero({ snapshot }: { snapshot: SnapshotBundle }) {
  const availableCount = ENDPOINTS.filter((endpoint) => countOf(snapshot, endpoint) > 0).length;

  const usd = exchangeRows(snapshot).find((row) => fieldString(row, "currency") === "USD");
  const gold = metalRows(snapshot, "gold")[0];
  const fuel = fuelRows(snapshot).find((row) => fieldString(row, "fuel_type").toLowerCase().includes("ron 95")) ??
    fuelRows(snapshot)[0];
  const cpi = indicatorRows(snapshot).find((row) => fieldString(row, "indicator") === "CPI");
  const crawlRun = snapshot.crawlRun;

  return (
    <div
      id="tong-quan"
      className="scroll-mt-20 overflow-hidden rounded-2xl border md:scroll-mt-6"
      style={{ background: "var(--app-surface)", borderColor: "var(--app-border)", boxShadow: "var(--app-shadow)" }}
    >
      <div
        className="border-b p-4 sm:p-6"
        style={{
          borderColor: "var(--app-border)",
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--app-accent-soft) 70%, transparent), transparent 65%)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide"
            style={{ background: "var(--app-accent)", color: "var(--app-surface)" }}
          >
            {snapshot.source === "supabase" ? "Supabase · live" : "Snapshot local"}
          </span>
          <span className="text-[11px] font-medium" style={{ color: "var(--app-muted)" }}>
            Nguồn dulieu.dev · dữ liệu ngày {snapshot.date ? fmtDate(snapshot.date) : "—"}
          </span>
        </div>
        <h1 className="mt-2.5 text-[26px] font-black leading-tight tracking-tight sm:text-4xl">
          Thời tiết Kinh tế 2
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed sm:text-sm" style={{ color: "var(--app-muted)" }}>
          Bảng giá RongLeo: tỷ giá, lãi suất, vàng bạc, nhiên liệu, nông sản, hàng hóa, bất động sản và giá tiêu dùng —
          đọc trực tiếp từ snapshot của{" "}
          <a href="https://dulieu.dev" target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2" style={{ color: "var(--app-accent)" }}>
            dulieu.dev
          </a>
          .
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {snapshot.warning && (
          <div
            className="mb-4 rounded-xl border px-3.5 py-3 text-[12.5px] leading-relaxed"
            style={{
              borderColor: "color-mix(in srgb, var(--app-gold) 55%, var(--app-border))",
              background: "color-mix(in srgb, var(--app-gold) 10%, var(--app-surface))",
            }}
          >
            <span className="font-bold">Lưu ý kết nối: </span>
            {snapshot.warning}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <QuickStat
            label="USD bán"
            value={usd ? vnd(usd.sell) : "—"}
            hint={usd ? `${text(usd, "bank")} · ${snapshot.date ? fmtShortDate(snapshot.date) : ""}` : "chưa có dữ liệu"}
          />
          <QuickStat
            label="Vàng bán"
            value={gold ? fmtPrice(asNumber(gold.sell_price), asString(gold.unit)) : "—"}
            hint={gold ? text(gold, "source") : "chưa có dữ liệu"}
          />
          <QuickStat
            label="Xăng RON 95"
            value={fuel ? vnd(fuel.price) : "—"}
            hint={fuel ? text(fuel, "source") : "chưa có dữ liệu"}
          />
          <QuickStat
            label="CPI"
            value={cpi ? fmtNumber(asNumber(cpi.value), 2) : "—"}
            hint={cpi ? `Kỳ ${text(cpi, "period")}` : "chưa có dữ liệu"}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]" style={{ color: "var(--app-muted)" }}>
          <span>
            <b style={{ color: "var(--app-text)" }}>{availableCount}/{ENDPOINTS.length}</b> mục có dữ liệu
          </span>
          <span>Ngày snapshot: {snapshot.date ? fmtDate(snapshot.date) : "—"}</span>
          {crawlRun?.finishedAt && <span>Lượt crawl xong: {fmtDateTime(crawlRun.finishedAt)}</span>}
          {crawlRun && (
            <span>
              Crawl: {crawlRun.endpointsOk ?? "?"} OK · {crawlRun.endpointsFailed ?? "?"} lỗi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ snapshot }: { snapshot: SnapshotBundle }) {
  const exchange = exchangeRows(snapshot);
  const interest = interestRows(snapshot);
  const terms = interestTerms();
  const gold = metalRows(snapshot, "gold");
  const silver = metalRows(snapshot, "silver");
  const fuel = fuelRows(snapshot);
  const coffee = coffeeRows(snapshot);
  const rice = riceRows(snapshot);
  const pepper = pepperRows(snapshot);
  const oil = oilRows(snapshot);
  const commodities = commodityRows(snapshot);
  const indicators = indicatorRows(snapshot);
  const reSummary = realEstateSummaryRows(snapshot);
  const reBenchmarks = realEstateBenchmarkRows(snapshot);
  const reTrends = realEstateTrendPoints(snapshot);
  const reTrendRows = realEstateTrendRows(snapshot);
  const reLandPrices = realEstateLandPriceRows(snapshot);
  const groceries = endpointItems(snapshot, "groceries_summary");
  const mombaby = endpointItems(snapshot, "mombaby_summary");
  const index = foodIndex(snapshot);
  const drugs = endpointItems(snapshot, "drugs_summary");
  const electronics = endpointItems(snapshot, "electronics_summary");
  const bakery = endpointItems(snapshot, "bakery_summary");
  const furniture = endpointItems(snapshot, "furniture_summary");
  const vehicles = endpointItems(snapshot, "vehicles_summary");
  const cosmetics = endpointItems(snapshot, "cosmetics_summary");

  const exchangeColumns: TableColumn[] = [
    { key: "currency", label: "Ngoại tệ", primary: true, render: (row) => text(row, "currency") },
    { key: "bank", label: "Nguồn", render: (row) => text(row, "bank") },
    { key: "buy", label: "Mua", align: "right", render: (row) => vnd(row.buy) },
    { key: "transfer", label: "Chuyển khoản", align: "right", render: (row) => vnd(row.transfer) },
    { key: "sell", label: "Bán", align: "right", render: (row) => vnd(row.sell) },
  ];

  const interestColumns: TableColumn[] = [
    { key: "bank", label: "Ngân hàng", primary: true, render: (row) => text(row, "bank") },
    ...terms.map<TableColumn>((term) => ({
      key: `m${term}`,
      label: term === 12 ? "12 tháng" : `${term} th.`,
      align: "right",
      render: (row) => fmtPercent(asNumber(row[`m${term}`])),
    })),
  ];

  const metalColumns: TableColumn[] = [
    { key: "type", label: "Loại", primary: true, render: (row) => text(row, "type") },
    { key: "buy", label: "Giá mua", align: "right", render: (row) => fmtPrice(asNumber(row.buy_price), asString(row.unit)) },
    { key: "sell", label: "Giá bán", align: "right", render: (row) => fmtPrice(asNumber(row.sell_price), asString(row.unit)) },
    { key: "source", label: "Nguồn", render: (row) => text(row, "source") },
  ];

  const fuelColumns: TableColumn[] = [
    { key: "fuel_type", label: "Loại nhiên liệu", primary: true, render: (row) => text(row, "fuel_type") },
    { key: "zone", label: "Vùng", render: (row) => text(row, "zone") },
    { key: "price", label: "Giá", align: "right", render: (row) => vnd(row.price) },
    { key: "source", label: "Nguồn", render: (row) => text(row, "source") },
  ];

  const coffeeColumns: TableColumn[] = [
    { key: "region", label: "Khu vực / loại", primary: true, render: (row) => text(row, "region") !== "—" ? text(row, "region") : text(row, "type") },
    { key: "type", label: "Nhóm", render: (row) => (fieldString(row, "type") === "domestic" ? "Trong nước" : text(row, "type")) },
    { key: "price", label: "Giá", align: "right", render: (row) => fmtPrice(asNumber(row.price), asString(row.unit)) },
    { key: "source", label: "Nguồn", render: (row) => text(row, "source") },
  ];

  const riceColumns: TableColumn[] = [
    { key: "product", label: "Sản phẩm", primary: true, render: (row) => text(row, "product") },
    { key: "market", label: "Thị trường", render: (row) => (fieldString(row, "market") === "export" ? "Xuất khẩu" : "Trong nước") },
    { key: "country", label: "Nơi đến", render: (row) => text(row, "country") },
    { key: "price", label: "Giá thấp – cao", align: "right", render: (row) => {
      const low = asNumber(row.low);
      const high = asNumber(row.high);
      if (low === null && high === null) return "—";
      return `${fmtNumber(low, 2)} – ${fmtNumber(high, 2)} ${asString(row.unit) ?? ""}`.trim();
    } },
    { key: "date", label: "Kỳ dữ liệu", render: (row) => fmtDate(asString(row.date)) },
  ];

  const pepperColumns: TableColumn[] = [
    { key: "region", label: "Khu vực / loại", primary: true, render: (row) => text(row, "region") !== "—" ? text(row, "region") : text(row, "type") },
    { key: "type", label: "Nhóm", render: (row) => (fieldString(row, "type") === "domestic" ? "Trong nước" : text(row, "type")) },
    { key: "price", label: "Giá", align: "right", render: (row) => fmtPrice(asNumber(row.price), asString(row.unit)) },
    { key: "change", label: "Thay đổi", align: "right", render: (row) => fmtNumber(asNumber(row.change), 0) },
    { key: "source", label: "Nguồn", render: (row) => text(row, "source") },
  ];

  const oilColumns: TableColumn[] = [
    { key: "symbol", label: "Mã", primary: true, render: (row) => text(row, "symbol") },
    { key: "name", label: "Tên", render: (row) => text(row, "name") },
    { key: "price", label: "Giá", align: "right", render: (row) => fmtPrice(asNumber(row.price), asString(row.unit)) },
    { key: "high", label: "Cao", align: "right", render: (row) => fmtPrice(asNumber(row.high_price), asString(row.unit)) },
    { key: "low", label: "Thấp", align: "right", render: (row) => fmtPrice(asNumber(row.low_price), asString(row.unit)) },
  ];

  const commodityColumns: TableColumn[] = [
    { key: "name", label: "Hàng hóa", primary: true, render: (row) => text(row, "name") },
    { key: "symbol", label: "Mã", render: (row) => text(row, "symbol") },
    { key: "price", label: "Giá", align: "right", render: (row) => fmtPrice(asNumber(row.price), asString(row.unit)) },
    { key: "source", label: "Nguồn", render: (row) => text(row, "source") },
  ];

  const indicatorColumns: TableColumn[] = [
    { key: "indicator", label: "Chỉ số", primary: true, render: (row) => text(row, "indicator") },
    { key: "period", label: "Kỳ", render: (row) => text(row, "period") },
    { key: "value", label: "Giá trị", align: "right", render: (row) => fmtNumber(asNumber(row.value), 2) },
    { key: "yoy", label: "YoY", align: "right", render: (row) => (asNumber(row.yoy_change) === null ? "—" : fmtNumber(asNumber(row.yoy_change), 2)) },
    { key: "source", label: "Nguồn", render: (row) => text(row, "source") },
  ];

  const reSummaryColumns: TableColumn[] = [
    { key: "province", label: "Tỉnh / thành", primary: true, render: (row) => titleFromSlug(fieldString(row, "province")) },
    { key: "type", label: "Loại BĐS", render: (row) => text(row, "type_name") },
    { key: "listings", label: "Tin đăng", align: "right", render: (row) => fmtNumber(asNumber(row.listings)) },
    { key: "median", label: "Giá trung vị", align: "right", render: (row) => fmtVndCompact(asNumber(row.median_price)) },
    { key: "median_m2", label: "Trung vị /m²", align: "right", render: (row) => `${fmtVndCompact(asNumber(row.median_price_per_m2))}/m²` },
    { key: "area", label: "Diện tích TB", align: "right", render: (row) => `${fmtNumber(asNumber(row.avg_area))} m²` },
  ];

  const reBenchmarkColumns: TableColumn[] = [
    { key: "district", label: "Quận / huyện", primary: true, render: (row) => text(row, "district") },
    { key: "province", label: "Tỉnh / thành", render: (row) => titleFromSlug(fieldString(row, "province")) },
    { key: "segment", label: "Phân khúc", render: (row) => segmentName(fieldString(row, "segment")) },
    { key: "listings", label: "Tin", align: "right", render: (row) => fmtNumber(asNumber(row.listings)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVndCompact(asNumber(row.avg_price_value)) },
    { key: "avg_m2", label: "TB /m²", align: "right", render: (row) => (asNumber(row.avg_price_per_m2) === null ? "—" : `${fmtVndCompact(asNumber(row.avg_price_per_m2))}/m²`) },
    { key: "date", label: "Ngày", render: (row) => fmtDate(asString(row.date)) },
  ];

  const reTrendColumns: TableColumn[] = [
    { key: "date", label: "Ngày", primary: true, render: (row) => fmtDate(asString(row.date)) },
    { key: "listings", label: "Tin đăng", align: "right", render: (row) => fmtNumber(asNumber(row.listings)) },
    { key: "median_m2", label: "Trung vị /m²", align: "right", render: (row) => `${fmtVndCompact(asNumber(row.median_price_per_m2))}/m²` },
  ];

  const landPriceColumns: TableColumn[] = [
    { key: "province", label: "Tỉnh / thành", primary: true, render: (row) => text(row, "province_name") },
    { key: "ward", label: "Khu vực", render: (row) => text(row, "ward") },
    { key: "land_type", label: "Loại đất", render: (row) => text(row, "land_type") },
    { key: "vt1", label: "Vị trí 1", align: "right", render: (row) => fmtVndCompact(asNumber(row.price_vt1)) },
    { key: "vt2", label: "Vị trí 2", align: "right", render: (row) => fmtVndCompact(asNumber(row.price_vt2)) },
    { key: "vt3", label: "Vị trí 3", align: "right", render: (row) => fmtVndCompact(asNumber(row.price_vt3)) },
    { key: "vt4", label: "Vị trí 4", align: "right", render: (row) => fmtVndCompact(asNumber(row.price_vt4)) },
  ];

  const groceryColumns: TableColumn[] = [
    { key: "category", label: "Nhóm hàng", primary: true, render: (row) => text(row, "category") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price)) },
    { key: "unit", label: "Giá TB/đơn vị", align: "right", render: (row) => `${fmtVnd(asNumber(row.avg_unit_price))}${asString(row.unit_price_unit) ?? ""}` },
    { key: "stores", label: "Siêu thị", align: "right", render: (row) => fmtNumber(asNumber(row.stores)) },
  ];

  const mombabyColumns: TableColumn[] = [
    { key: "category", label: "Nhóm hàng", primary: true, render: (row) => text(row, "category") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price)) },
    { key: "unit", label: "Giá TB/đơn vị", align: "right", render: (row) => `${fmtVnd(asNumber(row.avg_unit_price))}${asString(row.unit_price_unit) ?? ""}` },
    { key: "stores", label: "Cửa hàng", align: "right", render: (row) => fmtNumber(asNumber(row.stores)) },
  ];

  const drugsColumns: TableColumn[] = [
    { key: "category", label: "Nhóm", primary: true, render: (row) => text(row, "category") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price)) },
    { key: "drugs", label: "Là thuốc", align: "right", render: (row) => fmtNumber(asNumber(row.drugs)) },
    { key: "prescription", label: "Kê đơn", align: "right", render: (row) => fmtNumber(asNumber(row.prescription)) },
    { key: "stores", label: "Nhà thuốc", align: "right", render: (row) => fmtNumber(asNumber(row.stores)) },
  ];

  const electronicsColumns: TableColumn[] = [
    { key: "category", label: "Nhóm", primary: true, render: (row) => text(row, "category") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price)) },
    { key: "range", label: "Khoảng giá", align: "right", render: (row) => `${fmtVnd(asNumber(row.min_price))} – ${fmtVnd(asNumber(row.max_price))}` },
    { key: "brands", label: "Thương hiệu", align: "right", render: (row) => fmtNumber(asNumber(row.brands)) },
    { key: "rating", label: "Đánh giá", align: "right", render: (row) => (asNumber(row.avg_rating) === null ? "—" : `${fmtNumber(asNumber(row.avg_rating), 1)}★`) },
    { key: "stores", label: "Cửa hàng", align: "right", render: (row) => fmtNumber(asNumber(row.stores)) },
  ];

  const bakeryColumns: TableColumn[] = [
    { key: "occasion", label: "Dịp", primary: true, render: (row) => text(row, "occasion") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "priced", label: "Có giá", align: "right", render: (row) => fmtNumber(asNumber(row.priced)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price)) },
    { key: "range", label: "Khoảng giá", align: "right", render: (row) => `${fmtVnd(asNumber(row.min_price))} – ${fmtVnd(asNumber(row.max_price))}` },
    { key: "size", label: "Size TB", align: "right", render: (row) => `${text(row, "avg_size_cm")} cm` },
  ];

  const furnitureColumns: TableColumn[] = [
    { key: "store", label: "Cửa hàng", primary: true, render: (row) => text(row, "store") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "stock", label: "Còn hàng", align: "right", render: (row) => (asNumber(row.in_stock_pct) === null ? "—" : `${fmtNumber(asNumber(row.in_stock_pct), 1)}%`) },
    { key: "median", label: "Trung vị", align: "right", render: (row) => fmtVnd(asNumber(row.median_price)) },
    { key: "range", label: "Khoảng giá", align: "right", render: (row) => `${fmtVnd(asNumber(row.min_price))} – ${fmtVnd(asNumber(row.max_price))}` },
  ];

  const vehicleColumns: TableColumn[] = [
    { key: "store", label: "Cửa hàng", primary: true, render: (row) => text(row, "store") },
    { key: "latest", label: "Dữ liệu", render: (row) => fmtDate(asString(row.latest_date)) },
    { key: "rows", label: "Dòng hàng", align: "right", render: (row) => fmtNumber(asNumber(row.rows)) },
    { key: "stock", label: "Còn hàng", align: "right", render: (row) => (asNumber(row.in_stock_pct) === null ? "—" : `${fmtNumber(asNumber(row.in_stock_pct), 1)}%`) },
    { key: "median", label: "Trung vị", align: "right", render: (row) => fmtVnd(asNumber(row.median_price)) },
    { key: "range", label: "Khoảng giá", align: "right", render: (row) => `${fmtVnd(asNumber(row.min_price))} – ${fmtVnd(asNumber(row.max_price))}` },
  ];

  const cosmeticsColumns: TableColumn[] = [
    { key: "concentration", label: "Nồng độ", primary: true, render: (row) => text(row, "concentration") },
    { key: "products", label: "Sản phẩm", align: "right", render: (row) => fmtNumber(asNumber(row.products)) },
    { key: "brands", label: "Thương hiệu", align: "right", render: (row) => fmtNumber(asNumber(row.brands)) },
    { key: "avg", label: "Giá TB", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price)) },
    { key: "ml", label: "TB /ml", align: "right", render: (row) => fmtVnd(asNumber(row.avg_price_per_ml)) },
    { key: "discount", label: "Giảm giá TB", align: "right", render: (row) => (asString(row.avg_discount_pct) ? `${text(row, "avg_discount_pct")}%` : "—") },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <Hero snapshot={snapshot} />

      <Group id="ty-gia" eyebrow="Thị trường · Tỷ giá">
        <Section
          id="sec-exchange"
          title="Tỷ giá ngoại tệ"
          subtitle="Giá mua, chuyển khoản và bán tại Vietcombank (VND)"
          endpoint="exchange"
          icon={Coins}
          date={snapshot.date}
          count={countOf(snapshot, "exchange")}
          empty={exchange.length === 0}
        >
          <ResponsiveTable rows={exchange} columns={exchangeColumns} limit={14} note="Lọc bảng giá Vietcombank, ưu tiên các ngoại tệ chính." />
        </Section>
      </Group>

      <Group id="lai-suat" eyebrow="Thị trường · Lãi suất">
        <Section
          id="sec-interest"
          title="Lãi suất huy động"
          subtitle="Lãi suất tiền gửi theo kỳ hạn (%/năm) — các ngân hàng lớn"
          endpoint="interest"
          icon={Gauge}
          date={snapshot.date}
          count={countOf(snapshot, "interest")}
          empty={interest.length === 0}
        >
          <ResponsiveTable rows={interest} columns={interestColumns} limit={16} note="Ưu tiên ngân hàng lớn; giá trị trống là kỳ hạn chưa có trong snapshot." />
        </Section>
      </Group>

      <Group id="vang-bac" eyebrow="Thị trường · Kim loại quý">
        <Section
          id="sec-gold"
          title="Giá vàng"
          subtitle="Giá mua / bán theo loại và nguồn niêm yết"
          endpoint="gold"
          icon={Gem}
          date={snapshot.date}
          count={countOf(snapshot, "gold")}
          empty={gold.length === 0}
        >
          <ResponsiveTable rows={gold} columns={metalColumns} limit={16} />
        </Section>

        <Section
          id="sec-silver"
          title="Giá bạc"
          subtitle="Giá mua / bán bạc theo loại và nguồn niêm yết"
          endpoint="silver"
          icon={Sparkles}
          date={snapshot.date}
          count={countOf(snapshot, "silver")}
          empty={silver.length === 0}
        >
          <ResponsiveTable rows={silver} columns={metalColumns} limit={16} />
        </Section>
      </Group>

      <Group id="xang-dau" eyebrow="Năng lượng · Nhiên liệu">
        <Section
          id="sec-fuel"
          title="Giá xăng dầu"
          subtitle="Giá bán lẻ theo loại nhiên liệu và vùng"
          endpoint="fuel"
          icon={Fuel}
          date={snapshot.date}
          count={countOf(snapshot, "fuel")}
          empty={fuel.length === 0}
        >
          <ResponsiveTable rows={fuel} columns={fuelColumns} limit={16} />
        </Section>
      </Group>

      <Group id="nong-san" eyebrow="Nông sản · Xuất khẩu">
        <Section
          id="sec-coffee"
          title="Giá cà phê"
          subtitle="Cà phê trong nước theo khu vực và cà phê thế giới"
          endpoint="coffee"
          icon={Wheat}
          date={snapshot.date}
          count={countOf(snapshot, "coffee")}
          empty={coffee.length === 0}
        >
          <ResponsiveTable rows={coffee} columns={coffeeColumns} limit={16} />
        </Section>

        <Section
          id="sec-rice"
          title="Giá gạo"
          subtitle="Gạo xuất khẩu và trong nước (USD/tấn hoặc đơn vị nguồn)"
          endpoint="rice"
          icon={Utensils}
          date={snapshot.date}
          count={countOf(snapshot, "rice")}
          empty={rice.length === 0}
        >
          <ResponsiveTable rows={rice} columns={riceColumns} limit={18} note="Giá gạo là dữ liệu theo tuần — cột 'Kỳ dữ liệu' cho biết ngày công bố gần nhất." />
        </Section>

        <Section
          id="sec-pepper"
          title="Giá hồ tiêu"
          subtitle="Hồ tiêu trong nước theo vùng và giá thế giới"
          endpoint="pepper"
          icon={BadgeDollarSign}
          date={snapshot.date}
          count={countOf(snapshot, "pepper")}
          empty={pepper.length === 0}
        >
          <ResponsiveTable rows={pepper} columns={pepperColumns} limit={16} />
        </Section>
      </Group>

      <Group id="hang-hoa" eyebrow="Hàng hóa · Kinh tế vĩ mô">
        <Section
          id="sec-oil"
          title="Dầu thô"
          subtitle="Giá dầu Brent, WTI và các hợp đồng liên quan (USD/thùng)"
          endpoint="oil"
          icon={LineChart}
          date={snapshot.date}
          count={countOf(snapshot, "oil")}
          empty={oil.length === 0}
        >
          <ResponsiveTable rows={oil} columns={oilColumns} limit={12} />
        </Section>

        <Section
          id="sec-commodities"
          title="Hàng hóa thế giới"
          subtitle="Kim loại, nông sản, năng lượng và các chỉ số hàng hóa"
          endpoint="commodities"
          icon={ShoppingBasket}
          date={snapshot.date}
          count={countOf(snapshot, "commodities")}
          empty={commodities.length === 0}
        >
          <ResponsiveTable rows={commodities} columns={commodityColumns} limit={18} />
        </Section>

        <Section
          id="sec-indicators"
          title="Chỉ số kinh tế"
          subtitle="CPI, lạm phát, tăng trưởng… theo kỳ công bố mới nhất"
          endpoint="indicators"
          icon={Gauge}
          date={snapshot.date}
          count={countOf(snapshot, "indicators")}
          empty={indicators.length === 0}
        >
          <ResponsiveTable rows={indicators} columns={indicatorColumns} limit={20} note="Giá trị giữ nguyên đơn vị nguồn công bố (phần lớn chỉ số kinh tế là %)." />
        </Section>
      </Group>

      <Group id="bat-dong-san" eyebrow="Bất động sản">
        <Section
          id="sec-re-summary"
          title="Giá trung vị theo tỉnh / thành"
          subtitle="Giá rao bán trung vị và trung vị trên mỗi m², sắp theo số tin đăng"
          endpoint="re_summary"
          icon={MapIcon}
          date={snapshot.date}
          count={countOf(snapshot, "re_summary")}
          empty={reSummary.length === 0}
        >
          <ResponsiveTable rows={reSummary} columns={reSummaryColumns} limit={18} note="Chỉ lấy giao dịch bán; hiển thị nhóm có nhiều tin đăng nhất." />
        </Section>

        <Section
          id="sec-re-benchmarks"
          title="Chuẩn giá theo quận / huyện"
          subtitle="Giá trung bình theo quận, huyện và phân khúc"
          endpoint="re_benchmarks"
          icon={MapIcon}
          date={snapshot.date}
          count={countOf(snapshot, "re_benchmarks")}
          empty={reBenchmarks.length === 0}
        >
          <ResponsiveTable rows={reBenchmarks} columns={reBenchmarkColumns} limit={18} />
        </Section>

        <Section
          id="sec-re-trends"
          title="Xu hướng 30 ngày"
          subtitle="Diễn biến giá trung vị trên m² và số tin đăng theo ngày"
          endpoint="re_trends"
          icon={LineChart}
          date={snapshot.date}
          count={countOf(snapshot, "re_trends")}
          empty={reTrends.length === 0}
        >
          <div className="space-y-4">
            <TrendChart
              points={reTrends.map((point) => ({ label: point.date, value: point.medianPricePerM2 }))}
              valueLabel="Trung vị giá rao bán trên m²"
            />
            <ResponsiveTable
              rows={reTrendRows.slice(-10)}
              columns={reTrendColumns}
              limit={10}
              note="10 ngày gần nhất trong chuỗi 30 ngày."
            />
          </div>
        </Section>

        <Section
          id="sec-re-landprices"
          title="Bảng giá đất 2026"
          subtitle="Giá đất theo vị trí 1–4 (VND/m²), nguồn guland.vn"
          endpoint="re_landprices"
          icon={MapIcon}
          date={snapshot.date}
          count={countOf(snapshot, "re_landprices")}
          empty={reLandPrices.length === 0}
        >
          <ResponsiveTable rows={reLandPrices} columns={landPriceColumns} limit={18} note="Sắp theo tỉnh/thành và khu vực; chỉ hiển thị dòng có giá vị trí 1." />
        </Section>
      </Group>

      <Group id="thuc-pham" eyebrow="Tiêu dùng · Thực phẩm">
        <Section
          id="sec-groceries"
          title="Giá thực phẩm"
          subtitle="Tổng hợp giá theo nhóm hàng tại các chuỗi siêu thị"
          endpoint="groceries_summary"
          icon={ShoppingBasket}
          date={snapshot.date}
          count={countOf(snapshot, "groceries_summary")}
          empty={groceries.length === 0}
        >
          <ResponsiveTable rows={groceries} columns={groceryColumns} limit={26} />
        </Section>

        <Section
          id="sec-mombaby"
          title="Mẹ & bé"
          subtitle="Giá sữa, ăn dặm, tã và đồ dùng cho mẹ và bé"
          endpoint="mombaby_summary"
          icon={Baby}
          date={snapshot.date}
          count={countOf(snapshot, "mombaby_summary")}
          empty={mombaby.length === 0}
        >
          <ResponsiveTable rows={mombaby} columns={mombabyColumns} limit={12} />
        </Section>

        <Section
          id="sec-food-index"
          title="Chỉ số giá thực phẩm"
          subtitle="Chỉ số giá thực phẩm theo tháng (09/2026 = 100)"
          endpoint="food_index"
          icon={Gauge}
          date={snapshot.date}
          count={index ? 1 : 0}
          empty={!index}
        >
          {index && (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
              <div
                className="rounded-xl border p-4 text-center"
                style={{ borderColor: "var(--app-border)", background: "var(--app-surface-2)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--app-muted)" }}>
                  Tháng {text(index, "latest_month")}
                </p>
                <p className="mt-1 text-4xl font-black tabular-nums" style={{ color: "var(--app-accent)" }}>
                  {fmtNumber(asNumber(index.latest_index), 2)}
                </p>
                <p className="mt-1 text-[11.5px]" style={{ color: "var(--app-muted)" }}>
                  Chỉ số giá thực phẩm
                </p>
              </div>
              <div className="space-y-2 text-[12.5px] leading-relaxed">
                <p>
                  Nguồn:{" "}
                  <a
                    href={text(index, "source_page")}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline underline-offset-2"
                    style={{ color: "var(--app-accent)" }}
                  >
                    dulieu.dev/chi-so-gia
                  </a>
                </p>
                {asString(index.warning) && (
                  <p
                    className="rounded-lg border px-3 py-2"
                    style={{
                      borderColor: "color-mix(in srgb, var(--app-gold) 45%, var(--app-border))",
                      background: "color-mix(in srgb, var(--app-gold) 9%, var(--app-surface))",
                    }}
                  >
                    {asString(index.warning)}
                  </p>
                )}
              </div>
            </div>
          )}
        </Section>
      </Group>

      <Group id="tieu-dung" eyebrow="Tiêu dùng · Y tế & công nghệ">
        <Section
          id="sec-drugs"
          title="Giá thuốc"
          subtitle="Tổng hợp theo nhóm tại các nhà thuốc"
          endpoint="drugs_summary"
          icon={HeartPulse}
          date={snapshot.date}
          count={countOf(snapshot, "drugs_summary")}
          empty={drugs.length === 0}
        >
          <ResponsiveTable rows={drugs} columns={drugsColumns} limit={10} />
        </Section>

        <Section
          id="sec-electronics"
          title="Điện tử"
          subtitle="Giá theo nhóm sản phẩm tại các chuỗi bán lẻ"
          endpoint="electronics_summary"
          icon={Smartphone}
          date={snapshot.date}
          count={countOf(snapshot, "electronics_summary")}
          empty={electronics.length === 0}
        >
          <ResponsiveTable rows={electronics} columns={electronicsColumns} limit={10} />
        </Section>

        <Section
          id="sec-bakery"
          title="Bánh kem"
          subtitle="Giá bánh theo dịp và kích cỡ"
          endpoint="bakery_summary"
          icon={Cake}
          date={snapshot.date}
          count={countOf(snapshot, "bakery_summary")}
          empty={bakery.length === 0}
        >
          <ResponsiveTable rows={bakery} columns={bakeryColumns} limit={10} />
        </Section>

        <Section
          id="sec-furniture"
          title="Nội thất"
          subtitle="Giá và tình trạng còn hàng theo cửa hàng"
          endpoint="furniture_summary"
          icon={Sofa}
          date={snapshot.date}
          count={countOf(snapshot, "furniture_summary")}
          empty={furniture.length === 0}
        >
          <ResponsiveTable rows={furniture} columns={furnitureColumns} limit={10} />
        </Section>

        <Section
          id="sec-vehicles"
          title="Xe & phụ tùng"
          subtitle="Giá và tồn kho theo cửa hàng"
          endpoint="vehicles_summary"
          icon={Car}
          date={snapshot.date}
          count={countOf(snapshot, "vehicles_summary")}
          empty={vehicles.length === 0}
        >
          <ResponsiveTable rows={vehicles} columns={vehicleColumns} limit={12} />
        </Section>

        <Section
          id="sec-cosmetics"
          title="Nước hoa"
          subtitle="Giá theo nồng độ và thương hiệu"
          endpoint="cosmetics_summary"
          icon={Sparkles}
          date={snapshot.date}
          count={countOf(snapshot, "cosmetics_summary")}
          empty={cosmetics.length === 0}
        >
          <ResponsiveTable rows={cosmetics} columns={cosmeticsColumns} limit={10} />
        </Section>
      </Group>

      <footer className="pb-2 pt-1 text-center text-[11.5px] leading-relaxed" style={{ color: "var(--app-muted)" }}>
        <p>
          Dữ liệu gốc từ dulieu.dev · snapshot {snapshot.date ? fmtDate(snapshot.date) : "—"} · đọc{" "}
          {snapshot.source === "supabase" ? "trực tiếp từ Supabase" : "từ snapshot local (Supabase chưa sẵn sàng)"}.
        </p>
        <p className="mt-1">Trang chỉ hiển thị dữ liệu thật — mục thiếu sẽ ghi rõ &ldquo;chưa có dữ liệu ngày này&rdquo;.</p>
      </footer>
    </div>
  );
}
