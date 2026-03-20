import { NextRequest, NextResponse } from "next/server";

const FOUNDRY_URL = process.env.NEXT_PUBLIC_FOUNDRY_URL;
const FOUNDRY_TOKEN = process.env.FOUNDRY_TOKEN;
const ONTOLOGY_RID = "ONTOLOGY_RID_PLACEHOLDER";

// Action API name as set in Foundry Ontology Manager (kebab-case of the display name)
const ACTION_API_NAME = "flag-employee-for-review";

export async function POST(req: NextRequest) {
  const { employeeId, reviewNotes } = await req.json();

  if (!employeeId) {
    return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
  }

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
          // Parameter names must match those defined in the Foundry Action Type.
          // If different, check Ontology Manager → flag-employee-for-review → Parameters.
          employeeId,
          reviewNotes: reviewNotes ?? "",
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
