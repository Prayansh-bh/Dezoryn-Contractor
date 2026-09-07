import fs from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getPublicSettings } from "../services/settings.service";
import { createEnquiry } from "../services/enquiries.service";
import { sendEnquiryNotifications } from "../services/email.service";
import { getActiveProducts, getProductBySlug } from "../services/products.service";
import { getActiveGalleryItems, getGalleryItemById } from "../services/gallery.service";
import { getActiveCertificates, getCertificateById } from "../services/certificates.service";
import { getMediaFile } from "../storage/local-storage.service";
import { createEnquirySchema } from "../validation/enquiry.schema";

export const publicRouter = Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many quote requests submitted from this IP. Please try again later.",
  },
});

// GET /api/settings - Public website settings & metadata (Strips sensitive SMTP keys)
publicRouter.get("/settings", async (_req, res) => {
  try {
    const settings = await getPublicSettings();
    res.json(settings);
  } catch (error) {
    console.error("❌ [Public Routes GET /api/settings] Error:", error);
    res.status(500).json({});
  }
});

// GET /api/products - Active products list
publicRouter.get("/products", async (_req, res) => {
  try {
    const products = await getActiveProducts();
    res.json(products);
  } catch (error) {
    console.error("❌ [Public Routes GET /api/products] Error:", error);
    res.status(500).json([]);
  }
});

// GET /api/products/:slug - Product details
publicRouter.get("/products/:slug", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(`❌ [Public Routes GET /api/products/${req.params.slug}] Error:`, error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/gallery - Active gallery media
publicRouter.get("/gallery", async (_req, res) => {
  try {
    const items = await getActiveGalleryItems();
    res.json(items);
  } catch (error) {
    console.error("❌ [Public Routes GET /api/gallery] Error:", error);
    res.status(500).json([]);
  }
});

// GET /api/certificates - Active certificates list
publicRouter.get("/certificates", async (_req, res) => {
  try {
    const list = await getActiveCertificates();
    res.json(list);
  } catch (error) {
    console.error("❌ [Public Routes GET /api/certificates] Error:", error);
    res.status(500).json([]);
  }
});

// POST /api/enquiries - Submit contact/quote enquiry
publicRouter.post("/enquiries", enquiryLimiter, async (req, res) => {
  try {
    const parsed = createEnquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: parsed.error.issues,
      });
    }

    // 1. Commit lead to PostgreSQL database first
    const enquiry = await createEnquiry(parsed.data);

    // 2. Dispatch email notification
    try {
      await sendEnquiryNotifications(enquiry);
    } catch (err: any) {
      console.warn("⚠️ [EmailService] Asynchronous email dispatch error:", err.message);
    }

    res.status(201).json({
      message: "Enquiry submitted successfully",
      enquiryId: enquiry.id,
    });
  } catch (error) {
    console.error("❌ [Public Routes POST /api/enquiries] Error:", error);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

// GET /api/media/:id - Stream media binary / fallback
publicRouter.get("/media/:id", async (req, res) => {
  try {
    const mediaId = Number(req.params.id);
    if (!mediaId) {
      return res.status(400).send("Invalid ID");
    }

    const item = await getGalleryItemById(mediaId);
    if (!item || !item.active) {
      return res.status(404).send("Not found");
    }

    let fileBuffer: Buffer | null = null;
    if (item.objectKey) {
      fileBuffer = await getMediaFile(item.objectKey);
    }
    if (!fileBuffer && item.fileData) {
      fileBuffer = Buffer.from(item.fileData);
    }
    if (!fileBuffer && item.fileName) {
      const candidatePaths = [
        path.join(process.cwd(), "public", "images", "products", item.fileName),
        path.join(process.cwd(), "..", "public", "images", "products", item.fileName),
        path.resolve(process.cwd(), "public", "images", "products", item.fileName),
      ];
      for (const p of candidatePaths) {
        try {
          fileBuffer = await fs.readFile(p);
          if (fileBuffer) break;
        } catch {
          // Continue searching
        }
      }
    }

    if (!fileBuffer) {
      return res.status(404).send("Media file not found");
    }

    res.setHeader("Content-Type", item.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Disposition", `inline; filename="${item.fileName.replace(/"/g, "")}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error(`❌ [Public Routes GET /api/media/${req.params.id}] Error:`, error);
    res.status(500).send("Server error");
  }
});

// GET /api/certificates/:id/image - Stream certificate image binary
publicRouter.get("/certificates/:id/image", async (req, res) => {
  try {
    const certId = Number(req.params.id);
    if (!certId) {
      return res.status(400).send("Invalid certificate ID");
    }

    const cert = await getCertificateById(certId);
    if (!cert || !cert.active) {
      return res.status(404).send("Certificate not found");
    }

    if (cert.fileData) {
      res.setHeader("Content-Type", cert.contentType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(Buffer.from(cert.fileData));
    }

    if (cert.imageUrl) {
      const cleanPath = cert.imageUrl.replace(/^\//, "");
      const candidatePaths = [
        path.join(process.cwd(), "public", cleanPath),
        path.join(process.cwd(), "..", "public", cleanPath),
        path.resolve(process.cwd(), "public", cleanPath),
      ];

      for (const p of candidatePaths) {
        try {
          const fileBuffer = await fs.readFile(p);
          if (fileBuffer) {
            res.setHeader("Content-Type", cert.contentType || "image/jpeg");
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.send(fileBuffer);
          }
        } catch {
          // Continue searching candidates
        }
      }

      if (cert.imageUrl.startsWith("http://") || cert.imageUrl.startsWith("https://")) {
        return res.redirect(cert.imageUrl);
      }
    }

    res.status(404).send("Certificate image not found");
  } catch (error) {
    console.error(`❌ [Public Routes GET /api/certificates/${req.params.id}/image] Error:`, error);
    res.status(500).send("Server error");
  }
});

