'use client';

import React, { useState, useEffect } from 'react';
import { Leaf, MapPin, Eye, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface NDVIMapProps {
  selectedPanchayatId?: number;
  lat: number;
  lon: number;
  tileUrl?: string | null;
  avgNdvi?: number;
  darkMode?: boolean;
}

export default function NDVIMap({ 
  selectedPanchayatId = 1, 
  lat, 
  lon,
  tileUrl,
  avgNdvi,
  darkMode = false
}: NDVIMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simple insights derived client-side based on NDVI value
  const getNdviInsight = (ndvi?: number) => {
    if (ndvi === undefined || ndvi === null) return "No recent satellite data available to compute insights.";
    if (ndvi > 0.6) return "High vegetation health detected. Crop growth is vigorous and normal.";
    if (ndvi >= 0.3) return "Moderate vegetation. Monitor for signs of water stress or nutrient deficiency.";
    return "Low vegetation detected. Immediate attention required for potential crop failure or barren land.";
  };

  const getNdviColor = (ndvi?: number) => {
    if (ndvi === undefined || ndvi === null) return "text-slate-400";
    if (ndvi > 0.6) return "text-emerald-500";
    if (ndvi >= 0.3) return "text-amber-500";
    return "text-red-500";
  };

  const markerIcon = isMounted ? L.divIcon({
    className: 'bg-transparent',
    html: `<div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md animate-pulse"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }) : null;

  // Dark mode styles — only for surrounding UI, not the map itself
  const controlBarBg = darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800';
  const insightsBg = darkMode ? 'bg-[#0A1628] border-slate-800' : 'bg-white border-slate-100';
  const insightsText = darkMode ? 'text-slate-300' : 'text-slate-600';
  const insightsTitleColor = darkMode ? 'text-slate-200' : 'text-slate-800';
  const legendBg = darkMode ? 'bg-slate-950/90 border-slate-700 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-800';

  return (
    <div className="rounded-xl overflow-hidden h-full flex flex-col" style={{ border: `1px solid ${darkMode ? 'rgba(52,211,153,0.15)' : '#E2E8F0'}` }}>
      {/* Map Control Bar */}
      <div className={`px-3 py-2.5 ${controlBarBg} text-white flex flex-wrap items-center justify-between gap-2 border-b`}>
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-xs">NDVI Satellite Map</span>
        </div>
        
        <div className={`flex items-center gap-1.5 ${darkMode ? 'bg-slate-900' : 'bg-slate-800'} px-2.5 py-1 rounded-lg text-[10px]`}>
          <Eye className="w-3 h-3 text-slate-400" />
          <span className="font-medium text-slate-300">Sentinel-2</span>
        </div>
      </div>

      {/* Visual Canvas Representation */}
      <div className="relative flex-1 overflow-hidden min-h-[240px]">
        {isMounted ? (
          <MapContainer 
            center={[lat, lon]} 
            zoom={13} 
            className="h-full w-full z-0"
            zoomControl={false}
          >
            {/* Base Map — light base always for readability */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* NDVI Overlay TileLayer from GEE */}
            {tileUrl && (
              <TileLayer
                url={tileUrl}
                opacity={0.7}
              />
            )}

            <Marker position={[lat, lon]} icon={markerIcon as L.DivIcon}>
              <Popup>
                <div className="text-center font-semibold text-slate-700">
                  Target Panchayat Area
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className={`h-full w-full flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
            <span className="text-slate-400 text-sm">Loading Satellite Data...</span>
          </div>
        )}

        {/* NDVI Legend Overlay */}
        <div className={`absolute top-2 right-2 z-[1000] text-[10px] px-2 py-2 rounded-lg border shadow-sm backdrop-blur-md w-28 ${legendBg}`}>
          <div className="font-bold mb-1.5 flex justify-between">
            <span>NDVI</span>
            <span>{avgNdvi !== undefined ? avgNdvi.toFixed(2) : '-'}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-600 mb-1" />
          <div className="flex justify-between text-[9px] font-medium" style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
      </div>

      {/* NDVI Insights Footer */}
      <div className={`p-3 border-t ${insightsBg}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <Activity className={`w-4 h-4 ${getNdviColor(avgNdvi)}`} />
          <h4 className={`font-bold text-xs ${insightsTitleColor}`}>NDVI Insights</h4>
        </div>
        <p className={`text-[11px] leading-relaxed pl-6 ${insightsText}`}>
          {getNdviInsight(avgNdvi)}
        </p>
      </div>
    </div>
  );
}
