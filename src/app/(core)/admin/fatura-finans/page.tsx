import Link from "next/link";
import { DocumentType, PaymentStatus, TradeStatus } from "@prisma/client";
import { Landmark, ArrowLeft, CircleDollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

const paymentLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.AWAITING_PAYMENT]: "Ödeme bekliyor",
  [PaymentStatus.ESCROW_HELD]: "Emanette",
  [PaymentStatus.RELEASED_TO_SELLER]: "Satıcıya aktarıldı",
  [PaymentStatus.REFUNDED]: "İade",
};

export default async function AdminFaturaFinansPage() {
  await requireAdmin();

  const [invoiceCount, tradeRows, paymentCounts] = await Promise.all([
    prisma.document.count({ where: { type: DocumentType.COMMERCIAL_INVOICE } }),
    prisma.tradeRequest.findMany({
      where: {
        totalPrice: { not: null },
        status: { notIn: [TradeStatus.PENDING, TradeStatus.CANCELLED] },
      },
      orderBy: { updatedAt: "desc" },
      take: 80,
      include: {
        exporter: { select: { fullName: true } },
        buyer: { select: { fullName: true } },
      },
    }),
    prisma.tradeRequest.groupBy({
      by: ["paymentStatus"],
      where: { paymentStatus: { not: null } },
      _count: { id: true },
    }),
  ]);

  const volume = tradeRows.reduce((s, t) => s + Number(t.totalPrice ?? 0), 0);

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
          <Landmark className="h-7 w-7 text-amber-600" />
          Fatura & Finans
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          E-fatura sayısı, işlem hacmi ve ödeme durumu dağılımı (yönetici).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticari fatura belgesi</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{invoiceCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/90 p-5 shadow-sm">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
            <CircleDollarSign className="h-3.5 w-3.5" />
            Liste hacmi (USD)
          </p>
          <p className="text-2xl font-black text-emerald-950 mt-2">
            {volume.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-800/80 mt-1">Son 80 işlem toplamı</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ödeme durumu</p>
          <ul className="space-y-1 text-xs">
            {paymentCounts.map((p) => (
              <li key={String(p.paymentStatus)} className="flex justify-between gap-2">
                <span className="text-slate-600">
                  {p.paymentStatus ? paymentLabel[p.paymentStatus] : "—"}
                </span>
                <span className="font-bold text-slate-900">{p._count.id}</span>
              </li>
            ))}
            {paymentCounts.length === 0 && (
              <li className="text-slate-400">Ödeme kaydı yok</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90 font-bold text-slate-800">
          İşlemler (tutarlı)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Referans</th>
                <th className="px-6 py-3 text-left font-semibold">Alıcı / İhracatçı</th>
                <th className="px-6 py-3 text-left font-semibold">Ödeme</th>
                <th className="px-6 py-3 text-right font-semibold">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tradeRows.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-mono text-xs font-bold">{t.referenceNumber}</td>
                  <td className="px-6 py-3 text-xs text-slate-600">
                    {t.buyer?.fullName ?? "—"} / {t.exporter.fullName}
                  </td>
                  <td className="px-6 py-3 text-xs">
                    {t.paymentStatus ? paymentLabel[t.paymentStatus] : "—"}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                    {t.totalPrice != null
                      ? `${Number(t.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${t.currency}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
