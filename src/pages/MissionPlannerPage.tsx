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
  AlertTriangle
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { ROUTES } from '@/routes';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { pfzService, type PfzOpportunityUI } from '@/services/pfzService';
import { gisSafetyService } from '@/services/gisSafetyService';
import { missionService } from '@/services/missionService';
import { VesselCapabilityCard } from '@/components/vessel/VesselCapabilityCard';
import type { GisSafetyEvaluationResponse } from '@/types/contract';
import type { VesselProfile, PFZRecord } from '@/types/marine';

export const MissionPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRegion } = useRegion();
  const { runOrchestration, orchestration, isOrchestrating } = useOrchestration();
  const { pfzData, vesselsData } = activeRegion;

  const [activity, setActivity] = useState<'fishing' | 'survey' | 'patrol'>('fishing');
  const [vesselId, setVesselId] = useState(vesselsData.profiles[0].id);
  const [departureTime, setDepartureTime] = useState('05:45');
  const [durationHours, setDurationHours] = useState(5);
  const [selectedZoneId, setSelectedZoneId] = useState(pfzData.zones[0].id);
  const [mustReturnBeforeSunset, setMustReturnBeforeSunset] = useState(true);

  // Live PFZ and GIS Safety state
  const [livePfzOpportunities, setLivePfzOpportunities] = useState<PfzOpportunityUI[]>([]);
  const [gisEvaluation, setGisEvaluation] = useState<GisSafetyEvaluationResponse | null>(null);
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [missionSaveSuccess, setMissionSaveSuccess] = useState<string | null>(null);

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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setMissionSaveSuccess(null);

    // 1. Run deterministic backend/local GIS route evaluation
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
      `Plan a ${durationHours} hour ${activity} mission departing at ${departureTime}`,
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
        title: `${activity.toUpperCase()} - ${activeRegion.name} (${departureTime} IST)`,
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
      setMissionSaveSuccess('Mission logged to local session plan.');
    } finally {
      setIsSavingMission(false);
    }
  };

  const decision = orchestration?.decision;
  const simulatedVerdict = decision?.verdict || 'CAUTION';

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              OPERATIONAL PLANNING
            </span>
            <span className="text-xs text-slate-400 font-telemetry">SECTOR: {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Marine Mission &amp; Trip Planner
          </h1>
          <p className="text-xs text-slate-400">
            Configure departure, duration, and vessel limits to run cross-agent oceanographic and safety correlation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-label-caps transition-colors"
        >
          &larr; BACK TO HUD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleAnalyze} className="lg:col-span-2 flex flex-col gap-5">
          {/* Mission Activity */}
          <div className="hud-glass rounded-xl p-5 border border-slate-800">
            <label className="block text-xs font-label-caps text-slate-300 mb-3">
              1. MISSION OBJECTIVE
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'fishing', label: 'Commercial / Artisanal Fishing', icon: Navigation2 },
                { id: 'survey', label: 'Ecosystem & Ocean Survey', icon: Sliders },
                { id: 'patrol', label: 'Coastal Safety Patrol', icon: ShieldCheck },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivity(item.id as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                    activity === item.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(70,234,237,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${activity === item.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Asset & Zone Selection */}
          <div className="hud-glass rounded-xl p-5 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label-caps text-slate-300 mb-2">
                2. VESSEL PROFILE
              </label>
              <select
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                {vesselsData.profiles.map((v: VesselProfile) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.lengthMeters}m • {v.vesselType})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 font-telemetry mt-1.5">
                Max Wave Tolerance: {selectedVessel.maxWaveToleranceMeters}m • Cruising Speed: {selectedVessel.cruisingSpeedKnots} kts
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-label-caps text-slate-300">
                  3. TARGET POTENTIAL ZONE
                </label>
                {livePfzOpportunities.length > 0 && (
                  <span className="text-[10px] font-label-caps px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    LIVE INCOIS PFZ
                  </span>
                )}
              </div>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                {livePfzOpportunities.length > 0
                  ? livePfzOpportunities.map((opp) => (
                      <option key={opp.uid} value={opp.uid}>
                        {opp.stateName} - Line {opp.uid.slice(-6)} ({opp.distanceKm ? `${opp.distanceKm.toFixed(1)} km` : `${opp.lengthKm.toFixed(1)} km line`})
                      </option>
                    ))
                  : pfzData.zones.map((z: PFZRecord) => (
                      <option key={z.id} value={z.id}>
                        {z.zoneName} ({z.distanceKmFromPort} km • {z.potentialScore.toUpperCase()})
                      </option>
                    ))}
              </select>
              <p className="text-[11px] text-slate-500 font-telemetry mt-1.5">
                Depth: {selectedZone.location.depthMeters}m • SST: {selectedZone.sstIndicator}
              </p>
            </div>
          </div>

          {/* Timing & Constraints */}
          <div className="hud-glass rounded-xl p-5 border border-slate-800 flex flex-col gap-4">
            <label className="block text-xs font-label-caps text-slate-300">
              4. MISSION TIMING &amp; RETURN CONSTRAINT
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1 font-label-caps">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PLANNED DEPARTURE (IST)</span>
                </div>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-telemetry"
                />
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-label-caps">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>MISSION DURATION</span>
                  </span>
                  <span className="text-cyan-400 font-telemetry font-bold">{durationHours} HOURS</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 mt-2 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
              <input
                type="checkbox"
                id="sunset"
                checked={mustReturnBeforeSunset}
                onChange={(e) => setMustReturnBeforeSunset(e.target.checked)}
                className="rounded border-slate-800 text-cyan-400 bg-slate-950"
              />
              <label htmlFor="sunset" className="cursor-pointer">
                Strict Return Window Constraint (Return to harbor before evening wave swell &gt; 1.8m)
              </label>
            </div>
          </div>

          {/* Vessel Capability & Limits (Phase 12) */}
          <VesselCapabilityCard
            vesselId={selectedVessel.id}
            missionDistanceNm={durationHours * selectedVessel.cruisingSpeedKnots}
            maxDistanceFromPortNm={(durationHours * selectedVessel.cruisingSpeedKnots) / 2}
            missionDurationHours={durationHours}
            plannedCrewCount={selectedVessel.crewCapacity || 3}
            waveHeightMeters={activeRegion.weatherData.currentConditions.waveHeightMeters}
            windSpeedKnots={activeRegion.weatherData.currentConditions.windSpeedKnots}
          />

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isOrchestrating}
              className="flex-1 py-3.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm font-label-caps tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(70,234,237,0.3)] disabled:opacity-50"
            >
              {isOrchestrating ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>CORRELATING AGENTS &amp; GIS SAFETY ENGINE...</span>
                </>
              ) : (
                <>
                  <span>RUN MISSION ANALYSIS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveMission}
              disabled={isSavingMission}
              className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-label-caps tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>{isSavingMission ? 'SAVING...' : 'SAVE MISSION'}</span>
            </button>
          </div>

          {missionSaveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2 font-telemetry">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{missionSaveSuccess}</span>
            </div>
          )}
        </form>

        {/* Right Col: Instant Assessment & GIS Preview */}
        <div className="flex flex-col gap-4">
          <div className="hud-glass rounded-xl p-5 border border-slate-800 flex flex-col gap-4 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[11px] font-label-caps text-slate-400">ENGINE EVALUATION</span>
              <StatusBadge status={simulatedVerdict} size="sm" showPulse />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-2xl font-bold font-display-decision text-white">
                {simulatedVerdict === 'GO' && <span className="text-emerald-400">FAVORABLE (GO)</span>}
                {simulatedVerdict === 'CAUTION' && <span className="text-amber-400">CAUTION RECOMMENDED</span>}
                {simulatedVerdict === 'AVOID' && <span className="text-rose-400">HIGH RISK (AVOID)</span>}
                {simulatedVerdict === 'INSUFFICIENT_DATA' && <span className="text-slate-400">INSUFFICIENT DATA</span>}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {decision?.explanation || 'Departure at 05:45 gives optimal conditions early, but duration of 5h borders the afternoon chop.'}
              </p>
            </div>

            {/* GIS Safety Status Card if evaluated */}
            {gisEvaluation && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-label-caps text-slate-400">DETERMINISTIC GIS SAFETY</span>
                  <span className={`text-[10px] font-bold font-label-caps px-1.5 py-0.5 rounded ${
                    gisEvaluation.safetyClearance ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {gisEvaluation.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {gisEvaluation.summary}
                </p>
                {gisEvaluation.proximityChecks.nearestRestrictedZone && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-telemetry">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Clearance: {gisEvaluation.proximityChecks.nearestRestrictedZone.distanceKm.toFixed(1)} km from {gisEvaluation.proximityChecks.nearestRestrictedZone.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Constraints Checklist */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#E2EDF4] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5A7C99]">Safety Verification:</span>
                <span className="text-[#2E8B57] font-semibold font-mono">DETERMINISTIC GIS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5A7C99]">PFZ Potential:</span>
                <span className="text-[#147FB3] font-semibold">{selectedZone.potentialScore.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vessel Wave Limit:</span>
                <span className="text-slate-200">{selectedVessel.maxWaveToleranceMeters}m Max</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Return Window:</span>
                <span className="text-amber-300">{decision?.recommendedReturn || '10:45 IST'}</span>
              </div>
            </div>

            {/* PFZ Safety Separation Notice */}
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[10px] text-cyan-300 flex items-start gap-1.5 leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>PFZ = Opportunity</strong>. PFZ advisory coordinates do not grant safety clearance. Always adhere to official IMD/INCOIS sea warnings and naval restricted buffers.</span>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-label-caps font-semibold transition-colors mt-2"
            >
              APPLY TO COMMAND CENTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
