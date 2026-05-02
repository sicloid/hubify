'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Search, Truck, CheckCircle2, ArrowRight, MapPin, Weight, Clock, User as UserIcon, ShoppingBag, Eye } from "lucide-react";
import { useEffect, useState } from 'react';
import { getAvailableProducts, getMyOrders, placeOrder } from './actions';
import { TradeStatus } from '@prisma/client';
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";

const mapStatus = (status: TradeStatus): OperationStatus => {
  switch (status) {
    case 'ORDERED': return 'Beklemede';
    case 'QUOTING': return 'Teklif Alındı';
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    case 'DOCUMENTS_PENDING': return 'Beklemede';
    case 'DOCUMENTS_APPROVED': return 'Lojistik Onaylandı';
    case 'IN_TRANSIT': return 'Lojistik Onaylandı';
    case 'COMPLETED': return 'Lojistik Onaylandı';
    default: return 'Beklemede';
  }
};

export default function PazaryeriPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'orders'>('market');
  const [orderingId, setOrderingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    const [productsData, ordersData] = await Promise.all([
      getAvailableProducts(),
      getMyOrders()
    ]);
    setProducts(productsData);
    setMyOrders(ordersData);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOrder = async (tradeRequestId: string) => {
    setOrderingId(tradeRequestId);
    const result = await placeOrder(tradeRequestId);
    if (result.success) {
      await loadData();
    }
    setOrderingId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Küresel Pazaryeri</h1>
          <p className="text-sky-100 mt-2 text-lg max-w-xl">
            Türkiye'nin en kaliteli ihraç ürünlerini keşfedin. Tek tıkla sipariş verin, 
            lojistik ve gümrük süreçlerini biz halledelim.
          </p>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl flex items-center gap-3">
              <Package className="w-5 h-5 text-sky-200" />
              <div className="text-xs">
                <p className="text-sky-200">Mevcut Ürünler</p>
                <p className="font-bold text-base">{products.length}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
              <div className="text-xs">
                <p className="text-sky-200">Siparişlerim</p>
                <p className="font-bold text-base">{myOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
        <motion.div 
          animate={{ rotate: [0, 5, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-30px] top-[-20px] opacity-10 pointer-events-none"
        >
          <ShoppingCart size={300} />
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('market')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'market'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ürünler ({products.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Siparişlerim ({myOrders.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'market' ? (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 animate-pulse">Ürünler yükleniyor...</div>
            ) : products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 rounded-3xl p-16 text-center"
              >
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Şu an pazaryerinde ürün bulunmuyor</h3>
                <p className="text-sm text-slate-500 mt-2">İhracatçılar yeni ürünler listelediğinde burada görünecek.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                  >
                    {/* Product Image Placeholder */}
                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
                      <Package className="w-16 h-16 text-slate-200" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200">
                        <span className="text-xs font-bold text-slate-600">{product.weight} kg</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.referenceNumber}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{product.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{product.description || "Mikro-ihracat konsolidasyona uygun ürün"}</p>
                      
                      <div className="flex items-center gap-2 mb-5 text-xs text-slate-500">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="font-medium">{product.exporter.fullName}</span>
                      </div>

                      <button
                        onClick={() => handleOrder(product.id)}
                        disabled={orderingId === product.id}
                        className="w-full py-3 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-200 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {orderingId === product.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Sipariş Ver
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {myOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Henüz siparişiniz bulunmuyor</h3>
                <p className="text-sm text-slate-500 mt-2">Pazaryerinden ürün sipariş ettiğinizde burada takip edebileceksiniz.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Sipariş Takibi</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {myOrders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <Truck className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{order.referenceNumber}</span>
                            <StatusBadge status={mapStatus(order.status)} />
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                            <span>{order.title}</span>
                            <span>•</span>
                            <span>{order.weight} kg</span>
                            <span>•</span>
                            <span>{order.exporter.fullName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">{order.status.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(order.updatedAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
