'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, use, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, DollarSign, Info, MapPin, Box, TrendingDown, Ship } from "lucide-react";
import Link from "next/link";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { createQuote, getRequestDetail, getPoolStats } from '../actions';
import { TradeStatus } from '@prisma/client';

// Map Prisma status to OperationStatus
const mapStatus = (status: TradeStatus): OperationStatus => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'QUOTING': return 'Teklif Alındı';
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    default: return 'Beklemede';
  }
};

export default function LojistikTeklifDetayPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [isSent, setIsSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [talep, setTalep] = useState<any>(null);
  const [poolStats, setPoolStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [talepData, statsData] = await Promise.all([
        getRequestDetail(params.id),
        getPoolStats()
      ]);
      setTalep(talepData);
      setPoolStats(statsData);
      setIsLoading(false);
    }
    loadData();
  }, [params.id]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const price = parseFloat(formData.get("price") as string);
    const days = parseInt(formData.get("days") as string);

    const result = await createQuote({
      tradeRequestId: params.id,
      price,
      estimatedDays: days,
    });

    if (result.success) {
      setIsSent(true);
    }
    setIsPending(false);
  };

  if (isLoading) {
    return <div className="p-20 text-center animate-pulse text-slate-400">Yük detayları getiriliyor...</div>;
  }

  if (!talep) {
    return <div className="p-20 text-center text-slate-400">Talep bulunamadı.</div>;
  }

  // Optimization Calculation
  const currentOccupancy = poolStats?.occupancyRate || 0;
  const requestWeight = talep.weight || 0;
  const newOccupancy = poolStats ? Math.min(Math.round(((poolStats.totalWeight + requestWeight) / poolStats.capacity) * 100), 100) : 0;
  const isAlreadyInPool = talep.status !== TradeStatus.PENDING;

  return (
    <div className="max-w-6xl mx-auto p-8 pb-20">
      <div className="mb-8">
        <Link 
          href="/lojistik" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Havuz Listesine Dön
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Talep İnceleme: {talep.referenceNumber}</h1>
          <StatusBadge status={mapStatus(talep.status)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Consolidation Insight */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-sky-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-sky-200"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">Havuz Optimizasyonu</h3>
              </div>
              <p className="text-sky-100 text-sm leading-relaxed max-w-lg">
                {isAlreadyInPool ? (
                  `Bu yük şu an havuzda ve doluluk oranına %${Math.round((requestWeight / poolStats.capacity) * 100)} katkı sağlıyor.`
                ) : (
                  <>Bu mikro-ihracat talebini havuzuna dahil ederseniz, konteyner doluluk oranınız %{currentOccupancy}&apos;den <strong className="text-white">%{newOccupancy}</strong>&apos;ye çıkacaktır.</>
                )}
              </p>
            </div>
            <Ship className="w-40 h-40 text-white/10 absolute right-[-20px] bottom-[-20px] rotate-12" />
          </motion.div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Box className="w-5 h-5 text-slate-400" />
                Yük ve Rota Detayları
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">İhracatçı Firma</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{talep.exporter.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Talep Başlığı</dt>
                  <dd className="mt-1 text-sm text-slate-900">{talep.title}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ağırlık</dt>
                  <dd className="mt-1 text-sm font-bold text-sky-600">{talep.weight} kg</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Açıklama</dt>
                  <dd className="mt-1 text-sm text-slate-600">{talep.description}</dd>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Talep Tarihi</dt>
                  <dd className="text-sm font-bold text-slate-900">{new Date(talep.createdAt).toLocaleDateString('tr-TR')}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mevcut Teklif Sayısı</dt>
                  <dd className="mt-1 text-sm text-sky-600 font-bold">{talep.quotes.length} Adet</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden sticky top-8">
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                Havuza Dahil Et
              </h3>
              
              <form onSubmit={handleSend} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Konsolide Teklif Tutarı (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input name="price" required type="number" step="0.01" placeholder="0.00" className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tahmini Varış Süresi (Gün)</label>
                  <input name="days" required type="number" placeholder="Örn: 7" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Dikkat:</strong> Teklifiniz onaylandığında yük konsolidasyon sürecine dahil edilecektir.
                  </p>
                </div>

                <div className="relative">
                  <button 
                    type="submit"
                    disabled={isSent || isPending}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isPending ? "Gönderiliyor..." : isSent ? "Teklif Gönderildi" : "Teklifi İmzala & Gönder"}
                  </button>

                  {/* Digital Stamp / Mühür Animation */}
                  <AnimatePresence>
                    {isSent && (
                      <motion.div 
                        initial={{ scale: 2, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -15 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-6 py-2 rounded-xl backdrop-blur-sm bg-white/10 uppercase tracking-tighter shadow-2xl">
                          ONAYLANDI
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
            {isSent && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="bg-emerald-50 p-6 border-t border-emerald-100 text-center"
              >
                <p className="text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  İşlem Zincire Kaydedildi
                </p>
                <Link href="/lojistik" className="text-emerald-600 text-xs font-bold mt-2 inline-block hover:underline">
                  Listeye Dön
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
