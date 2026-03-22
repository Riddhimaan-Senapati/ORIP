import { createClient, type Client } from "@osdk/client";

// Lazy singleton — createClient() is deferred until first request so it never
// runs during Next.js static build analysis (which causes a module-eval crash).
let _client: Client | undefined;

export function getFoundryClient(): Client {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_FOUNDRY_URL!,
      process.env.NEXT_PUBLIC_FOUNDRY_ONTOLOGY_RID!,
      async () => process.env.FOUNDRY_TOKEN ?? "",
    );
  }
  return _client;
}
