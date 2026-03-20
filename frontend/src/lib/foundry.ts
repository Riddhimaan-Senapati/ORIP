import { createClient } from "@osdk/client";

export const foundryClient = createClient(
  process.env.NEXT_PUBLIC_FOUNDRY_URL ?? "https://your-stack.palantirfoundry.com",
  "ONTOLOGY_RID_PLACEHOLDER",
  async () => process.env.FOUNDRY_TOKEN ?? ""
);
