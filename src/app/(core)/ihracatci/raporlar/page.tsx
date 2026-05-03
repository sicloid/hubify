import Link from "next/link";
import { TradeStatus, UserRole } from "@prisma/client";

const statusLabel: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: "İlan",
  [TradeStatus.ORDERED]: "Sipariş",
  [TradeStatus.QUOTING]: "Teklif",
  [TradeStatus.LOGISTICS_APPROVED]: "Lojistik OK",
  [TradeStatus.DOCUMENTS_PENDING]: "Belge bekliyor",
  [TradeStatus.DOCUMENTS_APPROVED]: "Belge OK",
  [TradeStatus.IN_TRANSIT]: "Yolda",
  [TradeStatus.COMPLETED]: "Tamamlandı",
  [TradeStatus.CANCELLED]: "İptal",
};
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Package,
  Truck,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export default async function ExporterReportsPage() {
  const session = await requireRole([UserRole.EXPORTER]);

  const all = await prisma.tradeRequest.findMany({
    where: { exporterId: session.id },
    orderBy: { createdAt: "desc" },
  });

  const activePipeline = all.filter(
    (t) =>
      t.status !== TradeStatus.COMPLETED &&
      t.status !== TradeStatus.CANCELLED &&
      t.status !== TradeStatus.PENDING,
  );
  const completed = all.filter((t) => t.status === TradeStatus.COMPLETED);
  const listed = all.filter((t) => t.status === TradeStatus.PENDING);
  const inTransit = all.filter((t) => t.status === TradeStatus.IN_TRANSIT);

  const revenue = completed.reduce(
    (s, t) => s + Number(t.totalPrice ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-200">
              <Activity className="h-4 w-4" />
              İhracatçı raporu
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">
              Raporlar & Analiz
            </h1>
            <p className="max-w-xl text-sm text-sky-100/80 font-medium">
              İlanlarınız, boru hattındaki işlemler ve tamamlanan satış cirosu tek ekranda.
            </p>
          </div>
          <Link
            href="/ihracatci"
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
            <span className="text-xs font-black text-slate-400 uppercase">İlan</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{listed.length}</p>
          <p className="text-sm text-slate-500 mt-1">Pazaryerinde aktif</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="h-10 w-10 text-indigo-100 bg-indigo-600 rounded-2xl p-2" />
            <span className="text-xs font-black text-slate-400 uppercase">Pipeline</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{activePipeline.length}</p>
          <p className="text-sm text-slate-500 mt-1">Sipariş sonrası süreçte</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Truck className="h-10 w-10 text-violet-100 bg-violet-600 rounded-2xl p-2" />
            <span className="text-xs font-black text-slate-400 uppercase">Yolda</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{inTransit.length}</p>
          <p className="text-sm text-slate-500 mt-1">Sevkiyatta</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <CircleDollarSign className="h-10 w-10 text-emerald-100 bg-emerald-700 rounded-2xl p-2" />
            <span className="text-xs font-black text-emerald-800 uppercase">Ciro</span>
          </div>
          <p className="text-2xl font-black text-emerald-950">
            {revenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}{" "}
            <span className="text-sm font-bold text-emerald-800">USD</span>
          </p>
          <p className="text-sm text-emerald-800/80 mt-1">{completed.length} tamamlanan</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h2 className="font-black text-slate-900">Son talepler</h2>
        </div>
        <ul className="space-y-3">
          {all.slice(0, 12).map((t) => (
            <li key={t.id}>
              <Link
                href={`/ihracatci/${t.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-slate-900">{t.referenceNumber}</span>
                <span className="text-sm text-slate-600 truncate flex-1 min-w-[120px]">
                  {t.title}
                </span>
                <span className="text-xs font-black uppercase text-sky-700">
                  {statusLabel[t.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {all.length === 0 && (
          <p className="text-center text-slate-500 py-8 text-sm">
            Veri oluşturmak için önce ürün ilanı açın.
          </p>
        )}
      </div>
    </div>
  );
}
