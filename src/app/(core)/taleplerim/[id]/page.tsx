'use client';

import { motion } from 'framer-motion';
import { useState, use, useEffect } from 'react';
import { 
  ArrowLeft, FileCheck2, ShieldCheck, Globe, 
  MapPin, User, Clock, FileText, Download,
  Stamp, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { getTradeRequestDetail } from '../../ihracatci/actions';

export default function ApprovedDetailArchivePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Arşiv Kaydı Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!talep) {
    return <div className="p-20 text-center text-slate-400 font-bold">Kayıt bulunamadı veya bu dosyaya erişim yetkiniz yok.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <Link 
            href="/taleplerim" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Taleplerime Dön
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-200">
                <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{talep.referenceNumber}</h1>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">ARŞİVLENDİ</span>
              </div>
              <p className="text-slate-500 font-medium mt-1">Bu operasyon başarıyla denetlenmiş ve dijital mühürle onaylanmıştır.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Documents Section */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-sm">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Onaylı Belgeler ve Sertifikalar
              </h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase">
                {talep.documents?.length || 0} BELGE
              </span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 gap-4">
                {talep.documents?.map((doc: any) => (
                  <motion.div 
                    key={doc.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">{doc.type.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight flex items-center gap-1">
                                <Stamp className="w-3 h-3" /> Dijital Olarak İmzalandı
                            </p>
                        </div>
                    </div>
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Görüntüle
                    </a>
                  </motion.div>
                ))}
                {(!talep.documents || talep.documents.length === 0) && (
                    <div className="py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Henüz Belge Yüklenmemiş</p>
                    </div>
                )}
              </div>
            </div>
          </section>

          {/* Operation Summary */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Operasyon Tipi</p>
                      <p className="text-sm font-bold">Mikro İhracat</p>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Talep Sahibi</p>
                      <p className="text-sm font-bold">{talep.exporter?.fullName}</p>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ağırlık</p>
                      <p className="text-sm font-bold text-sky-400">{talep.weight} KG</p>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Varış</p>
                      <p className="text-sm font-bold">{talep.destinationCity}</p>
                  </div>
              </div>
              <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                  <Globe className="w-48 h-48" />
              </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8">
                <h3 className="font-black text-emerald-900 flex items-center gap-2 mb-4 text-sm uppercase tracking-widest">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Denetim Onayı
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Bu dosya, uluslararası ticaret kuralları ve gümrük yasalarına uygunluğu bakımından incelenmiş ve dijital olarak mühürlenmiştir. 
                </p>
                <div className="mt-6 pt-6 border-t border-emerald-200 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-700">
                        <span>Denetçi Notu:</span>
                        <span className="text-slate-500 italic">"Uygun Görüldü"</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sistem Kaydı</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Son İşlem</p>
                            <p className="text-xs font-bold text-slate-700">{new Date(talep.updatedAt).toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">İşlem Merkezi</p>
                            <p className="text-xs font-bold text-slate-700">Hubify Dijital Gümrük</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
