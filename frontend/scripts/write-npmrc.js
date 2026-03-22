/**
 * Generates .npmrc at build time from environment variables.
 * Run by Vercel's installCommand before `npm install`.
 *
 * Required env vars:
 *   FOUNDRY_REGISTRY_URL  — full URL to the Foundry Artifacts npm registry
 *                           e.g. https://<stack>.palantirfoundry.com/artifacts/api/repositories/<rid>/contents/release/npm/
 *   FOUNDRY_TOKEN         — Foundry auth token (confidential OAuth or personal)
 */

const fs = require("fs");

const url = process.env.FOUNDRY_REGISTRY_URL;
const token = process.env.FOUNDRY_TOKEN;

if (!url || !token) {
  console.log("FOUNDRY_REGISTRY_URL or FOUNDRY_TOKEN not set — skipping .npmrc generation");
  process.exit(0);
}

const hostAndPath = url.replace(/^https?:\/\//, "");

const content = [
  `@orip-frontend:registry=${url}`,
  `//${hostAndPath}:_authToken=${token}`,
  `omit-lockfile-registry-resolved=true`,
  "",
].join("\n");

fs.writeFileSync(".npmrc", content);
console.log(".npmrc written for Foundry Artifacts registry");
