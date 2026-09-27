import React, { useState, useEffect } from 'react';
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
import { alertService } from '@/services/alertService';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import type { AlertItem } from '@/types/contract';

export const AuthorityDashboardPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const [searchTerm, setSearchTerm] = useState('');
  const [incursionAlerts, setIncursionAlerts] = useState<AlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    alertService
      .getAlerts({ category: 'GIS_SAFETY', role: 'COASTAL_AUTHORITY' })
      .then((items) => setIncursionAlerts(items))
      .catch(() => {});
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      const updated = await alertService.acknowledgeAlert(id, 'AUTH-OFFICER-01', 'COASTAL_AUTHORITY');
      setIncursionAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (selectedAlert?.id === updated.id) setSelectedAlert(updated);
    } catch {
      // error handling
    }
  };

  const fleetVessels = [
    {
      id: 'VESSEL-MH-01',
      name: 'Matsya Sagar 1',
      registration: 'IND-MH-02-MM-849',
      type: 'Motorized (8.5m)',
      status: 'UNDERWAY (CAUTION)',
      statusColor: 'text-[#D99520] bg-[#FEF9EE] border-[#FAD889]',
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
      statusColor: 'text-[#5A7C99] bg-[#F5F9FC] border-[#D8E5EC]',
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
      statusColor: 'text-[#D99520] bg-[#FEF9EE] border-[#FAD889]',
      location: '18.82°N, 72.78°E',
      heading: '210° (SSW)',
      speed: '8.2 kts',
      corridorStatus: 'Approaching 2.5 km caution perimeter',
      incursionRisk: 'MEDIUM',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#147FB3] mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">COASTAL GUARD &amp; MARITIME SURVEILLANCE • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">
            Maritime Operations &amp; Domain Awareness
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Active AIS telemetry • Spatial geofence compliance • Surveillance sector: {activeRegion.seaBody}
          </p>
        </div>

        {/* Operational Statistics Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D8E5EC] text-xs text-[#123B5D] shadow-sm flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#2E8B57] animate-pulse" />
            <span><strong>3</strong> Tracked Crafts</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FEF9EE] border border-[#FAD889] text-xs text-[#996000] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D99520]" />
            <span><strong>1</strong> Proximity Watch</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map (Left 7 Cols) + Fleet Operations Panel (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Surveillance Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#147FB3]" />
                <span>Active Surveillance Sector Map</span>
              </div>
              <span className="text-[10px] text-[#5A7C99]">
                WGS84 • PostGIS Real-time Geofence
              </span>
            </div>

            <div className="h-96 sm:h-[480px] rounded-xl overflow-hidden border border-[#D8E5EC] relative">
              <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />
            </div>
          </div>
        </div>

        {/* Fleet Roster & Incursion Monitoring */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Active Fleet Roster */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-2.5">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-[#147FB3]" />
                <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Tracked Operational Crafts
                </h3>
              </div>
              <span className="text-[10px] text-[#5A7C99]">
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
                className="w-full bg-[#F9FCFE] border border-[#D8E5EC] focus:border-[#147FB3] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[#123B5D] placeholder:text-[#88A4BC] focus:outline-none transition"
              />
              <Search className="w-3.5 h-3.5 text-[#5A7C99] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Vessel List */}
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredFleet.map((craft) => (
                <div
                  key={craft.id}
                  className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1.5 text-xs hover:border-[#147FB3] transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#123B5D]">{craft.name}</div>
                      <div className="text-[10px] text-[#5A7C99] font-mono">{craft.registration} • {craft.type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${craft.statusColor}`}>
                      {craft.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#E2EDF4]">
                    <span className="text-[#5A7C99]">Pos: {craft.location}</span>
                    <span className="text-right text-[#5A7C99]">Hdg: {craft.heading} ({craft.speed})</span>
                  </div>
                  <div className="text-[10px] text-[#5A7C99] flex items-center justify-between">
                    <span>{craft.corridorStatus}</span>
                    <span className={craft.incursionRisk === 'MEDIUM' ? 'text-[#D99520] font-bold' : 'text-[#2E8B57] font-semibold'}>
                      Risk: {craft.incursionRisk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incursion Alert Log */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#D99520]" />
                <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Restricted Zone Security Log
                </h3>
              </div>
              <span className="text-[10px] text-[#5A7C99]">PostGIS Geofence</span>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {incursionAlerts.length === 0 ? (
                <div className="text-xs text-[#7E93A3] text-center py-4">No active boundary incursion alerts.</div>
              ) : (
                incursionAlerts.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1.5 text-xs hover:border-[#147FB3] transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#123B5D]">{inc.affectedArea.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-500'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A7C99] leading-relaxed">{inc.message}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E2EDF4] text-[10px]">
                      <span className="text-[#7E93A3]">Status: <strong>{inc.status}</strong></span>
                      <div className="flex items-center gap-1.5">
                        {inc.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledge(inc.id)}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100"
                          >
                            Ack
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedAlert(inc)}
                          className="px-2 py-0.5 rounded bg-[#147FB3] text-white font-bold hover:bg-[#0E5B82]"
                        >
                          Audit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          userRole="COASTAL_AUTHORITY"
          onClose={() => setSelectedAlert(null)}
          onStatusUpdated={(updated) => {
            setIncursionAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setSelectedAlert(updated);
          }}
        />
      )}
    </div>
  );
};

