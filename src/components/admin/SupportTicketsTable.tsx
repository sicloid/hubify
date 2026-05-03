"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  MessageSquare,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Mail,
  User,
  Calendar,
  Hash,
  Sparkles,
  Loader2,
  CircleDot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateSupportTicketStatus } from "@/app/(core)/admin/actions";

type TicketType = "BUG" | "FEATURE";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface SupportTicketRow {
  id: string;
  type: TicketType;
  description: string;
  status: TicketStatus;
  createdAtLabel: string;
  updatedAtLabel: string;
  user: string;
  userFullName: string | null;
  userRole: string | null;
  userEmail: string | null;
  userId: string | null;
}

/** Mesaj gövdesi ve kanal etiketi (alıcı önekleri için) */
function parseTicketContent(description: string): {
  channelLabel: string;
  channelDetail?: string;
  body: string;
} {
  const trimmed = description.trim();
  const buyer = trimmed.match(/^\[Alıcı destek — ([^\]]+)\]\s*\n*/);
  if (buyer) {
    const inner = buyer[1].trim();
    const body = trimmed.slice(buyer[0].length).trim();
    if (inner === "Taleplerim") {
      return {
        channelLabel: "Alıcı",
        channelDetail: "Taleplerim genel mesajı",
        body,
      };
    }
    if (inner.startsWith("Sipariş ")) {
      const ref = inner.replace(/^Sipariş\s+/i, "").trim();
      return {
        channelLabel: "Alıcı",
        channelDetail: `Sipariş bağlantılı · ${ref}`,
        body,
      };
    }
    return {
      channelLabel: "Alıcı",
      channelDetail: inner,
      body,
    };
  }
  return {
    channelLabel: "Üst menü / sistem",
    channelDetail: "Destek · Hata Bildir veya diğer kaynak",
    body: trimmed,
  };
}

function previewText(body: string, max = 90) {
  const oneLine = body.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max)}…`;
}

export function SupportTicketsTable({ tickets }: { tickets: SupportTicketRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  async function setTicketStatus(
    ticketId: string,
    status: TicketStatus,
    e?: React.MouseEvent,
  ) {
    e?.stopPropagation();
    setPendingId(ticketId);
    const result = await updateSupportTicketStatus(ticketId, status);
    setPendingId(null);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error ?? "Durum güncellenemedi.");
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Destek kayıtları</h2>
        </div>
        <div className="p-8 text-center text-slate-500">Henüz bildirilmiş bir kayıt yok.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Tüm talepler ({tickets.length})</h2>
        </div>
        <p className="text-xs text-slate-500">
          Satıra tıklayarak tam metin, kullanıcı ve tarih bilgisini açın.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium w-10" aria-hidden />
              <th className="px-6 py-3 font-medium">Kullanıcı</th>
              <th className="px-6 py-3 font-medium">Tür / Kanal</th>
              <th className="px-6 py-3 font-medium min-w-[200px]">Özet</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Oluşturulma</th>
              <th className="px-6 py-3 font-medium text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket, idx) => {
              const parsed = parseTicketContent(ticket.description);
              const open = expandedId === ticket.id;
              return (
                <Fragment key={ticket.id}>
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setExpandedId(open ? null : ticket.id)}
                    className="cursor-pointer hover:bg-slate-50/90 transition-colors"
                  >
                    <td className="px-4 py-4 align-middle text-slate-400">
                      {open ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {ticket.userFullName ?? "Anonim"}
                      </div>
                      {!ticket.userId && (
                        <span className="text-[10px] font-bold uppercase text-amber-600 mt-1 inline-block">
                          Oturumsuz
                        </span>
                      )}
                      {ticket.userRole && (
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {ticket.userRole}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        {ticket.type === "BUG" ? (
                          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Teknik hata
                          </span>
                        ) : (
                          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" /> İstek / mesaj
                          </span>
                        )}
                        <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
                          <Sparkles className="w-3 h-3" />
                          {parsed.channelLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-600">
                      <p className="line-clamp-2 text-xs leading-relaxed">
                        {previewText(parsed.body)}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-500 whitespace-nowrap text-xs">
                      {ticket.createdAtLabel}
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        {ticket.status === "OPEN" && (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium text-xs">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> Açık
                          </span>
                        )}
                        {ticket.status === "IN_PROGRESS" && (
                          <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                            <CircleDot className="w-3.5 h-3.5 shrink-0" /> İnceleniyor
                          </span>
                        )}
                        {ticket.status === "RESOLVED" && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Tamamlandı · Kapalı
                          </span>
                        )}
                        {ticket.status !== "RESOLVED" && (
                          <button
                            type="button"
                            disabled={pendingId === ticket.id}
                            onClick={(e) => void setTicketStatus(ticket.id, "RESOLVED", e)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                          >
                            {pendingId === ticket.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Kapat
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                  <AnimatePresence initial={false}>
                    {open && (
                      <tr key={`${ticket.id}-detail`} className="bg-slate-50/70">
                        <td colSpan={6} className="px-6 py-0 border-t border-slate-100">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-6 space-y-5">
                              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 justify-between">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Durum yönetimi
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    İşlem bittiğinde{" "}
                                    <strong className="text-slate-800">Tamamlandı</strong> ile kaydı kapatın.
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {ticket.status === "OPEN" && (
                                    <button
                                      type="button"
                                      disabled={pendingId === ticket.id}
                                      onClick={(e) => void setTicketStatus(ticket.id, "IN_PROGRESS", e)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-60 transition-colors"
                                    >
                                      {pendingId === ticket.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CircleDot className="h-4 w-4" />
                                      )}
                                      İncelemeye al
                                    </button>
                                  )}
                                  {ticket.status !== "RESOLVED" && (
                                    <button
                                      type="button"
                                      disabled={pendingId === ticket.id}
                                      onClick={(e) => void setTicketStatus(ticket.id, "RESOLVED", e)}
                                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
                                    >
                                      {pendingId === ticket.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                      )}
                                      Tamamlandı (kapalı)
                                    </button>
                                  )}
                                  {ticket.status === "RESOLVED" && (
                                    <button
                                      type="button"
                                      disabled={pendingId === ticket.id}
                                      onClick={(e) => void setTicketStatus(ticket.id, "OPEN", e)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 transition-colors"
                                    >
                                      {pendingId === ticket.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Clock className="h-4 w-4" />
                                      )}
                                      Yeniden aç
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5" /> Kayıt ID
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-xs font-mono text-slate-800 break-all">
                                      {ticket.id}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyId(ticket.id);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                      <Copy className="w-3 h-3" />
                                      {copiedId === ticket.id ? "Kopyalandı" : "Kopyala"}
                                    </button>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Gönderen
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {ticket.userFullName ?? "—"}
                                  </p>
                                  {ticket.userEmail && (
                                    <a
                                      href={`mailto:${ticket.userEmail}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-medium mt-2 hover:underline"
                                    >
                                      <Mail className="w-3.5 h-3.5 shrink-0" />
                                      {ticket.userEmail}
                                    </a>
                                  )}
                                  {!ticket.userEmail && ticket.userId && (
                                    <p className="text-xs text-slate-400 mt-1">E-posta yok</p>
                                  )}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2 lg:col-span-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Zamanlar
                                  </p>
                                  <p className="text-xs text-slate-700">
                                    <span className="text-slate-400 font-medium">Oluşturulma:</span>
                                    <br />
                                    {ticket.createdAtLabel}
                                  </p>
                                  <p className="text-xs text-slate-700 mt-2">
                                    <span className="text-slate-400 font-medium">Son güncelleme:</span>
                                    <br />
                                    {ticket.updatedAtLabel}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                  Kanal
                                </p>
                                <p className="text-sm font-semibold text-slate-800">
                                  {parsed.channelLabel}
                                  {parsed.channelDetail && (
                                    <span className="text-slate-500 font-normal">
                                      {" "}
                                      — {parsed.channelDetail}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-5 mb-2">
                                  Tam mesaj
                                </p>
                                <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-[min(320px,50vh)] overflow-y-auto">
                                  {parsed.body || (
                                    <span className="text-slate-400 italic">Metin yok</span>
                                  )}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
