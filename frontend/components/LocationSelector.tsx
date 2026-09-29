'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { translations, Language } from '../lib/i18n';

interface LocationSelectorProps {
  lang?: Language;
  onPanchayatChange?: (panchayatId: number) => void;
}

export default function LocationSelector({ lang = 'en', onPanchayatChange }: LocationSelectorProps) {
  const t = translations[lang];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{t.selectLocation}</span>
          <span className="font-bold text-xs sm:text-sm text-slate-800">Uttar Pradesh → Lucknow → Sarojini Nagar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {/* State Dropdown */}
        <select className="w-full lg:w-auto text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[150px]">
          <option>Uttar Pradesh (उत्तर प्रदेश)</option>
          <option>Maharashtra (महाराष्ट्र)</option>
          <option>Punjab (पंजाब)</option>
        </select>

        {/* District Dropdown */}
        <select className="w-full lg:w-auto text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[140px]">
          <option>Lucknow (लखनऊ)</option>
          <option>Pune (पुणे)</option>
        </select>

        {/* Block Dropdown */}
        <select className="w-full lg:w-auto text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[160px]">
          <option>Sarojini Nagar (सरोजिनी नगर)</option>
          <option>Chinhat (चिनहट)</option>
        </select>

        {/* Panchayat Dropdown */}
        <select
          onChange={(e) => onPanchayatChange && onPanchayatChange(Number(e.target.value))}
          className="w-full lg:w-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 rounded-xl px-3.5 py-2 focus:outline-none shadow-sm cursor-pointer min-w-[170px]"
        >
          <option value={1}>Amausi Panchayat (अमौसी)</option>
          <option value={2}>Chillawan Panchayat (चिल्लावां)</option>
          <option value={3}>Piparsand Panchayat (पीपरसंड)</option>
          <option value={4}>Mati Panchayat (माटी)</option>
        </select>
      </div>
    </div>
  );
}
