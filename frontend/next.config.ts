import type { NextConfig } from "next";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Prevent Next.js from 308-redirecting trailing-slash URLs (e.g. /api/boards/ → /api/boards)
  // before the rewrite rule runs. Without this, the Authorization header gets dropped in
  // the redirect chain and FastAPI returns 401, showing "Failed to create board".
  skipTrailingSlashRedirect: true,
  images: {
    qualities: [75, 85, 90],
  },
  async rewrites() {
    return [
      { source: "/api/:path*",     destination: `${BACKEND}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
