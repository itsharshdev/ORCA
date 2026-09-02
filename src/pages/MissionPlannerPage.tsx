import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation2, 
  Clock, 
  Timer, 
  ShieldCheck, 
  ArrowRight,
  Sliders
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { ROUTES } from '@/routes';
import { StatusBadge } from '@/components/ui/StatusBadge';
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

  const selectedVessel = vesselsData.profiles.find((v: VesselProfile) => v.id === vesselId) || vesselsData.profiles[0];
  const selectedZone = pfzData.zones.find((z: PFZRecord) => z.id === selectedZoneId) || pfzData.zones[0];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    await runOrchestration(
      `Plan a ${durationHours} hour ${activity} mission departing at ${departureTime}`,
      activeRegion.id,
      durationHours,
      `${departureTime} IST`
    );
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
              <label className="block text-xs font-label-caps text-slate-300 mb-2">
                3. TARGET POTENTIAL ZONE
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                {pfzData.zones.map((z: PFZRecord) => (
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

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isOrchestrating}
            className="w-full py-3.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm font-label-caps tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(70,234,237,0.3)] disabled:opacity-50"
          >
            {isOrchestrating ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>CORRELATING AGENTS &amp; DECISION ENGINE...</span>
              </>
            ) : (
              <>
                <span>RUN MISSION ANALYSIS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Col: Instant Assessment Preview */}
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
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {decision?.explanation || 'Departure at 05:45 gives optimal conditions early, but duration of 5h borders the afternoon chop.'}
              </p>
            </div>

            {/* Constraints Checklist */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-800 text-xs font-telemetry">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-cyan-400 font-semibold">{decision?.confidenceScore || 78.4}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PFZ Potential:</span>
                <span className="text-emerald-400 font-semibold">{selectedZone.potentialScore.toUpperCase()}</span>
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
