import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { CheckCircle2, Radar, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { issuePolicyAndDispatch, markShipmentCompleted } from "./actions";
import FileUploadButton from "@/components/forms/FileUploadButton";

export default async function InsurerPage() {
  await requireRole([UserRole.INSURER]);

  const queue = await prisma.tradeRequest.findMany({
    where: {
      status: TradeStatus.DOCUMENTS_APPROVED,
      AND: [
        { documents: { some: { type: DocumentType.COMMERCIAL_INVOICE } } },
        {
          documents: {
            some: {
              type: DocumentType.OTHER,
              name: { contains: "kdv", mode: "insensitive" },
            },
          },
        },
      ],
    },
    include: {
      exporter: { select: { fullName: true } },
      documents: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  const inTransitQueue = await prisma.tradeRequest.findMany({
    where: {
      status: TradeStatus.IN_TRANSIT,
      documents: { some: { type: DocumentType.INSURANCE_POLICY } },
    },
    include: {
      exporter: { select: { fullName: true } },
      documents: {
        where: { type: DocumentType.INSURANCE_POLICY },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  const completedQueue = await prisma.tradeRequest.findMany({
    where: {
      status: TradeStatus.COMPLETED,
      documents: { some: { type: DocumentType.INSURANCE_POLICY } },
    },
    include: {
      exporter: { select: { fullName: true } },
      documents: {
        where: { type: DocumentType.INSURANCE_POLICY },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Risk ve Sigorta Merkezi
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">Poliçe ve Sevk Yönetimi</h1>
            <p className="max-w-xl text-sm text-slate-300 font-medium">
              Finansal süreci tamamlanan yükler için nakliye poliçelerini oluşturun ve sevkiyatları başlatın.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bekleyen</p>
              <p className="text-3xl font-black text-white mt-1">{queue.length}</p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 min-w-[120px]">
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Yolda</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">{inTransitQueue.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Issuance Queue */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
          <Radar className="w-5 h-5 text-sky-600" />
          Poliçe Bekleyen Dosyalar
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {queue.map((request) => {
            const policyDoc = request.documents.find((doc) => doc.type === DocumentType.INSURANCE_POLICY);
            return (
              <section key={request.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{request.referenceNumber}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">İhracatçı: {request.exporter.fullName}</p>
                  </div>
                  <div className="w-full md:w-auto">
                    {policyDoc ? (
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Poliçe Hazır</span>
                        <a href={policyDoc.fileUrl} target="_blank" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Görüntüle</a>
                        <FileUploadButton action={issuePolicyAndDispatch.bind(null, request.id)} buttonLabel="Güncelle ve Sevk Et" buttonClassName="px-4 py-2 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all" />
                      </div>
                    ) : (
                      <FileUploadButton action={issuePolicyAndDispatch.bind(null, request.id)} buttonLabel="Poliçe Kes ve Sevk Et" buttonClassName="w-full md:w-auto px-8 py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-100" />
                    )}
                  </div>
                </div>
              </section>
            );
          })}
          {queue.length === 0 && (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-black uppercase tracking-widest text-xs italic">Aktif poliçe talebi bulunmuyor</div>
          )}
        </div>
      </div>

      {/* In Transit */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
          <Truck className="w-5 h-5 text-amber-500" />
          Yolda Olan Sevkiyatlar
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {inTransitQueue.map((request) => (
            <div key={request.id} className="rounded-3xl border border-amber-100 bg-amber-50/30 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center animate-pulse">
                  <Truck className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">{request.referenceNumber}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">İhracatçı: {request.exporter.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={request.documents[0]?.fileUrl ?? "#"} target="_blank" className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all">Poliçe Detay</a>
                <form action={markShipmentCompleted.bind(null, request.id)}>
                  <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg shadow-emerald-100">Teslimatı Tamamla</button>
                </form>
              </div>
            </div>
          ))}
          {inTransitQueue.length === 0 && (
            <p className="text-sm text-slate-400 italic px-1 font-medium">Şu an yolda olan sevkiyat bulunmuyor.</p>
          )}
        </div>
      </div>

      {/* Completed */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Tamamlanan Dosyalar
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {completedQueue.map((request) => (
            <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-slate-900">{request.referenceNumber}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">İhracatçı: {request.exporter.fullName} • Tamamlanma: {new Date(request.updatedAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <a href={request.documents[0]?.fileUrl ?? "#"} target="_blank" className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline">Poliçe Arşivi</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    </div>
  );
}
