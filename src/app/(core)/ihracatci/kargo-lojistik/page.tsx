import Link from "next/link";
import { TradeStatus, UserRole } from "@prisma/client";
import { Truck, ArrowLeft, Package, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

const statusLabel: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: "Pazaryerde",
  [TradeStatus.ORDERED]: "Sipariş alındı",
  [TradeStatus.QUOTING]: "Teklif toplanıyor",
  [TradeStatus.LOGISTICS_APPROVED]: "Lojistik onaylı",
  [TradeStatus.DOCUMENTS_PENDING]: "ICC / belge",
  [TradeStatus.DOCUMENTS_APPROVED]: "Belge onaylı",
  [TradeStatus.IN_TRANSIT]: "Yolda",
  [TradeStatus.COMPLETED]: "Tamamlandı",
  [TradeStatus.CANCELLED]: "İptal",
};

/** Sipariş sonrası lojistik ve sevkiyat süreçleri */
const LOGISTICS_STATUSES: TradeStatus[] = [
  TradeStatus.ORDERED,
  TradeStatus.QUOTING,
  TradeStatus.LOGISTICS_APPROVED,
  TradeStatus.DOCUMENTS_PENDING,
  TradeStatus.DOCUMENTS_APPROVED,
  TradeStatus.IN_TRANSIT,
  TradeStatus.COMPLETED,
];

export default async function ExporterLogisticsPage() {
  const session = await requireRole([UserRole.EXPORTER]);

  const rows = await prisma.tradeRequest.findMany({
    where: {
      exporterId: session.id,
      status: { in: LOGISTICS_STATUSES },
    },
    include: {
      quotes: {
        include: { logistics: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
      },
      buyer: { select: { fullName: true } },
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
          <Truck className="h-7 w-7 text-sky-600" />
          Kargo & Lojistik
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Alıcı siparişi sonrası teklifler, taşıyıcı seçimi ve sevkiyat durumu. Detay için satıra tıklayın.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <Package className="h-5 w-5 text-slate-500" />
          <h2 className="font-bold text-slate-800">Sevkiyat takibi ({rows.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <p className="p-10 text-center text-slate-500 text-sm">
              Henüz sipariş alınmış bir talep yok. Ürününüze alıcı çıktığında kayıtlar burada görünür.
            </p>
          ) : (
            rows.map((t) => {
              const accepted = t.quotes.find((q) => q.isAccepted);
              return (
                <Link
                  key={t.id}
                  href={`/ihracatci/${t.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="font-black text-slate-900">{t.referenceNumber}</p>
                    <p className="text-sm text-slate-600 truncate mt-0.5">{t.title}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">
                      Alıcı: {t.buyer?.fullName ?? "—"}
                      {accepted && (
                        <>
                          {" "}
                          · Taşıyıcı:{" "}
                          <span className="text-sky-700">{accepted.logistics.fullName}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-sky-50 text-sky-800 ring-1 ring-sky-100">
                      {statusLabel[t.status]}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
