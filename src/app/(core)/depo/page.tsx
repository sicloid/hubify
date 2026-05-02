import { ShieldAlert } from "lucide-react";

export default function WarehousePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="h-10 w-10 text-slate-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Depo Paneli - Yapım Aşamasında</h1>
      <p className="text-slate-500 max-w-md mx-auto">
        Bu panel şu anda geliştirme aşamasındadır. Çok yakında tüm fonksiyonlarıyla kullanıma açılacaktır.
      </p>
    </div>
  );
}
