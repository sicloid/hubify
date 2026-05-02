import { Gauge, Shield, Anchor } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { submitInsuranceQuoteDraft } from "../actions/insurance-actions";

const INSUR_ALLOWED: UserRole[] = ["INSURER", "ADMIN"];

export default async function SigortaFinansBelgePage() {
  await requireRole(INSUR_ALLOWED);

  const candidates = await prisma.tradeRequest.findMany({
    where: {
      status: {
        in: ["DOCUMENTS_PENDING", "DOCUMENTS_APPROVED", "LOGISTICS_APPROVED", "IN_TRANSIT"],
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: {
      id: true,
      referenceNumber: true,
      title: true,
      status: true,
      exporter: { select: { fullName: true, email: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Güvence • Sigorta
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Teminat &amp; poliçe konsolu</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 leading-relaxed">
            Gönderi bazında değerleme, kapasite seçimi ve poliçe taslağı. Teklif gönderildiğinde denetim
            kaydı yaratılır (Blue Team uyumu için server action düzeyinde log).
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Gauge className="h-10 w-10 text-brand-secondary" />
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Kuyruk</p>
            <p className="text-xl font-semibold text-slate-900">{candidates.length} gönderi</p>
          </div>
        </div>
      </header>

      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-12 text-center text-slate-600">
          <Shield className="mx-auto mb-4 h-12 w-12 text-brand-secondary opacity-70" />
          <p className="text-base font-semibold text-slate-900">Uygun gönderi bulunmuyor</p>
          <p className="mt-2 text-sm max-w-lg mx-auto">
            Operasyonlar &quot;belge onayı&quot; sonrasına geçtikçe bu kuyruk dolar.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {candidates.map((job) => (
            <li
              key={job.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-brand-secondary">{job.referenceNumber}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 leading-snug">{job.title}</h3>
                  <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                    <Anchor className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{job.exporter.fullName}</span>
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                    Durum • {job.status.replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Poliçe taslağı</p>
                <form action={submitInsuranceQuoteDraft} className="space-y-4">
                  <input type="hidden" name="shipmentId" value={job.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600" htmlFor={`premium-${job.id}`}>
                        Prim tahmini ({job.referenceNumber})
                      </label>
                      <input
                        id={`premium-${job.id}`}
                        name="premium"
                        type="text"
                        inputMode="decimal"
                        placeholder="örn. 12400"
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner transition focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600" htmlFor={`curr-${job.id}`}>
                        Para birimi
                      </label>
                      <select
                        id={`curr-${job.id}`}
                        name="currency"
                        defaultValue="USD"
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/20"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600" htmlFor={`note-${job.id}`}>
                      Teminat / değerleme notları
                    </label>
                    <textarea
                      id={`note-${job.id}`}
                      name="coverageNote"
                      rows={3}
                      placeholder="INCOTERMS • rota güvenliği • özel yükleme gereksinimleri…"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-brand-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:opacity-90 sm:w-auto"
                  >
                    Taslağı kaydet ve kuyruğa ilet
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
