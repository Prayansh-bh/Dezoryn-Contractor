import { NextRequest, NextResponse } from "next/server";
import { createLabourAgencySchema } from "@shared/schemas";
import { createLabourAgency } from "@backend/services/workforce.service";
import { sendLabourAgencyNotifications } from "@backend/services/email.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLabourAgencySchema.parse(body);

    try {
      const agency = await createLabourAgency(validatedData);

      try {
        await sendLabourAgencyNotifications(agency);
      } catch (err: any) {
        console.warn("⚠️ [EmailService] Asynchronous agency email dispatch error:", err.message);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Agency profile registered successfully. Verification pending.",
          agencyCode: agency.agencyCode,
          agency,
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      if (dbErr.code === "P2002" || String(dbErr).includes("Unique constraint")) {
        return NextResponse.json(
          { error: "An agency with this phone number is already registered in our database." },
          { status: 409 }
        );
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("Agency registration error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to register labour agency" },
      { status: 500 }
    );
  }
}
