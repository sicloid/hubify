"use server";

import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { uploadFileToS3 } from "@/lib/s3-upload";

async function requireFinancialAdvisor() {
  return requireRole([UserRole.FINANCIAL_ADV]);
}

export async function uploadInvoice(tradeRequestId: string, formData: FormData) {
  const session = await requireFinancialAdvisor();
  if (!tradeRequestId) return;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const fileUrl = await uploadFileToS3(file, `financial/${tradeRequestId}`);

  const existing = await prisma.document.findFirst({
    where: { tradeRequestId, type: DocumentType.COMMERCIAL_INVOICE },
  });

  if (!existing) {
    await prisma.document.create({
      data: {
        name: file.name,
        fileUrl,
        type: DocumentType.COMMERCIAL_INVOICE,
        isApproved: true,
        tradeRequestId,
        uploadedById: session.id,
      },
    });
  } else {
    await prisma.document.update({
      where: { id: existing.id },
      data: { name: file.name, fileUrl, isApproved: true, uploadedById: session.id },
    });
  }

  revalidatePath("/mali-musavir", "layout");
  revalidatePath(`/mali-musavir/${tradeRequestId}`);
}

export async function uploadVatReport(tradeRequestId: string, formData: FormData) {
  const session = await requireFinancialAdvisor();
  if (!tradeRequestId) return;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const fileUrl = await uploadFileToS3(file, `financial/${tradeRequestId}`);

  const existing = await prisma.document.findFirst({
    where: {
      tradeRequestId,
      type: DocumentType.OTHER,
      name: { contains: "kdv", mode: "insensitive" },
    },
  });

  if (!existing) {
    await prisma.document.create({
      data: {
        name: `KDV - ${file.name}`,
        fileUrl,
        type: DocumentType.OTHER,
        isApproved: true,
        tradeRequestId,
        uploadedById: session.id,
      },
    });
  } else {
    await prisma.document.update({
      where: { id: existing.id },
      data: { name: `KDV - ${file.name}`, fileUrl, isApproved: true, uploadedById: session.id },
    });
  }

  const hasInvoice = await prisma.document.findFirst({
    where: { tradeRequestId, type: DocumentType.COMMERCIAL_INVOICE },
  });

  if (hasInvoice) {
    const financeReadyMarker = await prisma.document.findFirst({
      where: {
        tradeRequestId,
        type: DocumentType.OTHER,
        name: "finance-ready",
      },
    });

    if (!financeReadyMarker) {
      await prisma.document.create({
        data: {
          name: "finance-ready",
          fileUrl: "internal://financial/finance-ready",
          type: DocumentType.OTHER,
          isApproved: true,
          tradeRequestId,
          uploadedById: session.id,
        },
      });
    }
  }

  await prisma.tradeRequest.update({
    where: { id: tradeRequestId },
    data: { status: TradeStatus.DOCUMENTS_APPROVED },
  });

  revalidatePath("/mali-musavir", "layout");
  revalidatePath(`/mali-musavir/${tradeRequestId}`);
  revalidatePath("/sigorta", "layout");
}
