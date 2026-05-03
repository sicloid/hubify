import Link from "next/link";
import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { FileText, Landmark, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTradeMoney, tradeProductImageSrc } from "@/lib/format-trade-money";
import { requireRole } from "@/lib/auth-utils";
import { uploadInvoice, uploadVatReport } from "./actions";
import FileUploadButton from "@/components/forms/FileUploadButton";

export default async function FinancialAdvPage() {
  await requireRole([UserRole.FINANCIAL_ADV]);

  const queue = await prisma.tradeRequest.findMany({
    where: { status: TradeStatus.DOCUMENTS_APPROVED },
    include: {
      exporter: { select: { fullName: true } },
      buyer: { select: { fullName: true } },
      documents: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  const completedCount = await prisma.tradeRequest.count({
    where: {
      status: { in: [TradeStatus.IN_TRANSIT, TradeStatus.COMPLETED] },
    },
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-200">
              <Landmark className="h-3.5 w-3.5" />
              Finans ve Vergi Masası
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">Mali Müşavir İşlemleri</h1>
            <p className="max-w-xl text-sm text-slate-300 font-medium">
              ICC onayı tamamlanan dosyalarda e-fatura ve KDV iade süreçlerini yönetin.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[140px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bekleyen</p>
              <p className="text-3xl font-black text-white mt-1">{queue.length}</p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 min-w-[140px]">
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Tamamlanan</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">{completedCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
          <FileText className="w-5 h-5 text-sky-600" />
          İşlem Bekleyen Faturalar
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {queue.map((request) => {
            const invoiceDoc = request.documents.find((doc) => doc.type === DocumentType.COMMERCIAL_INVOICE);
            const vatDoc = request.documents.find(
              (doc) => doc.type === DocumentType.OTHER && doc.name.toLowerCase().includes("kdv"),
            );

          const imgSrc = tradeProductImageSrc(request.productImage);

          return (
            <section key={request.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  {imgSrc ? (
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                      <Package className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{request.referenceNumber}</h2>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">{request.title}</p>
                      {request.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{request.description}</p>
                      ) : null}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-tight text-slate-400">
                      İhracatçı: {request.exporter.fullName}
                      {request.buyer?.fullName ? ` • Alıcı: ${request.buyer.fullName}` : ""}
                    </p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-4">
                      <div>
                        <dt className="text-slate-400">Ağırlık</dt>
                        <dd className="font-semibold text-slate-800">{request.weight} kg</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Hedef</dt>
                        <dd className="font-semibold text-slate-800">{request.destinationCity || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Tutar</dt>
                        <dd className="font-semibold text-slate-800">
                          {formatTradeMoney(request.totalPrice, request.currency)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <Link
                  href={`/mali-musavir/${request.id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800 sm:self-center"
                >
                  <FileText className="h-4 w-4" />
                  Detayları İncele
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="mb-4 text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-600" />
                    E-Fatura Süreci
                  </p>
                  {invoiceDoc ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Hazır</span>
                      <a href={invoiceDoc?.fileUrl ?? "#"} target="_blank" className="text-[10px] font-black text-sky-600 uppercase hover:underline">Görüntüle</a>
                      <FileUploadButton 
                        action={async (formData: FormData) => {
                          "use server";
                          await uploadInvoice(request.id, formData);
                        }} 
                        buttonLabel="Güncelle" 
                        buttonClassName="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600" 
                      />
                    </div>
                  ) : (
                    <FileUploadButton 
                      action={async (formData: FormData) => {
                        "use server";
                        await uploadInvoice(request.id, formData);
                      }} 
                      buttonLabel="E-Fatura Oluştur" 
                      buttonClassName="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800" 
                    />
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="mb-4 text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-emerald-600" />
                    KDV İade Dosyası
                  </p>
                  {vatDoc ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Tamamlandı</span>
                      <a href={vatDoc?.fileUrl ?? "#"} target="_blank" className="text-[10px] font-black text-sky-600 uppercase hover:underline">Görüntüle</a>
                      <FileUploadButton 
                        action={async (formData: FormData) => {
                          "use server";
                          await uploadVatReport(request.id, formData);
                        }} 
                        buttonLabel="Güncelle" 
                        buttonClassName="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600" 
                      />
                    </div>
                  ) : (
                    <FileUploadButton 
                      action={async (formData: FormData) => {
                        "use server";
                        await uploadVatReport(request.id, formData);
                      }} 
                      buttonLabel="KDV İşlemini Başlat" 
                      buttonClassName="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700" 
                    />
                  )}
                </div>
              </div>
            </section>
          );
        })}
        {queue.length === 0 && (
          <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Bekleyen işlem bulunmuyor</div>
        )}
      </div>
      </div>
    </div>
  );
}
