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
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Radar className="h-6 w-6 text-sky-300" />
          Sigorta Onay ve Sevk Ekrani
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Mali asamasi tamamlanan dosyalarda nakliye policesini olusturup yuku sevk durumuna alin.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-sky-300/40 bg-sky-400/20 px-3 py-1 text-sky-100">
            Police Bekleyen: {queue.length}
          </span>
          <span className="rounded-full border border-emerald-300/40 bg-emerald-400/20 px-3 py-1 text-emerald-100">
            Yolda: {inTransitQueue.length}
          </span>
          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white">
            Tamamlanan: {completedQueue.length}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {queue.map((request) => {
          const policyDoc = request.documents.find((doc) => doc.type === DocumentType.INSURANCE_POLICY);
          const hasPolicy = Boolean(policyDoc);

          return (
            <section key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-slate-900">{request.referenceNumber}</h2>
                <p className="text-sm text-slate-500">Ihracatci: {request.exporter.fullName}</p>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Nakliye Sigortasi</p>
                  <p className="text-xs text-slate-500">
                    {hasPolicy ? "Police zaten duzenlenmis." : "Police olusturulunca dosya yola cikis durumuna gecer."}
                  </p>
                </div>

                {hasPolicy ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Police Hazir
                    </span>
                    <a
                      href={policyDoc?.fileUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                    >
                      Policeyi Goruntule
                    </a>
                    <FileUploadButton
                      action={issuePolicyAndDispatch.bind(null, request.id)}
                      buttonLabel="Policeyi Degistir"
                      buttonClassName="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    />
                  </div>
                ) : (
                  <FileUploadButton
                    action={issuePolicyAndDispatch.bind(null, request.id)}
                    buttonLabel="Policeyi Kes ve Sevk Et"
                    buttonClassName="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                  />
                )}
              </div>
            </section>
          );
        })}

        {queue.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Sigorta onayi bekleyen dosya bulunmuyor.
          </div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Yolda Olan Sigortali Yukler</h2>
        {inTransitQueue.map((request) => (
          <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">{request.referenceNumber}</p>
                <p className="text-sm text-slate-500">Ihracatci: {request.exporter.fullName}</p>
                <a
                  href={request.documents[0]?.fileUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Policeyi Goruntule
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Truck className="h-3.5 w-3.5" />
                  In Transit
                </span>
                <form action={markShipmentCompleted.bind(null, request.id)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Teslim Tamamla
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {inTransitQueue.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Su anda yolda olan sigortali dosya bulunmuyor.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Tamamlanan Sevkiyatlar</h2>
        {completedQueue.map((request) => (
          <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">{request.referenceNumber}</p>
                <p className="text-sm text-slate-500">Ihracatci: {request.exporter.fullName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Tamamlanma: {new Date(request.updatedAt).toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={request.documents[0]?.fileUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Police
                </a>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              </div>
            </div>
          </div>
        ))}

        {completedQueue.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Henuz tamamlanan sigortali sevkiyat yok.
          </div>
        )}
      </section>
    </div>
  );
}
