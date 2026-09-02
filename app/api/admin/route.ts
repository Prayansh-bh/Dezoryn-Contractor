import { NextResponse } from "next/server";
import { isAdmin } from "@backend/auth/admin-auth.service";
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
} from "@backend/services/products.service";
import {
  getAllEnquiries,
  updateEnquiryStatus,
} from "@backend/services/enquiries.service";
import {
  getAllGalleryItems,
  toggleGalleryStatus,
} from "@backend/services/gallery.service";
import { getSettings, saveSettings } from "@backend/services/settings.service";
import { saveProductSchema } from "@backend/validation/product.schema";

async function checkAdminGuard() {
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await checkAdminGuard();
  if (denied) return denied;

  try {
    const [products, gallery, enquiries, settings] = await Promise.all([
      getAllProducts(),
      getAllGalleryItems(),
      getAllEnquiries(250),
      getSettings(),
    ]);

    return NextResponse.json({
      products,
      gallery,
      enquiries,
      settings,
    });
  } catch (error) {
    console.error("❌ [API/Admin GET] Error:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await checkAdminGuard();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action;

    // 1. Save Product
    if (action === "save_product") {
      const parsed = saveProductSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message || "Invalid product data" },
          { status: 400 }
        );
      }
      await saveProduct(parsed.data);
      return NextResponse.json({ ok: true });
    }

    // 2. Delete Product
    if (action === "delete_product") {
      const id = Number(body.id);
      if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
      await deleteProduct(id);
      return NextResponse.json({ ok: true });
    }

    // 3. Update Enquiry Status
    if (action === "enquiry_status") {
      const id = Number(body.id);
      const status = String(body.status || "new");
      if (!id) return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });
      await updateEnquiryStatus(id, status);
      return NextResponse.json({ ok: true });
    }

    // 4. Save Website Settings
    if (action === "save_settings") {
      const settings = (body.settings || {}) as Record<string, string>;
      await saveSettings(settings);
      return NextResponse.json({ ok: true });
    }

    // 5. Toggle Gallery Item
    if (action === "gallery_toggle") {
      const id = Number(body.id);
      if (!id) return NextResponse.json({ error: "Gallery item ID required" }, { status: 400 });
      await toggleGalleryStatus(
        id,
        body.active !== undefined ? Boolean(body.active) : undefined,
        body.featured !== undefined ? Boolean(body.featured) : undefined
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("❌ [API/Admin POST] Error:", error);
    return NextResponse.json({ error: "Failed to process admin action" }, { status: 500 });
  }
}
