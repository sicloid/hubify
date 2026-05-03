"use server";

import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/serialize";
import { requireRole } from "@/lib/auth-utils";
import { uploadFileToS3 } from "@/lib/s3-upload";

/** Poliçe PDF yükler; durum DOCUMENTS_APPROVED kalır — sevkiyat için `dispatchInsuredShipment`. */
export async function uploadInsurancePolicyPdf(tradeRequestId: string, formData: FormData) {
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

  revalidatePath("/sigorta", "layout");
  revalidatePath("/sigorta/bekleyen");
  revalidatePath("/sigorta/ulasmayan-police");
  revalidatePath("/sigorta/raporlar");
  revalidatePath("/lojistik", "layout");
  revalidatePath("/pazaryeri", "layout");
  revalidateTag("trade-requests");
}

/** Poliçe PDF’i sistemde olan talebi yola çıkarır (IN_TRANSIT). */
export async function dispatchInsuredShipment(tradeRequestId: string) {
  await requireRole([UserRole.INSURER]);
  if (!tradeRequestId) return { success: false as const, error: "Geçersiz talep" };

  const policy = await prisma.document.findFirst({
    where: { tradeRequestId, type: DocumentType.INSURANCE_POLICY },
  });
  if (!policy) {
    return { success: false as const, error: "Önce poliçe PDF’i yüklenmeli." };
  }

  const req = await prisma.tradeRequest.findUnique({
    where: { id: tradeRequestId },
    select: { status: true },
  });
  if (!req || req.status !== TradeStatus.DOCUMENTS_APPROVED) {
    return { success: false as const, error: "Bu talep sevkiyat için uygun değil." };
  }

  await prisma.tradeRequest.update({
    where: { id: tradeRequestId },
    data: { status: TradeStatus.IN_TRANSIT },
  });

  revalidatePath("/sigorta", "layout");
  revalidatePath("/sigorta/bekleyen");
  revalidatePath("/sigorta/ulasmayan-police");
  revalidatePath("/sigorta/raporlar");
  revalidatePath("/lojistik", "layout");
  revalidatePath("/pazaryeri", "layout");
  revalidateTag("trade-requests");
  return { success: true as const };
}

/** Poliçe PDF’i henüz yüklenmemiş (sigortacının ilk adımı). */
export async function getPendingPolicies() {
  await requireRole([UserRole.INSURER, UserRole.ADMIN]);

  try {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        status: TradeStatus.DOCUMENTS_APPROVED,
        NOT: {
          documents: {
            some: { type: DocumentType.INSURANCE_POLICY },
          },
        },
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

/**
 * Poliçe kesildikten sonra tamamlanana kadar: poliçe PDF’i var ve durum
 * belge onaylı (henüz sevkiyat öncesi) veya yolda — tamamlananlar dahil değil.
 */
export async function getInsuredPipelineUntilCompleted() {
  await requireRole([UserRole.INSURER, UserRole.ADMIN]);

  try {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [TradeStatus.DOCUMENTS_APPROVED, TradeStatus.IN_TRANSIT],
        },
        documents: {
          some: { type: DocumentType.INSURANCE_POLICY },
        },
      },
      include: {
        exporter: { select: { fullName: true } },
        buyer: { select: { fullName: true } },
        documents: {
          where: { type: DocumentType.INSURANCE_POLICY },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return serializeDecimal(requests);
  } catch (error) {
    console.error("Sigorta pipeline takip listesi hatası:", error);
    return [];
  }
}

/** PDF yüklü, henüz IN_TRANSIT olmamış (belge onaylı + poliçe; rapor / iç kullanım). */
export async function getPoliciesAwaitingDispatch() {
  await requireRole([UserRole.INSURER, UserRole.ADMIN]);

  try {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        status: TradeStatus.DOCUMENTS_APPROVED,
        documents: {
          some: { type: DocumentType.INSURANCE_POLICY },
        },
      },
      include: {
        exporter: {
          select: { fullName: true },
        },
        documents: {
          where: { type: DocumentType.INSURANCE_POLICY },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return serializeDecimal(requests);
  } catch (error) {
    console.error("Ulaşmamış poliçe listesi hatası:", error);
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
  revalidatePath("/sigorta/bekleyen");
  revalidatePath("/sigorta/ulasmayan-police");
  revalidatePath("/sigorta/tamamlanan");
  revalidatePath("/sigorta/raporlar");
}
