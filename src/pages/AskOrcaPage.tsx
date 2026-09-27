import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Clock, 
  Sliders, 
  Compass, 
  RefreshCw,
  Info,
  CheckCircle2,
  ShieldCheck,
  Map,
  ChevronDown,
  ChevronUp,
  Waves,
  Fish,
  MapPin,
  Wind
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { DecisionHeroCard } from '@/components/decision/DecisionHeroCard';
import { WhyDecisionModal } from '@/components/decision/WhyDecisionModal';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { ROUTES } from '@/routes';
import type { DecisionVerdict } from '@/types/marine';

export const AskOrcaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRegion } = useRegion();
  const { orchestration, runOrchestration, isOrchestrating } = useOrchestration();

  const queryParam = searchParams.get('q');
  const [queryInput, setQueryInput] = useState(queryParam || 'Can I go fishing tomorrow morning for five hours?');
  const [departureTime, setDepartureTime] = useState('05:45');
  const [durationHours, setDurationHours] = useState(5);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);

  const sampleQueries = [
    'Can I go fishing tomorrow morning for five hours?',
    'Is it safe to transit to Alibaug Outer Bank (PFZ-MUM-01)?',
    'What is the wave swell forecast for afternoon return?',
    'Evaluate patrol corridor clearance near Naval Anchorage',
  ];

  const handleRunQuery = async (queryTextToRun: string, duration?: number, departure?: string) => {
    if (!queryTextToRun.trim()) return;
    await runOrchestration(
      queryTextToRun,
      activeRegion.id,
      duration || durationHours,
      departure || `${departureTime} IST`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunQuery(queryInput);
  };

  const handleWhatIfChange = (newDuration: number, newDeparture: string) => {
    setDurationHours(newDuration);
    setDepartureTime(newDeparture);
    handleRunQuery(
      `What-if scenario: Mission duration ${newDuration}h departing at ${newDeparture}`,
      newDuration,
      `${newDeparture} IST`
    );
  };

  const decision = orchestration?.decision;
  const simulatedVerdict: DecisionVerdict = decision?.verdict || 'CAUTION';

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2] uppercase tracking-wider">
              ORCA DECISION ENGINE
            </span>
            <span className="text-xs text-[#5A7C99]">SECTOR: {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D] tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#147FB3]" />
            Ask ORCA
          </h1>
          <p className="text-xs sm:text-sm text-[#5A7C99]">
            Natural-language marine reasoning backed by deterministic constraints and live oceanography.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] text-xs font-bold text-[#123B5D] transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          &larr; BACK TO HOME
        </button>
      </div>

      {/* 2. Sequence Step 1: QUESTION */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5 bg-[#F9FCFE] border border-[#D8E5EC] rounded-xl w-full focus-within:border-[#147FB3] focus-within:bg-white transition">
            <Sparkles className="w-5 h-5 text-[#147FB3] shrink-0" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask anything: 'Can I go fishing tomorrow morning for 5 hours?'"
              className="w-full text-xs sm:text-sm text-[#123B5D] placeholder-[#88A4BC] focus:outline-none font-medium bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isOrchestrating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isOrchestrating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>CORRELATING...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>EVALUATE</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase text-[#88A4BC]">Examples:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQueryInput(sq);
                handleRunQuery(sq);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F9FCFE] hover:bg-[#EAF5FA] text-[#147FB3] border border-[#D8E5EC] transition cursor-pointer font-medium"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Sequence Step 2: DECISION HERO */}
      <DecisionHeroCard
        verdict={simulatedVerdict}
        departureTime={`${departureTime} IST`}
        vesselName="Matsya Sagar 1"
      />

      {/* 4. Sequence Step 3 & 4: WHY & ACTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Why this decision card */}
        <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#147FB3]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                Operational Rationale (Why)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowWhyModal(true)}
              className="px-2.5 py-1 rounded-lg bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2] text-[11px] font-bold hover:bg-[#DDF0F8] transition cursor-pointer"
            >
              Full Audit &rarr;
            </button>
          </div>

          <p className="text-xs text-[#123B5D] leading-relaxed">
            Morning departure is favorable (&lt; 1.2m swell), but deteriorating afternoon wave swell (&gt; 2.1m post-12:00 IST) constrains safe return window. Maintain minimum 4.2 km clearance from Naval Anchorage Geofence.
          </p>

          <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] text-[11px] text-[#5A7C99] flex items-center justify-between">
            <span>Evaluation Mode:</span>
            <strong className="text-[#2E8B57] font-mono">DETERMINISTIC GIS SAFETY</strong>
          </div>
        </div>

        {/* Recommended Action Summary */}
        <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2E8B57]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Recommended Action Plan
            </h2>
          </div>

          <div className="flex flex-col gap-2 text-xs text-[#123B5D]">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span><strong>Depart at 05:45 IST</strong> to utilize calm morning sea window.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span><strong>Conclude return by 11:30 IST</strong> before afternoon squall envelope.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span><strong>Steer 245° WSW</strong> to reach high-yield INCOIS Zone Alpha.</span>
            </div>
          </div>

          <Link
            to={ROUTES.MISSION}
            className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white text-xs font-bold tracking-wider text-center transition shadow-sm cursor-pointer"
          >
            DISPATCH MISSION WITH THIS PLAN
          </Link>
        </div>
      </div>

      {/* 5. Sequence Step 5: EVIDENCE STREAMS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-2.5">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Correlated Multi-Agency Evidence
            </h2>
          </div>
          <span className="text-[11px] text-[#5A7C99]">
            Official government observations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ocean State Forecast */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
                INCOIS Swell
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[9px] font-bold border border-[#A3E6B5]">
                LIVE ERDDAP
              </span>
            </div>
            <div className="text-sm font-bold text-[#123B5D]">0.9m &rarr; 2.1m (Hs)</div>
            <div className="text-[11px] text-[#5A7C99]">Morning calm; midday swell warning.</div>
          </div>

          {/* Fishing Opportunity */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                <Fish className="w-3.5 h-3.5 text-[#2E8B57]" />
                INCOIS PFZ
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[9px] font-bold border border-[#A3E6B5]">
                LIVE WFS
              </span>
            </div>
            <div className="text-sm font-bold text-[#123B5D]">Zone Alpha (18.5 km)</div>
            <div className="text-[11px] text-[#5A7C99]">Thermal/chlorophyll front detected.</div>
          </div>

          {/* Spatial Boundaries */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
                PostGIS Safety
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] font-mono text-[9px] font-bold border border-[#BCE1F2]">
                DETERMINISTIC
              </span>
            </div>
            <div className="text-sm font-bold text-[#123B5D]">4.2 km Clearance</div>
            <div className="text-[11px] text-[#5A7C99]">Outside naval buffer exclusion.</div>
          </div>

          {/* Weather Warning */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#D99520]" />
                IMD Weather
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#FEF9EE] text-[#D99520] font-mono text-[9px] font-bold border border-[#FAD889]">
                ACCESS PENDING
              </span>
            </div>
            <div className="text-sm font-bold text-[#123B5D]">Squall &gt; 25 NM</div>
            <div className="text-[11px] text-[#5A7C99]">Afternoon squall advisory active.</div>
          </div>
        </div>
      </div>

      {/* 6. Sequence Step 6: TACTICAL MAP PREVIEW */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-2.5">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Evaluated Marine Map Corridor
            </h2>
          </div>
          <Link
            to={ROUTES.MAP}
            className="text-xs font-bold text-[#147FB3] hover:underline"
          >
            Open Full Tactical Map &rarr;
          </Link>
        </div>

        <div className="h-64 sm:h-80 rounded-xl overflow-hidden border border-[#D8E5EC] relative">
          <MarineMapCanvas className="w-full h-full" showOverlayControls={false} />
        </div>
      </div>

      {/* 7. Sequence Step 7: INTERACTIVE WHAT-IF ENGINE */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D8E5EC] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF5FA] text-[#147FB3]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#123B5D] uppercase tracking-wider">
                Interactive What-If Scenario Re-evaluator
              </h2>
              <p className="text-[11px] text-[#5A7C99]">
                Adjust departure and duration to observe deterministic constraint evaluation in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Departure Selector */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Clock className="w-3.5 h-3.5 text-[#147FB3]" />
                Departure Time (IST)
              </span>
              <span className="font-mono text-[#147FB3] font-bold">{departureTime} IST</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['05:45', '08:30', '13:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleWhatIfChange(durationHours, time)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition border cursor-pointer ${
                    departureTime === time
                      ? 'bg-[#147FB3] text-white border-[#147FB3] shadow-xs'
                      : 'bg-white text-[#123B5D] border-[#D8E5EC] hover:bg-[#EAF5FA]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Compass className="w-3.5 h-3.5 text-[#147FB3]" />
                Mission Duration
              </span>
              <span className="font-mono text-[#147FB3] font-bold">{durationHours} Hours</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={durationHours}
              onChange={(e) => handleWhatIfChange(Number(e.target.value), departureTime)}
              className="w-full accent-[#147FB3] mt-2 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#88A4BC]">
              <span>2 hrs (Local)</span>
              <span>5 hrs (Standard)</span>
              <span>12 hrs (Deep Sea)</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] text-xs text-[#5A7C99] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#147FB3] shrink-0" />
            <span>
              {durationHours > 7 
                ? 'Extended voyage duration crosses midday wave swell limit (2.1m) triggering AVOID recommendation.'
                : 'Standard duration allows safe return to Sassoon Docks before midday chop.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.MISSION)}
            className="px-3.5 py-1.5 rounded-xl bg-[#123B5D] hover:bg-[#0F2C4C] text-white font-bold text-xs tracking-wider transition shrink-0 cursor-pointer shadow-xs ml-3"
          >
            CONFIRM PLAN
          </button>
        </div>
      </div>

      {/* 8. Sequence Step 8: COLLAPSIBLE TECHNICAL TRACE */}
      <div className="bg-white rounded-2xl border border-[#D8E5EC] shadow-sm overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
          className="p-4 bg-[#F9FCFE] hover:bg-[#F0F7FB] transition flex items-center justify-between text-xs font-bold text-[#123B5D] uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#147FB3]" />
            <span>How ORCA Reasoned • Multi-Agent Pipeline Trace</span>
          </div>
          {showTechnicalTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalTrace && (
          <div className="p-4 sm:p-5 border-t border-[#E2EDF4] flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {[
                {
                  id: 'planner',
                  name: '1. Mission Planner',
                  desc: `${durationHours}h Trip (${departureTime} IST)`,
                  status: 'COMPLETED',
                },
                {
                  id: 'ocean',
                  name: '2. Oceanography',
                  desc: 'SST 27.8°C • Current 0.8 kts',
                  status: 'COMPLETED',
                },
                {
                  id: 'weather',
                  name: '3. Meteorology',
                  desc: 'Wind 12.5 kts • Wave 1.4m',
                  status: 'COMPLETED',
                },
                {
                  id: 'pfz',
                  name: '4. PFZ / Fisheries',
                  desc: 'Zone Alpha (18.5 km, 245°)',
                  status: 'COMPLETED',
                },
                {
                  id: 'geoSafety',
                  name: '5. Deterministic GIS',
                  desc: '4.2 km Buffer Clear',
                  status: 'COMPLETED',
                },
              ].map((ag) => (
                <div
                  key={ag.id}
                  className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#123B5D]">{ag.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57] shrink-0" />
                  </div>
                  <div className="text-[11px] text-[#5A7C99] font-medium leading-tight">{ag.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Why This Decision Modal */}
      <WhyDecisionModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        verdict={simulatedVerdict}
        vesselName="Matsya Sagar 1"
        departureTime={`${departureTime} IST`}
        durationHours={durationHours}
      />
    </div>
  );
};

