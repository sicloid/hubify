import Link from "next/link";
import { Search, Filter, Anchor } from "lucide-react";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";

export default function TekliflerPage() {
  const acikTalepler = [
    { id: "TR-2026-002", ihracatci: "Anadolu Tekstil", kalkis: "İzmir Limanı", varis: "New York, US", tarih: "01 May 2026", agirlik: "25 Ton", teklifSayisi: 3, durum: "Beklemede" as OperationStatus },
    { id: "TR-2026-005", ihracatci: "Bursa Otomotiv", kalkis: "Gemlik Limanı", varis: "Barselona, ES", tarih: "03 May 2026", agirlik: "18 Ton", teklifSayisi: 0, durum: "Beklemede" as OperationStatus },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teklif Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-1">Açık nakliye taleplerini görüntüleyin ve teklif verin.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row p-4 gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Referans veya İhracatçı ara..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors w-full md:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filtrele
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {acikTalepler.map((talep) => (
          <div key={talep.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center text-brand-secondary flex-shrink-0">
                  <Anchor className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{talep.id}</h3>
                    <StatusBadge status={talep.durum} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{talep.ihracatci}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      {talep.kalkis} <span className="mx-1">→</span> {talep.varis}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      {talep.agirlik}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      Hedef: {talep.tarih}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                <div className="text-sm text-slate-500 text-right">
                  Mevcut Teklif: <span className="font-medium text-slate-900">{talep.teklifSayisi}</span>
                </div>
                <Link 
                  href={`/teklifler/${talep.id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm"
                >
                  Teklif Ver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
