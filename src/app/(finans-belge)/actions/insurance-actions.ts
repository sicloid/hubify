"use server";

import { revalidatePath } from "next/cache";
import type { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth-utils";

const QUOTERS: UserRole[] = ["INSURER", "ADMIN"];

export async function submitInsuranceQuoteDraft(formData: FormData) {
  const session = await requireRole(QUOTERS);
  const shipmentId = formData.get("shipmentId");
  const premium = formData.get("premium");
  const currency = formData.get("currency");
  const coverageNote = formData.get("coverageNote");

  console.info("[hubify/sigorta] AUDIT quote_draft_submitted", {
    byUserId: session.id,
    shipmentId,
    premium,
    currency,
    coverageLength: typeof coverageNote === "string" ? coverageNote.length : 0,
    at: new Date().toISOString(),
  });

  revalidatePath("/sigorta");
}
