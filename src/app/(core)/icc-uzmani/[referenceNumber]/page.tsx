import { UserRole } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Ship, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export default async function IccQuoteDetailPage({
  params,
}: {
  params: Promise<{ referenceNumber: string }>;
}) {
  await requireRole([UserRole.ICC_EXPERT]);
  const { referenceNumber } = await params;

  const request = await prisma.tradeRequest.findUnique({
    where: { referenceNumber },
    include: {
      exporter: { select: { fullName: true, email: true } },
      quotes: {
        include: {
          logistics: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/icc-uzmani"
          className="mb-4 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          ICC Paneline Don
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">{request.referenceNumber} • Teklif ve Dosya Detayi</h1>
        <p className="mt-1 text-sm text-slate-500">{request.title}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Ihracatci</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{request.exporter.fullName}</p>
            <p className="text-xs text-slate-500">{request.exporter.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Durum</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{request.status}</p>
            <p className="text-xs text-slate-500">Guncelleme: {new Date(request.updatedAt).toLocaleString("tr-TR")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Aciklama</p>
            <p className="mt-1 text-sm text-slate-700">{request.description || "Açıklama yok."}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Truck className="h-5 w-5 text-sky-600" />
          ICC'ye Gelen Teklifler ({request.quotes.length})
        </h2>

        <div className="mt-4 space-y-3">
          {request.quotes.map((quote) => (
            <div key={quote.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {quote.logistics.fullName} • {quote.price.toString()} {quote.currency}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {quote.estimatedDays} gun
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{quote.logistics.email}</p>
              {quote.notes && <p className="mt-2 text-sm text-slate-600">{quote.notes}</p>}
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(quote.createdAt).toLocaleString("tr-TR")}
              </p>
            </div>
          ))}

          {request.quotes.length === 0 && (
            <div className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
              Bu talep için henüz teklif bulunmuyor.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <FileText className="h-5 w-5 text-emerald-600" />
          Belge Gecmisi ({request.documents.length})
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {request.documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{doc.type}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{doc.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    doc.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {doc.isApproved ? "Onayli" : "Beklemede"}
                </span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                >
                  <Ship className="h-3.5 w-3.5" />
                  Goruntule
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
