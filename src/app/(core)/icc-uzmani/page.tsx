import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import {
  CheckCheck,
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
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { finalizeIccReview, toggleDocumentApproval, uploadComplianceDocument } from "./actions";
import { type ComponentType } from "react";
import FileUploadButton from "@/components/forms/FileUploadButton";
import FinalizeStampButton from "@/components/icc/FinalizeStampButton";

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
    },
    orderBy: { createdAt: "asc" },
  });

  const approvedCount = queue.filter((item) => item.status === TradeStatus.DOCUMENTS_APPROVED).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl animate-pulse" />
          <div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/20" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/15" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200">
              <PackageCheck className="h-3.5 w-3.5" />
              Konsolide Yukler - ICC Uyum Masasi
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gumruk Belge Onay Akisi</h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Lojistik onayi alan dosyalarda gumruk belgelerini yukleyip onaylayin. Zincir tamamlaninca dosya mali
              musavir asamasina devredilir.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 text-slate-200 border border-slate-700">
                <Radar className="h-3.5 w-3.5 text-sky-300" />
                Live ICC Radar
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 text-slate-200 border border-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                Akilli Uyum Kontrolu
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricBadge label="Bekleyen Islem" value={`${queue.length}`} icon={Timer} />
            <MetricBadge label="Onaylanan Akis" value={`${approvedCount}`} icon={CheckCheck} />
          </div>
        </div>
      </section>

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
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
            >
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                    </span>
                    {request.referenceNumber}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Ihracatci: {request.exporter.fullName} • Durum: {request.status}
                  </p>
                </div>
                <FinalizeStampButton
                  action={finalizeIccReview.bind(null, request.id)}
                  disabled={!readyForFinalApproval}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {requiredTypes.map((docType) => {
                  const existingDoc = request.documents.find((doc) => doc.type === docType);

                  return (
                    <div
                      key={docType}
                      className="rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50/60"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{documentLabels[docType]}</p>
                        {existingDoc?.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Onayli
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <FileWarning className="h-3.5 w-3.5" />
                            Bekliyor
                          </span>
                        )}
                      </div>

                      {!existingDoc ? (
                        <div className="inline-flex items-center gap-2">
                          <FilePlus2 className="h-3.5 w-3.5 text-slate-500" />
                          <FileUploadButton
                            action={uploadComplianceDocument.bind(null, request.id, docType)}
                            buttonLabel="Belgeyi Yukle"
                            buttonClassName="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={existingDoc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                          >
                            Belgeyi Goruntule
                          </a>
                          <FileUploadButton
                            action={uploadComplianceDocument.bind(null, request.id, docType)}
                            buttonLabel="Belgeyi Degistir"
                            buttonClassName="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          />
                          <form action={toggleDocumentApproval.bind(null, existingDoc.id, !existingDoc.isApproved)}>
                            <button
                              type="submit"
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-[1.02] ${
                                existingDoc.isApproved
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              }`}
                            >
                              {existingDoc.isApproved ? "Onayi Geri Al" : "Belgeyi Onayla"}
                            </button>
                          </form>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            ICC incelemesi bekleyen dosya bulunmuyor.
          </div>
        )}
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
