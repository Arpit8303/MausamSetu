'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { HourlyForecast, DailyForecast } from '../types';

interface WeatherChartsProps {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export default function WeatherCharts({ hourly, daily }: WeatherChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 24-Hour Temperature Curve */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">24-Hour Panchayat Diurnal Temperature Curve</h3>
            <p className="text-xs text-slate-500">Downscaled hourly temperature variation (°C)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            High-Res 1km
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D3B2E', color: '#FFF', borderRadius: '12px', border: 'none' }}
                labelStyle={{ color: '#34D399', fontWeight: 'bold' }}
                formatter={(val: any) => [`${val} °C`, 'Temperature']}
              />
              <Area type="monotone" dataKey="temp_c" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Rainfall & Precipitation Probability */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">7-Day Downscaled Rainfall & Probability</h3>
            <p className="text-xs text-slate-500">Expected precipitation (mm) and rain chance (%)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
            Precipitation
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day_name" stroke="#64748B" fontSize={11} />
              <YAxis yAxisId="left" stroke="#0284C7" fontSize={11} label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D3B2E', color: '#FFF', borderRadius: '12px', border: 'none' }}
                labelStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="precipitation_mm" name="Rainfall (mm)" fill="#0284C7" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="precipitation_prob_pct" name="Rain Chance (%)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
