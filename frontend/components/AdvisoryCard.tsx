'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, CloudRain, Cpu, ArrowRight } from 'lucide-react';
import { Advisory } from '../types';
import { Language, translations } from '../lib/i18n';

interface AdvisoryCardProps {
  advisory: Advisory;
  lang?: Language;
}

export default function AdvisoryCard({ advisory, lang = 'en' }: AdvisoryCardProps) {
  const t = translations[lang];

  const isHighRisk = advisory.risk_level === 'HIGH' || advisory.risk_level === 'CRITICAL';
  const isMedRisk = advisory.risk_level === 'MEDIUM';

  const riskBadgeColor = isHighRisk
    ? 'bg-red-50 text-red-700 border-red-200'
    : isMedRisk
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            {advisory.crop_name} ({advisory.growth_stage})
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${riskBadgeColor}`}>
            {advisory.risk_level} RISK
          </span>
        </div>

        {advisory.is_official ? (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> {t.officialBadge}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" /> {t.aiGeneratedBadge}
          </span>
        )}
      </div>

      {/* Advisory Title */}
      <h4 className="font-bold text-slate-800 text-base mb-2">
        {lang === 'hi' && advisory.title_hi ? advisory.title_hi : advisory.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {lang === 'hi' && advisory.description_hi ? advisory.description_hi : advisory.description}
      </p>

      {/* Recommended Action Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-700 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Recommended Action</span>
        </div>
        <p className="text-xs text-slate-800 font-medium leading-relaxed pl-5">
          {lang === 'hi' && advisory.recommended_action_hi ? advisory.recommended_action_hi : advisory.recommended_action}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 gap-2">
        <span className="flex items-center gap-1 font-mono text-slate-500">
          <CloudRain className="w-3.5 h-3.5 text-sky-500" /> {advisory.weather_trigger}
        </span>
        <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
          {t.confidence}: {advisory.confidence_pct}%
        </span>
      </div>

    </div>
  );
}
