import Link from "next/link";
import { TradeStatus } from "@prisma/client";
import { FileText, ArrowLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

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

export default async function AdminTaleplerimPage() {
  await requireAdmin();

  const rows = await prisma.tradeRequest.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      exporter: { select: { fullName: true, email: true } },
      buyer: { select: { fullName: true, email: true } },
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
          <FileText className="h-7 w-7 text-sky-600" />
          Taleplerim — Platform özeti
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Tüm ticaret talepleri; durum, taraflar ve son güncelleme. Detay için ihracatçı talep ekranına gider.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-800">Kayıtlar ({rows.length})</span>
          <span className="text-xs font-medium text-slate-500">Son 200 güncelleme</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Referans</th>
                <th className="px-6 py-3 font-semibold">Ürün</th>
                <th className="px-6 py-3 font-semibold">Durum</th>
                <th className="px-6 py-3 font-semibold">İhracatçı</th>
                <th className="px-6 py-3 font-semibold">Alıcı</th>
                <th className="px-6 py-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-mono text-xs font-bold text-slate-800">{t.referenceNumber}</td>
                  <td className="px-6 py-3 text-slate-700 max-w-[200px] truncate" title={t.title}>
                    {t.title}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-700">
                      {statusLabel[t.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600 text-xs">{t.exporter.fullName}</td>
                  <td className="px-6 py-3 text-slate-600 text-xs">{t.buyer?.fullName ?? "—"}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/ihracatci/${t.id}`}
                      className="inline-flex items-center gap-1 text-xs font-black uppercase text-sky-600 hover:underline"
                    >
                      Detay <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-12 text-center text-slate-500 text-sm">Kayıt yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
