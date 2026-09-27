import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Sliders, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';
import type { ScenarioEvaluationResponse, DecisionVerdict } from '@/types/contract';

interface ScenarioComparisonCardProps {
  scenarioResult: ScenarioEvaluationResponse;
  onAdoptScenario?: (scenario: ScenarioEvaluationResponse) => void;
  onReset?: () => void;
}

const VERDICT_STYLES: Record<DecisionVerdict, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
  GO: {
    bg: 'bg-[#EBF7EE]',
    border: 'border-[#A3E6B5]',
    text: 'text-[#2E8B57]',
    label: 'GO — SAFE TO PROCEED',
    icon: <ShieldCheck className="w-5 h-5 text-[#2E8B57]" />,
  },
  CAUTION: {
    bg: 'bg-[#FFF9E6]',
    border: 'border-[#FFE082]',
    text: 'text-[#D99520]',
    label: 'CAUTION — ADVISORY ACTIVE',
    icon: <AlertTriangle className="w-5 h-5 text-[#D99520]" />,
  },
  AVOID: {
    bg: 'bg-[#FDF0F0]',
    border: 'border-[#F8B4B4]',
    text: 'text-[#DC2626]',
    label: 'AVOID — CRITICAL HAZARD',
    icon: <ShieldAlert className="w-5 h-5 text-[#DC2626]" />,
  },
  INSUFFICIENT_DATA: {
    bg: 'bg-[#F5F7FA]',
    border: 'border-[#D8E5EC]',
    text: 'text-[#5A7C99]',
    label: 'INSUFFICIENT DATA',
    icon: <HelpCircle className="w-5 h-5 text-[#5A7C99]" />,
  },
};

export const ScenarioComparisonCard: React.FC<ScenarioComparisonCardProps> = ({
  scenarioResult,
  onAdoptScenario,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'evidence'>('rules');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);

  const { baseline, scenario, delta, ruleComparison, evidenceComparison, verdictChangeReason, isHypotheticalAssumption, scenarioType } = scenarioResult;

  const baselineStyle = VERDICT_STYLES[baseline.verdict] || VERDICT_STYLES.CAUTION;
  const scenarioStyle = VERDICT_STYLES[scenario.verdict] || VERDICT_STYLES.CAUTION;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#147FB3] shadow-md overflow-hidden flex flex-col gap-0 animate-fade-in">
      {/* 1. Header with Scenario Type and Hypothetical Alert */}
      <div className="bg-[#123B5D] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#147FB3]/30 text-[#88D3F7] border border-[#147FB3]/50">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#147FB3] text-white uppercase tracking-wider">
                WHAT-IF EVALUATION
              </span>
              <span className="text-xs text-[#88D3F7] font-mono uppercase font-bold">
                {scenarioType.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              Deterministic Scenario Comparison
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isHypotheticalAssumption && (
            <div className="px-3 py-1.5 rounded-xl bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA] text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D99520]" />
              <span>HYPOTHETICAL ASSUMPTION</span>
            </div>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-5">
        {/* 2. Side-by-Side Verdict Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* BASELINE CARD */}
          <div className={`p-4 rounded-xl border ${baselineStyle.border} ${baselineStyle.bg} flex flex-col justify-between gap-3`}>
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5A7C99]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
                  CURRENT DECISION (BASELINE)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/70 text-[#123B5D] font-bold border border-black/10">
                {baseline.confidence.level} CONFIDENCE
              </span>
            </div>

            <div className="flex items-center gap-3">
              {baselineStyle.icon}
              <div>
                <div className={`text-lg sm:text-xl font-extrabold tracking-tight ${baselineStyle.text}`}>
                  {baseline.verdict}
                </div>
                <div className="text-xs text-[#123B5D] font-medium">
                  {baseline.summary}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/10 text-[11px] text-[#5A7C99]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#88A4BC]">Depart</span>
                <strong className="text-[#123B5D]">{baseline.departureTime}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#88A4BC]">Duration</span>
                <strong className="text-[#123B5D]">{baseline.durationHours}h</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#88A4BC]">Vessel</span>
                <strong className="text-[#123B5D]">{baseline.vesselId}</strong>
              </div>
            </div>
          </div>

          {/* SCENARIO CARD */}
          <div className={`p-4 rounded-xl border-2 ${scenarioStyle.border} ${scenarioStyle.bg} flex flex-col justify-between gap-3 shadow-xs`}>
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#147FB3]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#147FB3]">
                  WHAT-IF SCENARIO RESULT
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#147FB3] font-bold border border-[#147FB3]/30">
                {scenario.confidence.level} CONFIDENCE
              </span>
            </div>

            <div className="flex items-center gap-3">
              {scenarioStyle.icon}
              <div>
                <div className={`text-lg sm:text-xl font-extrabold tracking-tight ${scenarioStyle.text}`}>
                  {scenario.verdict}
                </div>
                <div className="text-xs text-[#123B5D] font-medium">
                  {scenario.summary}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/10 text-[11px] text-[#5A7C99]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#88A4BC]">Depart</span>
                <strong className="text-[#123B5D]">{scenario.departureTime}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#88A4BC]">Duration</span>
                <strong className="text-[#123B5D]">{scenario.durationHours}h</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#88A4BC]">Vessel</span>
                <strong className="text-[#123B5D]">{scenario.vesselId}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. What Changed (Delta Badges) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#147FB3]" />
              What Changed Between Baseline and Scenario:
            </span>
            <span className="text-[11px] font-mono text-[#5A7C99]">
              {delta.changedFields.length} modification{delta.changedFields.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(delta.fieldDeltas).map(([key, d]) => (
              <div
                key={key}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D8E5EC] text-xs flex items-center gap-2 shadow-2xs"
              >
                <span className="font-bold text-[#5A7C99]">{d.label}:</span>
                <span className="text-[#88A4BC] line-through font-mono">{String(d.from)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#147FB3]" />
                <span className="font-bold text-[#147FB3] font-mono">{String(d.to)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Verdict Change Reason & Actionable Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reason for change */}
          <div className="p-4 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5 mb-1.5">
                <Info className="w-4 h-4 text-[#147FB3]" />
                Operational Rationale For Delta
              </span>
              <p className="text-xs text-[#123B5D] font-medium leading-relaxed">
                {verdictChangeReason}
              </p>
            </div>
            <div className="text-[11px] text-[#5A7C99] pt-2 border-t border-[#E2EDF4] flex items-center justify-between">
              <span>Authority: Deterministic Engine</span>
              <span className="font-mono text-[#147FB3] font-bold">ZERO LLM OVERRIDE</span>
            </div>
          </div>

          {/* Actionable Advice */}
          <div className="p-4 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col justify-between gap-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
                Scenario Action Plan
              </span>
              <div className="flex flex-col gap-1.5">
                {scenario.actionableAdvice.map((adv, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#123B5D]">
                    <span className="w-4 h-4 rounded-full bg-[#EBF7EE] text-[#2E8B57] flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {onAdoptScenario && (
              <button
                type="button"
                onClick={() => onAdoptScenario(scenarioResult)}
                className="w-full mt-2 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white text-xs font-bold tracking-wider transition cursor-pointer shadow-xs text-center"
              >
                APPLY THIS SCENARIO TO MISSION
              </button>
            )}
          </div>
        </div>

        {/* 5. Progressive Disclosure: Rule Changes & Evidence Tabs */}
        <div className="border border-[#D8E5EC] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-[#F9FCFE] border-b border-[#D8E5EC] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-[#147FB3] text-white shadow-xs'
                    : 'text-[#5A7C99] hover:bg-[#EAF5FA]'
                }`}
              >
                Deterministic Rule Comparison ({ruleComparison.newlyTriggeredRules.length + ruleComparison.persistingRules.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'evidence'
                    ? 'bg-[#147FB3] text-white shadow-xs'
                    : 'text-[#5A7C99] hover:bg-[#EAF5FA]'
                }`}
              >
                Audited Evidence Delta ({evidenceComparison.changedEvidence.length + evidenceComparison.newEvidence.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs text-[#5A7C99] hover:text-[#123B5D] flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>{showTechnicalDetails ? 'Collapse' : 'Expand'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showTechnicalDetails && (
            <div className="p-4 bg-white">
              {activeTab === 'rules' ? (
                <div className="flex flex-col gap-3">
                  {/* Newly Triggered Rules */}
                  {ruleComparison.newlyTriggeredRules.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Newly Triggered Constraints ({ruleComparison.newlyTriggeredRules.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ruleComparison.newlyTriggeredRules.map((r, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-[#FDF0F0] border border-[#F8B4B4] text-xs">
                            <div className="flex items-center justify-between font-bold text-[#DC2626]">
                              <span>{r.ruleName}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white uppercase">
                                {r.verdictImpact}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#782424] mt-1">{r.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rules No Longer Triggered */}
                  {ruleComparison.noLongerTriggeredRules.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E8B57] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved Constraints ({ruleComparison.noLongerTriggeredRules.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ruleComparison.noLongerTriggeredRules.map((r, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-[#EBF7EE] border border-[#A3E6B5] text-xs">
                            <div className="flex items-center justify-between font-bold text-[#2E8B57]">
                              <span>{r.ruleName}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white uppercase">
                                RESOLVED
                              </span>
                            </div>
                            <div className="text-[11px] text-[#1E5D3A] mt-1">{r.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Persisting Rules */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
                      Persisting Invariant Rules ({ruleComparison.persistingRules.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {ruleComparison.persistingRules.map((r, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-[#F9FCFE] border border-[#D8E5EC] text-xs">
                          <div className="flex items-center justify-between font-bold text-[#123B5D]">
                            <span className="truncate">{r.ruleName}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#D8E5EC]">
                              {r.verdictImpact}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#5A7C99] mt-1 truncate">{r.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Changed Evidence Table */}
                  {evidenceComparison.changedEvidence.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#123B5D]">
                        Modified Evidence Variables:
                      </span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border border-[#D8E5EC] rounded-lg">
                          <thead className="bg-[#F9FCFE] text-[10px] uppercase text-[#5A7C99] font-bold border-b border-[#D8E5EC]">
                            <tr>
                              <th className="p-2">Variable</th>
                              <th className="p-2">Baseline</th>
                              <th className="p-2">Scenario</th>
                              <th className="p-2">Impact Delta</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2EDF4]">
                            {evidenceComparison.changedEvidence.map((ev, i) => (
                              <tr key={i} className="hover:bg-[#F9FCFE]">
                                <td className="p-2 font-bold text-[#123B5D]">{ev.variable}</td>
                                <td className="p-2 text-[#5A7C99] font-mono">{ev.baselineValue} {ev.unit || ''}</td>
                                <td className="p-2 font-bold text-[#147FB3] font-mono">{ev.scenarioValue} {ev.unit || ''}</td>
                                <td className="p-2 text-xs font-semibold text-[#123B5D]">{ev.impactDelta}</td>
                                <td className="p-2">
                                  {ev.isHypothetical ? (
                                    <span className="px-1.5 py-0.5 rounded bg-[#FFF3CD] text-[#856404] font-mono text-[9px] font-bold border border-[#FFEEBA]">
                                      HYPOTHETICAL
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-[#EBF7EE] text-[#2E8B57] font-mono text-[9px] font-bold border border-[#A3E6B5]">
                                      DERIVED
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Complete Audited Scenario Evidence Log */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
                      Audited Scenario Observations ({scenarioResult.evidence.length} items):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {scenarioResult.evidence.map((item) => (
                        <div key={item.evidenceId} className="p-2 rounded-lg bg-[#F9FCFE] border border-[#D8E5EC] text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#123B5D]">{item.variable}</span>
                            <span className={`px-1 py-0.5 rounded font-mono text-[8px] font-bold uppercase ${
                              item.status === 'DEMO' ? 'bg-[#FFF3CD] text-[#856404]' :
                              item.status === 'ACCESS_PENDING' ? 'bg-[#FEF9EE] text-[#D99520]' :
                              item.notes?.includes('HYPOTHETICAL') ? 'bg-[#FFF3CD] text-[#856404]' :
                              'bg-[#EBF7EE] text-[#2E8B57]'
                            }`}>
                              {item.notes?.includes('HYPOTHETICAL') ? 'HYPOTHETICAL' : item.status}
                            </span>
                          </div>
                          <div className="text-[#5A7C99] mt-0.5 flex items-center justify-between">
                            <span>Source: {item.source}</span>
                            <strong className="text-[#123B5D]">{String(item.value)} {item.unit || ''}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
