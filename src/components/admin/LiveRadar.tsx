"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Server, AlertCircle } from "lucide-react";

export function LiveRadar() {
  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border border-slate-800">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Outer Rings */}
      <div className="absolute w-[350px] h-[350px] rounded-full border border-sky-500/20" />
      <div className="absolute w-[250px] h-[250px] rounded-full border border-sky-500/30" />
      <div className="absolute w-[150px] h-[150px] rounded-full border border-emerald-500/40" />

      {/* Radar Sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, transparent 80%, rgba(14, 165, 233, 0.4) 100%)',
        }}
      >
        <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-sky-400 origin-bottom" />
      </motion.div>

      {/* Center Core */}
      <div className="relative z-10 w-20 h-20 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
      </div>

      {/* Ping Dots (Simulated Users/Nodes) */}
      <PingNode top="20%" left="30%" color="bg-sky-400" delay={0.5} label="İhracatçı: 2 Aktif" />
      <PingNode top="70%" left="25%" color="bg-emerald-400" delay={1.2} label="Lojistik Onayı: 1" />
      <PingNode top="35%" left="75%" color="bg-amber-400" delay={2.5} label="Gümrük Bekliyor" />
      <PingNode top="80%" left="65%" color="bg-purple-400" delay={3.1} label="Sigorta İşleniyor" />

      {/* Status Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700">
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500" 
          />
          <span className="text-xs font-medium text-slate-300">Sistem Güvenli</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-medium text-slate-300">24 İşlem/dk</span>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">Ana Düğüm Aktif</span>
        </div>
      </div>
    </div>
  );
}

function PingNode({ top, left, color, delay, label }: { top: string, left: string, color: string, delay: number, label: string }) {
  return (
    <div className="absolute z-20 group cursor-pointer" style={{ top, left }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration: 0.5, type: "spring" }}
        className="relative"
      >
        {/* Blip effect */}
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: delay }}
          className={`absolute inset-0 rounded-full ${color}`}
        />
        <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_currentColor]`} />
        
        {/* Tooltip */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2.5 py-1 rounded-md border border-slate-700 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {label}
        </motion.div>
      </motion.div>
    </div>
  );
}
