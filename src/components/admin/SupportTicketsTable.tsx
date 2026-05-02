"use client";

import { ShieldAlert, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { TicketType, TicketStatus } from "@prisma/client";
import { motion } from "framer-motion";

interface Ticket {
  id: string;
  type: TicketType;
  description: string;
  status: TicketStatus;
  time: string;
  user: string;
}

export function SupportTicketsTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Sistem Destek Talepleri</h2>
        </div>
        <div className="p-8 text-center text-slate-500">Henüz bildirilmiş bir hata veya talep yok.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Sistem Destek Talepleri ({tickets.length})</h2>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Kullanıcı</th>
              <th className="px-6 py-4 font-medium">Tür</th>
              <th className="px-6 py-4 font-medium">Açıklama</th>
              <th className="px-6 py-4 font-medium">Zaman</th>
              <th className="px-6 py-4 font-medium text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={ticket.id} 
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {ticket.user}
                </td>
                <td className="px-6 py-4">
                  {ticket.type === "BUG" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                      <ShieldAlert className="w-3.5 h-3.5" /> Hata Bildirimi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      <MessageSquare className="w-3.5 h-3.5" /> Geliştirme İsteği
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={ticket.description}>
                  {ticket.description}
                </td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {ticket.time}
                </td>
                <td className="px-6 py-4 text-right">
                  {ticket.status === "OPEN" && (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium text-xs">
                      <Clock className="w-3.5 h-3.5" /> Açık
                    </span>
                  )}
                  {ticket.status === "IN_PROGRESS" && (
                    <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                      İnceleniyor
                    </span>
                  )}
                  {ticket.status === "RESOLVED" && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Çözüldü
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
