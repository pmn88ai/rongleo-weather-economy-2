"use client";

import { useEffect, useState } from "react";
import { Menu, X, Database, CloudOff } from "lucide-react";
import { BOTTOM_NAV_ITEMS, NAV_ITEMS } from "./nav-items";
import { fmtDate } from "@/lib/format";

interface AppShellProps {
  date: string;
  source: "supabase" | "local";
}

function Brand() {
  return (
    <a href="#tong-quan" className="flex items-center gap-2.5">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl text-lg"
        style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
        aria-hidden
      >
        🌤
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight">Thời tiết Kinh tế 2</span>
        <span className="block text-[11px] font-medium" style={{ color: "var(--app-muted)" }}>
          Bảng giá RongLeo
        </span>
      </span>
    </a>
  );
}

function SourceChip({ source, date }: { source: "supabase" | "local"; date: string }) {
  const live = source === "supabase";
  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-medium"
      style={{ borderColor: "var(--app-border)", background: "var(--app-surface-2)", color: "var(--app-muted)" }}
    >
      {live ? <Database size={14} style={{ color: "var(--app-up)" }} /> : <CloudOff size={14} style={{ color: "var(--app-gold)" }} />}
      <span>
        {live ? "Supabase · live" : "Snapshot local"}
        <br />
        {date ? fmtDate(date) : "chưa có ngày"}
      </span>
    </div>
  );
}

function NavLinks({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Điều hướng nội dung">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = active === href;
        return (
          <a
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "location" : undefined}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors"
            style={{
              background: isActive ? "var(--app-accent-soft)" : "transparent",
              color: isActive ? "var(--app-accent)" : "var(--app-muted)",
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function AppShell({ date, source }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(NAV_ITEMS[0].href);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.href.slice(1))).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b px-3 md:hidden"
        style={{
          background: "color-mix(in srgb, var(--app-surface) 92%, transparent)",
          borderColor: "var(--app-border)",
          paddingTop: "env(safe-area-inset-top)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
          aria-expanded={open}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border"
          style={{ borderColor: "var(--app-border)", background: "var(--app-surface)" }}
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">🌤 Thời tiết Kinh tế 2</p>
          <p className="truncate text-[11px] font-medium" style={{ color: "var(--app-muted)" }}>
            {source === "supabase" ? "Supabase · live" : "Snapshot local"} · {date ? fmtDate(date) : "chưa có dữ liệu"}
          </p>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0"
            style={{ background: "rgba(2, 6, 23, 0.55)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute inset-x-0 top-0 max-h-[88vh] overflow-y-auto rounded-b-2xl border-b p-3 shadow-2xl"
            style={{
              background: "var(--app-surface)",
              borderColor: "var(--app-border)",
              paddingTop: "calc(0.75rem + env(safe-area-inset-top))",
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border"
                style={{ borderColor: "var(--app-border)" }}
              >
                <X size={22} />
              </button>
            </div>
            <div className="mb-3">
              <SourceChip source={source} date={date} />
            </div>
            <NavLinks active={active} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r px-3 py-5 md:flex"
        style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}
      >
        <div className="px-1">
          <Brand />
        </div>
        <div className="mt-5 flex-1 overflow-y-auto">
          <NavLinks active={active} />
        </div>
        <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: "var(--app-border)" }}>
          <SourceChip source={source} date={date} />
          <p className="px-1 text-[11px] leading-relaxed" style={{ color: "var(--app-muted)" }}>
            Nguồn:{" "}
            <a href="https://dulieu.dev" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              dulieu.dev
            </a>
          </p>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
        style={{
          background: "color-mix(in srgb, var(--app-surface) 94%, transparent)",
          borderColor: "var(--app-border)",
          paddingBottom: "env(safe-area-inset-bottom)",
          backdropFilter: "blur(12px)",
        }}
        aria-label="Điều hướng nhanh"
      >
        <div className="mx-auto flex max-w-mobile">
          {BOTTOM_NAV_ITEMS.map(({ href, label, shortLabel, icon: Icon }) => {
            const isActive = active === href;
            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? "location" : undefined}
                aria-label={label}
                className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5"
                style={{ color: isActive ? "var(--app-accent)" : "var(--app-muted)" }}
              >
                <Icon size={21} strokeWidth={isActive ? 2.4 : 1.7} />
                <span className="max-w-full truncate text-[10.5px] font-semibold">{shortLabel}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
