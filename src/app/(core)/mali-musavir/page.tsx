import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { BadgeCheck, FileText, Landmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { uploadInvoice, uploadVatReport } from "./actions";
import FileUploadButton from "@/components/forms/FileUploadButton";

export default async function FinancialAdvPage() {
  await requireRole([UserRole.FINANCIAL_ADV]);

  const queue = await prisma.tradeRequest.findMany({
    where: { status: TradeStatus.DOCUMENTS_APPROVED },
    include: {
      exporter: { select: { fullName: true } },
      documents: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Landmark className="h-6 w-6 text-sky-600" />
          Mali Musavir Islem Masasi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          ICC onayi tamamlanan dosyalarda e-fatura ve KDV iade dokumanlarini isleyin.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {queue.map((request) => {
          const invoiceDoc = request.documents.find((doc) => doc.type === DocumentType.COMMERCIAL_INVOICE);
          const vatDoc = request.documents.find(
            (doc) => doc.type === DocumentType.OTHER && doc.name.toLowerCase().includes("kdv"),
          );
          const hasInvoice = Boolean(invoiceDoc);
          const hasVatDoc = Boolean(vatDoc);

          return (
            <section key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">{request.referenceNumber}</h2>
                <p className="text-sm text-slate-500">Ihracatci: {request.exporter.fullName}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <FileText className="h-4 w-4 text-sky-600" />
                    E-Fatura Yukleme
                  </p>
                  {hasInvoice ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        E-fatura sisteme kaydedildi
                      </p>
                      <a
                        href={invoiceDoc?.fileUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        Goruntule
                      </a>
                      <FileUploadButton
                        action={uploadInvoice.bind(null, request.id)}
                        buttonLabel="E-Faturayi Degistir"
                        buttonClassName="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      />
                    </div>
                  ) : (
                    <FileUploadButton
                      action={uploadInvoice.bind(null, request.id)}
                      buttonLabel="E-Fatura Olustur"
                      buttonClassName="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    />
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Landmark className="h-4 w-4 text-emerald-600" />
                    KDV Iade Islemi
                  </p>
                  {hasVatDoc ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        KDV iade dosyasi tamamlandi
                      </p>
                      <a
                        href={vatDoc?.fileUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        Goruntule
                      </a>
                      <FileUploadButton
                        action={uploadVatReport.bind(null, request.id)}
                        buttonLabel="KDV Dosyasini Degistir"
                        buttonClassName="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      />
                    </div>
                  ) : (
                    <FileUploadButton
                      action={uploadVatReport.bind(null, request.id)}
                      buttonLabel="KDV Dosyasini Isleme Al"
                      buttonClassName="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    />
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {queue.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Mali isleme hazir dosya bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
