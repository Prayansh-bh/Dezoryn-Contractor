import { prisma } from "../db/prisma";
import type {
  CreateLabourRequisitionInput,
  CreateLabourAgencyInput,
  CreateIndividualWorkerInput,
} from "@shared/schemas";
import type {
  LabourRequisition,
  LabourAgency,
  IndividualWorker,
  WorkforceSummary,
} from "@shared/types";

function generateCode(prefix: string): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`;
}

export async function createLabourRequisition(
  data: CreateLabourRequisitionInput
): Promise<LabourRequisition> {
  const requisitionCode = generateCode("REQ");
  const created = await prisma.labourRequisition.create({
    data: {
      requisitionCode,
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      projectTitle: data.projectTitle,
      projectType: data.projectType,
      locationState: data.locationState,
      locationCity: data.locationCity,
      siteAddress: data.siteAddress || "",
      totalWorkers: Number(data.totalWorkers),
      skillsRequired: data.skillsRequired || [],
      startDate: data.startDate || "",
      durationMonths: data.durationMonths || "",
      amenities: data.amenities || [],
      dailyWageBudget: data.dailyWageBudget || "",
      message: data.message || "",
      status: "open",
    },
  });

  return created as unknown as LabourRequisition;
}

export async function getAllLabourRequisitions(limit = 250): Promise<LabourRequisition[]> {
  const list = await prisma.labourRequisition.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return list as unknown as LabourRequisition[];
}

export async function updateLabourRequisitionStatus(
  id: number,
  status: string
): Promise<LabourRequisition> {
  const updated = await prisma.labourRequisition.update({
    where: { id },
    data: { status },
  });
  return updated as unknown as LabourRequisition;
}

export async function deleteLabourRequisition(id: number): Promise<LabourRequisition> {
  const deleted = await prisma.labourRequisition.delete({
    where: { id },
  });
  return deleted as unknown as LabourRequisition;
}

export async function createLabourAgency(
  data: CreateLabourAgencyInput
): Promise<LabourAgency> {
  const agencyCode = generateCode("AGC");
  const created = await prisma.labourAgency.create({
    data: {
      agencyCode,
      agencyName: data.agencyName,
      proprietorName: data.proprietorName,
      phone: data.phone,
      email: data.email || null,
      gstin: data.gstin || null,
      labourLicenseNo: data.labourLicenseNo || null,
      state: data.state,
      city: data.city,
      totalCrewSize: Number(data.totalCrewSize),
      primaryTrades: data.primaryTrades || [],
      preferredStates: data.preferredStates || [],
      availability: data.availability || "immediate",
      verified: false,
      status: "active",
    },
  });

  return created as unknown as LabourAgency;
}

export async function getAllLabourAgencies(limit = 250): Promise<LabourAgency[]> {
  const list = await prisma.labourAgency.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return list as unknown as LabourAgency[];
}

export async function updateLabourAgency(
  id: number,
  updates: { verified?: boolean; status?: string; notes?: string }
): Promise<LabourAgency> {
  const updated = await prisma.labourAgency.update({
    where: { id },
    data: updates,
  });
  return updated as unknown as LabourAgency;
}

export async function deleteLabourAgency(id: number): Promise<LabourAgency> {
  const deleted = await prisma.labourAgency.delete({
    where: { id },
  });
  return deleted as unknown as LabourAgency;
}

export async function createIndividualWorker(
  data: CreateIndividualWorkerInput
): Promise<IndividualWorker> {
  const workerCode = generateCode("WRK");
  const created = await prisma.individualWorker.create({
    data: {
      workerCode,
      fullName: data.fullName,
      phone: data.phone,
      trade: data.trade,
      experienceYears: Number(data.experienceYears || 1),
      currentCity: data.currentCity,
      currentState: data.currentState,
      dailyWageExpect: data.dailyWageExpect || null,
      canRelocate: data.canRelocate ?? true,
      availability: data.availability || "immediate",
      verified: false,
      status: "available",
    },
  });

  return created as unknown as IndividualWorker;
}

export async function getAllIndividualWorkers(limit = 250): Promise<IndividualWorker[]> {
  const list = await prisma.individualWorker.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return list as unknown as IndividualWorker[];
}

export async function updateIndividualWorker(
  id: number,
  updates: { verified?: boolean; status?: string; notes?: string }
): Promise<IndividualWorker> {
  const updated = await prisma.individualWorker.update({
    where: { id },
    data: updates,
  });
  return updated as unknown as IndividualWorker;
}

export async function deleteIndividualWorker(id: number): Promise<IndividualWorker> {
  const deleted = await prisma.individualWorker.delete({
    where: { id },
  });
  return deleted as unknown as IndividualWorker;
}

export async function getWorkforceSummary(): Promise<WorkforceSummary> {
  const [
    totalRequisitions,
    openRequisitions,
    agencies,
    totalWorkers,
  ] = await Promise.all([
    prisma.labourRequisition.count(),
    prisma.labourRequisition.count({ where: { status: "open" } }),
    prisma.labourAgency.findMany({ select: { totalCrewSize: true, verified: true } }),
    prisma.individualWorker.count({ where: { status: "available" } }),
  ]);

  const verifiedAgencies = agencies.filter((a) => a.verified).length;
  const agencyWorkers = agencies.reduce((acc, a) => acc + (a.totalCrewSize || 0), 0);
  const totalWorkforcePool = (agencyWorkers + totalWorkers) || 2850;

  return {
    totalRequisitions,
    openRequisitions,
    totalAgencies: agencies.length,
    verifiedAgencies,
    totalWorkers,
    totalWorkforcePool,
    topTrades: [
      "Bar Benders & Rebar Fitters",
      "Highway Paver & Roller Operators",
      "W-Beam Crash Barrier Erection Crew",
      "Thermoplastic Road Marking Technicians",
      "Heavy Plant / Hydra & JCB Operators",
      "Shuttering & Formwork Carpenters",
      "Kerb Casting & Masonry Specialists",
    ],
  };
}
