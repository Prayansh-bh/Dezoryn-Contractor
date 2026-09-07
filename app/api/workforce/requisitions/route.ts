import { NextRequest, NextResponse } from "next/server";
import { createLabourRequisitionSchema } from "@shared/schemas";
import { createLabourRequisition } from "@backend/services/workforce.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLabourRequisitionSchema.parse(body);

    const requisition = await createLabourRequisition(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Labour requirement posted successfully. Our operations desk will match suitable crews.",
        requisitionCode: requisition.requisitionCode,
        requisition,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Labour requisition submission error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to submit labour requisition" },
      { status: 500 }
    );
  }
}
