"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  ShieldCheck,
  FileCheck2,
  Users,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";
import { getLiveRadarStats } from "@/app/(core)/admin/actions";

type Stats = {
  pending: number;
  reviewing: number;
  docsPending: number;
  inTransit: number;
};

const CARDS = [
  {
    key: "pending",
    label: "Bekleyen Talepler",
    icon: Package,
    bg: "bg-amber-50",
    fg: "text-amber-600",
    ring: "ring-amber-200",
    pulse: "bg-amber-400",
  },
  {
    key: "reviewing",
    label: "İşlem Altında",
    icon: Activity,
    bg: "bg-sky-50",
    fg: "text-sky-600",
    ring: "ring-sky-200",
    pulse: "bg-sky-400",
  },
  {
    key: "docsPending",
    label: "Belge Onay Bekliyor",
    icon: FileCheck2,
    bg: "bg-purple-50",
    fg: "text-purple-600",
    ring: "ring-purple-200",
    pulse: "bg-purple-400",
  },
  {
    key: "inTransit",
    label: "Yoldaki Sevkiyatlar",
    icon: Truck,
    bg: "bg-emerald-50",
    fg: "text-emerald-600",
    ring: "ring-emerald-200",
    pulse: "bg-emerald-400",
  },
] as const;

export function AdminDashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await getLiveRadarStats();
      if (data && !("error" in data)) {
        setStats(data as Stats);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const value = stats ? stats[card.key as keyof Stats] : null;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4, type: "spring" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group`}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.fg} mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2">
              {value !== null ? (
                <motion.span
                  key={value}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-black text-slate-900 tracking-tight"
                >
                  {value}
                </motion.span>
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500 mt-1">{card.label}</p>

            {/* Live pulse indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${card.pulse}`}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Canlı</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
