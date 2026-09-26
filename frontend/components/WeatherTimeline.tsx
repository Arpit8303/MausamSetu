'use client';

import React from 'react';
import { HourlyForecast } from '../types';
import { Clock, CloudRain, Sun, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface WeatherTimelineProps {
  hourly: HourlyForecast[];
}

export default function WeatherTimeline({ hourly }: WeatherTimelineProps) {
  const events = [
    { time: '09.00', title: 'Optimal Urea Application Window', type: 'good', color: 'bg-[#D8F18B] text-slate-900 border-[#CBE879]', day: 'Mon' },
    { time: '12.00', title: 'Heat Stress Risk (>32°C)', type: 'warning', color: 'bg-[#F59E0B] text-white', day: 'Mon' },
    { time: '15.00', title: 'Light Irrigation Window', type: 'good', color: 'bg-[#34B27B] text-white', day: 'Tue' },
    { time: '18.00', title: 'Postpone Chemical Spraying', type: 'risk', color: 'bg-[#075E63] text-white', day: 'Wed' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Panchayat Weather Timeline</h3>
          <p className="text-[11px] text-[#82918E]">Hourly weather microclimates & risk windows</p>
        </div>
        <span className="text-[11px] font-semibold text-[#064E3B] bg-[#EAF4EC] px-2.5 py-1 rounded-full">
          24h Diurnal
        </span>
      </div>

      {/* Hourly Timeline Axis & Styled Pill Badges */}
      <div className="relative pt-4 pb-2 border-t border-slate-100">
        
        {/* Time Labels Header */}
        <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-semibold text-slate-400 mb-4">
          <span>06.00</span>
          <span>09.00</span>
          <span>12.00</span>
          <span>15.00</span>
          <span>18.00</span>
          <span>21.00</span>
        </div>

        {/* Activity Badges Matching Reference Layout */}
        <div className="space-y-3">
          
          <div className="flex items-center gap-3">
            <span className="w-8 text-[11px] font-bold text-slate-400">Mon</span>
            <div className="flex-1 bg-slate-50 h-9 rounded-2xl relative flex items-center px-2">
              <div className="absolute left-[20%] px-3 py-1 rounded-xl bg-[#D8F18B] text-slate-900 text-[11px] font-bold border border-[#CBE879] shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-700" /> Optimal Urea Application Window
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 text-[11px] font-bold text-slate-400">Tue</span>
            <div className="flex-1 bg-slate-50 h-9 rounded-2xl relative flex items-center px-2">
              <div className="absolute left-[45%] px-3 py-1 rounded-xl bg-[#34B27B] text-white text-[11px] font-bold shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white" /> Light Evening Irrigation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 text-[11px] font-bold text-slate-400">Wed</span>
            <div className="flex-1 bg-slate-50 h-9 rounded-2xl relative flex items-center px-2">
              <div className="absolute left-[30%] px-3 py-1 rounded-xl bg-[#075E63] text-white text-[11px] font-bold shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-300" /> Postpone Pesticide Spraying
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
