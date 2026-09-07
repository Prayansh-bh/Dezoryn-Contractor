import { Router } from "express";
import multer from "multer";
import { requireJwtAuth } from "../auth/jwt-auth.middleware";
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
} from "../services/products.service";
import {
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../services/enquiries.service";
import {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
} from "../services/gallery.service";
import { getAdminSettings, saveSettings } from "../services/settings.service";
import { sendTestEmail } from "../services/email.service";
import { saveProductSchema } from "../validation/product.schema";
import {
  saveMediaFile,
  saveProductImageFile,
  deleteMediaFile,
} from "../storage/local-storage.service";
import {
  getAllLabourRequisitions,
  updateLabourRequisitionStatus,
  deleteLabourRequisition,
  getAllLabourAgencies,
  updateLabourAgency,
  deleteLabourAgency,
  getAllIndividualWorkers,
  updateIndividualWorker,
  deleteIndividualWorker,
  getWorkforceSummary,
} from "../services/workforce.service";
import {
  getAllCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  toggleCertificateStatus,
} from "../services/certificates.service";
import { saveCertificateSchema } from "@shared/schemas";

export const adminRouter = Router();

// Apply JWT auth middleware to all /api/admin routes
adminRouter.use(requireJwtAuth);

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const productImageUpload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image format. Only JPG, PNG, and WEBP files are allowed."));
    }
  },
});

// GET /api/admin - Dashboard summary & collections
adminRouter.get("/", async (_req, res) => {
  try {
    const [
      products,
      gallery,
      enquiries,
      settings,
      certificates,
      requisitions,
      agencies,
      workers,
      summary,
    ] = await Promise.all([
      getAllProducts(),
      getAllGalleryItems(),
      getAllEnquiries(250),
      getAdminSettings(),
      getAllCertificates(),
      getAllLabourRequisitions(250),
      getAllLabourAgencies(250),
      getAllIndividualWorkers(250),
      getWorkforceSummary(),
    ]);

    res.json({
      products,
      gallery,
      enquiries,
      settings,
      certificates,
      workforce: {
        requisitions,
        agencies,
        workers,
        summary,
      },
    });
  } catch (error) {
    console.error("❌ [Admin Routes GET /api/admin] Error:", error);
    res.status(500).json({ error: "Failed to load admin data" });
  }
});


// POST /api/admin - Admin management actions
adminRouter.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const action = body.action;

    // 1. Save / Update Product
    if (action === "save_product") {
      const parsed = saveProductSchema.safeParse(body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Invalid product data" });
      }
      const saved = await saveProduct(parsed.data);
      return res.json({ ok: true, product: saved });
    }

    // 2. Delete Product
    if (action === "delete_product") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Product ID required" });
      await deleteProduct(id);
      return res.json({ ok: true });
    }

    // 3. Update Enquiry Status
    if (action === "enquiry_status") {
      const id = Number(body.id);
      const status = String(body.status || "new");
      if (!id) return res.status(400).json({ error: "Enquiry ID required" });
      await updateEnquiryStatus(id, status);
      return res.json({ ok: true });
    }

    // 4. Delete Enquiry
    if (action === "delete_enquiry") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Enquiry ID required" });
      await deleteEnquiry(id);
      return res.json({ ok: true });
    }

    // 5. Save Website Settings
    if (action === "save_settings") {
      const settings = (body.settings || {}) as Record<string, string>;
      await saveSettings(settings);
      return res.json({ ok: true });
    }

    // 6. Test Brevo SMTP Email Connection
    if (action === "test_email") {
      const targetEmail = String(body.targetEmail || "").trim();
      if (!targetEmail) {
        return res.status(400).json({ error: "Recipient email is required for test email" });
      }
      const result = await sendTestEmail(targetEmail);
      return res.json({ ok: true, result });
    }

    // 7. Toggle Gallery Item
    if (action === "gallery_toggle") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Gallery item ID required" });
      await toggleGalleryStatus(
        id,
        body.active !== undefined ? Boolean(body.active) : undefined,
        body.featured !== undefined ? Boolean(body.featured) : undefined
      );
      return res.json({ ok: true });
    }

    // 8. Update Labour Requisition Status
    if (action === "requisition_status") {
      const id = Number(body.id);
      const status = String(body.status || "open");
      if (!id) return res.status(400).json({ error: "Requisition ID required" });
      await updateLabourRequisitionStatus(id, status);
      return res.json({ ok: true });
    }

    // 9. Delete Labour Requisition
    if (action === "delete_requisition") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Requisition ID required" });
      await deleteLabourRequisition(id);
      return res.json({ ok: true });
    }

    // 10. Update Labour Agency Verification & Status
    if (action === "agency_verify") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Agency ID required" });
      await updateLabourAgency(id, {
        verified: body.verified !== undefined ? Boolean(body.verified) : undefined,
        status: body.status ? String(body.status) : undefined,
        notes: body.notes !== undefined ? String(body.notes) : undefined,
      });
      return res.json({ ok: true });
    }

    // 11. Delete Labour Agency
    if (action === "delete_agency") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Agency ID required" });
      await deleteLabourAgency(id);
      return res.json({ ok: true });
    }

    // 12. Update Individual Worker Status & Verification
    if (action === "worker_status") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Worker ID required" });
      await updateIndividualWorker(id, {
        verified: body.verified !== undefined ? Boolean(body.verified) : undefined,
        status: body.status ? String(body.status) : undefined,
        notes: body.notes !== undefined ? String(body.notes) : undefined,
      });
      return res.json({ ok: true });
    }

    // 13. Delete Individual Worker
    if (action === "delete_worker") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Worker ID required" });
      await deleteIndividualWorker(id);
      return res.json({ ok: true });
    }

    // 14. Save / Update Certificate
    if (action === "save_certificate") {
      const payload = body.data || body;
      const parsed = saveCertificateSchema.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.errors[0]?.message || "Validation failed",
          issues: parsed.error.issues,
        });
      }

      if (parsed.data.id) {
        const updated = await updateCertificate(parsed.data.id, parsed.data);
        return res.json({ ok: true, ...updated, certificate: updated });
      } else {
        const created = await createCertificate(parsed.data);
        return res.status(200).json({ ok: true, ...created, certificate: created });
      }
    }

    // 15. Delete Certificate
    if (action === "delete_certificate") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Certificate ID required" });
      await deleteCertificate(id);
      return res.json({ ok: true, success: true });
    }

    // 16. Toggle Certificate Active Status
    if (action === "toggle_certificate_active") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Certificate ID required" });
      const updated = await toggleCertificateStatus(
        id,
        body.active !== undefined ? Boolean(body.active) : undefined
      );
      return res.json({ ok: true, ...updated, certificate: updated });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (error: any) {
    console.error("❌ [Admin Routes POST /api/admin] Error:", error);
    res.status(500).json({ error: error.message || "Failed to process admin action" });
  }
});

// POST /api/admin/media - Upload media file
adminRouter.post("/media", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File required" });
    }

    const isMedia = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (!isMedia) {
      return res.status(400).json({ error: "Only image or video files are allowed" });
    }

    const { objectKey } = await saveMediaFile(file.originalname, file.buffer);

    const title = String(req.body.title || file.originalname);
    const caption = String(req.body.caption || "");
    const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
    const featured = req.body.featured === "true" || req.body.featured === true;

    const item = await createGalleryItem({
      title,
      caption,
      mediaType,
      objectKey,
      fileName: file.originalname,
      contentType: file.mimetype,
      fileData: file.buffer,
      featured,
    });

    res.status(201).json({ item });
  } catch (error) {
    console.error("❌ [Admin Routes POST /api/admin/media] Error:", error);
    res.status(500).json({ error: "Failed to upload media file" });
  }
});

// DELETE /api/admin/media - Delete media file
adminRouter.delete("/media", async (req, res) => {
  try {
    const id = Number(req.query.id);
    if (!id) {
      return res.status(400).json({ error: "Media ID is required" });
    }

    const item = await getGalleryItemById(id);
    if (item) {
      if (item.objectKey) {
        await deleteMediaFile(item.objectKey);
      }
      await deleteGalleryItem(id);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ [Admin Routes DELETE /api/admin/media] Error:", error);
    res.status(500).json({ error: "Failed to delete media file" });
  }
});

// POST /api/admin/products/upload-image - Upload product custom image
adminRouter.post(
  "/products/upload-image",
  (req, res, next) => {
    productImageUpload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Image file exceeds maximum 10MB limit" });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message || "Invalid file" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "File required" });
      }

      const { localPath, objectKey } = await saveProductImageFile(
        file.originalname,
        file.buffer
      );

      res.status(200).json({
        ok: true,
        imageUrl: localPath,
        objectKey,
      });
    } catch (error) {
      console.error("❌ [Admin Routes POST /api/admin/products/upload-image] Error:", error);
      res.status(500).json({ error: "Failed to upload product image" });
    }
  }
);

// POST /api/admin/certificates/upload - Upload certificate image
adminRouter.post(
  "/certificates/upload",
  (req, res, next) => {
    productImageUpload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Certificate image exceeds maximum 10MB limit" });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message || "Invalid file" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "File required" });
      }

      const { localPath, objectKey } = await saveProductImageFile(
        file.originalname,
        file.buffer
      );

      res.status(200).json({
        ok: true,
        imageUrl: localPath,
        fileName: file.originalname,
        objectKey,
      });
    } catch (error) {
      console.error("❌ [Admin Routes POST /api/admin/certificates/upload] Error:", error);
      res.status(500).json({ error: "Failed to upload certificate image" });
    }
  }
);


