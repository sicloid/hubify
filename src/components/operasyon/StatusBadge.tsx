import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type OperationStatus = 
  | 'Beklemede' 
  | 'Sipariş Verildi'
  | 'Teklif Alındı' 
  | 'Lojistik Onaylandı' 
  | 'Belge Bekliyor'
  | 'Gümrük Denetimi'
  | 'Finans Onaylı'
  | 'Yükleniyor'
  | 'Yolda'
  | 'Teslim Edildi'
  | 'Tamamlandı'
  | 'İptal Edildi';

interface StatusBadgeProps {
  status: OperationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<OperationStatus, string> = {
    'Beklemede': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Sipariş Verildi': 'bg-rose-50 text-rose-700 ring-rose-600/20',
    'Teklif Alındı': 'bg-sky-50 text-sky-700 ring-sky-600/20',
    'Lojistik Onaylandı': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Belge Bekliyor': 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
    'Gümrük Denetimi': 'bg-violet-50 text-violet-700 ring-violet-600/20',
    'Finans Onaylı': 'bg-teal-50 text-teal-700 ring-teal-600/20',
    'Yükleniyor': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'Yolda': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    'Teslim Edildi': 'bg-green-50 text-green-700 ring-green-600/20',
    'Tamamlandı': 'bg-slate-50 text-slate-700 ring-slate-600/20',
    'İptal Edildi': 'bg-red-50 text-red-700 ring-red-600/20',
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
