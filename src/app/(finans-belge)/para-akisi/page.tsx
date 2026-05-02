import { Landmark, TrendingUp, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

const FINANCE_ALLOWED: UserRole[] = ["FINANCIAL_ADV", "ADMIN"];

/** Demo veri yapısı: gerçek faturalama modelleri bağlandığında prisma sorguları ile değiştirilecek. */
const bars = [
  { label: "Hafta 1", inPct: 62, outPct: 38 },
  { label: "Hafta 2", inPct: 71, outPct: 52 },
  { label: "Hafta 3", inPct: 55, outPct: 44 },
  { label: "Hafta 4", inPct: 81, outPct: 47 },
];

export default async function ParaAkisiPage() {
  await requireRole(FINANCE_ALLOWED);

  const openShipments = await prisma.tradeRequest.count({
    where: {
      status: {
        notIn: ["COMPLETED", "CANCELLED"],
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
          Finans • Muhasebe
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Para akışı &amp; onay özeti</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 leading-relaxed">
          Açık gönderiler, tahsilat/ödeme dengesi ve hızlı onay gerektiren kalem özeti için tek bakış alanı.
          Rakamlar canlı bağlı muhasebe modülüne aktarılacak şekilde tasarlanmış özet görünümüdür.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary/10">
              <Wallet className="h-5 w-5 text-brand-secondary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Net nakit görünümü</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">Özet</p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">ERP entegrasyonu sonrası otomatik dolar bazlı konsolidasyon.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10">
              <ArrowUpRight className="h-5 w-5 text-brand-accent" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Tahsilat eğilimi</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-brand-accent">Olumlu</p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">Bu döneme ait vadelerde aksama sinyali yok.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/5">
              <ArrowDownRight className="h-5 w-5 text-slate-800" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Bekleyen ödemeler</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">İzleniyor</p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">ICC onayı bekleyen fatura bağları dahil.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary/10">
              <TrendingUp className="h-5 w-5 text-brand-secondary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Açık operasyonlar</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">{openShipments}</p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            tamamlanan / iptal harici aktif talep sayısı
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-brand-secondary" />
            <h2 className="text-base font-semibold text-slate-900">Dönem özeti grafik görünümü</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Gelir göstergesi <span className="font-medium text-brand-secondary">Safir mavisi</span>, gider
            göstergesi <span className="font-medium text-brand-primary">gece mavisi</span>. Veri doğrudan ERP
            defterinden beslenecek.
          </p>
        </div>
        <div className="lg:col-span-3 flex flex-col justify-end gap-4">
          {bars.map(({ label, inPct, outPct }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>{label}</span>
                <span>
                  Nakit içeri <span className="text-brand-secondary">{inPct}%</span>
                  {" · "}
                  Dışarı <span className="text-slate-900">{outPct}%</span>
                </span>
              </div>
              <div className="flex h-3 gap-2 overflow-hidden rounded-full bg-slate-100 shadow-inner ring-1 ring-slate-200/60">
                <div className="h-full rounded-l-full bg-brand-secondary" style={{ width: `${inPct}%` }} />
                <div className="h-full bg-brand-primary" style={{ width: `${Math.min(outPct, 100 - inPct * 0.4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
