"use client";

import { useActionState } from "react";
import { registerAction } from "../actions";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User as UserIcon, Globe, CheckCircle2, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

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
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="flex flex-1 items-center justify-center p-4 z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50"
        >
          <motion.div variants={childVariants} className="mb-8 text-center relative">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="w-16 h-16 bg-brand-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-primary/30"
            >
              <Globe className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Hubify</h1>
            <p className="text-sm text-slate-500 font-medium">Küresel Ticaret Ağına Katılın</p>
          </motion.div>

          <form action={formAction} className="space-y-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad / Firma Adı</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-secondary transition-colors" />
                </div>
                <input 
                  name="fullName"
                  type="text" 
                  required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary outline-none transition-all" 
                  placeholder="Örn: Hubify Lojistik A.Ş."
                />
              </div>
            </motion.div>

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
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary outline-none transition-all" 
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </motion.div>

            <motion.button 
              variants={childVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium shadow-md shadow-brand-primary/20 hover:shadow-lg hover:bg-slate-800 transition-all disabled:opacity-70 disabled:pointer-events-none mt-6"
            >
              {isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Hesap Oluştur
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={childVariants} className="mt-8 text-center text-sm text-slate-500">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-semibold text-brand-secondary hover:text-sky-700 transition-colors">
              Giriş Yapın
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Decorative Floating Elements (Hidden on mobile) */}
      <div className="hidden lg:block absolute left-[10%] top-[25%] opacity-50">
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100"
        >
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Ücretsiz Kayıt</div>
            <div className="text-xs text-slate-500">Ekosisteme Katılın</div>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block absolute right-[10%] bottom-[25%] opacity-50">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100"
        >
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Anında Onay</div>
            <div className="text-xs text-slate-500">Kimlik Doğrulama</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
