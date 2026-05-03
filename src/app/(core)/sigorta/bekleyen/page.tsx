"use client";

import { ClipboardList, Shield, FileText, Upload, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { AnimatedPageWrapper, EmptyState } from "@/components/operasyon/AnimatedWrappers";
import { useEffect, useState } from "react";
import { getPendingPolicies, issuePolicyAndDispatch } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function PoliceBekleyenPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    const data = await getPendingPolicies();
    setRequests(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatch = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setProcessingId(id);

    try {
      const formData = new FormData(e.currentTarget);
      await issuePolicyAndDispatch(id, formData);
      alert("Poliçe oluşturuldu ve ürün yola çıkarıldı!");
      await loadData();
    } catch (error) {
      alert("İşlem sırasında bir hata oluştu.");
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
              <ClipboardList className="h-8 w-8 text-sky-400" />
              Poliçe Bekleyen Dosyalar
            </h1>
            <p className="mt-2 text-slate-400 max-w-xl">
              Mali Müşavir onayı almış dosyalar poliçe düzenlenmek üzere sıraya alınmıştır. 
              Poliçe yüklendiğinde ürün otomatik olarak <strong>Yolda</strong> durumuna geçecektir.
            </p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
            <Shield size={200} />
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
          </div>
        ) : requests.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <EmptyState
              icon={Shield}
              title="Aktif Poliçe Talebi Yok"
              description="Sigorta onayı bekleyen dosya bulunmuyor. Pipeline'dan yeni dosya geldiğinde burada listelenecektir."
            />
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {requests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col lg:flex-row gap-8 justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 font-bold border border-sky-100">
                          {request.referenceNumber.slice(-2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{request.title}</h3>
                          <p className="text-sm text-slate-500 font-medium">{request.exporter.fullName} • {request.referenceNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Finans Belgeleri (İncele)</p>
                          <div className="space-y-2">
                            {request.documents.map((doc: any) => (
                              <a 
                                key={doc.id}
                                href={doc.fileUrl} 
                                target="_blank"
                                className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{doc.name}</span>
                                <ExternalLink className="h-3 w-3 opacity-50" />
                              </a>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-center justify-center">
                          <div className="text-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Mali Müşavir Onaylı</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-80 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col justify-center">
                      <form onSubmit={(e) => handleDispatch(e, request.id)} className="space-y-4">
                        <div className="relative group/upload">
                          <input 
                            type="file" 
                            name="file" 
                            required 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            id={`file-${request.id}`}
                          />
                          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center group-hover/upload:border-sky-400 group-hover/upload:bg-white transition-all">
                            <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2 group-hover/upload:text-sky-500 group-hover/upload:scale-110 transition-all" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poliçe PDF Seçin</p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={processingId === request.id}
                          className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingId === request.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              Poliçe Kes & Yola Çıkar
                              <Shield className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
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
