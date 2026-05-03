import Link from "next/link";
import { TradeStatus, UserRole } from "@prisma/client";
import { BadgeCheck, Landmark, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

const statusLabel: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: "Bekliyor",
  [TradeStatus.ORDERED]: "Sipariş verildi",
  [TradeStatus.QUOTING]: "Fiyatlanıyor",
  [TradeStatus.LOGISTICS_APPROVED]: "Lojistik onaylı",
  [TradeStatus.DOCUMENTS_PENDING]: "Belge bekleniyor",
  [TradeStatus.DOCUMENTS_APPROVED]: "Belge onaylı",
  [TradeStatus.IN_TRANSIT]: "Yolda",
  [TradeStatus.COMPLETED]: "Tamamlandı",
  [TradeStatus.CANCELLED]: "İptal",
};

export default async function FinancialAdvHistoryPage() {
  await requireRole([UserRole.FINANCIAL_ADV]);

  /** Tamamlananlar tek sorguda take ile kesilmesin diye ayrı çekilir (çok IN_TRANSIT iken COMPLETED kayboluyordu) */
  const [completedList, inTransitList] = await Promise.all([
    prisma.tradeRequest.findMany({
      where: { status: TradeStatus.COMPLETED },
      include: { exporter: { select: { fullName: true } } },
      orderBy: { updatedAt: "desc" },
      take: 300,
    }),
    prisma.tradeRequest.findMany({
      where: { status: TradeStatus.IN_TRANSIT },
      include: { exporter: { select: { fullName: true } } },
      orderBy: { updatedAt: "desc" },
      take: 300,
    }),
  ]);

  const seen = new Set<string>();
  const history = [...completedList, ...inTransitList]
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/mali-musavir"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana masaya dön
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BadgeCheck className="h-7 w-7 text-emerald-600" />
            Geçmiş İşlemler
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Tamamlanan ve yoldaki dosyalar; tamamlanan kayıtlar her zaman listelenir. Detay için satıra tıklayın.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-800 ring-1 ring-emerald-100">
          Tamamlanan: {completedList.length}
        </span>
        <span className="rounded-full bg-violet-50 px-3 py-1 font-bold text-violet-800 ring-1 ring-violet-100">
          Yolda: {inTransitList.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {history.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            Henüz geçmiş işlem kaydı yok
          </div>
        ) : (
          history.map((request) => (
            <Link
              key={request.id}
              href={`/mali-musavir/${request.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/80 hover:border-slate-300 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 truncate">{request.referenceNumber}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                    İhracatçı: {request.exporter.fullName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-right">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                    request.status === TradeStatus.COMPLETED
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-violet-50 text-violet-700"
                  }`}
                >
                  {statusLabel[request.status]}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                  {new Date(request.updatedAt).toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
