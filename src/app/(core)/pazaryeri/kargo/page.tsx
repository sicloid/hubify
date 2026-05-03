import { TradeStatus, UserRole } from "@prisma/client";
import { 
  Package, Truck, ShieldCheck, Landmark, 
  CheckCircle2, Clock, MapPin, ChevronRight,
  Box, Search, Filter, AlertCircle
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { serializeDecimal } from "@/lib/serialize";

export default async function KargoTakipPage() {
  const session = await requireRole([UserRole.BUYER, UserRole.ADMIN]);

  const orders = await prisma.tradeRequest.findMany({
    where: {
      buyerId: session.id,
      status: {
        not: TradeStatus.PENDING // Sadece sipariş edilmiş veya daha ileri aşamadaki işler
      }
    },
    include: {
      exporter: { select: { fullName: true } },
    },
    orderBy: { updatedAt: 'desc' }
  });

  const serializedOrders = serializeDecimal(orders);

  const getStatusStep = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.ORDERED: return 1;
      case TradeStatus.QUOTING: return 2;
      case TradeStatus.LOGISTICS_APPROVED: return 3;
      case TradeStatus.DOCUMENTS_PENDING: return 4;
      case TradeStatus.DOCUMENTS_APPROVED: return 5;
      case TradeStatus.IN_TRANSIT: return 6;
      case TradeStatus.COMPLETED: return 7;
      default: return 0;
    }
  };

  const steps = [
    { label: "Sipariş", icon: Package },
    { label: "Teklif", icon: Box },
    { label: "Lojistik", icon: Truck },
    { label: "Denetim", icon: ShieldCheck },
    { label: "Finans", icon: Landmark },
    { label: "Yolda", icon: Truck },
    { label: "Teslim", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-900 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/10" />
        <div className="relative z-10 space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-200">
            <Truck className="h-4 w-4" />
            Lojistik & Takip Merkezi
          </p>
          <h1 className="text-4xl font-black tracking-tighter md:text-5xl">Kargo Takip Sistemi</h1>
          <p className="max-w-xl text-base text-slate-300 font-medium">
            Satın aldığınız ürünlerin üretimden teslimata kadar olan tüm süreçlerini anlık olarak izleyin.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8">
        {serializedOrders.map((order: any) => {
          const currentStep = getStatusStep(order.status);
          return (
            <div key={order.id} className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex flex-col lg:flex-row justify-between gap-8 mb-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">#{order.referenceNumber || order.id.substring(0,8)}</span>
                    <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{order.title}</h2>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {order.exporter.fullName}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.destinationCity || 'Küresel Teslimat'}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(order.updatedAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Tutar</p>
                        <p className="text-3xl font-black text-slate-900">${Number(order.totalPrice || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <ChevronRight className="w-6 h-6" />
                    </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="relative pt-12 pb-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = stepNum < currentStep;
                    const isActive = stepNum === currentStep;
                    const Icon = step.icon;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' :
                          isActive ? 'bg-white border-sky-500 text-sky-600 scale-125 shadow-xl shadow-sky-100' :
                          'bg-white border-slate-200 text-slate-300'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          isCompleted ? 'text-emerald-600' :
                          isActive ? 'text-sky-600' :
                          'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {serializedOrders.length === 0 && (
          <div className="p-24 border-2 border-dashed border-slate-200 rounded-[3rem] text-center bg-white/50">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Henüz Siparişiniz Bulunmuyor</h3>
            <p className="text-slate-400 mt-2 font-medium">Pazaryeri üzerinden bir ürün satın aldığınızda kargo takibi burada görünecektir.</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Hubify Güvence Sistemi</h4>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Tüm siparişleriniz teslim edilene kadar Hubify Escrow hesabında güvence altındadır. Ürün elinize ulaşıp onay vermeden ödeme satıcıya aktarılmaz.
          </p>
        </div>
      </div>
    </div>
  );
}

import { User } from "lucide-react";
