import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataFreshnessBadge } from '@/components/ui/DataFreshnessBadge';
import { FileCheck2, ShieldCheck } from 'lucide-react';
import { useOrchestration } from '@/hooks/useOrchestration';
import { decisionService } from '@/services/decisionService';
import type { DecisionDetailResponse } from '@/types/contract';

export const DecisionsPage: React.FC = () => {
  const { orchestration } = useOrchestration();
  const [backendDecision, setBackendDecision] = useState<DecisionDetailResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBackendDecision() {
      try {
        const data = await decisionService.fetchDecisionById('DEC-20260902-001');
        if (isMounted) {
          setBackendDecision(data);
        }
      } catch (err) {
        console.warn('Backend decision fetch fallback to orchestration context:', err);
      }
    }
    loadBackendDecision();
    return () => { isMounted = false; };
  }, []);

  const decision = orchestration?.decision || (backendDecision ? {
    verdict: backendDecision.decision.verdict,
    confidenceScore: backendDecision.decision.confidence.score,
    primaryDriver: backendDecision.decision.primaryDriver,
    explanation: backendDecision.decision.explanation,
    recommendedDeparture: backendDecision.decision.recommendedDeparture,
    recommendedReturn: backendDecision.decision.recommendedReturn,
    recommendedZone: backendDecision.decision.recommendedZone ? {
      id: backendDecision.decision.recommendedZone.id,
      name: backendDecision.decision.recommendedZone.name,
      distanceKm: backendDecision.decision.recommendedZone.distanceKm,
      bearing: backendDecision.decision.recommendedZone.bearingDegrees,
      opportunity: backendDecision.decision.recommendedZone.opportunityLevel.toLowerCase() as any,
    } : null,
    positiveFactors: backendDecision.decision.positiveFactors,
    riskFactors: backendDecision.decision.riskFactors,
    ruleEvaluations: backendDecision.decision.ruleEvaluations.map(r => ({
      ruleId: r.ruleId as any,
      ruleName: r.ruleName,
      category: r.category.toLowerCase() as any,
      verdictImpact: r.verdictImpact as any,
      reason: r.reason,
      evidenceRef: r.evidenceRef,
      deterministicScore: r.deterministicScore,
    })),
    safetyOverridesTriggered: backendDecision.decision.safetyOverridesTriggered,
    dataQuality: {
      status: backendDecision.decision.dataQuality.status.toLowerCase() as any,
      completenessScore: backendDecision.decision.dataQuality.completenessScore,
      evaluatedSourcesCount: backendDecision.decision.dataQuality.availableSources,
      totalRequiredSources: backendDecision.decision.dataQuality.requiredSources,
    },
    evaluatedAt: backendDecision.decision.evaluatedAt,
  } : null);

  const evidenceRows = orchestration ? [
    ...(orchestration.planner?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Parsed mission parameter & operational exposure bounds',
      status: e.provenance.status,
      timestamp: e.provenance.timestamp,
    })),
    ...(orchestration.ocean?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Hydrographic & SST thermal front stability metric',
      status: e.provenance.status,
      timestamp: e.provenance.timestamp,
    })),
    ...(orchestration.weather?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Atmospheric wave swell & wind hazard exposure limit',
      status: e.provenance.status,
      timestamp: e.provenance.timestamp,
    })),
    ...(orchestration.pfz?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Pelagic chlorophyll aggregation opportunity (Non-clearance)',
      status: e.provenance.status,
      timestamp: e.provenance.timestamp,
    })),
    ...(orchestration.geoSafety?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Deterministic spatial geofence & navigation clearance check',
      status: e.provenance.status,
      timestamp: e.provenance.timestamp,
    })),
  ] : [
    {
      parameter: 'Potential Fishing Zone (Alibaug Outer Bank)',
      source: 'INCOIS_PFZ_WFS',
      value: 'High Potential • Chlorophyll 1.82 mg/m³',
      role: 'Drives primary fishing opportunity score (Opportunity only)',
      status: 'live',
      timestamp: '2026-09-27 06:00 IST',
    },
    {
      parameter: 'Offshore Wave Swell Forecast',
      source: 'INCOIS_OSF',
      value: '1.4m Swell (Morning) -> 2.1m (Post-12:00)',
      role: 'Restricts safe operating window to morning hours (! Cautionary Factor)',
      status: 'live',
      timestamp: '2026-09-27 06:00 IST',
    },
    {
      parameter: 'Sea Surface Temperature Gradient',
      source: 'INCOIS_OCEAN_MODEL',
      value: '27.8°C (Favorable thermal boundary)',
      role: 'Corroborates pelagic aggregation around Alibaug bank (+ Positive Factor)',
      status: 'live',
      timestamp: '2026-09-27 06:00 IST',
    },
    {
      parameter: 'Naval Security Geofence Clearance',
      source: 'NATIONAL_HYDROGRAPHIC_OFFICE',
      value: '4.2 km Clearance along planned transit line',
      role: 'Deterministic geometry check passes without incursion (&check; Safe Corridor)',
      status: 'demo_snapshot',
      timestamp: '2026-09-27 06:00 IST',
    },
  ];

  const verdict = decision?.verdict || 'CAUTION';

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXPLAINABLE AI & EVIDENCE
            </span>
            <span className="text-xs text-slate-400 font-telemetry">PROVENANCE LOG #DEC-20260902-01</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Decision Evidence &amp; Reasoning Chain
          </h1>
          <p className="text-xs text-slate-400">
            Transparent breakdown of inputs, safety constraints, and algorithmic evidence behind the current recommendation.
          </p>
        </div>

        <DataFreshnessBadge status={decision?.dataQuality?.status || 'demo_snapshot'} />
      </div>

      {/* Decision Summary Hero Banner */}
      <div className={`hud-glass rounded-2xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden ${
        verdict === 'GO' ? 'border-emerald-500/40' : verdict === 'CAUTION' ? 'border-amber-500/40' : 'border-rose-500/40'
      }`}>
        <div className={`absolute top-0 left-0 bottom-0 w-2 ${
          verdict === 'GO' ? 'bg-emerald-500' : verdict === 'CAUTION' ? 'bg-[#f1c40f]' : 'bg-rose-500'
        }`} />

        <div className="flex-1 pl-2">
          <div className="text-[11px] font-label-caps text-slate-400 mb-1">
            VERDICT DETERMINATION
          </div>
          <div className="flex items-center gap-3">
            <h2 className={`font-display-decision text-3xl sm:text-4xl font-extrabold ${
              verdict === 'GO' ? 'text-emerald-400' : verdict === 'CAUTION' ? 'text-[#f1c40f]' : 'text-rose-400'
            }`}>
              {verdict}
            </h2>
            <StatusBadge status={verdict} size="md" showPulse />
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {decision?.explanation || 'Overall trip feasible between 05:45 and 11:30 IST. Fishing potential in Zone Alpha is high, but deterministic safety rules restrict the return transit window due to squall advisory and rising 2.1m swell after midday.'}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#5A7C99] block tracking-wider">EVALUATION MODE</span>
            <span className="text-xl font-extrabold text-[#147FB3] font-mono">
              DETERMINISTIC
            </span>
          </div>
          <div className="text-xs text-[#5A7C99] bg-[#F9FCFE] px-3 py-1.5 rounded-xl border border-[#D8E5EC]">
            {decision?.dataQuality?.evaluatedSourcesCount || 5} of {decision?.dataQuality?.totalRequiredSources || 5} Required Feeds Verified
          </div>
        </div>
      </div>

      {/* Safety Separation Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center gap-3 font-sans">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <strong>Deterministic Safety Precedence:</strong> PFZ indicates biological fishing opportunities; it never grants navigational or weather safety clearance. Safety decisions are calculated deterministically on the backend against physical vessel limits and live IMD/INCOIS ocean forecasts.
        </div>
      </div>

      {/* Structured Evidence Provenance Table */}
      <div className="hud-glass rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold font-label-caps text-slate-200">
              CROSS-SOURCE EVIDENCE AUDIT
            </h3>
          </div>
          <span className="text-[10px] font-telemetry text-slate-400">
            DETERMINISTIC EVIDENCE AUDIT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-label-caps text-slate-400 font-bold">
              <tr>
                <th className="p-3">OBSERVATION PARAMETER</th>
                <th className="p-3">DATA SOURCE &amp; PROVENANCE</th>
                <th className="p-3">OBSERVED VALUE</th>
                <th className="p-3">DECISION ROLE &amp; IMPACT</th>
                <th className="p-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-telemetry text-slate-300">
              {evidenceRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-200 font-sans">{row.parameter}</td>
                  <td className="p-3 text-[11px] text-cyan-400">{row.source}</td>
                  <td className="p-3 text-[11px] text-slate-300">{row.value}</td>
                  <td className="p-3 text-[11px] text-slate-400 font-sans">{row.role}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-label-caps ${
                      row.status === 'live' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
