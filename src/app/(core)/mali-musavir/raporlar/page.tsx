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
        <h2 className="text-lg font-bold text-slate-900 mb-6">Aylık Özet Grafiği</h2>
        <div className="h-64 flex items-end gap-2 text-center text-xs font-bold text-slate-500">
          {[40, 60, 30, 80, 50, 90, 100].map((height, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-slate-100 rounded-t-lg relative group transition-all hover:bg-slate-200"
                style={{ height: "100%" }}
              >
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t-lg transition-all" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] pointer-events-none transition-opacity">
                  {height} İşlem
                </div>
              </div>
              <span className="uppercase tracking-widest text-[9px]">Ay {idx + 1}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
