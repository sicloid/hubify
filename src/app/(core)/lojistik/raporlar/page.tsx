import Link from "next/link";
import { TradeStatus, UserRole } from "@prisma/client";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Truck,
  CircleDollarSign,
  CheckCircle2,
  Package,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export default async function LogisticsReportsPage() {
  const session = await requireRole([UserRole.LOGISTICS]);

  const [
    quoteTotal,
    acceptedQuotes,
    pendingQuotes,
    activePipeline,
    completedWithUs,
  ] = await Promise.all([
    prisma.logisticsQuote.count({ where: { logisticsId: session.id } }),
    prisma.logisticsQuote.count({
      where: { logisticsId: session.id, isAccepted: true },
    }),
    prisma.logisticsQuote.count({
      where: { logisticsId: session.id, isAccepted: false },
    }),
    prisma.tradeRequest.count({
      where: {
        status: {
          notIn: [TradeStatus.COMPLETED, TradeStatus.CANCELLED, TradeStatus.PENDING],
        },
        quotes: {
          some: {
            logisticsId: session.id,
            isAccepted: true,
          },
        },
      },
    }),
    prisma.tradeRequest.count({
      where: {
        status: TradeStatus.COMPLETED,
        quotes: {
          some: {
            logisticsId: session.id,
            isAccepted: true,
          },
        },
      },
    }),
  ]);

  const recentQuotes = await prisma.logisticsQuote.findMany({
    where: { logisticsId: session.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      tradeRequest: {
        select: { id: true, referenceNumber: true, title: true, status: true },
      },
    },
  });

  const quoteValue = await prisma.logisticsQuote.aggregate({
    where: { logisticsId: session.id, isAccepted: true },
    _sum: { price: true },
  });
  const acceptedValue = Number(quoteValue._sum.price ?? 0);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-200">
              <Activity className="h-4 w-4" />
              Lojistik performansı
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">
              Raporlar & Analiz
            </h1>
            <p className="max-w-xl text-sm text-amber-100/80 font-medium">
              Teklif hacmi, kabul oranı ve üstlendiğiniz aktif operasyonlar.
            </p>
          </div>
          <Link
            href="/lojistik"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-colors"
          >
            Panele dön <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Package className="h-10 w-10 text-sky-100 bg-sky-600 rounded-2xl p-2" />
            <span className="text-xs font-black text-slate-400 uppercase">Teklif</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{quoteTotal}</p>
          <p className="text-sm text-slate-500 mt-1">Toplam verilen</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-100 bg-emerald-600 rounded-2xl p-2" />
            <span className="text-xs font-black text-slate-400 uppercase">Kabul</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{acceptedQuotes}</p>
          <p className="text-sm text-slate-500 mt-1">
            Bekleyen teklif: {pendingQuotes}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Truck className="h-10 w-10 text-violet-100 bg-violet-600 rounded-2xl p-2" />
            <span className="text-xs font-black text-slate-400 uppercase">Aktif iş</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{activePipeline}</p>
          <p className="text-sm text-slate-500 mt-1">Taşıma sürecinde</p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-amber-50/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <CircleDollarSign className="h-10 w-10 text-amber-100 bg-amber-700 rounded-2xl p-2" />
            <span className="text-xs font-black text-amber-900 uppercase">Kabul tutarı</span>
          </div>
          <p className="text-2xl font-black text-amber-950">
            {acceptedValue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-amber-900/80 mt-1">USD (kabul edilen teklifler)</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h2 className="font-black text-slate-900">Özet</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Tamamlanan taşımalar (sizin teklifiniz kabul edilmiş):{" "}
          <strong className="text-slate-900">{completedWithUs}</strong>
        </p>

        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
          Son teklifler
        </h3>
        <ul className="space-y-2">
          {recentQuotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/lojistik/${q.tradeRequest.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors text-sm"
              >
                <span className="font-bold text-slate-900">{q.tradeRequest.referenceNumber}</span>
                <span className="text-slate-600 truncate flex-1">{q.tradeRequest.title}</span>
                <span className="text-xs font-black uppercase text-amber-700">
                  {Number(q.price).toLocaleString("tr-TR")} {q.currency}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {recentQuotes.length === 0 && (
          <p className="text-center text-slate-500 py-6 text-sm">Henüz teklif vermediniz.</p>
        )}
      </div>
    </div>
  );
}
