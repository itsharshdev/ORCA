import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useConnectivity } from '@/hooks/useConnectivity';

export interface SourceStatusItem {
  id: string;
  name: string;
  isLive: boolean;
  statusLabel: string;
  note?: string;
  badgeStyle: string;
  dotColor?: string;
}

export const DataSourceStatusBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state } = useConnectivity();
  const isOffline = state === 'OFFLINE';

  const sources: SourceStatusItem[] = [
    {
      id: 'incois-pfz',
      name: 'INCOIS PFZ',
      isLive: !isOffline,
      statusLabel: isOffline ? 'CACHED (OFFLINE)' : 'LIVE (WFS)',
      note: isOffline ? 'Cached 24h WFS thermal front' : 'Official GeoServer 2026',
      badgeStyle: isOffline
        ? 'bg-slate-50 text-slate-700 border-slate-300'
        : 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotColor: isOffline ? 'bg-slate-400' : 'bg-emerald-500',
    },
    {
      id: 'incois-osf',
      name: 'INCOIS OSF',
      isLive: !isOffline,
      statusLabel: isOffline ? 'CACHED (OFFLINE)' : 'LIVE (OSF)',
      note: isOffline ? 'Cached hydrodynamic model' : 'Wave & Swell Forecast',
      badgeStyle: isOffline
        ? 'bg-slate-50 text-slate-700 border-slate-300'
        : 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotColor: isOffline ? 'bg-slate-400' : 'bg-emerald-500',
    },
    {
      id: 'imd-weather',
      name: 'IMD MARINE',
      isLive: false,
      statusLabel: 'DEMO (ACCESS PENDING)',
      note: 'Institutional MoU Pending (Phase 9.2)',
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    {
      id: 'gis-safety',
      name: 'GIS SAFETY',
      isLive: true,
      statusLabel: 'DETERMINISTIC',
      note: 'PostGIS Geofence',
      badgeStyle: 'bg-[#E8F4FA] text-[#147FB3] border-[#CFE6F3]',
    },
    {
      id: 'vessel-capability',
      name: 'VESSEL',
      isLive: true,
      statusLabel: 'LOCAL PROFILE',
      note: 'DG Shipping Hull Tolerance',
      badgeStyle: 'bg-[#E8F4FA] text-[#147FB3] border-[#CFE6F3]',
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {sources.map((src) => (
        <div
          key={src.id}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-telemetry shadow-2xs ${src.badgeStyle}`}
          title={`${src.name}: ${src.note || src.statusLabel}`}
        >
          {src.dotColor ? (
            <span className={`w-1.5 h-1.5 rounded-full ${src.dotColor} ${src.isLive ? 'animate-pulse' : ''}`} />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-600" />
          )}
          <span className="font-bold">{src.name}</span>
          <span className="opacity-80">• {src.statusLabel}</span>
        </div>
      ))}
    </div>
  );
};
