"use client";

import { useActionState, useState, useRef } from "react";
import { loginAction } from "../actions";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Box, Globe, ShieldCheck, User, Truck, FileCheck, Landmark, Shield } from "lucide-react";
import { motion } from "framer-motion";

const DEMO_ACCOUNTS = [
  { role: "İhracatçı", email: "ihracatci@hubify.test", icon: User, color: "text-blue-500", bg: "bg-blue-100" },
  { role: "Lojistik", email: "lojistik@hubify.test", icon: Truck, color: "text-emerald-500", bg: "bg-emerald-100" },
  { role: "ICC Uzmanı", email: "icc-uzmani@hubify.test", icon: FileCheck, color: "text-purple-500", bg: "bg-purple-100" },
  { role: "Mali Müşavir", email: "mali-musavir@hubify.test", icon: Landmark, color: "text-amber-500", bg: "bg-amber-100" },
  { role: "Sigorta", email: "sigorta@hubify.test", icon: Shield, color: "text-rose-500", bg: "bg-rose-100" },
  { role: "Admin", email: "admin@hubify.test", icon: ShieldCheck, color: "text-slate-700", bg: "bg-slate-200" },
];

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Hubify123!");
    // Wait for state to update, then submit
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 100);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-sky-200/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="flex flex-1 flex-col items-center justify-center p-4 z-10 w-full max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 w-full items-center justify-center">
          
          {/* Main Login Form */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50"
          >
            <motion.div variants={childVariants} className="mb-8 text-center relative">
              <motion.div 
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-16 h-16 bg-brand-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-primary/30"
              >
                <Globe className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Hubify</h1>
              <p className="text-sm text-slate-500 font-medium">Küçük İşletmeler İçin Global Ağ</p>
            </motion.div>

            <form ref={formRef} action={formAction} className="space-y-5">
              {state?.error && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {state.error}
                </motion.div>
              )}

              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-secondary transition-colors" />
                  </div>
                  <input 
                    name="email"
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary outline-none transition-all" 
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </motion.div>

              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-secondary transition-colors" />
                  </div>
                  <input 
                    name="password"
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary outline-none transition-all" 
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              <motion.div variants={childVariants} className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-slate-300 text-brand-secondary focus:ring-brand-secondary w-4 h-4 transition-all" />
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Beni hatırla</span>
                </label>
                <Link href="#" className="font-medium text-brand-secondary hover:text-sky-700 transition-colors">
                  Şifremi unuttum
                </Link>
              </motion.div>

              <motion.button 
                variants={childVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium shadow-md shadow-brand-primary/20 hover:shadow-lg hover:bg-slate-800 transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p variants={childVariants} className="mt-8 text-center text-sm text-slate-500">
              Hesabınız yok mu?{" "}
              <Link href="/register" className="font-semibold text-brand-secondary hover:text-sky-700 transition-colors">
                Kayıt Olun
              </Link>
            </motion.p>
          </motion.div>

          {/* Quick Demo Login Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-sm p-6 bg-slate-900/5 backdrop-blur-md rounded-2xl border border-slate-200/50 flex flex-col gap-4 shadow-sm"
          >
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-800">Jüri / Demo Girişi</h3>
              <p className="text-sm text-slate-500">Hesaplar arası hızlıca geçiş yapın ve rolleri test edin.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc, idx) => {
                const Icon = acc.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDemoLogin(acc.email)}
                    className="flex flex-col items-center justify-center p-3 gap-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-slate-300 group"
                  >
                    <div className={`p-2 rounded-lg ${acc.bg} ${acc.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{acc.role}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
