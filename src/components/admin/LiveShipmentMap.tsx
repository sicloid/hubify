"use client";

import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import { motion } from "framer-motion";
import { getLiveRadarStats } from "@/app/(core)/admin/actions";
import { Plane, Ship, Package, Loader2 } from "lucide-react";

const geoUrl = "/features.json";

// Merkez: İstanbul (Enlem, Boylam)
const ISTANBUL: [number, number] = [28.9784, 41.0082];

// Destinasyonlar (Rastgele rotalar için)
const DESTINATIONS: { name: string; coordinates: [number, number] }[] = [
  { name: "Berlin", coordinates: [13.405, 52.52] },
  { name: "Londra", coordinates: [-0.1276, 51.5074] },
  { name: "New York", coordinates: [-74.006, 40.7128] },
  { name: "Dubai", coordinates: [55.2708, 25.2048] },
  { name: "Tokyo", coordinates: [139.6917, 35.6895] },
];

export function LiveShipmentMap() {
  const [stats, setStats] = useState({ pending: 0, reviewing: 0, docsPending: 0, inTransit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getLiveRadarStats();
      if (data && !('error' in data)) {
        setStats(data as { pending: number; reviewing: number; docsPending: number; inTransit: number });
      }
      setLoading(false);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[450px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
      
      {/* Harita */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 20] // Haritanın merkezini ayarla
        }}
        className="w-full h-full opacity-60"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1e293b" // slate-800
                stroke="#334155" // slate-700
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#334155", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* İstanbul Merkezi Marker */}
        <Marker coordinates={ISTANBUL}>
          <motion.circle
            r={6}
            fill="#3b82f6" // blue-500
            initial={{ scale: 0.5, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          />
          <circle r={3} fill="#fff" />
          <text textAnchor="middle" y={-10} style={{ fontFamily: "system-ui", fill: "#94a3b8", fontSize: "10px" }}>
            İSTANBUL HUB
          </text>
        </Marker>

        {/* Dinamik Rotalar (Veritabanındaki inTransit sayısına göre rota çiz) */}
        {!loading &&
          DESTINATIONS.slice(0, Math.max(1, stats.inTransit || 3)).map((dest, index) => (
            <g key={dest.name}>
              {/* Rota Çizgisi */}
              <Line
                from={ISTANBUL}
                to={dest.coordinates}
                stroke="#10b981" // emerald-500
                strokeWidth={1.5}
                strokeLinecap="round"
                className="opacity-50"
                style={{ strokeDasharray: "4 4" }}
              />
              
              {/* Kargo Animasyonu */}
              <Line
                from={ISTANBUL}
                to={dest.coordinates}
                stroke="#34d399" // emerald-400
                strokeWidth={2}
                strokeLinecap="round"
              >
                {/* Animasyon: SVG dash offset kullanarak kargonun gitmesi efekti */}
                <animate
                  attributeName="stroke-dasharray"
                  values="0 1000; 1000 0"
                  dur={`${3 + index}s`}
                  repeatCount="indefinite"
                />
              </Line>

              {/* Varış Noktası */}
              <Marker coordinates={dest.coordinates}>
                <circle r={3} fill="#10b981" />
                <text textAnchor="middle" y={-8} style={{ fontFamily: "system-ui", fill: "#64748b", fontSize: "8px" }}>
                  {dest.name}
                </text>
              </Marker>
            </g>
          ))}
      </ComposableMap>

      {/* Admin Panel İstatistik Overlay'leri */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-lg flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Ship className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Yoldaki Yükler</p>
            <p className="text-lg font-bold text-white flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : stats.inTransit}
              <span className="text-xs font-normal text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Aktif</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-lg flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Bekleyen / İşlemde</p>
            <p className="text-lg font-bold text-white flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : (stats.pending + stats.reviewing)}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-slate-300">Canlı Bağlantı Aktif</span>
      </div>
    </div>
  );
}
