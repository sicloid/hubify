'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, use, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, DollarSign, Package, Truck, Ship, Calendar, ShieldCheck, MapPin, Globe, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";
import { getTradeRequestDetail, acceptQuote } from '../actions';
import AnimatedApprovalButton from "@/components/operasyon/AnimatedApprovalButton";

/** API'den gelen TradeStatus değerleri — istemcide @prisma/client kullanılmaz (require hatası önlenir) */
type ExporterTradeStatus =
  | "PENDING"
  | "ORDERED"
  | "QUOTING"
  | "LOGISTICS_APPROVED"
  | "DOCUMENTS_PENDING"
  | "DOCUMENTS_APPROVED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

const mapStatus = (status: string): OperationStatus => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'ORDERED': return 'Sipariş Verildi';
    case 'QUOTING': return 'Teklif Alındı';
    case 'LOGISTICS_APPROVED': return 'Lojistik Onaylandı';
    case 'DOCUMENTS_APPROVED': return 'Yolda';
    case 'IN_TRANSIT': return 'Yolda';
    case 'COMPLETED': return 'Tamamlandı';
    default: return 'Beklemede';
  }
};

const trackingSteps: {
  id: string;
  label: string;
  statuses: readonly ExporterTradeStatus[];
}[] = [
  { id: 'talep', label: 'Talep', statuses: ['PENDING', 'ORDERED'] },
  { id: 'konsolidasyon', label: 'Konsolidasyon', statuses: ['QUOTING'] },
  { id: 'yasal-onay', label: 'Yasal Onay', statuses: ['LOGISTICS_APPROVED', 'DOCUMENTS_PENDING'] },
  { id: 'finans', label: 'Finans', statuses: ['DOCUMENTS_APPROVED'] },
  { id: 'guvence', label: 'Güvence & Sevkiyat', statuses: ['IN_TRANSIT'] },
  { id: 'tamamlandi', label: 'Teslim Edildi', statuses: ['COMPLETED'] },
];

export default function ExporterTalepDetayPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [talep, setTalep] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getTradeRequestDetail(params.id);
      setTalep(data);
      setIsLoading(false);
    }
    loadData();
  }, [params.id]);

  const handleAccept = async (quoteId: string) => {
    setIsAccepting(quoteId);
    const result = await acceptQuote(quoteId, params.id);
    if (result.success) {
      const data = await getTradeRequestDetail(params.id);
      setTalep(data);
    }
    setIsAccepting(null);
  };

  if (isLoading) {
    return <div className="p-20 text-center animate-pulse text-slate-400 font-medium">Talep detayları yükleniyor...</div>;
  }

  if (!talep) {
    return <div className="p-20 text-center text-slate-400">Talep bulunamadı veya yetkiniz yok.</div>;
  }

  const currentStepIndex = trackingSteps.findIndex((step) =>
    (step.statuses as readonly string[]).includes(talep.status as string),
  );
  const acceptedQuote = talep.quotes.find((q: any) => q.isAccepted);

  // Mock location and ETA based on status
  const getTrackingDetails = () => {
    switch (talep.status) {
      case 'PENDING': return { location: 'Pazaryeri', eta: 'Alıcı Bekleniyor', desc: 'İlanınız yayında, alıcının sipariş vermesi bekleniyor.' };
      case 'ORDERED': return { location: 'Lojistik Havuzu', eta: 'Teklif Bekleniyor', desc: 'Alıcı sipariş verdi. Lojistikçiler teklif hazırlıyor.' };
      case 'QUOTING': return { location: 'Lojistik Havuzu', eta: 'Teklif Bekleniyor', desc: 'Lojistik firmalarından teklifler toplanıyor.' };
      case 'LOGISTICS_APPROVED': return { location: 'ICC Denetim Merkezi', eta: '6-8 Gün', desc: 'Lojistik onaylandı. ICC Uzmanı gümrük yasalarına uygunluğu denetliyor.' };
      case 'DOCUMENTS_APPROVED': return { location: 'Mali Müşavirlik', eta: '4-5 Gün', desc: 'Yasal onay verildi. Mali Müşavir e-fatura ve KDV iade süreçlerini yönetiyor.' };
      case 'IN_TRANSIT': return { location: 'Sınır Geçişi / Sigorta Aktif', eta: '1-2 Gün', desc: 'Finansal süreçler tamamlandı, sigorta poliçesi eklendi ve yük yola çıktı.' };
      case 'COMPLETED': return { location: 'Varış Noktası', eta: 'Teslim Edildi', desc: 'Paket alıcıya başarıyla ulaştırıldı.' };
      default: return { location: 'İşlem Merkezi', eta: 'Hesaplanıyor...', desc: 'Süreciniz Hubify Pipeline üzerinde ilerliyor.' };
    }
  };

  const details = getTrackingDetails();

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link 
            href="/ihracatci" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Panoya Dön
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{talep.referenceNumber}: {talep.title}</h1>
            <StatusBadge status={mapStatus(talep.status)} />
          </div>
        </div>
      </div>

      {/* Package Tracking System */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <Globe className="w-6 h-6 text-sky-600 animate-spin-slow" />
              Paket Takip Sistemi
            </h3>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tahmini Teslimat</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                  <Clock className="w-3.5 h-3.5 text-sky-500" /> {details.eta}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Şu Anki Konum</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {details.location}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Line */}
          <div className="relative flex justify-between">
            {/* Background Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full" />
            {/* Animated Active Line */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }}
              className="absolute top-5 left-0 h-1 bg-sky-600 rounded-full shadow-[0_0_10px_rgba(2,132,199,0.5)]"
            />

            {trackingSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              
              return (
                <div key={step.id} className="relative flex flex-col items-center group">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isCompleted || isActive ? '#0284c7' : '#f1f5f9',
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-sm"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                    )}
                  </motion.div>
                  <p className={`mt-4 text-[10px] font-bold uppercase tracking-tight text-center max-w-[80px] ${isActive ? 'text-sky-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          <motion.div 
            key={talep.status}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <InfoIcon className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{trackingSteps[currentStepIndex]?.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{details.desc}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:gap-3 transition-all">
              Tüm Hareketleri Gör <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Quotes Section */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Lojistik Teklifleri
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase">{talep.quotes.length} Teklif</span>
            </div>

            <div className="divide-y divide-slate-100">
              {talep.quotes.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <ClockIcon className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm">Henüz teklif gelmedi. Talebiniz lojistik havuzunda inceleniyor.</p>
                </div>
              ) : (
                talep.quotes.map((quote: any) => (
                  <motion.div 
                    key={quote.id}
                    layout
                    className={`p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all ${quote.isAccepted ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : ''}`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${quote.isAccepted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Ship className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{quote.logistics.fullName}</h4>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            <Calendar className="w-3.5 h-3.5" /> {quote.estimatedDays} Gün Teslimat
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            <ShieldCheck className="w-3.5 h-3.5" /> Sigorta Dahil
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Teklif Tutarı</p>
                        <p className="text-2xl font-black text-slate-900">${quote.price.toLocaleString()}</p>
                      </div>

                      {quote.isAccepted ? (
                        <div className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Onaylandı
                        </div>
                      ) : talep.status === 'PENDING' || talep.status === 'QUOTING' ? (
                        <AnimatedApprovalButton
                          onApprove={() => handleAccept(quote.id)}
                          disabled={!!isAccepting}
                          label="Teklifi Onayla"
                          processingLabel="Onaylanıyor..."
                          approvedLabel="Onaylandı ✓"
                          icon={ShieldCheck}
                          color="slate"
                        />
                      ) : null}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-400" />
              Yük Detayları
            </h3>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Ağırlık</p>
                <p className="text-sm font-semibold">{talep.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Açıklama</p>
                <p className="text-sm text-slate-300 leading-relaxed">{talep.description}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Oluşturulma</p>
                <p className="text-sm">{new Date(talep.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
            <Package className="w-32 h-32 text-white/5 absolute right-[-20px] bottom-[-20px]" />
          </div>

          <AnimatePresence>
            {acceptedQuote && talep.status === 'LOGISTICS_APPROVED' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-xl shadow-indigo-100/50"
              >
                <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  Sıradaki Adım: Yasal Onay
                </h3>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Lojistik teklifini onayladınız. Şimdi <strong>ICC Uzmanı</strong> belgelerinizi gümrük kurallarına göre denetleyip dijital mühür basacaktır.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  ICC Uzmanı Bekleniyor...
                </div>
              </motion.div>
            )}

            {talep.status === 'DOCUMENTS_APPROVED' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-xl shadow-emerald-100/50"
              >
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Sıradaki Adım: Finansal Onay
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Gümrük onayları tamamlandı. Şimdi <strong>Mali Müşavir</strong> e-fatura ve KDV iade süreçlerini sisteme işleyecektir.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  Mali Müşavir Bekleniyor...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function InfoIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
