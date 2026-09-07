import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createLabourRequisitionSchema,
  createLabourAgencySchema,
  createIndividualWorkerSchema,
} from "@shared/schemas";
import {
  createLabourRequisition,
  createLabourAgency,
  createIndividualWorker,
  getWorkforceSummary,
} from "../services/workforce.service";

export const workforceRouter = Router();

const workforceRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many workforce requests submitted from this IP. Please try again later.",
  },
});

// GET /api/workforce/summary - Public telemetry & available trades count
workforceRouter.get("/summary", async (_req, res) => {
  try {
    const summary = await getWorkforceSummary();
    res.json(summary);
  } catch (error) {
    console.error("❌ [Workforce Routes GET /api/workforce/summary] Error:", error);
    res.status(500).json({ error: "Failed to fetch workforce telemetry" });
  }
});

// POST /api/workforce/requisitions - Contractor labour requisition submission
workforceRouter.post("/requisitions", workforceRateLimiter, async (req, res) => {
  try {
    const parsed = createLabourRequisitionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message || "Validation failed for contractor requisition",
        issues: parsed.error.issues,
      });
    }

    const requisition = await createLabourRequisition(parsed.data);

    res.status(201).json({
      ok: true,
      message: "Labour requirement posted successfully. Our operations desk will match suitable crews.",
      requisitionCode: requisition.requisitionCode,
      requisition,
    });
  } catch (error: any) {
    console.error("❌ [Workforce Routes POST /api/workforce/requisitions] Error:", error);
    res.status(500).json({ error: error.message || "Failed to submit labour requisition" });
  }
});

// POST /api/workforce/agencies - Labour agency / Subcontractor registration
workforceRouter.post("/agencies", workforceRateLimiter, async (req, res) => {
  try {
    const parsed = createLabourAgencySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message || "Validation failed for agency registration",
        issues: parsed.error.issues,
      });
    }

    try {
      const agency = await createLabourAgency(parsed.data);
      res.status(201).json({
        ok: true,
        message: "Agency profile registered successfully. Verification pending.",
        agencyCode: agency.agencyCode,
        agency,
      });
    } catch (dbErr: any) {
      if (dbErr.code === "P2002" || String(dbErr).includes("Unique constraint")) {
        return res.status(409).json({
          error: "An agency with this phone number is already registered in our database.",
        });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("❌ [Workforce Routes POST /api/workforce/agencies] Error:", error);
    res.status(500).json({ error: error.message || "Failed to register labour agency" });
  }
});

// POST /api/workforce/workers - Individual skilled/semi-skilled worker registration
workforceRouter.post("/workers", workforceRateLimiter, async (req, res) => {
  try {
    const parsed = createIndividualWorkerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message || "Validation failed for worker registration",
        issues: parsed.error.issues,
      });
    }

    try {
      const worker = await createIndividualWorker(parsed.data);
      res.status(201).json({
        ok: true,
        message: "Worker profile registered successfully in Dezoryn Skill Registry.",
        workerCode: worker.workerCode,
        worker,
      });
    } catch (dbErr: any) {
      if (dbErr.code === "P2002" || String(dbErr).includes("Unique constraint")) {
        return res.status(409).json({
          error: "A worker with this phone number is already registered.",
        });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("❌ [Workforce Routes POST /api/workforce/workers] Error:", error);
    res.status(500).json({ error: error.message || "Failed to register worker" });
  }
});
