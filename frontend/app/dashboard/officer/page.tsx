'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RightPanel from '../../../components/RightPanel';
import dynamic from 'next/dynamic';

// Leaflet accesses `window` at module load time — must be loaded client-side only
const WeatherMap = dynamic(() => import('../../../components/WeatherMap'), {
  ssr: false,
  loading: () => <div className="w-full h-64 rounded-2xl bg-slate-100 animate-pulse" />,
});
import LocationSelector from '../../../components/LocationSelector';
import { fetchMLMetrics } from '../../../lib/api';
import { MLMetrics } from '../../../types';
import { useRouter } from 'next/navigation';
import { BarChart3, Filter, FileSpreadsheet, Sparkles, ShieldCheck, User } from 'lucide-react';

export default function OfficerDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchMLMetrics().then((m) => setMetrics(m));

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mausamsetu_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user || (user.role !== 'officer' && user.role !== 'admin')) {
        router.push('/login?redirect=/dashboard/officer');
      }
    }
  }, [router]);

  const tableData = [
    { id: 1, name: "Amausi (अमौसी)", block: "Sarojini Nagar", elev: "128m", bTemp: "32.0°C", pTemp: "31.4°C", anomaly: "-0.6°C", rain: "0.0mm", risk: "LOW" },
    { id: 2, name: "Chillawan (चिल्लावां)", block: "Sarojini Nagar", elev: "122m", bTemp: "32.0°C", pTemp: "32.1°C", anomaly: "+0.1°C", rain: "2.4mm", risk: "MEDIUM" },
    { id: 3, name: "Piparsand (पीपरसंड)", block: "Sarojini Nagar", elev: "135m", bTemp: "32.0°C", pTemp: "30.8°C", anomaly: "-1.2°C", rain: "28.5mm", risk: "HIGH" },
    { id: 4, name: "Mati (माटी)", block: "Chinhat", elev: "132m", bTemp: "31.5°C", pTemp: "31.0°C", anomaly: "-0.5°C", rain: "0.0mm", risk: "LOW" }
  ];

  const filteredData = tableData.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.block.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Panchayat,Block,Elevation,BlockTemp,PanchayatTemp,Anomaly,Rainfall,RiskLevel\n" +
      filteredData.map(e => `${e.name},${e.block},${e.elev},${e.bTemp},${e.pTemp},${e.anomaly},${e.rain},${e.risk}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MausamSetu_Officer_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
        
        {/* Officer Header */}
        <div className="bg-[#075E63] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-teal-800 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-200 text-xs font-semibold mb-3 backdrop-blur-md">
              <BarChart3 className="w-3.5 h-3.5" /> District Agro-Meteorological Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Panchayat Weather Intelligence & Risk Monitor</h1>
            <p className="text-xs text-teal-100 mt-1 max-w-xl">
              Lucknow District Jurisdiction | 2 Blocks | 48 Gram Panchayats Tracked
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-5 py-3 rounded-2xl bg-[#34B27B] hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV Report
            </button>

            {/* Profile Avatar Toggle Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-1 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all border border-white/30 backdrop-blur-md shadow-md flex items-center gap-2 pl-2 pr-3 hover:scale-105"
              title="Open Officer Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow">
                <User className="w-4.5 h-4.5 text-[#075E63]" />
              </div>
              <span className="text-xs font-bold text-white hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>

        {/* Location Dropdown Cascade */}
        <LocationSelector onPanchayatChange={(id) => setSelectedPanchayatId(id)} />

        {/* Interactive Map */}
        <WeatherMap selectedPanchayatId={selectedPanchayatId} onSelectPanchayat={(id) => setSelectedPanchayatId(id)} />

        {/* Block vs Panchayat Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Block vs Downscaled Panchayat Comparison</h3>
              <p className="text-xs text-[#82918E]">Microclimate thermal delta calculation across Sarojini Nagar Block</p>
            </div>

            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter Panchayats..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full bg-slate-100 text-xs focus:ring-2 focus:ring-[#34B27B] focus:outline-none w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[#82918E] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 pl-5">Panchayat Name</th>
                  <th className="p-3.5">Block Name</th>
                  <th className="p-3.5">DEM Elev</th>
                  <th className="p-3.5">Block Forecast</th>
                  <th className="p-3.5">Panchayat Temp</th>
                  <th className="p-3.5">Thermal Anomaly</th>
                  <th className="p-3.5">Rainfall</th>
                  <th className="p-3.5 pr-5">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-slate-800">{row.name}</td>
                    <td className="p-3.5 text-slate-600">{row.block}</td>
                    <td className="p-3.5 font-mono text-slate-500">{row.elev}</td>
                    <td className="p-3.5 text-slate-600 font-mono">{row.bTemp}</td>
                    <td className="p-3.5 font-bold text-[#064E3B] font-mono">{row.pTemp}</td>
                    <td className="p-3.5 font-mono font-semibold text-slate-700">{row.anomaly}</td>
                    <td className="p-3.5 font-mono font-semibold text-[#0284C7]">{row.rain}</td>
                    <td className="p-3.5 pr-5">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        row.risk === 'HIGH' ? 'bg-red-100 text-red-700' : row.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-[#EAF4EC] text-[#064E3B]'
                      }`}>
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Collapsible Right Profile Drawer (Closed by Default) */}
      <RightPanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={{ id: 2, email: 'officer@mausamsetu.in', full_name: 'Priya Verma', role: 'agricultural_officer' }}
        panchayatName="District Command"
        districtName="Lucknow, Uttar Pradesh"
      />
    </DashboardLayout>
  );
}
