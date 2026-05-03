"use client";

import { Truck, PackageCheck, Loader2, MapPin, Search } from "lucide-react";
import { AnimatedPageWrapper, EmptyState } from "@/components/operasyon/AnimatedWrappers";
import { useEffect, useState } from "react";
import { getActiveShipments, markAsDelivered } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function LojistikYoldakiPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    const data = await getActiveShipments();
    // Sadece yolda olanları filtrele
    setShipments(data.filter((s: any) => s.status === 'IN_TRANSIT'));
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    if (!confirm('Bu ürünün teslim edildiğini onaylıyor musunuz? Bu işlem geri alınamaz.')) return;
    
    setProcessingId(id);
    try {
      await markAsDelivered(id);
      alert("Teslimat başarıyla onaylandı!");
      await loadData();
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AnimatedPageWrapper>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Truck className="h-8 w-8 text-amber-400" />
              Yoldaki Ürünler ve Sevkiyatlar
            </h1>
            <p className="mt-2 text-slate-400 max-w-xl">
              Sigorta poliçesi kesilmiş ve varış noktasına doğru hareket halindeki tüm ürünleri buradan takip edebilir ve teslimat onayını verebilirsiniz.
            </p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
            <MapPin size={200} />
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          </div>
        ) : shipments.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <EmptyState
              icon={Search}
              title="Aktif Sevkiyat Yok"
              description="Şu an yolda olan herhangi bir ürün bulunmuyor."
            />
          </section>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {shipments.map((shipment, idx) => (
                <motion.div
                  key={shipment.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                        <Truck className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{shipment.title}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{shipment.referenceNumber}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest">Yolda</span>
                  </div>

                  <div className="space-y-4">
                    <div className="relative flex items-center h-10">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "94%" }}
                          animate={{ width: "99%" }}
                          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                          className="h-full bg-amber-500"
                        />
                      </div>
                      <motion.div
                        initial={{ left: "94%" }}
                        animate={{ left: "99%" }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="absolute transform -translate-x-1/2 flex items-center justify-center"
                      >
                        <div className="w-8 h-8 bg-white rounded-full border-2 border-amber-500 shadow-md flex items-center justify-center overflow-hidden">
                          <Truck className="w-4 h-4 text-amber-600 fill-amber-50" />
                        </div>
                      </motion.div>
                    </div>
                    
                    <button
                      onClick={() => handleComplete(shipment.id)}
                      disabled={processingId === shipment.id}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingId === shipment.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <PackageCheck className="w-5 h-5" />
                          Teslimat Onayı Ver
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AnimatedPageWrapper>
  );
}
