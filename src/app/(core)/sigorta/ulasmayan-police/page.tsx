import Link from "next/link";
import { TradeStatus, UserRole } from "@prisma/client";
import {
  ExternalLink,
  FileText,
  Route,
  Shield,
} from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import { tradeProductImageSrc } from "@/lib/format-trade-money";
import { getInsuredPipelineUntilCompleted } from "../actions";
import DispatchInsuredButton from "../DispatchInsuredButton";

function phaseLabel(status: TradeStatus): { label: string; className: string } {
  if (status === TradeStatus.DOCUMENTS_APPROVED) {
    return {
      label: "Poliçe kesildi — sevkiyat öncesi",
      className: "bg-amber-50 text-amber-900 ring-amber-200",
    };
  }
  if (status === TradeStatus.IN_TRANSIT) {
    return {
      label: "Yolda (sigortalı)",
      className: "bg-violet-50 text-violet-900 ring-violet-200",
    };
  }
  return {
    label: status,
    className: "bg-slate-100 text-slate-800 ring-slate-200",
  };
}

export default async function UlasmayanPolicePage() {
  await requireRole([UserRole.INSURER]);

  const requests = await getInsuredPipelineUntilCompleted();

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Route className="h-8 w-8 text-amber-400" />
            Ulaşmamış poliçeler
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Poliçe <strong className="text-white">kesildikten sonra</strong>, işlem{" "}
            <strong className="text-white">tamamlanana kadar</strong> tüm aşamaları burada görürsünüz:
            önce sevkiyat öncesi bekleme, ardından yolda. Sevkiyat öncesi kayıtlarda kart üzerinden{" "}
            <strong className="text-white">Sevkiyatı başlat</strong> ile yola çıkarabilirsiniz; işlem{" "}
            <code className="rounded bg-white/10 px-1 text-sky-200">IN_TRANSIT</code> olur.
          </p>
        </div>
        <div className="pointer-events-none absolute right-[-24px] top-[-24px] rotate-12 opacity-10">
          <Route size={180} />
        </div>
      </section>

      {requests.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-12 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-bold text-slate-600">Aktif poliçeli süreç yok</p>
          <p className="mt-2 text-sm text-slate-500">
            Poliçe kestikten sonra kayıtlar burada listelenir. Önce{" "}
            <Link href="/sigorta/bekleyen" className="font-semibold text-sky-600 hover:underline">
              Poliçe bekleyen
            </Link>{" "}
            ekranından PDF yükleyin.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request: any) => {
            const policyDoc = request.documents?.[0];
            const imgSrc = tradeProductImageSrc(request.productImage);
            const phase = phaseLabel(request.status as TradeStatus);

            const canDispatch =
              (request.status as TradeStatus) === TradeStatus.DOCUMENTS_APPROVED && Boolean(policyDoc);

            return (
              <article
                key={request.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    {imgSrc ? (
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                        <Shield className="h-10 w-10" aria-hidden />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${phase.className}`}
                        >
                          {phase.label}
                        </span>
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-amber-800">{request.referenceNumber}</p>
                        <h2 className="text-lg font-bold text-slate-900">{request.title}</h2>
                        <p className="text-sm text-slate-500">
                          İhracatçı: {request.exporter?.fullName}
                          {request.buyer?.fullName ? ` • Alıcı: ${request.buyer.fullName}` : ""}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-800">
                          Poliçe (PDF)
                        </p>
                        {policyDoc ? (
                          <a
                            href={policyDoc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-amber-900 hover:underline"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{policyDoc.name}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          </a>
                        ) : (
                          <p className="text-xs text-amber-900">Poliçe kaydı bulunamadı.</p>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Güncelleme: {new Date(request.updatedAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  {canDispatch ? (
                    <div className="flex w-full shrink-0 flex-col justify-center gap-2 border-t border-slate-100 pt-4 lg:w-56 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <DispatchInsuredButton tradeRequestId={request.id} />
                      <p className="text-center text-[10px] font-medium text-slate-500 lg:text-left">
                        Yola çıktığında kart “Yolda (sigortalı)” aşamasına geçer.
                      </p>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
