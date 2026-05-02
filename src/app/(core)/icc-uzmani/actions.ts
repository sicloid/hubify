"use server";

import { DocumentType, TradeStatus, UserRole, PaymentStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { uploadFileToS3 } from "@/lib/s3-upload";

async function requireIccUser() {
  return requireRole([UserRole.ICC_EXPERT, UserRole.ADMIN]);
}

const getCachedIccRequests = unstable_cache(
  async () => {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [TradeStatus.LOGISTICS_APPROVED, TradeStatus.DOCUMENTS_PENDING, TradeStatus.DOCUMENTS_APPROVED]
        }
      },
      include: {
        exporter: {
          select: { fullName: true }
        },
        buyer: {
          select: { fullName: true }
        },
        quotes: {
          where: { isAccepted: true },
          include: {
            logistics: {
              select: { fullName: true }
            }
          }
        },
        documents: true,
        _count: {
          select: { documents: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return requests.map(request => ({
      ...request,
      unitPrice: request.unitPrice ? Number(request.unitPrice) : null,
      totalPrice: request.totalPrice ? Number(request.totalPrice) : null,
      quotes: request.quotes.map(q => ({
        ...q,
        price: Number(q.price)
      }))
    }));
  },
  ['icc-requests'],
  { tags: ['trade-requests'], revalidate: 30 }
);

export async function getIccRequests() {
  await requireIccUser();
  
  try {
    return await getCachedIccRequests();
  } catch (error) {
    console.error("ICC talepleri çekilirken hata:", error);
    return [];
  }
}

export async function approveDocuments(tradeRequestId: string) {
  await requireIccUser();
  
  try {
    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: { status: TradeStatus.DOCUMENTS_APPROVED }
    });
    
    revalidatePath("/icc-uzmani");
    revalidatePath("/mali-musavir");
    revalidatePath("/sigorta");
    revalidatePath(`/ihracatci/${tradeRequestId}`);
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Belge onaylama hatası:", error);
    return { success: false };
  }
}

export async function uploadComplianceDocument(tradeRequestId: string, docType: DocumentType, formData: FormData) {
  const session = await requireIccUser();

  if (!tradeRequestId) return;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const fileUrl = await uploadFileToS3(file, `icc/${tradeRequestId}`);

  const existing = await prisma.document.findFirst({
    where: { tradeRequestId, type: docType },
  });

  if (!existing) {
    await prisma.document.create({
      data: {
        name: file.name,
        fileUrl,
        type: docType,
        isApproved: false,
        tradeRequestId,
        uploadedById: session.id,
      },
    });
  } else {
    await prisma.document.update({
      where: { id: existing.id },
      data: { name: file.name, fileUrl, isApproved: false, uploadedById: session.id },
    });
  }

  await prisma.tradeRequest.update({
    where: { id: tradeRequestId },
    data: { status: TradeStatus.DOCUMENTS_PENDING },
  });

  revalidatePath("/icc-uzmani");
  revalidateTag('trade-requests', { expire: 0 });
}

export async function toggleDocumentApproval(documentId: string, nextApproved: boolean) {
  await requireIccUser();
  if (!documentId) return;

  await prisma.document.update({
    where: { id: documentId },
    data: { isApproved: nextApproved },
  });
}

export async function finalizeIccReview(tradeRequestId: string) {
  await requireIccUser();
  if (!tradeRequestId) return;

  const docs = await prisma.document.findMany({
    where: {
      tradeRequestId,
      type: { in: [DocumentType.BILL_OF_LADING, DocumentType.CUSTOMS_DECLARATION] },
    },
  });

  const hasApprovedBillOfLading = docs.some(
    (doc) => doc.type === DocumentType.BILL_OF_LADING && doc.isApproved,
  );
  const hasApprovedCustoms = docs.some(
    (doc) => doc.type === DocumentType.CUSTOMS_DECLARATION && doc.isApproved,
  );

  if (!hasApprovedBillOfLading || !hasApprovedCustoms) return;

  await prisma.tradeRequest.update({
    where: { id: tradeRequestId },
    data: { status: TradeStatus.DOCUMENTS_APPROVED },
  });

  revalidatePath("/icc-uzmani");
  revalidatePath("/mali-musavir");
  revalidatePath("/sigorta");
  revalidateTag('trade-requests', { expire: 0 });
}

// ICC Escrow: Ödemeyi satıcıya aktar
export async function releaseEscrow(tradeRequestId: string) {
  await requireIccUser();

  try {
    const request = await prisma.tradeRequest.findUnique({
      where: { id: tradeRequestId }
    });

    if (!request) {
      return { success: false, error: "Talep bulunamadı." };
    }

    if (request.paymentStatus !== PaymentStatus.ESCROW_HELD) {
      return { success: false, error: "Ödeme escrow'da değil, aktarım yapılamaz." };
    }

    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: {
        paymentStatus: PaymentStatus.RELEASED_TO_SELLER,
      }
    });

    revalidatePath("/icc-uzmani");
    revalidatePath("/ihracatci");
    revalidatePath("/pazaryeri");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Escrow aktarma hatası:", error);
    return { success: false, error: "Aktarma başarısız." };
  }
}

// ICC Escrow: İade et
export async function refundEscrow(tradeRequestId: string) {
  await requireIccUser();

  try {
    const request = await prisma.tradeRequest.findUnique({
      where: { id: tradeRequestId }
    });

    if (!request || request.paymentStatus !== PaymentStatus.ESCROW_HELD) {
      return { success: false, error: "İade yapılacak ödeme bulunamadı." };
    }

    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
        status: TradeStatus.CANCELLED,
      }
    });

    revalidatePath("/icc-uzmani");
    revalidatePath("/ihracatci");
    revalidatePath("/pazaryeri");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("İade hatası:", error);
    return { success: false, error: "İade başarısız." };
  }
}
