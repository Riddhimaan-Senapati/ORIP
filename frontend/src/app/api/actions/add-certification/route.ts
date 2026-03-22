import { NextRequest, NextResponse } from "next/server";

const FOUNDRY_URL = process.env.NEXT_PUBLIC_FOUNDRY_URL;
const FOUNDRY_TOKEN = process.env.FOUNDRY_TOKEN;
const ONTOLOGY_RID = process.env.NEXT_PUBLIC_FOUNDRY_ONTOLOGY_RID!;

// Action API name as set in Foundry Ontology Manager (kebab-case of the display name)
const ACTION_API_NAME = "add-certification-record";

export async function POST(req: NextRequest) {
  const { employeeId, certId, issueDate, expiryDate } = await req.json();

  if (!employeeId || !certId || !issueDate || !expiryDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Generate a unique record ID for the new certification record
  const record_id = `CERT-REC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const res = await fetch(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/actions/${ACTION_API_NAME}/apply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FOUNDRY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parameters: {
          // Parameter IDs from Foundry Ontology Manager (snake_case)
          record_id,
          employee_id: employeeId,
          cert_id: certId,
          issue_date: issueDate,
          expiration_date: expiryDate,
          status: "Active",
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
