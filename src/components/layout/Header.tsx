"use client";

import { LogOut, Bell, Search, Globe, LifeBuoy, X, Send, AlertTriangle, MessageSquare, ShieldAlert } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { AuthSession } from "@/lib/auth-utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roleLabels: Record<string, string> = {
  ADMIN: "Sistem Yöneticisi",
  EXPORTER: "İhracatçı KOBİ",
  LOGISTICS: "Lojistik & Taşıyıcı",
  ICC_EXPERT: "ICC Gümrük Uzmanı",
  FINANCIAL_ADV: "Mali Müşavir",
  INSURER: "Sigorta Acentesi"
};

export default function Header({ session }: { session?: AuthSession | null }) {
  const router = useRouter();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportState, setSupportState] = useState<'idle' | 'sending' | 'success'>('idle');
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportState('sending');
    setTimeout(() => {
      setSupportState('success');
      setTimeout(() => {
        setIsSupportOpen(false);
        setTimeout(() => setSupportState('idle'), 300); // Reset after close
      }, 2000);
    }, 1500);
  };

  return (
    <>
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
        <button 
          onClick={() => setIsSupportOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors border border-rose-100"
        >
          <LifeBuoy className="w-4 h-4" /> Destek / Hata Bildir
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
        </button>
        
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 leading-tight">{session?.fullName || "Kullanıcı"}</span>
            <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-1.5 rounded uppercase tracking-wider">
              {session?.role ? roleLabels[session.role] : "Yetkisiz"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-md text-white font-bold text-sm border-2 border-white">
            {getInitials(session?.fullName || "")}
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

    {/* Support Modal Overlay */}
    <AnimatePresence>
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => supportState === 'idle' && setIsSupportOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {supportState === 'success' ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Send className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Rapor Gönderildi!</h3>
                <p className="text-slate-500 font-medium">Bildiriminiz başarıyla sistem yöneticisine iletildi. En kısa sürede incelenecektir.</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Sistem Admine Bildir</h3>
                      <p className="text-sm text-slate-500 font-medium">Hata logu veya yeni bir geliştirme talebi oluşturun.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSupportOpen(false)}
                    className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSupportSubmit} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Bildirim Türü</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="cursor-pointer group">
                          <input type="radio" name="type" className="peer sr-only" defaultChecked />
                          <div className="p-4 border-2 border-slate-100 rounded-2xl peer-checked:border-rose-500 peer-checked:bg-rose-50 transition-all text-center">
                            <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-slate-400 peer-checked:text-rose-500 group-hover:scale-110 transition-transform" />
                            <span className="block text-sm font-bold text-slate-600 peer-checked:text-rose-700">Teknik Hata (Bug)</span>
                          </div>
                        </label>
                        <label className="cursor-pointer group">
                          <input type="radio" name="type" className="peer sr-only" />
                          <div className="p-4 border-2 border-slate-100 rounded-2xl peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all text-center">
                            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-400 peer-checked:text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span className="block text-sm font-bold text-slate-600 peer-checked:text-indigo-700">İstek / Öneri</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Detaylı Açıklama</label>
                      <textarea 
                        required
                        placeholder="Lütfen karşılaştığınız sorunu veya talebinizi detaylıca açıklayın..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsSupportOpen(false)}
                      className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit"
                      disabled={supportState === 'sending'}
                      className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {supportState === 'sending' ? (
                        <>Gönderiliyor...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Raporu Gönder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
