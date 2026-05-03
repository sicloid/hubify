'use client';

import { motion } from 'framer-motion';
import { Package, Clock, Truck, Plus, ArrowRight, Search, MapPin, Ship, Layers, TrendingDown } from "lucide-react";
import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/operasyon/BentoGrid";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { useEffect, useState } from 'react';
import { getTradeRequests } from './actions';
import { getPoolStats } from '../lojistik/actions';
import { GlobalTradeRadar } from "@/components/operasyon/GlobalTradeRadar";

// Map Prisma status to OperationStatus (istemcide @prisma/client import edilmez)
const mapStatus = (status: string): OperationStatus => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'ORDERED': return 'Sipariş Verildi';
    case 'QUOTING': return 'Teklif Alındı';
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    default: return 'Beklemede';
  }
};

export default function IhracatciPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [poolStats, setPoolStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [taleplerData, statsData] = await Promise.all([
        getTradeRequests(),
        getPoolStats()
      ]);
      setTalepler(taleplerData);
      setPoolStats(statsData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const stats = [
    { title: "Aktif İlanlar", value: talepler.length, icon: <Package className="w-4 h-4" />, color: "text-sky-600" },
    { title: "Alıcı Bekliyor", value: talepler.filter(t => t.status === 'PENDING').length, icon: <Clock className="w-4 h-4" />, color: "text-amber-600" },
    { title: "Sipariş Alındı", value: talepler.filter(t => ['ORDERED', 'QUOTING', 'LOGISTICS_APPROVED'].includes(t.status)).length, icon: <Truck className="w-4 h-4" />, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">İhracatçı Paneli</h1>
          <p className="text-slate-500 mt-1">Ürün ilanlarınızı yönetin ve sipariş durumlarını takip edin.</p>
        </div>
        <Link 
          href="/ihracatci/yeni"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün İlanı Oluştur
        </Link>
      </div>

      {/* Global Trade Radar Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <GlobalTradeRadar 
          role="EXPORTER" 
          activeOrders={talepler.filter(t => ['ORDERED', 'QUOTING', 'LOGISTICS_APPROVED', 'DOCUMENTS_PENDING', 'DOCUMENTS_APPROVED', 'IN_TRANSIT'].includes(t.status))} 
        />
      </motion.div>

      {/* Real-time Container Sync Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <BentoGrid>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <BentoCard className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                </BentoCard>
              </motion.div>
            ))}
          </BentoGrid>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Taleplerim</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Talep ara..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/10 outline-none w-64 transition-all" />
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 animate-pulse">Yükleniyor...</div>
            ) : talepler.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">Henüz bir talebiniz bulunmuyor.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {talepler.map((talep, idx) => (
                  <motion.div 
                    key={talep.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-sky-50 transition-colors overflow-hidden">
                        {talep.productImage ? (
                          <img src={talep.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400 group-hover:text-sky-600 transition-colors" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{talep.referenceNumber}</span>
                          <StatusBadge status={mapStatus(talep.status)} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {talep.title}</span>
                          <span>•</span>
                          <span>{talep.weight} kg</span>
                          <span>•</span>
                          <span>{talep._count.quotes} Teklif</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/ihracatci/${talep.id}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Synchronized Container View */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-sky-500/20 rounded-3xl p-6 shadow-sm sticky top-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Ship className="w-5 h-5 text-sky-600" />
                  Berlin Havuzu
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lojistikçiyle Eş Zamanlı</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-sky-600">%{poolStats?.occupancyRate || 0}</p>
                <p className="text-[10px] font-bold text-slate-400">DOLULUK</p>
              </div>
            </div>

            {/* Shared Physical Container Visualization */}
            <div className="h-48 bg-slate-50 rounded-2xl relative border-2 border-dashed border-slate-200 overflow-hidden flex items-end">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${poolStats?.occupancyRate || 0}%` }}
                transition={{ duration: 1.5, type: "spring", damping: 12 }}
                className="w-full bg-sky-500/30 backdrop-blur-sm relative"
              >
                <div className="absolute top-2 left-2 right-2 grid grid-cols-4 gap-1">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="h-3 bg-white/40 rounded-sm" 
                    />
                  ))}
                </div>
              </motion.div>
              
              {/* Centered Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <span className="text-xs font-black text-slate-900 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50 shadow-sm uppercase tracking-tighter">
                  %{poolStats?.occupancyRate || 0} DOLULUK
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Konsolide Yük
                </span>
                <span className="font-bold text-slate-900">{poolStats?.totalWeight.toLocaleString()} kg</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${poolStats?.occupancyRate || 0}%` }}
                  className="h-full bg-sky-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic leading-tight">
                Bu havuz, lojistikçinin ekranıyla tam senkronize çalışmaktadır. Yükleriniz kabul edildiğinde doluluk oranı anlık artar.
              </p>
            </div>

            <div className="mt-8 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Maliyet Avantajı</span>
              </div>
              <p className="text-[10px] text-emerald-800">
                Mevcut doluluk oranıyla sevkiyat maliyetiniz standart tarifeye göre <strong className="text-emerald-700">%24.5 daha düşük</strong>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
