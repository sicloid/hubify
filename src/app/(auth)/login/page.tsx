export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Sisteme Giriş Yap</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input type="email" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input type="password" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary" />
          </div>
          <button className="w-full py-2.5 px-4 bg-brand-primary text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
