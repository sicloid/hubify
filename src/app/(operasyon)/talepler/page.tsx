export default function TaleplerPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İşlem Talepleri</h1>
          <p className="text-sm text-slate-500 mt-1">İhracat, lojistik ve depo süreçlerinizi buradan yönetin.</p>
        </div>
        <button className="px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
          Yeni Talep Oluştur
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-900">Referans</th>
              <th className="px-6 py-3 font-medium text-slate-900">Tarih</th>
              <th className="px-6 py-3 font-medium text-slate-900">Durum</th>
              <th className="px-6 py-3 font-medium text-slate-900">İhracatçı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs">TR-2026-001</td>
              <td className="px-6 py-4">02 May 2026</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium ring-1 ring-inset ring-emerald-600/20">
                  Lojistik Onaylandı
                </span>
              </td>
              <td className="px-6 py-4">Global Trading Ltd.</td>
            </tr>
            {/* Empty state or more rows */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
