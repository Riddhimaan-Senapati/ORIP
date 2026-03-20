import { NextResponse } from "next/server";
import { foundryClient } from "@/lib/foundry";
import { employee as $employee } from "@orip-frontend/sdk";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await foundryClient($employee).fetchPage({ $pageSize: 3 });
  const raw = data.map((e) => ({
    employeeId: e.employeeId,
    firstName: e.firstName,
    lastName: e.lastName,
    facilityId: e.facilityId,
    readinessScore: e.readinessScore,
    department: e.department,
    roleId: e.roleId,
    // dump full object keys to see what came back
    allKeys: Object.keys(e).filter((k) => !k.startsWith("$")),
  }));
  return NextResponse.json({ count: data.length, employees: raw });
}
