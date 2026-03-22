import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OSDK packages use ESM — tell Next.js to transpile them
  transpilePackages: ["@osdk/client", "@osdk/oauth", "@orip-frontend/sdk"],

  // Suppress noisy build warnings from OSDK internal modules
  serverExternalPackages: [],

  // Strict mode catches potential issues earlier in dev
  reactStrictMode: true,
};

export default nextConfig;
