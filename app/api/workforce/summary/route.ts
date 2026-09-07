import { NextResponse } from "next/server";
import { getWorkforceSummary } from "@backend/services/workforce.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getWorkforceSummary();
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Workforce summary fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workforce telemetry" },
      { status: 500 }
    );
  }
}
