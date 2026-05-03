import type { ComponentType } from "react";
import Link from "next/link";
import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Send,
  Shield,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

const rowStatusLabel = (s: TradeStatus) => {
  switch (s) {
    case TradeStatus.DOCUMENTS_APPROVED:
      return "Belge onaylı";
    case TradeStatus.IN_TRANSIT:
      return "Yolda";
    case TradeStatus.COMPLETED:
      return "Tamamlandı";
    default:
      return s;
  }
};

export default async function SigortaRaporlarPage() {
  await requireRole([UserRole.INSURER]);

  const [
    awaitingPolicy,
    cutAwaitingDispatch,
    inTransit,
    completedWithPolicy,
    totalPolicyFiles,
  ] = await Promise.all([
    prisma.tradeRequest.count({
      where: {
        status: TradeStatus.DOCUMENTS_APPROVED,
        NOT: {
          documents: { some: { type: DocumentType.INSURANCE_POLICY } },
        },
      },
    }),
    prisma.tradeRequest.count({
      where: {
        status: TradeStatus.DOCUMENTS_APPROVED,
        documents: { some: { type: DocumentType.INSURANCE_POLICY } },
      },
    }),
    prisma.tradeRequest.count({
      where: { status: TradeStatus.IN_TRANSIT },
    }),
    prisma.tradeRequest.count({
      where: {
        status: TradeStatus.COMPLETED,
        documents: { some: { type: DocumentType.INSURANCE_POLICY } },
      },
    }),
    prisma.document.count({
      where: { type: DocumentType.INSURANCE_POLICY },
    }),
  ]);

  const recentWithPolicy = await prisma.tradeRequest.findMany({
    where: {
      documents: { some: { type: DocumentType.INSURANCE_POLICY } },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: {
      exporter: { select: { fullName: true } },
      documents: {
        where: { type: DocumentType.INSURANCE_POLICY },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const funnelTotal =
    awaitingPolicy + cutAwaitingDispatch + inTransit + completedWithPolicy;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-violet-200">
              <Activity className="h-4 w-4" />
              Sigorta operasyonları
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">
              Raporlar &amp; Analiz
            </h1>
            <p className="max-w-xl text-sm font-medium text-violet-100/85">
              Poliçe bekleyen, kesilmiş ama yola çıkmamış, yoldaki ve tamamlanan dosyaların özeti.
            </p>
          </div>
          <Link
            href="/sigorta/bekleyen"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            Panele dön <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={ClipboardList}
          label="Poliçe bekleyen"
          value={awaitingPolicy}
          hint="Henüz kesilmedi"
          tone="sky"
        />
        <StatCard
          icon={Send}
          label="Kesildi, sevkiyat bekliyor"
          value={cutAwaitingDispatch}
          hint="Ulaşmamış poliçeler"
          tone="amber"
        />
        <StatCard
          icon={Truck}
          label="Yolda"
          value={inTransit}
          hint="IN_TRANSIT"
          tone="violet"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tamamlanan (poliçeli)"
          value={completedWithPolicy}
          hint="COMPLETED"
          tone="emerald"
        />
        <StatCard
          icon={FileCheck2}
          label="Toplam poliçe dosyası"
          value={totalPolicyFiles}
          hint="Yüklenen PDF sayısı"
          tone="slate"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <BarChart3 className="h-5 w-5 text-violet-600" />
            Pipeline özeti
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Aktif sigorta hunisi (özet):{" "}
            <span className="font-bold text-slate-800">{funnelTotal}</span> kayıt
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <FunnelStep label="Poliçe kesilmedi" value={awaitingPolicy} />
          <FunnelStep label="Poliçe kesildi" value={cutAwaitingDispatch} />
          <FunnelStep label="Sevkiyatta" value={inTransit} />
          <FunnelStep label="Kapandı" value={completedWithPolicy} />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Shield className="h-5 w-5 text-sky-600" />
            Son poliçelenen talepler
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Poliçe PDF’i yüklenmiş dosyalar; güncellenme tarihine göre.
          </p>
        </div>
        {recentWithPolicy.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Henüz sisteme poliçe PDF’i yüklenmiş talep yok.{" "}
            <Link href="/sigorta/bekleyen" className="font-semibold text-sky-600 hover:underline">
              Poliçe bekleyen
            </Link>{" "}
            ekranından işlem başlatabilirsiniz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-3">Referans</th>
                  <th className="px-6 py-3">Ürün</th>
                  <th className="px-6 py-3">İhracatçı</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Güncelleme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentWithPolicy.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-mono text-xs font-bold text-violet-700">
                      {r.referenceNumber}
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-3 font-medium text-slate-900" title={r.title}>
                      {r.title}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{r.exporter.fullName}</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {rowStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(r.updatedAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  tone: "sky" | "amber" | "violet" | "emerald" | "slate";
}) {
  const ring = {
    sky: "ring-sky-200/80 bg-sky-50/90",
    amber: "ring-amber-200/80 bg-amber-50/90",
    violet: "ring-violet-200/80 bg-violet-50/90",
    emerald: "ring-emerald-200/80 bg-emerald-50/90",
    slate: "ring-slate-200/80 bg-slate-50/90",
  }[tone];
  const iconC = {
    sky: "text-sky-600",
    amber: "text-amber-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    slate: "text-slate-600",
  }[tone];

  return (
    <div className={`rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ${ring}`}>
      <Icon className={`h-5 w-5 ${iconC}`} aria-hidden />
      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{hint}</p>
    </div>
  );
}

function FunnelStep({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
