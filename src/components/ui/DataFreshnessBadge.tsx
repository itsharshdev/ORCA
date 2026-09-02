import React from 'react';
import type { DataStatus } from '@/types/marine';
import { Database, Wifi, ShieldAlert } from 'lucide-react';

interface DataFreshnessBadgeProps {
  status: DataStatus;
  updatedAt?: string;
  source?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({ 
  status, 
  updatedAt, 
  source 
}) => {
  let label = 'DEMO SNAPSHOT';
  let badgeStyle = 'bg-amber-950/40 text-amber-400 border-amber-800/40';
  let Icon = Database;

  if (status === 'live') {
    label = 'LIVE DATA';
    badgeStyle = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
    Icon = Wifi;
  } else if (status === 'cached') {
    label = 'CACHED FEED';
    badgeStyle = 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40';
    Icon = Database;
  } else if (status === 'degraded') {
    label = 'DEGRADED';
    badgeStyle = 'bg-rose-950/40 text-rose-400 border-rose-800/40';
    Icon = ShieldAlert;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-label-caps ${badgeStyle}`} title={source ? `Source: ${source}` : undefined}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      {updatedAt && (
        <span className="text-slate-400 font-telemetry text-[10px] lowercase">
          • {updatedAt}
        </span>
      )}
    </div>
  );
};
