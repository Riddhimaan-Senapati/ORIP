import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OSDK packages use ESM — tell Next.js to transpile them
  // All OSDK packages have module-level async init that crashes during
  // Next.js static build analysis — load them at runtime instead
  serverExternalPackages: ["@osdk/client", "@osdk/oauth", "@osdk/foundry", "@orip-frontend/sdk"],

  // Strict mode catches potential issues earlier in dev
  reactStrictMode: true,
};

export default nextConfig;
