"use client";

import { ClipboardCheck, ShieldCheck, FileText, CheckCircle2, Loader2, ExternalLink, Calendar } from "lucide-react";
import { AnimatedPageWrapper, EmptyState } from "@/components/operasyon/AnimatedWrappers";
import { useEffect, useState } from "react";
import { getCompletedPolicies } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function SigortaTamamlananPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    const data = await getCompletedPolicies();
    setRequests(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AnimatedPageWrapper>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-emerald-900 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <ClipboardCheck className="h-8 w-8 text-emerald-400" />
              Tamamlanan Sigorta Sevkiyatları
            </h1>
            <p className="mt-2 text-emerald-100/70 max-w-xl">
              Poliçesi kesilmiş ve teslimatı başarıyla sonuçlanmış tüm operasyonların arşividir.
            </p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
            <ShieldCheck size={200} />
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : requests.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <EmptyState
              icon={ShieldCheck}
              title="Tamamlanan Kayıt Yok"
              description="Henüz teslimatı onaylanmış bir sevkiyat bulunmuyor."
            />
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {requests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{request.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.updatedAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="text-xs font-medium text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500">{request.referenceNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {request.documents?.[0] && (
                      <a 
                        href={request.documents[0].fileUrl} 
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Poliçeyi Gör
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )}
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      Teslim Edildi
                    </span>
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
