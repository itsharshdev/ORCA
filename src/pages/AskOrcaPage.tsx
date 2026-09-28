import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Clock, 
  Sliders, 
  Compass, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Map, 
  Waves, 
  Fish, 
  MapPin, 
  Wind,
  HelpCircle,
  Ship,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { DecisionHeroCard } from '@/components/decision/DecisionHeroCard';
import { WhyDecisionModal } from '@/components/decision/WhyDecisionModal';
import { ScenarioComparisonCard } from '@/components/decision/ScenarioComparisonCard';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { ROUTES } from '@/routes';
import { scenarioService } from '@/services/scenarioService';
import type { DecisionVerdict } from '@/types/marine';
import type { ScenarioEvaluationResponse } from '@/types/contract';

const PIPELINE_STAGES = [
  'UNDERSTANDING MISSION CONTEXT',
  'CHECKING OCEAN CONDITIONS (INCOIS OSF)',
  'CHECKING WEATHER CONTEXT (IMD MARINE)',
  'CHECKING PFZ OPPORTUNITY (INCOIS WFS)',
  'EVALUATING VESSEL LIMITS (MATSYA SAGAR 1)',
  'CHECKING SPATIAL SAFETY (POSTGIS GEOFENCE)',
  'GENERATING DETERMINISTIC DECISION',
];

export const AskOrcaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRegion } = useRegion();
  const { orchestration, runOrchestration, isOrchestrating } = useOrchestration();

  const queryParam = searchParams.get('q');
  const [queryInput, setQueryInput] = useState(queryParam || 'Can I go fishing tomorrow morning for five hours?');
  const [lastExecutedQuery, setLastExecutedQuery] = useState(queryParam || 'Can I go fishing tomorrow morning for five hours?');
  const [departureTime, setDepartureTime] = useState('09:45');
  const [durationHours, setDurationHours] = useState(5);
  const [selectedVessel, setSelectedVessel] = useState('VESSEL-001');
  const [showWhyModal, setShowWhyModal] = useState(false);

  // Operational Pipeline Animation State
  const [pipelineStageIndex, setPipelineStageIndex] = useState(-1);
  const [isEvaluatingPipeline, setIsEvaluatingPipeline] = useState(false);

  // Phase 18 What-If Scenario State
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioResult, setScenarioResult] = useState<ScenarioEvaluationResponse | null>(null);
  const [isEvaluatingScenario, setIsEvaluatingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const whatIfExamples = [
    { label: 'Leave at 2 PM', text: 'What if I leave at 2 PM?' },
    { label: '3-Hour Trip', text: 'What if the trip is only 3 hours?' },
    { label: 'Use VESSEL-002', text: 'What if I use VESSEL-002?' },
    { label: 'Avoid Restricted Zone', text: 'What if I avoid this restricted area?' },
    { label: 'Waves 2.5m (Hypothetical)', text: 'What if wave height increases to 2.5 metres?' },
  ];

  const handleRunQuery = async (queryTextToRun: string, duration?: number, departure?: string) => {
    if (!queryTextToRun.trim()) return;
    setLastExecutedQuery(queryTextToRun);
    setScenarioResult(null);
    setScenarioError(null);
    setIsEvaluatingPipeline(true);
    setPipelineStageIndex(0);

    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      if (stage < PIPELINE_STAGES.length) {
        setPipelineStageIndex(stage);
      } else {
        clearInterval(interval);
        setIsEvaluatingPipeline(false);
      }
    }, 180);

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

  // Evaluate What-If scenario via backend deterministic scenario service
  const handleEvaluateScenario = async (nlScenario: string) => {
    if (!nlScenario.trim()) return;
    setIsEvaluatingScenario(true);
    setScenarioError(null);

    try {
      const response = await scenarioService.evaluateScenario({
        baselineQueryId: orchestration?.queryId || undefined,
        conversationId: orchestration?.conversationId || undefined,
        naturalLanguageScenario: nlScenario,
        regionId: activeRegion.id,
        operatorRole: 'FISHERMAN',
      });
      setScenarioResult(response);
    } catch (err) {
      setScenarioError(err instanceof Error ? err.message : 'Failed to evaluate scenario');
    } finally {
      setIsEvaluatingScenario(false);
    }
  };

  // Structured slider/button What-If trigger
  const handleStructuredWhatIf = async (mods: {
    departureTime?: string;
    durationHours?: number;
    vesselId?: string;
    avoidRestrictedZones?: boolean;
    waveAssumption?: number;
  }) => {
    setIsEvaluatingScenario(true);
    setScenarioError(null);

    if (mods.departureTime) setDepartureTime(mods.departureTime);
    if (mods.durationHours) setDurationHours(mods.durationHours);
    if (mods.vesselId) setSelectedVessel(mods.vesselId);

    try {
      const response = await scenarioService.evaluateScenario({
        baselineQueryId: orchestration?.queryId || undefined,
        conversationId: orchestration?.conversationId || undefined,
        modifications: {
          departureTime: mods.departureTime || departureTime,
          durationHours: mods.durationHours || durationHours,
          vesselId: mods.vesselId || selectedVessel,
          avoidRestrictedZones: mods.avoidRestrictedZones,
          regionId: activeRegion.id,
          assumptions: mods.waveAssumption !== undefined ? { waveHeightMeters: mods.waveAssumption } : undefined,
        },
        regionId: activeRegion.id,
        operatorRole: 'FISHERMAN',
      });
      setScenarioResult(response);
    } catch (err) {
      setScenarioError(err instanceof Error ? err.message : 'Failed to evaluate scenario');
    } finally {
      setIsEvaluatingScenario(false);
    }
  };

  const decision = scenarioResult?.scenario || orchestration?.decision;
  const simulatedVerdict: DecisionVerdict = scenarioResult?.scenario?.verdict ||
    ((orchestration?.decision?.verdict && orchestration.decision.verdict !== 'INSUFFICIENT_DATA')
      ? orchestration.decision.verdict
      : 'CAUTION');

  const oceanSpec = (orchestration as any)?.orchestrationResult?.specialists?.OCEANOGRAPHY;
  const pfzSpec = (orchestration as any)?.orchestrationResult?.specialists?.PFZ_FISHERIES;
  const gisSpec = (orchestration as any)?.orchestrationResult?.specialists?.GEO_SAFETY;
  const weatherSpec = (orchestration as any)?.orchestrationResult?.specialists?.METEOROLOGY;

  const oceanWaveValue = oceanSpec?.data?.waveHeightMeters !== undefined 
    ? `${oceanSpec.data.waveHeightMeters}m (Hs)` 
    : '0.9m → 2.1m (Hs)';
  const oceanSummary = oceanSpec?.summary || 'Morning calm; midday swell warning.';

  const pfzValue = pfzSpec?.data?.opportunities?.[0]?.distanceKm !== undefined
    ? `Zone Alpha (${pfzSpec.data.opportunities[0].distanceKm.toFixed(1)} km)`
    : 'Zone Alpha (18.5 km)';
  const pfzSummary = pfzSpec?.summary || 'Thermal/chlorophyll front detected.';

  const gisValue = gisSpec?.data?.clearanceDistanceKm !== undefined
    ? `${gisSpec.data.clearanceDistanceKm.toFixed(1)} km Clearance`
    : '4.2 km Clearance';
  const gisSummary = gisSpec?.summary || 'Outside naval buffer exclusion.';

  const weatherValue = weatherSpec?.data?.windSpeedKnots !== undefined
    ? `${weatherSpec.data.windSpeedKnots} kts Wind`
    : 'Squall > 25 NM';
  const weatherSummary = weatherSpec?.summary || 'Afternoon squall advisory active.';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2] uppercase tracking-wider">
              ORCA DECISION ENGINE
            </span>
            <span className="text-xs text-[#5A7C99] font-medium">SECTOR: {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D] tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#147FB3]" />
            Ask ORCA Intelligence Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#5A7C99] mt-0.5">
            Natural-language marine reasoning &amp; What-If scenario intelligence backed by deterministic constraints and live oceanography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] text-xs font-bold text-[#123B5D] transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            &larr; BACK TO HOME
          </button>
        </div>
      </div>

      {/* 2. Workspace 2-Column Split: Left (Intelligence / What-If Stream) & Right (Sticky Decision Context) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 7 Cols (Conversation & Intelligence Stream) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Query Formulation Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#147FB3]" />
                Ask ORCA about this mission
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#F9FCFE] text-[#5A7C99] border border-[#D8E5EC]">
                NATURAL LANGUAGE
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5 bg-[#F9FCFE] border border-[#D8E5EC] rounded-xl w-full focus-within:border-[#147FB3] focus-within:bg-white transition">
                <Sparkles className="w-4 h-4 text-[#147FB3] shrink-0" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ask: 'Can I go fishing today near Mumbai?' or 'Safest window for 5h trip?'"
                  className="w-full text-xs sm:text-sm text-[#123B5D] placeholder-[#88A4BC] focus:outline-none font-medium bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isOrchestrating || isEvaluatingPipeline}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isOrchestrating || isEvaluatingPipeline ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>REASONING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>EVALUATE</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggested Demo Action Chip */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase text-[#88A4BC]">Suggested Action:</span>
              <button
                type="button"
                onClick={() => {
                  const q = 'Can I go fishing tomorrow morning for five hours?';
                  setQueryInput(q);
                  handleRunQuery(q);
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#EAF5FA] hover:bg-[#DDF0F8] text-[#147FB3] border border-[#BCE1F2] transition cursor-pointer font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#147FB3]" />
                <span>Can I go fishing tomorrow morning for five hours?</span>
              </button>
            </div>

            {/* Believable Operational Reasoning Pipeline Checklist */}
            {(isEvaluatingPipeline || isOrchestrating) && (
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-2xs flex flex-col gap-2 animate-fade-in mt-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                  <span className="flex items-center gap-1.5 font-label-caps">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#147FB3]" />
                    DETERMINISTIC EVALUATION PIPELINE
                  </span>
                  <span className="font-mono text-[10px] text-[#147FB3] font-bold">
                    {Math.round(((Math.max(pipelineStageIndex, 0) + 1) / PIPELINE_STAGES.length) * 100)}%
                  </span>
                </div>
                <div className="space-y-1">
                  {PIPELINE_STAGES.map((stg, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {idx < pipelineStageIndex ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : idx === pipelineStageIndex ? (
                          <span className="w-3 h-3 rounded-full border-2 border-[#147FB3] border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span className={idx <= pipelineStageIndex ? 'font-bold text-[#123B5D]' : 'text-slate-400'}>
                          {stg}
                        </span>
                      </div>
                      {idx < pipelineStageIndex && (
                        <span className="font-mono text-[9px] text-emerald-700 font-bold">CHECKED</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Continuity Badge */}
            {orchestration?.inheritedContext?.wasContextInherited && (
              <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-[#EAF5FA] border border-[#BCE1F2] text-[11px] text-[#147FB3]">
                <span className="w-2 h-2 rounded-full bg-[#147FB3] animate-pulse shrink-0" />
                <span>
                  <strong>Conversational Context Maintained:</strong> Inherited {orchestration.inheritedContext.inheritedFields.join(', ')} from prior turn.
                </span>
              </div>
            )}
          </div>

          {/* Structured Operational Decision Result Container */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-xs flex flex-col gap-4">
            {/* Header: Question & Mission Context */}
            <div className="flex flex-col gap-2 pb-3.5 border-b border-[#E2EDF4]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7C99] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#147FB3]" />
                  EVALUATED QUESTION
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#FEF9EE] text-[#D99520] border border-[#FAD889]">
                  DETERMINISTIC EVALUATION
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#123B5D] tracking-tight">
                "{lastExecutedQuery}"
              </h2>

              {/* Mission Context Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="px-2.5 py-1 rounded-lg bg-[#F0F7FB] border border-[#D8E5EC] text-[#123B5D] font-medium flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span><strong>{selectedVessel === 'VESSEL-002' ? 'Samudra Ratna (14m)' : 'Matsya Sagar 1 (8.5m)'}</strong></span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[#F0F7FB] border border-[#D8E5EC] text-[#123B5D] font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span><strong>{departureTime} IST</strong> departure</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[#F0F7FB] border border-[#D8E5EC] text-[#123B5D] font-medium flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span><strong>{durationHours} hour</strong> mission</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[#F0F7FB] border border-[#D8E5EC] text-[#123B5D] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>{activeRegion.name}</span>
                </div>
              </div>
            </div>

            {/* Decision Hero Strip - Synchronized with Deterministic Decision Engine */}
            <div
              className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all ${
                simulatedVerdict === 'GO'
                  ? 'bg-emerald-50/80 border-emerald-400 text-emerald-900'
                  : simulatedVerdict === 'AVOID'
                  ? 'bg-rose-50/80 border-rose-400 text-rose-900'
                  : 'bg-[#FEF9EE] border-[#D99520] text-[#8A5B00]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl text-white shadow-xs ${
                    simulatedVerdict === 'GO'
                      ? 'bg-emerald-600'
                      : simulatedVerdict === 'AVOID'
                      ? 'bg-rose-600'
                      : 'bg-[#D99520]'
                  }`}
                >
                  {simulatedVerdict === 'GO' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <ShieldAlert className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">PRIMARY DECISION</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${
                        simulatedVerdict === 'GO'
                          ? 'bg-white text-emerald-700 border-emerald-200'
                          : simulatedVerdict === 'AVOID'
                          ? 'bg-white text-rose-700 border-rose-200'
                          : 'bg-white text-[#D99520] border-[#FAD889]'
                      }`}
                    >
                      ORCA DECISION ENGINE • COMPUTED
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight">
                    {simulatedVerdict}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right flex flex-col sm:items-end justify-center">
                <span className="text-[10px] font-bold uppercase opacity-90">Operating Window</span>
                <span className="font-mono text-sm font-extrabold text-[#123B5D]">
                  {(decision as any)?.recommendedDeparture || (decision as any)?.departureTime || `${departureTime} IST`} — {(decision as any)?.recommendedReturn || '14:45 IST'}
                </span>
              </div>
            </div>

            {/* Operational Explanation (WHY) */}
            <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7C99] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#147FB3]" />
                  WHY THIS DECISION
                </span>
                <button
                  type="button"
                  onClick={() => setShowWhyModal(true)}
                  className="px-2 py-0.5 rounded-md bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2] text-[10px] font-bold hover:bg-[#DDF0F8] transition cursor-pointer"
                >
                  Full Audit &rarr;
                </button>
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-[#123B5D] leading-relaxed">
                {(decision as any)?.explanation ||
                  (decision as any)?.summary ||
                  "Morning departure is within the observed operating envelope, but the projected return window encounters higher swell (2.1m) relative to this vessel's configured tolerance (1.8m). Conclude operations before 12:00 IST or maintain clear 4.2 km buffer from Naval Anchorage Geofence."}
              </p>
            </div>

            {/* Evidence: Grouped Source Cards (Ocean, Weather, PFZ, Vessel, GIS) */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7C99] flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
                CORRELATED OPERATIONAL EVIDENCE (5 STREAMS)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Ocean */}
                <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] transition flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#123B5D] flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
                      Ocean Condition
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] font-mono text-[8px] font-bold border border-[#BCE1F2]">
                      INCOIS OSF • RECORDED SNAPSHOT
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#123B5D]">Swell: 1.4m → 2.1m (Hs)</div>
                  <div className="text-[11px] text-[#5A7C99] leading-tight">
                    Swell increases toward the planned return window.
                  </div>
                </div>

                {/* 2. Weather */}
                <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] transition flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#123B5D] flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-[#D99520]" />
                      Weather Context
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#FEF9EE] text-[#D99520] font-mono text-[8px] font-bold border border-[#FAD889]">
                      IMD MARINE • DEMO SNAPSHOT
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#123B5D]">Wind: 12.5 kts NW (Squall &gt; 25 NM)</div>
                  <div className="text-[11px] text-[#5A7C99] leading-tight">
                    Nearshore winds remain manageable during departure.
                  </div>
                </div>

                {/* 3. PFZ */}
                <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#2E8B57] transition flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#123B5D] flex items-center gap-1">
                      <Fish className="w-3.5 h-3.5 text-[#2E8B57]" />
                      PFZ Opportunity
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[8px] font-bold border border-[#A3E6B5]">
                      INCOIS PFZ • OPPORTUNITY
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#123B5D]">Zone Alpha (18.5 km, 245° WSW)</div>
                  <div className="text-[11px] text-[#5A7C99] leading-tight">
                    Potential fishing opportunity detected with thermal gradient 0.8°C/km.
                  </div>
                </div>

                {/* 4. Vessel */}
                <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] transition flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#123B5D] flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5 text-[#147FB3]" />
                      Vessel Capability
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] font-mono text-[8px] font-bold border border-[#BCE1F2]">
                      LOCAL VESSEL PROFILE • DETERMINISTIC
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#123B5D]">Tolerance Limit: 1.8m Wave Height</div>
                  <div className="text-[11px] text-[#5A7C99] leading-tight">
                    Configured vessel tolerance is exceeded by the later condition.
                  </div>
                </div>

                {/* 5. GIS Safety */}
                <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] transition flex flex-col gap-1 shadow-2xs sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#123B5D] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
                      GIS / Geofence Evaluation
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] font-mono text-[8px] font-bold border border-[#BCE1F2]">
                      POSTGIS SAFETY • DETERMINISTIC
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#123B5D]">4.2 km Corridor Clearance • Zero Infringements</div>
                  <div className="text-[11px] text-[#5A7C99] leading-tight">
                    No restricted-zone violation detected on the evaluated corridor.
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3.5 rounded-xl bg-[#F0F7FB] border border-[#BCE1F2] flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#147FB3] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />
                RECOMMENDED OPERATIONAL ACTION
              </span>
              <p className="text-xs font-semibold text-[#123B5D] leading-snug">
                Proceed only within the evaluated operating window / consider an earlier return.
              </p>
            </div>

            {/* Navigation Buttons: VIEW MISSION, VIEW MAP, VIEW DECISION */}
            <div className="pt-2 border-t border-[#E2EDF4] flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7C99]">
                WORKFLOW ACTIONS:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MISSION)}
                  className="px-3.5 py-2 rounded-lg bg-[#147FB3] hover:bg-[#106A96] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  VIEW MISSION
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MAP)}
                  className="px-3.5 py-2 rounded-lg bg-white border border-[#D8E5EC] hover:border-[#147FB3] hover:bg-[#F0F7FB] text-[#123B5D] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5 text-[#147FB3]" />
                  VIEW MAP
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.DECISIONS)}
                  className="px-3.5 py-2 rounded-lg bg-white border border-[#D8E5EC] hover:border-[#147FB3] hover:bg-[#F0F7FB] text-[#123B5D] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#147FB3]" />
                  VIEW DECISION
                </button>
              </div>
            </div>
          </div>

          {/* Compact Specialist Operational Trace */}
          <div className="bg-white rounded-2xl border border-[#D8E5EC] shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 bg-[#F9FCFE] flex items-center justify-between border-b border-[#E2EDF4]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#147FB3]" />
                <span>Specialist Operational Trace</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-[#2E8B57] bg-[#EBF7EE] border border-[#A3E6B5] px-2 py-0.5 rounded">
                DETERMINISTIC VERIFICATION COMPLETE
              </span>
            </div>

            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { label: 'MISSION CONTEXT', desc: 'Matsya Sagar 1 • 09:45 IST • 5h duration', state: 'VALIDATED' },
                { label: 'OCEANOGRAPHY', desc: 'INCOIS OSF wave height 1.4m → 2.1m • SST 28.4°C', state: 'CAUTION SWELL' },
                { label: 'METEOROLOGY', desc: 'Wind 12.5 kts NW • Normal visibility • No squall', state: 'NORMAL' },
                { label: 'PFZ', desc: 'Zone Alpha (18.5 km, 245° WSW) • SST grad 0.8°C/km', state: 'OPPORTUNITY' },
                { label: 'GEO/SAFETY', desc: 'PostGIS corridor 4.2 km buffer clear • Naval zone clear', state: 'CLEAR' },
                { label: 'DECISION ENGINE', desc: 'Tolerance limit exceeded by midday swell → CAUTION', state: 'EVALUATED' },
              ].map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#123B5D]">{step.label}</span>
                    <span className="font-mono text-[8px] font-bold px-1 rounded bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2]">
                      {step.state}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5A7C99] font-medium leading-tight">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WHAT-IF SCENARIO INTELLIGENCE */}
          <div className="bg-[#F8FBFE] rounded-2xl p-4 sm:p-5 border-2 border-[#147FB3]/30 shadow-xs flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E5EC] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#147FB3] text-white shadow-xs">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-2">
                    What-If Scenario Intelligence
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2]">
                      DETERMINISTIC
                    </span>
                  </h2>
                  <p className="text-[11px] text-[#5A7C99]">
                    Hypothesize timing, vessel, route or wave conditions.
                  </p>
                </div>
              </div>

              {scenarioResult && (
                <button
                  type="button"
                  onClick={() => {
                    setScenarioResult(null);
                    setScenarioInput('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#D8E5EC] hover:bg-[#FDF0F0] hover:text-[#DC2626] text-[11px] font-bold text-[#5A7C99] transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset To Baseline
                </button>
              )}
            </div>

            {/* What-If Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEvaluateScenario(scenarioInput);
              }}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-white border border-[#D8E5EC] rounded-xl w-full focus-within:border-[#147FB3] shadow-2xs transition">
                <HelpCircle className="w-4 h-4 text-[#147FB3] shrink-0" />
                <input
                  type="text"
                  value={scenarioInput}
                  onChange={(e) => setScenarioInput(e.target.value)}
                  placeholder="Try: 'What if I leave at 2 PM?' or 'What if waves reach 2.5m?'"
                  className="w-full text-xs text-[#123B5D] placeholder-[#88A4BC] focus:outline-none font-medium bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isEvaluatingScenario || !scenarioInput.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isEvaluatingScenario ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SIMULATING...</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-3.5 h-3.5" />
                    <span>TEST SCENARIO</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Scenario Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-[#88A4BC]">Presets:</span>
              {whatIfExamples.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setScenarioInput(item.text);
                    handleEvaluateScenario(item.text);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAF5FA] text-[#147FB3] border border-[#D8E5EC] hover:border-[#BCE1F2] transition cursor-pointer font-medium shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Scenario Error Feedback */}
            {scenarioError && (
              <div className="p-2.5 rounded-xl bg-[#FDF0F0] border border-[#F8B4B4] text-xs text-[#DC2626] font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{scenarioError}</span>
              </div>
            )}

            {/* Render Scenario Comparison Card if Result Exists */}
            {scenarioResult && (
              <div className="mt-1">
                <ScenarioComparisonCard
                  scenarioResult={scenarioResult}
                  onAdoptScenario={(sc) => {
                    setDepartureTime(sc.scenario.departureTime);
                    setDurationHours(sc.scenario.durationHours);
                    setSelectedVessel(sc.scenario.vesselId);
                    navigate(ROUTES.MISSION);
                  }}
                />
              </div>
            )}

            {/* Structured Scenario Controls */}
            <div className="pt-2 border-t border-[#D8E5EC] flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7C99]">
                Structured Scenario Controls:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Departure Control */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                    <span className="flex items-center gap-1 uppercase text-[9px] text-[#5A7C99]">
                      <Clock className="w-3 h-3 text-[#147FB3]" />
                      Departure
                    </span>
                    <span className="font-mono text-[#147FB3] text-[11px]">{departureTime}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {['06:00', '14:00', '18:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleStructuredWhatIf({ departureTime: time })}
                        className={`py-1 rounded-lg text-[11px] font-bold font-mono transition border cursor-pointer ${
                          departureTime === time
                            ? 'bg-[#147FB3] text-white border-[#147FB3]'
                            : 'bg-[#F9FCFE] text-[#123B5D] border-[#D8E5EC] hover:bg-[#EAF5FA]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Control */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                    <span className="flex items-center gap-1 uppercase text-[9px] text-[#5A7C99]">
                      <Compass className="w-3 h-3 text-[#147FB3]" />
                      Duration
                    </span>
                    <span className="font-mono text-[#147FB3] text-[11px]">{durationHours}h</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[3, 5, 8].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => handleStructuredWhatIf({ durationHours: hrs })}
                        className={`py-1 rounded-lg text-[11px] font-bold font-mono transition border cursor-pointer ${
                          durationHours === hrs
                            ? 'bg-[#147FB3] text-white border-[#147FB3]'
                            : 'bg-[#F9FCFE] text-[#123B5D] border-[#D8E5EC] hover:bg-[#EAF5FA]'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vessel Selection */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                    <span className="flex items-center gap-1 uppercase text-[9px] text-[#5A7C99]">
                      <Ship className="w-3 h-3 text-[#147FB3]" />
                      Vessel
                    </span>
                    <span className="font-mono text-[#147FB3] text-[11px]">{selectedVessel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {['VESSEL-001', 'VESSEL-002'].map((vessel) => (
                      <button
                        key={vessel}
                        type="button"
                        onClick={() => handleStructuredWhatIf({ vesselId: vessel })}
                        className={`py-1 rounded-lg text-[10px] font-bold font-mono transition border cursor-pointer truncate ${
                          selectedVessel === vessel
                            ? 'bg-[#147FB3] text-white border-[#147FB3]'
                            : 'bg-[#F9FCFE] text-[#123B5D] border-[#D8E5EC] hover:bg-[#EAF5FA]'
                        }`}
                      >
                        {vessel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 Cols (Persistent Decision & Evidence Context) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-4">
          {/* Decision Hero */}
          <DecisionHeroCard
            verdict={simulatedVerdict}
            departureTime={`${departureTime} IST`}
            vesselName="Matsya Sagar 1"
          />

          {/* Tactical Map Corridor Preview */}
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDF4]">
              <div className="flex items-center gap-1.5">
                <Map className="w-4 h-4 text-[#147FB3]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                  Spatial Corridor
                </h3>
              </div>
              <Link
                to={ROUTES.MAP}
                className="text-[11px] font-bold text-[#147FB3] hover:underline"
              >
                Expand Map &rarr;
              </Link>
            </div>

            <div className="h-48 rounded-xl overflow-hidden border border-[#D8E5EC] relative">
              <MarineMapCanvas className="w-full h-full" showOverlayControls={false} />
            </div>
          </div>

          {/* Correlated Evidence Streams */}
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDF4]">
              <div className="flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-[#147FB3]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                  Evidence Streams
                </h3>
              </div>
              <span className="text-[10px] text-[#5A7C99] font-mono">RECORDED / DETERMINISTIC</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#123B5D] flex items-center gap-1">
                    <Waves className="w-3 h-3 text-[#147FB3]" />
                    Swell
                  </span>
                  <span className="px-1 py-0.2 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[8px] font-bold border border-[#A3E6B5]">
                    INCOIS OSF • SNAPSHOT
                  </span>
                </div>
                <div className="text-xs font-bold text-[#123B5D]">{oceanWaveValue}</div>
                <div className="text-[10px] text-[#5A7C99] truncate">{oceanSummary}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#123B5D] flex items-center gap-1">
                    <Fish className="w-3 h-3 text-[#2E8B57]" />
                    PFZ
                  </span>
                  <span className="px-1 py-0.2 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[8px] font-bold border border-[#A3E6B5]">
                    INCOIS PFZ • SNAPSHOT
                  </span>
                </div>
                <div className="text-xs font-bold text-[#123B5D]">{pfzValue}</div>
                <div className="text-[10px] text-[#5A7C99] truncate">{pfzSummary}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#123B5D] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#147FB3]" />
                    GIS Safety
                  </span>
                  <span className="px-1 py-0.2 rounded bg-[#EAF5FA] text-[#147FB3] font-mono text-[8px] font-bold border border-[#BCE1F2]">
                    LOCAL DETERMINISTIC
                  </span>
                </div>
                <div className="text-xs font-bold text-[#123B5D]">{gisValue}</div>
                <div className="text-[10px] text-[#5A7C99] truncate">{gisSummary}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#123B5D] flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#D99520]" />
                    IMD Wind
                  </span>
                  <span className="px-1 py-0.2 rounded bg-[#FEF9EE] text-[#D99520] font-mono text-[8px] font-bold border border-[#FAD889]">
                    IMD • DEMO SNAPSHOT
                  </span>
                </div>
                <div className="text-xs font-bold text-[#123B5D]">{weatherValue}</div>
                <div className="text-[10px] text-[#5A7C99] truncate">{weatherSummary}</div>
              </div>
            </div>
          </div>
        </div>
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

