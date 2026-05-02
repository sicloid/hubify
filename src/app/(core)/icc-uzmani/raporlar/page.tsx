import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Radar,
  Timer,
  TrendingUp,
} from "lucide-react";
import { type ReactNode } from "react";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export default async function IccReportsPage() {
  await requireRole([UserRole.ICC_EXPERT]);

  const [requests, documents] = await Promise.all([
    prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [
            TradeStatus.LOGISTICS_APPROVED,
            TradeStatus.DOCUMENTS_PENDING,
            TradeStatus.DOCUMENTS_APPROVED,
            TradeStatus.IN_TRANSIT,
            TradeStatus.COMPLETED,
          ],
        },
      },
      include: {
        exporter: { select: { fullName: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: {
        type: { in: [DocumentType.BILL_OF_LADING, DocumentType.CUSTOMS_DECLARATION] },
      },
      select: {
        id: true,
        type: true,
        isApproved: true,
        createdAt: true,
      },
    }),
  ]);

  const pendingReview = requests.filter((r) => r.status === TradeStatus.LOGISTICS_APPROVED).length;
  const inDocumentFlow = requests.filter((r) => r.status === TradeStatus.DOCUMENTS_PENDING).length;
  const iccApproved = requests.filter((r) => r.status === TradeStatus.DOCUMENTS_APPROVED).length;
  const completedAfterIcc = requests.filter(
    (r) => r.status === TradeStatus.IN_TRANSIT || r.status === TradeStatus.COMPLETED,
  ).length;

  const bills = documents.filter((d) => d.type === DocumentType.BILL_OF_LADING);
  const customs = documents.filter((d) => d.type === DocumentType.CUSTOMS_DECLARATION);

  const approvedDocs = documents.filter((d) => d.isApproved).length;
  const approvalRate = documents.length ? Math.round((approvedDocs / documents.length) * 100) : 0;
  const rejectRate = documents.length ? 100 - approvalRate : 0;
  const totalIccRequests = pendingReview + inDocumentFlow + iccApproved + completedAfterIcc;

  const topExporters = Object.entries(
    requests.reduce<Record<string, number>>((acc, request) => {
      acc[request.exporter.fullName] = (acc[request.exporter.fullName] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="relative z-10">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <BarChart3 className="h-6 w-6 text-sky-300" />
              ICC Raporlar ve Analiz
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              ICC uzmanı panelindeki talep ve belge verilerinin gerçek zamanlı özet görünümü.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <HeroMiniStat label="Toplam ICC Talebi" value={totalIccRequests} />
              <HeroMiniStat label="Onay Oranı" value={`${approvalRate}%`} />
              <HeroMiniStat label="Belge Sayısı" value={documents.length} />
              <HeroMiniStat label="Aktif İnceleme" value={pendingReview + inDocumentFlow} />
            </div>
          </div>
          <Link
            href="/icc-uzmani"
            className="relative z-10 inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ICC Paneline Don
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Denetim Bekleyen"
          value={pendingReview}
          icon={<Timer className="h-4 w-4 text-amber-600" />}
          tone="amber"
        />
        <MetricCard
          title="Belge Akışında"
          value={inDocumentFlow}
          icon={<FileCheck2 className="h-4 w-4 text-sky-600" />}
          tone="sky"
        />
        <MetricCard
          title="ICC Onaylı"
          value={iccApproved}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          tone="emerald"
        />
        <MetricCard
          title="Sonraki Aşamaya Geçen"
          value={completedAfterIcc}
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
          tone="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Belge Uyum Dağılımı</h2>
          <div className="mt-4 space-y-3 text-sm">
            <StatRow label="Toplam Eklenen ICC Belgesi" value={documents.length} />
            <StatRow label="Onaylı Belge" value={approvedDocs} />
            <StatRow label="Onay Oranı" value={`${approvalRate}%`} />
            <StatRow label="Konşimento Adedi" value={bills.length} />
            <StatRow label="Gümrük Beyannamesi Adedi" value={customs.length} />
          </div>

          <div className="mt-5 space-y-3">
            <ProgressBar label="Onay Oranı" value={approvalRate} color="emerald" />
            <ProgressBar label="Eksik / Bekleyen" value={rejectRate} color="amber" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">ICC Talep Yoğunluğu (İhracatçı)</h2>
          <div className="mt-4 space-y-2">
            {topExporters.map(([name, count], idx) => (
              <div key={name} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {idx + 1}. {name}
                  </span>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    {count} talep
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-sky-600"
                    style={{
                      width: `${Math.max(
                        10,
                        Math.round((count / Math.max(topExporters[0]?.[1] ?? 1, 1)) * 100),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {topExporters.length === 0 && <p className="text-sm text-slate-500">Analiz için yeterli veri bulunmuyor.</p>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">ICC Operasyon Isı Haritası</h2>
        <p className="mt-1 text-xs text-slate-500">
          Denetim temposunu daha hızlı okumak için anlık dağılım kartları.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <HeatTile
            title="Hızlı Hat"
            subtitle="Aynı gün onaylanabilir dosyalar"
            value={Math.max(0, iccApproved - pendingReview)}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          />
          <HeatTile
            title="Kritik Hat"
            subtitle="Belge eksiği olanlar"
            value={pendingReview + inDocumentFlow}
            icon={<Radar className="h-4 w-4 text-amber-600" />}
          />
          <HeatTile
            title="Verim Skoru"
            subtitle="ICC genel performans"
            value={approvalRate}
            suffix="%"
            icon={<Gauge className="h-4 w-4 text-sky-600" />}
          />
        </div>
      </section>
    </div>
  );
}

function HeroMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: "amber" | "sky" | "emerald" | "purple";
}) {
  const toneMap: Record<typeof tone, string> = {
    amber: "from-amber-50 to-white border-amber-100",
    sky: "from-sky-50 to-white border-sky-100",
    emerald: "from-emerald-50 to-white border-emerald-100",
    purple: "from-purple-50 to-white border-purple-100",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {icon}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" }) {
  const progressColor = color === "emerald" ? "bg-emerald-600" : "bg-amber-500";
  const bgColor = color === "emerald" ? "bg-emerald-100" : "bg-amber-100";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value}%</span>
      </div>
      <div className={`h-2.5 w-full rounded-full ${bgColor}`}>
        <div className={`h-2.5 rounded-full ${progressColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function HeatTile({
  title,
  subtitle,
  value,
  icon,
  suffix = "",
}: {
  title: string;
  subtitle: string;
  value: number;
  icon: ReactNode;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {icon}
      </div>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <p className="mt-3 text-2xl font-black text-slate-900">
        {value}
        {suffix}
      </p>
    </div>
  );
}
