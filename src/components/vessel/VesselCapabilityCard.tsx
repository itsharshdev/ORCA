import React, { useState, useEffect } from 'react';
import {
  Anchor,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Wind,
  Waves,
  Clock,
  Navigation,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { vesselCapabilityService } from '@/services/vesselCapabilityService';
import type {
  CapabilityEvaluationResponse,
  CapabilityEvaluationRequest,
  ThresholdProvenanceStatus,
} from '@/types/contract';

interface VesselCapabilityCardProps {
  vesselId?: string;
  missionDistanceNm?: number;
  maxDistanceFromPortNm?: number;
  missionDurationHours?: number;
  plannedCrewCount?: number;
  waveHeightMeters?: number;
  windSpeedKnots?: number;
  requiredEquipment?: string[];
  className?: string;
  role?: 'FISHERMAN' | 'AUTHORITY' | 'RESEARCHER' | 'OPERATOR' | string;
}

export const VesselCapabilityCard: React.FC<VesselCapabilityCardProps> = ({
  vesselId = 'VESSEL-001',
  missionDistanceNm = 14.5,
  maxDistanceFromPortNm = 8.2,
  missionDurationHours = 5.0,
  plannedCrewCount = 3,
  waveHeightMeters = 1.2,
  windSpeedKnots = 14.0,
  requiredEquipment,
  className = '',
  role = 'FISHERMAN',
}) => {
  const [evaluation, setEvaluation] = useState<CapabilityEvaluationResponse | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(role !== 'FISHERMAN');

  useEffect(() => {
    let isMounted = true;

    const req: CapabilityEvaluationRequest = {
      vesselId,
      missionDistanceNm,
      maxDistanceFromPortNm,
      missionDurationHours,
      plannedCrewCount,
      environmentalContext: {
        waveHeightMeters,
        windSpeedKnots,
      },
      requiredEquipment: requiredEquipment || ['VHF_RADIO', 'LIFE_JACKETS'],
    };

    vesselCapabilityService
      .evaluateCapability(req)
      .then((res) => {
        if (isMounted) {
          setEvaluation(res);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Capability evaluation error:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    vesselId,
    missionDistanceNm,
    maxDistanceFromPortNm,
    missionDurationHours,
    plannedCrewCount,
    waveHeightMeters,
    windSpeedKnots,
    requiredEquipment,
  ]);

  const renderProvenanceBadge = (status: ThresholdProvenanceStatus) => {
    switch (status) {
      case 'OFFICIAL_SOURCED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
            OFFICIAL STATUTORY
          </span>
        );
      case 'VESSEL_SPECIFIC':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-300">
            VESSEL SPECIFIC
          </span>
        );
      case 'PROTOTYPE_ASSUMPTION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-300">
            PROTOTYPE ASSUMPTION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-600 border border-slate-300">
            UNKNOWN
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            PASS
          </span>
        );
      case 'CAUTION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            CAUTION
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            FAIL
          </span>
        );
      case 'UNKNOWN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            UNVERIFIED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            N/A
          </span>
        );
    }
  };

  const rangeEval = evaluation?.evaluations.find((e) => e.category === 'RANGE');
  const enduranceEval = evaluation?.evaluations.find((e) => e.category === 'ENDURANCE');
  const waveEval = evaluation?.evaluations.find((e) => e.category === 'WAVE');
  const windEval = evaluation?.evaluations.find((e) => e.category === 'WIND');

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDF5F8] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3]">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#587083] uppercase font-telemetry tracking-wider font-bold">
              VESSEL CAPABILITY
            </div>
            <h3 className="text-base font-bold text-[#123B5D] tracking-tight font-display-decision">
              {evaluation?.vesselName || 'Matsya Sagar 1'}
              <span className="text-xs text-[#587083] font-normal ml-2">
                ({evaluation?.vesselType || 'Traditional Motorized'})
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {evaluation?.hasCriticalFailure ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
              <XCircle className="w-3.5 h-3.5" />
              CAPABILITY EXCEEDED
            </span>
          ) : evaluation?.hasWarnings ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              MARGIN LIMITED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              VESSEL COMPATIBLE
            </span>
          )}
        </div>
      </div>

      {/* Fisherman Simple Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Operating Range */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Navigation className="w-3.5 h-3.5 text-[#147FB3]" />
              Trip Range
            </span>
            {renderStatusBadge(rangeEval?.status || 'PASS')}
          </div>
          <div className="text-sm font-bold text-[#1E293B]">
            {missionDistanceNm.toFixed(1)} NM
            <span className="text-[11px] text-[#64748B] font-normal block">
              Max limit: {rangeEval?.configuredLimit?.value ?? 25} NM
            </span>
          </div>
        </div>

        {/* Operating Duration */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#147FB3]" />
              Endurance
            </span>
            {renderStatusBadge(enduranceEval?.status || 'PASS')}
          </div>
          <div className="text-sm font-bold text-[#1E293B]">
            {missionDurationHours.toFixed(1)} hrs
            <span className="text-[11px] text-[#64748B] font-normal block">
              Max limit: {enduranceEval?.configuredLimit?.value ?? 10} hrs
            </span>
          </div>
        </div>

        {/* Wave Seaworthiness */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Waves className="w-3.5 h-3.5 text-[#0284C7]" />
              Wave Limit
            </span>
            {renderStatusBadge(waveEval?.status || 'PASS')}
          </div>
          <div className="text-sm font-bold text-[#1E293B]">
            {waveHeightMeters ? `${waveHeightMeters.toFixed(1)} m` : 'Unsupplied'}
            <span className="text-[11px] text-[#64748B] font-normal block">
              Max limit: {waveEval?.configuredLimit?.value ?? 1.8} m
            </span>
          </div>
        </div>

        {/* Wind Compatibility */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Wind className="w-3.5 h-3.5 text-[#0D9488]" />
              Wind Limit
            </span>
            {renderStatusBadge(windEval?.status || 'PASS')}
          </div>
          <div className="text-sm font-bold text-[#1E293B]">
            {windSpeedKnots ? `${windSpeedKnots.toFixed(1)} kts` : 'Unsupplied'}
            <span className="text-[11px] text-[#64748B] font-normal block">
              Max limit: {windEval?.configuredLimit?.value ?? 18} kts
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Compatibility Notes */}
      <div className="space-y-1.5 text-xs text-[#334155] bg-[#F1F5F9]/60 rounded-xl p-3 border border-[#E2E8F0]">
        {evaluation?.evaluations
          .filter((e) => e.status === 'FAIL' || e.status === 'CAUTION')
          .map((e, idx) => (
            <div key={idx} className="flex items-start gap-2">
              {e.status === 'FAIL' ? (
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>
                <strong>{e.category}:</strong> {e.reason}
              </span>
            </div>
          ))}

        {(!evaluation?.evaluations.some((e) => e.status === 'FAIL' || e.status === 'CAUTION')) && (
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              All vessel physical limits (wave, wind, range, endurance, and fuel reserve) are within safe operating thresholds.
            </span>
          </div>
        )}
      </div>

      {/* Progressive Disclosure Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center justify-between w-full text-xs font-semibold text-[#147FB3] hover:text-[#0E5C82] pt-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {showTechnicalDetails
              ? 'Hide Detailed Constraint Provenance'
              : 'View Technical Capability & Provenance Details'}
          </span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Technical Provenance Table */}
        {showTechnicalDetails && evaluation && (
          <div className="mt-3 border-t border-[#E2E8F0] pt-3 overflow-x-auto">
            <div className="text-[11px] text-[#64748B] mb-2 flex items-center justify-between">
              <span>
                Engine: <code className="text-[#0F172A] font-bold">{evaluation.provenance.engine}</code> |{' '}
                {evaluation.provenance.rulesEvaluatedCount} rules evaluated
              </span>
              <span>Evaluated: {new Date(evaluation.evaluatedAt).toLocaleTimeString()}</span>
            </div>

            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]">
                  <th className="py-2 px-2.5 font-semibold">Constraint</th>
                  <th className="py-2 px-2.5 font-semibold">Input Value</th>
                  <th className="py-2 px-2.5 font-semibold">Configured Limit</th>
                  <th className="py-2 px-2.5 font-semibold">Threshold Provenance</th>
                  <th className="py-2 px-2.5 font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {evaluation.evaluations.map((ev, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC]">
                    <td className="py-2 px-2.5 font-medium text-[#1E293B]">
                      {ev.category}
                      <span className="text-[10px] text-[#64748B] block font-mono">{ev.constraintId}</span>
                    </td>
                    <td className="py-2 px-2.5 text-[#334155]">
                      {ev.actualValue !== null && ev.actualValue !== undefined
                        ? Array.isArray(ev.actualValue)
                          ? ev.actualValue.join(', ')
                          : `${ev.actualValue} ${ev.unit || ''}`
                        : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-[#334155]">
                      {Array.isArray(ev.configuredLimit.value)
                        ? ev.configuredLimit.value.join(', ')
                        : `${ev.configuredLimit.value} ${ev.configuredLimit.unit || ''}`}
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="flex flex-col gap-0.5">
                        {renderProvenanceBadge(ev.sourceStatus)}
                        {ev.sourceDescription && (
                          <span className="text-[9px] text-[#64748B] max-w-[180px] truncate" title={ev.sourceDescription}>
                            {ev.sourceDescription}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2.5">{renderStatusBadge(ev.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
