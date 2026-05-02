'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, ShoppingCart, Truck, ShieldCheck, Landmark, 
  Search, Filter, Clock, MapPin, User, ChevronRight,
  Stamp
} from 'lucide-react';

interface TaleplerimClientProps {
  initialData: any[];
  userRole: string;
}

export default function TaleplerimClient({ initialData, userRole }: TaleplerimClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getPageTitle = () => {
    switch (userRole) {
      case 'EXPORTER': return 'İlanlarım ve Taleplerim';
      case 'BUYER': return 'Siparişlerim';
      case 'LOGISTICS': return 'Verdiğim Teklifler';
      case 'ICC_EXPERT': return 'Onayladığım İşlemler (ICC)';
      case 'FINANCIAL_ADV': return 'Mali Onaylarım';
      case 'INSURER': return 'Poliçelendirdiğim Ürünler';
      default: return 'Taleplerim';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'EXPORTER': return <Package className="w-8 h-8 text-sky-500" />;
      case 'BUYER': return <ShoppingCart className="w-8 h-8 text-emerald-500" />;
      case 'LOGISTICS': return <Truck className="w-8 h-8 text-amber-500" />;
      case 'ICC_EXPERT': return <Stamp className="w-8 h-8 text-blue-500" />;
      case 'FINANCIAL_ADV': return <Landmark className="w-8 h-8 text-indigo-500" />;
      case 'INSURER': return <ShieldCheck className="w-8 h-8 text-rose-500" />;
      default: return <Clock className="w-8 h-8 text-slate-500" />;
    }
  };

  const filteredData = initialData.filter(item => 
    (item.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.tradeTitle?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">{getPageTitle()}</h1>
              <p className="text-slate-500 font-medium mt-1">Hubify üzerinde yürüttüğünüz tüm aktif ve geçmiş operasyonlar.</p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Referans veya başlık ile ara..."
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {filteredData.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] py-24 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Henüz bir kayıt bulunamadı</h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto">Bu bölümdeki işlemleriniz tamamlandığında veya yeni bir işlem başlattığınızda burada listelenecektir.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredData.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white border border-slate-200 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer overflow-hidden"
              >
                <div 
                  onClick={() => {
                    let detailUrl = '#';
                    if (userRole === 'EXPORTER') detailUrl = `/ihracatci/${item.referenceNumber || item.id}`;
                    else if (userRole === 'BUYER') detailUrl = `/pazaryeri/${item.id}`;
                    else if (userRole === 'LOGISTICS') detailUrl = `/lojistik/${item.referenceNumber || item.id}`;
                    else if (userRole === 'ICC_EXPERT' || userRole === 'FINANCIAL_ADV') detailUrl = `/taleplerim/${item.id}`;
                    else detailUrl = `/teklifler/${item.referenceNumber || item.id}`;
                    window.location.href = detailUrl;
                  }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden flex-shrink-0 relative">
                      {item.productImage ? (
                        <img src={item.productImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                          {item.referenceNumber || item.id.substring(0, 8)}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter">
                          {item.status || item.tradeStatus}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-sky-600 transition-colors">
                        {item.title || item.tradeTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.destinationCity || 'Küresel Rota'}</span>
                        {item.exporter?.fullName && (
                          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {item.exporter.fullName}</span>
                        )}
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 md:text-right">
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operasyonel Değer</p>
                      <p className="text-2xl font-black text-slate-900">
                        {item.totalPrice ? `$${Number(item.totalPrice).toLocaleString()}` : (item.price ? `$${Number(item.price).toLocaleString()}` : 'İşlem Değeri')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-inner">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-sky-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/4 left-0 w-64 h-64 bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
