"use server";

import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { uploadFileToS3 } from "@/lib/s3-upload";

async function requireIccUser() {
  return requireRole([UserRole.ICC_EXPERT]);
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
}

export async function toggleDocumentApproval(documentId: string, nextApproved: boolean) {
  await requireIccUser();
  if (!documentId) return;

  await prisma.document.update({
    where: { id: documentId },
    data: { isApproved: nextApproved },
  });

  revalidatePath("/icc-uzmani");
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
}
