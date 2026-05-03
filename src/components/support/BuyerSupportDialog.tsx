"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LifeBuoy, Send, X } from "lucide-react";
import { useState } from "react";
import { submitBuyerSupportTicket } from "@/lib/support-actions";

export type BuyerSupportOrderContext = {
  referenceNumber: string;
  tradeRequestId: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Sipariş detayından açıldıysa referans ve kontrol için ID */
  orderContext?: BuyerSupportOrderContext;
};

export default function BuyerSupportDialog({
  open,
  onClose,
  orderContext,
}: Props) {
  const [message, setMessage] = useState("");
  const [ui, setUi] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const handleClose = () => {
    if (ui === "sending") return;
    setMessage("");
    setUi("idle");
    setErr(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setUi("sending");
    const result = await submitBuyerSupportTicket(message, orderContext);
    if (result.success) {
      setUi("success");
      setMessage("");
      setTimeout(() => {
        handleClose();
        setUi("idle");
      }, 2200);
    } else {
      setUi("error");
      setErr(result.error ?? "Gönderilemedi.");
      setTimeout(() => setUi("idle"), 3200);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => ui !== "sending" && handleClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="buyer-support-dialog-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-900/20 border border-slate-100"
          >
            {ui === "success" ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 id="buyer-support-dialog-title" className="text-xl font-black text-slate-900">
                  Mesajınız iletildi
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  Yönetici panelindeki &quot;Destek ve Hata Bildirileri&quot; sayfasına düştü; en kısa sürede size dönüş
                  yapılacaktır.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 id="buyer-support-dialog-title" className="text-lg font-black text-slate-900 tracking-tight">
                        Yöneticiye mesaj
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {orderContext ? (
                          <>
                            Sipariş{" "}
                            <span className="font-bold text-slate-700">{orderContext.referenceNumber}</span> ile ilgili
                            yazdığınız metin admin destek kuyruğuna kaydedilir.
                          </>
                        ) : (
                          <>
                            Sorununuzu yazın; kayıt admin &quot;Destek ve Hata Bildirileri&quot; sayfasında görünür.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={ui === "sending"}
                    onClick={handleClose}
                    className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {err && ui === "error" && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{err}</p>
                  )}
                  <div>
                    <label htmlFor="buyer-support-dialog-msg" className="block text-sm font-bold text-slate-700 mb-2">
                      Mesajınız
                    </label>
                    <textarea
                      id="buyer-support-dialog-msg"
                      required
                      minLength={10}
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Örn: Sipariş teslimiyle ilgili sorun yaşıyorum..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-rose-500/15 focus:border-rose-400 outline-none transition-all resize-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">En az 10 karakter.</p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={ui === "sending"}
                      onClick={handleClose}
                      className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={ui === "sending"}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200/50 disabled:opacity-60 transition-colors"
                    >
                      {ui === "sending" ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Gönder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
