import React, { useState } from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { 
  ShieldAlert, 
  Ship, 
  AlertTriangle, 
  Radio, 
  Layers,
  Search
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';

export const AuthorityDashboardPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const [searchTerm, setSearchTerm] = useState('');

  const fleetVessels = [
    {
      id: 'VESSEL-MH-01',
      name: 'Matsya Sagar 1',
      registration: 'IND-MH-02-MM-849',
      type: 'Motorized (8.5m)',
      status: 'UNDERWAY (CAUTION)',
      statusColor: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
      location: '18.92°N, 72.84°E',
      heading: '245° (WSW)',
      speed: '7.8 kts',
      corridorStatus: 'Clear (> 4.2 km from Naval Buffer)',
      incursionRisk: 'LOW',
    },
    {
      id: 'VESSEL-MH-02',
      name: 'Samudra Ratna',
      registration: 'IND-MH-02-MM-120',
      type: 'Deep Sea Mechanized (14m)',
      status: 'PORT DOCKED',
      statusColor: 'text-slate-300 bg-slate-900 border-slate-700',
      location: '18.92°N, 72.84°E',
      heading: '000°',
      speed: '0 kts',
      corridorStatus: 'Berth Clearance Verified',
      incursionRisk: 'NONE',
    },
    {
      id: 'VESSEL-MH-03',
      name: 'Jal Jyoti',
      registration: 'IND-MH-04-AL-551',
      type: 'Motorized (9.2m)',
      status: 'NEAR BOUNDARY (CAUTION)',
      statusColor: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
      location: '18.82°N, 72.78°E',
      heading: '210° (SSW)',
      speed: '8.2 kts',
      corridorStatus: 'Approaching 2.5 km caution perimeter',
      incursionRisk: 'MEDIUM',
    },
  ];

  const incursionAlerts = [
    {
      id: 'INC-2026-0926-01',
      zone: 'Naval & Port Anchorage Security Geofence',
      severity: 'WARNING',
      time: '10:15 IST',
      description: 'Vessel IND-MH-04-AL-551 detected within 2.8 km of restricted security perimeter.',
      status: 'MONITORING',
    },
    {
      id: 'INC-2026-0925-03',
      zone: 'Malvan Marine Sanctuary Buffer',
      severity: 'RESOLVED',
      time: 'Yesterday 16:40 IST',
      description: 'Craft successfully diverted outside 1.0 km biological sanctuary boundary.',
      status: 'CLEARED',
    },
  ];

  const filteredFleet = fleetVessels.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.registration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-blue-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>COASTAL GUARD &amp; MARITIME SURVEILLANCE • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display-decision">
            Maritime Operations &amp; Domain Awareness
          </h1>
          <p className="text-xs text-slate-400">
            Active AIS telemetry • Spatial geofence compliance • Surveillance sector: {activeRegion.seaBody}
          </p>
        </div>

        {/* Operational Statistics Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span><strong>3</strong> Tracked Crafts</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span><strong>1</strong> Proximity Watch</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map (Left 7 Cols) + Fleet Operations Panel (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Surveillance Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="hud-glass rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-label-caps">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Active Surveillance Sector Map</span>
              </div>
              <span className="text-[10px] font-telemetry text-slate-400">
                WGS84 • PostGIS Real-time Geofence
              </span>
            </div>

            <div className="h-96 sm:h-[480px] rounded-xl overflow-hidden border border-slate-800/80 relative">
              <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />
            </div>
          </div>
        </div>

        {/* Fleet Roster & Incursion Monitoring */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Active Fleet Roster */}
          <div className="hud-glass rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase font-label-caps">
                  Tracked Operational Crafts
                </h3>
              </div>
              <span className="text-[10px] font-telemetry text-slate-400">
                {filteredFleet.length} Crafts Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by craft name or registration ID..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Vessel List */}
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredFleet.map((craft) => (
                <div
                  key={craft.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5 text-xs hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white">{craft.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{craft.registration} • {craft.type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${craft.statusColor}`}>
                      {craft.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-telemetry pt-1 border-t border-slate-800/60">
                    <span className="text-slate-300">Pos: {craft.location}</span>
                    <span className="text-right text-slate-300">Hdg: {craft.heading} ({craft.speed})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{craft.corridorStatus}</span>
                    <span className={craft.incursionRisk === 'MEDIUM' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      Risk: {craft.incursionRisk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incursion Alert Log */}
          <div className="hud-glass rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase font-label-caps">
                  Restricted Zone Security Log
                </h3>
              </div>
              <span className="text-[10px] font-telemetry text-slate-400">PostGIS Geofence</span>
            </div>

            <div className="flex flex-col gap-2">
              {incursionAlerts.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{inc.zone}</span>
                    <span className="text-[10px] text-slate-400 font-telemetry">{inc.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{inc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
