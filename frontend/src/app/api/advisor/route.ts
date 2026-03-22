import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";
import { getNetworkPageData } from "@/lib/osdk-queries";

export const dynamic = "force-dynamic";

// ─── Build grounded system prompt from live Foundry ontology data ─────────────

async function buildSystemPrompt(): Promise<string> {
  const { facilities, employees, employeeCertifications, departments, roles } =
    await getNetworkPageData();

  const today = new Date().toISOString().split("T")[0];

  const facilityLines = facilities
    .map(
      (f) =>
        `  - ${f.id} | ${f.name} | ${f.type} | ${f.bedCount} beds | Readiness: ${f.readinessScore}% | Accreditation: ${f.accreditationStatus}`
    )
    .join("\n");

  const deptLines = departments
    .map(
      (d) =>
        `  - ${d.facilityId} / ${d.name} | ${d.employeeCount} staff | Readiness: ${d.readinessScore}% | Expired: ${d.expiredCount} | Expiring Soon: ${d.expiringCount}`
    )
    .join("\n");

  const empLines = employees
    .map(
      (e) =>
        `  - ${e.id} | ${e.firstName} ${e.lastName} | ${e.roleId} | ${e.facilityId} | ${e.department} | Readiness: ${e.readinessScore}% | Status: ${e.employmentStatus}`
    )
    .join("\n");

  const certLines = employeeCertifications
    .map(
      (ec) =>
        `  - ${ec.recordId} | ${ec.employeeId} | ${ec.certId} | Issued: ${ec.issueDate} | Expires: ${ec.expiryDate} | Status: ${ec.status}`
    )
    .join("\n");

  const roleLines = roles
    .map((r) => `  - ${r.id} | ${r.title} | ${r.department} | Required: ${r.requiredCertIds.join(", ")}`)
    .join("\n");

  const totalExpired = employeeCertifications.filter((ec) => ec.status === "Expired").length;
  const totalExpiring = employeeCertifications.filter((ec) => ec.status === "Expiring Soon").length;
  const avgReadiness =
    employees.length > 0
      ? Math.round(employees.reduce((s, e) => s + e.readinessScore, 0) / employees.length)
      : 0;

  return `You are the ORIP Clinical Readiness Advisor, an AI assistant grounded in live Palantir Foundry ontology data for a clinical workforce readiness platform.

Today's date: ${today}

Your job is to answer questions about certification compliance, workforce readiness, and staffing gaps across the network. Respond concisely and factually. Use bullet points for lists. Bold key figures. Never make up data — only use what is provided below.

─── NETWORK SUMMARY ───
- ${facilities.length} facilities | ${employees.length} employees | ${totalExpired} expired certs | ${totalExpiring} expiring soon | Avg readiness: ${avgReadiness}%

─── FACILITIES ───
${facilityLines}

─── DEPARTMENTS ───
${deptLines}

─── EMPLOYEES ───
${empLines}

─── EMPLOYEE CERTIFICATIONS ───
${certLines}

─── ROLES & REQUIRED CERTS ───
${roleLines}

When answering:
- If asked about a specific employee, use their data above
- If asked about expired/expiring certs, filter by status
- If asked about readiness scores, reference the computed values above
- For compliance gaps, identify which required certs (from role definitions) are expired or missing
- Suggest actionable next steps when relevant (e.g. schedule renewal, restrict high-acuity assignments)`;
}

// ─── Streaming chat endpoint ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // TODO: When orip-functions TypeScript Functions repo is deployed in Foundry,
  // replace the anthropic() call below with:
  //   import { advisorChat } from "@orip-frontend/sdk";
  //   const result = await foundryClient(advisorChat).executeFunction({ message, context });
  //   return new Response(result.response);
  // This routes the LLM call through Palantir AIP instead of directly to Anthropic.

  let systemPrompt: string;
  try {
    systemPrompt = await buildSystemPrompt();
  } catch (err) {
    console.error("[advisor] buildSystemPrompt failed:", err);
    systemPrompt =
      "You are the ORIP Clinical Readiness Advisor. Live Foundry data is temporarily unavailable. Let the user know and suggest they check the server logs.";
  }

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages,
    maxTokens: 1024,
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[advisor] LLM error:", msg);
      return msg;
    },
  });
}
