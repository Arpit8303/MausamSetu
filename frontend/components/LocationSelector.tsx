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
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{t.selectLocation}</span>
          <span className="font-bold text-sm text-slate-800">Uttar Pradesh → Lucknow → Sarojini Nagar</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* State Dropdown */}
        <select className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Uttar Pradesh (उत्तर प्रदेश)</option>
          <option>Maharashtra (महाराष्ट्र)</option>
          <option>Punjab (पंजाब)</option>
        </select>

        {/* District Dropdown */}
        <select className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Lucknow (लखनऊ)</option>
          <option>Pune (पुणे)</option>
        </select>

        {/* Block Dropdown */}
        <select className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Sarojini Nagar (सरोजिनी नगर)</option>
          <option>Chinhat (चिनहट)</option>
        </select>

        {/* Panchayat Dropdown */}
        <select
          onChange={(e) => onPanchayatChange && onPanchayatChange(Number(e.target.value))}
          className="text-xs font-bold bg-emerald-500 text-white border border-emerald-600 rounded-xl px-3.5 py-2 focus:outline-none shadow-sm cursor-pointer"
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
