import React, { useState, useEffect } from 'react';
import type { AlertItem, AlertDetailResponse, UserRole } from '@/types/contract';
import { alertService } from '@/services/alertService';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  CheckCheck,
  Database,
  FileCheck,
  Loader2
} from 'lucide-react';

interface AlertDetailModalProps {
  alert: AlertItem;
  userRole?: UserRole | string;
  onClose: () => void;
  onStatusUpdated?: (updated: AlertItem) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert: initialAlert,
  userRole = 'FISHERMAN',
  onClose,
  onStatusUpdated,
}) => {
  const [alert, setAlert] = useState<AlertItem>(initialAlert);
  const [detail, setDetail] = useState<AlertDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WHY' | 'EVIDENCE' | 'RULES'>('OVERVIEW');
  const [operatorNote, setOperatorNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    alertService
      .getAlertDetail(initialAlert.id)
      .then((res) => {
        if (isMounted) {
          setDetail(res);
          setAlert(res.alert);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fallback if backend offline
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialAlert.id]);

  const handleAcknowledge = async () => {
    setActionInProgress(true);
    setErrorMessage(null);
    try {
      const updated = await alertService.acknowledgeAlert(
        alert.id,
        'OP-USER-01',
        userRole,
        operatorNote || 'Acknowledged by operator in console'
      );
      setAlert(updated);
      if (onStatusUpdated) onStatusUpdated(updated);
      setOperatorNote('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResolve = async () => {
    setActionInProgress(true);
    setErrorMessage(null);
    try {
      const updated = await alertService.resolveAlert(
        alert.id,
        'OP-USER-01',
        userRole,
        operatorNote || 'Condition mitigated or hazard cleared'
      );
      setAlert(updated);
      if (onStatusUpdated) onStatusUpdated(updated);
      setOperatorNote('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resolve alert');
    } finally {
      setActionInProgress(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white';
      case 'WARNING':
        return 'bg-amber-500 text-white';
      case 'ADVISORY':
        return 'bg-sky-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-[#D8E5EC] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E2EDF4] flex items-start justify-between gap-4 bg-[#F8FAFC]">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide ${getSeverityBadge(alert.severity)}`}>
                {alert.severity}
              </span>
              <span className="font-mono text-xs font-bold text-[#7E93A3]">{alert.id}</span>
              <span className="text-xs text-[#587083]">• {alert.category.replace('_', ' ')}</span>
              
              {/* Provenance Tag */}
              {alert.provenance.status === 'LIVE' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LIVE TELEMETRY
                </span>
              ) : alert.provenance.status === 'ACCESS_PENDING' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                  ACCESS PENDING (HONEST TRACE)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
                  CALIBRATED DEMO SNAPSHOT
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-[#123B5D] font-display-decision">
              {alert.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7E93A3] hover:text-[#123B5D] hover:bg-[#E2EDF4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Navigation Tabs (Progressive Disclosure) */}
        <div className="flex items-center px-4 sm:px-6 border-b border-[#E2EDF4] bg-white gap-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'border-[#147FB3] text-[#147FB3]'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            Level 1: What &amp; Action
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WHY')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'WHY'
                ? 'border-[#147FB3] text-[#147FB3]'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            Level 2: Why (Driver)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EVIDENCE')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE'
                ? 'border-[#147FB3] text-[#147FB3]'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Level 3: Evidence ({detail?.evidence.length ?? alert.evidenceIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RULES')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'RULES'
                ? 'border-[#147FB3] text-[#147FB3]'
                : 'border-transparent text-[#587083] hover:text-[#123B5D]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Level 4: Rule Trace</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {loading && (
            <div className="flex items-center justify-center p-8 text-[#147FB3] gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-semibold">Loading verified audit trace...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* LEVEL 1: OVERVIEW & ACTION */}
          {activeTab === 'OVERVIEW' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2EDF4] flex flex-col gap-3">
                <span className="text-xs font-bold text-[#147FB3] uppercase tracking-wider">
                  Hazard Description
                </span>
                <p className="text-sm text-[#123B5D] leading-relaxed">
                  {alert.message}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#587083]">
                    <MapPin className="w-4 h-4 text-[#147FB3]" />
                    <span>Affected Geography</span>
                  </div>
                  <div className="text-sm font-bold text-[#123B5D]">
                    {alert.affectedArea.name}
                  </div>
                  {alert.affectedArea.radiusKm && (
                    <div className="text-xs text-[#7E93A3]">
                      Radial Boundary: {alert.affectedArea.radiusKm} km radius
                    </div>
                  )}
                  {alert.affectedArea.bufferMeters && (
                    <div className="text-xs text-[#7E93A3]">
                      Buffer Clearance: {alert.affectedArea.bufferMeters}m
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#587083]">
                    <Clock className="w-4 h-4 text-[#147FB3]" />
                    <span>Validity Window</span>
                  </div>
                  <div className="text-xs text-[#123B5D]">
                    <strong>Valid From:</strong> {new Date(alert.validFrom).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#123B5D]">
                    <strong>Valid Until:</strong> {alert.validUntil ? new Date(alert.validUntil).toLocaleString() : 'Permanent / Continuous'}
                  </div>
                  <div className="text-[11px] text-[#7E93A3]">
                    Issued: {new Date(alert.issuedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="p-4 rounded-2xl border border-[#C2E0F0] bg-[#EBF6FC] flex flex-col gap-1.5">
                <span className="text-xs font-black text-[#147FB3] uppercase tracking-wider">
                  Mandatory Actionable Recommendation
                </span>
                <p className="text-sm font-bold text-[#123B5D]">
                  {alert.actionRecommendation}
                </p>
                <span className="text-[11px] text-[#587083]">
                  Non-autonomous recommendation: Human master/operator maintains ultimate navigational command.
                </span>
              </div>

              {/* Workflow Status Card */}
              <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                <span className="text-xs font-bold text-[#587083] uppercase tracking-wider">
                  Operational Workflow State
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div>
                    Status: <strong className="text-[#123B5D]">{alert.status}</strong>
                  </div>
                  {alert.acknowledgement && (
                    <div className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Acknowledged by <strong>{alert.acknowledgement.acknowledgedBy}</strong> at {new Date(alert.acknowledgement.acknowledgedAt).toLocaleTimeString()}
                    </div>
                  )}
                  {alert.resolution && (
                    <div className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Resolved by <strong>{alert.resolution.resolvedBy}</strong> at {new Date(alert.resolution.resolvedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 2: WHY (DRIVER) */}
          {activeTab === 'WHY' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="p-5 rounded-2xl border border-[#E2EDF4] bg-[#F8FAFC] flex flex-col gap-3">
                <span className="text-xs font-black text-[#147FB3] uppercase tracking-wider">
                  Deterministic Reason &amp; Impact Analysis
                </span>
                <p className="text-sm sm:text-base font-semibold text-[#123B5D] leading-relaxed">
                  {alert.whyExplanation}
                </p>
                <div className="pt-2 border-t border-[#E2EDF4] flex flex-wrap items-center justify-between text-xs text-[#587083]">
                  <span>Deterministic Confidence: <strong>{alert.confidence.score}% ({alert.confidence.level})</strong></span>
                  <span>Fingerprint: <code className="font-mono text-[11px] text-[#7E93A3]">{alert.fingerprint}</code></span>
                </div>
                <p className="text-xs text-[#7E93A3] italic">
                  {alert.confidence.explanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                <span className="text-xs font-bold text-[#587083]">Source Provenance Audit</span>
                <div className="text-xs text-[#123B5D] grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <strong>Agency / Authority:</strong> {alert.provenance.sourceName || alert.source}
                  </div>
                  <div>
                    <strong>Reliability Model:</strong> {alert.provenance.sourceReliability}
                  </div>
                  <div>
                    <strong>Live Telemetry Feed:</strong> {alert.provenance.isLive ? 'Yes (Verified)' : 'No (Reference Snapshot)'}
                  </div>
                  <div>
                    <strong>Dataset Identifier:</strong> {alert.dataset}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 3: EVIDENCE */}
          {activeTab === 'EVIDENCE' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-bold text-[#587083]">
                Verified Evidence Items Tied to Deterministic Rules
              </span>

              {(!detail?.evidence || detail.evidence.length === 0) ? (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2EDF4] text-center text-xs text-[#7E93A3]">
                  No linked evidence records attached to this baseline snapshot.
                </div>
              ) : (
                detail.evidence.map((ev) => (
                  <div
                    key={ev.evidenceId}
                    className="p-4 rounded-2xl border border-[#E2EDF4] bg-white shadow-2xs flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[#147FB3]">{ev.evidenceId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#EBF6FC] text-[#147FB3] border border-[#C2E0F0]">
                            {ev.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            ev.status === 'FRESH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            ev.status === 'ACCESS_PENDING' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {ev.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#123B5D]">
                          {ev.variable}: <span className="text-[#147FB3]">{String(ev.value)} {ev.unit || ''}</span>
                        </h4>
                      </div>

                      <div className="text-right text-[11px] text-[#7E93A3]">
                        Spatial: <strong>{ev.spatialRelevance}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A6478]">
                      {ev.notes || ev.transformation}
                    </p>

                    <div className="pt-2 border-t border-[#F0F5F8] flex flex-wrap items-center justify-between text-[11px] text-[#7E93A3]">
                      <span>Source: <strong className="text-[#123B5D]">{ev.source}</strong> ({ev.dataset})</span>
                      <span>Observed: {new Date(ev.observedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* LEVEL 4: RULE TRACE */}
          {activeTab === 'RULES' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-bold text-[#587083]">
                Deterministic Rule Evaluations Driving Alert Severity
              </span>

              {(!detail?.ruleEvaluations || detail.ruleEvaluations.length === 0) ? (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2EDF4] text-center text-xs text-[#7E93A3]">
                  No rule evaluation audits recorded.
                </div>
              ) : (
                detail.ruleEvaluations.map((rule) => (
                  <div
                    key={rule.ruleId}
                    className="p-4 rounded-2xl border border-[#E2EDF4] bg-white shadow-2xs flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs font-bold text-[#123B5D] bg-[#F1F5F9] px-2 py-0.5 rounded font-mono">
                            {rule.ruleId}
                          </code>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            rule.result === 'FAIL' ? 'bg-rose-600 text-white' :
                            rule.result === 'CAUTION' ? 'bg-amber-500 text-white' :
                            'bg-emerald-600 text-white'
                          }`}>
                            RESULT: {rule.result}
                          </span>
                          <span className="text-[10px] text-[#7E93A3]">
                            Category: {rule.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#123B5D]">
                          {rule.ruleName}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A6478] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2EDF4]">
                      <strong>Rule Reason:</strong> {rule.reason}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#587083] pt-1">
                      <div>
                        <strong>Threshold Source:</strong> <span className="text-[#123B5D]">{rule.thresholdSource}</span>
                      </div>
                      <div>
                        <strong>Evidence Ref:</strong> <code className="text-[11px] font-mono text-[#147FB3]">{rule.evidenceRef}</code>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Workflow Controls */}
        <div className="p-4 sm:p-6 border-t border-[#E2EDF4] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1">
            {alert.status !== 'RESOLVED' && alert.status !== 'EXPIRED' && (
              <input
                type="text"
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                placeholder="Optional operator justification note..."
                className="w-full px-3 py-2 rounded-xl border border-[#D8E5EC] text-xs bg-white text-[#123B5D] focus:outline-none focus:border-[#147FB3]"
              />
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {alert.status === 'ACTIVE' && (
              <button
                type="button"
                disabled={actionInProgress}
                onClick={handleAcknowledge}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EBF6FC] text-[#147FB3] hover:bg-[#147FB3] hover:text-white transition cursor-pointer border border-[#C2E0F0] flex items-center gap-1.5"
              >
                {actionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                <span>Acknowledge Alert</span>
              </button>
            )}

            {(alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED') && (
              <button
                type="button"
                disabled={actionInProgress}
                onClick={handleResolve}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {actionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Resolve Alert</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#587083] hover:text-[#123B5D] hover:bg-[#F1F5F9] transition cursor-pointer border border-[#D8E5EC]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
