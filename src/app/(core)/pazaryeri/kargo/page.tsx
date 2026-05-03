"use client";

import { TradeStatus, UserRole } from "@prisma/client";
import { 
  Package, Truck, ShieldCheck, Landmark, 
  CheckCircle2, Clock, MapPin, ChevronRight,
  Box, Search, ShoppingBag, AlertCircle, User, Shield, Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedPageWrapper } from "@/components/operasyon/AnimatedWrappers";

// Bu sayfa client component olarak tasarlandı çünkü verileri dinamik çekip animasyonlarla gösterecek
export default function SiparisTakipPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pazaryeri/aktif-siparisler');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Siparişler çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusStep = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.ORDERED: return 1;
      case TradeStatus.QUOTING: return 2;
      case TradeStatus.LOGISTICS_APPROVED: return 3;
      case "DOCUMENTS_PENDING" as any: return 4;
      case TradeStatus.DOCUMENTS_APPROVED: return 5;
      case TradeStatus.IN_TRANSIT: return 6;
      case TradeStatus.COMPLETED: return 7;
      default: return 1;
    }
  };

  const steps = [
    { label: "Sipariş", icon: ShoppingBag, color: "sky" },
    { label: "Lojistik", icon: Box, color: "blue" },
    { label: "Denetim", icon: ShieldCheck, color: "indigo" },
    { label: "Finans", icon: Landmark, color: "violet" },
    { label: "Sigorta", icon: Shield, color: "purple" },
    { label: "Yolda", icon: Truck, color: "amber" },
    { label: "Teslim", icon: CheckCircle2, color: "emerald" },
  ];

  return (
    <AnimatedPageWrapper>
      <div className="space-y-8 pb-20">
        <section className="relative overflow-hidden rounded-[3rem] border border-slate-200 bg-slate-900 p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-emerald-500/10" />
          <div className="relative z-10 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-sky-200"
            >
              <Truck className="h-4 w-4" />
              Sipariş & Kargo Takip Merkezi
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter md:text-6xl"
            >
              Akıllı Takip <span className="text-sky-400">Sistemi</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl text-lg text-slate-400 font-medium leading-relaxed"
            >
              Siparişlerinizin global yolculuğunu Hubify güvencesiyle, saniye saniye ve şeffaf bir şekilde izleyin.
            </motion.p>
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Siparişler Getiriliyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-24 border-2 border-dashed border-slate-200 rounded-[4rem] text-center bg-white"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Henüz Siparişiniz Bulunmuyor</h3>
            <p className="text-slate-400 mt-4 text-lg font-medium max-w-md mx-auto">Pazaryeri üzerinden bir ürün satın aldığınızda kargo takip süreci burada başlayacaktır.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            <AnimatePresence>
              {orders.map((order, orderIdx) => {
                const currentStep = getStatusStep(order.status);
                return (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: orderIdx * 0.1 }}
                    className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">#{order.referenceNumber || order.id.substring(0,8)}</span>
                          <span className="px-4 py-1.5 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{order.title}</h2>
                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-tight">
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl"><User className="w-4 h-4 text-slate-400" /> {order.exporter?.fullName || 'İhracatçı'}</span>
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl"><MapPin className="w-4 h-4 text-sky-500" /> {order.destinationCity || 'Küresel'}</span>
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl"><Clock className="w-4 h-4 text-slate-400" /> {new Date(order.updatedAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                          <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Yatırım</p>
                              <p className="text-4xl font-black text-slate-900">${Number(order.totalPrice || 0).toLocaleString()}</p>
                          </div>
                          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-all shadow-xl shadow-slate-200">
                              <ChevronRight className="w-8 h-8" />
                          </div>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="relative pt-16 pb-8 px-4">
                      {/* Base Line */}
                      <div className="absolute top-[calc(4rem+24px)] left-8 right-8 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500" 
                          />
                      </div>

                      {/* Step Bubbles */}
                      <div className="relative flex justify-between">
                        {steps.map((step, idx) => {
                          const stepNum = idx + 1;
                          const isCompleted = stepNum < currentStep;
                          const isActive = stepNum === currentStep;
                          const Icon = step.icon;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-4 relative z-10 group/step">
                              <motion.div 
                                whileHover={{ scale: 1.1 }}
                                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-4 transition-all duration-500 ${
                                  isCompleted ? 'bg-emerald-500 border-white text-white shadow-xl shadow-emerald-100' :
                                  isActive ? 'bg-white border-sky-500 text-sky-600 scale-125 shadow-2xl shadow-sky-100' :
                                  'bg-white border-slate-50 text-slate-200 shadow-sm'
                                }`}
                              >
                                <Icon className={`w-7 h-7 ${isActive ? 'animate-pulse' : ''}`} />
                                {isCompleted && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-md border border-emerald-50"
                                  >
                                    <CheckCircle2 className="w-4 h-4 fill-emerald-50" />
                                  </motion.div>
                                )}
                              </motion.div>
                              <div className="text-center space-y-1">
                                <span className={`block text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                  isCompleted ? 'text-emerald-600' :
                                  isActive ? 'text-sky-600' :
                                  'text-slate-400'
                                }`}>
                                  {step.label}
                                </span>
                                {isActive && (
                                  <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="block text-[8px] font-bold text-sky-400 animate-pulse"
                                  >
                                    ŞU AN BURADA
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-sm"
        >
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-amber-900 uppercase tracking-widest mb-2">Hubify Güvence Sistemi</h4>
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              Tüm siparişleriniz teslim edilene kadar Hubify Escrow hesabında güvence altındadır. Ürün elinize ulaşıp Lojistik uzmanı tarafından teslimat onayı verilmeden ödeme satıcıya aktarılmaz. <span className="font-black underline">Güvenli Ticaret, Hubify ile başlar.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedPageWrapper>
  );
}
