import Link from "next/link";
import { DocumentType, TradeStatus } from "@prisma/client";
import { Files, ArrowLeft, FileCheck, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

const docTypeLabel: Record<DocumentType, string> = {
  [DocumentType.COMMERCIAL_INVOICE]: "Fatura",
  [DocumentType.BILL_OF_LADING]: "Konşimento",
  [DocumentType.CUSTOMS_DECLARATION]: "Gümrük",
  [DocumentType.INSURANCE_POLICY]: "Sigorta",
  [DocumentType.OTHER]: "Diğer",
};

export default async function AdminGumrukBelgeleriPage() {
  await requireAdmin();

  const customsDocs = await prisma.document.findMany({
    where: {
      OR: [
        { type: DocumentType.CUSTOMS_DECLARATION },
        {
          tradeRequest: {
            status: {
              in: [
                TradeStatus.LOGISTICS_APPROVED,
                TradeStatus.DOCUMENTS_PENDING,
                TradeStatus.DOCUMENTS_APPROVED,
              ],
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 150,
    include: {
      tradeRequest: {
        select: { referenceNumber: true, title: true, status: true },
      },
      uploadedBy: { select: { fullName: true, role: true } },
    },
  });

  const visible = customsDocs.filter((d) => !d.fileUrl.startsWith("internal://"));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Güvenlik komuta merkezi
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Files className="h-7 w-7 text-violet-600" />
          Gümrük Belgeleri
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Gümrük beyannameleri ve gümrük sürecindeki taleplerin belgeleri.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <p className="font-bold text-slate-800">Belgeler ({visible.length})</p>
        </div>
        <div className="divide-y divide-slate-100">
          {visible.length === 0 ? (
            <p className="p-10 text-center text-slate-500 text-sm">Kayıt yok.</p>
          ) : (
            visible.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/80"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <FileCheck className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                      {docTypeLabel[doc.type]} · {doc.tradeRequest.referenceNumber} ·{" "}
                      {doc.tradeRequest.status}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Yükleyen: {doc.uploadedBy.fullName} ({doc.uploadedBy.role})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                      doc.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {doc.isApproved ? "Onaylı" : "İncelemede"}
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black uppercase text-sky-600 hover:underline"
                  >
                    Aç <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <Link
                    href={`/ihracatci/${doc.tradeRequestId}`}
                    className="text-[10px] font-black uppercase text-slate-500 hover:text-sky-600"
                  >
                    Talep
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
