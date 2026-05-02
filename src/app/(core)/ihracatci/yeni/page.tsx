'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Send, Package, Truck, CheckCircle2, Info, MapPin } from "lucide-react";
import Link from "next/link";
import { createTradeRequest } from '../actions';

export default function YeniTalepPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const city = formData.get("city") as string;
    const weight = parseFloat(formData.get("weight") as string);
    
    const result = await createTradeRequest({
      title,
      description: `${city} hedefli mikro-ihracat yükü.`,
      weight: weight,
    });

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || "Bir hata oluştu.");
    }
    setIsPending(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div>
              <Link 
                href="/ihracatci" 
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Panoya Dön
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Yeni Mikro-İhracat Talebi</h1>
              <p className="text-slate-500 mt-2">Yükünüzü sisteme girin, konteyner havuzundaki yerinizi ayırtın.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Visual Info Card */}
                <div className="bg-brand-primary rounded-2xl p-6 text-white flex items-center gap-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg">Neden Mikro-İhracat?</h3>
                    <p className="text-slate-300 text-sm mt-1">LCL (Parsiyel) taşımacılık ile konteyner maliyetini diğer satıcılarla bölüşürsünüz.</p>
                  </div>
                  <Package className="w-20 h-20 text-white/10 absolute right-[-10px] top-[-10px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Ne Gönderiyorsunuz?</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="title" required type="text" placeholder="Örn: El dokuması halı" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Ağırlık (kg)</label>
                    <input name="weight" required type="number" placeholder="Örn: 25" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Nereye? (Hedef Şehir)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="city" required type="text" placeholder="Örn: Berlin, DE" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Hacim Tahmini</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all">
                      <option>1m³ altı (Koli/Paket)</option>
                      <option>1-3m³ (Palet)</option>
                      <option>3m³+ (Büyük Hacim)</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold">{error}</p>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xs text-slate-400 max-w-xs">
                    Talebiniz yayınlandığında lojistik firmaları konteyner havuzuna göre size en uygun fiyatı sunacaktır.
                  </p>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center px-8 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Yükü Havuza Gönder
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-8"
          >
            {/* Visual Success Animation */}
            <div className="relative w-64 h-32 flex items-center justify-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0"
              >
                <Package className="w-16 h-16 text-brand-secondary" />
              </motion.div>
              
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute right-0"
              >
                <Truck className="w-24 h-24 text-slate-900" />
              </motion.div>

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: 'spring' }}
                className="absolute bg-emerald-500 text-white rounded-full p-2 top-0 right-0"
              >
                <CheckCircle2 className="w-6 h-6" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">Yükünüz Yola Hazır!</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                Mikro-ihracat talebiniz oluşturuldu ve konteyner havuzuna eklendi. Lojistik firmaları tekliflerini birazdan iletecektir.
              </p>
            </div>

            <Link 
              href="/ihracatci"
              className="inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
            >
              Panoya Dön
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
