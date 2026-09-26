'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Thermometer, CloudRain } from 'lucide-react';

interface WeatherStatsProps {
  confidenceScore?: number;
  humidityPct?: number;
  precipProb?: number;
  tempAnomaly?: string;
}

export default function WeatherStats({
  confidenceScore = 0.94,
  humidityPct = 68,
  precipProb = 45,
  tempAnomaly = '-0.6°C'
}: WeatherStatsProps) {
  const confidencePct = Math.round(confidenceScore * 100);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Weather Intelligence Stats</h3>
          <p className="text-[11px] text-[#82918E]">AI Downscaled Metrics & Confidence</p>
        </div>
        <span className="p-2 rounded-xl bg-[#EAF4EC] text-[#064E3B]">
          <Sparkles className="w-4 h-4 text-[#34B27B]" />
        </span>
      </div>

      {/* SVG Radial Circular Gauge */}
      <div className="flex flex-col items-center justify-center my-2 relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#EAF4EC"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#34B27B"
              strokeWidth="10"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * confidencePct) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-6 h-6 text-[#34B27B] mb-0.5" />
            <span className="text-xl font-black text-slate-900">{confidencePct}%</span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#82918E]">Precision</span>
          </div>
        </div>
      </div>

      {/* Horizontal Progress Bars */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Rainfall Chance</span>
            <span className="text-[#0284C7]">{precipProb}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#0284C7] h-full rounded-full transition-all" style={{ width: `${precipProb}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Relative Humidity</span>
            <span className="text-slate-800">{humidityPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#34B27B] h-full rounded-full transition-all" style={{ width: `${humidityPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Panchayat Thermal Delta</span>
            <span className="text-[#064E3B] font-mono">{tempAnomaly}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#075E63] h-full rounded-full transition-all" style={{ width: '65%' }} />
          </div>
        </div>

      </div>

    </div>
  );
}
