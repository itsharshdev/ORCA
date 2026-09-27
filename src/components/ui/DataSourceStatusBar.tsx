import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface SourceStatusItem {
  id: string;
  name: string;
  isLive: boolean;
  statusLabel: string;
  note?: string;
  badgeStyle: string;
}

export const DataSourceStatusBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const sources: SourceStatusItem[] = [
    {
      id: 'incois-pfz',
      name: 'INCOIS PFZ',
      isLive: true,
      statusLabel: 'LIVE (WFS)',
      note: 'Official GeoServer 2026',
      badgeStyle: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    },
    {
      id: 'incois-osf',
      name: 'INCOIS OSF',
      isLive: true,
      statusLabel: 'LIVE (OSF)',
      note: 'Wave & Swell Forecast',
      badgeStyle: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    },
    {
      id: 'imd-weather',
      name: 'IMD MARINE',
      isLive: false,
      statusLabel: 'DEMO (ACCESS PENDING)',
      note: 'Institutional MoU Pending (Phase 9.2)',
      badgeStyle: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    },
    {
      id: 'gis-safety',
      name: 'GIS SAFETY',
      isLive: true,
      statusLabel: 'DETERMINISTIC',
      note: 'PostGIS Geofence',
      badgeStyle: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {sources.map((src) => (
        <div
          key={src.id}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-telemetry ${src.badgeStyle}`}
          title={`${src.name}: ${src.note || src.statusLabel}`}
        >
          {src.isLive ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
          <span className="font-bold">{src.name}</span>
          <span className="opacity-75">• {src.statusLabel}</span>
        </div>
      ))}
    </div>
  );
};
