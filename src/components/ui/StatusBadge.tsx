import React from 'react';
import type { DecisionVerdict, RiskLevel } from '@/types/marine';

interface StatusBadgeProps {
  status: DecisionVerdict | RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showPulse = false 
}) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let pulseColor = 'bg-slate-400';

  if (normalized === 'GO' || normalized === 'LOW' || normalized === 'FAVORABLE') {
    colorClasses = 'bg-[#2ecc71]/15 text-[#2ecc71] border-[#2ecc71]/40';
    pulseColor = 'bg-[#2ecc71]';
  } else if (normalized === 'CAUTION' || normalized === 'MODERATE' || normalized === 'CAUTIONARY') {
    colorClasses = 'bg-[#f1c40f]/15 text-[#f1c40f] border-[#f1c40f]/40';
    pulseColor = 'bg-[#f1c40f]';
  } else if (normalized === 'AVOID' || normalized === 'HIGH' || normalized === 'CRITICAL' || normalized === 'ADVERSE') {
    colorClasses = 'bg-[#e74c3c]/15 text-[#e74c3c] border-[#e74c3c]/40';
    pulseColor = 'bg-[#e74c3c]';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold tracking-wider',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border ${colorClasses} ${sizeClasses} font-label-caps`}>
      {showPulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${pulseColor} animate-pulse`} />
      )}
      {normalized}
    </span>
  );
};
