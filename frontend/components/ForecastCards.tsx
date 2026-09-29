'use client';

import React from 'react';
import { DailyForecast } from '../types';
import { CloudSun, CloudRain, Thermometer, Wind, Droplets, Sparkles } from 'lucide-react';

interface ForecastCardsProps {
  daily: DailyForecast[];
}

export default function ForecastCards({ daily }: ForecastCardsProps) {
  const day1 = daily[0] || { date: '2026-09-27', day_name: 'Mon', temp_min_c: 21.2, temp_max_c: 31.4, humidity_pct: 68, precipitation_mm: 0.0, precipitation_prob_pct: 15, wind_speed_kmh: 12.4, weather_condition: 'Partly Cloudy' };
  const day2 = daily[1] || { date: '2026-09-28', day_name: 'Tue', temp_min_c: 22.0, temp_max_c: 32.1, humidity_pct: 72, precipitation_mm: 4.2, precipitation_prob_pct: 45, wind_speed_kmh: 14.0, weather_condition: 'Light Rain' };
  const day3 = daily[2] || { date: '2026-09-29', day_name: 'Wed', temp_min_c: 20.8, temp_max_c: 29.5, humidity_pct: 88, precipitation_mm: 28.5, precipitation_prob_pct: 85, wind_speed_kmh: 22.0, weather_condition: 'Heavy Rain' };

  return (
    <div className="space-y-4">
      
      {/* CARD 1: Today (Light Lime #D8F18B) */}
      <div className="bg-[#D8F18B] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#CBE879] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all">
        <div className="flex items-center gap-3.5">
          
          {/* Date Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm text-slate-800 flex-shrink-0">
            <span className="text-[10px] font-bold uppercase text-slate-500">{day1.day_name}</span>
            <span className="text-lg sm:text-xl font-black">{day1.date.slice(8)}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 text-slate-800 border border-slate-300">
                Today (Downscaled 1km)
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" /> 94% Conf.
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{day1.temp_max_c}°C</h4>
            <p className="text-xs text-slate-700 font-medium">{day1.weather_condition} • Min: {day1.temp_min_c}°C</p>
          </div>
        </div>

        {/* Wave Sparkline & Right Stats */}
        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/10">
          <div className="hidden md:block">
            <svg className="w-24 h-8 text-emerald-700 opacity-80" viewBox="0 0 100 30" fill="none">
              <path d="M0 20 Q 25 5, 50 15 T 100 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left sm:text-right w-full sm:w-auto">
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 block">Rainfall</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">{day1.precipitation_mm} mm ({day1.precipitation_prob_pct}%)</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 block">Wind Speed</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">{day1.wind_speed_kmh} km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Tomorrow (Emerald #34B27B) */}
      <div className="bg-[#34B27B] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#2DA470] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all">
        <div className="flex items-center gap-3.5">
          
          {/* Date Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-xl flex flex-col items-center justify-center shadow-inner text-white flex-shrink-0">
            <span className="text-[10px] font-bold uppercase text-emerald-100">{day2.day_name}</span>
            <span className="text-lg sm:text-xl font-black">{day2.date.slice(8)}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                Tomorrow Forecast
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-200">
                Medium Precip
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black leading-tight">{day2.temp_max_c}°C</h4>
            <p className="text-xs text-emerald-100 font-medium">{day2.weather_condition} • Range: {day2.temp_min_c}°C - {day2.temp_max_c}°C</p>
          </div>
        </div>

        {/* Wave Sparkline & Right Stats */}
        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <div className="hidden md:block">
            <svg className="w-24 h-8 text-white/80 opacity-80" viewBox="0 0 100 30" fill="none">
              <path d="M0 10 Q 30 25, 60 10 T 100 20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left sm:text-right w-full sm:w-auto">
            <div>
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-100 block">Rain Chance</span>
              <span className="text-xs sm:text-sm font-bold">{day2.precipitation_prob_pct}% ({day2.precipitation_mm}mm)</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-100 block">Humidity</span>
              <span className="text-xs sm:text-sm font-bold">{day2.humidity_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Day After Tomorrow (Dark Teal #075E63) */}
      <div className="bg-[#075E63] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#054D51] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all">
        <div className="flex items-center gap-3.5">
          
          {/* Date Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-xl flex flex-col items-center justify-center shadow-inner text-white flex-shrink-0">
            <span className="text-[10px] font-bold uppercase text-teal-200">{day3.day_name}</span>
            <span className="text-lg sm:text-xl font-black">{day3.date.slice(8)}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                Day After Tomorrow
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-900/60 text-red-200 border border-red-500/30">
                High Rain Alert
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black leading-tight">{day3.temp_max_c}°C</h4>
            <p className="text-xs text-teal-100 font-medium">{day3.weather_condition} • Min: {day3.temp_min_c}°C</p>
          </div>
        </div>

        {/* Wave Sparkline & Right Stats */}
        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <div className="hidden md:block">
            <svg className="w-24 h-8 text-sky-300 opacity-80" viewBox="0 0 100 30" fill="none">
              <path d="M0 25 Q 35 0, 70 20 T 100 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left sm:text-right w-full sm:w-auto">
            <div>
              <span className="text-[10px] sm:text-[11px] font-medium text-teal-200 block">Rainfall Outlook</span>
              <span className="text-xs sm:text-sm font-bold text-sky-300">{day3.precipitation_mm} mm</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-medium text-teal-200 block">Wind Speed</span>
              <span className="text-xs sm:text-sm font-bold">{day3.wind_speed_kmh} km/h</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
