import Link from "next/link";
import { TradeStatus, UserRole } from "@prisma/client";
import { Truck, ArrowLeft, Package, ChevronRight, Anchor } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { getPoolStats } from "../actions";

const statusLabel: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: "Bekliyor",
  [TradeStatus.ORDERED]: "Sipariş / Havuz",
  [TradeStatus.QUOTING]: "Teklif aşaması",
  [TradeStatus.LOGISTICS_APPROVED]: "Onaylı",
  [TradeStatus.DOCUMENTS_PENDING]: "ICC / belge",
  [TradeStatus.DOCUMENTS_APPROVED]: "Belge OK",
  [TradeStatus.IN_TRANSIT]: "Yolda",
  [TradeStatus.COMPLETED]: "Tamamlandı",
  [TradeStatus.CANCELLED]: "İptal",
};

/** Havuz ve aktif teklif süreçleri — lojistikçi odaklı liste */
export default async function LogisticsCargoPage() {
  const session = await requireRole([UserRole.LOGISTICS]);

  const [poolStats, poolRows, myQuotes] = await Promise.all([
    getPoolStats(),
    prisma.tradeRequest.findMany({
      where: {
        status: { in: [TradeStatus.ORDERED, TradeStatus.QUOTING] },
      },
      include: {
        exporter: { select: { fullName: true } },
        buyer: { select: { fullName: true } },
        _count: { select: { quotes: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 80,
    }),
    prisma.logisticsQuote.findMany({
      where: { logisticsId: session.id },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        tradeRequest: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
            status: true,
            exporter: { select: { fullName: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/lojistik"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Lojistik paneli
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="h-7 w-7 text-amber-600" />
          Kargo & Lojistik
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Konsolidasyon havuzu, teklif bekleyen siparişler ve verdiğiniz tekliflerin özeti.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Anchor className="h-3.5 w-3.5" />
            Havuz doluluğu
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">{poolStats.occupancyRate}%</p>
          <p className="text-xs text-slate-500 mt-1">
            ~{(poolStats.totalWeight / 1000).toFixed(1)} t / {(poolStats.capacity / 1000).toFixed(0)} t kapasite
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Havuzdaki talep</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{poolRows.length}</p>
          <p className="text-xs text-slate-500 mt-1">Sipariş + teklif aşaması</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Verdiğiniz teklif</p>
          <p className="text-3xl font-black text-emerald-900 mt-2">{myQuotes.length}</p>
          <p className="text-xs text-emerald-800/80 mt-1">Son kayıtlar aşağıda</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <Package className="h-5 w-5 text-slate-500" />
          <h2 className="font-bold text-slate-800">Teklif verebileceğiniz talepler ({poolRows.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {poolRows.length === 0 ? (
            <p className="p-10 text-center text-slate-500 text-sm">Havuzda bekleyen talep yok.</p>
          ) : (
            poolRows.map((t) => (
              <Link
                key={t.id}
                href={`/lojistik/${t.id}`}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-black text-slate-900">{t.referenceNumber}</p>
                  <p className="text-sm text-slate-600 truncate">{t.title}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">
                    İhracatçı: {t.exporter.fullName}
                    {t.buyer && <> · Alıcı: {t.buyer.fullName}</>}
                    {" · "}
                    {t._count.quotes} teklif
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                    {statusLabel[t.status]}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <h2 className="font-bold text-slate-800">Verdiğiniz teklifler ({myQuotes.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {myQuotes.length === 0 ? (
            <p className="p-10 text-center text-slate-500 text-sm">Henüz teklif oluşturmadınız.</p>
          ) : (
            myQuotes.slice(0, 25).map((q) => (
              <Link
                key={q.id}
                href={`/lojistik/${q.tradeRequest.id}`}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-900">{q.tradeRequest.referenceNumber}</p>
                  <p className="text-xs text-slate-500">{q.tradeRequest.title}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-black text-slate-900">
                    {Number(q.price).toLocaleString("tr-TR")} {q.currency}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {q.isAccepted ? "Kabul edildi" : "Bekliyor"} · {statusLabel[q.tradeRequest.status]}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
