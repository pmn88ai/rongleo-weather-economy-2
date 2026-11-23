import { fmtNumber, fmtShortDate, fmtVndCompact } from "@/lib/format";

export interface ChartPoint {
  label: string;
  value: number | null;
}

interface TrendChartProps {
  points: ChartPoint[];
  valueLabel: string;
  formatValue?: (value: number) => string;
}

const WIDTH = 720;
const HEIGHT = 220;
const PAD_X = 14;
const PAD_TOP = 16;
const PAD_BOTTOM = 16;

export function TrendChart({ points, valueLabel, formatValue = fmtVndCompact }: TrendChartProps) {
  const valid = points
    .map((point) => ({ ...point, value: point.value }))
    .filter((point): point is { label: string; value: number } => point.value !== null && Number.isFinite(point.value));

  if (valid.length < 2) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm" style={{ borderColor: "var(--app-border)" }}>
        Chưa đủ dữ liệu để vẽ xu hướng.
      </p>
    );
  }

  const values = valid.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerWidth = WIDTH - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const coordinates = valid.map((point, index) => {
    const x = PAD_X + (index / (valid.length - 1)) * innerWidth;
    const y = PAD_TOP + (1 - (point.value - min) / span) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${coordinates[coordinates.length - 1].x.toFixed(2)},${HEIGHT - PAD_BOTTOM} L${coordinates[0].x.toFixed(2)},${HEIGHT - PAD_BOTTOM} Z`;
  const last = coordinates[coordinates.length - 1];
  const first = coordinates[0];

  return (
    <figure className="m-0">
      <div className="mb-1 flex items-end justify-between gap-3">
        <span className="text-[12px] font-medium" style={{ color: "var(--app-muted)" }}>
          {valueLabel}
        </span>
        <span className="text-[15px] font-bold tabular-nums">{formatValue(last.value)}</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`${valueLabel}: từ ${formatValue(first.value)} ngày ${first.label} đến ${formatValue(last.value)} ngày ${last.label}`}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--app-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--app-accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((fraction) => {
          const y = PAD_TOP + fraction * innerHeight;
          return (
            <line
              key={fraction}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              stroke="var(--app-border)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          );
        })}
        <path d={areaPath} fill="url(#trend-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--app-accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last.x} cy={last.y} r="4.5" fill="var(--app-accent)" />
      </svg>
      <div className="mt-1 flex justify-between gap-3 text-[11px]" style={{ color: "var(--app-muted)" }}>
        <span>{fmtShortDate(first.label)}</span>
        <span>
          {valid.length} điểm · {fmtNumber(min)} – {fmtNumber(max)}
        </span>
        <span>{fmtShortDate(last.label)}</span>
      </div>
    </figure>
  );
}
