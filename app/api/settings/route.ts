import { NextResponse } from "next/server";
import { getSettings } from "@backend/services/settings.service";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("❌ [API/Settings GET] Error:", error);
    return NextResponse.json({});
  }
}
