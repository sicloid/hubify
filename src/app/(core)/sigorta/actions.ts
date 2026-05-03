"use server";

import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { uploadFileToS3 } from "@/lib/s3-upload";

export async function issuePolicyAndDispatch(tradeRequestId: string, formData: FormData) {
  const session = await requireRole([UserRole.INSURER]);
  if (!tradeRequestId) return;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const fileUrl = await uploadFileToS3(file, `insurer/${tradeRequestId}`);

  const existing = await prisma.document.findFirst({
    where: { tradeRequestId, type: DocumentType.INSURANCE_POLICY },
  });

  if (!existing) {
    await prisma.document.create({
      data: {
        name: file.name,
        fileUrl,
        type: DocumentType.INSURANCE_POLICY,
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

  await prisma.tradeRequest.update({
    where: { id: tradeRequestId },
    data: { status: TradeStatus.IN_TRANSIT },
  });

  revalidatePath("/sigorta", "layout");
  revalidatePath("/lojistik", "layout");
  revalidatePath("/pazaryeri", "layout");
  revalidateTag("trade-requests");
}

import { serializeDecimal } from "@/lib/serialize";

export async function getPendingPolicies() {
  await requireRole([UserRole.INSURER, UserRole.ADMIN]);

  try {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        status: TradeStatus.DOCUMENTS_APPROVED
      },
      include: {
        exporter: {
          select: { fullName: true }
        },
        documents: {
          where: {
            type: {
              in: [DocumentType.COMMERCIAL_INVOICE, DocumentType.OTHER]
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return serializeDecimal(requests);
  } catch (error) {
    console.error("Sigorta bekleyen listesi hatası:", error);
    return [];
  }
}

export async function getCompletedPolicies() {
  await requireRole([UserRole.INSURER, UserRole.ADMIN]);

  try {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        status: TradeStatus.COMPLETED
      },
      include: {
        exporter: {
          select: { fullName: true }
        },
        documents: {
          where: {
            type: DocumentType.INSURANCE_POLICY
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return serializeDecimal(requests);
  } catch (error) {
    console.error("Sigorta tamamlanan listesi hatası:", error);
    return [];
  }
}

export async function markShipmentCompleted(tradeRequestId: string) {
  await requireRole([UserRole.INSURER]);
  if (!tradeRequestId) return;

  await prisma.tradeRequest.update({
    where: { id: tradeRequestId },
    data: { status: TradeStatus.COMPLETED },
  });

  revalidatePath("/sigorta", "layout");
}
