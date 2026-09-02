import { prisma } from "../db/prisma";
import type { CreateEnquiryInput } from "@shared/schemas";
import type { Enquiry } from "@shared/types";

export async function createEnquiry(data: CreateEnquiryInput): Promise<Enquiry> {
  const created = await prisma.enquiry.create({
    data: {
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email,
      product: data.product,
      quantity: data.quantity,
      location: data.location,
      message: data.message || "",
      status: "new",
    },
  });
  return created;
}

export async function getAllEnquiries(limit = 250): Promise<Enquiry[]> {
  return prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function updateEnquiryStatus(id: number, status: string): Promise<Enquiry> {
  return prisma.enquiry.update({
    where: { id },
    data: { status },
  });
}
