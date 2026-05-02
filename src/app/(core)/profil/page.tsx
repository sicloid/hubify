import Link from "next/link";
import { UserRole } from "@prisma/client";
import { ArrowLeft, BadgeCheck, KeyRound, Mail, UserCircle2 } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "./actions";

const roleLabels: Record<string, string> = {
  ADMIN: "Yönetici",
  EXPORTER: "İhracatçı",
  LOGISTICS: "Lojistik Uzmanı",
  ICC_EXPERT: "ICC Uzmanı",
  FINANCIAL_ADV: "Mali Müşavir",
  INSURER: "Sigorta Uzmanı",
};

const roleRoutes: Record<string, string> = {
  ADMIN: "/admin",
  EXPORTER: "/ihracatci",
  LOGISTICS: "/lojistik",
  ICC_EXPERT: "/icc-uzmani",
  FINANCIAL_ADV: "/mali-musavir",
  INSURER: "/sigorta",
};

export default async function GenericProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { fullName: true, email: true, role: true },
  });

  if (!user) return null;

  const roleLabel = roleLabels[user.role] || "Kullanıcı";
  const mainRoute = roleRoutes[user.role] || "/";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <UserCircle2 className="h-6 w-6 text-sky-300" />
              {roleLabel} Profil Ayarı
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Profil bilgilerinizi ve şifrenizi güvenli bir şekilde güncelleyin.
            </p>
          </div>
          <Link
            href={mainRoute}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Ana Panele Dön
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={updateProfile} className="space-y-5">
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
              <input
                type="password"
                name="currentPassword"
                placeholder="Mevcut şifre"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="Yeni şifre (min 8)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Yeni şifre tekrar"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Şifreyi değiştirmek istemiyorsan alanları boş bırakabilirsin.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-800">Profil değişiklikleri sistem genelinde anında uygulanır.</p>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <BadgeCheck className="h-4 w-4" />
              Profili Kaydet
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
