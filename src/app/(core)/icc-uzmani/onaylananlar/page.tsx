import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, CalendarDays, FileCheck2, ShieldCheck, Truck } from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

const iccTypes = [DocumentType.BILL_OF_LADING, DocumentType.CUSTOMS_DECLARATION];

const documentLabels: Record<DocumentType, string> = {
  COMMERCIAL_INVOICE: "Ticari Fatura",
  BILL_OF_LADING: "Konşimento",
  CUSTOMS_DECLARATION: "Gümrük Beyannamesi",
  INSURANCE_POLICY: "Sigorta Poliçesi",
  OTHER: "Diğer Belge",
};

export default async function IccApprovedDocumentsPage() {
  await requireRole([UserRole.ICC_EXPERT]);

  const approvedRequests = await prisma.tradeRequest.findMany({
    where: {
      status: { in: [TradeStatus.DOCUMENTS_APPROVED, TradeStatus.IN_TRANSIT, TradeStatus.COMPLETED] },
      documents: {
        some: {
          type: { in: iccTypes },
          isApproved: true,
        },
      },
    },
    include: {
      exporter: { select: { fullName: true } },
      quotes: {
        include: {
          logistics: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        where: { type: { in: iccTypes }, isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              ICC Onaylanmis Belgeler
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Onceki denetimlerde onaylanan gumruk belgelerini bu ekrandan inceleyebilirsiniz.
            </p>
          </div>
          <Link
            href="/icc-uzmani"
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ICC Paneline Don
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {approvedRequests.map((request) => (
          <section key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">{request.referenceNumber}</h2>
              <p className="text-sm text-slate-500">
                Ihracatci: {request.exporter.fullName} • Son durum: {request.status}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Son guncelleme: {new Date(request.updatedAt).toLocaleString("tr-TR")}
              </p>
            </div>

            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Talep Ayrintilari</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{request.title}</p>
              <p className="mt-1 text-sm text-slate-600">{request.description || "Açıklama bulunmuyor."}</p>

              {request.quotes[0] ? (
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-3">
                  <p className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-sky-600" />
                    Lojistik: {request.quotes[0].logistics.fullName}
                  </p>
                  <p className="font-semibold text-slate-800">
                    Teklif: {request.quotes[0].price.toString()} {request.quotes[0].currency}
                  </p>
                  <p className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                    {request.quotes[0].estimatedDays} gun
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">Bu taleple ilişkili teklif bulunamadı.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {request.documents.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <FileCheck2 className="h-4 w-4 text-emerald-600" />
                    {documentLabels[doc.type]}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 truncate">{doc.name}</p>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    Belgeyi Goruntule
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}

        {approvedRequests.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Henüz onaylanmış ICC belgesi bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
