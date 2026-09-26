'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import WeatherCharts from '../../../components/WeatherCharts';
import AdvisoryCard from '../../../components/AdvisoryCard';
import { fetchPanchayatForecast, fetchAdvisories } from '../../../lib/api';
import { WeatherForecastResponse, Advisory } from '../../../types';
import { MapPin, Thermometer, Droplets, Wind, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

export default function PanchayatDetailPage({ params }: { params: { id: string } }) {
  const panchayatId = parseInt(params.id) || 1;
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);

  useEffect(() => {
    fetchPanchayatForecast(panchayatId).then((fc) => setForecast(fc));
    fetchAdvisories(panchayatId, "Wheat").then((adv) => setAdvisories(adv));
  }, [panchayatId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Panchayat Header */}
        {forecast && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    Gram Panchayat ID: {forecast.panchayat_id}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    DEM Elevation: {forecast.elevation_m}m
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">{forecast.panchayat_name}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Block: {forecast.block_name} | District: {forecast.district_name} | State: Uttar Pradesh
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Confidence Score</span>
                <span className="text-2xl font-black text-emerald-600">{(forecast.current.confidence_score * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block">Temperature</span>
                <span className="text-lg font-bold text-slate-800">{forecast.current.temp_max_c}°C</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block">Humidity</span>
                <span className="text-lg font-bold text-slate-800">{forecast.current.humidity_pct}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block">Precipitation</span>
                <span className="text-lg font-bold text-slate-800">{forecast.current.precipitation_mm}mm</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block">Wind Speed</span>
                <span className="text-lg font-bold text-slate-800">{forecast.current.wind_speed_kmh} km/h</span>
              </div>
            </div>

          </div>
        )}

        {/* Visual Charts */}
        {forecast && <WeatherCharts hourly={forecast.hourly} daily={forecast.daily} />}

        {/* Panchayat Crop Advisories */}
        <div>
          <h3 className="font-bold text-lg text-slate-900 mb-4">Panchayat Microclimate Crop Advisories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.map((adv) => (
              <AdvisoryCard key={adv.id} advisory={adv} />
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
