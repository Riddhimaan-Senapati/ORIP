import { NextResponse } from "next/server";
import { getFoundryClient } from "@/lib/foundry";
import { roles as mockRoles } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [client, { employee: $employee, employeeCertification: $empCert, role: $role }] =
      await Promise.all([getFoundryClient(), import("@orip-frontend/sdk")]);

    const [empPage, certPage, rolePage] = await Promise.all([
      client($employee).fetchPage({ $pageSize: 3 }),
      client($empCert).fetchPage({ $pageSize: 10 }),
      client($role).fetchPage({ $pageSize: 5 }),
    ]);

    const employees = empPage.data.map((e) => ({
      employeeId: e.employeeId,
      firstName: e.firstName,
      facilityId: e.facilityId,
      roleId: e.roleId,
      readinessScore: e.readinessScore,
    }));

    const certs = certPage.data.map((ec) => ({
      recordId: ec.recordId,
      employeeId: ec.employeeId,
      certId: ec.certId,
      expirationDate: ec.expirationDate,
      expirationDateType: typeof ec.expirationDate,
      status: ec.status,
    }));

    const roles = rolePage.data.map((r) => ({
      roleId: r.roleId,
      title: r.title,
      mockFound: mockRoles.some((m) => m.id === r.roleId),
      requiredCertIds: mockRoles.find((m) => m.id === r.roleId)?.requiredCertIds ?? [],
    }));

    return NextResponse.json({ employees, certs, roles, today: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
