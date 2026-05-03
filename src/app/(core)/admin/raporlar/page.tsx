import Link from "next/link";
import { TicketStatus } from "@prisma/client";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Users,
  Package,
  FileText,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminRaporlarPage() {
  await requireAdmin();

  const [userTotal, byRole, byStatus, openTickets] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.tradeRequest.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.supportTicket.count({ where: { status: TicketStatus.OPEN } }),
  ]);

  const chartVals = byStatus
    .slice()
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 7)
    .map((s) => s._count.id);
  const chartMax = Math.max(...chartVals, 1);
  const chartPx = 160;
  const statusLabels = byStatus
    .slice()
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 7);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-200">
              <Activity className="h-4 w-4" />
              Yönetici analizi
            </p>
            <h1 className="text-3xl font-black tracking-tighter md:text-4xl">Raporlar & Analiz</h1>
            <p className="max-w-xl text-sm text-slate-300 font-medium">
              Kullanıcı, talep durumu ve açık destek özetleri.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-colors"
          >
            Ana admin <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Users className="h-10 w-10 text-sky-100 bg-sky-600 rounded-2xl p-2 mb-3" />
          <p className="text-3xl font-black text-slate-900">{userTotal}</p>
          <p className="text-sm text-slate-500 mt-1">Kayıtlı kullanıcı</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Package className="h-10 w-10 text-emerald-100 bg-emerald-600 rounded-2xl p-2 mb-3" />
          <p className="text-3xl font-black text-slate-900">
            {byStatus.reduce((a, s) => a + s._count.id, 0)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Toplam talep</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <FileText className="h-10 w-10 text-amber-100 bg-amber-600 rounded-2xl p-2 mb-3" />
          <p className="text-3xl font-black text-slate-900">{openTickets}</p>
          <p className="text-sm text-slate-500 mt-1">Açık destek kaydı</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <BarChart3 className="h-10 w-10 text-violet-100 bg-violet-600 rounded-2xl p-2 mb-3" />
          <p className="text-3xl font-black text-slate-900">{byRole.length}</p>
          <p className="text-sm text-slate-500 mt-1">Rol çeşidi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            Kullanıcılar (rol)
          </h2>
          <ul className="space-y-2 text-sm">
            {byRole.map((r) => (
              <li
                key={r.role}
                className="flex justify-between rounded-xl border border-slate-100 px-4 py-2 bg-slate-50/80"
              >
                <span className="font-medium text-slate-700">{r.role}</span>
                <span className="font-black text-slate-900">{r._count.id}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            Talep durumu (üst 7)
          </h2>
          <div className="flex items-end justify-between gap-2 border-b border-slate-100 pb-2 min-h-[200px]">
            {statusLabels.map((s, idx) => {
              const v = chartVals[idx] ?? 0;
              const h = Math.max(10, Math.round((v / chartMax) * chartPx));
              return (
                <div key={s.status} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <div className="flex h-[160px] w-full max-w-[44px] flex-col justify-end mx-auto">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400"
                      style={{ height: `${h}px` }}
                      title={`${s.status}: ${v}`}
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 text-center leading-tight">
                    {String(s.status).replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
