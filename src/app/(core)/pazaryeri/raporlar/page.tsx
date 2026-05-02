import { UserRole, TradeStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { 
  BarChart3, 
  TrendingUp, 
  PackageCheck, 
  Clock, 
  CircleDollarSign, 
  Activity,
  ArrowUpRight,
  Truck
} from "lucide-react";
import Link from "next/link";

export default async function BuyerReportsPage() {
  const session = await requireRole([UserRole.BUYER]);
  const buyerId = session.id;

  // Fetch all orders for this buyer
  const allOrders = await prisma.tradeRequest.findMany({
    where: { buyerId },
    include: { 
      exporter: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalSpent = allOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
  const activeOrders = allOrders.filter(o => o.status !== TradeStatus.COMPLETED && o.status !== TradeStatus.CANCELLED);
  const completedOrders = allOrders.filter(o => o.status === TradeStatus.COMPLETED);
  const inTransitOrders = allOrders.filter(o => o.status === TradeStatus.IN_TRANSIT);

  // Status mapping for nice UI
  const statusConfig: Record<string, { label: string, color: string, bg: string }> = {
    [TradeStatus.PENDING]: { label: "Bekliyor", color: "text-slate-600", bg: "bg-slate-100" },
    [TradeStatus.ORDERED]: { label: "Sipariş Verildi", color: "text-sky-600", bg: "bg-sky-100" },
    [TradeStatus.QUOTING]: { label: "Fiyatlanıyor", color: "text-indigo-600", bg: "bg-indigo-100" },
    [TradeStatus.LOGISTICS_APPROVED]: { label: "Lojistik Onaylı", color: "text-blue-600", bg: "bg-blue-100" },
    [TradeStatus.DOCUMENTS_PENDING]: { label: "Belge Bekleniyor", color: "text-amber-600", bg: "bg-amber-100" },
    [TradeStatus.DOCUMENTS_APPROVED]: { label: "Belge Onaylı", color: "text-emerald-600", bg: "bg-emerald-100" },
    [TradeStatus.IN_TRANSIT]: { label: "Yolda", color: "text-violet-600", bg: "bg-violet-100" },
    [TradeStatus.COMPLETED]: { label: "Tamamlandı", color: "text-teal-600", bg: "bg-teal-100" },
    [TradeStatus.CANCELLED]: { label: "İptal", color: "text-rose-600", bg: "bg-rose-100" },
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-300 backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              Performans & Analiz
            </p>
            <h1 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400">
              Alıcı Raporları
            </h1>
            <p className="max-w-xl text-base text-indigo-200/80 font-medium">
              Tüm satın alım geçmişinizi, harcamalarınızı ve devam eden siparişlerinizin güncel durumunu bu panelden anlık olarak takip edebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 mr-1" />
              Genel Toplam
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Toplam Harcama</h3>
            <p className="mt-2 text-3xl font-black text-slate-900">
              ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-50 rounded-full transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktif Sipariş</h3>
            <p className="mt-2 text-3xl font-black text-slate-900">{activeOrders.length}</p>
          </div>
        </div>

        {/* In Transit */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Yolda Olan</h3>
            <p className="mt-2 text-3xl font-black text-slate-900">{inTransitOrders.length}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tamamlanan</h3>
            <p className="mt-2 text-3xl font-black text-slate-900">{completedOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Son Sipariş Hareketleri
            </h2>
            <Link href="/pazaryeri" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              Tümünü Gör <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {allOrders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {allOrders.slice(0, 5).map(order => {
                  const statusInfo = statusConfig[order.status] || statusConfig[TradeStatus.PENDING];
                  
                  return (
                    <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusInfo.bg}`}>
                          <PackageCheck className={`w-6 h-6 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{order.referenceNumber}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">İhracatçı: {order.exporter.fullName}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="font-black text-slate-900 text-lg">
                          ${Number(order.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageCheck className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Henüz Sipariş Yok</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Sistemde size ait bir satın alım geçmişi bulunmuyor. Yeni alımlar yaptığınızda raporlarınız burada oluşacaktır.</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Widget */}
        <div className="space-y-6">
          <div className="flex items-center px-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-500" />
              Sipariş Dağılımı
            </h2>
          </div>
          
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              {/* Progress Bar 1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Hazırlanan</span>
                  <span className="text-sm font-black text-slate-900">
                    {Math.round(((activeOrders.length - inTransitOrders.length) / Math.max(allOrders.length, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                    style={{ width: `${((activeOrders.length - inTransitOrders.length) / Math.max(allOrders.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Bar 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Yolda Olan</span>
                  <span className="text-sm font-black text-slate-900">
                    {Math.round((inTransitOrders.length / Math.max(allOrders.length, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full"
                    style={{ width: `${(inTransitOrders.length / Math.max(allOrders.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Bar 3 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tamamlanan</span>
                  <span className="text-sm font-black text-slate-900">
                    {Math.round((completedOrders.length / Math.max(allOrders.length, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    style={{ width: `${(completedOrders.length / Math.max(allOrders.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100/50">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">Aylık Ort. Harcama</p>
                <p className="text-2xl font-black text-indigo-900">
                  ${(totalSpent / Math.max(new Set(allOrders.map(o => new Date(o.createdAt).getMonth())).size, 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
