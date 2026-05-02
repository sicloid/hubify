import Link from "next/link";
import { ArrowLeft, Send, Info } from "lucide-react";

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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Yeni Mikro-İhracat Talebi</h1>
        <p className="text-sm text-slate-500 mt-1">Lojistik firmalarından teklif almak ve konsolidasyon havuzuna katılmak için yük detaylarını girin.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-8">
          
          {/* Lojistik Konsolidasyonu Uyarısı */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-sky-900">Konsolidasyon Fırsatı</h4>
              <p className="text-sm text-sky-700 mt-1">Yükünüzü diğer ihracatçıların yükleriyle birleştirerek (LCL/Parsiyel) nakliye maliyetlerinizi %40'a kadar azaltabilirsiniz.</p>
            </div>
          </div>

          {/* Yük Detayları */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">Ürün ve Yük Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Ürün Tipi / Kategorisi</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent">
                  <option>Genel Kuru Yük</option>
                  <option>Tekstil / Hazır Giyim</option>
                  <option>Gıda / Soğuk Zincir</option>
                  <option>Mobilya / Ev Eşyası</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Toplam Ağırlık (kg)</label>
                <input type="number" placeholder="Örn: 250" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Hacim (m³)</label>
                <input type="number" placeholder="Örn: 2.5" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Konteyner / Yükleme Tipi</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent">
                  <option>Parsiyel / LCL (Konsolide Edilebilir)</option>
                  <option>20' Standart (FCL)</option>
                  <option>40' High Cube (FCL)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 pt-2">
              <label className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-secondary rounded border-slate-300 focus:ring-brand-secondary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">Bu yük konsolidasyon havuzuna dahil edilebilir</span>
                  <span className="text-xs text-slate-500">Kabul etmeniz durumunda lojistik firmaları yükünüzü diğerleriyle birleştirip daha uygun fiyat teklifi sunabilir.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Rota */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">Rota ve Zamanlama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Yükleme Noktası (Çıkış)</label>
                <input type="text" placeholder="Örn: İstanbul/Ambarlı" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Varış Noktası (Hedef Pazar)</label>
                <input type="text" placeholder="Örn: Rotterdam, NL" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Hazır Olma Tarihi</label>
                <input type="date" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Esnek Teslimat Tarihi</label>
                <input type="date" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent" />
                <p className="text-xs text-slate-500 mt-1">Esnek tarihler daha fazla konsolidasyon şansı sunar.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end space-x-4 border-t border-slate-100">
            <Link href="/talepler" className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center justify-center">
              İptal
            </Link>
            <button type="button" className="inline-flex items-center px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm">
              <Send className="w-4 h-4 mr-2" />
              Talebi Yayınla
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
