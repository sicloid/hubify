import Link from "next/link";
import { Package, Truck, Clock } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/operasyon/BentoGrid";
import { StatusBadge, OperationStatus } from "@/components/operasyon/StatusBadge";

export default function TaleplerPage() {
  // Mock data for display purposes
  const stats = [
    {
      title: "Toplam Talep",
      value: "142",
      description: "Son 30 gün içinde oluşturulan",
      icon: <Package className="w-5 h-5 text-slate-400" />,
    },
    {
      title: "Bekleyen",
      value: "18",
      description: "Teklif bekleyen talepler",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      title: "Yolda",
      value: "24",
      description: "Şu anda taşınan yükler",
      icon: <Truck className="w-5 h-5 text-indigo-500" />,
    },
  ];

  const talepler = [
    { id: "TR-2026-001", tarih: "02 May 2026", durum: "Lojistik Onaylandı" as OperationStatus, ihracatci: "Global Trading Ltd.", varis: "Rotterdam, NL" },
    { id: "TR-2026-002", tarih: "01 May 2026", durum: "Beklemede" as OperationStatus, ihracatci: "Anadolu Tekstil", varis: "New York, US" },
    { id: "TR-2026-003", tarih: "28 Nis 2026", durum: "Yolda" as OperationStatus, ihracatci: "Ege Seramik A.Ş.", varis: "Hamburg, DE" },
    { id: "TR-2026-004", tarih: "25 Nis 2026", durum: "Tamamlandı" as OperationStatus, ihracatci: "Marmara Gıda", varis: "Londra, UK" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">İşlem Panosu</h1>
          <p className="text-sm text-slate-500 mt-1">İhracat, lojistik ve depo süreçlerinizi buradan yönetin.</p>
        </div>
        <Link 
          href="/talepler/yeni" 
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 shadow-sm"
        >
          <Package className="w-4 h-4 mr-2" />
          Yeni Gönderi Talebi
        </Link>
      </div>

      <BentoGrid>
        {stats.map((stat, i) => (
          <BentoGridItem
            key={i}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </BentoGrid>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-base font-medium text-slate-900">Son Talepler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-900">Referans</th>
                <th className="px-6 py-4 font-medium text-slate-900">Tarih</th>
                <th className="px-6 py-4 font-medium text-slate-900">Varış Noktası</th>
                <th className="px-6 py-4 font-medium text-slate-900">İhracatçı</th>
                <th className="px-6 py-4 font-medium text-slate-900">Durum</th>
                <th className="px-6 py-4 font-medium text-slate-900 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {talepler.map((talep) => (
                <tr key={talep.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-medium text-slate-900">{talep.id}</td>
                  <td className="px-6 py-4 text-slate-500">{talep.tarih}</td>
                  <td className="px-6 py-4">{talep.varis}</td>
                  <td className="px-6 py-4">{talep.ihracatci}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={talep.durum} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-secondary hover:text-sky-800 font-medium text-sm transition-colors">
                      Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
