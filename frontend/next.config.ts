import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OSDK packages use ESM — tell Next.js to transpile them
  transpilePackages: ["@osdk/client", "@osdk/oauth"],

  // Load OSDK-generated SDK at runtime rather than bundling it, to avoid
  // module-evaluation errors during Next.js static build analysis
  serverExternalPackages: ["@orip-frontend/sdk"],

  // Strict mode catches potential issues earlier in dev
  reactStrictMode: true,
};

export default nextConfig;
