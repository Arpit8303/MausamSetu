'use client';

import React, { useState } from 'react';
import { Layers, MapPin, Thermometer, CloudRain, ShieldAlert, Sparkles } from 'lucide-react';

interface WeatherMapProps {
  selectedPanchayatId?: number;
  onSelectPanchayat?: (id: number) => void;
}

export default function WeatherMap({ selectedPanchayatId = 1, onSelectPanchayat }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<'rainfall' | 'temp' | 'risk'>('risk');

  // Sample Panchayats around Lucknow / Sarojini Nagar Block with DEM elevation & forecasts
  const samplePanchayats = [
    { id: 1, name: "Amausi (अमौसी)", elev: 128, temp: "31.4°C", rain: "0.0mm", risk: "LOW", color: "#10B981", lat: 26.762, lon: 80.881 },
    { id: 2, name: "Chillawan (चिल्लावां)", elev: 122, temp: "32.1°C", rain: "2.4mm", risk: "MEDIUM", color: "#F59E0B", lat: 26.741, lon: 80.862 },
    { id: 3, name: "Piparsand (पीपरसंड)", elev: 135, temp: "30.8°C", rain: "28.5mm", risk: "HIGH", color: "#EF4444", lat: 26.728, lon: 80.843 },
    { id: 4, name: "Mati (माटी)", elev: 132, temp: "31.0°C", rain: "0.0mm", risk: "LOW", color: "#10B981", lat: 26.892, lon: 81.062 }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm">Interactive Panchayat Geographic Map</span>
          <span className="text-xs text-slate-400 hidden sm:inline">| Sarojini Nagar Block, Lucknow</span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveLayer('risk')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeLayer === 'risk' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 inline mr-1" /> Risk Layer
          </button>
          <button
            onClick={() => setActiveLayer('rainfall')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeLayer === 'rainfall' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 inline mr-1" /> Rainfall
          </button>
          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeLayer === 'temp' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 inline mr-1" /> Temp
          </button>
        </div>
      </div>

      {/* Visual Canvas Representation */}
      <div className="relative h-96 bg-slate-900 overflow-hidden flex items-center justify-center">
        
        {/* OpenStreetMap style background map simulation */}
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://tile.openstreetmap.org/12/2967/1723.png')`
          }}
        />

        {/* Topographic Contour Lines Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <path d="M0,50 Q150,20 300,90 T600,40 T900,120" fill="none" stroke="#10B981" strokeWidth="2" />
          <path d="M0,150 Q200,100 400,180 T800,110" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M0,250 Q250,220 500,290 T1000,240" fill="none" stroke="#F59E0B" strokeWidth="1" />
        </svg>

        {/* Panchayat Pin Cards Overlay */}
        <div className="absolute inset-0 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          {samplePanchayats.map((p) => {
            const isSelected = p.id === selectedPanchayatId;

            return (
              <div
                key={p.id}
                onClick={() => onSelectPanchayat && onSelectPanchayat(p.id)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all transform hover:-translate-y-1 shadow-lg backdrop-blur-md ${
                  isSelected
                    ? 'bg-emerald-950/90 border-2 border-emerald-400 text-white ring-4 ring-emerald-500/20'
                    : 'bg-slate-900/80 border border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-bold text-xs truncate">{p.name}</span>
                  </div>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DEM Elev:</span>
                    <span className="font-mono font-medium">{p.elev}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Downscaled T:</span>
                    <span className="font-mono font-semibold text-emerald-300">{p.temp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Rain:</span>
                    <span className="font-mono font-semibold text-sky-300">{p.rain}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Agri Risk:</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded ${
                      p.risk === 'HIGH' ? 'bg-red-900/80 text-red-300' : p.risk === 'MEDIUM' ? 'bg-amber-900/80 text-amber-300' : 'bg-emerald-900/80 text-emerald-300'
                    }`}
                  >
                    {p.risk}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-3 backdrop-blur-md">
          <span className="text-slate-400 font-medium">Risk Levels:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
        </div>

      </div>
    </div>
  );
}
