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

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  let pulseColor = 'bg-slate-400';

  if (normalized === 'GO' || normalized === 'LOW' || normalized === 'FAVORABLE') {
    colorClasses = 'bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/40';
    pulseColor = 'bg-[#2E8B57]';
  } else if (normalized === 'CAUTION' || normalized === 'MODERATE' || normalized === 'CAUTIONARY') {
    colorClasses = 'bg-[#D99520]/15 text-[#8A5B00] border-[#D99520]/40';
    pulseColor = 'bg-[#D99520]';
  } else if (normalized === 'AVOID' || normalized === 'HIGH' || normalized === 'CRITICAL' || normalized === 'ADVERSE') {
    colorClasses = 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/40';
    pulseColor = 'bg-[#DC2626]';
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
