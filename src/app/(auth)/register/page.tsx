"use client";

import { useActionState } from "react";
import { registerAction } from "../actions";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User as UserIcon } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-brand-primary tracking-tight mb-2">Hubify</h1>
          <p className="text-sm text-slate-500">Platforma Kayıt Olun</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad / Firma Adı</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                name="fullName"
                type="text" 
                required
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" 
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                name="email"
                type="email" 
                required
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" 
                placeholder="ornek@sirket.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                name="password"
                type="password" 
                required
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" 
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button 
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-primary text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 mt-4"
          >
            {isPending ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-semibold text-brand-secondary hover:underline">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
