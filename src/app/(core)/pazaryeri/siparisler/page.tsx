"use client";

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, MapPin, User, CreditCard, Shield, CheckCircle2, Clock, Truck, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { getMyOrders, confirmPayment } from '../actions';
import { AnimatedPageWrapper } from '@/components/operasyon/AnimatedWrappers';

const currencySymbol: Record<string, string> = {
  USD: '$', EUR: '€', TRY: '₺', GBP: '£',
};

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  AWAITING_PAYMENT: { label: 'Ödeme Bekleniyor', color: 'bg-amber-100 text-amber-700' },
  ESCROW_HELD: { label: 'ICC Güvencesinde', color: 'bg-blue-100 text-blue-700' },
  RELEASED_TO_SELLER: { label: 'Satıcıya Aktarıldı', color: 'bg-emerald-100 text-emerald-700' },
  REFUNDED: { label: 'İade Edildi', color: 'bg-red-100 text-red-700' },
};

export default function SiparislerimPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    const o = await getMyOrders();
    setOrders(o);
    setIsLoading(false);
  };

  const handlePayment = (orderId: string) => {
    startTransition(async () => {
      setPayingOrderId(orderId);
      const result = await confirmPayment(orderId);
      if (result.success) {
        await loadOrders();
      }
      setPayingOrderId(null);
    });
  };

  const formatPrice = (price: any, currency: string) => {
    if (price === null || price === undefined) return 'Fiyat belirtilmemiş';
    const num = Number(price);
    const sym = currencySymbol[currency] || currency;
    return `${sym}${num.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <AnimatedPageWrapper>
      <div className="space-y-8 pb-12">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-900 p-10 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/10" />
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-black tracking-tighter">Siparişlerim</h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
              Satın aldığınız tüm ürünleri, ödeme durumlarını ve operasyonel süreçleri buradan yönetin.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-slate-300" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Siparişleriniz Hazırlanıyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200">
            <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-slate-100" />
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest">Henüz bir siparişiniz bulunmuyor</h3>
            <p className="text-slate-400 mt-2 font-medium">Satın aldığınız ürünler burada listelenecektir.</p>
            <Link href="/pazaryeri" className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all active:scale-95">
               Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {orders.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
                >
                  <div className="flex items-center gap-8 flex-1">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner border border-slate-100">
                      {o.productImage ? (
                        <img src={o.productImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <Package className="w-10 h-10 text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <p className="font-black text-slate-900 text-2xl tracking-tighter">{o.title}</p>
                        {o.paymentStatus === 'ESCROW_HELD' && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <Shield className="w-3.5 h-3.5" /> ICC Güvencesinde
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <span className="text-brand-secondary">REF: {o.referenceNumber}</span>
                        <span className="flex items-center gap-2"><User className="w-4 h-4" /> {o.exporter.fullName}</span>
                        <span className="flex items-center gap-2"><Package className="w-4 h-4" /> {o.weight} kg</span>
                        {o.destinationCity && (
                          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-500" />{o.destinationCity}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                    <div className="flex items-baseline gap-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Toplam Tutar</p>
                      <p className="text-4xl font-black text-slate-900">
                        {formatPrice(o.totalPrice, o.currency)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {o.paymentStatus && paymentStatusLabels[o.paymentStatus] ? (
                        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 ${paymentStatusLabels[o.paymentStatus].color} border border-current opacity-80`}>
                          {o.paymentStatus === 'ESCROW_HELD' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          {paymentStatusLabels[o.paymentStatus].label}
                        </div>
                      ) : (
                        <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                          {o.status}
                        </span>
                      )}

                      {o.paymentStatus === 'AWAITING_PAYMENT' ? (
                        <button
                          onClick={() => handlePayment(o.id)}
                          disabled={payingOrderId === o.id}
                          className="flex items-center gap-2.5 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-100 disabled:opacity-50"
                        >
                          {payingOrderId === o.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                          Ödeme Yap ve Başlat
                        </button>
                      ) : (
                        <Link
                          href="/pazaryeri/kargo"
                          className="flex items-center gap-2.5 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
                        >
                          <Truck className="w-4 h-4 text-sky-400" />
                          Siparişi Takip Et
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-sm">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-blue-900 uppercase tracking-widest mb-2">Güvenli Escrow Altyapısı</h4>
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              Sipariş verdiğiniz andan itibaren ödemeniz Hubify'ın güvenli escrow hesabında bloke edilir. Ürün Lojistik uzmanı tarafından teslim edilene kadar satıcıya aktarılmaz. Tüm belgeler ve gümrük onayları ICC uzmanlarımız tarafından denetlenmektedir.
            </p>
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
