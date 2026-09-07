import { NextResponse } from "next/server";
import { getCertificateById } from "@backend/services/certificates.service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const certId = Number(resolvedParams.id);
    if (!certId) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const cert = await getCertificateById(certId);
    if (!cert || !cert.active) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    if (cert.fileData) {
      const buffer = Buffer.from(cert.fileData);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": cert.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (cert.imageUrl && cert.imageUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(cert.imageUrl, _request.url));
    }

    return new NextResponse("Image not available", { status: 404 });
  } catch (error) {
    console.error("❌ [API GET /api/certificates/:id/image] Error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
