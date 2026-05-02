'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Search, Filter, Globe, Ship, ArrowRight, Scale, Truck } from "lucide-react";
import Link from "next/link";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { useEffect, useState } from 'react';
import { getIccRequests, approveDocuments } from './actions';
import { TradeStatus } from '@prisma/client';

const mapStatus = (status: TradeStatus): OperationStatus => {
  switch (status) {
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    case 'DOCUMENTS_PENDING': return 'Belge Bekliyor';
    case 'DOCUMENTS_APPROVED': return 'Yola Çıktı';
    default: return 'Beklemede';
  }
};

export default function ICCExpertPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    const data = await getIccRequests();
    setTalepler(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setIsApproving(id);
    const result = await approveDocuments(id);
    if (result.success) {
      await loadData();
    }
    setIsApproving(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-md">
              <Scale className="w-6 h-6 text-indigo-300" />
            </div>
            <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Yasal Uyumluluk Merkezi</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">ICC Uzmanı Denetim Paneli</h1>
          <p className="text-indigo-200/70 mt-3 text-lg leading-relaxed">Konsolide edilen yüklerin gümrük yasalarına uygunluğunu denetleyin ve dijital mühür onayını verin.</p>
          
          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-white">{talepler.filter(t => t.status === 'LOGISTICS_APPROVED').length}</div>
              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider leading-none">Denetim<br/>Bekleyen</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-emerald-400">{talepler.filter(t => t.status === 'DOCUMENTS_APPROVED').length}</div>
              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider leading-none">Onaylanan<br/>Sevkiyat</div>
            </div>
          </div>
        </div>
        
        <motion.div 
          animate={{ 
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-40px] top-[-20px] opacity-10 pointer-events-none"
        >
          <ShieldCheck size={400} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Aktif Denetim Havuzu
            </h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Referans veya Firma Ara..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none w-64 transition-all" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-20 text-center text-slate-400 animate-pulse font-medium">Yükleme yapılıyor...</div>
            ) : talepler.length === 0 ? (
              <div className="p-20 text-center text-slate-400 italic">Şu an denetim bekleyen yük bulunmuyor.</div>
            ) : (
              talepler.map((talep, idx) => (
                <motion.div 
                  key={talep.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:bg-slate-50/30 transition-colors"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Ship className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-900 tracking-tight">{talep.referenceNumber}</span>
                        <StatusBadge status={mapStatus(talep.status)} />
                      </div>
                      <div className="flex flex-wrap gap-y-2 gap-x-6 mt-2">
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> {talep.exporter.fullName}
                        </div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" /> {talep.quotes[0]?.logistics.fullName || 'Belirlenmedi'}
                        </div>
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {talep.weight} kg Mikro-İhracat
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gümrük Rejimi</p>
                      <p className="text-xs font-bold text-slate-900">ETGB / Mikro-İhracat</p>
                    </div>

                    <div className="relative">
                      {talep.status === 'DOCUMENTS_APPROVED' ? (
                        <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-sm uppercase tracking-tighter border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" /> Mühürlendi & Onaylandı
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleApprove(talep.id)}
                          disabled={!!isApproving}
                          className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                        >
                          {isApproving === talep.id ? "Onaylanıyor..." : "Gümrük Onayı Ver"}
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Digital Stamp Animation */}
                      <AnimatePresence>
                        {talep.status === 'DOCUMENTS_APPROVED' && (
                          <motion.div 
                            initial={{ scale: 3, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: -12 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          >
                            <div className="border-8 border-emerald-500/30 text-emerald-600 font-black text-4xl px-8 py-3 rounded-2xl backdrop-blur-sm bg-white/5 uppercase tracking-tighter shadow-2xl">
                              ICC ONAYLI
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Legal Guidelines Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-lg">Gümrük Denetim Rehberi</h4>
            <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
              Mikro-ihracat (ETGB) kapsamında gönderilen yüklerin fatura ve içerik uyumunu kontrol edin. 
              Onay verdiğinizde yükler dijital mühürle imzalanır ve fiziksel olarak yola çıkış izni verilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
