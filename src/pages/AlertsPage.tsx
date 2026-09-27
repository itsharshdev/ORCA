import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';

export const AlertsPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO' | 'DATA'>('ALL');

  const alerts = [
    {
      id: 'ALT-2026-001',
      category: 'CRITICAL',
      title: 'Afternoon Wave Swell Deterioration Hazard',
      description: 'Significant wave swell increases from 0.9m to > 2.1m beyond 12:00 IST. Small crafts advised to return before 11:30 IST.',
      source: 'INCOIS OSF / IMD Marine',
      time: 'Today 06:00 IST',
      validUntil: 'Today 18:00 IST',
      action: 'Plan morning voyage window only.',
    },
    {
      id: 'ALT-2026-002',
      category: 'WARNING',
      title: 'Naval & Port Anchorage Proximity Warning',
      description: 'Naval security geofence perimeter located 4.2 km northwest of planned departure corridor. Entry strictly forbidden.',
      source: 'ORCA PostGIS Safety Engine',
      time: 'Continuous Geofence',
      validUntil: 'Permanent Rule',
      action: 'Maintain minimum 1.0 km buffer clearance.',
    },
    {
      id: 'ALT-2026-003',
      category: 'INFO',
      title: 'High Potential Fishing Zone (PFZ) Front Detected',
      description: 'Satellite thermal/chlorophyll gradient identified 18.5 km WSW of Sassoon Docks. High biological aggregation potential.',
      source: 'INCOIS PFZ GeoServer (Live WFS)',
      time: 'Advisory: 25 Sep 2026',
      validUntil: '28 Sep 2026',
      action: 'Ecological opportunity signal. Verify wave/weather clearance before transit.',
    },
    {
      id: 'ALT-2026-004',
      category: 'DATA',
      title: 'IMD Marine Gateway Access Pending (Phase 9.2)',
      description: 'IMD official institutional API key integration pending. System running calibrated fallback snapshot.',
      source: 'IMD API Gateway Audit',
      time: 'Verified 26 Sep',
      validUntil: 'Pending MoU',
      action: 'Zero-hallucination transparency active.',
    },
  ];

  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.category === filter);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INFO':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'DATA':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-cyan-400 mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>OPERATIONAL SAFETY &amp; ADVISORY NOTICES • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display-decision">
            Maritime Alert Center
          </h1>
          <p className="text-xs text-slate-400">
            Authoritative multi-agency advisories, navigational constraints, and data feed integrity alerts
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'CRITICAL', 'WARNING', 'INFO', 'DATA'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-label-caps transition ${
              filter === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="flex flex-col gap-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`hud-glass rounded-2xl p-4 sm:p-5 border flex flex-col gap-3 relative overflow-hidden transition shadow-lg ${
              item.category === 'CRITICAL'
                ? 'border-rose-500/40 bg-rose-950/10'
                : item.category === 'WARNING'
                ? 'border-amber-500/40 bg-amber-950/10'
                : 'border-slate-800 bg-[#071424]/80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase border ${getCategoryBadge(item.category)}`}>
                  {item.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-display-decision">
                  {item.title}
                </h3>
              </div>

              <span className="text-[10px] font-telemetry text-slate-400 shrink-0">
                {item.time}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {item.description}
            </p>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <strong className="text-cyan-300 text-[10px] font-label-caps uppercase mr-1">
                  ACTION:
                </strong>
                {item.action}
              </div>
              <div className="text-[10px] text-slate-400 font-telemetry shrink-0 hidden sm:block">
                Valid: {item.validUntil}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-telemetry text-slate-500 pt-1 border-t border-slate-800/60">
              <span>Source: {item.source}</span>
              <span>Ref: #{item.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
