import { createClient } from "@osdk/client";

// For local dev: set FOUNDRY_TOKEN in .env.local
// For Vercel: swap to createConfidentialOauthClient (see DEMO_SCRIPT.md deploy section)
export const foundryClient = createClient(
  process.env.NEXT_PUBLIC_FOUNDRY_URL!,
  "ONTOLOGY_RID_PLACEHOLDER",
  async () => process.env.FOUNDRY_TOKEN ?? "",
);
