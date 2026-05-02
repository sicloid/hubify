import Link from "next/link";
import { ArrowLeft, CheckCircle2, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/operasyon/StatusBadge";

export default function TeklifDetayPage({ params }: { params: { id: string } }) {
  // Mock veri
  const talep = {
    id: params.id,
    ihracatci: "Anadolu Tekstil",
    kalkis: "İzmir Limanı",
    varis: "New York, ABD",
    urunTipi: "Kuru Yük",
    agirlik: "25,000 kg",
    hacim: "40 m³",
    konteyner: "40' High Cube",
    tarih: "01 May 2026",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Link 
          href="/teklifler" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Tekliflere Dön
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talep Detayı: {talep.id}</h1>
          <StatusBadge status="Beklemede" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Kolon: Talep Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Yük Bilgileri</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">İhracatçı</dt>
                <dd className="mt-1 text-sm text-slate-900 font-medium">{talep.ihracatci}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Ürün Tipi</dt>
                <dd className="mt-1 text-sm text-slate-900">{talep.urunTipi}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Ağırlık / Hacim</dt>
                <dd className="mt-1 text-sm text-slate-900">{talep.agirlik} / {talep.hacim}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Konteyner</dt>
                <dd className="mt-1 text-sm text-slate-900">{talep.konteyner}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-slate-500">Rota</dt>
                <dd className="mt-1 text-sm text-slate-900 flex items-center gap-2">
                  <span className="font-medium text-brand-secondary">{talep.kalkis}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-medium text-brand-secondary">{talep.varis}</span>
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Teklif Formu */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-8">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                Teklif Ver
              </h3>
            </div>
            <form className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Teklif Tutarı (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Geçerlilik Tarihi</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Not / Şartlar (Opsiyonel)</label>
                <textarea rows={3} placeholder="Liman masrafları hariçtir vs..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none"></textarea>
              </div>
              
              <button type="button" className="w-full inline-flex items-center justify-center px-4 py-2 mt-4 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Teklifi İlet
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
