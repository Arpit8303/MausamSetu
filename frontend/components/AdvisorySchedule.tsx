'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldAlert, CheckCircle2, ChevronRight, Droplets, Bug } from 'lucide-react';
import { Advisory } from '../types';

interface AdvisoryScheduleProps {
  advisories: Advisory[];
}

export default function AdvisorySchedule({ advisories }: AdvisoryScheduleProps) {
  const displayAdvisories = advisories.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Upcoming Advisory Schedule</h3>
            <p className="text-[11px] text-[#82918E]">Agronomic tasks linked to forecast triggers</p>
          </div>
          <span className="p-2 rounded-xl bg-[#EAF4EC] text-[#064E3B]">
            <Sprout className="w-4 h-4 text-[#34B27B]" />
          </span>
        </div>

        {/* Schedule List Items */}
        <div className="space-y-4">
          {displayAdvisories.map((adv, idx) => (
            <div key={adv.id || idx} className="flex items-center justify-between gap-3 group hover:bg-slate-50 p-2.5 rounded-2xl transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  adv.risk_level === 'HIGH' ? 'bg-red-50 text-red-600' : adv.risk_level === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-[#EAF4EC] text-[#064E3B]'
                }`}>
                  {idx === 0 ? <Droplets className="w-5 h-5" /> : idx === 1 ? <Bug className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-[#064E3B] transition-colors">
                    {adv.title}
                  </h4>
                  <span className="text-[10px] text-[#82918E] block">
                    {adv.crop_name} • {adv.growth_stage}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold font-mono text-slate-400 flex-shrink-0">
                09:30 AM
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dark Teal Pill Button "See All Advisories" */}
      <Link
        href="/advisories"
        className="w-full py-3 rounded-2xl bg-[#075E63] hover:bg-[#064E3B] text-white font-bold text-xs shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
      >
        <span>See All Advisories</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
