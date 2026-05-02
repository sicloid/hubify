import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type OperationStatus = 
  | 'Beklemede' 
  | 'Teklif Alındı' 
  | 'Lojistik Onaylandı' 
  | 'Yükleniyor'
  | 'Yolda'
  | 'Tamamlandı'
  | 'İptal Edildi';

interface StatusBadgeProps {
  status: OperationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<OperationStatus, string> = {
    'Beklemede': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Teklif Alındı': 'bg-sky-50 text-sky-700 ring-sky-600/20',
    'Lojistik Onaylandı': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Yükleniyor': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'Yolda': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
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
