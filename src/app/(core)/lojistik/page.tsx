'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Anchor, Layers, Box, TrendingDown, Users, Ship, ArrowUpRight, X, CheckCircle2, Clock, Truck, PackageCheck } from "lucide-react";
import AnimatedApprovalButton from "@/components/operasyon/AnimatedApprovalButton";
import Link from "next/link";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { useEffect, useState } from 'react';
import { getAvailableRequests, autoConsolidate, getActiveShipments, markAsDelivered } from './actions';
import { GlobalTradeRadar } from "@/components/operasyon/GlobalTradeRadar";

// Map Prisma status to OperationStatus (istemcide @prisma/client yok)
const mapStatus = (status: string): OperationStatus => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'QUOTING': return 'Teklif Alındı';
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    case 'DOCUMENTS_PENDING': return 'Gümrük Denetimi';
    case 'DOCUMENTS_APPROVED': return 'Finans Onaylı';
    case 'IN_TRANSIT': return 'Yolda';
    case 'COMPLETED': return 'Teslim Edildi';
    default: return 'Beklemede';
  }
};

export default function LojistikPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);
  const [activeShipments, setActiveShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pool' | 'quotes' | 'shipments'>('pool');
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  async function loadData() {
    setIsLoading(true);
    const [data, activeData, quotesData] = await Promise.all([
      getAvailableRequests(),
      getActiveShipments(),
      import('./actions').then(m => m.getMyQuotes())
    ]);
    setTalepler(data);
    setActiveShipments(activeData);
    setMyQuotes(quotesData);
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
  const poolRequests = talepler.filter(t => t.status === "QUOTING");
  const totalWeight = poolRequests.reduce((acc, curr) => acc + (curr.weight || 0), 0);
  const capacity = 20000; // 20 tons
  const occupancyRate = Math.min(Math.round((totalWeight / capacity) * 100), 100);

  const lastRequest = [...poolRequests].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  const lastIncrease = lastRequest ? Math.round((lastRequest.weight / capacity) * 100) : 0;

  const pendingRequests = talepler.filter(t => t.status === "ORDERED");

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Header */}
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
        
        <motion.div 
          animate={{ rotate: [0, 5, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-50px] top-[-20px] opacity-10 pointer-events-none"
        >
          <Ship size={400} />
        </motion.div>
      </motion.div>

      {/* Global Trade Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <GlobalTradeRadar role="LOGISTICS" activeOrders={activeShipments} />
      </motion.div>

      {/* Tabs Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pool')}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'pool' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Lojistik Havuzu ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'quotes' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Tekliflerim ({myQuotes.length})
        </button>
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'shipments' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Sevkiyat Takibi ({activeShipments.filter(s => s.status === 'IN_TRANSIT').length})
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 space-y-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'pool' ? (
              <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                {/* Pool Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-sky-500/20 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-slate-900">Berlin-LCL-24</h3>
                        <p className="text-xs text-slate-500">İstanbul → Berlin</p>
                      </div>
                      <StatusBadge status="Beklemede" />
                    </div>
                    <div className="h-40 bg-slate-100 rounded-xl relative border-2 border-dashed border-slate-200 overflow-hidden flex items-end">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${occupancyRate}%` }} className="w-full bg-sky-500/40 relative" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-black text-slate-900 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50 shadow-sm">%{occupancyRate} DOLU</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <span className="text-xs text-slate-500">Kapasite: {capacity.toLocaleString()} kg</span>
                      <button onClick={() => setShowPoolDetails(true)} className="text-xs font-bold text-sky-600 hover:underline">İçeriği Gör</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Sipariş Alınmış Talepler (Teklif Bekliyor)</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingRequests.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 italic">Şu an yeni talep bulunmuyor.</div>
                    ) : (
                      pendingRequests.map((talep, idx) => (
                        <div key={talep.id} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Box className="w-5 h-5 text-slate-400" /></div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{talep.referenceNumber} • {talep.title}</p>
                              <p className="text-xs font-medium text-slate-500">{talep.exporter.fullName} • {talep.weight} kg • {talep.destinationCity}</p>
                            </div>
                          </div>
                          <Link href={`/lojistik/${talep.id}`} className="mt-4 md:mt-0 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-200">Teklif Ver</Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'quotes' ? (
              <motion.div key="quotes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Verdiğim Teklifler</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {myQuotes.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 italic">Henüz bir teklif vermediniz.</div>
                  ) : (
                    myQuotes.map((quote, idx) => (
                      <div key={quote.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quote.isAccepted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {quote.isAccepted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{quote.tradeTitle}</p>
                            <p className="text-xs font-medium text-slate-500">{quote.referenceNumber} • {new Date(quote.createdAt).toLocaleDateString('tr-TR')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">${Number(quote.price).toLocaleString()}</p>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${quote.isAccepted ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {quote.isAccepted ? 'Kabul Edildi' : 'Yanıt Bekleniyor'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="shipments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Aktif Sevkiyatlar ve Teslimatlar</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {activeShipments.filter(s => s.status === 'IN_TRANSIT').length === 0 ? (
                    <div className="p-12 text-center text-slate-400 italic">Şu an yolda olan sevkiyat bulunmuyor.</div>
                  ) : (
                    activeShipments.filter(s => s.status === 'IN_TRANSIT').map((shipment, idx) => (
                      <div key={shipment.id} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{shipment.title}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF: {shipment.referenceNumber}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-3">
                          <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest">Yolda</span>
                          <AnimatedApprovalButton
                            onApprove={async () => {
                              await markAsDelivered(shipment.id);
                              await loadData();
                            }}
                            label="Teslim Edildi"
                            processingLabel="Onaylanıyor..."
                            approvedLabel="Teslim Edildi ✓"
                            icon={PackageCheck}
                            color="emerald"
                            compact
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
