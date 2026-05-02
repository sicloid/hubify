import Link from "next/link";
import { UserRole } from "@prisma/client";
import { ArrowLeft, BadgeCheck, KeyRound, Mail, UserCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { updateFinancialProfile } from "./actions";

export default async function FinancialProfilePage() {
  const session = await requireRole([UserRole.FINANCIAL_ADV]);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { fullName: true, email: true },
  });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <UserCircle2 className="h-6 w-6 text-sky-300" />
              Mali Müşavir Profil Ayarı
            </h1>
            <p className="mt-2 text-sm text-slate-300">Mali müşavir profil bilgilerini ve şifreni güncelleyebilirsin.</p>
          </div>
          <Link
            href="/mali-musavir"
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Panele Don
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={updateFinancialProfile} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Ad Soyad</label>
              <input
                type="text"
                name="fullName"
                defaultValue={user.fullName}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
              />
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-800">E-posta</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                {user.email}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <KeyRound className="h-4 w-4 text-sky-600" />
              Şifre Değiştir (Opsiyonel)
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input type="password" name="currentPassword" placeholder="Mevcut şifre" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
              <input type="password" name="newPassword" placeholder="Yeni şifre (min 8)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
              <input type="password" name="confirmPassword" placeholder="Yeni şifre tekrar" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-800">Değişiklikler kaydedildiğinde panel anında güncellenir.</p>
            <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              Profili Kaydet
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
