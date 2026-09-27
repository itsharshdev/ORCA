import React from 'react';
import type { AlertItem, UserRole } from '@/types/contract';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Compass, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  CheckCheck,
  ChevronRight,
  Ship,
  FileText
} from 'lucide-react';

interface AlertCardProps {
  alert: AlertItem;
  userRole?: UserRole | string;
  onSelect: (alert: AlertItem) => void;
  onAcknowledge?: (alert: AlertItem) => void;
  onResolve?: (alert: AlertItem) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  userRole = 'FISHERMAN',
  onSelect,
  onAcknowledge,
  onResolve,
}) => {
  const isFisherman = userRole === 'FISHERMAN';

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badge: 'bg-rose-600 text-white font-black',
          borderLeft: 'border-l-rose-500',
          icon: ShieldAlert,
          iconColor: 'text-rose-600',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50/60 border-amber-200 text-amber-900',
          badge: 'bg-amber-500 text-white font-bold',
          borderLeft: 'border-l-amber-500',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        };
      case 'ADVISORY':
        return {
          bg: 'bg-sky-50/50 border-sky-200 text-sky-900',
          badge: 'bg-sky-600 text-white font-bold',
          borderLeft: 'border-l-sky-500',
          icon: Info,
          iconColor: 'text-sky-600',
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          badge: 'bg-slate-600 text-white font-bold',
          borderLeft: 'border-l-slate-400',
          icon: Compass,
          iconColor: 'text-slate-600',
        };
    }
  };

  const style = getSeverityStyle(alert.severity);
  const Icon = style.icon;

  const formatValidUntil = (validUntil: string | null) => {
    if (!validUntil) return 'Permanent Rule / Continuous';
    try {
      const d = new Date(validUntil);
      return `Valid until ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;
    } catch {
      return `Valid until ${validUntil}`;
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:border-[#147FB3] flex flex-col gap-3.5 border-l-4 ${style.borderLeft} select-none`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl border mt-0.5 ${style.bg}`}>
            <Icon className={`w-5 h-5 ${style.iconColor}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${style.badge}`}>
                {alert.severity}
              </span>
              <span className="text-[11px] font-mono text-[#7E93A3] font-semibold">{alert.id}</span>
              
              {/* Data Provenance Badge */}
              {alert.provenance.status === 'LIVE' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              ) : alert.provenance.status === 'ACCESS_PENDING' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                  ACCESS PENDING
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
                  DEMO SNAPSHOT
                </span>
              )}

              {/* Status Badge */}
              {alert.status === 'ACKNOWLEDGED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-blue-600" />
                  ACKNOWLEDGED
                </span>
              )}
              {alert.status === 'RESOLVED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  RESOLVED
                </span>
              )}
              {alert.status === 'EXPIRED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                  EXPIRED
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#123B5D] font-display-decision">
              {alert.title}
            </h3>
          </div>
        </div>

        <div className="text-right text-[11px] font-telemetry text-[#587083] shrink-0">
          <div className="flex items-center gap-1 text-[#7E93A3]">
            <Clock className="w-3 h-3" />
            <span>{formatValidUntil(alert.validUntil)}</span>
          </div>
        </div>
      </div>

      {/* Description / Message */}
      <p className="text-xs sm:text-sm text-[#4A6478] leading-relaxed pl-1 sm:pl-12 font-medium">
        {alert.message}
      </p>

      {/* Area & Action */}
      <div className="sm:pl-12 flex flex-col gap-2 pt-1 border-t border-[#F0F5F8]">
        <div className="flex flex-wrap items-center justify-between text-xs text-[#587083] gap-2">
          <div className="flex items-center gap-1.5 text-[#123B5D]">
            <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
            <span className="font-semibold">{alert.affectedArea.name}</span>
          </div>
          <div className="text-[#7E93A3] text-[11px]">
            Source: <strong className="text-[#3A5265]">{alert.provenance.sourceName || alert.source}</strong>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-3 border border-[#E2EDF4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-[#123B5D]">
            <strong className="text-[#147FB3] uppercase tracking-wider text-[11px] block sm:inline sm:mr-1.5">
              Actionable Guidance:
            </strong>
            <span>{alert.actionRecommendation}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            {/* Operator Acknowledge button if not yet acknowledged */}
            {!isFisherman && alert.status === 'ACTIVE' && onAcknowledge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(alert);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EBF6FC] text-[#147FB3] hover:bg-[#147FB3] hover:text-white transition cursor-pointer border border-[#C2E0F0]"
              >
                Acknowledge
              </button>
            )}

            {/* Operator Resolve button if acknowledged or active */}
            {!isFisherman && (alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED') && onResolve && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(alert);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white transition cursor-pointer border border-emerald-300"
              >
                Resolve
              </button>
            )}

            {/* Inspect Progressive Disclosure Details */}
            <button
              type="button"
              onClick={() => onSelect(alert)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#147FB3] text-white hover:bg-[#0E5B82] transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Affected crafts meta for Authority & Disaster managers */}
        {!isFisherman && (alert.affectedVesselIds.length > 0 || alert.affectedMissionIds.length > 0) && (
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#587083] pt-1">
            {alert.affectedVesselIds.length > 0 && (
              <div className="flex items-center gap-1">
                <Ship className="w-3 h-3 text-[#147FB3]" />
                <span>Affected Vessels: <strong>{alert.affectedVesselIds.join(', ')}</strong></span>
              </div>
            )}
            {alert.ruleIds.length > 0 && (
              <span className="font-mono text-[10px] text-[#7E93A3]">
                Rule: {alert.ruleIds.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
