"use client";

import { Truck, PackageCheck, Loader2, MapPin, Search, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/operasyon/AnimatedWrappers";
import { useEffect, useState } from "react";
import { getActiveShipments, markAsDelivered } from "../actions";
import { motion } from "framer-motion";
import AnimatedApprovalButton from "@/components/operasyon/AnimatedApprovalButton";

export default function LojistikYoldakiPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  /** Teslim sunucuda kaydedildi; kısa süre "Onaylandı" gösterilir */
  const [confirmedDeliveryId, setConfirmedDeliveryId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    const data = await getActiveShipments();
    setShipments(data.filter((s: any) => s.status === "IN_TRANSIT"));
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    setProcessingId(id);
    try {
      await markAsDelivered(id);
      setPendingConfirmId(null);
      setConfirmedDeliveryId(id);
      setProcessingId(null);
      window.setTimeout(() => {
        setConfirmedDeliveryId(null);
        void loadData();
      }, 1600);
    } catch (error) {
      console.error("Teslimat onayı:", error);
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Truck className="h-8 w-8 text-amber-400" />
            Yoldaki Ürünler ve Sevkiyatlar
          </h1>
          <p className="mt-2 max-w-xl text-slate-400">
            Sigorta poliçesi kesilmiş ve varış noktasına doğru hareket halindeki tüm ürünleri buradan takip edebilir ve teslimat onayını verebilirsiniz.
          </p>
        </div>
        <div className="pointer-events-none absolute right-[-20px] top-[-20px] rotate-12 opacity-10">
          <MapPin size={200} />
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        </div>
      ) : shipments.length === 0 ? (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Search}
            title="Aktif Sevkiyat Yok"
            description="Şu an yolda olan herhangi bir ürün bulunmuyor."
          />
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                    <Truck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-slate-900">{shipment.title}</h3>
                    <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">
                      {shipment.referenceNumber}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-600">
                  Yolda
                </span>
              </div>

              <div className="space-y-4">
                <div className="relative flex h-10 items-center">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: "94%" }}
                      animate={{ width: "99%" }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                      className="h-full bg-amber-500"
                    />
                  </div>
                  <motion.div
                    initial={{ left: "94%" }}
                    animate={{ left: "99%" }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                    className="absolute flex -translate-x-1/2 transform items-center justify-center"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500 bg-white shadow-md">
                      <Truck className="h-4 w-4 text-amber-600" />
                    </div>
                  </motion.div>
                </div>

                {confirmedDeliveryId === shipment.id ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 py-8 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" aria-hidden />
                    <p className="text-lg font-black tracking-tight text-emerald-800">Onaylandı</p>
                  </div>
                ) : pendingConfirmId === shipment.id ? (
                  <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-inner">
                    <p className="text-center text-sm font-medium leading-relaxed text-slate-800">
                      Bu ürünün teslim edildiğini <strong>onaylıyor musunuz?</strong> Bu işlem geri alınamaz.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setPendingConfirmId(null)}
                        disabled={processingId === shipment.id}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleComplete(shipment.id)}
                        disabled={processingId === shipment.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {processingId === shipment.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <PackageCheck className="h-5 w-5" />
                            Evet, onaylıyorum
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <AnimatedApprovalButton
                    onApprove={() => {
                      setPendingConfirmId(shipment.id);
                    }}
                    disabled={processingId === shipment.id || confirmedDeliveryId !== null}
                    label="Teslimat Onayı Ver"
                    processingLabel="İşleniyor..."
                    approvedLabel="Onaylandı ✓"
                    icon={PackageCheck}
                    color="emerald"
                    fullWidth
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
