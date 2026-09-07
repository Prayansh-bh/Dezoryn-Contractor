import { prisma } from "../db/prisma";
import type { SaveCertificateInput } from "@shared/schemas";
import type { Certificate } from "@shared/types";

/**
 * Certificate Service
 * Single Responsibility: Database CRUD operations, image streaming queries,
 * and initial certification seeding for official accreditations.
 */

const INITIAL_CERTIFICATES = [
  {
    title: "ISO 9001:2015 Quality Management",
    subtitle: "Manufacturing & Supply of Thermoplastic Road Marking Materials",
    issuer: "International Organization for Standardization",
    certificateNo: "ISO-9001-IND-2024-8902",
    validUntil: "Valid Thru Dec 2027",
    imageUrl: "/images/products/thermoplastic-paint.jpg",
    fileName: "iso-9001-quality-cert.jpg",
    contentType: "image/jpeg",
    active: true,
    sortOrder: 1,
  },
  {
    title: "MORTH Section 1014 Highway Specification",
    subtitle: "Road Marking Materials & Retro-Reflective Glass Beads Standard",
    issuer: "Ministry of Road Transport & Highways, Govt. of India",
    certificateNo: "MORTH-SEC-1014-VERIFIED",
    validUntil: "Active Project Standard",
    imageUrl: "/images/products/reflective-beads.jpg",
    fileName: "morth-highway-compliance.jpg",
    contentType: "image/jpeg",
    active: true,
    sortOrder: 2,
  },
  {
    title: "NABL Laboratory Retro-Reflectance Certification",
    subtitle: "Luminance Factor & Skid Resistance Verified Laboratory Benchmarks",
    issuer: "National Accreditation Board for Testing and Calibration Laboratories",
    certificateNo: "NABL-TC-84920-LAB",
    validUntil: "Batch Tested & Certified",
    imageUrl: "/images/products/kerb-coatings.jpg",
    fileName: "nabl-lab-test-cert.jpg",
    contentType: "image/jpeg",
    active: true,
    sortOrder: 3,
  },
  {
    title: "IRC:35-2015 Road Safety & Markings Code",
    subtitle: "Standard Specifications for Highway Delineation and Crash Safety",
    issuer: "Indian Roads Congress",
    certificateNo: "IRC-35-2015-ACC",
    validUntil: "National Code Aligned",
    imageUrl: "/images/products/road-studs.jpg",
    fileName: "irc-road-safety-code.jpg",
    contentType: "image/jpeg",
    active: true,
    sortOrder: 4,
  },
];

export async function seedInitialCertificatesIfEmpty(): Promise<void> {
  try {
    const count = await prisma.certificate.count();
    if (count === 0) {
      for (const cert of INITIAL_CERTIFICATES) {
        await prisma.certificate.create({ data: cert });
      }
      console.log("✅ [CertificatesService] Initial official certifications seeded.");
    }
  } catch (error) {
    console.warn("⚠️ [CertificatesService] Seed check skipped:", error);
  }
}

export async function getAllCertificates(): Promise<Certificate[]> {
  await seedInitialCertificatesIfEmpty();
  const list = await prisma.certificate.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return list as unknown as Certificate[];
}

export async function getActiveCertificates(): Promise<Certificate[]> {
  await seedInitialCertificatesIfEmpty();
  const list = await prisma.certificate.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return list as unknown as Certificate[];
}

export async function getCertificateById(id: number): Promise<Certificate | null> {
  const item = await prisma.certificate.findUnique({
    where: { id },
  });
  return item as unknown as Certificate | null;
}

export async function createCertificate(
  data: SaveCertificateInput,
  file?: { buffer?: Buffer; fileName?: string; contentType?: string }
): Promise<Certificate> {
  const created = await prisma.certificate.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || "",
      issuer: data.issuer,
      certificateNo: data.certificateNo || "",
      validUntil: data.validUntil || "",
      imageUrl: data.imageUrl,
      fileName: file?.fileName || data.fileName || "",
      fileData: file?.buffer ? Buffer.from(file.buffer) : null,
      contentType: file?.contentType || "image/jpeg",
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return created as unknown as Certificate;
}

export async function updateCertificate(
  id: number,
  data: Partial<SaveCertificateInput>,
  file?: { buffer?: Buffer; fileName?: string; contentType?: string }
): Promise<Certificate> {
  const updatePayload: any = { ...data };
  if (file?.buffer) {
    updatePayload.fileData = Buffer.from(file.buffer);
    updatePayload.fileName = file.fileName;
    updatePayload.contentType = file.contentType;
  }

  const updated = await prisma.certificate.update({
    where: { id },
    data: updatePayload,
  });

  return updated as unknown as Certificate;
}

export async function toggleCertificateStatus(
  id: number,
  active?: boolean
): Promise<Certificate> {
  const current = await prisma.certificate.findUnique({ where: { id } });
  if (!current) throw new Error("Certificate not found");
  const nextActive = active !== undefined ? active : !current.active;
  const updated = await prisma.certificate.update({
    where: { id },
    data: { active: nextActive },
  });

  return updated as unknown as Certificate;
}

export async function deleteCertificate(id: number): Promise<Certificate> {
  const deleted = await prisma.certificate.delete({
    where: { id },
  });

  return deleted as unknown as Certificate;
}
