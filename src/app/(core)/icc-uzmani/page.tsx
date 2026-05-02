import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import {
  CheckCheck,
  Eye,
  FileCheck2,
  FilePlus2,
  FileWarning,
  PackageCheck,
  Radar,
  ShieldCheck,
  Sparkles,
  Stamp,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { finalizeIccReview, toggleDocumentApproval, uploadComplianceDocument } from "./actions";
import { type ComponentType } from "react";
import FileUploadButton from "@/components/forms/FileUploadButton";
import FinalizeStampButton from "@/components/icc/FinalizeStampButton";
import DocumentApprovalButton from "@/components/icc/DocumentApprovalButton";

const requiredTypes = [DocumentType.BILL_OF_LADING, DocumentType.CUSTOMS_DECLARATION];

const documentLabels: Record<DocumentType, string> = {
  COMMERCIAL_INVOICE: "Ticari Fatura",
  BILL_OF_LADING: "Konşimento",
  CUSTOMS_DECLARATION: "Gümrük Beyannamesi",
  INSURANCE_POLICY: "Sigorta Poliçesi",
  OTHER: "Diğer Belge",
};

export default async function ICCExpertPage() {
  await requireRole([UserRole.ICC_EXPERT]);

  const queue = await prisma.tradeRequest.findMany({
    where: {
      status: {
        in: [TradeStatus.LOGISTICS_APPROVED, TradeStatus.DOCUMENTS_PENDING],
      },
    },
    include: {
      exporter: { select: { fullName: true } },
      documents: true,
      quotes: {
        include: {
          logistics: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const completedQueue = await prisma.tradeRequest.findMany({
    where: {
      status: {
        in: [TradeStatus.DOCUMENTS_APPROVED, TradeStatus.IN_TRANSIT, TradeStatus.COMPLETED],
      },
    },
    include: {
      exporter: { select: { fullName: true } },
      documents: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const approvedCount = completedQueue.length;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl animate-pulse" />
          <div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-200">
              <PackageCheck className="h-3.5 w-3.5" />
              ICC Uyum Masasi
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">Belge Onay Merkezi</h1>
            <p className="max-w-xl text-sm text-slate-300 font-medium">
              Lojistik onayı alan dosyalarda gümrük belgelerini inceleyip onaylayın. Onaylanan dosyalar otomatik olarak finans aşamasına aktarılır.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricBadge label="İşlem Bekleyen" value={`${queue.length}`} icon={Timer} />
            <MetricBadge label="Tamamlanan" value={`${approvedCount}`} icon={CheckCheck} />
          </div>
        </div>
      </section>

      {/* Active Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
          <Stamp className="w-5 h-5 text-sky-600" />
          Aktif İnceleme Kuyruğu
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {queue.map((request) => {
            const hasApprovedBillOfLading = request.documents.some(
              (doc) => doc.type === DocumentType.BILL_OF_LADING && doc.isApproved,
            );
            const hasApprovedCustoms = request.documents.some(
              (doc) => doc.type === DocumentType.CUSTOMS_DECLARATION && doc.isApproved,
            );
            const readyForFinalApproval = hasApprovedBillOfLading && hasApprovedCustoms;

            return (
              <section
                key={request.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 group"
              >
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{request.referenceNumber}</h2>
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">İnceleniyor</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-tight">
                      İhracatçı: {request.exporter.fullName} • Oluşturulma: {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FinalizeStampButton
                      action={finalizeIccReview.bind(null, request.id)}
                      disabled={!readyForFinalApproval}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {requiredTypes.map((docType) => {
                    const existingDoc = request.documents.find((doc) => doc.type === docType);

                    return (
                      <div
                        key={docType}
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:border-sky-100"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{documentLabels[docType]}</p>
                          {existingDoc?.isApproved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-emerald-600">
                              <FileCheck2 className="h-3.5 w-3.5" />
                              Onaylandı
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-amber-500">
                              <FileWarning className="h-3.5 w-3.5" />
                              İmza Bekliyor
                            </span>
                          )}
                        </div>

                        {!existingDoc ? (
                          <div className="flex flex-col gap-3">
                            <p className="text-xs text-slate-400 font-medium">Bu belge henüz yüklenmedi.</p>
                            <FileUploadButton
                              action={uploadComplianceDocument.bind(null, request.id, docType)}
                              buttonLabel="Belgeyi Yükle"
                              buttonClassName="w-fit rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={existingDoc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                            >
                              Görüntüle
                            </a>
                            <FileUploadButton
                              action={uploadComplianceDocument.bind(null, request.id, docType)}
                              buttonLabel="Güncelle"
                              buttonClassName="rounded-xl bg-white border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                            />
                            <DocumentApprovalButton
                              documentId={existingDoc.id}
                              initialApproved={existingDoc.isApproved}
                              action={toggleDocumentApproval}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {queue.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-black text-slate-400">Aktif İşlem Yok</p>
              <p className="text-sm text-slate-400">İnceleme bekleyen yeni bir dosya bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


function MetricBadge({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 backdrop-blur-sm">
      <p className="flex items-center gap-1.5 text-xs text-slate-300">
        <Icon className="h-3.5 w-3.5 text-sky-300" />
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1 text-lg font-bold text-white">
        {value}
        <ShieldCheck className="h-4 w-4 text-emerald-300" />
      </p>
    </div>
  );
}
