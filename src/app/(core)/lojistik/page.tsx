'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Anchor, Layers, Box, TrendingDown, Users, Ship, ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { useEffect, useState } from 'react';
import { getAvailableRequests, autoConsolidate } from './actions';
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

export default function LojistikPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  async function loadData() {
    setIsLoading(true);
    const data = await getAvailableRequests();
    setTalepler(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAutoConsolidate = async () => {
    setIsConsolidating(true);
    const result = await autoConsolidate();
    if (result.success) {
      await loadData();
    }
    setIsConsolidating(false);
  };

  // Occupancy calculation
  const poolRequests = talepler.filter(t => t.status === TradeStatus.QUOTING);
  const totalWeight = poolRequests.reduce((acc, curr) => acc + (curr.weight || 0), 0);
  const capacity = 20000; // 20 tons
  const occupancyRate = Math.min(Math.round((totalWeight / capacity) * 100), 100);

  // Calculate "last increase" (simulated for UI impact)
  const lastRequest = [...poolRequests].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  const lastIncrease = lastRequest ? Math.round((lastRequest.weight / capacity) * 100) : 0;

  const pendingRequests = talepler.filter(t => t.status === TradeStatus.PENDING);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Header with Animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">Lojistik Konsolidasyon Merkezi</h1>
          <p className="text-slate-400 mt-2 text-lg">Küçük yükleri akıllı algoritmalarla birleştirin, konteyner doluluk oranını maksimize edin.</p>
          <div className="flex gap-4 mt-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-2xl flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <div className="text-xs">
                <p className="text-slate-400">Ort. Maliyet Avantajı</p>
                <p className="font-bold text-base">-%28.4</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-2xl flex items-center gap-3">
              <Users className="w-5 h-5 text-sky-400" />
              <div className="text-xs">
                <p className="text-slate-400">Aktif Havuz Sayısı</p>
                <p className="font-bold text-base">14 Rota</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background SVG (Abstract Ship/Container) */}
        <motion.div 
          animate={{ 
            rotate: [0, 5, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-50px] top-[-20px] opacity-10 pointer-events-none"
        >
          <Ship size={400} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Consolidation Pool Visualization */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 space-y-6"
        >
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              Aktif Konteyner Havuzları
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              <motion.div 
                layout
                className="bg-white border-2 border-sky-500/20 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900">Berlin-LCL-24 (Konteyner)</h3>
                    <p className="text-xs text-slate-500">İstanbul → Berlin</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="Beklemede" />
                    {lastIncrease > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] mt-1"
                      >
                        <ArrowUpRight className="w-3 h-3" /> %{lastIncrease} ARTIŞ
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Physical Container Visualization */}
                <div className="h-40 bg-slate-100 rounded-xl relative border-2 border-dashed border-slate-200 overflow-hidden flex items-end">
                  {/* Visualizing loaded goods */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${occupancyRate}%` }}
                    transition={{ duration: 1, delay: 0.5, type: "spring", damping: 15 }}
                    className="w-full bg-sky-500/40 backdrop-blur-sm relative"
                  >
                    <div className="absolute top-2 left-2 right-2 grid grid-cols-4 gap-1">
                      {[...Array(8)].map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="h-4 bg-white/40 rounded-sm" 
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Centered Percentage Text */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <span className="text-sm font-black text-slate-900 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50 shadow-sm">
                      %{occupancyRate} DOLU
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Hedef: {capacity.toLocaleString()} kg / Mevcut: {totalWeight.toLocaleString()} kg</span>
                  <button 
                    onClick={() => setShowPoolDetails(true)}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Detayları Gör
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Havuz Bekleyen Mikro-Talepler</h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <p className="animate-pulse">Talepler yükleniyor...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p>Şu an havuzda bekleyen mikro-talep bulunmuyor.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingRequests.map((talep, idx) => (
                  <motion.div 
                    key={talep.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Box className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{talep.referenceNumber}</span>
                          <StatusBadge status={mapStatus(talep.status)} />
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-1">{talep.exporter.fullName} • {talep.title} ({talep.weight} kg)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{talep._count.quotes} Teklif</p>
                        <p className="text-xs font-bold text-slate-800">{new Date(talep.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <Link 
                        href={`/lojistik/${talep.id}`}
                        className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
                      >
                        İncele & Teklif Ver
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Insights & AI Recommendations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6">
            <h3 className="font-bold text-sky-900 flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4" />
              Akıllı Konsolidasyon Önerisi
            </h3>
            <p className="text-xs text-sky-800 leading-relaxed">
              Havuzda bekleyen <strong>{pendingRequests.length}</strong> mikro-ihracat talebini otomatik olarak mevcut konteyner havuzuna dahil edebilirsiniz.
            </p>
            <button 
              onClick={handleAutoConsolidate}
              disabled={isConsolidating || pendingRequests.length === 0}
              className="w-full mt-4 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-200 hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConsolidating ? "Havuza Ekleniyor..." : "Havuza Otomatik Ekle"}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 mb-4">Rota Bazlı Yoğunluk</h3>
            <div className="space-y-4">
              {[
                { rota: "Londra, GB", count: 12, pct: 45 },
                { rota: "Paris, FR", count: 8, pct: 30 },
                { rota: "Dubai, AE", count: 15, pct: 65 },
              ].map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{r.rota}</span>
                    <span className="text-slate-400">{r.count} Talep</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${r.pct}%` }}
                      className="h-full bg-slate-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pool Details Modal */}
      <AnimatePresence>
        {showPoolDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPoolDetails(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Ship className="w-6 h-6 text-sky-600" />
                  Berlin-LCL-24 Havuz İçeriği
                </h3>
                <button 
                  onClick={() => setShowPoolDetails(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                {poolRequests.length === 0 ? (
                  <p className="text-center text-slate-400 py-12 italic">Havuzda henüz yük bulunmuyor.</p>
                ) : (
                  poolRequests.map((talep, idx) => (
                    <div key={talep.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Box className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{talep.referenceNumber}</p>
                          <p className="text-xs text-slate-500">{talep.exporter.fullName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-sky-600">{talep.weight} kg</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Hacim Katkısı: %{Math.round((talep.weight / capacity) * 100)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 bg-sky-600 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-sky-100 uppercase opacity-75">Toplam Doluluk</p>
                  <p className="text-2xl font-black">%{occupancyRate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-sky-100 uppercase opacity-75">Kalan Kapasite</p>
                  <p className="text-xl font-bold">{(capacity - totalWeight).toLocaleString()} kg</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
