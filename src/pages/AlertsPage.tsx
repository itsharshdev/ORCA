import React, { useState } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Database, Compass } from 'lucide-react';
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
      action: 'Truthful data status active (DEMO / ACCESS PENDING).',
    },
  ];

  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.category === filter);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'WARNING':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'INFO':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'DATA':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D8E5EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-[#147FB3] mb-1 font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>OPERATIONAL SAFETY &amp; ADVISORY NOTICES • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] tracking-tight font-display-decision">
            Maritime Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-[#587083]">
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
            className={`px-4 py-1.5 rounded-xl text-xs font-label-caps transition cursor-pointer ${
              filter === cat
                ? 'bg-[#147FB3] text-white font-bold shadow-xs'
                : 'bg-white text-[#587083] hover:text-[#123B5D] border border-[#D8E5EC]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-3.5">
        {filtered.map((alt) => (
          <div
            key={alt.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3 transition hover:border-[#147FB3]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl border mt-0.5 ${getCategoryBadge(alt.category)}`}>
                  {alt.category === 'CRITICAL' && <ShieldAlert className="w-5 h-5 text-rose-600" />}
                  {alt.category === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {alt.category === 'INFO' && <Compass className="w-5 h-5 text-blue-600" />}
                  {alt.category === 'DATA' && <Database className="w-5 h-5 text-purple-600" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getCategoryBadge(alt.category)}`}>
                      {alt.category}
                    </span>
                    <span className="text-[11px] font-telemetry text-[#7E93A3]">{alt.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#123B5D] font-display-decision">
                    {alt.title}
                  </h3>
                </div>
              </div>

              <div className="text-right text-[11px] font-telemetry text-[#587083] shrink-0">
                <span>{alt.time}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#587083] leading-relaxed pl-12 font-medium">
              {alt.description}
            </p>

            <div className="pl-12 pt-2 border-t border-[#EDF5F8] flex flex-wrap items-center justify-between text-xs text-[#587083] gap-2">
              <div>
                <strong>Source:</strong> {alt.source}
              </div>
              <div className="text-[#147FB3] font-semibold">
                <strong>Mandatory Action:</strong> {alt.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
