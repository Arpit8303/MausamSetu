'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, CloudRain, ShieldAlert } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface WeatherMapProps {
  selectedPanchayatId?: number;
  onSelectPanchayat?: (id: number) => void;
  awsData?: any[];
  darkMode?: boolean;
}

export default function WeatherMap({ selectedPanchayatId = 1, onSelectPanchayat, awsData = [], darkMode = false }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<'risk' | 'rainfall' | 'temp'>('risk');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  let panchayats = [
    { id: 1, name: "Amausi (अमौसी)", elev: 128, temp: "31.4°C", rain: "0.0mm", risk: "LOW", color: "#10B981", lat: 26.762, lon: 80.881 },
    { id: 2, name: "Chillawan (चिल्लावां)", elev: 122, temp: "32.1°C", rain: "2.4mm", risk: "MEDIUM", color: "#F59E0B", lat: 26.741, lon: 80.862 },
    { id: 3, name: "Piparsand (पीपरसंड)", elev: 135, temp: "30.8°C", rain: "28.5mm", risk: "HIGH", color: "#EF4444", lat: 26.728, lon: 80.843 },
    { id: 4, name: "Mati (माटी)", elev: 132, temp: "31.0°C", rain: "0.0mm", risk: "LOW", color: "#10B981", lat: 26.892, lon: 81.062 }
  ];

  if (awsData && awsData.length > 0) {
    panchayats = panchayats.map((p, i) => {
      const aws = awsData[i % awsData.length];
      return { ...p, temp: `${aws.temp_c}°C`, rain: `${aws.rainfall_mm}mm` };
    });
  }

  const centerLat = panchayats[0].lat;
  const centerLon = panchayats[0].lon;

  const controlBarBg = darkMode ? 'bg-slate-950' : 'bg-slate-900';
  const controlBarBorder = 'border-slate-800';
  const layerTabBg = darkMode ? 'bg-slate-900' : 'bg-slate-800';
  const legendBg = darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-900/90 border-slate-700';

  return (
    <div className="rounded-xl overflow-hidden h-full flex flex-col" style={{ border: `1px solid ${darkMode ? 'rgba(56,189,248,0.15)' : '#E2E8F0'}` }}>
      {/* Map Control Bar */}
      <div className={`px-3 py-2.5 ${controlBarBg} text-white flex flex-wrap items-center justify-between gap-2 border-b ${controlBarBorder}`}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-xs">Panchayat Weather Map</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">| Sarojini Nagar Block, Lucknow</span>
        </div>

        <div className={`flex items-center gap-1 ${layerTabBg} p-0.5 rounded-lg text-[10px]`}>
          <button
            onClick={() => setActiveLayer('risk')}
            className={`px-2 py-1 rounded-md font-medium transition-all ${activeLayer === 'risk' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldAlert className="w-3 h-3 inline mr-0.5" /> Risk
          </button>
          <button
            onClick={() => setActiveLayer('rainfall')}
            className={`px-2 py-1 rounded-md font-medium transition-all ${activeLayer === 'rainfall' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <CloudRain className="w-3 h-3 inline mr-0.5" /> Rain
          </button>
          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-2 py-1 rounded-md font-medium transition-all ${activeLayer === 'temp' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Thermometer className="w-3 h-3 inline mr-0.5" /> Temp
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 overflow-hidden min-h-[240px]">
        {isMounted ? (
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={12}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {panchayats.map((p) => {
              const isSelected = p.id === selectedPanchayatId;
              let markerColor = p.color;
              if (activeLayer === 'rainfall') markerColor = '#38BDF8';
              if (activeLayer === 'temp') markerColor = '#F59E0B';

              return (
                <CircleMarker
                  key={p.id}
                  center={[p.lat, p.lon]}
                  pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.7 }}
                  radius={isSelected ? 12 : 8}
                  eventHandlers={{ click: () => onSelectPanchayat && onSelectPanchayat(p.id) }}
                >
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-bold text-sm text-slate-800">{p.name}</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between"><span>Elev:</span><span className="font-medium">{p.elev}m</span></div>
                        <div className="flex justify-between"><span>Temp:</span><span className="font-medium">{p.temp}</span></div>
                        <div className="flex justify-between"><span>Rain:</span><span className="font-medium">{p.rain}</span></div>
                        <div className="flex justify-between font-bold mt-1 pt-1 border-t">
                          <span>Risk:</span>
                          <span className={p.risk === 'HIGH' ? 'text-red-600' : p.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}>{p.risk}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-100">
            <span className="text-slate-400 text-sm">Loading Map...</span>
          </div>
        )}

        {/* Legend Overlay */}
        <div className={`absolute bottom-3 right-3 z-[1000] text-white text-[10px] px-2.5 py-1.5 rounded-lg border flex items-center gap-2.5 backdrop-blur-md ${legendBg}`}>
          <span className="text-slate-400 font-medium">Risk:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
        </div>
      </div>
    </div>
  );
}
