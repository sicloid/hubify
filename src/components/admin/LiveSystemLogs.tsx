"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Terminal, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { getLiveSystemLogs } from "@/app/(core)/admin/actions";

type LogEvent = {
  id: string;
  message: string;
  type: "success" | "warning" | "info";
  time: string;
};

export function LiveSystemLogs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);

  const fetchLogs = async () => {
    try {
      const data = await getLiveSystemLogs();
      setLogs(data as LogEvent[]);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLogs();

    // Poll every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "warning": return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default: return <Clock className="w-4 h-4 text-sky-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-400/10 border-emerald-400/20";
      case "warning": return "bg-amber-400/10 border-amber-400/20";
      default: return "bg-sky-400/10 border-sky-400/20";
    }
  };

  return (
    <div className="w-full h-[400px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col font-mono relative">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-slate-400" />
          <h3 className="text-slate-200 font-semibold tracking-wide">Güvenlik & Denetim Logları</h3>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
          />
        </div>
      </div>

      {/* Log Stream */}
      <div className="flex-1 p-5 overflow-hidden flex flex-col justify-end">
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-sm text-center">Henüz sistem logu bulunmuyor...</div>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${getBgColor(log.type)}`}
                >
                  <div className="mt-0.5">{getIcon(log.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 leading-relaxed">{log.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block tracking-wider">[{log.time}]</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20" />
    </div>
  );
}

