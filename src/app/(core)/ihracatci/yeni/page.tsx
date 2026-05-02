'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Send, Package, Truck, CheckCircle2, Info, MapPin, DollarSign, Tag } from "lucide-react";
import Link from "next/link";
import { createTradeRequest } from '../actions';

export default function YeniTalepPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createTradeRequest(formData);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || "Bir hata oluştu.");
    }
    setIsPending(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
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
              <h1 className="text-3xl font-bold text-slate-900">Yeni Ürün İlanı Oluştur</h1>
              <p className="text-slate-500 mt-2">Ürününüzü listeleyin, alıcılar pazaryerinde görsün.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Product Image Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  <div className="md:col-span-1 space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Ürün Fotoğrafı</label>
                    <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-brand-secondary transition-colors cursor-pointer group">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Package className="w-10 h-10 text-slate-300 group-hover:text-brand-secondary transition-colors" />
                          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Fotoğraf Yükle</p>
                        </>
                      )}
                      <input 
                        name="productImage" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    {/* Visual Info Card */}
                    <div className="bg-brand-primary rounded-2xl p-6 text-white flex items-center gap-6 relative overflow-hidden h-full">
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg">Neden Mikro-İhracat?</h3>
                        <p className="text-slate-300 text-sm mt-1 leading-relaxed">LCL (Parsiyel) taşımacılık ile konteyner maliyetini diğer satıcılarla bölüşürsünüz.</p>
                      </div>
                      <Truck className="w-24 h-24 text-white/10 absolute right-[-10px] top-[-10px]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Ne Satıyorsunuz? (Ürün Adı)</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="title" required type="text" placeholder="Örn: El dokuması halı" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Hedef Şehir (Lojistik için)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="destinationCity" required type="text" placeholder="Örn: Berlin, DE" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Ağırlık (kg)</label>
                    <input name="weight" required type="number" step="0.1" placeholder="Örn: 25" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Birim Fiyat (kg başına)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="unitPrice" required type="number" step="0.01" placeholder="Örn: 12.50" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Para Birimi</label>
                    <select name="currency" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all font-bold">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Açıklama (Alıcıya Notlar)</label>
                    <textarea name="description" placeholder="Ürün özellikleri, ambalaj detayları vb." rows={1} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all resize-none" />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</motion.p>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 max-w-[200px] font-medium leading-relaxed uppercase tracking-tighter">
                    Ürününüz pazaryerinde yayınlanacak. Ödeme ICC güvencesinde tutulur.
                  </p>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
                  >
                    {isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    ) : (
                      <Send className="w-5 h-5 mr-3" />
                    )}
                    İlani Yayina Al
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
              <h2 className="text-3xl font-bold text-slate-900">İlanınız Yayında!</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                Ürün ilanınız pazaryerinde yayınlandı. Alıcılar sipariş verdiğinde bilgilendirileceksiniz.
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
