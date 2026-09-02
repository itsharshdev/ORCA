import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataFreshnessBadge } from '@/components/ui/DataFreshnessBadge';
import { FileCheck2 } from 'lucide-react';
import { pfzData, weatherData, oceanData, hazardsData, boundariesData } from '@/data';

export const DecisionsPage: React.FC = () => {
  const evidenceRows = [
    {
      parameter: 'Potential Fishing Zone (Zone Alpha)',
      source: pfzData.metadata.source,
      value: 'High Potential • Chlorophyll 1.82 mg/m³',
      role: 'Drives primary fishing opportunity score (+ Positive Factor)',
      status: pfzData.metadata.status,
      timestamp: pfzData.metadata.updatedAt,
    },
    {
      parameter: 'Offshore Wave Swell Forecast',
      source: weatherData.metadata.source,
      value: `${weatherData.currentConditions.waveHeightMeters}m Swell (Morning) &rarr; 2.1m (Post-12:00)`,
      role: 'Restricts safe operating window to morning hours (! Cautionary Factor)',
      status: weatherData.metadata.status,
      timestamp: weatherData.metadata.updatedAt,
    },
    {
      parameter: 'Sea Surface Temperature Gradient',
      source: oceanData.metadata.source,
      value: `${oceanData.parameters.seaSurfaceTemperatureCelsius}°C (Favorable thermal boundary)`,
      role: 'Corroborates pelagic aggregation around Alibaug bank (+ Positive Factor)',
      status: oceanData.metadata.status,
      timestamp: oceanData.metadata.updatedAt,
    },
    {
      parameter: 'Naval Security Geofence Clearance',
      source: boundariesData.metadata.source,
      value: '4.2 km Clearance along planned transit line',
      role: 'Deterministic geometry check passes without incursion (&check; Safe Corridor)',
      status: boundariesData.metadata.status,
      timestamp: boundariesData.metadata.updatedAt,
    },
    {
      parameter: 'Severe Coastal Weather Warnings',
      source: hazardsData.metadata.source,
      value: hazardsData.alerts[0].title,
      role: 'Requires small craft to return to harbor before 13:00 IST (! Override Constraint)',
      status: hazardsData.metadata.status,
      timestamp: hazardsData.metadata.updatedAt,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXPLAINABLE AI & EVIDENCE
            </span>
            <span className="text-xs text-slate-400 font-telemetry">PROVENANCE LOG #DEC-20260902-01</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Decision Evidence & Reasoning Chain
          </h1>
          <p className="text-xs text-slate-400">
            Transparent breakdown of inputs, safety constraints, and algorithmic evidence behind the current recommendation.
          </p>
        </div>

        <DataFreshnessBadge status="demo_snapshot" />
      </div>

      {/* Decision Summary Hero Banner */}
      <div className="hud-glass rounded-2xl p-6 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#f1c40f]" />

        <div className="flex-1 pl-2">
          <div className="text-[11px] font-label-caps text-slate-400 mb-1">
            VERDICT DETERMINATION
          </div>
          <div className="flex items-center gap-3">
            <h2 className="font-display-decision text-3xl sm:text-4xl font-extrabold text-[#f1c40f]">
              CAUTION
            </h2>
            <StatusBadge status="CAUTION" size="md" showPulse />
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Overall trip feasible between <strong>05:45 and 11:30 IST</strong>. Fishing potential in Zone Alpha is high, but deterministic safety rules restrict the return transit window due to squall advisory and rising 2.1m swell after midday.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-label-caps text-slate-400 block">ALGORITHMIC CONFIDENCE</span>
            <span className="font-display-decision text-3xl font-extrabold text-cyan-400">78.4%</span>
          </div>
          <div className="text-xs font-telemetry text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800">
            5 of 5 Required Datasets Verified
          </div>
        </div>
      </div>

      {/* Structured Evidence Provenance Table */}
      <div className="hud-glass rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold font-label-caps text-slate-200">
              CROSS-SOURCE EVIDENCE AUDIT
            </h3>
          </div>
          <span className="text-[10px] font-telemetry text-slate-400">
            ZERO HALLUCINATION SAFETY LAYER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-label-caps text-slate-400 font-bold">
              <tr>
                <th className="p-3">OBSERVATION PARAMETER</th>
                <th className="p-3">DATA SOURCE & PROVENANCE</th>
                <th className="p-3">OBSERVED VALUE</th>
                <th className="p-3">DECISION ROLE & IMPACT</th>
                <th className="p-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-telemetry text-slate-300">
              {evidenceRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-200 font-sans">{row.parameter}</td>
                  <td className="p-3 text-[11px] text-cyan-400">{row.source}</td>
                  <td className="p-3 text-[11px] text-slate-300">{row.value}</td>
                  <td className="p-3 text-[11px] text-slate-400 font-sans">{row.role}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-label-caps">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
