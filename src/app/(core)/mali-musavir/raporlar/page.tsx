import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { BarChart3, TrendingUp, CheckCircle2, FileText, Landmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export default async function FinancialAdvReportsPage() {
  await requireRole([UserRole.FINANCIAL_ADV]);

  const totalProcessed = await prisma.tradeRequest.count({
    where: { 
      status: { in: [TradeStatus.COMPLETED, TradeStatus.IN_TRANSIT, TradeStatus.DOCUMENTS_APPROVED] } 
    }
  });

  const invoiceCount = await prisma.document.count({
    where: { type: DocumentType.COMMERCIAL_INVOICE }
  });

  const vatCount = await prisma.document.count({
    where: { type: DocumentType.OTHER, name: { contains: "kdv", mode: "insensitive" } }
  });

  const allRequests = await prisma.tradeRequest.findMany({
    where: { status: TradeStatus.DOCUMENTS_APPROVED },
    include: { documents: true }
  });

  let pendingCount = 0;
  for (const req of allRequests) {
    const hasInvoice = req.documents.some(d => d.type === DocumentType.COMMERCIAL_INVOICE);
    const hasVat = req.documents.some(d => d.type === DocumentType.OTHER && d.name.toLowerCase().includes("kdv"));
    if (!hasInvoice || !hasVat) pendingCount++;
  }

  /** Örnek trend serisi (göreceli ölçek); çubuklar sabit px yükseklik ile çizilir */
  const chartValues = [40, 60, 30, 80, 50, 90, 100];
  const chartMax = Math.max(...chartValues, 1);
  const chartMaxPx = 192;
  const monthLabels = Array.from({ length: chartValues.length }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (chartValues.length - 1 - i));
    return d.toLocaleDateString("tr-TR", { month: "short" });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <BarChart3 className="h-6 w-6 text-sky-300" />
              Mali Müşavir Analiz Paneli
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Sistem üzerindeki e-fatura ve KDV işlemlerinin istatistikleri.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">İşlenen Toplam Dosya</p>
            <p className="text-2xl font-black text-slate-900">{totalProcessed}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Kesilen E-Fatura</p>
            <p className="text-2xl font-black text-slate-900">{invoiceCount}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Tamamlanan KDV İadesi</p>
            <p className="text-2xl font-black text-slate-900">{vatCount}</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Bekleyen İşlem</p>
            <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">Aylık Özet Grafiği</h2>
          <p className="text-xs text-slate-500">
            Son 7 ay (göreceli hacim). İşlenen toplam dosya:{" "}
            <strong className="text-slate-700">{totalProcessed}</strong>
          </p>
        </div>
        <div className="flex items-end justify-between gap-1 border-b border-slate-100 pb-2 pt-2 sm:gap-3">
          {chartValues.map((val, idx) => {
            const barPx = Math.max(12, Math.round((val / chartMax) * chartMaxPx));
            return (
              <div
                key={idx}
                className="flex min-h-[220px] flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="group relative mx-auto flex h-[192px] w-full max-w-[52px] flex-col justify-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-400 shadow-sm transition-all hover:from-sky-700 hover:to-sky-500"
                    style={{ height: `${barPx}px` }}
                    title={`Göreceli hacim: ${val}`}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {val}
                  </span>
                </div>
                <span className="text-center text-[10px] font-bold capitalize text-slate-500">
                  {monthLabels[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
