import React, { useState, useEffect, useCallback } from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Layers,
  MapPin,
  CheckCircle2,
  CheckCheck,
  RefreshCw,
  FileText,
  Ship
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { alertService } from '@/services/alertService';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import type { AlertItem } from '@/types/contract';

export const DisasterManagementPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const [hazards, setHazards] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHazard, setSelectedHazard] = useState<AlertItem | null>(null);
  const [activeHazardDetail, setActiveHazardDetail] = useState<AlertItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    alertService
      .getAlerts({ role: 'DISASTER_MANAGER' })
      .then((items) => {
        if (isMounted) {
          const disasterItems = items.filter(
            (a) => a.severity === 'CRITICAL' || a.severity === 'WARNING' || a.category === 'WEATHER_MARINE' || a.category === 'GIS_SAFETY'
          );
          setHazards(disasterItems);
          if (disasterItems.length > 0) {
            setSelectedHazard((prev) => prev || disasterItems[0]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refetchDisasterHazards = useCallback(() => {
    setLoading(true);
    alertService
      .getAlerts({ role: 'DISASTER_MANAGER' })
      .then((items) => {
        const disasterItems = items.filter(
          (a) => a.severity === 'CRITICAL' || a.severity === 'WARNING' || a.category === 'WEATHER_MARINE' || a.category === 'GIS_SAFETY'
        );
        setHazards(disasterItems);
        if (disasterItems.length > 0) {
          setSelectedHazard((prev) => prev || disasterItems[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleAcknowledge = async (hazardId: string) => {
    try {
      const updated = await alertService.acknowledgeAlert(hazardId, 'DISASTER-OPS-01', 'DISASTER_MANAGER');
      setHazards((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
      if (selectedHazard && selectedHazard.id === updated.id) {
        setSelectedHazard(updated);
      }
    } catch {
      // error handling
    }
  };

  const handleResolve = async (hazardId: string) => {
    try {
      const updated = await alertService.resolveAlert(hazardId, 'DISASTER-OPS-01', 'DISASTER_MANAGER');
      setHazards((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
      if (selectedHazard && selectedHazard.id === updated.id) {
        setSelectedHazard(updated);
      }
    } catch {
      // error handling
    }
  };

  const totalExposedVessels = hazards.reduce((acc, h) => acc + (h.affectedVesselIds?.length || 0), 0);
  const activeHazardsCount = hazards.filter((h) => h.status === 'ACTIVE').length;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D65B5B] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">DISASTER MANAGEMENT AUTHORITY (NDRF / SDMA) • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">
            Coastal Hazard Exposure &amp; Emergency Coordination
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Real-time verified hazard perimeters • Multi-vessel risk exposure • Deterministic safety directives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D65B5B]" />
            <span><strong>{activeHazardsCount}</strong> Active Hazards</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D8E5EC] text-xs text-[#123B5D] shadow-2xs flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#147FB3]" />
            <span><strong>{totalExposedVessels}</strong> Crafts in Exposure Sector</span>
          </div>
          <button
            type="button"
            onClick={refetchDisasterHazards}
            className="p-2 rounded-xl bg-white border border-[#D8E5EC] text-[#587083] hover:text-[#123B5D] transition cursor-pointer shadow-2xs"
            title="Refresh disaster feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#147FB3]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Suggested Layout:
          ACTIVE HAZARDS
          ↓
          MAP
          ↓
          AFFECTED MISSIONS / VESSELS
          ↓
          ALERT DETAIL
          ↓
          EVIDENCE
          ↓
          ACKNOWLEDGE / RESOLVE
      */}

      {/* 2. Active Hazards Ribbon */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#123B5D] uppercase tracking-wider">
          <span>Active Coastal Hazards</span>
          <span className="text-[11px] text-[#7E93A3] normal-case font-normal">Click a hazard to inspect spatial extent &amp; affected assets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {hazards.map((h) => {
            const isSelected = selectedHazard?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => setSelectedHazard(h)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#F8FAFC] border-[#147FB3] ring-1 ring-[#147FB3] shadow-xs'
                    : 'bg-white border-[#D8E5EC] hover:border-[#147FB3]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    h.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {h.severity}
                  </span>
                  <span className="font-mono text-[10px] text-[#7E93A3]">{h.id}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#123B5D] line-clamp-1">
                  {h.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#587083]">
                  <span>{h.affectedArea.name}</span>
                  <span className="text-[#147FB3] font-semibold">{h.affectedVesselIds.length} vessels</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Operational View: Map (Left 7) + Selected Hazard Inspector & Workflow (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Hazard Map Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#D65B5B]" />
                <span>Hazard Spatial Extent &amp; Buffer Perimeter</span>
              </div>
              <span className="text-[10px] text-[#5A7C99] font-mono">
                PostGIS Deterministic Engine • WGS84
              </span>
            </div>

            <div className="h-96 sm:h-[460px] rounded-xl overflow-hidden border border-[#D8E5EC] relative">
              <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />
            </div>

            {selectedHazard && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-wrap items-center justify-between text-xs text-[#587083]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Focused Area: <strong className="text-[#123B5D]">{selectedHazard.affectedArea.name}</strong></span>
                </div>
                <div>
                  Clearance Requirement: <strong>{selectedHazard.affectedArea.bufferMeters ? `${selectedHazard.affectedArea.bufferMeters}m` : 'Standard Maritime Buffer'}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Hazard Detail & Affected Assets */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedHazard ? (
            <div className="bg-white rounded-2xl p-5 border border-[#F8B4B4] shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#D65B5B]" />

              <div className="pl-2 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                    selectedHazard.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-500'
                  }`}>
                    {selectedHazard.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#7E93A3]">{selectedHazard.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#F8FAFC] text-[#587083] border border-[#D8E5EC]">
                    {selectedHazard.status}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#123B5D]">
                  {selectedHazard.title}
                </h3>
              </div>

              {/* Message & Why */}
              <div className="pl-2 flex flex-col gap-2 text-xs">
                <p className="text-[#4A6478] leading-relaxed">
                  {selectedHazard.message}
                </p>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-[#147FB3] uppercase tracking-wider">
                    Deterministic Impact (Why):
                  </span>
                  <p className="text-[#123B5D] font-medium leading-relaxed">
                    {selectedHazard.whyExplanation}
                  </p>
                </div>

                {/* Validity & Area */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#587083]">
                  <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block">Perimeter:</span>
                    <strong className="text-[#123B5D]">{selectedHazard.affectedArea.name}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block">Valid Until:</span>
                    <strong className="text-[#123B5D]">
                      {selectedHazard.validUntil ? new Date(selectedHazard.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST' : 'Continuous'}
                    </strong>
                  </div>
                </div>

                {/* Affected Vessels / Missions */}
                <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-[#123B5D] flex items-center gap-1">
                    <Ship className="w-3.5 h-3.5 text-[#147FB3]" />
                    <span>Exposed Crafts in Perimeter ({selectedHazard.affectedVesselIds.length})</span>
                  </span>
                  {selectedHazard.affectedVesselIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedHazard.affectedVesselIds.map((vId) => (
                        <span key={vId} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF6FC] text-[#147FB3] border border-[#C2E0F0]">
                          {vId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#7E93A3] italic">No active craft in direct exclusion path</span>
                  )}
                </div>

                {/* Advisory Directive */}
                <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[11px] text-[#9B1C1C]">
                  <strong className="block text-[#D65B5B] uppercase text-[10px] font-bold mb-0.5">
                    MANDATORY OPERATIONAL DIRECTIVE:
                  </strong>
                  <span>{selectedHazard.actionRecommendation}</span>
                </div>
              </div>

              {/* Workflow Actions: Acknowledge / Resolve / Audit */}
              <div className="pl-2 pt-2 border-t border-[#E2EDF4] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveHazardDetail(selectedHazard)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#147FB3] border border-[#C2E0F0] hover:bg-[#EBF6FC] transition cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Audit (Level 1-4)</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedHazard.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(selectedHazard.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#147FB3] text-white hover:bg-[#0E5B82] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                  {(selectedHazard.status === 'ACTIVE' || selectedHazard.status === 'ACKNOWLEDGED') && (
                    <button
                      type="button"
                      onClick={() => handleResolve(selectedHazard.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#D8E5EC] text-center text-xs text-[#7E93A3]">
              No active hazard selected.
            </div>
          )}
        </div>
      </div>

      {/* Progressive Disclosure Modal for Deep Audit Trace */}
      {activeHazardDetail && (
        <AlertDetailModal
          alert={activeHazardDetail}
          userRole="DISASTER_MANAGER"
          onClose={() => setActiveHazardDetail(null)}
          onStatusUpdated={(updated) => {
            setHazards((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
            setActiveHazardDetail(updated);
            if (selectedHazard && selectedHazard.id === updated.id) {
              setSelectedHazard(updated);
            }
          }}
        />
      )}
    </div>
  );
};
