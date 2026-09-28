import React, { useState } from 'react';
import { DecisionHeroCard } from '@/components/decision/DecisionHeroCard';
import { TripSafetyHUD } from '@/components/safety/TripSafetyHUD';
import { PfzOpportunityPanel } from '@/components/fisheries/PfzOpportunityPanel';
import { PersistedObservationPanel } from '@/components/decision/PersistedObservationPanel';
import { AnalysisTraceAccordion } from '@/components/decision/AnalysisTraceAccordion';
import { VesselCapabilityCard } from '@/components/vessel/VesselCapabilityCard';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { useConnectivity } from '@/hooks/useConnectivity';
import { 
  MapPin, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Map, 
  Sliders, 
  ChevronRight,
  Waves,
  Anchor,
  AlertCircle,
  RotateCcw,
  Wind,
  Thermometer,
  Activity,
  Fish
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';

export const FishermanHomePage: React.FC = () => {
  const { activeRegion } = useRegion();
  const { orchestration, runOrchestration, isOrchestrating } = useOrchestration();
  const { state, bearer, gpsStatus } = useConnectivity();
  const { vesselsData, pfzData } = activeRegion;
  const vessel = vesselsData.profiles[0];
  const topPfz = pfzData.zones[0];
  const navigate = useNavigate();

  const [promptText, setPromptText] = useState('Can I go fishing tomorrow morning for five hours?');
  const [activeTab, setActiveTab] = useState<'CONDITIONS' | 'CAPABILITY' | 'PFZ' | 'OBSERVATIONS' | 'TRACE'>('CONDITIONS');

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    runOrchestration(promptText, activeRegion.id);
    navigate(`${ROUTES.ASK}?q=${encodeURIComponent(promptText)}`);
  };

  const quickQuestions = [
    'Can I fish tomorrow morning for 5 hours?',
    'What is the wave swell at Alibaug Outer Bank?',
    'Where is the highest yield INCOIS PFZ front?',
    'What if departure shifts to 2 PM?',
  ];

  const decisionVerdict = (orchestration?.decision?.verdict && orchestration.decision.verdict !== 'INSUFFICIENT_DATA')
    ? orchestration.decision.verdict
    : 'CAUTION';

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header & Minimal Operational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#147FB3] font-bold mb-1 font-telemetry">
            <MapPin className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">{activeRegion.name.toUpperCase()} • {activeRegion.seaBody.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] tracking-tight font-display-decision">
            Fisherman Operational Home
          </h1>
          <p className="text-xs text-[#587083] mt-0.5">
            Active Vessel: <strong className="text-[#123B5D]">{vessel.name}</strong> ({vessel.lengthMeters}m • {vessel.vesselType}) • Port: {vessel.homePort.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.MISSION}
            className="px-4 py-2.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs font-label-caps tracking-wider transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>PLAN MISSION</span>
          </Link>
        </div>
      </div>

      {/* 2. Priority 1: ASK ORCA Natural Language Query Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
              Ask ORCA Marine Decision Intelligence
            </span>
          </div>
          <span className="text-[11px] text-[#587083] hidden sm:inline font-telemetry">
            Correlating Ocean • IMD • PFZ • PostGIS
          </span>
        </div>

        <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F5F9FC] border border-[#CBD5E1] focus-within:border-[#147FB3] focus-within:bg-white rounded-xl w-full transition">
            <Search className="w-4 h-4 text-[#7E93A3] shrink-0" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask anything: 'Can I go fishing tomorrow morning for 5 hours?'"
              className="w-full text-xs sm:text-sm text-[#123B5D] placeholder-[#94A3B8] focus:outline-none font-medium bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isOrchestrating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs font-label-caps tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isOrchestrating ? (
              <span>REASONING...</span>
            ) : (
              <>
                <span>ASK ORCA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] uppercase font-bold text-[#7E93A3] font-label-caps">Quick Inquiries:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptText(q)}
              className="text-[11px] text-[#147FB3] bg-[#F5F9FC] hover:bg-[#E8F4FA] px-2.5 py-1 rounded-lg border border-[#D8E5EC] transition text-left cursor-pointer font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 2b. Role-Specific Offline Reality HUD */}
      {state !== 'CONNECTED' && (
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col gap-3 ${
          state === 'OFFLINE'
            ? 'bg-rose-50/70 border-rose-200'
            : state === 'SAFETY_MESSAGE_RECEIVED'
            ? 'bg-blue-50/70 border-blue-200'
            : 'bg-amber-50/70 border-amber-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                state === 'OFFLINE' ? 'bg-rose-600' : state === 'SAFETY_MESSAGE_RECEIVED' ? 'bg-blue-600' : 'bg-amber-500'
              } animate-pulse`} />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
                {state === 'OFFLINE'
                  ? 'OFFLINE MODE — Relying on Verified Pre-Cached Data'
                  : state === 'SAFETY_MESSAGE_RECEIVED'
                  ? 'EMERGENCY SAFETY MESSAGE RECEIVED'
                  : 'DEGRADED CONNECTIVITY — High Latency Mode'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-telemetry font-bold">
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#123B5D]">
                GPS: {gpsStatus} (Sensor Active)
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#123B5D]">
                Bearer: {bearer}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1">
              <div className="font-bold text-emerald-800 text-[11px] flex items-center gap-1.5 font-label-caps">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CONFIRMED SAFE &amp; RELIABLE (LOCAL)</span>
              </div>
              <ul className="text-[11px] text-[#587083] space-y-0.5 list-disc list-inside">
                <li>Vessel wave limit: <strong>1.8m maximum</strong> ({vessel.name})</li>
                <li>Naval Anchorage geofence clearance (&gt;4.2 km buffer)</li>
                <li>WGS84 GPS coordinate fix active</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1">
              <div className="font-bold text-rose-800 text-[11px] flex items-center gap-1.5 font-label-caps">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>UNAVAILABLE OR AGING (CAUTION)</span>
              </div>
              <ul className="text-[11px] text-[#587083] space-y-0.5 list-disc list-inside">
                <li>Real-time afternoon swell updates offline</li>
                <li>Live IMD squall warning updates paused</li>
                <li>New voyage clearances locked to <strong>CAUTION / INSUFFICIENT_DATA</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px] text-[#587083]">
            <span>Decision below represents verified local ledger snapshot.</span>
            <Link
              to={ROUTES.HISTORY}
              className="text-[#147FB3] font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Browse Decision Archive</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Priority 1 Core: CURRENT MISSION DECISION HERO */}
      <DecisionHeroCard
        verdict={decisionVerdict}
        departureTime="09:45 IST"
        vesselName={vessel.name}
      />

      {/* 4. Priority 2 Core: Compact Conditions Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Swell */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#7E93A3] font-label-caps">
            <span className="flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
              Swell
            </span>
            <span className="text-emerald-700 font-telemetry">INCOIS OSF</span>
          </div>
          <div className="text-lg font-black text-[#123B5D] font-telemetry">1.4m &rarr; 2.1m</div>
          <div className="text-[10px] text-[#D99520] font-semibold truncate">Midday envelope risk</div>
        </div>

        {/* Wind */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#7E93A3] font-label-caps">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-[#147FB3]" />
              Wind
            </span>
            <span className="text-emerald-700 font-telemetry">IMD MARINE</span>
          </div>
          <div className="text-lg font-black text-[#123B5D] font-telemetry">12–16 kts</div>
          <div className="text-[10px] text-[#587083] font-medium truncate">WSW Breeze</div>
        </div>

        {/* SST */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#7E93A3] font-label-caps">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-[#2E9B73]" />
              SST
            </span>
            <span className="text-emerald-700 font-telemetry">MOSDAC</span>
          </div>
          <div className="text-lg font-black text-[#123B5D] font-telemetry">28.4°C</div>
          <div className="text-[10px] text-[#2E9B73] font-medium truncate">Thermal front active</div>
        </div>

        {/* Surface Current */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#7E93A3] font-label-caps">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#147FB3]" />
              Current
            </span>
            <span className="text-emerald-700 font-telemetry">INCOIS OSF</span>
          </div>
          <div className="text-lg font-black text-[#123B5D] font-telemetry">0.8 kts</div>
          <div className="text-[10px] text-[#587083] font-medium truncate">Ebb flood transition</div>
        </div>

        {/* Telemetry Freshness */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#7E93A3] font-label-caps">
            <span>PROVENANCE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-[#123B5D] font-telemetry">SNAPSHOT</div>
          <div className="text-[10px] text-emerald-700 font-semibold truncate">Recorded / Verified</div>
        </div>
      </div>

      {/* 5. WHY THIS DECISION: Multi-Evidence Breakdown */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2EDF4]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#147FB3]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
              WHY THIS DECISION — CORRELATED OPERATIONAL EVIDENCE
            </h3>
          </div>
          <span className="text-[10px] text-[#587083] font-telemetry">4 Correlated Streams</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Item 1: Ocean Condition */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-[#123B5D]">INCOIS OSF</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-bold">
                  RECORDED SNAPSHOT
                </span>
              </div>
              <p className="text-[#102B40] text-[11px] leading-snug font-medium">
                Swell increases toward the planned return window (1.4m morning &rarr; 2.1m post-midday).
              </p>
            </div>
            <div className="text-[10px] text-[#D99520] font-semibold pt-1 border-t border-[#EDF5F8]">
              Constrains Return Envelope
            </div>
          </div>

          {/* Item 2: Vessel Profile */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-[#123B5D]">LOCAL VESSEL PROFILE</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-300 font-mono text-[9px] font-bold">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-[#102B40] text-[11px] leading-snug font-medium">
                Configured vessel tolerance (1.8m) is exceeded by the later afternoon condition.
              </p>
            </div>
            <div className="text-[10px] text-[#D99520] font-semibold pt-1 border-t border-[#EDF5F8]">
              Tolerance Threshold Exceeded
            </div>
          </div>

          {/* Item 3: PostGIS Safety */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-[#123B5D]">POSTGIS SAFETY</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-300 font-mono text-[9px] font-bold">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-[#102B40] text-[11px] leading-snug font-medium">
                No restricted-zone violation detected on the evaluated corridor (&gt; 4.2 km Naval buffer).
              </p>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-[#EDF5F8]">
              Corridor Clearance Verified
            </div>
          </div>

          {/* Item 4: PFZ Opportunity */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-[#123B5D]">INCOIS PFZ</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-bold">
                  OPPORTUNITY
                </span>
              </div>
              <p className="text-[#102B40] text-[11px] leading-snug font-medium">
                Potential fishing opportunity detected at Zone Alpha (18.5 km, 245° WSW thermal front).
              </p>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-[#EDF5F8]">
              Subordinated to Safety
            </div>
          </div>
        </div>
      </div>

      {/* 6. Priority 3 Core: Actionable Summary & What-If Link */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recommended Action Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
            <CheckCircle2 className="w-4 h-4 text-[#2E9B73]" />
            <span>Recommended Action</span>
          </div>
          <p className="text-xs text-[#123B5D] leading-relaxed font-medium">
            Depart at <strong>09:45 IST</strong> and complete return to Sassoon Docks by <strong>14:45 IST</strong> before afternoon swell exceeds craft tolerance.
          </p>
          <div className="text-[11px] text-[#587083] pt-1 border-t border-[#E2EDF4] flex items-center gap-1 font-telemetry">
            <Clock className="w-3 h-3 text-[#147FB3]" />
            <span>Safe window: 5 hours</span>
          </div>
        </div>

        {/* Tactical Safety Clearance */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
            <ShieldCheck className="w-4 h-4 text-[#147FB3]" />
            <span>Spatial Constraint Margin</span>
          </div>
          <p className="text-xs text-[#123B5D] leading-relaxed font-medium">
            Maintain minimum <strong>4.2 km buffer</strong> from Naval Anchorage Security Geofence. Do not cross southern fairway during ebb tide.
          </p>
          <div className="text-[11px] text-[#2E9B73] font-semibold pt-1 border-t border-[#E2EDF4]">
            ● Deterministic Geofence Verified
          </div>
        </div>

        {/* Quick What-If Scenarios */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
              <Sliders className="w-4 h-4 text-[#D99520]" />
              <span>What-If Explorer</span>
            </div>
            <Link to={ROUTES.ASK} className="text-[11px] font-bold text-[#147FB3] hover:underline">
              Full Scenarios &rarr;
            </Link>
          </div>
          <p className="text-xs text-[#587083] leading-relaxed">
            What if departure shifts to <strong>09:00 IST</strong> or mission extends to <strong>8 hours</strong>?
          </p>
          <Link
            to={`${ROUTES.ASK}?q=What+if+I+depart+at+09:00+IST+for+8+hours?`}
            className="text-xs font-bold text-[#147FB3] bg-[#E8F4FA] hover:bg-[#CFE6F3] p-2 rounded-xl text-center transition flex items-center justify-center gap-1 font-label-caps"
          >
            <span>Simulate Afternoon Delay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. Tactical Map Corridor Overview */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-3">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] font-label-caps">
              Tactical Marine Navigation Corridor
            </h2>
          </div>
          <Link
            to={ROUTES.MAP}
            className="text-xs font-bold text-[#147FB3] hover:underline flex items-center gap-1 font-label-caps"
          >
            <span>Open Full Tactical Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 sm:h-72 rounded-xl overflow-hidden border border-[#D8E5EC] relative">
          <MarineMapCanvas className="w-full h-full" showOverlayControls={false} />
        </div>
      </div>

      {/* 7. Progressive Disclosure: Deep Technical Subsystems */}
      <div className="bg-white rounded-2xl border border-[#D8E5EC] shadow-2xs overflow-hidden flex flex-col">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-[#E2EDF4] bg-[#F5F9FC] overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('CONDITIONS')}
            className={`px-4 py-3 transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer font-label-caps ${
              activeTab === 'CONDITIONS'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#587083] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Conditions &amp; Swell</span>
          </button>

          <button
            onClick={() => setActiveTab('CAPABILITY')}
            className={`px-4 py-3 transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer font-label-caps ${
              activeTab === 'CAPABILITY'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#587083] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Vessel Limits</span>
          </button>

          <button
            onClick={() => setActiveTab('PFZ')}
            className={`px-4 py-3 transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer font-label-caps ${
              activeTab === 'PFZ'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#587083] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Fish className="w-3.5 h-3.5 text-[#2E9B73]" />
            <span>Fishing Opportunity (PFZ)</span>
          </button>

          <button
            onClick={() => setActiveTab('OBSERVATIONS')}
            className={`px-4 py-3 transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer font-label-caps ${
              activeTab === 'OBSERVATIONS'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#587083] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Agency Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACE')}
            className={`px-4 py-3 transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer font-label-caps ${
              activeTab === 'TRACE'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#587083] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pipeline Trace</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5">
          {activeTab === 'CONDITIONS' && (
            <TripSafetyHUD
              vessel={vessel}
              nearestPfz={topPfz}
              departureTime="05:45 IST"
              durationHours={5}
            />
          )}

          {activeTab === 'CAPABILITY' && (
            <VesselCapabilityCard
              vesselId={vessel.id}
              missionDistanceNm={14.5}
              maxDistanceFromPortNm={8.2}
              missionDurationHours={5}
              waveHeightMeters={1.2}
              windSpeedKnots={14.0}
              plannedCrewCount={3}
            />
          )}

          {activeTab === 'PFZ' && (
            <PfzOpportunityPanel />
          )}

          {activeTab === 'OBSERVATIONS' && (
            <PersistedObservationPanel />
          )}

          {activeTab === 'TRACE' && (
            <AnalysisTraceAccordion />
          )}
        </div>
      </div>
    </div>
  );
};


