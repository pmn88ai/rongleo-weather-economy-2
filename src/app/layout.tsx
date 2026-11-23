import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thời tiết Kinh tế 2 — Bảng giá RongLeo",
  description:
    "Dashboard dữ liệu kinh tế Việt Nam: tỷ giá, lãi suất, vàng bạc, xăng dầu, nông sản, hàng hóa, bất động sản và giá tiêu dùng. Nguồn dulieu.dev.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#070b11" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
