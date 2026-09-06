import { NextRequest, NextResponse } from "next/server";
import { createEnquirySchema } from "@shared/schemas";
import { createEnquiry } from "@backend/services/enquiries.service";
import { sendEnquiryNotifications } from "@backend/services/email.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEnquirySchema.parse(body);

    const enquiry = await createEnquiry(validatedData);

    // Asynchronously dispatch email notification (non-blocking)
    sendEnquiryNotifications(enquiry).catch((err) => {
      console.warn("⚠️ [EmailService] Asynchronous email dispatch error:", err.message);
    });

    return NextResponse.json(
      { success: true, message: "Enquiry submitted successfully", enquiryId: enquiry.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Enquiry submission error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to submit enquiry" }, { status: 500 });
  }
}
