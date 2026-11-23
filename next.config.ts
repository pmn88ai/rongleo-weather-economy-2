import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trang đọc Supabase + snapshot local bằng fs ở server, luôn render động.
  outputFileTracingIncludes: {
    "/": ["./data/**/*.json"],
  },
};

export default nextConfig;
