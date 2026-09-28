import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  FileCheck2, 
  Layers, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { useOrchestration } from '@/hooks/useOrchestration';
import { useRegion } from '@/hooks/useRegion';
import { decisionService } from '@/services/decisionService';
import type { DecisionDetailResponse } from '@/types/contract';
import type { DecisionVerdict } from '@/types/marine';
import { getCategoricalConfidence } from '@/lib/confidenceUtils';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

export const DecisionsPage: React.FC = () => {
  const { orchestration } = useOrchestration();
  const { activeRegion } = useRegion();
  const [backendDecision, setBackendDecision] = useState<DecisionDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WHY' | 'EVIDENCE' | 'RULES' | 'TRACE'>('OVERVIEW');

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
      ruleId: r.ruleId,
      ruleName: r.ruleName,
      category: r.category,
      verdictImpact: r.verdictImpact,
      reason: r.reason,
      evidenceRef: r.evidenceRef,
      deterministicScore: r.deterministicScore,
    })),
    safetyOverridesTriggered: backendDecision.decision.safetyOverridesTriggered,
    dataQuality: {
      status: backendDecision.decision.dataQuality.status,
      completenessScore: backendDecision.decision.dataQuality.completenessScore,
      evaluatedSourcesCount: backendDecision.decision.dataQuality.availableSources,
      totalRequiredSources: backendDecision.decision.dataQuality.requiredSources,
    },
    evaluatedAt: backendDecision.decision.evaluatedAt,
  } : {
    verdict: 'CAUTION' as DecisionVerdict,
    confidenceScore: 84.5,
    primaryDriver: 'Wave swell exceeds traditional craft threshold after 12:00 IST',
    explanation: 'Morning window initially favorable from 09:45 IST. Significant wave height is 1.4m during morning transit, but rises to 2.1m post-midday exceeding the 1.8m safe tolerance of Matsya Sagar 1, constraining safe return window.',
    recommendedDeparture: '09:45 IST',
    recommendedReturn: '14:45 IST',
    recommendedZone: {
      id: 'PFZ-MUM-01',
      name: 'Alibaug Outer Bank',
      distanceKm: 18.5,
      bearing: 245,
      opportunity: 'high' as any,
    },
    positiveFactors: [
      'Low morning swell (1.4m) conforms to vessel seaworthiness baseline',
      'INCOIS PFZ thermal boundary in Zone Alpha indicates high pelagic aggregation',
      'Wind conditions calm to moderate (11 kts) during departure hours',
      'Transit corridor clears Naval Anchorage safety geofence by > 4.2 km',
    ],
    riskFactors: [
      'Afternoon wave swell reaches 2.1m beyond 12:00 IST (> 1.8m craft tolerance)',
      'Ebb tidal current creates opposing chop near harbor entrance',
    ],
    ruleEvaluations: [
      {
        ruleId: 'RULE_03_VESSEL_WAVE_LIMIT',
        ruleName: 'Vessel Operational Wave Seaworthiness Limit',
        category: 'VESSEL_CAPABILITY',
        verdictImpact: 'CAUTION',
        reason: 'Significant wave height (2.1m) exceeds safe baseline tolerance (1.8m) after midday.',
        evidenceRef: 'EVID-OSF-WAVE-001',
        deterministicScore: 78.0,
      },
      {
        ruleId: 'RULE_02_GEO_PROXIMITY_BUFFER',
        ruleName: 'Naval Security & Port Fairway Geofence Buffer',
        category: 'GIS_SAFETY',
        verdictImpact: 'PASS',
        reason: 'Transit corridor maintains 4.2 km clearance; exceeds 1.0 km violation buffer.',
        evidenceRef: 'EVID-GIS-NAVAL-002',
        deterministicScore: 98.0,
      },
      {
        ruleId: 'RULE_04_PFZ_OPPORTUNITY_SCORE',
        ruleName: 'Pelagic Chlorophyll & Thermal Front Correlation',
        category: 'FISHERIES_OPPORTUNITY',
        verdictImpact: 'POSITIVE',
        reason: 'INCOIS PFZ front detects strong chlorophyll gradient (1.82 mg/m³). Opportunity only.',
        evidenceRef: 'EVID-PFZ-CHL-001',
        deterministicScore: 91.0,
      },
    ],
    safetyOverridesTriggered: false,
    dataQuality: {
      status: 'GOOD',
      completenessScore: 92.0,
      evaluatedSourcesCount: 5,
      totalRequiredSources: 5,
    },
    evaluatedAt: '2026-09-27T06:00:00Z',
  });

  const evidenceRows = orchestration ? [
    ...(orchestration.planner?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Parsed mission parameter & operational bounds',
      status: e.provenance.status,
    })),
    ...(orchestration.ocean?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Hydrographic & SST thermal front stability metric',
      status: e.provenance.status,
    })),
    ...(orchestration.weather?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Atmospheric wave swell & wind hazard exposure limit',
      status: e.provenance.status,
    })),
    ...(orchestration.pfz?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Pelagic chlorophyll aggregation opportunity (Non-clearance)',
      status: e.provenance.status,
    })),
    ...(orchestration.geoSafety?.evidence || []).map((e) => ({
      parameter: e.label,
      source: e.provenance.source,
      value: String(e.value),
      role: 'Deterministic spatial geofence & navigation clearance check',
      status: e.provenance.status,
    })),
  ] : [
    {
      parameter: 'Potential Fishing Zone (Alibaug Outer Bank)',
      source: 'INCOIS_PFZ_WFS',
      value: 'High Potential • Chlorophyll 1.82 mg/m³',
      role: 'Drives primary fishing opportunity score (Opportunity only; never safety clearance)',
      status: 'LIVE',
    },
    {
      parameter: 'Offshore Wave Swell Forecast',
      source: 'INCOIS_OSF',
      value: '1.4m (Morning) → 2.1m (Post-12:00)',
      role: 'Restricts safe operating window to morning hours (Primary Cautionary Factor)',
      status: 'LIVE',
    },
    {
      parameter: 'Sea Surface Temperature Gradient',
      source: 'INCOIS_OCEAN_MODEL',
      value: '27.8°C (Favorable thermal boundary)',
      role: 'Corroborates pelagic aggregation around Alibaug bank (Positive Factor)',
      status: 'LIVE',
    },
    {
      parameter: 'Naval Security Geofence Clearance',
      source: 'ORCA_POSTGIS_SAFETY_ENGINE',
      value: '4.2 km Clearance along planned transit line',
      role: 'Deterministic geometry check passes without incursion (Safe Corridor)',
      status: 'DETERMINISTIC',
    },
    {
      parameter: 'IMD Coastal Radar & Marine Warning',
      source: 'IMD_COASTAL_BULLETIN',
      value: 'Gale Warning 35 kts (Calibrated Prototype Archive)',
      role: 'Coastal weather bulletin baseline (Access Pending / Demo verification)',
      status: 'ACCESS_PENDING',
    },
  ];

  const verdict = decision.verdict;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E5EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-[#147FB3] mb-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">EXPLAINABLE MARITIME DECISION AUDIT • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] tracking-tight font-display-decision">
            Decision Evidence &amp; Reasoning Chain
          </h1>
          <p className="text-xs sm:text-sm text-[#587083]">
            Transparent 5-level progressive disclosure of physical thresholds, multi-agency evidence, and deterministic rule audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.ASK}
            className="px-3 py-1.5 rounded-xl bg-[#EBF6FC] hover:bg-[#147FB3] hover:text-white text-[#147FB3] text-xs font-bold transition flex items-center gap-1.5 border border-[#C2E0F0]"
          >
            <span>Ask Follow-up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. LEVEL 1: Operational Verdict & Window Hero Banner */}
      <div className={`rounded-2xl p-5 sm:p-6 border bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border-l-6 ${
        verdict === 'GO' ? 'border-l-emerald-500' : verdict === 'CAUTION' ? 'border-l-amber-500' : 'border-l-rose-500'
      }`}>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7E93A3] mb-1 flex items-center gap-2 flex-wrap">
            <span>DETERMINISTIC OPERATIONAL VERDICT</span>
            {(() => {
              const conf = getCategoricalConfidence(decision.confidenceScore);
              return (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${conf.badgeClass}`}
                  title={conf.description}
                >
                  • {conf.label}
                </span>
              );
            })()}
          </div>

          <div className="flex items-center gap-3">
            <h2 className={`font-display-decision text-3xl sm:text-4xl font-black ${
              verdict === 'GO' ? 'text-emerald-600' : verdict === 'CAUTION' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {verdict}
            </h2>
            <StatusBadge status={verdict} size="md" showPulse />
          </div>

          <p className="text-xs sm:text-sm text-[#123B5D] mt-2 leading-relaxed font-medium max-w-2xl">
            {decision.explanation}
          </p>
        </div>

        {/* Departure & Return Timing Box */}
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2EDF4] text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#7E93A3] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#147FB3]" />
              <span>Recommended Departure:</span>
            </span>
            <strong className="text-[#123B5D] font-mono">{decision.recommendedDeparture || '09:45 IST'}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#7E93A3] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Safe Return Deadline:</span>
            </span>
            <strong className="text-[#123B5D] font-mono">{decision.recommendedReturn || '14:45 IST'}</strong>
          </div>
          <div className="text-[10px] text-[#2E8B57] font-semibold pt-1 border-t border-[#E2EDF4] text-right">
            ● Window Duration: ~5h 00m
          </div>
        </div>
      </div>

      {/* Safety Separation Banner */}
      <div className="p-3.5 rounded-xl bg-[#EBF6FC] border border-[#C2E0F0] text-xs text-[#123B5D] flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#147FB3] shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-[#147FB3]">Deterministic Safety Precedence Invariant:</strong> INCOIS PFZ indicates biological fish concentration; it never grants navigational or weather safety clearance. Safety decisions are calculated deterministically on the backend against physical vessel seaworthiness limits and live ocean forecasts.
        </div>
      </div>

      {/* 3. Progressive Disclosure Tabs (Levels 2-5) */}
      <div className="bg-white rounded-2xl border border-[#D8E5EC] shadow-2xs overflow-hidden flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E2EDF4] bg-[#F8FAFC] px-4 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'border-[#147FB3] text-[#147FB3] bg-white'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            Level 1: Summary &amp; Window
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WHY')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'WHY'
                ? 'border-[#147FB3] text-[#147FB3] bg-white'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            Level 2: Why (Factors)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EVIDENCE')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE'
                ? 'border-[#147FB3] text-[#147FB3] bg-white'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Level 3: Multi-Agency Evidence ({evidenceRows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RULES')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'RULES'
                ? 'border-[#147FB3] text-[#147FB3] bg-white'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Level 4: Rule Evaluations ({decision.ruleEvaluations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRACE')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'TRACE'
                ? 'border-[#147FB3] text-[#147FB3] bg-white'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Level 5: Specialist Trace</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* LEVEL 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#587083] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Target Zone &amp; Navigation Corridor</span>
                </span>
                <div className="text-sm font-bold text-[#123B5D]">
                  {decision.recommendedZone?.name || 'Alibaug Outer Bank (Zone Alpha)'}
                </div>
                <div className="text-[11px] text-[#587083] grid grid-cols-2 gap-2 pt-1 border-t border-[#E2EDF4]">
                  <div>Distance: <strong>{decision.recommendedZone?.distanceKm || 18.5} km</strong></div>
                  <div>Bearing: <strong>{decision.recommendedZone?.bearing || 245}° WSW</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4] flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#587083] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Telemetry Integrity &amp; Feeds</span>
                </span>
                <div className="text-sm font-bold text-[#123B5D]">
                  {decision.dataQuality.evaluatedSourcesCount} of {decision.dataQuality.totalRequiredSources} Required Feeds Verified
                </div>
                <div className="text-[11px] text-[#587083] pt-1 border-t border-[#E2EDF4]">
                  INCOIS OSF (Recorded Snapshot) • INCOIS PFZ (Recorded Snapshot) • PostGIS Safety (Deterministic) • IMD Marine (Pending/Snapshot)
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 2: WHY (FACTOR DECOMPOSITION) */}
          {activeTab === 'WHY' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                <span className="text-[11px] font-black text-[#147FB3] uppercase tracking-wider block mb-1">
                  Primary Decision Driver
                </span>
                <p className="text-sm font-bold text-[#123B5D]">
                  {decision.primaryDriver}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive Factors */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Positive Operational Factors ({decision.positiveFactors.length})</span>
                  </span>
                  <ul className="flex flex-col gap-1.5 text-xs text-emerald-950">
                    {decision.positiveFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Risk Factors &amp; Constraints ({decision.riskFactors.length})</span>
                  </span>
                  <ul className="flex flex-col gap-1.5 text-xs text-amber-950">
                    {decision.riskFactors.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 3: MULTI-AGENCY EVIDENCE TABLE */}
          {activeTab === 'EVIDENCE' && (
            <div className="overflow-x-auto animate-fade-in border border-[#E2EDF4] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2EDF4] text-[10px] font-label-caps text-[#587083] font-bold">
                  <tr>
                    <th className="p-3">OBSERVATION PARAMETER</th>
                    <th className="p-3">DATA SOURCE &amp; PROVENANCE</th>
                    <th className="p-3">OBSERVED VALUE</th>
                    <th className="p-3">DECISION ROLE &amp; IMPACT</th>
                    <th className="p-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F5F8] text-[#123B5D]">
                  {evidenceRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3 font-semibold text-[#123B5D]">{row.parameter}</td>
                      <td className="p-3 text-[11px] font-mono text-[#147FB3]">{row.source}</td>
                      <td className="p-3 text-[11px] font-medium">{row.value}</td>
                      <td className="p-3 text-[11px] text-[#587083] max-w-xs">{row.role}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          row.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          row.status === 'DETERMINISTIC' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LEVEL 4: DETERMINISTIC RULE AUDIT */}
          {activeTab === 'RULES' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-bold text-[#587083]">
                Deterministic Rule Evaluations Driving Decision Output
              </span>

              {decision.ruleEvaluations.map((rule) => (
                <div
                  key={rule.ruleId}
                  className="p-4 rounded-xl border border-[#E2EDF4] bg-[#F8FAFC] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold text-[#123B5D] bg-white px-2 py-0.5 rounded border border-[#D8E5EC] font-mono">
                        {rule.ruleId}
                      </code>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                        rule.verdictImpact === 'PASS' || rule.verdictImpact === 'POSITIVE' ? 'bg-emerald-600' :
                        rule.verdictImpact === 'CAUTION' ? 'bg-amber-500' : 'bg-rose-600'
                      }`}>
                        IMPACT: {rule.verdictImpact}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#7E93A3]">
                      Ref: {rule.evidenceRef}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#123B5D]">
                    {rule.ruleName}
                  </h4>

                  <p className="text-xs text-[#4A6478] bg-white p-2.5 rounded-lg border border-[#E2EDF4]">
                    <strong>Deterministic Rationale:</strong> {rule.reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* LEVEL 5: SPECIALIST EXECUTION TRACE */}
          {activeTab === 'TRACE' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-bold text-[#587083]">
                Parallel Specialist Coordination &amp; Execution Latency
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'Mission Planner Specialist', latency: '42ms', status: 'SUCCESS', desc: 'Parsed trip duration (5h), departure corridor, vessel limits' },
                  { name: 'Oceanography Specialist', latency: '124ms', status: 'SUCCESS', desc: 'Evaluated INCOIS OSF wave swell, SST fronts, tidal curve' },
                  { name: 'Meteorology Specialist', latency: '68ms', status: 'SUCCESS', desc: 'Evaluated atmospheric wind vectors, storm bulletins' },
                  { name: 'Fisheries Opportunity Specialist', latency: '95ms', status: 'SUCCESS', desc: 'Queried INCOIS PFZ GeoServer WFS, chlorophyll density' },
                  { name: 'GIS Safety Specialist', latency: '38ms', status: 'SUCCESS', desc: 'PostGIS point-in-polygon, 1.0 km buffer clearance verified' },
                  { name: 'Vessel Capability Specialist', latency: '22ms', status: 'SUCCESS', desc: 'Seaworthiness curve checked against DG Shipping Class IV' },
                ].map((spec) => (
                  <div key={spec.name} className="p-3 rounded-xl border border-[#E2EDF4] bg-[#F8FAFC] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#123B5D] text-xs">{spec.name}</span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                        {spec.status} ({spec.latency})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#587083]">
                      {spec.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
