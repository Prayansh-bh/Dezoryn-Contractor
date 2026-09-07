import { NextRequest, NextResponse } from "next/server";
import { createIndividualWorkerSchema } from "@shared/schemas";
import { createIndividualWorker } from "@backend/services/workforce.service";
import { sendIndividualWorkerNotification } from "@backend/services/email.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createIndividualWorkerSchema.parse(body);

    try {
      const worker = await createIndividualWorker(validatedData);

      try {
        await sendIndividualWorkerNotification(worker);
      } catch (err: any) {
        console.warn("⚠️ [EmailService] Asynchronous worker email dispatch error:", err.message);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Worker profile registered successfully in Dezoryn Skill Registry.",
          workerCode: worker.workerCode,
          worker,
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      if (dbErr.code === "P2002" || String(dbErr).includes("Unique constraint")) {
        return NextResponse.json(
          { error: "A worker with this phone number is already registered in our skill registry." },
          { status: 409 }
        );
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("Worker registration error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to register worker" },
      { status: 500 }
    );
  }
}
