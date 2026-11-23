import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { fmtDate } from "@/lib/format";

interface SectionProps {
  id: string;
  title: string;
  subtitle?: string;
  endpoint: string;
  icon: LucideIcon;
  date: string;
  count: number | null;
  empty?: boolean;
  children: ReactNode;
}

export function Section({
  id,
  title,
  subtitle,
  endpoint,
  icon: Icon,
  date,
  count,
  empty = false,
  children,
}: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 md:scroll-mt-6">
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ background: "var(--app-surface)", borderColor: "var(--app-border)", boxShadow: "var(--app-shadow)" }}
      >
        <header className="flex items-start gap-3 border-b px-4 py-3.5 sm:px-5" style={{ borderColor: "var(--app-border)" }}>
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: "var(--app-surface-2)", color: "var(--app-accent)" }}
            aria-hidden
          >
            <Icon size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-[16px] font-bold leading-tight sm:text-lg">{title}</h2>
              {count !== null && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums"
                  style={{ background: "var(--app-surface-2)", color: "var(--app-muted)" }}
                >
                  {count} dòng
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--app-muted)" }}>
                {subtitle}
              </p>
            )}
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px]" style={{ color: "var(--app-muted)" }}>
              <code className="rounded px-1 py-0.5" style={{ background: "var(--app-surface-2)" }}>
                {endpoint}
              </code>
              <span>dulieu.dev · cập nhật {date ? fmtDate(date) : "—"}</span>
            </p>
          </div>
        </header>
        <div className="p-3.5 sm:p-5">
          {empty ? (
            <div
              className="rounded-xl border border-dashed px-4 py-7 text-center"
              style={{ borderColor: "var(--app-border)", background: "var(--app-surface-2)" }}
            >
              <p className="text-sm font-semibold">Chưa có dữ liệu ngày này</p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--app-muted)" }}>
                Endpoint <code>{endpoint}</code> không có bản ghi trong snapshot
                {date ? ` ngày ${fmtDate(date)}` : ""}. Không hiển thị số ước lượng.
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </section>
  );
}
