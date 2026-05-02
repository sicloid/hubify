import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function YeniTalepPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link 
          href="/talepler" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Panoya Dön
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Yeni Gönderi Talebi</h1>
        <p className="text-sm text-slate-500 mt-1">Lojistik firmalarından teklif almak için yük detaylarını girin.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-8">
          
          {/* Yük Detayları */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">Yük Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Ürün Tipi</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent">
                  <option>Kuru Yük</option>
                  <option>Soğuk Zincir</option>
                  <option>Tehlikeli Madde (ADR)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Toplam Ağırlık (kg)</label>
                <input type="number" placeholder="Örn: 25000" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Hacim (m³)</label>
                <input type="number" placeholder="Örn: 40" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Konteyner Tipi</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent">
                  <option>20' Standart</option>
                  <option>40' High Cube</option>
                  <option>Parsiyel (LCL)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rota */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">Rota ve Zamanlama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Yükleme Noktası</label>
                <input type="text" placeholder="Örn: İstanbul/Ambarlı" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Varış Noktası</label>
                <input type="text" placeholder="Örn: Rotterdam Limanı" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Hazır Olma Tarihi</label>
                <input type="date" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Hedeflenen Varış Tarihi</label>
                <input type="date" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end space-x-4 border-t border-slate-100">
            <Link href="/talepler" className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center justify-center">
              İptal
            </Link>
            <button type="button" className="inline-flex items-center px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm">
              <Send className="w-4 h-4 mr-2" />
              Talebi Gönder
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
