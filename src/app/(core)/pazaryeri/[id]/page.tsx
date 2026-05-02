'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, use, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, DollarSign, Package, Truck, 
  Ship, Calendar, ShieldCheck, MapPin, Globe, Clock, 
  ChevronRight, Info, CreditCard
} from "lucide-react";
import Link from "next/link";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { getTradeRequestDetail } from '../../ihracatci/actions'; // Mevcut detayı kullanabiliriz
import { TradeStatus } from '@prisma/client';

const mapStatus = (status: TradeStatus): OperationStatus => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'ORDERED': return 'Sipariş Verildi';
    case 'QUOTING': return 'Teklif Alındı';
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    case 'DOCUMENTS_APPROVED': return 'Yolda';
    case 'IN_TRANSIT': return 'Yolda';
    case 'COMPLETED': return 'Tamamlandı';
    default: return 'Beklemede';
  }
};

const trackingSteps = [
  { id: 'siparis', label: 'Sipariş', statuses: [TradeStatus.PENDING, TradeStatus.ORDERED] },
  { id: 'lojistik', label: 'Lojistik Planlama', statuses: [TradeStatus.QUOTING] },
  { id: 'gumruk', label: 'Gümrük & Belge', statuses: [TradeStatus.LOGISTICS_APPROVED, TradeStatus.DOCUMENTS_PENDING] },
  { id: 'odeme', label: 'Ödeme Onayı', statuses: [TradeStatus.DOCUMENTS_APPROVED] },
  { id: 'sevkiyat', label: 'Sevkiyat & Sigorta', statuses: [TradeStatus.IN_TRANSIT] },
  { id: 'teslimat', label: 'Teslim Edildi', statuses: [TradeStatus.COMPLETED] },
];

export default function BuyerOrderDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [talep, setTalep] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getTradeRequestDetail(params.id);
      setTalep(data);
      setIsLoading(false);
    }
    loadData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sipariş Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!talep) {
    return <div className="p-20 text-center text-slate-400">Sipariş bulunamadı.</div>;
  }

  const currentStepIndex = trackingSteps.findIndex(step => (step.statuses as TradeStatus[]).includes(talep.status));
  const details = {
    location: talep.status === 'IN_TRANSIT' ? 'Yolda / Sigorta Korumasında' : (talep.status === 'COMPLETED' ? 'Adresinizde' : 'Hubify İşlem Merkezi'),
    eta: talep.status === 'COMPLETED' ? 'Teslim Edildi' : (talep.status === 'IN_TRANSIT' ? '2-3 Gün' : 'Süreç İlerliyor'),
    desc: talep.status === 'DOCUMENTS_APPROVED' ? 'Ödemeniz Hubify Escrow güvencesine alındı.' : 'Siparişiniz Hubify Pipeline üzerinde güvenle taşınıyor.'
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link 
            href="/taleplerim" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Taleplerime Dön
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{talep.title}</h1>
            <StatusBadge status={mapStatus(talep.status)} />
          </div>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tight">Referans: {talep.referenceNumber}</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Ödeme</p>
          <p className="text-3xl font-black text-slate-900">${Number(talep.totalPrice).toLocaleString()}</p>
        </div>
      </div>

      {/* Product Details Section - Pipeline kaldırıldı */}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Card */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
              <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-sm">
                <Package className="w-5 h-5 text-sky-600" />
                Ürün Detayları
              </h3>
            </div>
            <div className="p-8 space-y-8">
                <div className="flex gap-8">
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
                        {talep.productImage ? (
                            <img src={talep.productImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ürün Tanımı</p>
                            <p className="text-lg font-bold text-slate-800 leading-snug">{talep.description}</p>
                        </div>
                        <div className="flex gap-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Miktar</p>
                                <p className="text-sm font-black text-slate-900">{talep.weight} KG / Lojistik Konsolide</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Birim Fiyat</p>
                                <p className="text-sm font-black text-slate-900">${talep.unitPrice} {talep.currency}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İhracatçı</p>
                        <p className="text-sm font-bold text-slate-900">{talep.exporter?.fullName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Varış Noktası</p>
                        <p className="text-sm font-bold text-slate-900">{talep.destinationCity}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ödeme Metodu</p>
                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                            <CreditCard className="w-4 h-4" /> Escrow Korumalı
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <ShieldCheck className="w-32 h-32" />
            </div>
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
              Hubify Güvencesi
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              Ödemeniz Hubify Escrow hesabında bekletilmektedir. Ürün size ulaşıp yasal gümrük onayları tamamlanana kadar satıcıya aktarılmaz.
            </p>
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>Lojistik Sigortalı</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>Gümrük Denetimli</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>7/24 Destek</span>
                </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600" />
                Yardım Merkezi
            </h4>
            <p className="text-xs text-slate-500 mb-4 font-medium">
                Bu siparişle ilgili bir sorun mu yaşıyorsunuz? Hubify destek ekibi yanınızda.
            </p>
            <button className="w-full py-3 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Destek Talebi Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
