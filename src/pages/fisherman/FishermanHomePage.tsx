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
  RotateCcw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';

export const FishermanHomePage: React.FC = () => {
  const { activeRegion } = useRegion();
  const { runOrchestration, isOrchestrating } = useOrchestration();
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
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header & Minimal Operational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#147FB3] font-bold mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">{activeRegion.name} • {activeRegion.seaBody}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D] tracking-tight">
            Fisherman Operational Home
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Target Craft: <strong className="text-[#123B5D]">{vessel.name}</strong> ({vessel.vesselType}) • Home Port: {vessel.homePort.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.MISSION}
            className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>PLAN MISSION</span>
          </Link>
        </div>
      </div>

      {/* 2. Priority 1: ASK ORCA Natural Language Query Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF5FA] text-[#147FB3] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Ask ORCA Marine Intelligence
            </span>
          </div>
          <span className="text-[11px] text-[#5A7C99] hidden sm:inline">
            Natural language marine synthesis
          </span>
        </div>

        <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-[#F9FCFE] border border-[#D8E5EC] focus-within:border-[#147FB3] rounded-xl w-full transition">
            <Search className="w-4 h-4 text-[#88A4BC] shrink-0" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask anything: 'Can I go fishing tomorrow morning for 5 hours?'"
              className="w-full text-xs sm:text-sm text-[#123B5D] placeholder-[#88A4BC] focus:outline-none font-medium bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isOrchestrating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
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
          <span className="text-[10px] uppercase font-bold text-[#88A4BC]">Examples:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptText(q)}
              className="text-[11px] text-[#147FB3] bg-[#F0F7FB] hover:bg-[#EAF5FA] px-2.5 py-1 rounded-lg border border-[#D8E5EC] transition text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 2b. Role-Specific Offline Reality HUD (Step 11) */}
      {state !== 'CONNECTED' && (
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col gap-3 ${
          state === 'OFFLINE'
            ? 'bg-rose-50/60 border-rose-200'
            : state === 'SAFETY_MESSAGE_RECEIVED'
            ? 'bg-purple-50/60 border-purple-200'
            : 'bg-amber-50/60 border-amber-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                state === 'OFFLINE' ? 'bg-rose-600' : state === 'SAFETY_MESSAGE_RECEIVED' ? 'bg-purple-600' : 'bg-amber-500'
              } animate-pulse`} />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#123B5D]">
                {state === 'OFFLINE'
                  ? 'OFFLINE MODE — What Can You Safely Rely On Right Now?'
                  : state === 'SAFETY_MESSAGE_RECEIVED'
                  ? 'EMERGENCY SAFETY MESSAGE RECEIVED'
                  : 'DEGRADED CONNECTIVITY — Relying on Verified Pre-Cached Data'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#123B5D]">
                GPS: {gpsStatus} (Sensor Active)
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#123B5D]">
                Transport: {bearer}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1">
              <div className="font-bold text-emerald-800 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CONFIRMED SAFE &amp; RELIABLE (LOCAL)</span>
              </div>
              <ul className="text-[11px] text-[#4A6478] space-y-0.5 list-disc list-inside">
                <li>Vessel wave limit: <strong>1.8m maximum</strong> (Matsya Sagar 1 hull)</li>
                <li>Naval Anchorage geofence clearance (&gt;4.2 km buffer)</li>
                <li>WGS84 GPS coordinate location (hardware fix active)</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1">
              <div className="font-bold text-rose-800 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>UNAVAILABLE OR AGING (CAUTION)</span>
              </div>
              <ul className="text-[11px] text-[#4A6478] space-y-0.5 list-disc list-inside">
                <li>Real-time afternoon swell updates offline</li>
                <li>Live IMD squall warning updates paused</li>
                <li>New trip clearance locked to <strong>INSUFFICIENT_DATA</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px] text-[#587083]">
            <span>Decision below represents last cached replay. Do not assume live telemetry.</span>
            <Link
              to={ROUTES.HISTORY}
              className="text-[#147FB3] font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Browse Cached Decision Archive</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Priority 2 & 3: CURRENT DECISION + Plain Language Rationale */}
      <DecisionHeroCard
        verdict="CAUTION"
        departureTime="05:45 IST"
        vesselName={vessel.name}
      />

      {/* 4. Priority 4: Actionable Summary & What-If Link */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recommended Action Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B5D]">
            <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
            <span>Recommended Action</span>
          </div>
          <p className="text-xs text-[#123B5D] leading-relaxed font-medium">
            Depart at <strong>05:45 IST</strong> and complete return to Sassoon Docks by <strong>11:30 IST</strong> before afternoon swell exceeds craft tolerance.
          </p>
          <div className="text-[11px] text-[#5A7C99] pt-1 border-t border-[#E2EDF4] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#147FB3]" />
            <span>Favorable window: 5 hours 45 mins</span>
          </div>
        </div>

        {/* Tactical Safety Clearance */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B5D]">
            <ShieldCheck className="w-4 h-4 text-[#147FB3]" />
            <span>Spatial Constraint Margin</span>
          </div>
          <p className="text-xs text-[#123B5D] leading-relaxed font-medium">
            Maintain minimum <strong>4.2 km buffer</strong> from Naval Anchorage Security Geofence. Do not cross southern fairway during ebb tide.
          </p>
          <div className="text-[11px] text-[#2E8B57] font-semibold pt-1 border-t border-[#E2EDF4]">
            ● Deterministic Geofence Verified
          </div>
        </div>

        {/* Quick What-If Scenarios */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              <Sliders className="w-4 h-4 text-[#D99520]" />
              <span>What-If Explorer</span>
            </div>
            <Link to={ROUTES.ASK} className="text-[11px] font-bold text-[#147FB3] hover:underline">
              Full Scenarios &rarr;
            </Link>
          </div>
          <p className="text-xs text-[#5A7C99] leading-relaxed">
            What if departure shifts to <strong>09:00 IST</strong> or mission extends to <strong>8 hours</strong>?
          </p>
          <Link
            to={`${ROUTES.ASK}?q=What+if+I+depart+at+09:00+IST+for+8+hours?`}
            className="text-xs font-bold text-[#147FB3] bg-[#EAF5FA] hover:bg-[#DDF0F8] p-2 rounded-xl text-center transition flex items-center justify-center gap-1"
          >
            <span>Simulate Afternoon Delay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Priority 5: Tactical Map Overview */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-3">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Tactical Marine Map &amp; Navigation Corridor
            </h2>
          </div>
          <Link
            to={ROUTES.MAP}
            className="text-xs font-bold text-[#147FB3] hover:underline flex items-center gap-1"
          >
            <span>Open Full Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 sm:h-72 rounded-xl overflow-hidden border border-[#D8E5EC] relative">
          <MarineMapCanvas className="w-full h-full" showOverlayControls={false} />
        </div>
      </div>

      {/* 6. Progressive Disclosure: Deep Technical Subsystems */}
      <div className="bg-white rounded-2xl border border-[#D8E5EC] shadow-sm overflow-hidden flex flex-col">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-[#E2EDF4] bg-[#F9FCFE] overflow-x-auto">
          <button
            onClick={() => setActiveTab('CONDITIONS')}
            className={`px-4 py-3 text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'CONDITIONS'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#5A7C99] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Marine Conditions &amp; Swell</span>
          </button>

          <button
            onClick={() => setActiveTab('CAPABILITY')}
            className={`px-4 py-3 text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'CAPABILITY'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#5A7C99] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Vessel Capability &amp; Limits</span>
          </button>

          <button
            onClick={() => setActiveTab('PFZ')}
            className={`px-4 py-3 text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'PFZ'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#5A7C99] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Fishing Opportunities (PFZ)</span>
          </button>

          <button
            onClick={() => setActiveTab('OBSERVATIONS')}
            className={`px-4 py-3 text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'OBSERVATIONS'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#5A7C99] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Agency Observations &amp; Truth</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACE')}
            className={`px-4 py-3 text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'TRACE'
                ? 'text-[#147FB3] border-[#147FB3] bg-white'
                : 'text-[#5A7C99] border-transparent hover:text-[#123B5D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reasoning Pipeline Trace</span>
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

