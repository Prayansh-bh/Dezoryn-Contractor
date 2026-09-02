import { NextResponse } from "next/server";
import { createEnquirySchema } from "@backend/validation/enquiry.schema";
import { createEnquiry } from "@backend/services/enquiries.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = createEnquirySchema.safeParse(json);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Invalid enquiry data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    await createEnquiry(result.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("❌ [API/Enquiries] Failed to submit enquiry:", error);
    return NextResponse.json(
      { error: "Unable to submit enquiry. Please try again later." },
      { status: 500 }
    );
  }
}
