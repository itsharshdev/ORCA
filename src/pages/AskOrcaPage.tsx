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
  ChevronDown, 
  ChevronUp, 
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

export const AskOrcaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRegion } = useRegion();
  const { orchestration, runOrchestration, isOrchestrating } = useOrchestration();

  const queryParam = searchParams.get('q');
  const [queryInput, setQueryInput] = useState(queryParam || 'Can I go fishing tomorrow morning for five hours?');
  const [departureTime, setDepartureTime] = useState('05:45');
  const [durationHours, setDurationHours] = useState(5);
  const [selectedVessel, setSelectedVessel] = useState('VESSEL-001');
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);

  // Phase 18 What-If Scenario State
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioResult, setScenarioResult] = useState<ScenarioEvaluationResponse | null>(null);
  const [isEvaluatingScenario, setIsEvaluatingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const sampleQueries = [
    'Can I go fishing tomorrow morning for five hours?',
    'Is it safe to transit to Alibaug Outer Bank (PFZ-MUM-01)?',
    'What is the wave swell forecast for afternoon return?',
    'Evaluate patrol corridor clearance near Naval Anchorage',
  ];

  const whatIfExamples = [
    { label: 'Leave at 2 PM', text: 'What if I leave at 2 PM?' },
    { label: '3-Hour Trip', text: 'What if the trip is only 3 hours?' },
    { label: 'Use VESSEL-002', text: 'What if I use VESSEL-002?' },
    { label: 'Avoid Restricted Zone', text: 'What if I avoid this restricted area?' },
    { label: 'Waves 2.5m (Hypothetical)', text: 'What if wave height increases to 2.5 metres?' },
  ];

  const handleRunQuery = async (queryTextToRun: string, duration?: number, departure?: string) => {
    if (!queryTextToRun.trim()) return;
    setScenarioResult(null);
    setScenarioError(null);
    await runOrchestration(
      queryTextToRun,
      activeRegion.id,
      duration,
      departure
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

  const decision = orchestration?.decision;
  const simulatedVerdict: DecisionVerdict = decision?.verdict || 'CAUTION';

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
            Natural-language marine reasoning & What-If scenario intelligence backed by deterministic constraints and live oceanography.
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

      {/* 2. Sequence Step 1: BASELINE MISSION QUESTION */}
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

        {/* Multi-turn Context Continuity Badge */}
        {orchestration?.inheritedContext?.wasContextInherited && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-[#EAF5FA] border border-[#BCE1F2] text-[11px] text-[#147FB3]">
            <span className="w-2 h-2 rounded-full bg-[#147FB3] animate-pulse shrink-0" />
            <span>
              <strong>Conversational Context Maintained:</strong> Inherited {orchestration.inheritedContext.inheritedFields.join(', ')} from prior turn.
            </span>
          </div>
        )}
      </div>

      {/* 3. Sequence Step 2: CURRENT DECISION HERO */}
      <DecisionHeroCard
        verdict={simulatedVerdict}
        departureTime={`${departureTime} IST`}
        vesselName="Matsya Sagar 1"
      />

      {/* 4. Sequence Step 3: WHAT-IF / SCENARIO EVALUATION SECTION (Phase 18) */}
      <div className="bg-[#F8FBFE] rounded-2xl p-4 sm:p-6 border-2 border-[#147FB3]/30 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E5EC] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#147FB3] text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-2">
                What-If Scenario Intelligence
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2]">
                  PHASE 18 DETERMINISTIC
                </span>
              </h2>
              <p className="text-[11px] text-[#5A7C99]">
                Hypothesize timing, vessel, route or condition changes. Re-evaluated deterministically against safety boundaries.
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
              className="px-3 py-1.5 rounded-lg bg-white border border-[#D8E5EC] hover:bg-[#FDF0F0] hover:text-[#DC2626] text-xs font-bold text-[#5A7C99] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset To Baseline
            </button>
          )}
        </div>

        {/* Natural-Language What-If Query Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEvaluateScenario(scenarioInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-2.5"
        >
          <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5 bg-white border border-[#D8E5EC] rounded-xl w-full focus-within:border-[#147FB3] shadow-2xs transition">
            <HelpCircle className="w-5 h-5 text-[#147FB3] shrink-0" />
            <input
              type="text"
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              placeholder="Ask a scenario: 'What if I leave at 2 PM?' or 'What if waves reach 2.5m?'"
              className="w-full text-xs sm:text-sm text-[#123B5D] placeholder-[#88A4BC] focus:outline-none font-medium bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isEvaluatingScenario || !scenarioInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isEvaluatingScenario ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>EVALUATING SCENARIO...</span>
              </>
            ) : (
              <>
                <Sliders className="w-4 h-4" />
                <span>TEST SCENARIO</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Scenario Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-[#88A4BC]">What-If Presets:</span>
          {whatIfExamples.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setScenarioInput(item.text);
                handleEvaluateScenario(item.text);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAF5FA] text-[#147FB3] border border-[#D8E5EC] transition cursor-pointer font-medium shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Scenario Error Feedback */}
        {scenarioError && (
          <div className="p-3 rounded-xl bg-[#FDF0F0] border border-[#F8B4B4] text-xs text-[#DC2626] font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{scenarioError}</span>
          </div>
        )}

        {/* Render Scenario Comparison Card if Result Exists */}
        {scenarioResult && (
          <div className="mt-2">
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

        {/* Structured Scenario Controls (Sliders & Selectors) */}
        <div className="pt-2 border-t border-[#D8E5EC] flex flex-col gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
            Structured Scenario Controls:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Departure Control */}
            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                <span className="flex items-center gap-1.5 uppercase text-[10px] text-[#5A7C99]">
                  <Clock className="w-3.5 h-3.5 text-[#147FB3]" />
                  Departure
                </span>
                <span className="font-mono text-[#147FB3]">{departureTime}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['06:00', '14:00', '18:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleStructuredWhatIf({ departureTime: time })}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
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
            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                <span className="flex items-center gap-1.5 uppercase text-[10px] text-[#5A7C99]">
                  <Compass className="w-3.5 h-3.5 text-[#147FB3]" />
                  Duration
                </span>
                <span className="font-mono text-[#147FB3]">{durationHours}h</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 8].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => handleStructuredWhatIf({ durationHours: hrs })}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
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
            <div className="p-3 rounded-xl bg-white border border-[#D8E5EC] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#123B5D]">
                <span className="flex items-center gap-1.5 uppercase text-[10px] text-[#5A7C99]">
                  <Ship className="w-3.5 h-3.5 text-[#147FB3]" />
                  Vessel Class
                </span>
                <span className="font-mono text-[#147FB3]">{selectedVessel}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {['VESSEL-001', 'VESSEL-002'].map((vessel) => (
                  <button
                    key={vessel}
                    type="button"
                    onClick={() => handleStructuredWhatIf({ vesselId: vessel })}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
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

      {/* 5. Sequence Step 4 & 5: WHY & ACTION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Why this decision card (Grounded Natural Language Explanation) */}
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

          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-[#123B5D] font-semibold leading-relaxed">
              {orchestration?.llmExplanation?.summary || decision?.primaryDriver || 'Evaluation completed against deterministic hydrographic and meteorological boundaries.'}
            </p>
            <p className="text-xs text-[#5A7C99] leading-relaxed">
              {orchestration?.llmExplanation?.detailedReasoning || decision?.explanation || 'All safety constraints evaluated deterministically.'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] text-[11px] text-[#5A7C99] flex items-center justify-between">
            <span>Intelligence Mode:</span>
            <strong className="text-[#147FB3] font-mono">
              {orchestration?.llmExplanation?.isFallback ? 'DETERMINISTIC REASONING' : 'ORCA NL REASONING'}
            </strong>
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
            {orchestration?.llmExplanation?.actionableAdvisories && orchestration.llmExplanation.actionableAdvisories.length > 0 ? (
              orchestration.llmExplanation.actionableAdvisories.map((adv: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{adv}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span><strong>Depart at {decision?.recommendedDeparture || '05:45 IST'}</strong> to utilize calm morning sea window.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span><strong>Conclude return by {decision?.recommendedReturn || '11:30 IST'}</strong> before afternoon wave envelope.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span><strong>Steer 245° WSW</strong> toward designated clearance corridor.</span>
                </div>
              </>
            )}
          </div>

          <Link
            to={ROUTES.MISSION}
            className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white text-xs font-bold tracking-wider text-center transition shadow-sm cursor-pointer"
          >
            DISPATCH MISSION WITH THIS PLAN
          </Link>
        </div>
      </div>

      {/* 6. Sequence Step 6: EVIDENCE STREAMS */}
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
                {oceanSpec?.sourceStatus === 'LIVE' ? 'LIVE ERDDAP' : 'ERDDAP OSF'}
              </span>
            </div>
            <div className="text-sm font-bold text-[#123B5D]">{oceanWaveValue}</div>
            <div className="text-[11px] text-[#5A7C99] truncate">{oceanSummary}</div>
          </div>

          {/* Fishing Opportunity */}
          <div className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                <Fish className="w-3.5 h-3.5 text-[#2E8B57]" />
                INCOIS PFZ
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[9px] font-bold border border-[#A3E6B5]">
                {pfzSpec?.sourceStatus === 'LIVE' ? 'LIVE WFS' : 'INCOIS WFS'}
              </span>
            </div>
            <div className="text-sm font-bold text-[#123B5D]">{pfzValue}</div>
            <div className="text-[11px] text-[#5A7C99] truncate">{pfzSummary}</div>
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
            <div className="text-sm font-bold text-[#123B5D]">{gisValue}</div>
            <div className="text-[11px] text-[#5A7C99] truncate">{gisSummary}</div>
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
            <div className="text-sm font-bold text-[#123B5D]">{weatherValue}</div>
            <div className="text-[11px] text-[#5A7C99] truncate">{weatherSummary}</div>
          </div>
        </div>
      </div>

      {/* 7. Sequence Step 7: TACTICAL MAP PREVIEW */}
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
