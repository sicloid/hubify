import { DocumentType, TradeStatus, UserRole } from "@prisma/client";
import { BadgeCheck, FileText, Landmark, ArrowLeft, Download, Building2, MapPin, Truck, CheckCircle2, Files, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { uploadInvoice, uploadVatReport } from "../actions";
import FileUploadButton from "@/components/forms/FileUploadButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FinancialAdvRequestDetailsPage({ params }: { params: { id: string } }) {
  await requireRole([UserRole.FINANCIAL_ADV]);

  const request = await prisma.tradeRequest.findUnique({
    where: { id: params.id },
    include: {
      exporter: { select: { fullName: true, email: true } },
      buyer: { select: { fullName: true, email: true } },
      quotes: { 
        where: { isAccepted: true },
        include: { logistics: { select: { fullName: true } } }
      },
      documents: true,
    },
  });

  if (!request) {
    notFound();
  }

  const invoiceDoc = request.documents.find((doc) => doc.type === DocumentType.COMMERCIAL_INVOICE);
  const vatDoc = request.documents.find(
    (doc) => doc.type === DocumentType.OTHER && doc.name.toLowerCase().includes("kdv"),
  );
  const hasInvoice = Boolean(invoiceDoc);
  const hasVatDoc = Boolean(vatDoc);

  // Filter out internal markers
  const visibleDocs = request.documents.filter(doc => !doc.fileUrl.startsWith("internal://") && !doc.name.toLowerCase().includes("finance-ready"));
  const acceptedQuote = request.quotes[0];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/mali-musavir" className="text-slate-400 hover:text-sky-600 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                Detay: {request.referenceNumber}
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Bu ekran üzerinden dosyaya ait tüm belgeleri görüntüleyebilir ve mali işlemleri yapabilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
            ICC Onaylı Dosya
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Info & Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              Taraflar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">İhracatçı</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {request.exporter.fullName}
                </p>
                <p className="text-sm text-slate-500 mt-1 pl-6">{request.exporter.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alıcı (Buyer)</p>
                {request.buyer ? (
                  <>
                    <p className="font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      {request.buyer.fullName}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 pl-6">{request.buyer.email}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 italic">Atanmamış</p>
                )}
              </div>
            </div>
            {acceptedQuote && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lojistik Firması</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-500" />
                  {acceptedQuote.logistics.fullName}
                </p>
              </div>
            )}
          </section>

          {/* Action Panel */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              Mali İşlemler
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-sky-600" />
                  E-Fatura Yükleme
                </p>
                {hasInvoice ? (
                  <div className="flex flex-col gap-3">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      E-fatura sisteme kaydedildi
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={invoiceDoc?.fileUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Görüntüle
                      </a>
                      <FileUploadButton
                        action={async (formData: FormData) => {
                          "use server";
                          await uploadInvoice(request.id, formData);
                        }}
                        buttonLabel="Değiştir"
                        buttonClassName="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                      />
                    </div>
                  </div>
                ) : (
                  <FileUploadButton
                    action={async (formData: FormData) => {
                      "use server";
                      await uploadInvoice(request.id, formData);
                    }}
                    buttonLabel="E-Fatura Oluştur"
                    buttonClassName="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  />
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Landmark className="h-4 w-4 text-emerald-600" />
                  KDV İade İşlemi
                </p>
                {hasVatDoc ? (
                  <div className="flex flex-col gap-3">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      KDV iade dosyası tamamlandı
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={vatDoc?.fileUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Görüntüle
                      </a>
                      <FileUploadButton
                        action={async (formData: FormData) => {
                          "use server";
                          await uploadVatReport(request.id, formData);
                        }}
                        buttonLabel="Değiştir"
                        buttonClassName="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                      />
                    </div>
                  </div>
                ) : (
                  <FileUploadButton
                    action={async (formData: FormData) => {
                      "use server";
                      await uploadVatReport(request.id, formData);
                    }}
                    buttonLabel="KDV Dosyasını İşleme Al"
                    buttonClassName="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  />
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Documents */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Files className="w-5 h-5 text-sky-600" />
              Sistemdeki Belgeler
            </h2>
            {visibleDocs.length > 0 ? (
              <div className="space-y-3">
                {visibleDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-8 h-8 text-sky-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.type}</p>
                      </div>
                    </div>
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="İndir / Görüntüle"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-4">Sistemde belge bulunmuyor.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
