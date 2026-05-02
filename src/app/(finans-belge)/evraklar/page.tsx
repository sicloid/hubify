export default function EvraklarPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Belge ve Finans Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-1">Gümrük evrakları, faturalar ve sigorta belgeleri.</p>
        </div>
        <button className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          Yeni Belge Yükle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Grid Item 1 */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Bekleyen Onaylar</h3>
          <p className="text-3xl font-bold text-brand-secondary">12</p>
          <p className="text-xs text-slate-500 mt-2">Son 24 saat içinde eklenen evraklar</p>
        </div>
        
        {/* Bento Grid Item 2 */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Sigorta Bekleyenler</h3>
          <p className="text-3xl font-bold text-amber-500">3</p>
          <p className="text-xs text-slate-500 mt-2">Poliçe onayı gerektiren işlemler</p>
        </div>
        
        {/* Bento Grid Item 3 */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Son Yüklenen</h3>
          <p className="text-sm font-medium text-slate-700 truncate">Konşimento_INV2026.pdf</p>
          <p className="text-xs text-slate-500 mt-2">Ahmet Yılmaz tarafından yüklendi</p>
        </div>
      </div>
    </div>
  );
}
