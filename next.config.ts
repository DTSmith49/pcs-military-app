import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable X-Powered-By header to avoid revealing server technology
  poweredByHeader: false,
};

export default nextConfig;
