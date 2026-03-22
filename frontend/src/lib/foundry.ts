import { createConfidentialOauthClient } from "@osdk/oauth";
import { createClient } from "@osdk/client";

// Confidential OAuth client — CLIENT_ID + CLIENT_SECRET live in Vercel env vars.
// Never rotates manually; Foundry handles token refresh automatically.
const auth = createConfidentialOauthClient(
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_FOUNDRY_URL!,
);

export const foundryClient = createClient(
  process.env.NEXT_PUBLIC_FOUNDRY_URL!,
  "ONTOLOGY_RID_PLACEHOLDER",
  auth
);
