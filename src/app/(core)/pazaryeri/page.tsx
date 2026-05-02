'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, MapPin, User, CreditCard, Shield, CheckCircle2, Clock, DollarSign, X } from 'lucide-react';
import { getAvailableProducts, placeOrder, confirmPayment, getMyOrders } from './actions';

const currencySymbol: Record<string, string> = {
  USD: '$', EUR: '€', TRY: '₺', GBP: '£',
};

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  AWAITING_PAYMENT: { label: 'Ödeme Bekleniyor', color: 'bg-amber-100 text-amber-700' },
  ESCROW_HELD: { label: 'ICC Güvencesinde', color: 'bg-blue-100 text-blue-700' },
  RELEASED_TO_SELLER: { label: 'Satıcıya Aktarıldı', color: 'bg-emerald-100 text-emerald-700' },
  REFUNDED: { label: 'İade Edildi', color: 'bg-red-100 text-red-700' },
};

// serializeDecimal tüm Decimal alanlarını number'a çevirir; tip güvenliği için any kullanıyoruz
type Product = Awaited<ReturnType<typeof getAvailableProducts>>[0] & Record<string, any>;
type Order = Awaited<ReturnType<typeof getMyOrders>>[0] & Record<string, any>;

export default function PazaryeriPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAvailableProducts(), getMyOrders()]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
      setIsLoading(false);
    });
  }, []);

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
  };

  const confirmOrder = () => {
    if (!selectedProduct) return;
    startTransition(async () => {
      const result = await placeOrder(selectedProduct.id);
      if (result.success) {
        const [p, o] = await Promise.all([getAvailableProducts(), getMyOrders()]);
        setProducts(p);
        setOrders(o);
        setSelectedProduct(null);
        setActiveTab('orders');
      }
    });
  };

  const handlePayment = (orderId: string) => {
    startTransition(async () => {
      setPayingOrderId(orderId);
      const result = await confirmPayment(orderId);
      if (result.success) {
        const o = await getMyOrders();
        setOrders(o);
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
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-brand-primary via-slate-800 to-slate-900 rounded-3xl p-8 text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Küresel Pazaryeri</h1>
          <p className="text-slate-300 mt-2 max-w-xl">
            Türkiye'nin en kaliteli ihraç ürünlerini keşfedin. Tek tıkla sipariş verin, 
            ödemeniz ICC güvencesinde (escrow) tutulur.
          </p>
          <div className="flex gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
              <Package className="w-4 h-4" /> Mevcut Ürünler <span className="font-bold">{products.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Siparişlerim <span className="font-bold">{orders.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> ICC Escrow Koruması
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" /> Ürünler ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Siparişlerim ({orders.length})
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' ? (
          <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-secondary rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold">Şu an mevcut ürün yok</p>
                <p className="text-sm">İhracatçılar yeni ürün listelediğinde burada görünecek.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                  >
                    {/* Product header with price */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 relative">
                      <Package className="w-16 h-16 text-slate-300 mx-auto group-hover:scale-110 transition-transform" />
                      <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
                        {p.weight} kg
                      </div>
                      {p.destinationCity && (
                        <div className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1 text-xs font-medium text-slate-500 shadow-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {p.destinationCity}
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <p className="text-xs text-brand-secondary font-mono">{p.referenceNumber}</p>
                      <h3 className="font-bold text-lg text-slate-900">{p.title}</h3>
                      {p.description && <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>}
                      
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <User className="w-3 h-3" /> {p.exporter.fullName}
                      </div>

                      {/* Price display */}
                      <div className="pt-3 border-t border-slate-100">
                        {p.totalPrice !== null ? (
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs text-slate-400">Toplam Fiyat</p>
                              <p className="text-2xl font-bold text-slate-900">
                                {formatPrice(p.totalPrice, p.currency)}
                              </p>
                            </div>
                            <p className="text-xs text-slate-400">
                              {formatPrice(p.unitPrice, p.currency)}/kg
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">Fiyat belirtilmemiş</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleOrder(p)}
                        disabled={isPending}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-secondary text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Satın Al{p.totalPrice !== null ? ` — ${formatPrice(p.totalPrice, p.currency)}` : ''}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold">Henüz siparişiniz yok</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o, i) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-slate-100 rounded-xl p-3">
                        <Package className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{o.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{o.referenceNumber}</span>
                          <span>{o.weight} kg</span>
                          <span>{o.exporter.fullName}</span>
                          {o.destinationCity && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.destinationCity}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-slate-900">
                        {formatPrice(o.totalPrice, o.currency)}
                      </p>
                      {o.unitPrice !== null && (
                        <p className="text-xs text-slate-400">{formatPrice(o.unitPrice, o.currency)}/kg</p>
                      )}
                    </div>

                    {/* Payment Status + Action */}
                    <div className="flex items-center gap-3">
                      {o.paymentStatus && paymentStatusLabels[o.paymentStatus] ? (
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${paymentStatusLabels[o.paymentStatus].color}`}>
                          {paymentStatusLabels[o.paymentStatus].label}
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500">
                          {o.status}
                        </span>
                      )}

                      {o.paymentStatus === 'AWAITING_PAYMENT' && (
                        <button
                          onClick={() => handlePayment(o.id)}
                          disabled={payingOrderId === o.id}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                          {payingOrderId === o.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CreditCard className="w-3 h-3" />
                          )}
                          Ödeme Yap
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-slate-900">Sipariş Onayı</h3>
                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <p className="font-bold text-slate-900">{selectedProduct.title}</p>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Satıcı</span>
                  <span>{selectedProduct.exporter.fullName}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Ağırlık</span>
                  <span>{selectedProduct.weight} kg</span>
                </div>
                {selectedProduct.unitPrice !== null && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Birim Fiyat</span>
                    <span>{formatPrice(selectedProduct.unitPrice, selectedProduct.currency)}/kg</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Toplam Tutar</span>
                  <span className="text-2xl font-bold text-brand-secondary">
                    {formatPrice(selectedProduct.totalPrice, selectedProduct.currency)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900">ICC Escrow Güvencesi</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Ödemeniz ICC uzmanı tarafından kontrol edilen güvenli bir hesapta tutulur. 
                    Ürün teslim edilip onaylandıktan sonra satıcıya aktarılır.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={isPending}
                  className="flex-1 py-3 bg-brand-secondary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Siparişi Onayla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
