'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AdvisoryCard from '../../components/AdvisoryCard';
import LocationSelector from '../../components/LocationSelector';
import { fetchAdvisories } from '../../lib/api';
import { Advisory } from '../../types';
import { Sprout, Filter, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdvisoryCenterPage() {
  const [panchayatId, setPanchayatId] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [stage, setStage] = useState<string>('Flowering Stage');
  const [advisories, setAdvisories] = useState<Advisory[]>([]);

  useEffect(() => {
    fetchAdvisories(panchayatId, selectedCrop).then((adv) => setAdvisories(adv));
  }, [panchayatId, selectedCrop]);

  return (
    <DashboardLayout>
        
        {/* Advisory Header Banner matching AgriConnect */}
        <div className="bg-[#162E21] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3DE] text-[#2D6A4F] text-xs font-bold mb-3">
              <Sprout className="w-3.5 h-3.5" /> AI Agro-Meteorological Advisory Portal
            </div>
            <h1 className="text-3xl font-sans font-bold">Crop Advisory Intelligence Center</h1>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              Synthesizing downscaled weather forecasts with crop phenology, soil hydrology, and official IMD/KVK guidelines.
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <LocationSelector onPanchayatChange={(id) => setPanchayatId(id)} />

        {/* Filter Controls Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#111827] text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2D6A4F]" /> Filter Agronomic Conditions
            </h3>
            <span className="text-xs text-slate-400 font-mono">6 Crops Supported</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-600 mb-1">Target Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F9F9F6] font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              >
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Rice">Rice (धान)</option>
                <option value="Maize">Maize (मक्का)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
                <option value="Pulses">Pulses (दालें)</option>
                <option value="Mustard">Mustard (सरसों)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Growth Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F9F9F6] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              >
                <option value="Flowering Stage">Flowering Stage</option>
                <option value="Tillering / Vegetative">Tillering / Vegetative</option>
                <option value="Grain Filling / Pod Formation">Grain Filling / Pod Formation</option>
                <option value="Harvesting">Harvesting</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Soil Type</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F9F9F6] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                <option>Alluvial Soil (जलोढ़ मिट्टी)</option>
                <option>Black Soil (काली मिट्टी)</option>
                <option>Sandy Loam (बलुई दोमट)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Irrigation Method</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F9F9F6] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                <option>Canal / Tube Well (नहर / ट्यूबवेल)</option>
                <option>Drip / Sprinkler (ड्रिप / स्प्रिंकलर)</option>
                <option>Rainfed Only (वर्षा आधारित)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advisories Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-[#111827]">Active Advisories for {selectedCrop}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.map((adv) => (
              <AdvisoryCard key={adv.id} advisory={adv} />
            ))}
          </div>
        </div>

    </DashboardLayout>
  );
}
