import type { Client } from "@osdk/client";

// Dynamic import ensures @osdk/client is never evaluated at module load time.
// Static imports get bundled and executed immediately by Turbopack, which
// causes a "Cannot read properties of undefined (reading 'then')" crash
// during SSR because @osdk/client has module-level async initialization.
let _client: Client | undefined;

export async function getFoundryClient(): Promise<Client> {
  if (!_client) {
    const { createClient } = await import("@osdk/client");
    _client = createClient(
      process.env.NEXT_PUBLIC_FOUNDRY_URL!,
      process.env.NEXT_PUBLIC_FOUNDRY_ONTOLOGY_RID!,
      async () => process.env.FOUNDRY_TOKEN ?? "",
    ) as Client;
  }
  return _client;
}
