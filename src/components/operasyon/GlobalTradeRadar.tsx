"use client";

import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Package, Loader2, Globe2, Activity, Zap } from "lucide-react";

const geoUrl = "/features.json";

const HUBS: Record<string, [number, number]> = {
  "İSTANBUL": [28.9784, 41.0082],
  "İZMİR": [27.1428, 38.4237],
  "MERSİN": [34.6415, 36.8000],
};

const DESTINATIONS: { name: string; coordinates: [number, number]; risk: string; delay: string }[] = [
  { name: "Berlin", coordinates: [13.405, 52.52], risk: "Düşük", delay: "Yok" },
  { name: "Londra", coordinates: [-0.1276, 51.5074], risk: "Orta", delay: "+1 Gün" },
  { name: "New York", coordinates: [-74.006, 40.7128], risk: "Düşük", delay: "Yok" },
  { name: "Dubai", coordinates: [55.2708, 25.2048], risk: "Yüksek", delay: "+3 Gün" },
  { name: "Tokyo", coordinates: [139.6917, 35.6895], risk: "Düşük", delay: "Yok" },
  { name: "Singapur", coordinates: [103.8198, 1.3521], risk: "Orta", delay: "+2 Gün" },
];

interface ActiveOrder {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
}

interface RadarProps {
  role: "EXPORTER" | "LOGISTICS" | "ADMIN";
  activeOrders?: ActiveOrder[];
}

// Simple hash function to map a string (uuid) to a number deterministically
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export function GlobalTradeRadar({ role, activeOrders = [] }: RadarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map each active order to a deterministic destination and hub
  const mappedOrders = activeOrders.map((order) => {
    const hash = hashString(order.id);
    const dest = DESTINATIONS[hash % DESTINATIONS.length];
    
    // Pick a hub deterministically
    const hubKeys = Object.keys(HUBS);
    const hubName = hubKeys[hash % hubKeys.length];

    return {
      order,
      dest,
      hubName
    };
  });

  const inTransitCount = mappedOrders.length;

  // Determine role-specific text
  const title = role === "EXPORTER" ? "Küresel İhracat Takibi" : role === "LOGISTICS" ? "Canlı Filo & Operasyon Radarı" : "Küresel Komuta Merkezi";
  const subtitle = role === "EXPORTER" ? "Yüklerinizin anlık konumu ve operasyonel durumu" : "Dünya genelindeki tüm aktif konsolidasyon rotalarınız";

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />

      {mounted && (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [20, 35] 
          }}
          className="w-full h-full opacity-80"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1e293b", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Hubs */}
          {Object.entries(HUBS).map(([name, coords]) => (
            <Marker key={name} coordinates={coords}>
              <motion.circle
                r={6}
                fill="#38bdf8"
                initial={{ scale: 0.5, opacity: 0.5 }}
                animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <circle r={3} fill="#fff" />
            </Marker>
          ))}

          {/* Active Routes */}
          {mappedOrders.map((mapped, index) => {
            const { dest, hubName, order } = mapped;
            const hubCoords = HUBS[hubName];
            const isHighRisk = dest.risk === "Yüksek";
            const lineColor = isHighRisk ? "#f43f5e" : "#10b981"; // Rose for high risk, emerald for normal

            return (
              <g key={order.id}>
                {/* Route Track */}
                <Line
                  from={hubCoords}
                  to={dest.coordinates}
                  stroke={lineColor}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  className="opacity-30"
                  style={{ strokeDasharray: "4 4" }}
                />
                
                {/* Flow Animation */}
                <Line
                  from={hubCoords}
                  to={dest.coordinates}
                  stroke={lineColor}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="opacity-80"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    values="0 1000; 1000 0"
                    dur={`${3 + (index * 0.5)}s`}
                    repeatCount="indefinite"
                  />
                </Line>

                {/* Destination Point */}
                <Marker coordinates={dest.coordinates}>
                  <motion.circle 
                    r={3} 
                    fill={lineColor}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.2 }}
                  />
                  <text textAnchor="middle" y={-8} style={{ fontFamily: "Inter, sans-serif", fill: "#94a3b8", fontSize: "8px", fontWeight: "bold" }}>
                    {dest.name}
                  </text>
                </Marker>
              </g>
            );
          })}
        </ComposableMap>
      )}

      {/* Floating Header */}
      <div className="absolute top-6 left-6 max-w-sm pointer-events-none">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-sky-400" />
          {title}
        </h2>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">{subtitle}</p>
      </div>

      {/* Live Data Overlays */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-3 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Ship className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Aktif Transit</p>
            <p className="text-2xl font-black text-white flex items-baseline gap-2">
              {inTransitCount} <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-500/20">Hareket Halinde</span>
            </p>
          </div>
        </div>

        {role === "LOGISTICS" && (
          <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
              <Activity className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Risk Uyarıları</p>
              <p className="text-lg font-black text-white flex items-center gap-2">
                1 Rota <span className="text-xs font-semibold text-rose-400">Gecikme Bekleniyor</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right side live feed */}
      <div className="absolute top-6 right-6 w-64 space-y-3 pointer-events-none hidden md:block">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Zap className="w-3 h-3 text-sky-400" /> Canlı Sistem Akışı
        </div>
        <AnimatePresence>
          {mappedOrders.slice(0, 4).map((mapped, i) => (
            <motion.div
              key={mapped.order.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-slate-900/60 backdrop-blur-xl p-3 rounded-xl border border-slate-700 shadow-xl"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300">{mapped.order.referenceNumber} ➔ {mapped.dest.name.toUpperCase()}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${mapped.dest.risk === 'Yüksek' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {mapped.dest.risk === 'Yüksek' ? 'GECİKME' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium truncate w-40" title={mapped.order.title}>
                  {mapped.order.title}
                </span>
              </div>
            </motion.div>
          ))}
          
          {mappedOrders.length === 0 && (
             <div className="text-xs text-slate-500 italic mt-4">Aktif sevkiyat bulunmuyor...</div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 right-6 bg-sky-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-sky-500/20 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        <span className="text-[10px] font-bold tracking-widest text-sky-300 uppercase">Ağ Bağlantısı Aktif</span>
      </div>
    </div>
  );
}
