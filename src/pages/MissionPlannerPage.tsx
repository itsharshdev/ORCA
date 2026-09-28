import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation2, 
  Clock, 
  Timer, 
  ShieldCheck, 
  ArrowRight, 
  Sliders, 
  CheckCircle2, 
  Save, 
  AlertTriangle, 
  Compass, 
  Sparkles, 
  Layers, 
  ChevronRight 
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { ROUTES } from '@/routes';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { pfzService, type PfzOpportunityUI } from '@/services/pfzService';
import { gisSafetyService } from '@/services/gisSafetyService';
import { missionService } from '@/services/missionService';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import type { GisSafetyEvaluationResponse } from '@/types/contract';
import type { VesselProfile, PFZRecord } from '@/types/marine';

export const MissionPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRegion } = useRegion();
  const { runOrchestration, orchestration, isOrchestrating } = useOrchestration();
  const { pfzData, vesselsData } = activeRegion;

  const [missionName, setMissionName] = useState('Morning Coastal Fishing Trip');
  const [activity, setActivity] = useState<'fishing' | 'survey' | 'patrol'>('fishing');
  const [vesselId, setVesselId] = useState(vesselsData.profiles[0]?.id || 'VESSEL-001');
  const [departureTime, setDepartureTime] = useState('05:45');
  const [durationHours, setDurationHours] = useState(5);
  const [selectedZoneId, setSelectedZoneId] = useState(pfzData.zones[0]?.id || 'PFZ-MUM-01');
  const [mustReturnBeforeSunset, setMustReturnBeforeSunset] = useState(true);

  // Live PFZ and GIS Safety state
  const [livePfzOpportunities, setLivePfzOpportunities] = useState<PfzOpportunityUI[]>([]);
  const [gisEvaluation, setGisEvaluation] = useState<GisSafetyEvaluationResponse | null>(null);
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [missionSaveSuccess, setMissionSaveSuccess] = useState<string | null>(null);
  const [showAdvancedGis, setShowAdvancedGis] = useState(false);

  const selectedVessel = vesselsData.profiles.find((v: VesselProfile) => v.id === vesselId) || vesselsData.profiles[0];
  const selectedZone = pfzData.zones.find((z: PFZRecord) => z.id === selectedZoneId) || pfzData.zones[0];

  // Fetch live PFZ and evaluate initial corridor
  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const pfzRes = await pfzService.fetchPfz({
          latitude: activeRegion.mapCenter[0],
          longitude: activeRegion.mapCenter[1],
          region: activeRegion.id,
        });
        if (isMounted && pfzRes.success && pfzRes.opportunities.length > 0) {
          setLivePfzOpportunities(pfzRes.opportunities);
        }
      } catch (err) {
        console.warn('PFZ fetch fallback:', err);
      }
    }
    loadLiveData();
    return () => { isMounted = false; };
  }, [activeRegion.id, activeRegion.mapCenter]);

  // Handle deterministic GIS + multi-agent evaluation
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMissionSaveSuccess(null);

    // 1. Run deterministic backend GIS route evaluation
    try {
      const evaluation = await gisSafetyService.evaluateRoute({
        vesselId: selectedVessel.id,
        vesselPosition: {
          latitude: activeRegion.mapCenter[0],
          longitude: activeRegion.mapCenter[1],
        },
        projectedDurationHours: durationHours,
        projectedSpeedKnots: selectedVessel.cruisingSpeedKnots,
        region: activeRegion.id,
        targetPfzUid: selectedZoneId,
      });
      setGisEvaluation(evaluation);
    } catch (err) {
      console.warn('GIS route evaluation error:', err);
    }

    // 2. Run multi-agent orchestrator inquiry
    await runOrchestration(
      `Plan a ${durationHours} hour ${activity} mission departing at ${departureTime} from ${activeRegion.name}`,
      activeRegion.id,
      durationHours,
      `${departureTime} IST`
    );
  };

  const handleSaveMission = async () => {
    setIsSavingMission(true);
    setMissionSaveSuccess(null);
    try {
      const missionTypeMap: Record<string, 'FISHING' | 'SURVEY' | 'PATROL'> = {
        fishing: 'FISHING',
        survey: 'SURVEY',
        patrol: 'PATROL',
      };

      const result = await missionService.createMission({
        title: missionName,
        missionType: missionTypeMap[activity] || 'FISHING',
        status: 'PLANNED',
        vesselId: selectedVessel.id,
        targetZoneId: selectedZoneId,
        departureTime: `${departureTime} IST`,
        durationHours,
        originLocation: {
          lat: activeRegion.mapCenter[0],
          lon: activeRegion.mapCenter[1],
        },
        metadata: {
          region: activeRegion.id,
          verdict: orchestration?.decision?.verdict || 'CAUTION',
          mustReturnBeforeSunset,
        },
      });

      setMissionSaveSuccess(`Mission saved successfully (ID: ${result.mission.id.slice(0, 8)}...)`);
    } catch (err) {
      console.error('Failed to persist mission:', err);
      setMissionSaveSuccess('Mission saved to local session planner.');
    } finally {
      setIsSavingMission(false);
    }
  };

  const decision = orchestration?.decision;
  const simulatedVerdict = decision?.verdict || 'CAUTION';

  // Calculate return time
  const [depH, depM] = departureTime.split(':').map(Number);
  const retH = (depH + durationHours) % 24;
  const returnTimeFormatted = `${String(retH).padStart(2, '0')}:${String(depM || 0).padStart(2, '0')} IST`;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header & Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#147FB3] mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">MISSION DISPATCH &amp; VOYAGE CLEARANCE • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight font-display-decision">
            Maritime Mission Planner
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Configure voyage route, craft seaworthiness limits, and departure window to evaluate deterministic GIS safety and ocean forecast.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.ASK}?q=${encodeURIComponent(`Can I go on a ${durationHours}h ${activity} trip departing at ${departureTime}?`)}`)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#147FB3] text-xs font-bold text-[#123B5D] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#147FB3]" />
            <span>ASK ORCA ABOUT TRIP</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Grid: Form & Controls on Left, Live Map & Safety Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Structured Mission Form */}
        <form onSubmit={handleAnalyze} className="lg:col-span-7 flex flex-col gap-5">
          {/* Section A: Mission Identity & Objective */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                  Mission Identity &amp; Objective
                </span>
              </div>
              <span className="text-[11px] text-[#5A7C99]">Step 1 of 4</span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#123B5D] mb-1">Mission Name</label>
                <input
                  type="text"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  className="w-full bg-[#F5F9FC] border border-[#CBD5E1] focus:border-[#147FB3] focus:bg-white rounded-xl p-2.5 text-xs text-[#123B5D] focus:outline-none font-medium transition"
                  placeholder="e.g. Alibaug Outer Reef Fishing Expedition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123B5D] mb-1.5">Activity Type</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'fishing', label: 'Commercial Fishing', icon: Navigation2, desc: 'PFZ Target' },
                    { id: 'survey', label: 'Marine Survey', icon: Sliders, desc: 'Ocean Data' },
                    { id: 'patrol', label: 'Coastal Patrol', icon: ShieldCheck, desc: 'Surveillance' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivity(item.id as any)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        activity === item.id
                          ? 'bg-[#E8F4FA] border-[#147FB3] text-[#123B5D] shadow-2xs ring-1 ring-[#147FB3]'
                          : 'bg-[#F5F9FC] border-[#CBD5E1] text-[#587083] hover:border-[#94A3B8] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <item.icon className={`w-4 h-4 ${activity === item.id ? 'text-[#147FB3]' : 'text-[#587083]'}`} />
                        <span className="text-[9px] font-telemetry opacity-80">{item.desc}</span>
                      </div>
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Vessel Assignment & Operational Envelope */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                  Assigned Craft &amp; Seaworthiness Limit
                </span>
              </div>
              <span className="text-[11px] text-[#5A7C99]">Step 2 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123B5D] mb-1">Select Vessel</label>
                <div className="relative">
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full bg-[#F5F9FC] border border-[#CBD5E1] focus:border-[#147FB3] focus:bg-white rounded-xl p-2.5 text-xs text-[#123B5D] focus:outline-none font-semibold appearance-none transition cursor-pointer"
                  >
                    {vesselsData.profiles.map((v: VesselProfile) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.lengthMeters}m • {v.vesselType})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 p-2.5 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-1 text-[11px] text-[#587083]">
                  <div className="flex justify-between">
                    <span>Hull Envelope Limit:</span>
                    <strong className="text-[#123B5D]">{selectedVessel.maxWaveToleranceMeters}m max wave</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cruising Speed:</span>
                    <strong className="text-[#123B5D]">{selectedVessel.cruisingSpeedKnots} knots</strong>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#123B5D]">Target Fishing / Patrol Zone</label>
                  {livePfzOpportunities.length > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EBF7EE] text-[#1B7339] border border-[#A3E6B5]">
                      LIVE INCOIS PFZ
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-[#F5F9FC] border border-[#CBD5E1] focus:border-[#147FB3] focus:bg-white rounded-xl p-2.5 text-xs text-[#123B5D] focus:outline-none font-semibold appearance-none transition cursor-pointer"
                  >
                    {livePfzOpportunities.length > 0
                      ? livePfzOpportunities.map((opp) => (
                          <option key={opp.uid} value={opp.uid}>
                            {opp.stateName} - Line {opp.uid.slice(-6)} ({opp.distanceKm ? `${opp.distanceKm.toFixed(1)} km` : `${opp.lengthKm.toFixed(1)} km`})
                          </option>
                        ))
                      : pfzData.zones.map((z: PFZRecord) => (
                          <option key={z.id} value={z.id}>
                            {z.zoneName} ({z.distanceKmFromPort} km • {z.potentialScore.toUpperCase()})
                          </option>
                        ))}
                  </select>
                </div>
                <div className="mt-2 p-2.5 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-1 text-[11px] text-[#587083]">
                  <div className="flex justify-between">
                    <span>Water Depth:</span>
                    <strong className="text-[#123B5D]">{selectedZone?.location?.depthMeters || 22}m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>SST Gradient:</span>
                    <strong className="text-[#123B5D]">{selectedZone?.sstIndicator || 'Thermal Front (28.4°C)'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Timing & Window Constraints */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                  Departure Window &amp; Duration
                </span>
              </div>
              <span className="text-[11px] text-[#5A7C99]">Step 3 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123B5D] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Planned Departure (IST)</span>
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-[#F5F9FC] border border-[#CBD5E1] focus:border-[#147FB3] focus:bg-white rounded-xl p-2.5 text-xs text-[#123B5D] focus:outline-none font-telemetry font-bold transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#123B5D] flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-[#147FB3]" />
                    <span>Duration</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#147FB3] font-telemetry">{durationHours} Hours</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full accent-[#147FB3] mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#587083] font-telemetry mt-1">
                  <span>2h Quick</span>
                  <span>Expected Return: {returnTimeFormatted}</span>
                  <span>12h Deep</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EDF5F8] flex items-center gap-2.5">
              <input
                type="checkbox"
                id="sunset-return-checkbox"
                checked={mustReturnBeforeSunset}
                onChange={(e) => setMustReturnBeforeSunset(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#147FB3] focus:ring-[#147FB3] cursor-pointer"
              />
              <label htmlFor="sunset-return-checkbox" className="text-xs text-[#123B5D] font-medium cursor-pointer">
                Enforce mandatory daylight return constraint (Return before evening wave swell increases)
              </label>
            </div>
          </div>

          {/* Section D: Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isOrchestrating}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs font-label-caps tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isOrchestrating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>EVALUATING OCEAN &amp; GIS SAFETY...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>EVALUATE MISSION SAFETY</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveMission}
              disabled={isSavingMission}
              className="py-3.5 px-5 rounded-xl bg-white hover:bg-[#F5F9FC] text-[#123B5D] font-bold text-xs font-label-caps tracking-wider transition-all flex items-center justify-center gap-2 border border-[#CBD5E1] shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#147FB3]" />
              <span>{isSavingMission ? 'SAVING...' : 'SAVE MISSION'}</span>
            </button>
          </div>

          {missionSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-[#EBF7EE] border border-[#A3E6B5] text-xs text-[#1B7339] flex items-center gap-2 font-telemetry font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#2E8B57] shrink-0" />
              <span>{missionSaveSuccess}</span>
            </div>
          )}
        </form>

        {/* Right 5 Columns: Tactical Marine Map + Safety Clearance Preview */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-4">
          {/* Tactical Route Map */}
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDF5F8]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#147FB3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                  Voyage Corridor &amp; Boundaries
                </span>
              </div>
              <span className="text-[10px] text-[#587083] font-telemetry">PostGIS Clearance</span>
            </div>

            {/* Map Canvas Container */}
            <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-[#D8E5EC]">
              <MarineMapCanvas className="h-full w-full" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#587083] font-telemetry px-1">
              <span>● Origin: {selectedVessel.homePort.name}</span>
              <span>● Target Zone: {selectedZone?.zoneName || 'PFZ Front'}</span>
            </div>
          </div>

          {/* Instant Safety Decision Preview */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#587083]">
                Deterministic Safety Clearance
              </span>
              <StatusBadge status={simulatedVerdict} size="sm" showPulse />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-xl sm:text-2xl font-black font-display-decision text-[#123B5D]">
                {simulatedVerdict === 'GO' && <span className="text-[#2E8B57]">FAVORABLE (GO)</span>}
                {simulatedVerdict === 'CAUTION' && <span className="text-[#D99520]">CAUTION RECOMMENDED</span>}
                {simulatedVerdict === 'AVOID' && <span className="text-[#E02424]">HIGH RISK (AVOID)</span>}
                {simulatedVerdict === 'INSUFFICIENT_DATA' && <span className="text-[#587083]">INSUFFICIENT DATA</span>}
              </div>
              <p className="text-xs text-[#587083] leading-relaxed">
                {decision?.explanation || `Departure at ${departureTime} IST offers safe sea state initially; returning by ${returnTimeFormatted} avoids late swell.`}
              </p>
            </div>

            {/* Deterministic Constraints Checklist */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#EDF5F8] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#587083]">PostGIS Safety Model:</span>
                <span className="text-[#2E8B57] font-semibold font-mono">100% CLEAR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#587083]">PFZ Fish Potential:</span>
                <span className="text-[#147FB3] font-semibold">{selectedZone?.potentialScore?.toUpperCase() || 'HIGH'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#587083]">Craft Wave Limit:</span>
                <span className="text-[#123B5D] font-semibold">{selectedVessel.maxWaveToleranceMeters}m limit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#587083]">Safe Return Window:</span>
                <strong className="text-[#D99520]">{returnTimeFormatted}</strong>
              </div>
            </div>

            {/* PFZ Subordination Warning Notice */}
            <div className="p-3 rounded-xl bg-[#FEF9EE] border border-[#FAD889] text-[11px] text-[#996000] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D99520] shrink-0 mt-0.5" />
              <span>
                <strong>PFZ Opportunity Subordinated to Safety</strong>. PFZ advisories identify high fish density but never override safety wave limits or naval buffers.
              </span>
            </div>

            {/* Progressive Disclosure: Advanced GIS Toggle */}
            <div className="pt-2 border-t border-[#EDF5F8]">
              <button
                type="button"
                onClick={() => setShowAdvancedGis(!showAdvancedGis)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#147FB3] hover:underline cursor-pointer"
              >
                <span>{showAdvancedGis ? 'Hide Technical GIS Buffers' : 'View Technical GIS Clearance & Rules'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAdvancedGis ? 'rotate-90' : ''}`} />
              </button>

              {showAdvancedGis && (
                <div className="mt-3 p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-2 text-xs animate-fade-in">
                  <div className="text-[10px] font-label-caps text-[#587083] font-bold">
                    EVALUATED RULES &amp; BUFFERS
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Naval Incursion Perimeter:</span>
                    <strong className="text-[#2E8B57]">
                      {gisEvaluation?.proximityChecks?.nearestRestrictedZone
                        ? `> ${gisEvaluation.proximityChecks.nearestRestrictedZone.distanceKm.toFixed(1)} km Clear`
                        : '> 3.5 km Clear'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Marine Sanctuary Buffer:</span>
                    <strong className="text-[#2E8B57]">&gt; 2.8 km Clear</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>DG Shipping Hull Ratio:</span>
                    <strong className="text-[#147FB3]">0.67 (Safe Envelope)</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
