import Link from "next/link";
import { PaymentStatus, TradeStatus, UserRole } from "@prisma/client";
import { Landmark, ArrowLeft, CircleDollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

const paymentLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.AWAITING_PAYMENT]: "Ödeme bekleniyor",
  [PaymentStatus.ESCROW_HELD]: "Emanette",
  [PaymentStatus.RELEASED_TO_SELLER]: "Satıcıya aktarıldı",
  [PaymentStatus.REFUNDED]: "İade",
};

const tradeStatusLabel: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: "İlan",
  [TradeStatus.ORDERED]: "Sipariş",
  [TradeStatus.QUOTING]: "Teklif",
  [TradeStatus.LOGISTICS_APPROVED]: "Lojistik OK",
  [TradeStatus.DOCUMENTS_PENDING]: "Belge",
  [TradeStatus.DOCUMENTS_APPROVED]: "Belge OK",
  [TradeStatus.IN_TRANSIT]: "Yolda",
  [TradeStatus.COMPLETED]: "Tamamlandı",
  [TradeStatus.CANCELLED]: "İptal",
};

export default async function ExporterFinancePage() {
  const session = await requireRole([UserRole.EXPORTER]);

  const trades = await prisma.tradeRequest.findMany({
    where: { exporterId: session.id },
    orderBy: { updatedAt: "desc" },
    include: {
      buyer: { select: { fullName: true } },
    },
  });

  const withOrder = trades.filter((t) => t.status !== TradeStatus.PENDING);
  const completed = trades.filter((t) => t.status === TradeStatus.COMPLETED);
  const revenue = completed.reduce(
    (sum, t) => sum + Number(t.totalPrice ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/ihracatci"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          İhracatçı paneli
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Landmark className="h-7 w-7 text-amber-600" />
          Fatura & Finans
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Sipariş tutarları, ödeme / emanet durumu ve tahsilat özeti. Mali müşavir faturaları talep detayından takip edilir.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Siparişli işlem
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">{withOrder.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Tamamlanan satış
          </p>
          <p className="text-3xl font-black text-emerald-700 mt-2">{completed.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
            <CircleDollarSign className="h-3.5 w-3.5" />
            Tamamlanan ciro (USD)
          </p>
          <p className="text-3xl font-black text-emerald-900 mt-2">
            {revenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <h2 className="font-bold text-slate-800">İşlem bazlı finans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Referans</th>
                <th className="px-6 py-3 font-semibold">Alıcı</th>
                <th className="px-6 py-3 font-semibold">Durum</th>
                <th className="px-6 py-3 font-semibold">Ödeme</th>
                <th className="px-6 py-3 font-semibold text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <Link
                      href={`/ihracatci/${t.id}`}
                      className="font-bold text-sky-700 hover:underline"
                    >
                      {t.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {t.buyer?.fullName ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {tradeStatusLabel[t.status]}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {t.paymentStatus
                      ? paymentLabel[t.paymentStatus]
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {t.totalPrice != null
                      ? `${Number(t.totalPrice).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })} ${t.currency}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {trades.length === 0 && (
            <p className="p-10 text-center text-slate-500 text-sm">
              Henüz talep oluşturmadınız.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
