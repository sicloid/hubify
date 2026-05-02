import type { DocumentType } from "@prisma/client";

export const DOCUMENT_TYPE_LABEL_TR: Record<DocumentType, string> = {
  COMMERCIAL_INVOICE: "Ticari fatura",
  BILL_OF_LADING: "Konşimento",
  CUSTOMS_DECLARATION: "Gümrük beyannamesi",
  INSURANCE_POLICY: "Sigorta poliçesi",
  OTHER: "Diğer",
};
