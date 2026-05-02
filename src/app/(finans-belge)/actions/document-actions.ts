"use server";

import { revalidatePath } from "next/cache";
import type { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

const APPROVERS: UserRole[] = ["ICC_EXPERT", "ADMIN"];

export async function approveDocument(formData: FormData) {
  await requireRole(APPROVERS);
  const id = formData.get("documentId");
  if (!id || typeof id !== "string") {
    throw new Error("Geçersiz belge");
  }

  const updated = await prisma.document.updateMany({
    where: { id, isApproved: false },
    data: { isApproved: true },
  });

  if (updated.count === 0) {
    console.warn("[hubify/document] approve skipped — not found or already approved", { documentId: id });
  } else {
    console.info("[hubify/document] AUDIT approve", {
      documentId: id,
      at: new Date().toISOString(),
    });
  }

  revalidatePath("/evraklar");
}
