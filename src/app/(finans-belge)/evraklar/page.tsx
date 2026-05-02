import { FileText, ClipboardCheck } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_TYPE_LABEL_TR } from "../_lib/document-labels";
import { approveDocument } from "../actions/document-actions";

const EVR_ALLOWED: UserRole[] = ["ICC_EXPERT", "FINANCIAL_ADV", "ADMIN"];

const APPROVAL_ROLES: UserRole[] = ["ICC_EXPERT", "ADMIN"];

export default async function EvraklarPage() {
  const session = await requireRole(EVR_ALLOWED);
  const canApprove = APPROVAL_ROLES.includes(session.role);

  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      tradeRequest: {
        select: { referenceNumber: true, title: true, status: true },
      },
      uploadedBy: { select: { fullName: true, email: true } },
    },
  });

  const pending = docs.filter((d) => !d.isApproved);
  const cleared = docs.filter((d) => d.isApproved);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Finans • Belge
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Belge konsolu</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 leading-relaxed">
            Fatura, konşimento ve gümrük evrakları burada konsolide edilir. Uzman onayından sonra
            süreç &quot;Evrak, Para ve Güvence&quot; hattına aktarılabilir.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <ClipboardCheck className="h-10 w-10 text-brand-secondary" />
          <div>
            <p className="text-xs uppercase text-slate-500">Operasyon sırasında</p>
            <p className="text-lg font-semibold text-slate-900">
              {pending.length} beklemede • {cleared.length} kapalı
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Belgeler</h2>
              <span className="text-xs font-medium rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                Son {docs.length} kayıt
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">Belge</th>
                    <th className="px-6 py-3">Tür</th>
                    <th className="px-6 py-3 hidden sm:table-cell">Talep</th>
                    <th className="px-6 py-3 hidden md:table-cell">Yükleyen</th>
                    <th className="px-6 py-3">Durum</th>
                    {canApprove && <th className="px-6 py-3 text-right">İşlem</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.length === 0 && (
                    <tr>
                      <td colSpan={canApprove ? 6 : 5} className="px-6 py-14 text-center text-slate-500">
                        Kayıtlı belge bulunamadı. Veri geldikçe tablo dolacaktır.
                      </td>
                    </tr>
                  )}
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-900 max-w-[12rem] truncate">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-brand-secondary" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {DOCUMENT_TYPE_LABEL_TR[doc.type]}
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell text-slate-600">
                        <span className="font-mono text-xs">{doc.tradeRequest.referenceNumber}</span>
                        <span className="block text-[11px] text-slate-400 truncate">
                          {doc.tradeRequest.title}
                        </span>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell text-slate-600">
                        <span className="block">{doc.uploadedBy.fullName}</span>
                        <span className="block text-[11px] text-slate-400">{doc.uploadedBy.email}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                            doc.isApproved
                              ? "bg-brand-accent/10 text-emerald-800 ring-emerald-200"
                              : "bg-amber-50 text-amber-800 ring-amber-100"
                          }`}
                        >
                          {doc.isApproved ? "Onaylı" : "İnceleme"}
                        </span>
                      </td>
                      {canApprove && (
                        <td className="px-6 py-3 text-right">
                          {!doc.isApproved ? (
                            <form action={approveDocument}>
                              <input type="hidden" name="documentId" value={doc.id} />
                              <button
                                type="submit"
                                className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                              >
                                Onayla
                              </button>
                            </form>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Güvenilir önizleme alanı
            </p>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Dosya seçildiğinde PDF ve görüntü ön izlemesi burada açılacaktır (imzalı URL / nesne depolama
              entegrasyonu ile bağlanır). Path traversal korumalı imzalı linkler kullanılacaktır.
            </p>
            <div className="mt-6 flex aspect-[4/5] flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] text-slate-400">
                PDF • önizleme beklemede
              </span>
            </div>
          </div>

          {!canApprove && (
            <p className="text-xs text-slate-500 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 leading-relaxed">
              Bu kullanıcı rolünde uzman onayı yapılmaz; sadece konsolü görüntüleyebilirsiniz.
              Onay gerekiyorsa Dış Ticaret / ICC uzmanına yönlendirin.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
