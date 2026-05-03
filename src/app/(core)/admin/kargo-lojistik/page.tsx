import Link from "next/link";
import { TradeStatus } from "@prisma/client";
import { Truck, ArrowLeft, Package, Anchor } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminKargoLojistikPage() {
  await requireAdmin();

  const [orderedQuoting, inPipeline, quoteAgg] = await Promise.all([
    prisma.tradeRequest.count({
      where: { status: { in: [TradeStatus.ORDERED, TradeStatus.QUOTING] } },
    }),
    prisma.tradeRequest.count({
      where: {
        status: {
          in: [
            TradeStatus.LOGISTICS_APPROVED,
            TradeStatus.DOCUMENTS_PENDING,
            TradeStatus.DOCUMENTS_APPROVED,
            TradeStatus.IN_TRANSIT,
          ],
        },
      },
    }),
    prisma.logisticsQuote.count(),
  ]);

  const recent = await prisma.tradeRequest.findMany({
    where: {
      status: {
        in: [
          TradeStatus.ORDERED,
          TradeStatus.QUOTING,
          TradeStatus.LOGISTICS_APPROVED,
          TradeStatus.IN_TRANSIT,
        ],
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: {
      exporter: { select: { fullName: true } },
      _count: { select: { quotes: true } },
    },
  });

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
          <Truck className="h-7 w-7 text-amber-600" />
          Kargo & Lojistik
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Havuz, teklifler ve aktif sevkiyat hattı — yönetici görünümü.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Anchor className="h-3.5 w-3.5" />
            Havuz / teklif
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">{orderedQuoting}</p>
          <p className="text-xs text-slate-500 mt-1">Sipariş veya teklif toplama</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boru hattı</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{inPipeline}</p>
          <p className="text-xs text-slate-500 mt-1">Lojistik onayından itibaren</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/90 p-5 shadow-sm">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Toplam teklif</p>
          <p className="text-3xl font-black text-emerald-950 mt-2">{quoteAgg}</p>
          <p className="text-xs text-emerald-800/80 mt-1">LogisticsQuote kayıtları</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90 flex items-center gap-2">
          <Package className="h-5 w-5 text-slate-500" />
          <h2 className="font-bold text-slate-800">Son lojistik ilişkili talepler</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.map((t) => (
            <li key={t.id}>
              <Link
                href={`/lojistik/${t.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50/80 text-sm"
              >
                <span className="font-bold text-slate-900">{t.referenceNumber}</span>
                <span className="text-slate-600 truncate flex-1 min-w-[120px]">{t.title}</span>
                <span className="text-[10px] font-black uppercase text-slate-500">{t.status}</span>
                <span className="text-xs text-slate-400">{t._count.quotes} teklif</span>
              </Link>
            </li>
          ))}
        </ul>
        {recent.length === 0 && (
          <p className="p-10 text-center text-slate-500 text-sm">Kayıt yok.</p>
        )}
      </div>
    </div>
  );
}
