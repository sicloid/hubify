"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Merhaba, Hubify destek asistanıyım. Gündelik sohbet de edebiliriz; asıl uzmanlığım platformun işleyişi, roller ve süreçler. Sorun olursa yazmanız yeterli.",
};

export default function SupportChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/support-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "İstek başarısız.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      if (!data.reply) {
        setError("Yanıt alınamadı.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch {
      setError("Bağlantı hatası.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            id="support-chat-panel"
            className="fixed bottom-20 right-4 z-[90] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:right-6 sm:bottom-24 sm:w-[22rem]"
            role="dialog"
            aria-label="Hubify destek sohbeti"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-900 px-3 py-2.5 text-white">
              <span className="text-sm font-semibold tracking-tight">
                Hubify destek
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Sohbeti kapat"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              ref={listRef}
              className="max-h-[min(50vh,320px)] space-y-3 overflow-y-auto px-3 py-3 text-sm"
            >
              {messages.map((m, i) => (
                <div
                  key={`${i}-${m.role}`}
                  className={
                    m.role === "user"
                      ? "ml-6 rounded-xl rounded-br-sm bg-sky-600 px-3 py-2 text-white"
                      : "mr-4 rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2 text-slate-800"
                  }
                >
                  {m.content}
                </div>
              ))}
              {pending && (
                <div className="mr-4 inline-flex rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2 text-slate-500">
                  Yazıyor…
                </div>
              )}
            </div>

            {error && (
              <p className="px-3 pb-1 text-xs text-red-600" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={send} className="border-t border-slate-100 p-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hubify hakkında sorun…"
                  maxLength={2000}
                  disabled={pending}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-sky-600/30 placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 disabled:opacity-60"
                  aria-label="Mesajınız"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="flex shrink-0 items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-white transition hover:bg-sky-700 disabled:opacity-40"
                  aria-label="Gönder"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        initial={false}
        animate={{ scale: open ? 0.92 : 1 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-[95] flex size-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/25 ring-2 ring-white sm:bottom-6 sm:right-6"
        aria-expanded={open}
        aria-controls="support-chat-panel"
        aria-label={open ? "Destek sohbetini kapat" : "Destek sohbetini aç"}
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </motion.button>
    </>
  );
}
