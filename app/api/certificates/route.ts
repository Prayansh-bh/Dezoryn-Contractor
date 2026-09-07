import { NextResponse } from "next/server";
import { getActiveCertificates } from "@backend/services/certificates.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getActiveCertificates();
    return NextResponse.json(list);
  } catch (error) {
    console.error("❌ [API GET /api/certificates] Error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
