"use client";

import { LogOut, Bell, Search, Globe } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-md shadow-brand-primary/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight hidden sm:block">Hubify<span className="text-brand-secondary">.</span></span>
        </div>
        
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all"
            placeholder="Konteyner, Fatura veya Kullanıcı ara..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 rounded-lg text-sm font-medium transition-colors">
          <span className="text-lg leading-none">+</span> Yeni Talep
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
        </button>
        
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 leading-tight">Demo Kullanıcı</span>
            <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-1.5 rounded uppercase tracking-wider">Aktif Rol</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-md text-white font-bold text-sm border-2 border-white">
            DK
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          title="Çıkış Yap"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
