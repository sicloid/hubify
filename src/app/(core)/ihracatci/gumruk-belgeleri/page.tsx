import Link from "next/link";
import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { Files, ArrowLeft, FileCheck, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

const docTypeLabel: Record<DocumentType, string> = {
  [DocumentType.COMMERCIAL_INVOICE]: "Ticari fatura",
  [DocumentType.BILL_OF_LADING]: "Konşimento",
  [DocumentType.CUSTOMS_DECLARATION]: "Gümrük beyannamesi",
  [DocumentType.INSURANCE_POLICY]: "Sigorta poliçesi",
  [DocumentType.OTHER]: "Diğer",
};

const customsStatuses: TradeStatus[] = [
  TradeStatus.LOGISTICS_APPROVED,
  TradeStatus.DOCUMENTS_PENDING,
  TradeStatus.DOCUMENTS_APPROVED,
  TradeStatus.IN_TRANSIT,
  TradeStatus.COMPLETED,
];

export default async function ExporterCustomsDocumentsPage() {
  const session = await requireRole([UserRole.EXPORTER]);

  const trades = await prisma.tradeRequest.findMany({
    where: {
      exporterId: session.id,
      status: { in: customsStatuses },
    },
    include: {
      documents: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/ihracatci"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          İhracatçı paneli
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Files className="h-7 w-7 text-violet-600" />
          Gümrük Belgeleri
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          ICC ve gümrük sürecine giren dosyalarınızdaki yüklenen belgeler. Onay durumu ve indirme bağlantıları.
        </p>
      </div>

      <div className="space-y-6">
        {trades.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500 text-sm">
            Bu aşamada görüntülenecek gümrük dosyası yok. Lojistik onayı sonrası kayıtlar burada listelenir.
          </div>
        ) : (
          trades.map((t) => {
            const visible = t.documents.filter(
              (d) => !d.fileUrl.startsWith("internal://"),
            );
            return (
              <section
                key={t.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{t.referenceNumber}</h2>
                    <p className="text-sm text-slate-600">{t.title}</p>
                  </div>
                  <Link
                    href={`/ihracatci/${t.id}`}
                    className="text-xs font-black uppercase text-sky-600 hover:underline"
                  >
                    Talep detayı →
                  </Link>
                </div>
                {visible.length === 0 ? (
                  <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                    Bu talep için henüz görünür belge yüklenmemiş. ICC uzmanı veya siz yükleme yaptıkça burada listelenir.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {visible.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCheck className="h-5 w-5 text-violet-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase">
                              {docTypeLabel[doc.type]}
                              {doc.isApproved ? " · Onaylı" : " · İncelemede"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-sky-600 uppercase hover:underline shrink-0"
                        >
                          Aç <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
