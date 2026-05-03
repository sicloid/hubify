import { DocumentType, PaymentStatus, TradeStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  FileText,
  MapPin,
  Package,
  Ship,
  Truck,
  User,
  Users,
} from "lucide-react";
import { formatTradeMoney, tradeProductImageSrc } from "@/lib/format-trade-money";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

const documentLabels: Record<DocumentType, string> = {
  COMMERCIAL_INVOICE: "Ticari Fatura",
  BILL_OF_LADING: "Konşimento",
  CUSTOMS_DECLARATION: "Gümrük Beyannamesi",
  INSURANCE_POLICY: "Sigorta Poliçesi",
  OTHER: "Diğer Belge",
};

const tradeStatusLabels: Record<TradeStatus, string> = {
  PENDING: "Beklemede (ilan)",
  ORDERED: "Sipariş alındı",
  QUOTING: "Teklif aşaması",
  LOGISTICS_APPROVED: "Lojistik onaylı",
  DOCUMENTS_PENDING: "Belge incelemesi",
  DOCUMENTS_APPROVED: "Belgeler onaylı",
  IN_TRANSIT: "Yolda",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  AWAITING_PAYMENT: "Ödeme bekleniyor",
  ESCROW_HELD: "Ödeme havuzda (ICC)",
  RELEASED_TO_SELLER: "Satıcıya aktarıldı",
  REFUNDED: "İade edildi",
};

export default async function IccQuoteDetailPage({
  params,
}: {
  params: Promise<{ referenceNumber: string }>;
}) {
  await requireRole([UserRole.ICC_EXPERT]);
  const { referenceNumber } = await params;

  const request = await prisma.tradeRequest.findUnique({
    where: { referenceNumber: decodeURIComponent(referenceNumber) },
    include: {
      exporter: { select: { fullName: true, email: true } },
      buyer: { select: { fullName: true, email: true } },
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

  const acceptedQuote = request.quotes.find((q) => q.isAccepted);
  const productImageSrc = tradeProductImageSrc(request.productImage);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/icc-uzmani"
          className="mb-4 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Belge onay merkezine dön
        </Link>

        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{request.referenceNumber}</h1>
            <p className="mt-1 text-sm text-slate-500">Talep detayı ve belge geçmişi</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {tradeStatusLabels[request.status] ?? request.status}
            </span>
            {request.paymentStatus ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                {paymentStatusLabels[request.paymentStatus] ?? request.paymentStatus}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {productImageSrc ? (
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:max-w-none">
              {/* eslint-disable-next-line @next/next/no-img-element -- DB'deki URL yerel veya S3 olabilir */}
              <img
                src={productImageSrc}
                alt={request.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className={productImageSrc ? "lg:col-span-2" : "lg:col-span-3"}>
            <h2 className="text-lg font-bold text-slate-900">{request.title}</h2>
            {request.description ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{request.description}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-400">Açıklama girilmemiş.</p>
            )}

            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <div>
                  <dt className="text-xs text-slate-500">Ağırlık</dt>
                  <dd className="text-sm font-semibold text-slate-900">{request.weight} kg</dd>
                </div>
              </div>
              <div className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <div>
                  <dt className="text-xs text-slate-500">Hedef şehir / bölge</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    {request.destinationCity || "—"}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <dt className="text-xs text-slate-500">Birim fiyat</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    {formatTradeMoney(request.unitPrice, request.currency)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <dt className="text-xs text-slate-500">Toplam</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    {formatTradeMoney(request.totalPrice, request.currency)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="h-3.5 w-3.5" />
              İhracatçı
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{request.exporter.fullName}</p>
            <p className="text-xs text-slate-500">{request.exporter.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Alıcı
            </p>
            {request.buyer ? (
              <>
                <p className="mt-1 text-sm font-semibold text-slate-800">{request.buyer.fullName}</p>
                <p className="text-xs text-slate-500">{request.buyer.email}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Henüz atanmamış</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Zaman çizelgesi</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Oluşturulma: {new Date(request.createdAt).toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-slate-500">
              Güncelleme: {new Date(request.updatedAt).toLocaleString("tr-TR")}
            </p>
            {request.paidAt ? (
              <p className="mt-1 text-xs text-slate-600">
                Ödeme: {new Date(request.paidAt).toLocaleString("tr-TR")}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {acceptedQuote ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-900">
            <Truck className="h-5 w-5 text-emerald-700" />
            Kabul edilen lojistik teklifi
          </h2>
          <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">
              {acceptedQuote.logistics.fullName} • {acceptedQuote.price.toString()}{" "}
              {acceptedQuote.currency} • {acceptedQuote.estimatedDays} gün
            </p>
            <p className="mt-1 text-xs text-slate-500">{acceptedQuote.logistics.email}</p>
            {acceptedQuote.notes ? (
              <p className="mt-2 text-sm text-slate-600">{acceptedQuote.notes}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Truck className="h-5 w-5 text-sky-600" />
          Tüm lojistik teklifleri ({request.quotes.length})
        </h2>

        <div className="mt-4 space-y-3">
          {request.quotes.map((quote) => (
            <div
              key={quote.id}
              className={`rounded-xl border p-4 ${
                quote.isAccepted ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {quote.logistics.fullName} • {quote.price.toString()} {quote.currency}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {quote.isAccepted ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      Kabul edildi
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {quote.estimatedDays} gün
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{quote.logistics.email}</p>
              {quote.notes ? <p className="mt-2 text-sm text-slate-600">{quote.notes}</p> : null}
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
          Belgeler ({request.documents.length})
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {request.documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {documentLabels[doc.type] ?? doc.type}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">{doc.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    doc.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {doc.isApproved ? "Onaylı" : "Beklemede"}
                </span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                >
                  <Ship className="h-3.5 w-3.5" />
                  Görüntüle
                </a>
              </div>
            </div>
          ))}
        </div>

        {request.documents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Henüz belge yüklenmemiş.</p>
        ) : null}
      </section>
    </div>
  );
}
